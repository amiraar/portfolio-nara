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
      "Backend Developer specializing in Laravel and CodeIgniter, building production applications with AI-powered features, workflow automation, and an eye for UI/UX.",
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
      "I'm a backend-focused Software Developer at SoftwareSeni, where I build production applications using Laravel and CodeIgniter — from AI-powered profile tools to multi-step reimbursement systems with cloud file storage and real-time notifications.",
      "I also have a background in UI/UX design, which shapes how I approach backend work — I pay attention to how people actually use what I build, not just how it's structured. I've designed hospital interfaces, conducted research with more than 50 participants, and turned those findings into working systems.",
      "I previously worked as a lab assistant teaching Statistics, Deep Learning, and Data Visualization at Ahmad Dahlan University, and I'm currently open to new opportunities.",
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
        "Building production applications end-to-end. Delivered QuickCue, an AI-powered tool that generates shareable one-page profiles, and Racker, a reimbursement and budget request system with multi-step approvals, secure receipt storage, and in-app plus email notifications.",
      tags: ["Laravel", "PostgreSQL", "AWS S3", "OpenAI API", "REST API", "Notifications"],
      current: true,
    },
    {
      company: "SoftwareSeni",
      role: "Software Training — Accelerated Talent Bootcamp",
      period: "May 2025 – Aug 2025",
      description:
        "Built CPTool, an internal admin system with Google sign-in, role-based access control, and secure account setup and password reset. Added modules for managing skills and clients, including bulk actions, safe delete-and-restore, and permission-based access to different parts of the interface.",
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
        "An internal tool for managing team-event budget requests and reimbursements, replacing manual spreadsheets and email follow-ups. Supports two approval paths, role-based access, automatic reminders, and a full history of every request.",
      tags: ["CodeIgniter", "PostgreSQL", "AWS S3", "RBAC", "OAuth SSO"],
      link: "",
      highlight: true,
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
      highlight: true,
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
