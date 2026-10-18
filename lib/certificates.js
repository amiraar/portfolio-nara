/**
 * lib/certificates.js
 * Certificates shown in the Certificates section and linked from Experience cards.
 * Static (not editable from the dashboard). Images live in public/certificates/;
 * student and staff ID numbers were covered before export.
 *
 * `courses` (optional, per page) lists the lab courses a certificate covers.
 *
 * `experience` links a certificate to an Experience entry: same company, and a
 * role that contains `roleIncludes` (case-insensitive), so small wording edits
 * to the role in the dashboard don't break the link.
 */

export const CERTIFICATE_GROUPS = [
  { id: "work", label: "Work & teaching" },
  { id: "organisation", label: "Organisations & activities" },
];

export const CERTIFICATES = [
  {
    id: "softwareseni-start",
    group: "work",
    title: "START Bootcamp — Certificate of Completion",
    issuer: "SoftwareSeni",
    date: "Aug 2025",
    summary: "SoftwareSeni Training for Accelerated Talent, 19 May – 18 Aug 2025.",
    experience: { company: "SoftwareSeni", roleIncludes: "bootcamp" },
    pages: [
      {
        src: "/certificates/softwareseni-start-2025.webp",
        width: 1400,
        height: 991,
        caption: "Completed 19 May – 18 August 2025",
      },
    ],
  },
  {
    id: "lab-assistant",
    group: "work",
    title: "Lab Assistant",
    issuer: "Informatics Computer Lab, Ahmad Dahlan University",
    date: "2022 – 2024",
    summary: "Five courses over three semesters: Informatics Statistics, Algorithm Strategy, Multimedia Technology, Data Visualization, Deep Learning.",
    experience: { company: "Ahmad Dahlan University", roleIncludes: "lab assistant" },
    pages: [
      {
        src: "/certificates/lab-assistant-2022-odd.webp",
        width: 1400,
        height: 991,
        caption: "Odd semester 2022/2023",
        courses: [{ name: "Informatics Statistics", lab: "Intelligent Systems Lab" }],
      },
      {
        src: "/certificates/lab-assistant-2022-even.webp",
        width: 1400,
        height: 991,
        caption: "Even semester 2022/2023",
        courses: [{ name: "Algorithm Strategy", lab: "Basic Computing Lab" }],
      },
      {
        src: "/certificates/lab-assistant-2023-even.webp",
        width: 1400,
        height: 991,
        caption: "Even semester 2023/2024",
        courses: [
          { name: "Algorithm Strategy", lab: "Basic Computing Lab" },
          { name: "Multimedia Technology", lab: "Networking Lab" },
          { name: "Data Visualization", lab: "Basic Computing Lab" },
          { name: "Deep Learning", lab: "Basic Computing Lab" },
        ],
      },
    ],
  },
  {
    id: "hmif-kominfo",
    group: "organisation",
    title: "Staff, Communication & Information Department",
    issuer: "Informatics Student Association (HMIF), Ahmad Dahlan University",
    date: "2022 – 2023",
    pages: [
      {
        src: "/certificates/hmif-kominfo-2022.webp",
        width: 1400,
        height: 1050,
        caption: "Board term 2022/2023",
      },
    ],
  },
  {
    id: "aiesec-future-leaders",
    group: "organisation",
    title: "Delegate, AIESEC Future Leaders",
    issuer: "AIESEC in UGM",
    date: "2022",
    pages: [
      {
        src: "/certificates/aiesec-future-leaders-2022.webp",
        width: 1400,
        height: 991,
        caption: "Certificate of appreciation, AIESEC Future Leaders 2022",
      },
    ],
  },
  {
    id: "hmtif-kewirausahaan",
    group: "organisation",
    title: "Staff, Entrepreneurship Department",
    issuer: "Informatics Engineering Student Association (HMTIF), Ahmad Dahlan University",
    date: "2021 – 2022",
    pages: [
      {
        src: "/certificates/hmtif-kewirausahaan-2021.webp",
        width: 1400,
        height: 1050,
        caption: "Board term 2021/2022",
      },
    ],
  },
  {
    id: "p2k-committee",
    group: "organisation",
    title: "Faculty Committee, New Student Orientation (P2K)",
    issuer: "Ahmad Dahlan University",
    date: "Sep 2021",
    pages: [
      {
        src: "/certificates/p2k-panitia-fakultas-2021.webp",
        width: 1400,
        height: 991,
        caption: "Campus orientation programme, 6 – 18 September 2021",
      },
    ],
  },
];

/**
 * Certificates that belong to one Experience entry.
 * @param {{ company?: string, role?: string }} exp
 */
export function certificatesForExperience(exp) {
  const role = (exp.role ?? "").toLowerCase();
  return CERTIFICATES.filter(
    (cert) =>
      cert.experience &&
      cert.experience.company === exp.company &&
      role.includes(cert.experience.roleIncludes)
  );
}
