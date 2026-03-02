/**
 * components/dashboard/ContentEditor.jsx
 * Form-based CMS editor for all portfolio sections.
 * Owner can add, edit, and delete content without touching JSON.
 */

"use client";

import { useState, useEffect, useCallback, useRef } from "react";

// ─── Default data (mirrors hardcoded defaults in each component) ───────────

const DEFAULTS = {
  hero: {
    name: "Mohammad Amirul Kurniawan Putranto",
    tagline:
      "Backend-focused developer specializing in Laravel & CodeIgniter. Building production systems with AI-driven features, workflow automation, and thoughtful UI/UX.",
    location: "Yogyakarta, Indonesia",
    email: "amrlkurniawn19@gmail.com",
    linkedin: "https://linkedin.com/in/mohammad-amirul-kurniawan-putranto/",
  },
  about: {
    heading: "Building systems that actually work.",
    paragraphs: [
      "Backend-focused Software Developer with hands-on experience building production MVP systems. I specialize in Laravel and CodeIgniter, with a genuine interest in the full product lifecycle — from database design to user interaction.",
      "Beyond the backend, I bring a strong UI/UX background that lets me think about systems from the user\u2019s perspective. I\u2019ve contributed to reimbursement platforms, AI-driven profile tools, workflow systems, and hospital interfaces — primarily at SoftwareSeni.",
      "Currently open to new collaborations and opportunities.",
    ],
    info: [
      { label: "Location",  value: "Yogyakarta, Indonesia" },
      { label: "Currently", value: "Software Developer @ SoftwareSeni" },
      { label: "Education", value: "Informatics, Ahmad Dahlan University — GPA 3.82" },
      { label: "Focus",     value: "Laravel · CodeIgniter · AI Systems · UI/UX" },
      { label: "Languages", value: "Bahasa Indonesia (Native) · English (Intermediate)" },
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
};

const SECTIONS = [
  { key: "hero", label: "Hero" },
  { key: "experience", label: "Experience" },
  { key: "projects", label: "Projects" },
  { key: "skills", label: "Skills" },
  { key: "education", label: "Education" },
];

// ─── Shared UI primitives ──────────────────────────────────────────────────

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="font-mono text-[11px] text-text-muted uppercase tracking-wider">{label}</label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent/40 transition-colors";

const textareaCls =
  "w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent/40 transition-colors resize-none";

function TagInput({ tags, onChange }) {
  const [input, setInput] = useState("");
  function add() {
    const v = input.trim();
    if (v && !tags.includes(v)) onChange([...tags, v]);
    setInput("");
  }
  function remove(t) { onChange(tags.filter((x) => x !== t)); }
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-1.5">
        {tags.map((t) => (
          <span key={t} className="flex items-center gap-1 bg-accent/10 text-accent border border-accent/20 text-xs font-mono px-2 py-0.5 rounded-md">
            {t}
            <button type="button" onClick={() => remove(t)} className="ml-0.5 text-accent/60 hover:text-red-400 transition-colors leading-none">×</button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
          className={`${inputCls} flex-1`} placeholder="Tambah tag, Enter untuk simpan" />
        <button type="button" onClick={add}
          className="font-mono text-xs px-3 py-1.5 border border-border text-text-muted rounded-lg hover:border-accent/40 hover:text-accent transition-colors">
          + Add
        </button>
      </div>
    </div>
  );
}

function BtnDanger({ onClick, children }) {
  return (
    <button type="button" onClick={onClick}
      className="font-mono text-[11px] text-red-400/70 border border-red-400/20 px-2.5 py-1 rounded-lg hover:bg-red-400/10 hover:border-red-400/40 transition-colors">
      {children}
    </button>
  );
}

function BtnSecondary({ onClick, children, disabled }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled}
      className="font-mono text-xs text-text-muted border border-border px-2.5 py-1 rounded-lg hover:border-accent/40 hover:text-accent transition-colors disabled:opacity-30">
      {children}
    </button>
  );
}

function Divider() {
  return <div className="border-t border-border my-2" />;
}

// ─── About Editor ────────────────────────────────────────────────────────

function AboutEditor({ data, onChange }) {
  function set(k, v) { onChange({ ...data, [k]: v }); }

  function updateParagraph(i, val) {
    const next = [...(data.paragraphs ?? [])]; next[i] = val; set("paragraphs", next);
  }
  function addParagraph() { set("paragraphs", [...(data.paragraphs ?? []), ""]); }
  function removeParagraph(i) { set("paragraphs", (data.paragraphs ?? []).filter((_, idx) => idx !== i)); }

  function updateInfo(i, key, val) {
    const next = [...(data.info ?? [])]; next[i] = { ...next[i], [key]: val }; set("info", next);
  }
  function addInfo() { set("info", [...(data.info ?? []), { label: "", value: "" }]); }
  function removeInfo(i) { set("info", (data.info ?? []).filter((_, idx) => idx !== i)); }

  return (
    <div className="space-y-6">
      <Field label="Heading">
        <input className={inputCls} value={data.heading ?? ""} onChange={(e) => set("heading", e.target.value)}
          placeholder="Building systems that actually work." />
      </Field>

      <div>
        <p className="font-mono text-[11px] text-text-muted uppercase tracking-wider mb-2">Paragraphs</p>
        <div className="space-y-3">
          {(data.paragraphs ?? []).map((p, i) => (
            <div key={i} className="flex gap-2">
              <textarea className={`${textareaCls} flex-1`} rows={3} value={p}
                onChange={(e) => updateParagraph(i, e.target.value)}
                placeholder={`Paragraph ${i + 1}...`} />
              <BtnDanger onClick={() => removeParagraph(i)}>×</BtnDanger>
            </div>
          ))}
        </div>
        <button type="button" onClick={addParagraph}
          className="mt-2 w-full font-mono text-xs text-accent border border-accent/30 border-dashed py-2 rounded-xl hover:bg-accent/5 transition-colors">
          + Tambah Paragraph
        </button>
      </div>

      <Divider />

      <div>
        <p className="font-mono text-[11px] text-text-muted uppercase tracking-wider mb-2">Info Rows</p>
        <div className="space-y-2">
          {(data.info ?? []).map((row, i) => (
            <div key={i} className="flex items-center gap-2">
              <input className={`${inputCls} w-28 flex-shrink-0`} value={row.label}
                onChange={(e) => updateInfo(i, "label", e.target.value)} placeholder="Label" />
              <input className={`${inputCls} flex-1`} value={row.value}
                onChange={(e) => updateInfo(i, "value", e.target.value)} placeholder="Value" />
              <BtnDanger onClick={() => removeInfo(i)}>×</BtnDanger>
            </div>
          ))}
        </div>
        <button type="button" onClick={addInfo}
          className="mt-2 w-full font-mono text-xs text-accent border border-accent/30 border-dashed py-2 rounded-xl hover:bg-accent/5 transition-colors">
          + Tambah Row
        </button>
      </div>
    </div>
  );
}

// ─── Hero Editor ──────────────────────────────────────────────────────────

function HeroEditor({ data, onChange }) {
  function set(k, v) { onChange({ ...data, [k]: v }); }
  return (
    <div className="space-y-4">
      <Field label="Full Name">
        <input className={inputCls} value={data.name} onChange={(e) => set("name", e.target.value)} placeholder="Mohammad Amirul Kurniawan Putranto" />
      </Field>
      <Field label="Tagline">
        <textarea className={textareaCls} rows={3} value={data.tagline} onChange={(e) => set("tagline", e.target.value)} placeholder="Deskripsi singkat tentang diri kamu" />
      </Field>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Location">
          <input className={inputCls} value={data.location} onChange={(e) => set("location", e.target.value)} placeholder="Yogyakarta, Indonesia" />
        </Field>
        <Field label="Email">
          <input className={inputCls} type="email" value={data.email} onChange={(e) => set("email", e.target.value)} placeholder="email@gmail.com" />
        </Field>
      </div>
      <Field label="LinkedIn URL">
        <input className={inputCls} value={data.linkedin} onChange={(e) => set("linkedin", e.target.value)} placeholder="https://linkedin.com/in/..." />
      </Field>
    </div>
  );
}

// ─── Experience Editor ────────────────────────────────────────────────────

const EMPTY_EXP = { company: "", role: "", period: "", description: "", tags: [], current: false };

function ExperienceEditor({ data, onChange }) {
  const [expandedIdx, setExpandedIdx] = useState(null);
  function updateItem(i, updated) { const next = [...data]; next[i] = updated; onChange(next); }
  function deleteItem(i) { onChange(data.filter((_, idx) => idx !== i)); if (expandedIdx === i) setExpandedIdx(null); }
  function addItem() { onChange([...data, { ...EMPTY_EXP, tags: [] }]); setExpandedIdx(data.length); }
  function move(i, dir) {
    const j = i + dir;
    if (j < 0 || j >= data.length) return;
    const next = [...data];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
    setExpandedIdx(j);
  }
  return (
    <div className="space-y-3">
      {data.map((exp, i) => (
        <div key={i} className="border border-border rounded-xl overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 bg-surface/40 cursor-pointer select-none"
            onClick={() => setExpandedIdx(expandedIdx === i ? null : i)}>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-text-primary font-medium truncate">{exp.role || <span className="text-text-muted italic">Untitled Role</span>}</p>
              <p className="font-mono text-xs text-accent truncate">{exp.company}{exp.period ? ` · ${exp.period}` : ""}</p>
            </div>
            {exp.current && <span className="font-mono text-[10px] text-accent border border-accent/30 px-1.5 py-0.5 rounded-full bg-accent/5 flex-shrink-0">Current</span>}
            <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
              <BtnSecondary onClick={() => move(i, -1)} disabled={i === 0}>↑</BtnSecondary>
              <BtnSecondary onClick={() => move(i, 1)} disabled={i === data.length - 1}>↓</BtnSecondary>
              <BtnDanger onClick={() => deleteItem(i)}>Hapus</BtnDanger>
            </div>
            <span className="text-text-muted text-xs">{expandedIdx === i ? "▲" : "▼"}</span>
          </div>
          {expandedIdx === i && (
            <div className="p-4 space-y-4 border-t border-border">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Role / Jabatan">
                  <input className={inputCls} value={exp.role} onChange={(e) => updateItem(i, { ...exp, role: e.target.value })} placeholder="Software Developer" />
                </Field>
                <Field label="Company">
                  <input className={inputCls} value={exp.company} onChange={(e) => updateItem(i, { ...exp, company: e.target.value })} placeholder="SoftwareSeni" />
                </Field>
              </div>
              <Field label="Period">
                <input className={inputCls} value={exp.period} onChange={(e) => updateItem(i, { ...exp, period: e.target.value })} placeholder="Aug 2025 – Present" />
              </Field>
              <Field label="Description">
                <textarea className={textareaCls} rows={4} value={exp.description} onChange={(e) => updateItem(i, { ...exp, description: e.target.value })} placeholder="Deskripsi pekerjaan..." />
              </Field>
              <Field label="Tags / Tech Stack">
                <TagInput tags={exp.tags ?? []} onChange={(tags) => updateItem(i, { ...exp, tags })} />
              </Field>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input type="checkbox" checked={!!exp.current} onChange={(e) => updateItem(i, { ...exp, current: e.target.checked })} className="accent-[#C9A96E] w-4 h-4" />
                <span className="text-sm text-text-muted">Pekerjaan saat ini (Current)</span>
              </label>
            </div>
          )}
        </div>
      ))}
      <button type="button" onClick={addItem}
        className="w-full font-mono text-xs text-accent border border-accent/30 border-dashed py-3 rounded-xl hover:bg-accent/5 transition-colors">
        + Tambah Experience
      </button>
    </div>
  );
}

// ─── Projects Editor ──────────────────────────────────────────────────────

const EMPTY_PROJECT = { name: "", type: "", company: "", description: "", tags: [], link: "", highlight: false, metric: "" };

function ProjectsEditor({ data, onChange }) {
  const [expandedIdx, setExpandedIdx] = useState(null);
  function updateItem(i, updated) { const next = [...data]; next[i] = updated; onChange(next); }
  function deleteItem(i) { onChange(data.filter((_, idx) => idx !== i)); if (expandedIdx === i) setExpandedIdx(null); }
  function addItem() { onChange([...data, { ...EMPTY_PROJECT, tags: [] }]); setExpandedIdx(data.length); }
  function move(i, dir) {
    const j = i + dir;
    if (j < 0 || j >= data.length) return;
    const next = [...data];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
    setExpandedIdx(j);
  }
  return (
    <div className="space-y-3">
      {data.map((project, i) => (
        <div key={i} className="border border-border rounded-xl overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 bg-surface/40 cursor-pointer select-none"
            onClick={() => setExpandedIdx(expandedIdx === i ? null : i)}>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-text-primary font-medium truncate">{project.name || <span className="text-text-muted italic">Untitled Project</span>}</p>
              <p className="font-mono text-xs text-accent truncate">{project.type}{project.company ? ` · ${project.company}` : ""}</p>
            </div>
            {project.highlight && <span className="font-mono text-[10px] text-accent border border-accent/30 px-1.5 py-0.5 rounded-full bg-accent/5 flex-shrink-0">Featured</span>}
            <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
              <BtnSecondary onClick={() => move(i, -1)} disabled={i === 0}>↑</BtnSecondary>
              <BtnSecondary onClick={() => move(i, 1)} disabled={i === data.length - 1}>↓</BtnSecondary>
              <BtnDanger onClick={() => deleteItem(i)}>Hapus</BtnDanger>
            </div>
            <span className="text-text-muted text-xs">{expandedIdx === i ? "▲" : "▼"}</span>
          </div>
          {expandedIdx === i && (
            <div className="p-4 space-y-4 border-t border-border">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Project Name">
                  <input className={inputCls} value={project.name} onChange={(e) => updateItem(i, { ...project, name: e.target.value })} placeholder="Racker" />
                </Field>
                <Field label="Type">
                  <input className={inputCls} value={project.type} onChange={(e) => updateItem(i, { ...project, type: e.target.value })} placeholder="Web App / AI Product / UX Design" />
                </Field>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Company / Context">
                  <input className={inputCls} value={project.company} onChange={(e) => updateItem(i, { ...project, company: e.target.value })} placeholder="SoftwareSeni" />
                </Field>
                <Field label="Metric (opsional)">
                  <input className={inputCls} value={project.metric ?? ""} onChange={(e) => updateItem(i, { ...project, metric: e.target.value })} placeholder="+30% engagement" />
                </Field>
              </div>
              <Field label="Description">
                <textarea className={textareaCls} rows={4} value={project.description} onChange={(e) => updateItem(i, { ...project, description: e.target.value })} placeholder="Deskripsi project..." />
              </Field>
              <Field label="Link (opsional)">
                <input className={inputCls} value={project.link ?? ""} onChange={(e) => updateItem(i, { ...project, link: e.target.value })} placeholder="https://..." />
              </Field>
              <Field label="Tags / Tech Stack">
                <TagInput tags={project.tags ?? []} onChange={(tags) => updateItem(i, { ...project, tags })} />
              </Field>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input type="checkbox" checked={!!project.highlight} onChange={(e) => updateItem(i, { ...project, highlight: e.target.checked })} className="accent-[#C9A96E] w-4 h-4" />
                <span className="text-sm text-text-muted">Featured project (border gold)</span>
              </label>
            </div>
          )}
        </div>
      ))}
      <button type="button" onClick={addItem}
        className="w-full font-mono text-xs text-accent border border-accent/30 border-dashed py-3 rounded-xl hover:bg-accent/5 transition-colors">
        + Tambah Project
      </button>
    </div>
  );
}

// ─── Skills Editor ────────────────────────────────────────────────────────

function SkillsEditor({ data, onChange }) {
  const [newCat, setNewCat] = useState("");
  const skills = data.skills ?? {};
  const languages = data.languages ?? [];
  const stats = data.stats ?? [];

  function setSkills(s) { onChange({ ...data, skills: s }); }
  function setLanguages(l) { onChange({ ...data, languages: l }); }
  function setStats(s) { onChange({ ...data, stats: s }); }

  function addCategory() {
    const k = newCat.trim();
    if (!k || skills[k]) return;
    setSkills({ ...skills, [k]: [] });
    setNewCat("");
  }
  function deleteCategory(k) { const next = { ...skills }; delete next[k]; setSkills(next); }
  function renameCategory(oldKey, newKey) {
    if (!newKey.trim() || newKey === oldKey) return;
    const entries = Object.entries(skills);
    const idx = entries.findIndex(([k]) => k === oldKey);
    entries[idx] = [newKey.trim(), entries[idx][1]];
    setSkills(Object.fromEntries(entries));
  }

  return (
    <div className="space-y-8">
      {/* Skill categories */}
      <div>
        <p className="font-mono text-xs text-accent mb-3 uppercase tracking-wider">Skill Categories</p>
        <div className="space-y-4">
          {Object.entries(skills).map(([cat, items]) => (
            <div key={cat} className="border border-border rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <input className={`${inputCls} flex-1 font-mono text-xs`} defaultValue={cat}
                  onBlur={(e) => renameCategory(cat, e.target.value)} placeholder="Category name" />
                <BtnDanger onClick={() => deleteCategory(cat)}>Hapus</BtnDanger>
              </div>
              <TagInput tags={items} onChange={(tags) => setSkills({ ...skills, [cat]: tags })} />
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-3">
          <input className={`${inputCls} flex-1`} value={newCat} onChange={(e) => setNewCat(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCategory(); } }}
            placeholder="Nama kategori baru..." />
          <button type="button" onClick={addCategory}
            className="font-mono text-xs text-accent border border-accent/30 border-dashed px-4 py-2 rounded-lg hover:bg-accent/5 transition-colors">
            + Kategori
          </button>
        </div>
      </div>

      <Divider />

      {/* Languages */}
      <div>
        <p className="font-mono text-xs text-accent mb-3 uppercase tracking-wider">Languages</p>
        <div className="space-y-3">
          {languages.map((lang, i) => (
            <div key={i} className="border border-border rounded-xl p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Bahasa">
                  <input className={inputCls} value={lang.name} onChange={(e) => {
                    const next = [...languages]; next[i] = { ...lang, name: e.target.value }; setLanguages(next);
                  }} placeholder="English" />
                </Field>
                <Field label="Level">
                  <input className={inputCls} value={lang.level} onChange={(e) => {
                    const next = [...languages]; next[i] = { ...lang, level: e.target.value }; setLanguages(next);
                  }} placeholder="Native / Intermediate" />
                </Field>
              </div>
              <Field label={`Proficiency: ${lang.pct}%`}>
                <input type="range" min={0} max={100} value={lang.pct}
                  onChange={(e) => { const next = [...languages]; next[i] = { ...lang, pct: Number(e.target.value) }; setLanguages(next); }}
                  className="w-full accent-[#C9A96E]" />
              </Field>
              <div className="flex justify-end">
                <BtnDanger onClick={() => setLanguages(languages.filter((_, idx) => idx !== i))}>Hapus</BtnDanger>
              </div>
            </div>
          ))}
        </div>
        <button type="button" onClick={() => setLanguages([...languages, { name: "", level: "", pct: 50 }])}
          className="mt-3 w-full font-mono text-xs text-accent border border-accent/30 border-dashed py-3 rounded-xl hover:bg-accent/5 transition-colors">
          + Tambah Bahasa
        </button>
      </div>

      <Divider />

      {/* Quick Stats */}
      <div>
        <p className="font-mono text-xs text-accent mb-3 uppercase tracking-wider">Quick Stats</p>
        <div className="space-y-2">
          {stats.map((stat, i) => (
            <div key={i} className="flex items-center gap-2">
              <input className={`${inputCls} flex-1`} value={stat.label}
                onChange={(e) => { const next = [...stats]; next[i] = { ...stat, label: e.target.value }; setStats(next); }}
                placeholder="Label (cth: Projects shipped)" />
              <input className={`${inputCls} w-24`} value={stat.value}
                onChange={(e) => { const next = [...stats]; next[i] = { ...stat, value: e.target.value }; setStats(next); }}
                placeholder="7+" />
              <BtnDanger onClick={() => setStats(stats.filter((_, idx) => idx !== i))}>×</BtnDanger>
            </div>
          ))}
        </div>
        <button type="button" onClick={() => setStats([...stats, { label: "", value: "" }])}
          className="mt-3 w-full font-mono text-xs text-accent border border-accent/30 border-dashed py-3 rounded-xl hover:bg-accent/5 transition-colors">
          + Tambah Stat
        </button>
      </div>
    </div>
  );
}

// ─── Education Editor ─────────────────────────────────────────────────────

function EducationEditor({ data, onChange }) {
  function set(k, v) { onChange({ ...data, [k]: v }); }
  return (
    <div className="space-y-6">
      <div>
        <p className="font-mono text-xs text-accent mb-3 uppercase tracking-wider">Education</p>
        <div className="space-y-4">
          <Field label="Universitas">
            <input className={inputCls} value={data.university} onChange={(e) => set("university", e.target.value)} placeholder="Ahmad Dahlan University" />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Jurusan / Gelar">
              <input className={inputCls} value={data.degree} onChange={(e) => set("degree", e.target.value)} placeholder="Informatics · S.Kom" />
            </Field>
            <Field label="GPA">
              <input className={inputCls} value={data.gpa} onChange={(e) => set("gpa", e.target.value)} placeholder="3.82 / 4.00" />
            </Field>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Periode">
              <input className={inputCls} value={data.period} onChange={(e) => set("period", e.target.value)} placeholder="2020 – 2024" />
            </Field>
            <Field label="Lokasi">
              <input className={inputCls} value={data.location} onChange={(e) => set("location", e.target.value)} placeholder="Yogyakarta, Indonesia" />
            </Field>
          </div>
        </div>
      </div>

      <Divider />

      <div>
        <p className="font-mono text-xs text-accent mb-3 uppercase tracking-wider">Contact Section</p>
        <div className="space-y-4">
          <Field label="Heading">
            <input className={inputCls} value={data.contactHeading} onChange={(e) => set("contactHeading", e.target.value)} placeholder="Let's work together." />
          </Field>
          <Field label="Subtext">
            <textarea className={textareaCls} rows={2} value={data.contactSubtext} onChange={(e) => set("contactSubtext", e.target.value)} placeholder="Deskripsi singkat..." />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Email">
              <input className={inputCls} type="email" value={data.email} onChange={(e) => set("email", e.target.value)} placeholder="email@gmail.com" />
            </Field>
            <Field label="LinkedIn URL">
              <input className={inputCls} value={data.linkedin} onChange={(e) => set("linkedin", e.target.value)} placeholder="https://linkedin.com/in/..." />
            </Field>
          </div>
          <Field label="LinkedIn Display Name">
            <input className={inputCls} value={data.linkedinLabel} onChange={(e) => set("linkedinLabel", e.target.value)} placeholder="Mohammad Amirul Kurniawan" />
          </Field>
          <Field label="Footer Copyright">
            <input className={inputCls} value={data.footerCopy} onChange={(e) => set("footerCopy", e.target.value)} placeholder="© 2026 ..." />
          </Field>
        </div>
      </div>
    </div>
  );
}

// ─── Main shell ───────────────────────────────────────────────────────────

export default function ContentEditor() {
  const [activeSection, setActiveSection] = useState("hero");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [status, setStatus] = useState(null); // "saved" | "error"
  const timerRef = useRef(null);

  const loadSection = useCallback(async (section) => {
    setLoading(true);
    setData(null);
    setStatus(null);
    setDirty(false);
    try {
      const res = await fetch(`/api/portfolio?section=${section}`);
      const { content } = await res.json();
      setData(content ?? DEFAULTS[section]);
    } catch {
      setData(DEFAULTS[section]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadSection(activeSection); }, [activeSection, loadSection]);
  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  function handleChange(newData) { setData(newData); setDirty(true); setStatus(null); }

  async function handleSave() {
    if (!data) return;
    setSaving(true);
    setStatus(null);
    try {
      const res = await fetch("/api/portfolio", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: activeSection, data }),
      });
      if (!res.ok) throw new Error();
      setStatus("saved");
      setDirty(false);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setStatus(null), 3000);
    } catch {
      setStatus("error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Section tabs + save */}
      <div className="flex-shrink-0 flex items-center justify-between gap-2 p-3 border-b border-border bg-surface/40">
        <div className="flex gap-1 overflow-x-auto">
          {SECTIONS.map(({ key, label }) => (
            <button key={key} onClick={() => { setData(null); setActiveSection(key); }}
              className={`font-mono text-xs px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                activeSection === key
                  ? "bg-accent/10 text-accent border border-accent/30"
                  : "text-text-muted hover:text-text-primary border border-transparent"
              }`}>
              {label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {status === "saved" && <span className="font-mono text-xs text-green-400">✓ Tersimpan</span>}
          {status === "error" && <span className="font-mono text-xs text-red-400">✗ Gagal simpan</span>}
          <button onClick={() => loadSection(activeSection)} disabled={loading}
            className="font-mono text-xs text-text-muted border border-border px-3 py-1.5 rounded-lg hover:border-text-muted/50 transition-colors disabled:opacity-50">
            Reset
          </button>
          <button onClick={handleSave} disabled={saving || loading || !dirty}
            className="font-mono text-xs bg-accent text-background px-4 py-1.5 rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {saving ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </div>

      {/* Editor body */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <p className="font-mono text-xs text-text-muted">Loading...</p>
          </div>
        ) : data ? (
          <>
            {activeSection === "hero"       && <HeroEditor       data={data} onChange={handleChange} />}
            {activeSection === "about"      && <AboutEditor      data={data} onChange={handleChange} />}
            {activeSection === "experience" && <ExperienceEditor  data={data} onChange={handleChange} />}
            {activeSection === "projects"   && <ProjectsEditor    data={data} onChange={handleChange} />}
            {activeSection === "skills"     && <SkillsEditor      data={data} onChange={handleChange} />}
            {activeSection === "education"  && <EducationEditor   data={data} onChange={handleChange} />}
          </>
        ) : null}
      </div>
    </div>
  );
}
