/**
 * lib/prisma.js — Prisma client singleton.
 * Reuses the same PrismaClient instance across hot-reloads in development
 * to prevent exhausting database connections.
 */

import { PrismaClient } from "@prisma/client";

/** @type {PrismaClient} */
let prisma;

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  // In dev, attach to globalThis to survive hot-reloads
  if (!global.prisma) {
    global.prisma = new PrismaClient({
      log: ["query", "warn", "error"],
    });
  }
  prisma = global.prisma;
}

export default prisma;
