import type { HeroSettingsConfig } from "../../../shared/types/heroSettings";
import type { AboutSettingsConfig } from "../../../shared/types/aboutSettings";

// ─── Row Types ────────────────────────────────────────────────────────────────

export interface HeroRow {
  id: number;
  greeting: string | null;
  job_title: string | null;
  welcome_title: string | null;
  welcome_text: string | null;
  hero_image_url: string | null;
  hero_image_alt: string | null;
}

export interface AboutRow {
  id: number;
  heading: string | null;
  tagline: string | null;
  body: string | null;
  image_url: string | null;
  image_alt: string | null;
}

export interface SocialRow {
  id: number;
  label: string;
  href: string;
  icon: string;
  sort_order: number;
  active: boolean;
}

export interface ShowcaseRow {
  id: number;
  status: "current" | "future";
  header_title: string;
  project_title: string;
  description: string;
  image_url: string;
  image_alt: string;
  image_title: string | null;
  tags: unknown;
  sort_order: number;
  active: boolean;
}

export interface SkillCategoryRow {
  id: number;
  title: string;
  sort_order: number;
  active: boolean;
}

export interface SkillItemRow {
  id: number;
  category_id: number;
  label: string;
  icon_key: string;
  text_color: string | null;
  bg_color: string | null;
  sort_order: number;
  active: boolean;
}

export interface AppConfigRow {
  app: string;
  namespace: string;
  config: unknown;
}

// ─── Composite Types ──────────────────────────────────────────────────────────

export interface SkillsDraft {
  categories: SkillCategoryRow[];
  items: SkillItemRow[];
}

export type PortfolioTab = "Hero" | "About" | "Socials" | "Showcases" | "Skills";

// ─── Baseline Types ───────────────────────────────────────────────────────────

export interface HeroBaseline {
  hero: HeroRow;
  settings: HeroSettingsConfig;
}

export interface AboutBaseline {
  about: AboutRow;
  settings: AboutSettingsConfig;
}
