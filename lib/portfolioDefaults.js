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
      "Backend-focused developer specializing in Laravel & CodeIgniter. Building production systems with AI-driven features, workflow automation, and thoughtful UI/UX.",
    location: "Yogyakarta, Indonesia",
    email: "amrlkurniawn19@gmail.com",
    linkedin: "https://linkedin.com/in/mohammad-amirul-kurniawan-putranto/",
  },

  about: {
    // heading and headingAccent are rendered as: "{heading} <italic>{headingAccent}</italic>"
    // For backward compat: if headingAccent is absent in DB data, heading renders as plain text.
    heading: "Building systems that",
    headingAccent: "actually work.",
    paragraphs: [
      "Backend-focused Software Developer with hands-on experience building production MVP systems. I specialize in Laravel and CodeIgniter, with a genuine interest in the full product lifecycle — from database design to user interaction.",
      "Beyond the backend, I bring a strong UI/UX background that lets me think about systems from the user's perspective. I've contributed to reimbursement platforms, AI-driven profile tools, workflow systems, and hospital interfaces — primarily at SoftwareSeni.",
      "Currently open to new collaborations and opportunities.",
    ],
    info: [
      { label: "Location",   value: "Yogyakarta, Indonesia" },
      { label: "Currently",  value: "Software Developer @ SoftwareSeni" },
      { label: "Education",  value: "Informatics, Ahmad Dahlan University — GPA 3.82" },
      { label: "Focus",      value: "Laravel · CodeIgniter · AI Systems · UI/UX" },
      { label: "Languages",  value: "Bahasa Indonesia (Native) · English (Intermediate)" },
    ],
  },

  experience: [
    {
      company: "SoftwareSeni",
      role: "Software Developer",
      period: "Aug 2025 – Present",
      description:
        "Built the MVP of QuickCue — an AI-driven one-page profile generation platform with shareable slug-based URLs and core API infrastructure. Developed Racker — an end-to-end reimbursement and request workflow system with multi-step approvals, AWS S3 file handling, and in-app + email notifications.",
      tags: ["Laravel", "PostgreSQL", "AWS S3", "OpenAI API", "REST API"],
      current: true,
    },
    {
      company: "SoftwareSeni",
      role: "Software Training (Bootcamp)",
      period: "May 2025 – Aug 2025",
      description:
        "Completed intensive bootcamp at SoftwareSeni. Built CPTool — a comprehensive Laravel admin system featuring Google OAuth integration, Role-Based Access Control (RBAC), server-side DataTables for skills and client management.",
      tags: ["Laravel", "Google OAuth", "RBAC", "DataTables", "MySQL"],
      current: false,
    },
    {
      company: "RSU Mitra Paramedika",
      role: "UI/UX Designer",
      period: "Aug 2023 – Nov 2023",
      description:
        "Designed hospital system interfaces resulting in +25% user satisfaction score. Conducted user research with 50 participants across clinical and administrative staff.",
      tags: ["Figma", "User Research", "Prototyping", "Healthcare UX"],
      current: false,
    },
    {
      company: "Lazismu Yogyakarta",
      role: "Project Manager",
      period: "May 2023 – Aug 2023",
      description:
        "Led project coordination for nonprofit initiatives. Achieved +20% improvement in project delivery efficiency.",
      tags: ["Project Management", "Stakeholder Communication", "Agile"],
      current: false,
    },
    {
      company: "Ahmad Dahlan University",
      role: "Lab Assistant",
      period: "Sep 2022 – Jul 2024",
      description:
        "Assisted in teaching Statistics, Algorithm Strategy, Deep Learning, and Data Visualization courses. Supported 30+ students per course.",
      tags: ["Statistics", "Deep Learning", "Data Visualization", "Mentoring"],
      current: false,
    },
  ],

  projects: [
    {
      name: "Racker",
      type: "Web App",
      company: "SoftwareSeni",
      description:
        "End-to-end reimbursement and request workflow platform. Multi-step approval chains, AWS S3 file storage, in-app and email notification system.",
      tags: ["Laravel", "PostgreSQL", "AWS S3", "Notifications"],
      link: "",
      highlight: true,
      metric: "",
    },
    {
      name: "QuickCue",
      type: "AI Product",
      company: "SoftwareSeni",
      description:
        "AI-driven one-page profile generation tool. Visitors receive unique slug-based shareable URLs. Core APIs and OpenAI integration.",
      tags: ["Laravel", "OpenAI API", "Slug URLs", "REST API"],
      link: "",
      highlight: true,
      metric: "",
    },
    {
      name: "CPTool",
      type: "Admin System",
      company: "SoftwareSeni",
      description:
        "Comprehensive Laravel admin dashboard with Google OAuth, Role-Based Access Control, server-side DataTables for skills and client management.",
      tags: ["Laravel", "Google OAuth", "RBAC", "DataTables"],
      link: "",
      highlight: false,
      metric: "",
    },
    {
      name: "UI/UX Study App",
      type: "UX Design",
      company: "Ahmad Dahlan University",
      description:
        "Mobile app interface designed for 500+ students. User research and iterative design led to a +30% engagement improvement.",
      tags: ["Figma", "User Research", "Mobile UI"],
      link: "https://bit.ly/uiuxstudyapp",
      highlight: false,
      metric: "+30% engagement",
    },
    {
      name: "UI/UX Laboratorium",
      type: "UX Design",
      company: "RSU Mitra Paramedika",
      description:
        "Hospital laboratory system interface redesign. Streamlined workflows for clinical staff, reducing processing time by 15%.",
      tags: ["Figma", "Healthcare UX", "Prototyping"],
      link: "https://bit.ly/uiuxlaboratorium",
      highlight: false,
      metric: "-15% processing time",
    },
    {
      name: "UI/UX Travel & Transportation",
      type: "UX Design",
      company: "Personal Project",
      description:
        "Booking experience redesign for travel and transport platform. Improved conversion and usability resulting in +20% booking rate.",
      tags: ["Figma", "UX Research", "Booking Flow"],
      link: "https://bit.ly/uiuxtravelandtransportation",
      highlight: false,
      metric: "+20% bookings",
    },
    {
      name: "UI/UX Farmasi Rawat Jalan",
      type: "UX Design",
      company: "Hospital System",
      description:
        "Outpatient pharmacy system interface. Optimized dispensing workflow for pharmacy staff, achieving +20% efficiency improvement.",
      tags: ["Figma", "Healthcare UX", "Workflow Design"],
      link: "https://bit.ly/uiuxfarmasirawatjalan",
      highlight: false,
      metric: "+20% efficiency",
    },
  ],

  skills: {
    skills: {
      Backend: ["Laravel", "CodeIgniter", "Node.js", "REST API"],
      Database: ["PostgreSQL", "SQLite", "Prisma ORM"],
      Cloud: ["AWS S3", "Vercel", "Neon"],
      Frontend: ["Next.js", "Tailwind CSS", "React"],
      Design: ["Figma", "Adobe Photoshop", "Adobe Illustrator"],
      Mobile: ["Android Studio"],
      "Soft Skills": ["Leadership", "Communication", "Adaptability"],
    },
    languages: [
      { name: "Bahasa Indonesia", level: "Native", pct: 100 },
      { name: "English", level: "Intermediate", pct: 65 },
    ],
    stats: [
      { label: "Projects shipped", value: "7+" },
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
    contactHeading: "Let's work together.",
    contactSubtext:
      "Whether it's a backend challenge, a new product, or just a chat — I'm always open to interesting conversations.",
    email: "amrlkurniawn19@gmail.com",
    linkedin: "https://linkedin.com/in/mohammad-amirul-kurniawan-putranto/",
    linkedinLabel: "Mohammad Amirul Kurniawan",
    footerCopy: "© 2026 Mohammad Amirul Kurniawan Putranto",
  },

  kaia_config: {
    systemPrompt: "",
  },
};
