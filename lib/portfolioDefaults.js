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
      type: "Web App · MVP",
      company: "SoftwareSeni",
      description:
        "End-to-end reimbursement and request workflow platform. Request creation, detail views, status tracking, multi-step approval chains, AWS S3 receipt management, and a full in-app + email notification system.",
      tags: ["Laravel", "PostgreSQL", "AWS S3", "Notifications", "REST API"],
      link: "",
      highlight: true,
      metric: "MVP shipped",
    },
    {
      name: "QuickCue",
      type: "AI Product · MVP",
      company: "SoftwareSeni",
      description:
        "AI-driven one-page profile generation platform. Generates bio, interests, and conversation context from database data. Shareable slug-based URLs, core APIs for profile generation and search, and refactored controllers for maintainability.",
      tags: ["Laravel", "OpenAI API", "Slug URLs", "REST API", "AI Integration"],
      link: "",
      highlight: true,
      metric: "MVP shipped",
    },
    {
      name: "CPTool",
      type: "Admin System · MVP",
      company: "SoftwareSeni",
      description:
        "Full-featured candidate profile admin dashboard. Google OAuth login, RBAC with whitelist access, skills management with 100+ seeded entries, client management with server-side DataTables, modal CRUD, soft delete/restore, and permission-based UI control.",
      tags: ["Laravel", "Google OAuth", "RBAC", "DataTables", "MySQL"],
      link: "",
      highlight: false,
      metric: "MVP shipped",
    },
    {
      name: "UI/UX Study App",
      type: "UX Design",
      company: "Ahmad Dahlan University",
      description:
        "Mobile app interface designed for 500+ students. Full user research process, iterative design, and usability testing. Resulted in a 30% increase in student engagement.",
      tags: ["Figma", "User Research", "Mobile UI", "Usability Testing"],
      link: "https://bit.ly/uiuxstudyapp",
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
      link: "https://bit.ly/uiuxtravelandtransportation",
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
      link: "https://bit.ly/uiuxfarmasirawatjalan",
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
      link: "https://bit.ly/uiuxlaboratorium",
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
