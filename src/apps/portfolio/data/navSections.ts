export const SECTION_IDS = [
  "hero",
  "about",
  "projects",
  "current",
  "future",
  "contact",
] as const;

export type SectionId = (typeof SECTION_IDS)[number];

export const NAV_LABELS: Record<SectionId, string> = {
  hero: "Hero",
  about: "About",
  projects: "Projects",
  current: "Current",
  future: "Future",
  contact: "Contact",
};

