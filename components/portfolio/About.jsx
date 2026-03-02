/**
 * components/portfolio/About.jsx — About section with personal summary.
 * Content loaded dynamically from DB via usePortfolioContent.
 */

"use client";

import { useEffect, useRef } from "react";
import { usePortfolioContent } from "@/lib/usePortfolioContent";

const DEFAULT_ABOUT = {
  heading: "Building systems that actually work.",
  paragraphs: [
    "Backend-focused Software Developer with hands-on experience building production MVP systems. I specialize in Laravel and CodeIgniter, with a genuine interest in the full product lifecycle — from database design to user interaction.",
    "Beyond the backend, I bring a strong UI/UX background that lets me think about systems from the user\u2019s perspective. I\u2019ve contributed to reimbursement platforms, AI-driven profile tools, workflow systems, and hospital interfaces — primarily at SoftwareSeni.",
    "Currently open to new collaborations and opportunities.",
  ],
  info: [
    { label: "Location",   value: "Yogyakarta, Indonesia" },
    { label: "Currently",  value: "Software Developer @ SoftwareSeni" },
    { label: "Education",  value: "Informatics, Ahmad Dahlan University — GPA 3.82" },
    { label: "Focus",      value: "Laravel · CodeIgniter · AI Systems · UI/UX" },
    { label: "Languages",  value: "Bahasa Indonesia (Native) · English (Intermediate)" },
  ],
};

export default function About() {
  const sectionRef = useRef(null);
  const { data } = usePortfolioContent("about", DEFAULT_ABOUT);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) el.classList.add("revealed");
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="about" className="py-28 max-w-5xl mx-auto px-6 lg:px-8">
      <div ref={sectionRef} className="section-reveal">
        <div className="flex items-center gap-4 mb-10">
          <p className="font-mono text-accent text-xs tracking-widest uppercase">01 — About</p>
          <div className="gold-divider flex-1 max-w-[60px]" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div>
            <h2 className="font-display text-3xl lg:text-4xl font-medium text-text-primary leading-tight mb-6">
              {data.heading.replace(" actually work.", " ")}
              <span className="text-accent italic">actually work.</span>
            </h2>
            <div className="space-y-4 text-text-muted text-base leading-relaxed">
              {(data.paragraphs ?? []).map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {(data.info ?? []).map((row) => (
              <InfoRow key={row.label} label={row.label} value={row.value} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex gap-4 py-3 border-b border-border">
      <span className="font-mono text-xs text-accent w-24 flex-shrink-0 pt-0.5">{label}</span>
      <span className="text-sm text-text-muted leading-relaxed">{value}</span>
    </div>
  );
}
