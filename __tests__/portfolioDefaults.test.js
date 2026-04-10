import { describe, it, expect } from "vitest";
import { PORTFOLIO_DEFAULTS } from "../lib/portfolioDefaults.js";

describe("PORTFOLIO_DEFAULTS", () => {
  const REQUIRED_SECTIONS = ["hero", "about", "experience", "projects", "skills", "education"];

  it("exports all 6 sections", () => {
    for (const section of REQUIRED_SECTIONS) {
      expect(PORTFOLIO_DEFAULTS).toHaveProperty(section);
    }
  });

  it("hero has required fields", () => {
    const { hero } = PORTFOLIO_DEFAULTS;
    expect(hero).toHaveProperty("name");
    expect(hero).toHaveProperty("tagline");
    expect(hero).toHaveProperty("email");
    expect(typeof hero.name).toBe("string");
    expect(hero.name.length).toBeGreaterThan(0);
  });

  it("about has heading and headingAccent", () => {
    const { about } = PORTFOLIO_DEFAULTS;
    expect(about).toHaveProperty("heading");
    expect(about).toHaveProperty("headingAccent");
    expect(typeof about.heading).toBe("string");
    expect(typeof about.headingAccent).toBe("string");
  });

  it("about has at least one paragraph", () => {
    const { about } = PORTFOLIO_DEFAULTS;
    expect(Array.isArray(about.paragraphs)).toBe(true);
    expect(about.paragraphs.length).toBeGreaterThan(0);
  });

  it("experience is a non-empty array", () => {
    expect(Array.isArray(PORTFOLIO_DEFAULTS.experience)).toBe(true);
    expect(PORTFOLIO_DEFAULTS.experience.length).toBeGreaterThan(0);
  });

  it("each experience entry has role, company, period", () => {
    for (const entry of PORTFOLIO_DEFAULTS.experience) {
      expect(entry).toHaveProperty("role");
      expect(entry).toHaveProperty("company");
      expect(entry).toHaveProperty("period");
    }
  });

  it("projects is a non-empty array", () => {
    expect(Array.isArray(PORTFOLIO_DEFAULTS.projects)).toBe(true);
    expect(PORTFOLIO_DEFAULTS.projects.length).toBeGreaterThan(0);
  });

  it("skills has skills object and languages array", () => {
    const { skills } = PORTFOLIO_DEFAULTS;
    expect(skills).toHaveProperty("skills");
    expect(typeof skills.skills).toBe("object");
    expect(Array.isArray(skills.languages)).toBe(true);
  });

  it("education has university and email for contact", () => {
    const { education } = PORTFOLIO_DEFAULTS;
    expect(education).toHaveProperty("university");
    expect(education).toHaveProperty("email");
    expect(education).toHaveProperty("contactHeading");
    expect(education).toHaveProperty("footerCopy");
  });
});
