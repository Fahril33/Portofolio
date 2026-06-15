import React, { useEffect, useState } from "react";
import "./styles/lead.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../lib/auth";
import {
  listStorageBuckets,
  type StorageBucket,
} from "../../../lib/supabaseRest";
import type {
  HeroRow,
  AboutRow,
  SocialRow,
  ShowcaseRow,
  SkillsDraft,
  PortfolioTab,
  HeroBaseline,
  AboutBaseline,
} from "../types/adminTypes";
import type { HeroSettingsConfig } from "../../../shared/types/heroSettings";
import type { AboutSettingsConfig } from "../../../shared/types/aboutSettings";

import LeadSidebar from "./lead-panels/LeadSidebar";
import LeadHeader from "./lead-panels/LeadHeader";
import HeroPanel from "./lead-panels/HeroPanel";
import AboutPanel from "./lead-panels/AboutPanel";
import SocialsPanel from "./lead-panels/SocialsPanel";
import ShowcasesPanel from "./lead-panels/ShowcasesPanel";
import SkillsPanel from "./lead-panels/SkillsPanel";

// ─── Props ────────────────────────────────────────────────────────────────────

export interface LeadPageProps {
  busy: boolean;
  initialLoading: boolean;
  error: string | null;
  hero: HeroRow | null;
  heroSettings: HeroSettingsConfig;
  about: AboutRow | null;
  aboutSettings: AboutSettingsConfig;
  socials: SocialRow[];
  showcases: ShowcaseRow[];
  skillsDraft: SkillsDraft;
  skillCounts: { categories: number; items: number };
  setHero: React.Dispatch<React.SetStateAction<HeroRow | null>>;
  setHeroSettings: React.Dispatch<React.SetStateAction<HeroSettingsConfig>>;
  setAbout: React.Dispatch<React.SetStateAction<AboutRow | null>>;
  setAboutSettings: React.Dispatch<React.SetStateAction<AboutSettingsConfig>>;
  setSocials: React.Dispatch<React.SetStateAction<SocialRow[]>>;
  setShowcases: React.Dispatch<React.SetStateAction<ShowcaseRow[]>>;
  setSkillsDraft: React.Dispatch<React.SetStateAction<SkillsDraft>>;
  onReload: () => Promise<void>;
  onLogout: () => Promise<void>;
  onViewSite: () => void;
  onSaveHero: () => Promise<void>;
  onSaveAbout: () => Promise<void>;
  onSaveSocials: () => Promise<void>;
  onSaveShowcases: () => Promise<void>;
  onSaveSkills: () => Promise<void>;
  heroBaseline: HeroBaseline | null;
  aboutBaseline: AboutBaseline | null;
  socialsBaseline: SocialRow[] | null;
  showcasesBaseline: ShowcaseRow[] | null;
  skillsBaseline: SkillsDraft | null;
}

// ─── Component ────────────────────────────────────────────────────────────────

const LeadPage: React.FC<LeadPageProps> = ({
  busy,
  initialLoading,
  error,
  hero,
  heroSettings,
  about,
  aboutSettings,
  socials,
  showcases,
  skillsDraft,
  skillCounts,
  setHero,
  setHeroSettings,
  setAbout,
  setAboutSettings,
  setSocials,
  setShowcases,
  setSkillsDraft,
  onReload,
  onLogout,
  onViewSite,
  onSaveHero,
  onSaveAbout,
  onSaveSocials,
  onSaveShowcases,
  onSaveSkills,
  heroBaseline,
  aboutBaseline,
  socialsBaseline,
  showcasesBaseline,
  skillsBaseline,
}): React.ReactElement | null => {
  const auth = useAuth();
  const [activeProject, setActiveProject] = useState("Portfolio");
  const [activeTab, setActiveTab] = useState<PortfolioTab>("Hero");

  // ── Storage buckets (shared resource for Hero & About panels) ──
  const [storageBuckets, setStorageBuckets] = useState<StorageBucket[]>([]);

  useEffect(() => {
    if (storageBuckets.length > 0) return;
    let cancelled = false;
    const load = async (): Promise<void> => {
      try {
        const token = await auth.getAccessToken();
        if (!token) return;
        const buckets = await listStorageBuckets(token);
        if (cancelled) return;
        setStorageBuckets(buckets);
      } catch {
        // ignore; picker will still work if user knows bucket name
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [auth, storageBuckets.length]);

  // ── Connection status helper ──
  const getConnectionStatus = (tab: PortfolioTab): boolean => {
    if (error) return false;
    switch (tab) {
      case "Hero": return hero !== null;
      case "About": return about !== null;
      case "Socials": return Array.isArray(socials);
      case "Showcases": return Array.isArray(showcases);
      case "Skills": return typeof skillsDraft === "object" && skillsDraft !== null;
      default: return false;
    }
  };

  // ── Loading state ──
  if (initialLoading) {
    return (
      <main className="leadShell" style={{ display: "flex", justifyContent: "center", alignItems: "center", color: "var(--accent-color)" }}>
        <h2>Memuat Dashboard...</h2>
      </main>
    );
  }

  return (
    <main className="leadShell">
      <LeadSidebar
        activeProject={activeProject}
        onSelectProject={setActiveProject}
        onViewSite={onViewSite}
        onLogout={onLogout}
      />

      <section className="leadMain">
        <LeadHeader
          activeProject={activeProject}
          activeTab={activeTab}
          busy={busy}
          onReload={onReload}
          onSelectTab={setActiveTab}
          getConnectionStatus={getConnectionStatus}
        />

        <div className="leadContainer">
          <div className="editPanel">
            {activeTab === "Hero" && hero && (
              <HeroPanel
                hero={hero}
                heroSettings={heroSettings}
                busy={busy}
                storageBuckets={storageBuckets}
                baseline={heroBaseline}
                setHero={setHero}
                setHeroSettings={setHeroSettings}
                onSave={onSaveHero}
                getAccessToken={auth.getAccessToken}
              />
            )}

            {activeTab === "About" && about && (
              <AboutPanel
                about={about}
                aboutSettings={aboutSettings}
                busy={busy}
                storageBuckets={storageBuckets}
                baseline={aboutBaseline}
                setAbout={setAbout}
                setAboutSettings={setAboutSettings}
                onSave={onSaveAbout}
                getAccessToken={auth.getAccessToken}
              />
            )}

            {activeTab === "Socials" && (
              <SocialsPanel
                socials={socials}
                busy={busy}
                baseline={socialsBaseline}
                setSocials={setSocials}
                onSave={onSaveSocials}
              />
            )}

            {activeTab === "Showcases" && (
              <ShowcasesPanel
                showcases={showcases}
                skillItems={skillsDraft.items}
                busy={busy}
                baseline={showcasesBaseline}
                setShowcases={setShowcases}
                onSave={onSaveShowcases}
              />
            )}

            {activeTab === "Skills" && (
              <SkillsPanel
                skillsDraft={skillsDraft}
                skillCounts={skillCounts}
                busy={busy}
                baseline={skillsBaseline}
                setSkillsDraft={setSkillsDraft}
                onSave={onSaveSkills}
              />
            )}
          </div>

          {error && (
            <div className="errorBox">
              <FontAwesomeIcon icon={faInfoCircle} style={{ marginRight: 8 }} />
              <strong>Error:</strong> {error}
            </div>
          )}
        </div>
      </section>
    </main>
  );
};

export default LeadPage;
