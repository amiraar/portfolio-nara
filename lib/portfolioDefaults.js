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
      "Backend Developer specializing in Laravel & CodeIgniter — shipping production MVPs with AI-driven features, workflow automation, and a strong eye for UI/UX.",
    location: "Yogyakarta, Indonesia",
    email: "amrlkurniawn19@gmail.com",
    linkedin: "https://linkedin.com/in/mohammad-amirul-kurniawan-putranto/",
  },

  about: {
    // heading and headingAccent are rendered as: "{heading} <italic>{headingAccent}</italic>"
    // For backward compat: if headingAccent is absent in DB data, heading renders as plain text.
    heading: "Building systems that",
    headingAccent: "actually ship.",
    paragraphs: [
      "Backend-focused Software Developer with hands-on experience delivering production MVPs at SoftwareSeni. I specialize in Laravel and CodeIgniter — building everything from AI-driven profile tools to multi-step reimbursement workflows with AWS S3 and real-time notifications.",
      "My UI/UX background means I don't just write backend code — I think in user flows. I've designed hospital interfaces, conducted research with 50+ participants, and translated those findings into working systems. That cross-disciplinary perspective shows up in every PR I write.",
      "Previously a lab assistant teaching Statistics, Deep Learning, and Data Visualization at Ahmad Dahlan University. Currently open to new opportunities.",
    ],
    info: [
      { label: "Location",   value: "Yogyakarta, Indonesia" },
      { label: "Currently",  value: "Software Developer · SoftwareSeni" },
      { label: "Education",  value: "Informatics, Ahmad Dahlan University — GPA 3.82" },
      { label: "Expertise",  value: "Laravel · CodeIgniter · REST API · AWS S3 · AI Integration" },
      { label: "Also does",  value: "UI/UX Design · Figma · User Research" },
      { label: "Languages",  value: "Bahasa Indonesia (Native) · English (Intermediate)" },
    ],
  },

  experience: [
    {
      company: "SoftwareSeni",
      role: "Software Developer",
      period: "Aug 2025 – Present",
      description:
        "Building production MVPs end-to-end. Shipped QuickCue — an AI-driven one-page profile generator with shareable slug URLs and core APIs. Shipped Racker — a full reimbursement and request workflow system with multi-step approvals, AWS S3 receipt storage, and in-app + email notifications.",
      tags: ["Laravel", "PostgreSQL", "AWS S3", "OpenAI API", "REST API", "Notifications"],
      current: true,
    },
    {
      company: "SoftwareSeni",
      role: "Software Training — Accelerated Talent Bootcamp",
      period: "May 2025 – Aug 2025",
      description:
        "Delivered CPTool — a Laravel admin system with Google OAuth authentication, role-based access control, whitelist access, and secure password setup/reset flows. Built skills and client management modules with server-side DataTables, bulk actions, soft delete/restore, and permission-based UI enforcement.",
      tags: ["Laravel", "Google OAuth", "RBAC", "DataTables", "MySQL", "Seeding"],
      current: false,
    },
    {
      company: "RSU Mitra Paramedika",
      role: "UI/UX Designer",
      period: "Aug 2023 – Nov 2023",
      description:
        "Designed hospital system interfaces improving user satisfaction by 25%. Created wireframes and prototypes for pharmacy, laboratory, and outpatient modules. Conducted user research with 50 participants — clinical and administrative staff — leading to iterative design improvements.",
      tags: ["Figma", "User Research", "Wireframing", "Prototyping", "Healthcare UX"],
      current: false,
    },
    {
      company: "Lazismu Yogyakarta",
      role: "Project Manager",
      period: "May 2023 – Aug 2023",
      description:
        "Led project coordination for nonprofit initiatives. Developed comprehensive project plans achieving a 20% increase in delivery efficiency. Identified and mitigated risks, reducing project delays by 15%. Delivered all goals on time and within budget.",
      tags: ["Project Management", "Risk Mitigation", "Stakeholder Communication", "Agile"],
      current: false,
    },
    {
      company: "Ahmad Dahlan University",
      role: "Lab Assistant",
      period: "Sep 2022 – Jul 2024",
      description:
        "Assisted lab sessions for Statistics, Algorithm Strategy, Deep Learning, and Data Visualization courses. Supported 30+ students per course across 2 courses. Developed instructional materials boosting student performance by 15%. Conducted technical demonstrations improving comprehension by 20%.",
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
        "Reimbursement and budget-advance platform replacing manual spreadsheet tracking. A state-machine request model with optimistic-concurrency guards drives two parallel approval flows, backed by RBAC, SSO, automated cron reminders, and a full audit trail.",
      tags: ["CodeIgniter", "PostgreSQL", "AWS S3", "RBAC", "OAuth SSO"],
      link: "",
      highlight: true,
      metric: "MVP shipped",
      caseStudy: {
        problem:
          "Team-building/event budget requests and reimbursements were handled manually — spreadsheets, email chasing for receipts, no audit trail, no enforcement on leads who never submitted receipts after an advance.",
        approach: [
          "A CodeIgniter app with a strict state-machine model for requests: DRAFT → PENDING_APPROVAL → APPROVED/PROCESSING → COMPLETED/REJECTED/OVERDUE/AWAITING_TRANSFER. Every transition re-checks current status inside a DB transaction before writing (optimistic-concurrency guard), so two approvers acting on the same request don't silently clobber each other.",
          "Two parallel approval flows branched by request type: budget-advance-first (request → approve → transfer → receipt) vs. reimbursement-first (receipt → approve → transfer).",
          "RBAC via roles↔permissions join tables, with role also driving post-login redirect (Admin/Finance/Lead land on different dashboards).",
          "SSO via Authentik OAuth, replacing a legacy local-login path.",
          "Three cron jobs automate what used to be manual nagging: finance reminders, receipt reminders, and overdue-request enforcement (freezing leads with unresolved receipts).",
          "Receipts stored on S3 with signed URLs; every status change writes an audit-log entry (old/new value JSON).",
        ],
        result:
          "Live internal tool, actively developed (17 migrations Jan–Apr 2026, disciplined MR workflow against a develop branch). No adoption/usage metrics available in the code — not claiming any.",
      },
      screenshots: [],
    },
    {
      name: "QuickCue",
      type: "AI Product · Internal Tool",
      company: "SoftwareSeni",
      description:
        "AI-driven profile generator for pre-meeting research — turns a name (+ company/country) into a structured, conversation-ready brief via GPT-4o-mini with strict JSON-schema prompting, response caching, and per-day cost caps. Exports to PDF.",
      tags: ["Laravel", "OpenAI API", "REST API", "Swagger/OpenAPI"],
      link: "",
      highlight: true,
      metric: "MVP shipped",
      caseStudy: {
        problem:
          "Before a meeting or networking call, briefing yourself on a person/company meant manually Googling them and cross-referencing LinkedIn — no single place to generate a structured, conversation-ready profile.",
        approach: [
          "User searches a name (+ company/country); app generates a structured profile — bio, personality traits, skills, socials, and specifically conversation starters.",
          "OpenAI integration (gpt-4o-mini via Chat Completions) is the core mechanism: a system prompt forces strict JSON-schema output, optionally merged with known social-link context. Results are cached (1hr profiles / 24hr web search) and rate/budget-capped per day ($10 prod / $2 dev) with a mock-fallback flag. There's also an AI-orchestrated deep-dive mode where the LLM itself drives capped tool calls (6 calls / 15s) to fetch more web data before generating — more thorough, but bounded to avoid runaway cost.",
          "Export to PDF via wkhtmltopdf, rendering an internal HTML template then converting it.",
          "Self-documented REST API (Swagger/OpenAPI) exposing search/generate endpoints separately from the web UI.",
          "Auth is plain session-based — no RBAC/roles layer exists.",
        ],
        result:
          "Deployed to a live staging environment via GitLab CI (rsync+SSH on push to develop), active sprint history with ticket-tracked commits. No production/adoption metrics evidenced — APP_ENV is still set to development.",
      },
      screenshots: [],
    },
    {
      name: "CPTool",
      type: "Admin System · Internal Tool",
      company: "SoftwareSeni",
      description:
        "Centralized candidate-profile admin system for placed staff — resumes, education, projects, and skills tied to Staff/Client/Project records. Per-action RBAC enforced at the route level, with soft-delete/restore workflows and a full activity-log audit trail.",
      tags: ["Laravel 12", "Google OAuth", "RBAC", "MySQL"],
      link: "",
      highlight: false,
      metric: "MVP shipped",
      caseStudy: {
        problem:
          "Candidate resume/CV data for staff placed on client projects (skills, education, strengths, project history) lived in scattered documents — no central source of truth, no access control over who could edit staff/client records, no change history.",
        approach: [
          "Laravel 12 admin system centralizing candidate profile data (Resume + related Education/Language/Project/Skill/Strength models) tied to Staff, Client, and Project records.",
          "RBAC via spatie/laravel-permission, enforced per-action at the route level (permission:staff.delete, permission:whitelist.create, etc.) rather than coarse role checks — every route gated individually.",
          "Access is admin-provisioned users + Google SSO; a separate WhitelistUser CRUD exists but isn't yet wired into the OAuth callback (the callback currently checks against registered User records directly) — an in-progress access-control upgrade, not yet the enforcement path.",
          "Soft-delete + explicit restore workflow on Staff/Client/Resume, with uniqueness checks before restoring to prevent duplicate records.",
          "Audit logging on candidate profiles, surfaced as an Activity Log in the UI.",
          "S3 is configured in filesystems.php but not actually used — file uploads currently go to local disk only. No AI integration in this one.",
        ],
        result:
          "Real internal tool: 427 commits, 15 contributors, Jira-ticket-driven MR workflow on a private GitLab instance. No adoption/usage metrics evidenced in code — team size (15 contributors) is the only concrete number available.",
      },
      screenshots: [],
    },
    {
      name: "UI/UX Study App",
      type: "UX Design",
      company: "Ahmad Dahlan University",
      description:
        "Mobile app interface designed for 500+ students. Full user research process, iterative design, and usability testing. Resulted in a 30% increase in student engagement.",
      tags: ["Figma", "User Research", "Mobile UI", "Usability Testing"],
      link: "https://www.figma.com/design/DrwIqDRGwk1zpID00v9Pa5/imk?node-id=0-1&t=yvZabKqvBckNJL5i-1",
      highlight: false,
      metric: "+30% engagement",
    },
    {
      name: "UI/UX Travel & Transportation",
      type: "UX Design",
      company: "Ahmad Dahlan University",
      description:
        "Booking experience redesign for a travel and transportation platform. Optimized booking flow and conversion, resulting in a 20% increase in booking rate.",
      tags: ["Figma", "UX Research", "Booking Flow", "Conversion Optimization"],
      link: "https://www.figma.com/design/4lRARWmOoZV9BZEUiGRYR2/transportation-app?m=auto&t=BfhBQfQ3AZvRMIjc-1",
      highlight: false,
      metric: "+20% bookings",
    },
    {
      name: "UI/UX Farmasi Rawat Jalan",
      type: "UX Design",
      company: "RSU Mitra Paramedika",
      description:
        "Outpatient pharmacy system interface redesign. Streamlined the dispensing workflow for pharmacy staff, achieving a 20% efficiency improvement and reducing patient waiting time by 10 minutes.",
      tags: ["Figma", "Healthcare UX", "Workflow Design", "Prototyping"],
      link: "https://www.figma.com/design/Uz8KK9W0DG3EzorMuMjJP5/farmasi-rawat-jalan?m=auto&t=BfhBQfQ3AZvRMIjc-1",
      highlight: false,
      metric: "+20% efficiency",
    },
    {
      name: "UI/UX Laboratorium System",
      type: "UX Design",
      company: "RSU Mitra Paramedika",
      description:
        "Laboratory system interface for RSU Mitra Paramedika. Streamlined testing processes for clinical staff, reducing turnaround time by 15%.",
      tags: ["Figma", "Healthcare UX", "Lab Systems", "Prototyping"],
      link: "https://www.figma.com/design/3LSFN50zT5B3HiZ7Ev01No/laboratorium-rs?m=auto&t=BfhBQfQ3AZvRMIjc-1",
      highlight: false,
      metric: "-15% process time",
    },
  ],

  skills: {
    skills: {
      Backend: ["Laravel", "CodeIgniter", "Node.js", "REST API", "PHP"],
      Database: ["PostgreSQL", "MySQL", "SQLite", "Prisma ORM"],
      "Cloud & Infra": ["AWS S3", "Vercel", "Neon", "Pusher"],
      Frontend: ["Next.js", "React", "Tailwind CSS", "JavaScript"],
      Design: ["Figma", "Adobe Photoshop", "Adobe Illustrator", "Adobe Premiere Pro"],
      Mobile: ["Android Studio"],
      Tools: ["Google OAuth", "RBAC", "DataTables", "OpenAI API", "Git"],
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
      { label: "MVPs shipped", value: "3" },
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
      "Backend dev, UI/UX thinker, and fast learner — if you have an interesting problem, I want to hear about it.",
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
