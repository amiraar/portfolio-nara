/**
 * components/portfolio/Education.jsx — Education and contact/footer section.
 * Content loaded dynamically from DB via usePortfolioContent.
 */

"use client";

import { useEffect, useRef } from "react";
import { usePortfolioContent } from "@/lib/usePortfolioContent";

const DEFAULT_EDUCATION = {
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
};

export default function Education() {
  const sectionRef = useRef(null);
  const { data } = usePortfolioContent("education", DEFAULT_EDUCATION);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) el.classList.add("revealed"); },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="education" className="py-28 max-w-5xl mx-auto px-6 lg:px-8">
      <div ref={sectionRef} className="section-reveal">
        <div className="flex items-center gap-4 mb-14">
          <p className="font-mono text-accent text-xs tracking-widest uppercase">05 — Education &amp; Contact</p>
          <div className="gold-divider flex-1 max-w-[60px]" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Education card */}
          <div className="p-6 rounded-xl border border-border bg-surface/60">
            <p className="font-mono text-xs text-accent mb-4 tracking-wider uppercase">Education</p>
            <h3 className="font-display text-xl font-medium text-text-primary leading-snug">
              {data.university}
            </h3>
            <p className="text-text-muted text-sm mt-1">{data.degree}</p>
            <div className="mt-5 space-y-2">
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-xs text-text-muted">GPA</span>
                <span className="font-mono text-sm text-accent">{data.gpa}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-xs text-text-muted">Period</span>
                <span className="font-mono text-sm text-text-muted">{data.period}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-xs text-text-muted">Location</span>
                <span className="font-mono text-sm text-text-muted">{data.location}</span>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="p-6 rounded-xl border border-border bg-surface/60">
            <p className="font-mono text-xs text-accent mb-4 tracking-wider uppercase">Get in Touch</p>
            <h3 className="font-display text-xl font-medium text-text-primary leading-snug mb-2">
              {data.contactHeading}
            </h3>
            <p className="text-text-muted text-sm leading-relaxed mb-6">
              {data.contactSubtext}
            </p>

            <div className="space-y-3">
              <a
                href={`mailto:${data.email}`}
                className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-accent/30 transition-all group"
              >
                <div>
                  <p className="text-xs text-text-muted font-mono">Email</p>
                  <p className="text-sm text-text-primary mt-0.5">{data.email}</p>
                </div>
                <span className="text-text-muted group-hover:text-accent transition-colors">↗</span>
              </a>
              <a
                href={data.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-accent/30 transition-all group"
              >
                <div>
                  <p className="text-xs text-text-muted font-mono">LinkedIn</p>
                  <p className="text-sm text-text-primary mt-0.5">{data.linkedinLabel}</p>
                </div>
                <span className="text-text-muted group-hover:text-accent transition-colors">↗</span>
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-20 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-display text-text-muted text-sm">
            {data.footerCopy}
          </p>
        </div>
      </div>
    </section>
  );
}
