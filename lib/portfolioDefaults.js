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
      "I'm a backend developer at SoftwareSeni in Yogyakarta, working mostly on internal business software — the systems a company uses to run itself. The largest is a budget request and reimbursement system that replaced spreadsheets and email chasing for event funding; I've worked on it since late 2025 and it's still in daily use. Before that came an AI tool that prepares a short background brief on someone ahead of a meeting, and an internal system for staff records and client placements. More recently I've worked on a platform for planning and recording software tests, where I'm moving the backend to Go one area at a time; on the company website; and on an internal library for sharing AI prompts. Alongside that work I'm learning Go through a series of small practice projects, from a command-line tool up to a web API with login.",
      "I also write automated tests — suites that click through an application the way a person would and report what breaks, plus a scanner that checks pages for accessibility problems, browser errors, and broken links. On one client application that work turned up nine bugs, each re-checked by hand before being written up.",
      "My earlier roles were in design and teaching. I designed pharmacy, laboratory, and outpatient interfaces for a hospital here in Yogyakarta, working from research with 50 clinical and administrative staff, and spent two years as a university lab assistant for statistics, deep learning, and data visualization. That background still shapes how I build — I pay attention to how people actually use what I make, not just how it's put together.",
    ],
    info: [
      { label: "Location",   value: "Yogyakarta, Indonesia" },
      { label: "Currently",  value: "Software Developer · SoftwareSeni" },
      { label: "Education",  value: "Informatics, Ahmad Dahlan University — GPA 3.82" },
      { label: "Expertise",  value: "PHP (Laravel, CodeIgniter) · Next.js · Go · PostgreSQL · REST API" },
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
        "I build and maintain web applications for the company and its clients, in teams of three to six. My main project is a budget request and reimbursement system in daily use inside the company. I also work on a test management platform, where I fixed lost test results and am moving the backend to Go; the company website; and an internal library for sharing AI prompts. Earlier work includes an AI meeting-preparation tool and a client's marketing site. I also write automated tests that check applications the way a user would; on one client application they found nine confirmed bugs.",
      tags: ["CodeIgniter", "Laravel", "PostgreSQL", "Next.js", "Go", "WordPress", "Payload CMS", "Playwright", "REST API"],
      current: true,
    },
    {
      company: "SoftwareSeni",
      role: "Software Training — Accelerated Talent Bootcamp",
      period: "May 2025 – Aug 2025",
      description:
        "Joined through SoftwareSeni's accelerated talent programme and worked with a team of about ten on an internal admin system for staff records, skills, and client placements. My part was the skills module — search and filtering across multiple categories, bulk actions, permission-based access to different parts of the interface, and safe delete-and-restore — along with database migrations and seed data.",
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
      name: "Reimbursement & Budget System",
      type: "Web App · Internal Tool",
      company: "SoftwareSeni",
      description:
        "An internal system for team-event budget requests and reimbursements, replacing manual spreadsheets and email follow-ups. Supports two approval paths, role-based access, scheduled reminders, overdue-receipt handling, and a full history of every request.",
      tags: ["CodeIgniter", "MySQL", "AWS S3", "RBAC", "OAuth SSO", "Cron Jobs"],
      link: "",
      highlight: false,
      metric: "In daily use",
      caseStudy: {
        problem:
          "Event budget requests and reimbursements were tracked by hand in spreadsheets. Finance had to chase receipts by email, there was no clear record of who changed what, and nothing followed up automatically when a receipt was missing.",
        approach: [
          "Every request moves through clear stages, from submitted to completed, rejected, or overdue. The system checks a request's current stage before any change, so two people acting on the same request can't overwrite each other.",
          "Two approval paths: requesting funds before an event, or reimbursing after paying out of pocket.",
          "Role-based access, with a dashboard for each role. Login uses the company's single sign-on instead of a separate password.",
          "Scheduled jobs replace manual follow-up: reminders for pending approvals and missing receipts, and automatic handling of requests that pass their deadline.",
          "Receipts are stored in cloud file storage, and every change to a request is logged.",
        ],
        result:
          "In daily internal use since it launched. I'm one of the main contributors. No usage numbers are shared here.",
      },
      screenshots: [],
    },
    {
      name: "AI Meeting Brief Generator",
      type: "AI Product · Internal Tool",
      company: "SoftwareSeni",
      description:
        "A tool for preparing ahead of a meeting or call. Enter a person's name, and it generates a short AI-written background brief, with a bio, likely interests, and conversation starters, that can be saved as a PDF.",
      tags: ["Laravel", "OpenAI API", "REST API", "Swagger/OpenAPI"],
      link: "",
      highlight: false,
      metric: "MVP shipped",
      caseStudy: {
        problem:
          "Researching someone before a meeting meant searching the web by hand and piecing the results together. There was no single place to get a ready-to-use summary quickly.",
        approach: [
          "An AI model writes the brief from a fixed template, so the output stays consistent.",
          "To manage cost, results are cached and there is a daily spending limit. An optional deeper-research mode looks up more information before writing, at a higher but capped cost.",
          "Briefs can be exported as a PDF.",
          "Built on a documented REST API, so the same features can be reused outside the web page.",
        ],
        result:
          "Shipped as an MVP to a staging environment. No usage numbers are shared here.",
      },
      screenshots: [],
    },
    {
      name: "Staff & Candidate Records System",
      type: "Admin System · Internal Tool",
      company: "SoftwareSeni",
      description:
        "An internal admin system that keeps candidate and staff records (resumes, education, work history, and skills) in one place, linked to the projects they work on. Access is permission-based, and every change is logged.",
      tags: ["Laravel 12", "Google OAuth", "RBAC", "MySQL"],
      link: "",
      highlight: false,
      metric: "MVP shipped",
      caseStudy: {
        problem:
          "Resumes and candidate information were spread across separate documents, with no single source of truth, no control over who could edit records, and no history of changes.",
        approach: [
          "One system holds each candidate's full profile, linked to the staff member and the projects they belong to.",
          "Access is controlled by individual permissions, so single actions such as deleting a record can be allowed or restricted.",
          "Sign-in uses company Google accounts, managed by an admin.",
          "Records can be deleted and restored safely, with checks against duplicates on restore. Every change is logged as an activity history.",
          "My part was the skills module: search and filtering, bulk actions, permission-based access, and safe delete and restore, plus migrations and seed data.",
        ],
        result:
          "Built as an MVP by a team during a training programme, with a standard ticket-and-review workflow. No usage numbers are shared here.",
      },
      screenshots: [],
    },
    {
      name: "Test Management Platform",
      type: "Web App · Internal Tool",
      company: "SoftwareSeni",
      description:
        "A platform where QA teams plan, run, and record software tests. I fixed a problem that caused test results to be lost, and I'm moving the server side to a new Go backend one area at a time.",
      tags: ["Next.js", "TypeScript", "Go", "GoFr", "PostgreSQL", "Playwright"],
      link: "",
      highlight: false,
      metric: "In development",
      caseStudy: {
        problem:
          "Some test results were being lost during a test run, which made the records unreliable. The team also decided to move the server side, piece by piece, to a separate backend written in Go.",
        approach: [
          "Fixed the lost results: saving again no longer erases them, step results are kept, and the run screen shows progress and timing correctly.",
          "Upgraded third-party packages flagged by a security scanner.",
          "Set up the Go backend as a separate service, with traffic moved to it one route at a time so each part can be switched over safely.",
          "Moved read-only features first, then the first editing features, keeping the same validation messages so users see no difference.",
          "Each migrated feature is covered by automated tests that compare its responses with the existing app and click through the screens.",
        ],
        result:
          "The result-loss fix, the security upgrades, and the Go backend's foundation are in the main codebase; later stages are in review. No usage numbers are shared here.",
      },
      screenshots: [],
    },
    {
      name: "Company Website",
      type: "Company Website · Next.js",
      company: "SoftwareSeni",
      description:
        "The company's public website, rebuilt from a site builder into Next.js. I handled a security update, mobile and contact form fixes, new testimonials, and content updates.",
      tags: ["Next.js", "React", "TypeScript", "pnpm"],
      link: "",
      highlight: false,
      metric: "Shipped",
      caseStudy: {
        problem:
          "After the move to Next.js, the website needed ongoing work: security patches, fixes found in testing, and new content.",
        approach: [
          "Upgraded Next.js to a version that patches a published vulnerability, as a precaution.",
          "Added participant testimonials with photos to an events page.",
          "Fixed a category menu that did nothing when tapped on phones; desktop is unchanged.",
          "Forms now show a clear message for an invalid email address instead of failing with a generic error.",
          "Fixed a regional link that sent test environments to the live site.",
        ],
        result:
          "All of these changes are released. No traffic numbers are shared here.",
      },
      screenshots: [],
    },
    {
      name: "Internal AI Prompt Library",
      type: "WordPress · Internal Tool",
      company: "SoftwareSeni",
      description:
        "An internal site where staff share, rate, and reuse AI prompts. I fixed text layout on prompt cards, hid unpublished categories, and corrected how the contributor leaderboard ranks and shows people.",
      tags: ["WordPress", "PHP", "JavaScript", "CSS"],
      link: "",
      highlight: false,
      metric: "Bug fixes",
      caseStudy: {
        problem:
          "Several issues affected what users saw: text on prompt cards broke awkwardly, draft categories were visible to everyone, and the leaderboard sometimes showed wrong data or a changing order.",
        approach: [
          "Cleaned up how text wraps on prompt cards and in the detail popup.",
          "Draft categories are no longer shown publicly.",
          "Fixed the leaderboard loading twice, gave tied contributors a stable order, and corrected its data and labels.",
        ],
        result:
          "The layout and category fixes are released; the leaderboard fixes are in review. No usage numbers are shared here.",
      },
      screenshots: [],
    },
    {
      name: "QA Automation Suite",
      type: "QA Automation · Client Work",
      company: "SoftwareSeni",
      description:
        "An automated test suite for a client's CRM application, replacing manual, spreadsheet-based QA. Includes a custom scanner that checks pages for accessibility, console, and network errors, and has found 9 confirmed bugs.",
      tags: ["Playwright", "TypeScript", "axe-core", "GitHub Actions", "Page Object Model"],
      link: "",
      highlight: false,
      metric: "9 bugs found",
      caseStudy: {
        problem:
          "Testing for the client's CRM was entirely manual, run from spreadsheets of test cases, with no repeatable way to catch regressions or spot accessibility, console, and network errors.",
        approach: [
          "Built automated tests for every core area of the app, based on the existing manual test cases.",
          "Built a scanner that checks key pages for accessibility issues, browser console errors, failed network requests, and broken links, and collects them into one report.",
          "Every finding is re-checked by hand before it is reported.",
          "Reuses a signed-in session across runs to stay fast, and cleans up any test data it creates.",
          "Runs on every push and pull request in GitHub Actions, keeping reports and recordings of failures.",
        ],
        result:
          "About 160 tests across 13 files, and 9 confirmed bugs, including one shared styling issue affecting 8 sections.",
      },
      screenshots: [],
    },
    {
      name: "Client Marketing Site",
      type: "Marketing Site · Client Work",
      company: "Client project",
      description:
        "The public marketing site for a client's e-commerce platform for small businesses. Built to explain the product, show pricing, and turn visitors into signups.",
      tags: ["Next.js", "Payload CMS", "PostgreSQL", "Docker", "Better Auth"],
      link: "",
      highlight: false,
      metric: "In development",
      caseStudy: {
        problem:
          "The client's product had no public website of its own: nowhere to explain what it does, show pricing, or turn visitors into signups.",
        approach: [
          "A single long-scroll landing page in Next.js with ten sections, including an interactive savings calculator, pricing, and FAQ.",
          "All page content comes from the CMS, so copy can change without a new deployment.",
          "The app runs in Docker as several coordinated services, each starting once its dependencies are ready.",
          "Formatting, linting, and a check against committing unencrypted environment files run before every commit.",
          "Each feature starts from a written spec with acceptance criteria.",
        ],
        result:
          "Built by a team of three, with a tagged release. It isn't live yet, so there are no traffic numbers.",
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
        "A digital wedding invitation with its own admin panel. Each guest opens a personal link to RSVP and send wishes, and the couple manages events, gallery, guests, and replies without touching code.",
      tags: ["Next.js", "TypeScript", "PostgreSQL", "Vercel Blob", "Framer Motion", "Zod"],
      link: "https://amirul-wedding.vercel.app",
      highlight: false,
      metric: "Live demo",
      caseStudy: {
        problem:
          "A wedding invitation site needs more than a pretty page: the couple has to update details, know who is coming, and moderate guest messages, ideally without asking a developer every time. Guests also shouldn't be able to answer on someone else's behalf.",
        approach: [
          "The invitation opens on a cover with the guest's name, then one long page: story, couple, event cards with a rundown, venue, dress code, gallery, gifts, RSVP, FAQ, and wishes. Background music can start as soon as the guest opens it.",
          "Every guest gets a personal link with a token. RSVPs and wishes only work through that link, so one guest can't open or answer another's invitation, and a forwarded link can be replaced with a new one.",
          "The guest list imports and exports as CSV or Excel. Re-importing an exported file updates the guests and keeps their existing links.",
          "Photos, the cover, venue photo, and music upload by drag and drop to Vercel Blob. The gallery can be shown as masonry, grid, or slideshow, with per-photo size and focus point.",
          "Wishes containing links or rude words (Indonesian and English) are rejected on the server, and the rest still need the couple's approval. Guests can choose to hide their name.",
          "The admin panel has a dashboard with guest-based stats and a sidebar with live counts. Admin routes are protected by a signed session checked in the proxy, the public forms are rate-limited, and all input is validated with Zod.",
        ],
        result:
          "A live demo runs on Vercel with sample content. It's a personal project still in active development, so there are no usage numbers to share.",
      },
      screenshots: [
        "/projects/wedding-cover.webp",
        "/projects/wedding-story.webp",
        "/projects/wedding-dress-code.webp",
        "/projects/wedding-wishes.webp",
      ],
    },
    {
      name: "Student Grade",
      type: "Web App · Personal Project",
      company: "Personal project",
      description:
        "A grading app for teachers: manage classes, students, and exams, print answer sheets, and grade photos of them in the browser. Scores follow rules set per exam and export to CSV.",
      tags: ["Vue 3", "Vite", "Pinia", "Tailwind CSS", "Node.js", "PostgreSQL", "Gemini API", "Playwright"],
      link: "https://help-student-grade.vercel.app",
      highlight: false,
      metric: "Live",
      caseStudy: {
        problem:
          "The goal was to let a teacher go from an answer key to final scores without marking each sheet by hand or copying scores into a spreadsheet.",
        approach: [
          "Teachers manage classes, students, and exams, and print one answer sheet per student with the name and ID already on it.",
          "Photos of the printed sheets are read in the browser without AI: many photos at once, each student is recognized automatically, and unclear answers are flagged for the teacher to check. Gemini Vision is a fallback for other sheets.",
          "Before saving, the teacher can correct any answer in a per-question table, or type answers quickly by hand.",
          "Scores follow rules set per exam: a weight for each section, or a table that converts the number of correct answers into a score. Changing the key or the rules recalculates saved scores.",
          "Exam results, student results, and class reports export to CSV, with cells that a spreadsheet could run as formulas neutralized.",
          "Unit tests check the scoring against a reference on 20,000 random cases and the sheet reader on synthetic photos that are tilted, upside down, or shadowed. A Playwright suite tests the API and screens on a disposable database.",
        ],
        result:
          "Live on Vercel with teacher sign-up. It's a personal project, so there are no usage numbers to share.",
      },
      screenshots: [
        "/projects/student-grade-results.webp",
        "/projects/student-grade-grading.webp",
        "/projects/student-grade-answer-sheet.webp",
        "/projects/student-grade-answer-key.webp",
      ],
    },
    {
      name: "Go Learning Projects",
      type: "Learning · Personal Project",
      company: "Personal project",
      description:
        "Four small projects I built while learning Go, each one adding a new skill: a command-line task tracker, a tool that checks many websites at once, a habit and note tracker website, and a web API with login.",
      tags: ["Go", "net/http", "Goroutines", "JWT", "Docker"],
      link: "https://github.com/amiraar/golang-case-studies",
      highlight: false,
      metric: "Learning",
      caseStudy: {
        problem:
          "Go is a newer language for me, and at work I'm helping move part of an application to a Go backend. I wanted hands-on practice beyond reading tutorials, with each step building on the last.",
        approach: [
          "Task tracker: a command-line app for adding, listing, updating, and deleting tasks, saved to a file. Practised Go basics, error handling, and reusable generic helpers.",
          "Website checker: checks a list of websites at the same time and reports which ones respond. Practised running work in parallel safely and passing results between parallel workers.",
          "Habit and note tracker: a small website with pages, forms, file uploads, a basic login, and cookies, built with Go's standard library and following a public Go tutorial.",
          "Web API: a version of the tracker as a REST API with token-based login, request validation, settings loaded from config files, request logging, and a Docker setup.",
          "Every project has automated tests.",
        ],
        result:
          "The code is public on GitHub. These are learning projects, so there are no usage numbers to share.",
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
      Backend: ["Laravel", "CodeIgniter", "Go", "Node.js", "REST API", "PHP", "WordPress"],
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
