import React, { useEffect, useRef, useState } from "react";
import { navigateTo } from "../../../lib/navigation";
import { useAuth } from "../lib/auth";
import LeadPage from "../pages/LeadPage";
import {
  supabaseGet,
  supabaseDelete,
  supabasePatch,
  supabaseUpsert,
} from "../../../lib/supabaseRest";
import {
  defaultHeroSettingsConfig,
  normalizeHeroSettingsConfig,
  type HeroSettingsConfig,
} from "../../../shared/types/heroSettings";
import {
  defaultAboutSettingsConfig,
  normalizeAboutSettingsConfig,
  type AboutSettingsConfig,
} from "../../../shared/types/aboutSettings";

// ─── Row Types ────────────────────────────────────────────────────────────────

type AboutRow = {
  id: number;
  heading: string | null;
  tagline: string | null;
  body: string | null;
  image_url: string | null;
  image_alt: string | null;
};

type HeroRow = {
  id: number;
  greeting: string | null;
  job_title: string | null;
  welcome_title: string | null;
  welcome_text: string | null;
  hero_image_url: string | null;
  hero_image_alt: string | null;
};

type AppConfigRow = {
  app: string;
  namespace: string;
  config: unknown;
};

type SocialRow = {
  id: number;
  label: string;
  href: string;
  icon: string;
  sort_order: number;
  active: boolean;
};

type ShowcaseRow = {
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
};

type SkillCategoryRow = {
  id: number;
  title: string;
  sort_order: number;
  active: boolean;
};

type SkillItemRow = {
  id: number;
  category_id: number;
  label: string;
  icon_key: string;
  text_color: string | null;
  bg_color: string | null;
  sort_order: number;
  active: boolean;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Require a valid accessToken or redirect to login. Returns null if invalid. */
const requireToken = async (
  getAccessToken: () => Promise<string | null>,
): Promise<string | null> => {
  const token = await getAccessToken();
  if (!token) {
    navigateTo("/login");
    return null;
  }
  return token;
};

/**
 * Compare baseline IDs with current IDs and delete any rows that were removed.
 * This is the core logic that ensures deletions reach the database.
 */
const syncDeletions = async <T extends { id: number }>(
  table: string,
  baseline: T[] | null,
  current: T[],
  accessToken: string,
) => {
  if (!baseline || baseline.length === 0) return;
  const currentIds = new Set(current.map((r) => r.id));
  const deletedIds = baseline.filter((r) => !currentIds.has(r.id)).map((r) => r.id);
  if (deletedIds.length === 0) return;
  await supabaseDelete(table, `id=in.(${deletedIds.join(",")})`, accessToken);
};

/**
 * Filter out "new" rows (client-generated IDs that are not in the database).
 * New rows use client-side generated IDs. We strip the `id` field from them
 * so Supabase uses its auto-increment, then upsert existing rows normally.
 */
const splitNewAndExisting = <T extends { id: number }>(
  rows: T[],
  baseline: T[] | null,
): { existing: T[]; newRows: Omit<T, "id">[] } => {
  const baseIds = new Set((baseline ?? []).map((r) => r.id));
  const existing: T[] = [];
  const newRows: Omit<T, "id">[] = [];
  for (const row of rows) {
    if (baseIds.has(row.id)) {
      existing.push(row);
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id: _id, ...rest } = row;
      newRows.push(rest);
    }
  }
  return { existing, newRows };
};

// ─── Component ────────────────────────────────────────────────────────────────

const LeadRoute: React.FC = () => {
  const auth = useAuth();

  const [busy, setBusy] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [hero, setHero] = useState<HeroRow | null>(null);
  const [heroSettings, setHeroSettings] = useState<HeroSettingsConfig>(defaultHeroSettingsConfig);
  const [about, setAbout] = useState<AboutRow | null>(null);
  const [aboutSettings, setAboutSettings] = useState<AboutSettingsConfig>(defaultAboutSettingsConfig);
  const [socials, setSocials] = useState<SocialRow[]>([]);
  const [showcases, setShowcases] = useState<ShowcaseRow[]>([]);
  const [skillCategories, setSkillCategories] = useState<SkillCategoryRow[]>([]);
  const [skillItems, setSkillItems] = useState<SkillItemRow[]>([]);
  const [skillsDraft, setSkillsDraft] = useState<{ categories: SkillCategoryRow[]; items: SkillItemRow[] }>({
    categories: [],
    items: [],
  });

  // ── Baselines (snapshot of DB state, used for dirty-check & deletion) ──
  const heroBaselineRef = useRef<{ hero: HeroRow; settings: HeroSettingsConfig } | null>(null);
  const aboutBaselineRef = useRef<{ about: AboutRow; settings: AboutSettingsConfig } | null>(null);
  const socialsBaselineRef = useRef<SocialRow[] | null>(null);
  const showcasesBaselineRef = useRef<ShowcaseRow[] | null>(null);
  const skillsBaselineRef = useRef<{ categories: SkillCategoryRow[]; items: SkillItemRow[] } | null>(null);

  // Expose as state so LeadPage can react to them for isDirty
  const [heroBaseline, _setHeroBaseline] = useState<typeof heroBaselineRef.current>(null);
  const [aboutBaseline, _setAboutBaseline] = useState<typeof aboutBaselineRef.current>(null);
  const [socialsBaseline, _setSocialsBaseline] = useState<SocialRow[] | null>(null);
  const [showcasesBaseline, _setShowcasesBaseline] = useState<ShowcaseRow[] | null>(null);
  const [skillsBaseline, _setSkillsBaseline] = useState<typeof skillsBaselineRef.current>(null);

  /** Set both ref (for save functions) and state (for LeadPage isDirty) */
  const setBaselines = (data: {
    hero?: HeroRow | null;
    heroSettings?: HeroSettingsConfig;
    about?: AboutRow | null;
    aboutSettings?: AboutSettingsConfig;
    socials?: SocialRow[];
    showcases?: ShowcaseRow[];
    skillsDraft?: { categories: SkillCategoryRow[]; items: SkillItemRow[] };
  }) => {
    if (data.hero && data.heroSettings) {
      const val = { hero: data.hero, settings: data.heroSettings };
      heroBaselineRef.current = val;
      _setHeroBaseline(val);
    }
    if (data.about && data.aboutSettings) {
      const val = { about: data.about, settings: data.aboutSettings };
      aboutBaselineRef.current = val;
      _setAboutBaseline(val);
    }
    if (data.socials) {
      const val = [...data.socials];
      socialsBaselineRef.current = val;
      _setSocialsBaseline(val);
    }
    if (data.showcases) {
      const val = [...data.showcases];
      showcasesBaselineRef.current = val;
      _setShowcasesBaseline(val);
    }
    if (data.skillsDraft) {
      const val = { ...data.skillsDraft };
      skillsBaselineRef.current = val;
      _setSkillsBaseline(val);
    }
  };

  // ── Auth guard ──
  useEffect(() => {
    if (auth.status === "anonymous" || auth.status === "member") {
      navigateTo("/login");
    }
  }, [auth.status]);

  // ── Specific Loaders ──
  const loadHeroData = async (accessToken: string) => {
    const heroRows = await supabaseGet<HeroRow[]>("hero_section", "id=eq.1", { accessToken, select: "*" });
    const heroData = heroRows[0] ?? null;
    
    let heroSettingsData = defaultHeroSettingsConfig();
    try {
      const cfgRows = await supabaseGet<AppConfigRow[]>("app_configs", "app=eq.portfolio&namespace=eq.hero", { accessToken, select: "app,namespace,config" });
      heroSettingsData = normalizeHeroSettingsConfig(cfgRows[0]?.config ?? null);
    } catch { /* ignore */ }

    setHero(heroData);
    setHeroSettings(heroSettingsData);
    setBaselines({ hero: heroData, heroSettings: heroSettingsData });
  };

  const loadAboutData = async (accessToken: string) => {
    const aboutRows = await supabaseGet<AboutRow[]>("about_section", "id=eq.1", { accessToken, select: "*" });
    const aboutData = aboutRows[0] ?? null;

    let aboutSettingsData = defaultAboutSettingsConfig();
    try {
      const cfgRows = await supabaseGet<AppConfigRow[]>("app_configs", "app=eq.portfolio&namespace=eq.about", { accessToken, select: "app,namespace,config" });
      aboutSettingsData = normalizeAboutSettingsConfig(cfgRows[0]?.config ?? null);
    } catch { /* ignore */ }

    setAbout(aboutData);
    setAboutSettings(aboutSettingsData);
    setBaselines({ about: aboutData, aboutSettings: aboutSettingsData });
  };

  const loadSocialsData = async (accessToken: string) => {
    const socialRows = await supabaseGet<SocialRow[]>("social_links", "order=sort_order.asc", { accessToken, select: "*" });
    setSocials(socialRows);
    setBaselines({ socials: socialRows });
  };

  const loadShowcasesData = async (accessToken: string) => {
    const showcaseRows = await supabaseGet<ShowcaseRow[]>("showcases", "order=status.asc,sort_order.asc", { accessToken, select: "*" });
    setShowcases(showcaseRows);
    setBaselines({ showcases: showcaseRows });
  };

  const loadSkillsData = async (accessToken: string) => {
    const cats = await supabaseGet<SkillCategoryRow[]>("skill_categories", "order=sort_order.asc", { accessToken, select: "*" });
    const items = await supabaseGet<SkillItemRow[]>("skill_items", "order=sort_order.asc", { accessToken, select: "*" });
    setSkillCategories(cats);
    setSkillItems(items);
    
    const draftData = { categories: cats, items: items };
    setSkillsDraft(draftData);
    setBaselines({ skillsDraft: draftData });
  };

  // ── Load All ──
  const loadAll = async () => {
    setError(null);
    if (!auth.configured) {
      setError(`Supabase env belum terdeteksi (${auth.envMode}). Missing: ${auth.envMissing.join(", ")}`);
      return;
    }

    const accessToken = await requireToken(auth.getAccessToken);
    if (!accessToken) return;

    setInitialLoading(true);
    try {
      await Promise.all([
        loadHeroData(accessToken),
        loadAboutData(accessToken),
        loadSocialsData(accessToken),
        loadShowcasesData(accessToken),
        loadSkillsData(accessToken),
      ]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat data.");
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    if (auth.status !== "admin") return;
    void loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.status]);

  // ── Save: Hero ──
  const saveHero = async () => {
    if (!hero) return;
    setError(null);
    const accessToken = await requireToken(auth.getAccessToken);
    if (!accessToken) return;
    setBusy(true);
    try {
      await supabasePatch<HeroRow[]>(
        "hero_section",
        "id=eq.1",
        {
          greeting: hero.greeting,
          job_title: hero.job_title,
          welcome_title: hero.welcome_title,
          welcome_text: hero.welcome_text,
          hero_image_url: hero.hero_image_url,
          hero_image_alt: hero.hero_image_alt,
        },
        accessToken,
      );

      const normalized = normalizeHeroSettingsConfig(heroSettings);
      await supabaseUpsert(
        "app_configs",
        [{ app: "portfolio", namespace: "hero", config: normalized }],
        accessToken,
        "app,namespace",
      );
      await loadHeroData(accessToken);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menyimpan Hero.");
    } finally {
      setBusy(false);
    }
  };

  // ── Save: About ──
  const saveAbout = async () => {
    if (!about) return;
    setError(null);
    const accessToken = await requireToken(auth.getAccessToken);
    if (!accessToken) return;
    setBusy(true);
    try {
      await supabasePatch<AboutRow[]>(
        "about_section",
        "id=eq.1",
        {
          heading: about.heading,
          tagline: about.tagline,
          body: about.body,
          image_url: about.image_url,
          image_alt: about.image_alt,
        },
        accessToken,
      );

      const normalized = normalizeAboutSettingsConfig(aboutSettings);
      await supabaseUpsert(
        "app_configs",
        [{ app: "portfolio", namespace: "about", config: normalized }],
        accessToken,
        "app,namespace",
      );
      await loadAboutData(accessToken);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menyimpan About.");
    } finally {
      setBusy(false);
    }
  };

  // ── Save: Socials ──
  const saveSocials = async () => {
    setError(null);
    const accessToken = await requireToken(auth.getAccessToken);
    if (!accessToken) return;
    setBusy(true);
    try {
      // 1. Delete removed items
      await syncDeletions("social_links", socialsBaselineRef.current, socials, accessToken);

      // 2. Split new vs existing rows
      const { existing, newRows } = splitNewAndExisting(socials, socialsBaselineRef.current);

      // 3. Upsert existing rows (update)
      if (existing.length > 0) {
        await supabaseUpsert("social_links", existing, accessToken, "id");
      }

      // 4. Insert new rows (without client-generated id)
      if (newRows.length > 0) {
        await supabaseUpsert("social_links", newRows, accessToken);
      }

      await loadSocialsData(accessToken);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menyimpan Social Links.");
    } finally {
      setBusy(false);
    }
  };

  // ── Save: Showcases ──
  const saveShowcases = async () => {
    setError(null);
    const accessToken = await requireToken(auth.getAccessToken);
    if (!accessToken) return;
    setBusy(true);
    try {
      // 1. Delete removed items
      await syncDeletions("showcases", showcasesBaselineRef.current, showcases, accessToken);

      // 2. Split new vs existing rows
      const { existing, newRows } = splitNewAndExisting(showcases, showcasesBaselineRef.current);

      // 3. Upsert existing rows
      if (existing.length > 0) {
        await supabaseUpsert("showcases", existing, accessToken, "id");
      }

      // 4. Insert new rows
      if (newRows.length > 0) {
        await supabaseUpsert("showcases", newRows, accessToken);
      }

      await loadShowcasesData(accessToken);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menyimpan Showcases.");
    } finally {
      setBusy(false);
    }
  };

  // ── Save: Skills ──
  const saveSkills = async () => {
    setError(null);
    const accessToken = await requireToken(auth.getAccessToken);
    if (!accessToken) return;
    setBusy(true);
    try {
      const parsedCategories = skillsDraft.categories;
      const parsedItems = skillsDraft.items;

      // Delete removed categories & items
      await syncDeletions("skill_items", skillsBaselineRef.current?.items || null, parsedItems, accessToken);
      await syncDeletions("skill_categories", skillsBaselineRef.current?.categories || null, parsedCategories, accessToken);

      const catsSplit = splitNewAndExisting(parsedCategories, skillsBaselineRef.current?.categories || null);
      const itemsSplit = splitNewAndExisting(parsedItems, skillsBaselineRef.current?.items || null);

      // Upsert existing categories first (items have FK reference)
      if (catsSplit.existing.length > 0) {
        await supabaseUpsert("skill_categories", catsSplit.existing, accessToken, "id");
      }
      if (catsSplit.newRows.length > 0) {
        await supabaseUpsert("skill_categories", catsSplit.newRows, accessToken);
      }
      
      // Upsert items
      if (itemsSplit.existing.length > 0) {
        await supabaseUpsert("skill_items", itemsSplit.existing, accessToken, "id");
      }
      if (itemsSplit.newRows.length > 0) {
        await supabaseUpsert("skill_items", itemsSplit.newRows, accessToken);
      }

      await loadSkillsData(accessToken);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menyimpan Skills.");
    } finally {
      setBusy(false);
    }
  };

  // ── Logout ──
  const onLogout = async () => {
    await auth.logout();
    navigateTo("/login");
  };

  if (auth.status !== "admin") return null;

  return (
    <LeadPage
      busy={busy}
      initialLoading={initialLoading}
      error={error}
      hero={hero}
      heroSettings={heroSettings}
      about={about}
      aboutSettings={aboutSettings}
      socials={socials}
      showcases={showcases}
      skillsDraft={skillsDraft}
      skillCounts={{
        categories: skillCategories.length,
        items: skillItems.length,
      }}
      setHero={setHero}
      setHeroSettings={setHeroSettings}
      setAbout={setAbout}
      setAboutSettings={setAboutSettings}
      setSocials={setSocials}
      setShowcases={setShowcases}
      setSkillsDraft={setSkillsDraft}
      onReload={loadAll}
      onLogout={onLogout}
      onViewSite={() => navigateTo("/")}
      onSaveHero={saveHero}
      onSaveAbout={saveAbout}
      onSaveSocials={saveSocials}
      onSaveShowcases={saveShowcases}
      onSaveSkills={saveSkills}
      heroBaseline={heroBaseline}
      aboutBaseline={aboutBaseline}
      socialsBaseline={socialsBaseline}
      showcasesBaseline={showcasesBaseline}
      skillsBaseline={skillsBaseline}
    />
  );
};

export default LeadRoute;
