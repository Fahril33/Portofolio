import React, { useEffect, useMemo, useState } from "react";
import "./styles/lead.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faStar,
  faShareAlt,
  faImages,
  faCode,
  faSignOutAlt,
  faExternalLinkAlt,
  faBriefcase,
  faPlus,
  faSync,
  faChevronRight,
  faInfoCircle,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../lib/auth";
import TripleProgressButton from "../../../shared/ui/TripleProgressButton";
import { type HeroSettingsConfig } from "../../../shared/types/heroSettings";
import {
  listStorageBuckets,
  type StorageBucket,
} from "../../../lib/supabaseRest";
import StorageImagePicker from "../../../shared/ui/StorageImagePicker";
import BrickListInput, { type BrickItem } from "../../../shared/ui/BrickListInput";
import { type AboutSettingsConfig } from "../../../shared/types/aboutSettings";
import DbStatusIndicator from "../../../shared/ui/DbStatusIndicator";

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

type LeadPageProps = {
  busy: boolean;
  initialLoading: boolean;
  error: string | null;
  hero: HeroRow | null;
  heroSettings: HeroSettingsConfig;
  about: AboutRow | null;
  aboutSettings: AboutSettingsConfig;
  socials: SocialRow[];
  showcases: ShowcaseRow[];
  skillsDraft: { categories: SkillCategoryRow[]; items: SkillItemRow[] };
  skillCounts: { categories: number; items: number };
  setHero: React.Dispatch<React.SetStateAction<HeroRow | null>>;
  setHeroSettings: React.Dispatch<React.SetStateAction<HeroSettingsConfig>>;
  setAbout: React.Dispatch<React.SetStateAction<AboutRow | null>>;
  setAboutSettings: React.Dispatch<React.SetStateAction<AboutSettingsConfig>>;
  setSocials: React.Dispatch<React.SetStateAction<SocialRow[]>>;
  setShowcases: React.Dispatch<React.SetStateAction<ShowcaseRow[]>>;
  setSkillsDraft: React.Dispatch<
    React.SetStateAction<{ categories: SkillCategoryRow[]; items: SkillItemRow[] }>
  >;
  onReload: () => Promise<void>;
  onLogout: () => Promise<void>;
  onViewSite: () => void;
  onSaveHero: () => Promise<void>;
  onSaveAbout: () => Promise<void>;
  onSaveSocials: () => Promise<void>;
  onSaveShowcases: () => Promise<void>;
  onSaveSkills: () => Promise<void>;

  heroBaseline: { hero: HeroRow; settings: HeroSettingsConfig } | null;
  aboutBaseline: { about: AboutRow; settings: AboutSettingsConfig } | null;
  socialsBaseline: SocialRow[] | null;
  showcasesBaseline: ShowcaseRow[] | null;
  skillsBaseline: { categories: SkillCategoryRow[]; items: SkillItemRow[] } | null;
};

type PortfolioTab = "Hero" | "About" | "Socials" | "Showcases" | "Skills";

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
}) => {
  const auth = useAuth();
  const [activeProject, setActiveProject] = useState("Portfolio");
  const [activeTab, setActiveTab] = useState<PortfolioTab>("Hero");

  const heroIsDirty = useMemo(() => {
    if (!heroBaseline) return false;
    const heroDirty = JSON.stringify(hero) !== JSON.stringify(heroBaseline.hero);
    const settingsDirty = JSON.stringify(heroSettings) !== JSON.stringify(heroBaseline.settings);
    return heroDirty || settingsDirty;
  }, [hero, heroSettings, heroBaseline]);

  const resetHeroDraft = () => {
    if (!heroBaseline) return;
    setHero(heroBaseline.hero);
    setHeroSettings(heroBaseline.settings);
  };

  const [storageBuckets, setStorageBuckets] = useState<StorageBucket[]>([]);

  useEffect(() => {
    if (storageBuckets.length > 0) return;
    let cancelled = false;
    const load = async () => {
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

  const aboutIsDirty = useMemo(() => {
    if (!aboutBaseline) return false;
    const aboutDirty = JSON.stringify(about) !== JSON.stringify(aboutBaseline.about);
    const settingsDirty = JSON.stringify(aboutSettings) !== JSON.stringify(aboutBaseline.settings);
    return aboutDirty || settingsDirty;
  }, [about, aboutSettings, aboutBaseline]);

  const resetAboutDraft = () => {
    if (!aboutBaseline) return;
    setAbout(aboutBaseline.about);
    setAboutSettings(aboutBaseline.settings);
  };

  const socialsIsDirty = useMemo(() => {
    if (!socialsBaseline) return false;
    return JSON.stringify(socials) !== JSON.stringify(socialsBaseline);
  }, [socials, socialsBaseline]);

  const resetSocialsDraft = () => {
    if (!socialsBaseline) return;
    setSocials([...socialsBaseline]);
  };

  const showcasesIsDirty = useMemo(() => {
    if (!showcasesBaseline) return false;
    return JSON.stringify(showcases) !== JSON.stringify(showcasesBaseline);
  }, [showcases, showcasesBaseline]);

  const resetShowcasesDraft = () => {
    if (!showcasesBaseline) return;
    setShowcases([...showcasesBaseline]);
  };

  const skillsIsDirty = useMemo(() => {
    if (!skillsBaseline) return false;
    return JSON.stringify(skillsDraft) !== JSON.stringify(skillsBaseline);
  }, [skillsDraft, skillsBaseline]);

  const resetSkillsDraft = () => {
    if (!skillsBaseline) return;
    setSkillsDraft({ ...skillsBaseline });
  };

  const HERO_FIXED_PREFIX = "hero/";
  const ABOUT_FIXED_PREFIX = "about/";

  const typewriterBrickItems = useMemo<BrickItem[]>(() => {
    return (heroSettings.typewriter.texts ?? []).map((t, idx) => ({
      id: `t${idx}`,
      label: t,
    }));
  }, [heroSettings.typewriter.texts]);

  const typewriterSelectedId = useMemo(() => {
    const idx = heroSettings.typewriter.defaultIndex ?? 0;
    return `t${Math.max(0, Math.floor(idx))}`;
  }, [heroSettings.typewriter.defaultIndex]);

  const projects = [
    { name: "Portfolio", icon: faBriefcase, enabled: true },
    { name: "Quick Notes", icon: faCode, enabled: false },
    { name: "Quick Math", icon: faPlus, enabled: false },
  ];

  const tabs: { label: PortfolioTab; icon: any }[] = [
    { label: "Hero", icon: faStar },
    { label: "About", icon: faUser },
    { label: "Socials", icon: faShareAlt },
    { label: "Showcases", icon: faImages },
    { label: "Skills", icon: faCode },
  ];

  const getConnectionStatus = (tab: PortfolioTab) => {
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

  if (initialLoading) {
    return (
      <main className="leadShell" style={{ display: "flex", justifyContent: "center", alignItems: "center", color: "var(--accent-color)" }}>
        <h2>Memuat Dashboard...</h2>
      </main>
    );
  }

  return (
    <main className="leadShell">
      {/* Sidebar */}
      <aside className="leadSidebar">
        <div className="sidebarBrand">
          <h2>Admin Center</h2>
        </div>
        <nav className="sidebarMenu">
          {projects.map((p) => (
            <div
              key={p.name}
              className={`sidebarItem ${activeProject === p.name ? "active" : ""} ${
                !p.enabled ? "disabled" : ""
              }`}
              onClick={() => p.enabled && setActiveProject(p.name)}
            >
              <div className="sidebarItemContent">
                <FontAwesomeIcon icon={p.icon} fixedWidth />
                <span>{p.name}</span>
              </div>
              {p.enabled && (
                <div
                  className="sidebarItemAction"
                  title="View Site"
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewSite();
                  }}
                >
                  <FontAwesomeIcon
                    icon={faExternalLinkAlt}
                    style={{ fontSize: "0.8rem" }}
                  />
                </div>
              )}
            </div>
          ))}
        </nav>
        <div className="sidebarFooter">
          <button className="btn btnLogout" onClick={() => void onLogout()}>
            <FontAwesomeIcon icon={faSignOutAlt} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Section */}
      <section className="leadMain">
        <header className="leadHeader">
          <div className="breadcrumb">
            <span>Projects</span>
            <FontAwesomeIcon
              icon={faChevronRight}
              style={{ fontSize: "0.7rem" }}
            />
            <span>{activeProject}</span>
            <FontAwesomeIcon
              icon={faChevronRight}
              style={{ fontSize: "0.7rem" }}
            />
            <span style={{ color: "var(--accent-color)" }}>{activeTab}</span>
          </div>
          <div className="headerActions">
            <button
              className="btn thin"
              onClick={() => void onReload()}
              disabled={busy}
            >
              <FontAwesomeIcon icon={faSync} spin={busy} />
              <span>Reload</span>
            </button>
          </div>
        </header>

        {/* Portfolio Specific Tabs */}
        {activeProject === "Portfolio" && (
          <nav className="portfolioTabs">
            {tabs.map((t) => (
              <div
                key={t.label}
                className={`tabItem ${activeTab === t.label ? "active" : ""}`}
                onClick={() => setActiveTab(t.label)}
                style={{ display: "flex", alignItems: "center" }}
              >
                <FontAwesomeIcon icon={t.icon} style={{ marginRight: 8 }} />
                <span>{t.label}</span>
                <DbStatusIndicator isConnected={getConnectionStatus(t.label)} showLabel={false} />
              </div>
            ))}
          </nav>
        )}

        <div className="leadContainer">
          <div className="editPanel">
            {activeTab === "Hero" && hero && (
              <div className="formGrid">
                <div className="formField">
                  <label>Greeting</label>
                  <input
                    value={hero.greeting ?? ""}
                    onChange={(e) =>
                      setHero({ ...hero, greeting: e.target.value })
                    }
                  />
                </div>
                <div className="formField">
                  <label>Job Title</label>
                  <input
                    value={hero.job_title ?? ""}
                    onChange={(e) =>
                      setHero({ ...hero, job_title: e.target.value })
                    }
                  />
                </div>

                <hr className="settingsHr" />

                <div className="formField fullWidth">
                  <label>Typewriter</label>
                  <div className="toggleRow">
                    <label className="inlineToggle">
                      <input
                        type="checkbox"
                        checked={heroSettings.typewriter.enabled}
                        onChange={(e) =>
                          setHeroSettings((prev) => ({
                            ...prev,
                            typewriter: {
                              ...prev.typewriter,
                              enabled: e.target.checked,
                            },
                          }))
                        }
                      />
                      Enable
                    </label>
                    <label className="inlineToggle">
                      <input
                        type="checkbox"
                        checked={heroSettings.typewriter.rotate}
                        disabled={!heroSettings.typewriter.enabled}
                        onChange={(e) =>
                          setHeroSettings((prev) => ({
                            ...prev,
                            typewriter: {
                              ...prev.typewriter,
                              rotate: e.target.checked,
                            },
                          }))
                        }
                      />
                      Rotate
                    </label>
                    <label className="inlineToggle">
                      <input
                        type="checkbox"
                        checked={heroSettings.typewriter.loop}
                        disabled={!heroSettings.typewriter.enabled || !heroSettings.typewriter.rotate}
                        onChange={(e) =>
                          setHeroSettings((prev) => ({
                            ...prev,
                            typewriter: {
                              ...prev.typewriter,
                              loop: e.target.checked,
                            },
                          }))
                        }
                      />
                      Loop
                    </label>
                  </div>
                </div>

                <BrickListInput
                  label="Texts (click a brick to set default)"
                  items={typewriterBrickItems}
                  selectedId={typewriterSelectedId}
                  onSelect={(id) => {
                    const idx = Number(id.replace(/^t/, ""));
                    if (!Number.isFinite(idx)) return;
                    setHeroSettings((prev) => ({
                      ...prev,
                      typewriter: { ...prev.typewriter, defaultIndex: idx },
                    }));
                  }}
                  onAdd={(label) => {
                    setHeroSettings((prev) => {
                      const nextTexts = [...prev.typewriter.texts, label];
                      const nextDefault =
                        prev.typewriter.texts.length === 0 ? 0 : prev.typewriter.defaultIndex;
                      return {
                        ...prev,
                        typewriter: {
                          ...prev.typewriter,
                          texts: nextTexts,
                          defaultIndex: Math.max(0, Math.min(nextTexts.length - 1, nextDefault)),
                        },
                      };
                    });
                  }}
                  onDelete={(id) => {
                    const idx = Number(id.replace(/^t/, ""));
                    if (!Number.isFinite(idx)) return;
                    setHeroSettings((prev) => {
                      const nextTexts = prev.typewriter.texts.filter((_, i) => i !== idx);
                      const nextDefault = Math.max(
                        0,
                        Math.min(nextTexts.length - 1, prev.typewriter.defaultIndex),
                      );
                      return {
                        ...prev,
                        typewriter: {
                          ...prev.typewriter,
                          texts: nextTexts.length > 0 ? nextTexts : prev.typewriter.texts,
                          defaultIndex: nextDefault,
                        },
                      };
                    });
                  }}
                />

                <div className="formField">
                  <label>Typing (ms)</label>
                  <input
                    type="number"
                    value={heroSettings.typewriter.typingMs}
                    min={10}
                    step={10}
                    onChange={(e) =>
                      setHeroSettings((prev) => ({
                        ...prev,
                        typewriter: {
                          ...prev.typewriter,
                          typingMs: Number(e.target.value) || 0,
                        },
                      }))
                    }
                  />
                </div>

                <div className="formField">
                  <label>Deleting (ms)</label>
                  <input
                    type="number"
                    value={heroSettings.typewriter.deletingMs}
                    min={10}
                    step={10}
                    onChange={(e) =>
                      setHeroSettings((prev) => ({
                        ...prev,
                        typewriter: {
                          ...prev.typewriter,
                          deletingMs: Number(e.target.value) || 0,
                        },
                      }))
                    }
                  />
                </div>

                <div className="formField">
                  <label>Pause (ms)</label>
                  <input
                    type="number"
                    value={heroSettings.typewriter.pauseMs}
                    min={0}
                    step={50}
                    onChange={(e) =>
                      setHeroSettings((prev) => ({
                        ...prev,
                        typewriter: {
                          ...prev.typewriter,
                          pauseMs: Number(e.target.value) || 0,
                        },
                      }))
                    }
                  />
                </div>

                <hr className="settingsHr" />

                <div className="formField fullWidth">
                  <label>Welcome Popup</label>
                  <div className="toggleRow">
                    <label className="inlineToggle">
                      <input
                        type="checkbox"
                        checked={heroSettings.welcomeAlert.enabled}
                        onChange={(e) =>
                          setHeroSettings((prev) => ({
                            ...prev,
                            welcomeAlert: { ...prev.welcomeAlert, enabled: e.target.checked },
                          }))
                        }
                      />
                      Active
                    </label>
                  </div>
                </div>

                <div className="formField">
                  <label>Welcome Title (Alert)</label>
                  <input
                    value={hero.welcome_title ?? ""}
                    onChange={(e) =>
                      setHero({ ...hero, welcome_title: e.target.value })
                    }
                  />
                </div>
                <div className="formField fullWidth">
                  <label>Welcome Text (Alert)</label>
                  <textarea
                    value={hero.welcome_text ?? ""}
                    onChange={(e) =>
                      setHero({ ...hero, welcome_text: e.target.value })
                    }
                  />
                </div>

                <hr className="settingsHr" />

                <div className="formField fullWidth">
                  <label>Hero Image</label>
                  <div className="toggleRow">
                    <label className="inlineToggle">
                      <input
                        type="checkbox"
                        checked={heroSettings.heroImage.enabled}
                        onChange={(e) =>
                          setHeroSettings((prev) => ({
                            ...prev,
                            heroImage: { ...prev.heroImage, enabled: e.target.checked },
                          }))
                        }
                      />
                      Show image
                    </label>
                    <div style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
                      <label className="inlineToggle">
                        Position
                        <select
                          value={heroSettings.heroImage.position}
                          onChange={(e) =>
                            setHeroSettings((prev) => ({
                              ...prev,
                              heroImage: {
                                ...prev.heroImage,
                                position: e.target.value === "right" ? "right" : "left",
                              },
                            }))
                          }
                        >
                          <option value="left">left</option>
                          <option value="right">right</option>
                        </select>
                      </label>
                      <label className="inlineToggle">
                        Source
                        <select
                          value={heroSettings.heroImage.source}
                          onChange={(e) =>
                            setHeroSettings((prev) => ({
                              ...prev,
                              heroImage: {
                                ...prev.heroImage,
                                source: e.target.value === "storage" ? "storage" : "url",
                              },
                            }))
                          }
                        >
                          <option value="url">url</option>
                          <option value="storage">storage</option>
                        </select>
                      </label>
                    </div>
                  </div>
                </div>

                {heroSettings.heroImage.source === "url" ? (
                  <>
                    <div className="formField fullWidth">
                      <label>Image URL (Override)</label>
                      <input
                        value={heroSettings.heroImage.url}
                        onChange={(e) =>
                          setHeroSettings((prev) => ({
                            ...prev,
                            heroImage: { ...prev.heroImage, url: e.target.value },
                          }))
                        }
                        placeholder="https://..."
                      />
                    </div>
                    <div className="formField fullWidth">
                      <label>Alt</label>
                      <input
                        value={heroSettings.heroImage.alt}
                        onChange={(e) =>
                          setHeroSettings((prev) => ({
                            ...prev,
                            heroImage: { ...prev.heroImage, alt: e.target.value },
                          }))
                        }
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="formField">
                      <label>Bucket</label>
                      <select
                        value={heroSettings.heroImage.storage.bucket}
                        onChange={(e) => {
                          const bucketName = e.target.value;
                          const bucket = storageBuckets.find((b) => b.name === bucketName);
                          const isPublic = bucket?.public ?? true;
                          setHeroSettings((prev) => ({
                            ...prev,
                            heroImage: {
                              ...prev.heroImage,
                              storage: {
                                ...prev.heroImage.storage,
                                bucket: bucketName,
                                path: "",
                                isPublic,
                              },
                            },
                          }));
                        }}
                      >
                        <option value="">(select)</option>
                        {storageBuckets.map((b) => (
                          <option key={b.id ?? b.name} value={b.name}>
                            {b.name} {b.public ? "(public)" : "(private)"}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="formField">
                      <label>Folder (fixed)</label>
                      <input value={HERO_FIXED_PREFIX} readOnly />
                    </div>

                    <div className="formField">
                      <label>Bucket Public</label>
                      <select
                        value={heroSettings.heroImage.storage.isPublic ? "true" : "false"}
                        onChange={(e) =>
                          setHeroSettings((prev) => ({
                            ...prev,
                            heroImage: {
                              ...prev.heroImage,
                              storage: { ...prev.heroImage.storage, isPublic: e.target.value === "true" },
                            },
                          }))
                        }
                      >
                        <option value="true">true</option>
                        <option value="false">false</option>
                      </select>
                    </div>

                    <StorageImagePicker
                      bucket={heroSettings.heroImage.storage.bucket}
                      fixedPrefix={HERO_FIXED_PREFIX}
                      isPublicBucket={heroSettings.heroImage.storage.isPublic}
                      selectedPath={heroSettings.heroImage.storage.path}
                      onSelectPath={(path) =>
                        setHeroSettings((prev) => ({
                          ...prev,
                          heroImage: {
                            ...prev.heroImage,
                            storage: { ...prev.heroImage.storage, path },
                          },
                        }))
                      }
                      getAccessToken={auth.getAccessToken}
                    />
                  </>
                )}

                <div className="formField">
                  <label>Width (px)</label>
                  <input
                    type="number"
                    value={heroSettings.heroImage.size.widthPx ?? ""}
                    onChange={(e) =>
                      setHeroSettings((prev) => ({
                        ...prev,
                        heroImage: {
                          ...prev.heroImage,
                          size: {
                            ...prev.heroImage.size,
                            widthPx: e.target.value === "" ? null : Number(e.target.value),
                          },
                        },
                      }))
                    }
                  />
                </div>

                <div className="formField">
                  <label>Height (px)</label>
                  <input
                    type="number"
                    value={heroSettings.heroImage.size.heightPx ?? ""}
                    onChange={(e) =>
                      setHeroSettings((prev) => ({
                        ...prev,
                        heroImage: {
                          ...prev.heroImage,
                          size: {
                            ...prev.heroImage.size,
                            heightPx: e.target.value === "" ? null : Number(e.target.value),
                          },
                        },
                      }))
                    }
                  />
                </div>

                <div className="formField">
                  <label>Object Fit</label>
                  <select
                    value={heroSettings.heroImage.size.objectFit}
                    onChange={(e) =>
                      setHeroSettings((prev) => ({
                        ...prev,
                        heroImage: {
                          ...prev.heroImage,
                          size: {
                            ...prev.heroImage.size,
                            objectFit: e.target.value as any,
                          },
                        },
                      }))
                    }
                  >
                    <option value="contain">contain</option>
                    <option value="cover">cover</option>
                    <option value="fill">fill</option>
                    <option value="none">none</option>
                    <option value="scale-down">scale-down</option>
                  </select>
                </div>

                <div className="formField fullWidth">
                  <label>Preview</label>
                  <div className="smallNote">
                    Preview untuk source <b>storage</b> ada di panel file picker (kanan). Untuk source{" "}
                    <b>url</b>, gambar akan langsung dipakai di halaman hero.
                  </div>
                </div>

                <div className="formField fullWidth">
                  <label>Fallback URL (legacy)</label>
                  <input
                    value={hero.hero_image_url ?? ""}
                    onChange={(e) => setHero({ ...hero, hero_image_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
                <div className="formField fullWidth">
                  <label>Fallback Alt (legacy)</label>
                  <input
                    value={hero.hero_image_alt ?? ""}
                    onChange={(e) => setHero({ ...hero, hero_image_alt: e.target.value })}
                  />
                </div>

                <div className="actionRow">
                  <button className="btn" onClick={resetHeroDraft} disabled={busy}>
                    Reset
                  </button>
                  <TripleProgressButton
                    label="Save Hero"
                    busy={busy}
                    disabled={busy}
                    isDirty={heroIsDirty}
                    onConfirm={onSaveHero}
                  />
                </div>
              </div>
            )}

            {activeTab === "About" && about && (
              <div className="formGrid">
                <div className="formField">
                  <label>Heading</label>
                  <input
                    value={about.heading ?? ""}
                    onChange={(e) =>
                      setAbout({ ...about, heading: e.target.value })
                    }
                  />
                </div>
                <div className="formField">
                  <label>Tagline</label>
                  <input
                    value={about.tagline ?? ""}
                    onChange={(e) =>
                      setAbout({ ...about, tagline: e.target.value })
                    }
                  />
                </div>
                <div className="formField fullWidth">
                  <label>Body Description</label>
                  <textarea
                    value={about.body ?? ""}
                    onChange={(e) =>
                      setAbout({ ...about, body: e.target.value })
                    }
                  />
                </div>

                <hr className="settingsHr" />

                <div className="formField fullWidth">
                  <label>About Image</label>
                  <div className="toggleRow">
                    <label className="inlineToggle">
                      <input
                        type="checkbox"
                        checked={aboutSettings.image.enabled}
                        onChange={(e) =>
                          setAboutSettings((prev) => ({
                            ...prev,
                            image: { ...prev.image, enabled: e.target.checked },
                          }))
                        }
                      />
                      Show image
                    </label>
                    <div style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
                      <label className="inlineToggle">
                        Source
                        <select
                          value={aboutSettings.image.source}
                          onChange={(e) =>
                            setAboutSettings((prev) => ({
                              ...prev,
                              image: {
                                ...prev.image,
                                source: e.target.value === "storage" ? "storage" : "url",
                              },
                            }))
                          }
                        >
                          <option value="url">url</option>
                          <option value="storage">storage</option>
                        </select>
                      </label>
                    </div>
                  </div>
                </div>

                {aboutSettings.image.source === "url" ? (
                  <>
                    <div className="formField fullWidth">
                      <label>Image URL (Override)</label>
                      <input
                        value={aboutSettings.image.url}
                        onChange={(e) =>
                          setAboutSettings((prev) => ({
                            ...prev,
                            image: { ...prev.image, url: e.target.value },
                          }))
                        }
                        placeholder="https://..."
                      />
                    </div>
                    <div className="formField fullWidth">
                      <label>Alt</label>
                      <input
                        value={aboutSettings.image.alt}
                        onChange={(e) =>
                          setAboutSettings((prev) => ({
                            ...prev,
                            image: { ...prev.image, alt: e.target.value },
                          }))
                        }
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="formField">
                      <label>Bucket</label>
                      <select
                        value={aboutSettings.image.storage.bucket}
                        onChange={(e) => {
                          const bucketName = e.target.value;
                          const bucket = storageBuckets.find((b) => b.name === bucketName);
                          const isPublic = bucket?.public ?? true;
                          setAboutSettings((prev) => ({
                            ...prev,
                            image: {
                              ...prev.image,
                              storage: {
                                ...prev.image.storage,
                                bucket: bucketName,
                                path: "",
                                isPublic,
                              },
                            },
                          }));
                        }}
                      >
                        <option value="">(select)</option>
                        {storageBuckets.map((b) => (
                          <option key={b.id ?? b.name} value={b.name}>
                            {b.name} {b.public ? "(public)" : "(private)"}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="formField">
                      <label>Folder (fixed)</label>
                      <input value={ABOUT_FIXED_PREFIX} readOnly />
                    </div>

                    <div className="formField">
                      <label>Bucket Public</label>
                      <select
                        value={aboutSettings.image.storage.isPublic ? "true" : "false"}
                        onChange={(e) =>
                          setAboutSettings((prev) => ({
                            ...prev,
                            image: {
                              ...prev.image,
                              storage: { ...prev.image.storage, isPublic: e.target.value === "true" },
                            },
                          }))
                        }
                      >
                        <option value="true">true</option>
                        <option value="false">false</option>
                      </select>
                    </div>

                    <StorageImagePicker
                      bucket={aboutSettings.image.storage.bucket}
                      fixedPrefix={ABOUT_FIXED_PREFIX}
                      isPublicBucket={aboutSettings.image.storage.isPublic}
                      selectedPath={aboutSettings.image.storage.path}
                      onSelectPath={(path) =>
                        setAboutSettings((prev) => ({
                          ...prev,
                          image: { ...prev.image, storage: { ...prev.image.storage, path } },
                        }))
                      }
                      getAccessToken={auth.getAccessToken}
                    />
                  </>
                )}

                <div className="formField">
                  <label>Width (px)</label>
                  <input
                    type="number"
                    value={aboutSettings.image.size.widthPx ?? ""}
                    onChange={(e) =>
                      setAboutSettings((prev) => ({
                        ...prev,
                        image: {
                          ...prev.image,
                          size: {
                            ...prev.image.size,
                            widthPx: e.target.value === "" ? null : Number(e.target.value),
                          },
                        },
                      }))
                    }
                  />
                </div>

                <div className="formField">
                  <label>Height (px)</label>
                  <input
                    type="number"
                    value={aboutSettings.image.size.heightPx ?? ""}
                    onChange={(e) =>
                      setAboutSettings((prev) => ({
                        ...prev,
                        image: {
                          ...prev.image,
                          size: {
                            ...prev.image.size,
                            heightPx: e.target.value === "" ? null : Number(e.target.value),
                          },
                        },
                      }))
                    }
                  />
                </div>

                <div className="formField">
                  <label>Object Fit</label>
                  <select
                    value={aboutSettings.image.size.objectFit}
                    onChange={(e) =>
                      setAboutSettings((prev) => ({
                        ...prev,
                        image: {
                          ...prev.image,
                          size: { ...prev.image.size, objectFit: e.target.value as any },
                        },
                      }))
                    }
                  >
                    <option value="cover">cover</option>
                    <option value="contain">contain</option>
                    <option value="fill">fill</option>
                    <option value="none">none</option>
                    <option value="scale-down">scale-down</option>
                  </select>
                </div>

                <div className="formField fullWidth">
                  <label>Fallback URL (legacy)</label>
                  <input
                    value={about.image_url ?? ""}
                    onChange={(e) => setAbout({ ...about, image_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
                <div className="formField fullWidth">
                  <label>Fallback Alt (legacy)</label>
                  <input
                    value={about.image_alt ?? ""}
                    onChange={(e) => setAbout({ ...about, image_alt: e.target.value })}
                  />
                </div>

                <div className="actionRow">
                  <button className="btn" onClick={resetAboutDraft} disabled={busy}>
                    Reset
                  </button>
                  <TripleProgressButton
                    label="Save About"
                    busy={busy}
                    disabled={busy}
                    isDirty={aboutIsDirty}
                    onConfirm={onSaveAbout}
                  />
                </div>
              </div>
            )}

            {activeTab === "Socials" && (
              <div className="listContainer">
                {socials.map((row, idx) => (
                  <div key={row.id} className="listItem">
                    <div className="listItemHeader">
                      <span className="listItemBadge">ID: {row.id}</span>
                      <div style={{ display: "inline-flex", gap: 10, alignItems: "center" }}>
                        <select
                          style={{ width: "auto" }}
                          value={row.active ? "true" : "false"}
                          onChange={(e) => {
                            const next = [...socials];
                            next[idx] = {
                              ...row,
                              active: e.target.value === "true",
                            };
                            setSocials(next);
                          }}
                        >
                          <option value="true">Active</option>
                          <option value="false">Inactive</option>
                        </select>
                        <button
                          type="button"
                          className="btn thin danger"
                          onClick={() => setSocials((prev) => prev.filter((_, i) => i !== idx))}
                          disabled={busy}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <div
                      className="formGrid"
                      style={{ gridTemplateColumns: "1fr 1fr 1fr" }}
                    >
                      <div className="formField">
                        <label>Label</label>
                        <input
                          value={row.label}
                          onChange={(e) => {
                            const next = [...socials];
                            next[idx] = { ...row, label: e.target.value };
                            setSocials(next);
                          }}
                        />
                      </div>
                      <div className="formField">
                        <label>URL</label>
                        <input
                          value={row.href}
                          onChange={(e) => {
                            const next = [...socials];
                            next[idx] = { ...row, href: e.target.value };
                            setSocials(next);
                          }}
                        />
                      </div>
                      <div className="formField">
                        <label>Icon Key</label>
                        <input
                          value={row.icon}
                          onChange={(e) => {
                            const next = [...socials];
                            next[idx] = { ...row, icon: e.target.value };
                            setSocials(next);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <div className="actionRow">
                  <button
                    className="btn"
                    onClick={() =>
                      setSocials((prev) => [
                        ...prev,
                        {
                          id: Math.max(0, ...prev.map((p) => p.id)) + 1,
                          label: "New",
                          href: "https://",
                          icon: "github",
                          sort_order: prev.length + 1,
                          active: true,
                        },
                      ])
                    }
                  >
                    <FontAwesomeIcon icon={faPlus} />
                    Add Link
                  </button>
                  <div style={{ marginLeft: "auto", display: "flex", gap: 12 }}>
                    <button className="btn" onClick={resetSocialsDraft} disabled={busy}>
                      Reset
                    </button>
                    <TripleProgressButton
                      label="Save Socials"
                      busy={busy}
                      disabled={busy}
                      isDirty={socialsIsDirty}
                      onConfirm={onSaveSocials}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "Showcases" && (
              <div className="listContainer">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <h3 style={{ margin: 0, color: "var(--text-color)" }}>Works & Showcases</h3>
                  <button
                    className="btn"
                    onClick={() =>
                      setShowcases((prev) => [
                        ...prev,
                        {
                          id: Math.max(0, ...prev.map((p) => p.id)) + 1,
                          status: "current",
                          header_title: "New Project",
                          project_title: "Title",
                          description: "Description here...",
                          image_url: "",
                          image_alt: "",
                          image_title: "",
                          tags: [],
                          sort_order: prev.length + 1,
                          active: true,
                        },
                      ])
                    }
                  >
                    <FontAwesomeIcon icon={faPlus} /> Add Project
                  </button>
                </div>

                {showcases.map((row, idx) => (
                  <div key={row.id} className="listItem">
                    <div className="listItemHeader">
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <select
                          value={row.status}
                          onChange={(e) => {
                            const next = [...showcases];
                            next[idx] = { ...row, status: e.target.value as any };
                            setShowcases(next);
                          }}
                          style={{
                            background: row.status === "current" ? "#3ecf8e" : "#3178c6",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            padding: "2px 8px",
                            fontSize: "0.75rem",
                            fontWeight: "bold",
                            cursor: "pointer"
                          }}
                        >
                          <option value="current">CURRENT</option>
                          <option value="future">FUTURE</option>
                        </select>
                        <span style={{ fontWeight: 600 }}>{row.project_title || "Untitled"}</span>
                      </div>
                      <button
                        className="btn thin"
                        style={{ color: "var(--error-color)" }}
                        onClick={() => {
                          setShowcases(showcases.filter((_, i) => i !== idx));
                        }}
                        title="Hapus Project"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                    
                    <div className="formGrid">
                      <div className="formField">
                        <label>Project Title</label>
                        <input
                          value={row.project_title}
                          onChange={(e) => {
                            const next = [...showcases];
                            next[idx] = { ...row, project_title: e.target.value };
                            setShowcases(next);
                          }}
                        />
                      </div>
                      <div className="formField">
                        <label>Header Title</label>
                        <input
                          value={row.header_title}
                          onChange={(e) => {
                            const next = [...showcases];
                            next[idx] = { ...row, header_title: e.target.value };
                            setShowcases(next);
                          }}
                        />
                      </div>
                      <div className="formField fullWidth">
                        <label>Description</label>
                        <textarea
                          value={row.description}
                          onChange={(e) => {
                            const next = [...showcases];
                            next[idx] = { ...row, description: e.target.value };
                            setShowcases(next);
                          }}
                          style={{ minHeight: "80px" }}
                        />
                      </div>
                      <div className="formField">
                        <label>Image URL</label>
                        <input
                          value={row.image_url}
                          onChange={(e) => {
                            const next = [...showcases];
                            next[idx] = { ...row, image_url: e.target.value };
                            setShowcases(next);
                          }}
                        />
                      </div>
                      
                      <div className="formField fullWidth" style={{ gridColumn: "1 / -1" }}>
                        <label style={{ marginBottom: 12, display: 'block' }}>Linked Skills (Tags)</label>
                        <div style={{ 
                          display: 'grid', 
                          gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', 
                          gap: '10px', 
                          padding: '12px', 
                          background: 'rgba(255,255,255,0.05)', 
                          borderRadius: '8px',
                          border: '1px solid rgba(255,255,255,0.1)' 
                        }}>
                          {skillsDraft.items.map(skill => (
                            <label key={skill.id} style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '8px', 
                              cursor: 'pointer', 
                              fontSize: '0.8rem',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              transition: 'background 0.2s',
                            }}
                            className="hoverDim"
                            >
                              <input 
                                type="checkbox"
                                checked={Array.isArray(row.tags) && row.tags.includes(skill.id)}
                                onChange={(e) => {
                                  const next = [...showcases];
                                  const currentTags = Array.isArray(row.tags) ? [...row.tags] : [];
                                  
                                  if (e.target.checked) {
                                    if (!currentTags.includes(skill.id)) {
                                      currentTags.push(skill.id);
                                    }
                                  } else {
                                    const ix = currentTags.indexOf(skill.id);
                                    if (ix > -1) currentTags.splice(ix, 1);
                                  }
                                  next[idx] = { ...row, tags: currentTags };
                                  setShowcases(next);
                                }}
                              />
                              {skill.label}
                            </label>
                          ))}
                        </div>
                      </div>

                    </div>
                  </div>
                ))}

                <div className="actionRow">
                  <button className="btn" onClick={resetShowcasesDraft} disabled={busy}>
                    Reset
                  </button>
                  <TripleProgressButton
                    label="Save Showcases"
                    busy={busy}
                    disabled={busy}
                    isDirty={showcasesIsDirty}
                    onConfirm={onSaveShowcases}
                  />
                </div>
              </div>
            )}

            {activeTab === "Skills" && (
              <div className="formGrid">
                <div className="formField fullWidth">
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 16,
                    }}
                  >
                    <h3 style={{ margin: 0, color: "var(--text-color)" }}>Skill Matrix</h3>
                    <button
                      className="btn"
                      onClick={() => {
                        const nextCats = [...skillsDraft.categories];
                        nextCats.push({
                          id: Math.max(0, ...nextCats.map((c) => c.id)) + 1,
                          title: "New Category",
                          sort_order: nextCats.length + 1,
                          active: true,
                        });
                        setSkillsDraft((prev) => ({ ...prev, categories: nextCats }));
                      }}
                    >
                      <FontAwesomeIcon icon={faPlus} /> Add Category
                    </button>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                    {skillsDraft.categories.map((cat, catIdx) => (
                      <div
                        key={cat.id}
                        className="listItem"
                        style={{ display: "flex", flexDirection: "column", gap: 16 }}
                      >
                        {/* Category Row */}
                        <div style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
                          <div className="formField" style={{ flex: 1, marginBottom: 0 }}>
                            <label>Category Title</label>
                            <input
                              value={cat.title}
                              onChange={(e) => {
                                const nextCats = [...skillsDraft.categories];
                                nextCats[catIdx] = { ...cat, title: e.target.value };
                                setSkillsDraft((prev) => ({ ...prev, categories: nextCats }));
                              }}
                            />
                          </div>
                          <button
                            className="btn thin"
                            onClick={() => {
                              const nextItems = [...skillsDraft.items];
                              nextItems.push({
                                id: Math.max(0, ...nextItems.map((i) => i.id)) + 1,
                                category_id: cat.id,
                                label: "New Skill",
                                icon_key: "code",
                                text_color: "#ffffff",
                                bg_color: "#3C873A",
                                sort_order:
                                  nextItems.filter((i) => i.category_id === cat.id).length + 1,
                                active: true,
                              });
                              setSkillsDraft((prev) => ({ ...prev, items: nextItems }));
                            }}
                          >
                            <FontAwesomeIcon icon={faPlus} /> Add Skill
                          </button>
                          <button
                            className="btn thin"
                            style={{ color: "var(--error-color)" }}
                            onClick={() => {
                              const nextCats = skillsDraft.categories.filter((_, i) => i !== catIdx);
                              const nextItems = skillsDraft.items.filter((i) => i.category_id !== cat.id);
                              setSkillsDraft({ categories: nextCats, items: nextItems });
                            }}
                          >
                            Hapus
                          </button>
                        </div>

                        {/* Items Grid */}
                        {skillsDraft.items.filter((i) => i.category_id === cat.id).length > 0 && (
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
                              gap: 12,
                              paddingLeft: 16,
                              borderLeft: "2px solid rgba(255,255,255,0.1)",
                            }}
                          >
                            {skillsDraft.items
                              .filter((i) => i.category_id === cat.id)
                              .map((item) => {
                                const globalIdx = skillsDraft.items.findIndex(
                                  (x) => x.id === item.id
                                );
                                return (
                                  <div
                                    key={item.id}
                                    style={{
                                      display: "flex",
                                      gap: 8,
                                      background: "rgba(0,0,0,0.2)",
                                      padding: "8px 12px",
                                      borderRadius: 6,
                                      alignItems: "center",
                                    }}
                                  >
                                    <input
                                      value={item.label}
                                      placeholder="Skill Label"
                                      style={{ flex: 1, padding: "6px 8px" }}
                                      onChange={(e) => {
                                        const nextItems = [...skillsDraft.items];
                                        nextItems[globalIdx] = { ...item, label: e.target.value };
                                        setSkillsDraft((prev) => ({ ...prev, items: nextItems }));
                                      }}
                                    />
                                    <input
                                      value={item.icon_key}
                                      placeholder="Icon"
                                      style={{ width: 100, padding: "6px 8px" }}
                                      onChange={(e) => {
                                        const nextItems = [...skillsDraft.items];
                                        nextItems[globalIdx] = { ...item, icon_key: e.target.value };
                                        setSkillsDraft((prev) => ({ ...prev, items: nextItems }));
                                      }}
                                    />
                                    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                                      <input
                                        type="color"
                                        value={item.text_color || "#ffffff"}
                                        title="Text Color"
                                        style={{ width: 30, height: 30, padding: 0, border: 'none', background: 'none' }}
                                        onChange={(e) => {
                                          const nextItems = [...skillsDraft.items];
                                          nextItems[globalIdx] = { ...item, text_color: e.target.value };
                                          setSkillsDraft((prev) => ({ ...prev, items: nextItems }));
                                        }}
                                      />
                                      <input
                                        type="color"
                                        value={item.bg_color || "#3C873A"}
                                        title="BG Color"
                                        style={{ width: 30, height: 30, padding: 0, border: 'none', background: 'none' }}
                                        onChange={(e) => {
                                          const nextItems = [...skillsDraft.items];
                                          nextItems[globalIdx] = { ...item, bg_color: e.target.value };
                                          setSkillsDraft((prev) => ({ ...prev, items: nextItems }));
                                        }}
                                      />
                                    </div>
                                    <button
                                      className="btn thin"
                                      style={{ color: "var(--error-color)", padding: "6px 10px" }}
                                      onClick={() => {
                                        const nextItems = skillsDraft.items.filter(
                                          (x) => x.id !== item.id
                                        );
                                        setSkillsDraft((prev) => ({ ...prev, items: nextItems }));
                                      }}
                                      title="Remove Skill"
                                    >
                                      &times;
                                    </button>
                                  </div>
                                );
                              })}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <div
                  className="actionRow"
                >
                  <div
                    style={{
                      marginRight: "auto",
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <span className="listItemBadge">
                      {skillCounts.categories} Categories
                    </span>
                    <span className="listItemBadge">
                      {skillCounts.items} Items
                    </span>
                  </div>
                  <button className="btn" onClick={resetSkillsDraft} disabled={busy}>
                    Reset
                  </button>
                  <TripleProgressButton
                    label="Save Skills"
                    busy={busy}
                    disabled={busy}
                    isDirty={skillsIsDirty}
                    onConfirm={onSaveSkills}
                  />
                </div>
              </div>
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
