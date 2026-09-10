# Alignment against docs/portfolio-strategy-2026.md

This tracks where the repo diverges from the strategy doc and what's being done about it. Update this file whenever an item's status changes — don't let it drift.

## Decision: keep the CMS/DB architecture, don't rebuild on MDX

The strategy doc's default recommendation is MDX-in-repo, no database, no admin panel. This repo already has a working Prisma + Neon Postgres CMS, NextAuth login, and a Pusher/Gemini-powered chat assistant (Kaia) — the exact shape the doc calls "the classic time-sink trap."

Ripping it out now would repeat the mistake the doc warns against: spending more weeks on infrastructure instead of job-search leverage. Instead, per the doc's own carve-out (§3, point 3 — "if you want the portfolio itself to be the showcase, host it as one of your featured projects with its own case study"), this app is being reframed as a flagship project with its own case study rather than torn down.

## Status

| Item | Status | Notes |
|---|---|---|
| Remove unused `openai` dependency | ✅ Done | Never imported; Kaia only uses Gemini (`lib/gemini.js`). |
| Label proprietary projects instead of blank links | ✅ Done | `components/portfolio/Projects.jsx` shows a "Proprietary" badge when `project.link` is empty, instead of silently omitting the link icon. |
| Replace bit.ly links with direct Figma URLs (4 UX projects) | ✅ Done | Real URLs supplied by the repo owner and confirmed public. Wired into `lib/portfolioDefaults.js`. |
| Case-study text for Racker, QuickCue, CPTool | ✅ Done | Problem/approach/result writeups from the repo owner, wired into `lib/portfolioDefaults.js` (`caseStudy` field) and rendered via a click-to-expand modal in `components/portfolio/Projects.jsx`. |
| Screenshots for Racker, QuickCue, CPTool | 🔲 Blocked | Not sent yet — `screenshots: []` is empty per project. Modal renders a screenshot gallery automatically once populated with image paths. |
| Case study + public repo link for Nara itself as flagship project | ❌ Won't do | Owner decision — declined. |
| `usePortfolioContent.test.js` cache tests failing | 🔲 Flagged, not fixed | Pre-existing bug in the caching logic, unrelated to the alignment work — out of scope here. |

## Scope discipline

No new CMS/dashboard/chat features until the items above are closed. Further engineering time goes to case-study content and the two blocked items, not new capability — that's the actual failure mode this doc identifies.
