/**
 * app/api/cron/retention/route.js — Daily data-retention job (Vercel Cron).
 * GET → deletes visitor data and audit events older than the retention period.
 *
 * Retention (stated in app/privacy/page.jsx):
 *   - Visitors with all their conversations and messages: 90 days after the
 *     last activity (newest of visitor creation, consent refresh, and
 *     conversation update — every message touches Conversation.updatedAt).
 *   - AuditEvent rows (contain IP addresses): 90 days.
 *
 * Auth: Vercel sends `Authorization: Bearer <CRON_SECRET>` when the CRON_SECRET
 * environment variable is set. Idempotent, so duplicate or missed runs are safe.
 * Schedule: vercel.json.
 */

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { deleteVisitorData } from "@/lib/apiRouteUtils";

export const dynamic = "force-dynamic";

const RETENTION_DAYS = 90;
const BATCH_SIZE = 500;
/** Upper bound per run so one invocation stays well inside the function time limit. */
const MAX_BATCHES = 20;

export async function GET(req) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || req.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const cutoff = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000);
    const totals = { visitors: 0, conversations: 0, messages: 0, auditEvents: 0 };

    for (let batch = 0; batch < MAX_BATCHES; batch += 1) {
      const stale = await prisma.visitor.findMany({
        where: {
          createdAt: { lt: cutoff },
          OR: [{ consentAt: null }, { consentAt: { lt: cutoff } }],
          conversations: { none: { updatedAt: { gte: cutoff } } },
        },
        select: { id: true },
        take: BATCH_SIZE,
      });
      if (stale.length === 0) break;

      const deleted = await deleteVisitorData(stale.map((v) => v.id));
      totals.visitors += deleted.visitors;
      totals.conversations += deleted.conversations;
      totals.messages += deleted.messages;
      if (stale.length < BATCH_SIZE) break;
    }

    const audit = await prisma.auditEvent.deleteMany({ where: { at: { lt: cutoff } } });
    totals.auditEvents = audit.count;

    console.info("[cron/retention] completed", { cutoff: cutoff.toISOString(), ...totals });
    return NextResponse.json({ ok: true, cutoff: cutoff.toISOString(), deleted: totals });
  } catch (error) {
    console.error("[cron/retention] failed", { error: error?.message ?? String(error) });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
