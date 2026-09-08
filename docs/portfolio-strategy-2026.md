# Developer Portfolio in 2026: Structure, CMS Decision, and a Job-Search Playbook for a Jakarta-Based Full-Stack Dev

## TL;DR
- **Do NOT build a CMS/admin panel for your portfolio.** For a solo dev with ~1 year of experience job-hunting in Jakarta, a database-backed admin or self-hosted Payload instance is over-engineering — it burns weeks, adds ongoing maintenance, and impresses no recruiter. Keep content in **MDX files in your repo** (or Keystatic if you want a UI), ship in a weekend, and spend the saved time on 3–5 deployed, well-documented projects.
- **What actually gets you interviews** is a fast, clean, mobile-friendly site with 3–5 real projects presented as short case studies (problem → approach → result), live demo + public GitHub links, an honest skills list, and dead-simple contact info — recruiters decide in roughly 30 seconds.
- **In Indonesia specifically, the portfolio is a supporting asset, not the decider.** Higher-salary offers come from technical-interview performance (LeetCode/HackerRank + system design), referrals, an active GitHub, and a strong LinkedIn. The biggest salary lever is moving into a "Software Engineer" role at a unicorn/fintech or a USD-remote role — which can roughly double mid-level pay.

## Key Findings

### 1. Portfolio structure that gets noticed
The consensus across 2025–2026 hiring guides is a lean, project-first, single- or two-page site. The high-signal structure:
- **Hero** — name, what you build, one-line value proposition, one clear CTA (View Projects / Contact).
- **Featured projects (3–5)** — the main event, each as a mini case study with live demo + repo links.
- **Skills/stack** — concise, honest, grouped; ideally linked to the projects where you used them.
- **About** — 2–3 sentences, not a life story.
- **Experience** — short, scannable (your ~1 year plus notable work).
- **Contact** — email, GitHub, LinkedIn, visible on every page.
- **Blog (optional)** — only if you'll actually publish; it demonstrates communication ability, but an abandoned blog signals the opposite.

What differentiates a noticed portfolio from a generic template: **live, working demos** (per hakia.com's "Developer Portfolio Guide 2026," citing the Stack Overflow Developer Survey 2024, "84% of employers want to see working applications, not just code repositories" and "73% of hiring managers consider a strong portfolio more important than a perfect resume"); **case-study framing** (problem, technical decisions, measurable outcome); **quality over quantity** (3–5 real projects beat 20 tutorial clones); **speed** (load under ~2 seconds); and **mobile responsiveness** (recruiters browse on phones). The single most common failure mode is leading with a buzzword skills list and burying the actual work.

### 2. Content-management trade-offs
The core principle from multiple sources: **"If your site has editors, MDX is not a CMS. If your site has engineers, a CMS is not a codebase."** A portfolio has exactly one editor — you, a technical person. That collapses the decision.

| Approach | Setup effort | Ongoing maintenance | Cost | Fit for a solo dev portfolio |
|---|---|---|---|---|
| **Hardcoded/static** | Minimal | Redeploy per edit | $0 | Fine, but poor for a growing blog |
| **MDX files in repo** | Low | Just `git push` | $0 | ✅ Best default — content in version control, type-safe, no DB |
| **Git-based CMS UI (Keystatic, Decap, Outstatic)** | Low–moderate | Very low | $0 | ✅ Great if you want an editing UI without a backend |
| **Headless CMS SaaS (Sanity, Contentful)** | Moderate | Low (managed) | Free tier → paid | ⚠️ Overkill; adds vendor dependency for one author |
| **Self-hosted Payload/Strapi** | High | High (DB, backups, server) | ~$8–40+/mo | ❌ Over-engineered for a personal site |
| **Custom Next.js + Postgres admin** | Very high | High | Hosting + DB | ❌ The classic time-sink trap |

Developers who migrated *away* from a CMS (e.g., Sanity → MDX) consistently report the admin panel was used maybe once a week, they were the only author, and half their time went to "fighting field builder limitations." MDX gives type-safety, zero cost, content-in-git, and sub-second builds for the ~50-file volume a portfolio has.

### 3. The most practical option for YOUR stack (Payload + Next.js + Postgres experience)
You already know Payload, so the temptation is to reach for it. **Resist it for the portfolio.** Payload behaves like a persistent Node/Express app, which conflicts with Vercel's serverless model: cold starts re-initialize the DB connection pool on every invocation, causing connection-pressure and "zombie connection" problems documented repeatedly in Payload's own GitHub issues. Payload also needs a real Postgres DB, S3-compatible media storage, and migrations on deploy — real infrastructure and cost (~$8–49/mo self-hosted VPS, or Railway/Render ~$15–40/mo) plus ongoing backups/updates. Note that Figma acquired Payload on June 17, 2025 (per Figma's official blog, "Welcoming Payload to the Figma team," and founder James Mikrut's same-day announcement in GitHub Discussion #12843: "Payload has joined Figma!"); Payload Cloud paused new sign-ups while self-hosting stays unaffected — so self-hosting is the default path for new projects now.

**Recommended for you, in priority order:**
1. **MDX + a typed content layer** (e.g., a Contentlayer-style setup or `next-mdx-remote/rsc`). Zero infra, content in git, perfectly matched to Next.js. Best low-maintenance choice.
2. **Keystatic** if you specifically want a Payload-like admin UI. It's Git-native (content as MDX/YAML/JSON in your repo), TypeScript-first, no database, free, and has a first-party Next.js integration. Local mode for editing on your machine; GitHub mode gives you a deployed `/keystatic` dashboard that commits via the GitHub API. This gives you 80% of the "CMS feel" with roughly 5% of the ops.
3. **Only** stand up Payload if you want the portfolio itself to *be* a Payload demo project — i.e., the CMS is the showcase, not the content tool. In that case, host it headless (a separate Railway/Render service) and keep the Next.js front end on Vercel, and treat it as one of your featured projects with its own case study.

Since you've already shipped a Next.js + Payload project, that experience is best *shown as a portfolio project* rather than *reused as portfolio plumbing*.

### 4. Over-engineering pitfalls (what to avoid)
The most-cited mistake: developers "spend three months building a custom portfolio from scratch with animations, dark mode, a custom CMS, and a blog that gets updated twice then abandoned" when they could have launched a clean site in a weekend and started applying. Specific traps:
- Building a custom admin/CMS instead of showcasing work (your exact question — the answer is don't).
- Tutorial clones (Netflix/Spotify/weather/to-do) pinned as portfolio pieces.
- Broken/localhost demo links and missing READMEs (a repo with no README is "a closed door").
- Over-designed, slow, or non-responsive sites; outdated "Copyright 2022" footers.
- A 40-item buzzword skills list that makes none of them credible.
- Spending frontend-polish energy when targeting backend roles.

What matters most: original, finished, **deployed** projects; a clean, active GitHub with good READMEs and real commit messages; and clear written explanations of technical decisions.

### 5. Real-world examples worth studying
- **Brittany Chiang** (brittanychiang.com) — the benchmark: dark, minimal, fast single-page site with sticky left-nav; technologies listed *alongside each work entry* rather than as a giant list; mixes professional and personal projects (e.g., Halcyon VS Code theme). Lesson: clarity and scannability.
- **Josh W. Comeau** (joshwcomeau.com) — content/blog-led credibility with interactive demos and delightful UX. Lesson: writing and teaching can prove expertise better than a project gallery. (Higher effort; only worth it if you'll write.)
- **Lee Robinson** (leerob.io) — deliberately minimal; writing replaces the traditional project gallery; homepage opens with a short expandable bio. Built on Next.js. Lesson: design can be secondary to substance.
- **Adham Dannaway** — interactive split-screen hero that demonstrates design+dev skill in the act of experiencing it. Lesson: a single signature interaction can differentiate.

These are effective because they prioritize clarity, performance, and credibility over visual excess — the opposite of a template stuffed with animations.

### 6. The Indonesia / Jakarta reality (this reframes the whole project)
For Indonesian tech hiring, the dominant signals are **technical-interview performance, referrals, and GitHub — not a standalone portfolio website.** Real accounts of hunting at Indonesian startups (Traveloka, Gojek, etc.) describe HackerRank/LeetCode-style coding tests, live coding, system design, and behavioral rounds as the decision-makers, and many candidates apply through employee referrals. No credible Indonesia-specific source names a portfolio site as a hiring differentiator; portfolio-website advocacy comes mostly from vendors selling portfolio builders.

**Dominant hiring channels in Indonesia:** LinkedIn (strongest overall, especially mid-senior and startups), Glints (best for junior-to-mid tech/startup roles), JobStreet (largest general database), Kalibrr (used by banks like BCA/Mandiri — relevant for fintech/digital-bank roles), Tech in Asia Jobs (startup-specific), and **referrals** (repeatedly the fastest, highest-conversion path).

**Mid-level Jakarta salary bands (IDR/month, 2025–2026):** local recruiter surveys and Glassdoor cluster mid-level developers at roughly **IDR 10–20M/month**; whatisthesalary.com's 2026 guide (citing NodeFlair, Glassdoor, and ERI) gives entry-level Rp7–10M/mo, mid-level Rp9–20M/mo, and senior Rp22–25.3M/mo. But the gap is the story: **top-tier unicorns pay mid-level engineers materially more** — NodeFlair lists Gojek's mid-level Software Engineer weighted-average at **Rp34,421,514/month** (7 salaries) and GoTo Financial mid-level at **Rp24,918,700/month**, versus NodeFlair's national median of **Rp9,000,000/month** (range Rp4.25M–Rp20M). USD-paying remote roles run 30–60%+ above local rates. Titles matter: a "Software Engineer" at a unicorn/fintech can pay 2–3× a "Software Developer/Programmer" title at a generic firm. Total comp also includes mandatory THR (1 month), often a 13th month, and BPJS — always negotiate the all-in "juta/bulan" number.

## Details: How to spend your time (the opportunity-cost math)
A portfolio you can build with MDX plus a good template in a weekend costs about 2 days. A custom Postgres-backed admin or self-hosted Payload setup realistically costs 1–3 weeks of build plus perpetual maintenance. In a Jakarta job search where interview performance and referrals decide outcomes, those 1–3 weeks are far better spent on: (a) polishing 3–5 deployed projects with strong READMEs and case studies; (b) LeetCode/HackerRank and system-design practice; (c) LinkedIn optimization and referral outreach; (d) reaching out on Glints/Tech in Asia and to employees at target unicorns/fintechs.

## Recommendations (staged, concrete)

**Stage 1 — This weekend (ship it):**
1. Build the site with Next.js (which you know) using a clean template or your own minimal layout. Content lives in **MDX files** in the repo. No CMS, no DB.
2. Include: hero + CTA, 3–5 project case studies (problem → approach → result, with live demo + GitHub links), concise honest skills, short about/experience, visible contact.
3. Deploy to Vercel (which you already use). Add a custom `.dev`/`.me` domain, meta/OG tags, and run Lighthouse. Test every link on mobile.

**Stage 2 — Next 1–2 weeks (raise signal):**
4. Make your 3–5 project repos public with excellent READMEs (what/why/how-to-run/what-you-learned + a screenshot or GIF). Ensure every demo is live and works.
5. Feature your **Next.js + Payload CMS project** as a case study — this is where your CMS experience earns its keep.
6. Optimize GitHub (profile README, pinned repos, consistent activity) and LinkedIn (keyword-rich headline, quantified accomplishments).

**Stage 3 — Ongoing (convert to offers):**
7. Prioritize referrals and applications via LinkedIn, Glints, Tech in Asia, and Kalibrr (for fintech/banks). Target "Software Engineer" titles at unicorns/fintechs and USD-remote roles for the salary jump.
8. Practice technical interviews (algorithms/data structures + system design) — this is what decides Indonesian offers.
9. **Only if** you want to demonstrate CMS/admin skills for a specific role: add Keystatic for a UI, or build a small standalone Payload demo as a *project*, not as portfolio infrastructure.

**Benchmarks that would change this advice:**
- If you were targeting **content/DevRel or CMS-agency roles**, building a real Payload/headless-CMS-driven site becomes a relevant skill demo — worth doing.
- If you had **non-technical collaborators** editing content, a CMS UI (Keystatic or hosted headless) becomes justified.
- If your blog reached **high publishing cadence with many contributors or thousands of items**, git-based files hit a wall and a database/headless CMS earns its place.

## Caveats
- Several statistics quoted in portfolio guides — e.g., hakia.com's "84% of employers want to see working applications," "73% of hiring managers consider a strong portfolio more important than a perfect resume" (attributed to the Stack Overflow Developer Survey 2024), and its verbatim "GitHub profile optimization increases interview callbacks by 40% when properly maintained" — are secondary blog write-ups; treat the exact percentages as directional, not precise.
- Indonesian salary figures vary widely by title, company tier, and source methodology; unicorn/USD-remote numbers are top-of-market and not typical for generic firms. Local recruiter guides (Michael Page, Robert Walters) and Glassdoor/NodeFlair are the most grounded sources.
- Portfolio-website "importance" claims are disproportionately produced by companies selling portfolio builders — a source-bias worth discounting.
- Payload's serverless limitations are well-documented but evolving (one-click Vercel/Cloudflare templates now exist); the maintenance-cost argument still holds for a solo dev who doesn't want to own infrastructure.
