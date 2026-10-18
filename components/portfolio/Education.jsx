"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { clsx } from "clsx";
import { usePortfolioContent } from "@/lib/usePortfolioContent";
import { PORTFOLIO_DEFAULTS } from "@/lib/portfolioDefaults";
import { useRevealOnScroll } from "@/lib/useRevealOnScroll";
import PhotoViewer from "@/components/portfolio/PhotoViewer";
import cutout from "@/public/graduation/cutout-cum-laude.webp";
import screens from "@/public/graduation/campus-screens.webp";
import wall from "@/public/graduation/campus-wall.webp";
import stage from "@/public/graduation/commencement-stage.webp";

// Graduation details are static (not dashboard-editable): they come from the
// commencement itself, Ahmad Dahlan University, 9 November 2024.
const GRADUATION_DATE = "9 Nov 2024";

// A curated three: the large tile plus two stacked beside it. The garden shot
// is left out because the cutout in the degree card comes from it.
// `position` keeps the face in frame when a tile crops the photo.
const PHOTOS = [
  { src: screens, alt: "Amirul leaning on a carved white screen wall, arms crossed, wearing a cum laude sash", caption: "Cum laude, Ahmad Dahlan University", position: "62% 60%" },
  { src: stage, alt: "Amirul in a graduation gown pointing at his diploma in front of the commencement stage", caption: "Commencement, 9 November 2024", position: "50% 30%" },
  { src: wall, alt: "Amirul in a graduation cap leaning on a red granite wall and looking aside", caption: "Campus, Yogyakarta", position: "45% 55%" },
];

export default function Education() {
  const sectionRef = useRef(null);
  const [openPhoto, setOpenPhoto] = useState(null);
  const { data } = usePortfolioContent("education", PORTFOLIO_DEFAULTS.education);
  useRevealOnScroll(sectionRef, 0.1);

  return (
    <section id="education" className="py-28 max-w-6xl mx-auto px-6 lg:px-8">
      <div ref={sectionRef} className="section-reveal">
        {/* Section header */}
        <div className="flex items-center gap-4 mb-12">
          <span className="font-mono text-[10px] text-accent/70 tracking-widest">05</span>
          <span className="h-px w-8 bg-accent/40" />
          <h2 className="font-display text-4xl text-text-primary">Education</h2>
          <div className="flex-1 h-px bg-gradient-to-r from-border/60 to-transparent" />
        </div>

        {/* Degree card. The cutout portrait stands in the card and rises above
            its top edge; the top margin leaves room for that overhang. */}
        <div className="mt-24 md:mt-28 lg:mt-36 warm-card rounded-2xl relative grid md:grid-cols-[minmax(0,1fr)_260px] lg:grid-cols-[minmax(0,1fr)_320px]">
          <figure className="relative h-[230px] sm:h-[260px] md:h-auto md:order-last">
            {/* Arch glow behind the figure */}
            <div
              className="absolute inset-x-[18%] md:inset-x-[12%] -top-16 md:-top-20 bottom-0 rounded-t-full"
              style={{ background: "radial-gradient(ellipse at 50% 30%, rgb(var(--color-accent)/0.22), transparent 70%)" }}
              aria-hidden="true"
            />
            <Image
              src={cutout}
              alt="Amirul at graduation in a batik shirt and cap, wearing the cum laude sash and medal"
              placeholder="blur"
              sizes="(min-width: 1024px) 240px, (min-width: 768px) 190px, 140px"
              className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[calc(100%+5.5rem)] md:h-[calc(100%+7rem)] lg:h-[calc(100%+9rem)] w-auto max-w-none [mask-image:linear-gradient(to_bottom,black_82%,transparent)]"
            />
            {/* Floating honours chip */}
            <figcaption className="absolute right-[8%] md:right-2 lg:right-4 top-[18%] md:top-[12%] flex items-center gap-1.5 font-mono text-[10px] text-accent bg-background/80 backdrop-blur border border-accent/30 px-2.5 py-1 rounded-full shadow-sm">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="9" r="6" />
                <path d="M8.5 14.2 7 22l5-3 5 3-1.5-7.8" />
              </svg>
              Cum laude
            </figcaption>
          </figure>

          <div className="relative overflow-hidden rounded-b-2xl md:rounded-r-none md:rounded-l-2xl p-7 md:py-10 lg:p-12 border-t border-border/60 md:border-t-0 flex flex-col md:flex-row md:items-center gap-6 md:gap-8">
            {/* Ghost number */}
            <span
              className="absolute right-6 bottom-0 font-display font-light select-none pointer-events-none leading-none italic"
              style={{ fontSize: "9rem", color: "rgb(var(--color-accent)/0.05)" }}
              aria-hidden="true"
            >
              05
            </span>

            {/* Degree icon */}
            <div className="relative hidden md:flex flex-shrink-0 w-14 h-14 rounded-xl bg-accent/8 border border-accent/20 items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgb(var(--color-accent))" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                <path d="M6 12v5c3 3 9 3 12 0v-5" />
              </svg>
            </div>

            <div className="relative flex-1">
              <h3 className="font-display text-2xl font-medium text-text-primary">
                {data.university}
              </h3>
              <p className="text-text-muted text-[15px] mt-1">{data.degree}</p>

              <div className="mt-5 flex flex-wrap gap-2">
                <span className="tag-pill">GPA {data.gpa}</span>
                <span className="tag-pill">{data.period}</span>
                <span className="tag-pill">{data.location}</span>
                <span className="tag-pill">Graduated {GRADUATION_DATE}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Graduation gallery: large tile + two stacked on md+, two columns on phones */}
        <div className="mt-14">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 mb-5">
            <h3 className="font-mono text-[10px] text-accent/70 uppercase tracking-widest">Graduation day</h3>
            <p className="font-mono text-[10px] text-text-muted">9 November 2024 · Yogyakarta</p>
          </div>

          <ul className="grid grid-cols-2 md:grid-cols-3 md:grid-rows-[repeat(2,220px)] lg:grid-rows-[repeat(2,270px)] gap-3 md:gap-4">
            {PHOTOS.map((photo, i) => (
              <li key={photo.src.src} className={clsx(i === 0 && "col-span-2 row-span-2")}>
                <button
                  type="button"
                  onClick={() => setOpenPhoto(i)}
                  aria-label={`View photo: ${photo.alt}`}
                  className="group relative block w-full h-full aspect-[4/5] md:aspect-auto overflow-hidden rounded-2xl border border-border bg-surface-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
                >
                  <Image
                    src={photo.src}
                    alt=""
                    fill
                    placeholder="blur"
                    sizes={i === 0 ? "(min-width: 1024px) 720px, (min-width: 768px) 66vw, 100vw" : "(min-width: 1024px) 360px, (min-width: 768px) 33vw, 50vw"}
                    style={{ objectPosition: photo.position }}
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                  />
                  <span className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
                  <span className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-black/50 backdrop-blur text-white flex items-center justify-center opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity" aria-hidden="true">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                    </svg>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {openPhoto !== null ? (
        <PhotoViewer
          photos={PHOTOS}
          startIndex={openPhoto}
          title="Graduation photos"
          onClose={() => setOpenPhoto(null)}
        />
      ) : null}
    </section>
  );
}
