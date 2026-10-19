/**
 * lib/portfolioDefaults.js — Single source of truth for all portfolio section defaults.
 *
 * Used by:
 *  - components/dashboard/ContentEditor.jsx (CMS fallback)
 *  - components/portfolio/*.jsx (public page fallback until DB responds)
 *
 * Update values here and they propagate everywhere automatically.
 */

export const PORTFOLIO_DEFAULTS = {
  hero: {
    name: "Mohammad Amirul Kurniawan Putranto",
    tagline:
      "Backend developer at SoftwareSeni, building internal business tools — budget approvals, staff records, marketing sites — and the automated tests that keep them reliable. Previously a UI/UX designer in healthcare.",
    location: "Yogyakarta, Indonesia",
    email: "amrlkurniawn19@gmail.com",
    linkedin: "https://linkedin.com/in/mohammad-amirul-kurniawan-putranto/",
  },

  about: {
    // heading and headingAccent are rendered as: "{heading} <italic>{headingAccent}</italic>"
    // For backward compat: if headingAccent is absent in DB data, heading renders as plain text.
    heading: "Building software that",
    headingAccent: "works in production.",
    paragraphs: [
      "I'm a backend developer at SoftwareSeni in Yogyakarta, working mostly on internal business software — the systems a company uses to run itself. The largest is Racker, a budget request and reimbursement tool that replaced spreadsheets and email chasing for event funding; I've worked on it since late 2025 and it's still in daily use. Before that came QuickCue, a tool that prepares a short background brief on someone ahead of a meeting, and CPTool, an internal system for staff records and client placements.",
      "I also write automated tests — suites that click through an application the way a person would and report what breaks, plus a scanner that checks pages for accessibility problems, browser errors, and broken links. On one client application that work turned up nine bugs, each re-checked by hand before being written up.",
      "My earlier roles were in design and teaching. I designed pharmacy, laboratory, and outpatient interfaces for a hospital here in Yogyakarta, working from research with 50 clinical and administrative staff, and spent two years as a university lab assistant for statistics, deep learning, and data visualization. That background still shapes how I build — I pay attention to how people actually use what I make, not just how it's put together.",
    ],
    info: [
      { label: "Location",   value: "Yogyakarta, Indonesia" },
      { label: "Currently",  value: "Software Developer · SoftwareSeni" },
      { label: "Education",  value: "Informatics, Ahmad Dahlan University — GPA 3.82" },
      { label: "Expertise",  value: "PHP (Laravel, CodeIgniter) · Next.js · PostgreSQL · REST API" },
      { label: "Also does",  value: "Test automation (Playwright) · UI/UX design (Figma)" },
      { label: "Languages",  value: "Bahasa Indonesia (Native) · English (Intermediate)" },
    ],
  },

  experience: [
    {
      company: "SoftwareSeni",
      role: "Software Developer",
      period: "Aug 2025 – Present",
      description:
        "I build and maintain web applications for the company and its clients, working in teams of three to six. My main project is Racker, a budget request and reimbursement system in daily use inside the company, where I work on the approval flow, receipt handling, automatic email reminders, and the admin and finance screens. On QALEIDO, a platform for planning and recording software tests, I fixed a problem that caused test results to be lost and I am moving parts of the system to a new, faster backend step by step. I also maintain the SoftwareSeni company website (security updates, mobile fixes, form checks, and content changes) and fixed display and ranking issues on WOLF, the company's internal hub for sharing AI prompts. Earlier work includes QuickCue, a meeting-preparation tool, and the content management setup for the Lapak.pro marketing site. Alongside this I write automated tests that check applications the way a user would; on one client application they found nine confirmed bugs.",
      tags: ["CodeIgniter", "Laravel", "PostgreSQL", "Next.js", "Go", "WordPress", "Payload CMS", "Playwright", "REST API"],
      current: true,
    },
    {
      company: "SoftwareSeni",
      role: "Software Training — Accelerated Talent Bootcamp",
      period: "May 2025 – Aug 2025",
      description:
        "Joined through SoftwareSeni's accelerated talent programme and worked with a team of about ten on CPTool, an internal admin system for staff records, skills, and client placements. My part was the skills module — search and filtering across multiple categories, bulk actions, permission-based access to different parts of the interface, and safe delete-and-restore — along with database migrations and seed data.",
      tags: ["Laravel", "MySQL", "RBAC", "DataTables", "Migrations", "Seeding"],
      current: false,
    },
    {
      company: "RSU Mitra Paramedika",
      role: "UI/UX Designer",
      period: "Aug 2023 – Nov 2023",
      description:
        "Designed the interfaces for a hospital's pharmacy, laboratory, and outpatient systems. Ran user research with 50 participants across clinical and administrative staff, then turned what they said into wireframes and clickable prototypes. Each round was reviewed with the staff who would actually use the system and revised from their feedback.",
      tags: ["Figma", "User Research", "Wireframing", "Prototyping", "Healthcare UX"],
      current: false,
    },
    {
      company: "Lazismu Yogyakarta",
      role: "Project Manager",
      period: "May 2023 – Aug 2023",
      description:
        "Coordinated programmes for a non-profit organisation: planning schedules and budgets, tracking progress against them, flagging risks early enough to act on, and keeping everyone involved informed. Delivered the programmes I was assigned within their agreed timelines and budgets.",
      tags: ["Project Management", "Risk Mitigation", "Stakeholder Communication", "Agile"],
      current: false,
    },
    {
      company: "Ahmad Dahlan University",
      role: "Lab Assistant",
      period: "Sep 2022 – Jul 2024",
      description:
        "Ran lab sessions for statistics, algorithm strategy, deep learning, and data visualization courses, supporting around 30 students per class. Prepared the practical material for each session, demonstrated the techniques being taught, and worked one-on-one with students who got stuck.",
      tags: ["Statistics", "Deep Learning", "Data Visualization", "Algorithm", "Mentoring"],
      current: false,
    },
  ],

  projects: [
    {
      name: "Racker",
      type: "Web App · Internal Tool",
      company: "SoftwareSeni",
      description:
        "An internal tool for managing team-event budget requests and reimbursements, replacing manual spreadsheets and email follow-ups. Supports two approval paths, role-based access, automatic reminders, and a full history of every request.",
      tags: ["CodeIgniter", "PostgreSQL", "AWS S3", "RBAC", "OAuth SSO"],
      link: "",
      highlight: false,
      metric: "MVP shipped",
      caseStudy: {
        problem:
          "Requests for event budgets and reimbursements were tracked manually through spreadsheets. Finance had to chase people by email for receipts, there was no clear record of who changed what, and nothing followed up automatically when a team lead didn't submit a receipt after receiving an advance.",
        approach: [
          "Every request moves through a clear set of stages — submitted, pending approval, approved, transferred, receipt uploaded, completed (or rejected/overdue) — and the system checks a request's current stage before making any change, so two people acting on the same request at the same time can't accidentally overwrite each other.",
          "There are two approval paths depending on the request type: requesting funds before an event (request → approve → transfer → submit receipt), or reimbursing after paying out of pocket (submit receipt → approve → transfer).",
          "Access is controlled by role — Admin, Finance, and Team Lead each land on a dashboard suited to their job.",
          "Login uses single sign-on, matching how the rest of the company already logs in, instead of a separate password.",
          "Three automated reminders replace what used to be manual follow-up: nudging Finance, nudging leads to submit receipts, and flagging requests that go too long without one.",
          "Receipts are stored securely, and every change to a request is logged, so there's a clear record of what happened and when.",
        ],
        result:
          "In active internal use, with steady development since the start of the year. No usage numbers are available from the codebase, so none are claimed here.",
      },
      screenshots: [
        "/projects/racker-login.png",
        "/projects/racker-finance-dashboard.png",
        "/projects/racker-team-lead-landing.png",
        "/projects/racker-request-detail.png",
      ],
    },
    {
      name: "QuickCue",
      type: "AI Product · Internal Tool",
      company: "SoftwareSeni",
      description:
        "A tool for preparing ahead of a meeting or call. Enter a person's name (and company or country), and it generates a short AI-written background brief — bio, likely interests, and conversation starters — that can be saved as a PDF.",
      tags: ["Laravel", "OpenAI API", "REST API", "Swagger/OpenAPI"],
      link: "",
      highlight: false,
      metric: "MVP shipped",
      caseStudy: {
        problem:
          "Before a meeting or a networking call, researching someone meant manually searching Google and LinkedIn and piecing the results together yourself. There was no single place to quickly put together a useful, ready-to-use summary.",
        approach: [
          "A person enters a name, optionally with a company or country, and the tool generates a profile: a short bio, likely personality traits, skills, social links, and a few conversation starters.",
          "An AI model writes the profile from a fixed template, so the output stays consistent. To manage cost, generated profiles are reused for an hour and web lookups for a day, and there's a daily spending limit. An optional deeper-research mode lets the AI look up more information online before writing — more thorough, useful for more important meetings, at a higher but still capped cost.",
          "Profiles can be exported as a PDF for offline reference.",
          "Built with a documented API, so the same search-and-generate features could be reused outside the web page later.",
          "This is a single-purpose tool for one signed-in user at a time — it doesn't have a multi-user permissions system.",
        ],
        result:
          "Deployed to a staging environment and updated regularly through a standard review-and-release process. It hasn't moved to a live production environment yet, so there are no usage numbers to share.",
      },
      screenshots: [
        "/projects/quickcue-home.png",
        "/projects/quickcue-profile-view.png",
      ],
    },
    {
      name: "CPTool",
      type: "Admin System · Internal Tool",
      company: "SoftwareSeni",
      description:
        "An internal admin system that centralizes candidate and staff records — resumes, education, work history, and skills — linked to the clients and projects they're placed on. Access is permission-based, and every change is logged.",
      tags: ["Laravel 12", "Google OAuth", "RBAC", "MySQL"],
      link: "",
      highlight: false,
      metric: "MVP shipped",
      caseStudy: {
        problem:
          "Resumes and candidate information for staff placed on client projects were kept in scattered documents. There was no single source of truth, no control over who could edit staff or client records, and no way to see what had changed.",
        approach: [
          "A central system holds each candidate's full profile — resume, education, languages, project history, skills, and strengths — linked to the staff member, client, and project they belong to.",
          "Access is controlled by specific permissions rather than broad roles, so individual actions (for example, deleting a staff record) can be allowed or restricted one at a time.",
          "People sign in with their company Google account, with access managed by an admin. A more granular approval list is being built out to tighten this further, but isn't fully in place yet.",
          "Records can be deleted and restored safely, with checks in place to prevent accidental duplicates when something is restored.",
          "Every change to a candidate's profile is logged and visible as an activity history.",
          "File storage and AI features were considered but aren't part of this version — uploads currently stay on the server, with no AI integration.",
        ],
        result:
          "A real internal tool built by a team of 15, with several hundred commits and a standard ticket-and-review workflow. No usage numbers are available from the codebase — team size is the only concrete figure to share.",
      },
      screenshots: [
        "/projects/cptool-login.png",
        "/projects/cptool-dashboard.png",
        "/projects/cptool-roles.png",
        "/projects/cptool-candidate-detail.png",
      ],
    },
    {
      name: "QALEIDO",
      type: "Web App · Internal Tool",
      company: "SoftwareSeni",
      description:
        "A platform where QA teams plan, run, and record software tests. I fixed a problem that caused test results to be lost while testers were working, and I am moving the system's behind-the-scenes services to a new, faster backend one area at a time.",
      tags: ["Next.js", "TypeScript", "Go", "GoFr", "PostgreSQL", "Playwright"],
      link: "",
      highlight: false,
      metric: "In development",
      caseStudy: {
        problem:
          "QALEIDO is a test management platform: teams write test cases, run them, and record whether each one passed or failed. Some test results were being lost during a run, which made the records unreliable. The team also decided to move the server side of the application, piece by piece, to a separate backend written in Go.",
        approach: [
          "Fixed the lost test results: results are no longer erased when Save is pressed again, step-by-step results are kept on a test's first run, finished tests record their real result, and the run screen shows progress and timing correctly.",
          "Upgraded third-party packages that a security scanner had flagged as vulnerable.",
          "Set up the new Go backend as a separate service that starts and deploys alongside the existing app. It only accepts requests passed on by the main app, and traffic is moved to it one route at a time, so each part can be switched over safely.",
          "Moved read-only features to the new backend: notifications, user lookups, test case history, test cycle summaries, and permission checks.",
          "Moved the first editing features to the new backend: tags, ticket links, precondition steps, attachments, environments, and variables. Input checks return the same error messages as the existing app, so users see no difference.",
          "Every migrated feature is covered by automated tests that compare its responses with the existing app and click through the screens the way a user would.",
        ],
        result:
          "The result-loss fix, the security upgrades, and the new backend's foundation are in the main codebase. The later migration stages are still in review. No usage numbers are available, so none are claimed here.",
      },
      screenshots: [],
    },
    {
      name: "SoftwareSeni Company Website",
      type: "Company Website · Next.js",
      company: "SoftwareSeni",
      description:
        "The public website of SoftwareSeni (softwareseni.co.id), rebuilt from Webflow into Next.js. I handled a security update, fixes for mobile and contact forms, new workshop testimonials, and content changes on the careers page.",
      tags: ["Next.js", "React", "TypeScript", "pnpm"],
      link: "",
      highlight: false,
      metric: "Version 1.1.1",
      caseStudy: {
        problem:
          "The company website was being rebuilt from Webflow into Next.js so it could be maintained in code. After the rebuild, it needed ongoing updates: security patches, fixes found during testing, and new content.",
        approach: [
          "Upgraded Next.js to the version that patches a published security vulnerability. The site didn't use the affected feature, so this was a precaution rather than an urgent fix.",
          "Added six participant testimonials with photos to the workshop page.",
          "On phones, the category menu on the Our Works page did nothing when tapped. It now opens the category list, and desktop is unchanged.",
          "The contact and registration forms now show a clear message for an invalid email address, instead of failing at the end with a generic error.",
          "The Australia flag now opens the matching Australian site for each environment, so testing no longer sends visitors to the live site by mistake.",
          "Renamed the careers benefit \"Review Gaji\" (salary review) to \"Review Performa\" (performance review) and clarified that it happens twice a year.",
        ],
        result:
          "All of these changes are in the main codebase, released as versions 1.1.0 and 1.1.1. No traffic numbers are available, so none are claimed here.",
      },
      screenshots: [],
    },
    {
      name: "WOLF",
      type: "WordPress · Internal Tool",
      company: "SoftwareSeni",
      description:
        "WOLF (Wiki of Learned Formulas) is the company's internal hub where staff share, rate, and reuse AI prompts. I fixed text layout on prompt cards, hid unpublished categories from the public site, and corrected how the contributor leaderboard ranks and displays people.",
      tags: ["WordPress", "PHP", "JavaScript", "CSS"],
      link: "",
      highlight: false,
      metric: "Bug fixes",
      caseStudy: {
        problem:
          "WOLF lets staff share AI prompts and rate each other's work, with a leaderboard of top contributors. Several issues affected what users saw: text on prompt cards broke awkwardly, draft categories were visible to everyone, and the leaderboard sometimes showed the wrong data or a changing order.",
        approach: [
          "Cleaned up how sentences wrap on prompt cards and in the prompt detail popup, so text no longer breaks awkwardly.",
          "Categories that are still drafts are no longer shown on the public site.",
          "On an author's page, a label now shows which author's prompts are being shown.",
          "Fixed the sidebar leaderboard loading twice on the same page.",
          "Contributors with equal scores now always appear in the same order on the leaderboard.",
          "The leaderboard preview now shows the correct data and labels, ranks top-rated entries per prompt instead of per author, and shows ratings as stars only.",
        ],
        result:
          "The prompt card, draft category, and author page fixes are in the main codebase. The leaderboard fixes are still in review. No usage numbers are available, so none are claimed here.",
      },
      screenshots: [],
    },
    {
      name: "Autonomist QA Automation Suite",
      type: "QA Automation · Client Work",
      company: "SoftwareSeni",
      description:
        "An automated test suite for a real-estate CRM app, replacing manual, spreadsheet-based QA. Includes a custom scanning tool that checks every page for accessibility, console, and network errors, and has already found 9 real bugs.",
      tags: ["Playwright", "TypeScript", "axe-core", "GitHub Actions", "Page Object Model"],
      link: "https://github.com/amirulkurniawan/qae-autonomist",
      highlight: false,
      metric: "9 bugs found",
      caseStudy: {
        problem:
          "Testing for Autonomist, a real-estate CRM app covering agents, offices, contacts, properties, and more, was entirely manual — run from spreadsheets of test cases, with no repeatable way to catch regressions or spot accessibility, console, and network errors across the app.",
        approach: [
          "Built an automated test suite covering every core area of the app — agents, offices, organisations, contacts, properties, projects, connections, and enquiries — based directly on the existing manual test cases.",
          "On top of the functional tests, built a custom scanning tool that checks pages for accessibility issues, browser console errors, failed network requests, and broken links, collecting everything into one report. It checks 8 key pages in depth rather than the whole app, to catch the most common issues quickly.",
          "Every bug the tool finds is manually verified before being reported — one early finding (a possible authentication bypass) was retracted after a re-check showed it wasn't real, which now shapes how findings get documented.",
          "Handles both the app's own login and a separate access layer in front of it, and reuses a signed-in session across test runs instead of logging in every time, to keep things fast.",
          "Automatically cleans up any test data it creates after each run, so testing doesn't leave the environment cluttered.",
          "Runs automatically on every push and pull request via GitHub Actions, saving a full report — including screen recordings of failures — for two weeks.",
        ],
        result:
          "A small, actively developed project: the suite covers roughly 160 tests across 13 files spanning every core part of the app, and has already found 9 real, documented bugs — including one shared styling issue affecting 8 different sections. No usage numbers beyond that.",
      },
      screenshots: [],
    },
    {
      name: "Lapak.pro Marketing Site",
      type: "Marketing Site · Client Work",
      company: "Lapak.pro",
      description:
        "The public marketing site for Lapak.pro, a platform that helps small businesses in Indonesia turn a WhatsApp-based sales setup into a real online store. Built to explain the product, show pricing, and convert visitors into signups.",
      tags: ["Next.js", "Payload CMS", "PostgreSQL", "Docker", "Better Auth"],
      link: "",
      highlight: false,
      metric: "In development",
      caseStudy: {
        problem:
          "Lapak.pro helps small businesses turn a WhatsApp-based sales setup into a proper online store, but had no public website of its own — nowhere to explain what it does, show pricing, or turn visitors into signups. The main product is a separate system; this is its front door.",
        approach: [
          "Built as a single long-scroll landing page in Next.js, made up of ten sections — hero, social proof, the problem being solved, features, an interactive savings calculator, pricing, how it works, testimonials, FAQ, and a final call to action.",
          "All page content comes from one place in the CMS, so the marketing team can update copy without needing a new deployment.",
          "The app runs in Docker as five coordinated services — the site, database, a database connection pooler, a database admin tool, and a migration step — each starting only once the ones it depends on are ready.",
          "Code quality is checked automatically before every commit: formatting, linting, and a check that blocks accidentally committing unencrypted environment files. A separate tool tracks test coverage over time.",
          "Development follows a structured process — each feature starts from a written spec with clear acceptance criteria — rather than ad hoc changes, which matters when working on a small team on someone else's product.",
        ],
        result:
          "Early-stage but real: built by a team of three, with a tagged release and an active development branch. It isn't live yet, so there are no traffic or conversion numbers to report.",
      },
      screenshots: [],
    },
    {
      name: "Deutsch Lernen",
      type: "Web App · Personal Project",
      company: "Personal project",
      description:
        "A free platform for Indonesian speakers learning German from A1 to B2. Combines structured lessons, flashcards scheduled with spaced repetition, a reference library, and an AI tutor that explains grammar in Indonesian.",
      tags: ["Next.js", "TypeScript", "tRPC", "Prisma", "PostgreSQL", "Redis", "Gemini API"],
      link: "https://we-study-deutsch.vercel.app",
      highlight: false,
      metric: "Live",
      caseStudy: {
        problem:
          "Learning German as an Indonesian speaker usually means piecing together apps and explanations written in English. The goal was one place to study lessons, review vocabulary, and ask grammar questions, with explanations in Indonesian.",
        approach: [
          "Lessons are grouped by level (A1, A2, B1, B2) and mix four exercise types: multiple choice, fill in the blank, translation, and pronunciation. Finishing a lesson earns XP, which feeds a progress dashboard.",
          "Vocabulary review uses the SM-2 spaced-repetition algorithm: each answer adjusts when the word comes back, so reviews land just before a word is likely to be forgotten.",
          "An AI tutor answers questions in Indonesian, with German examples, and grades written answers into structured feedback (score, corrections, and an explanation for each).",
          "The AI layer can switch between Gemini, Groq, and Claude. The order is set in configuration, and the next provider takes over when one hits its rate limit.",
          "Redis handles caching and rate limiting. If Redis can't be reached, the app keeps working without rate limiting instead of failing.",
          "The API is built with tRPC, so the types are shared end to end between server and client. A reference library covers grammar tables, phrases, irregular verbs, and numbers.",
        ],
        result:
          "Live on Vercel and free to use. It's a personal project with no usage numbers to share.",
      },
      screenshots: [
        "/projects/deutsch-lernen-home.webp",
        "/projects/deutsch-lernen-features.webp",
        "/projects/deutsch-lernen-levels.webp",
      ],
    },
    {
      name: "Wedding Invitation",
      type: "Web App · Personal Project",
      company: "Personal project",
      description:
        "A digital wedding invitation with its own admin panel. Guests open a personalized invitation, RSVP, and leave wishes; the couple manages events, gallery, FAQs, and guest responses without touching code.",
      tags: ["Next.js", "TypeScript", "PostgreSQL", "Tailwind CSS", "Framer Motion", "Zod"],
      link: "https://github.com/amiraar/wed-invitation",
      highlight: false,
      metric: "Admin panel",
      caseStudy: {
        problem:
          "A wedding invitation site needs more than a pretty page: the couple has to update details, see who is coming, and moderate guest messages, ideally without asking a developer every time.",
        approach: [
          "The public invitation is one long page: cover, countdown, story, couple, schedule, venue, dress code, gallery, gifts, RSVP, FAQ, and guestbook. Background music starts when a guest opens the invitation.",
          "Each guest can get a personalized link that shows their name on the cover.",
          "The admin panel manages the wedding details, events (engagement, ceremony, and reception can each be shown or hidden), FAQs, bank accounts for digital gifts, and the theme.",
          "Gallery photos are reordered with drag and drop. RSVPs are listed in a table and can be exported to CSV, and guestbook messages only appear after the couple approves them.",
          "Admin pages are protected by a signed session cookie checked in the proxy, and the RSVP and guestbook forms are rate-limited. All input is validated with Zod.",
        ],
        result:
          "The source is public on GitHub. It's a personal project, so there are no usage numbers to share.",
      },
      screenshots: [],
    },
    {
      name: "UI/UX Study App",
      type: "UX Design",
      company: "Ahmad Dahlan University",
      description:
        "A mobile app concept for university students, designed as a coursework project. Covers the full process — user research, wireframes, an interactive prototype, and usability testing with students.",
      tags: ["Figma", "User Research", "Mobile UI", "Usability Testing"],
      link: "https://www.figma.com/design/DrwIqDRGwk1zpID00v9Pa5/imk?node-id=0-1&t=yvZabKqvBckNJL5i-1",
      highlight: false,
      metric: "Figma prototype",
    },
    {
      name: "UI/UX Travel & Transportation",
      type: "UX Design",
      company: "Ahmad Dahlan University",
      description:
        "A redesign of the booking experience for a travel and transportation app, done as a coursework project. Focused on shortening the path from searching for a trip to confirming a seat.",
      tags: ["Figma", "UX Research", "Booking Flow", "Prototyping"],
      link: "https://www.figma.com/design/4lRARWmOoZV9BZEUiGRYR2/transportation-app?m=auto&t=BfhBQfQ3AZvRMIjc-1",
      highlight: false,
      metric: "Figma prototype",
    },
    {
      name: "UI/UX Farmasi Rawat Jalan",
      type: "UX Design",
      company: "RSU Mitra Paramedika",
      description:
        "Interface design for a hospital's outpatient pharmacy system, covering the dispensing workflow from receiving a prescription to handing medication to the patient. Designed with the pharmacy staff who use it.",
      tags: ["Figma", "Healthcare UX", "Workflow Design", "Prototyping"],
      link: "https://www.figma.com/design/Uz8KK9W0DG3EzorMuMjJP5/farmasi-rawat-jalan?m=auto&t=BfhBQfQ3AZvRMIjc-1",
      highlight: false,
      metric: "Client project",
    },
    {
      name: "UI/UX Laboratorium System",
      type: "UX Design",
      company: "RSU Mitra Paramedika",
      description:
        "Interface design for a hospital's laboratory system, covering how clinical staff register a test request, record results, and release them back to the requesting doctor.",
      tags: ["Figma", "Healthcare UX", "Lab Systems", "Prototyping"],
      link: "https://www.figma.com/design/3LSFN50zT5B3HiZ7Ev01No/laboratorium-rs?m=auto&t=BfhBQfQ3AZvRMIjc-1",
      highlight: false,
      metric: "Client project",
    },
  ],

  skills: {
    skills: {
      Backend: ["Laravel", "CodeIgniter", "Node.js", "REST API", "PHP"],
      Testing: ["Playwright", "Page Object Model", "axe-core", "PHPUnit"],
      Database: ["PostgreSQL", "MySQL", "SQLite", "Prisma ORM", "Payload CMS"],
      "Cloud & Infra": ["AWS S3", "Docker", "Vercel", "Neon", "GitLab CI", "GitHub Actions"],
      Frontend: ["Next.js", "React", "TypeScript", "Tailwind CSS", "JavaScript"],
      Design: ["Figma", "Adobe Photoshop", "Adobe Illustrator", "Adobe Premiere Pro"],
      Mobile: ["Android Studio"],
      Tools: ["Google OAuth", "RBAC", "DataTables", "Gemini API", "Git"],
      "Soft Skills": [
        "Leadership",
        "Communication",
        "Adaptability",
        "Time Management",
        "Problem-solving",
      ],
    },
    languages: [
      { name: "Bahasa Indonesia", level: "Native", pct: 100 },
      { name: "English", level: "Intermediate", pct: 65 },
    ],
    stats: [
      { label: "Products shipped", value: "4" },
      { label: "Students mentored", value: "30+" },
      { label: "Years experience", value: "2+" },
      { label: "GPA", value: "3.82" },
    ],
  },

  education: {
    university: "Ahmad Dahlan University",
    degree: "Informatics · S.Kom",
    gpa: "3.82 / 4.00",
    period: "2020 – 2024",
    location: "Yogyakarta, Indonesia",
    contactHeading: "Let's build something.",
    contactSubtext:
      "Backend developer who also writes the tests — if you have an interesting problem, I want to hear about it.",
    email: "amrlkurniawn19@gmail.com",
    linkedin: "https://linkedin.com/in/mohammad-amirul-kurniawan-putranto/",
    linkedinLabel: "Mohammad Amirul Kurniawan Putranto",
    footerCopy: "© 2026 Mohammad Amirul Kurniawan Putranto · Built with Next.js",
    github: "https://github.com/amrlkurniawan",
  },

  kaia_config: {
    systemPrompt: "",
  },
};
