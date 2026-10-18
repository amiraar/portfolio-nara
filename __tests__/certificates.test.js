import { describe, it, expect } from "vitest";
import { existsSync } from "fs";
import path from "path";
import { CERTIFICATES, CERTIFICATE_GROUPS, certificatesForExperience } from "@/lib/certificates";
import { PORTFOLIO_DEFAULTS } from "@/lib/portfolioDefaults";

describe("certificates", () => {
  it("every image exists in public/", () => {
    for (const cert of CERTIFICATES) {
      for (const page of cert.pages) {
        expect(existsSync(path.join(process.cwd(), "public", page.src)), page.src).toBe(true);
      }
    }
  });

  it("every lab assistant certificate lists the courses it covers", () => {
    const lab = CERTIFICATES.find((cert) => cert.id === "lab-assistant");
    for (const page of lab.pages) {
      expect(page.courses?.length, page.caption).toBeGreaterThan(0);
      for (const course of page.courses) {
        expect(course.name).toBeTruthy();
        expect(course.lab).toBeTruthy();
      }
    }
  });

  it("every certificate belongs to a known group", () => {
    const groups = CERTIFICATE_GROUPS.map((g) => g.id);
    for (const cert of CERTIFICATES) expect(groups).toContain(cert.group);
  });

  it("every experience-linked certificate matches a default experience entry", () => {
    const linked = PORTFOLIO_DEFAULTS.experience.flatMap((exp) =>
      certificatesForExperience(exp).map((cert) => cert.id)
    );
    const expected = CERTIFICATES.filter((cert) => cert.experience).map((cert) => cert.id);
    expect(linked.sort()).toEqual(expected.sort());
  });

  it("matches the role case-insensitively and requires the same company", () => {
    expect(
      certificatesForExperience({ company: "Ahmad Dahlan University", role: "Senior LAB ASSISTANT" })
    ).toHaveLength(1);
    expect(certificatesForExperience({ company: "Other", role: "Lab Assistant" })).toHaveLength(0);
  });
});
