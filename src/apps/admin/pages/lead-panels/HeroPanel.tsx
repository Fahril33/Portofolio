import React, { useMemo } from "react";
import type { HeroRow, HeroBaseline } from "../../types/adminTypes";
import type { HeroSettingsConfig } from "../../../../shared/types/heroSettings";
import type { StorageBucket } from "../../../../lib/supabaseRest";
import TripleProgressButton from "../../../../shared/ui/TripleProgressButton";
import StorageImagePicker from "../../../../shared/ui/StorageImagePicker";
import BrickListInput, { type BrickItem } from "../../../../shared/ui/BrickListInput";

interface HeroPanelProps {
  hero: HeroRow;
  heroSettings: HeroSettingsConfig;
  busy: boolean;
  storageBuckets: StorageBucket[];
  baseline: HeroBaseline | null;
  setHero: React.Dispatch<React.SetStateAction<HeroRow | null>>;
  setHeroSettings: React.Dispatch<React.SetStateAction<HeroSettingsConfig>>;
  onSave: () => Promise<void>;
  getAccessToken: () => Promise<string | null>;
}

const HERO_FIXED_PREFIX = "hero/";

const HeroPanel: React.FC<HeroPanelProps> = ({
  hero,
  heroSettings,
  busy,
  storageBuckets,
  baseline,
  setHero,
  setHeroSettings,
  onSave,
  getAccessToken,
}): React.ReactElement => {
  const isDirty = useMemo((): boolean => {
    if (!baseline) return false;
    return (
      JSON.stringify(hero) !== JSON.stringify(baseline.hero) ||
      JSON.stringify(heroSettings) !== JSON.stringify(baseline.settings)
    );
  }, [hero, heroSettings, baseline]);

  const handleReset = (): void => {
    if (!baseline) return;
    setHero(baseline.hero);
    setHeroSettings(baseline.settings);
  };

  const brickItems = useMemo((): BrickItem[] => {
    return (heroSettings.typewriter.texts ?? []).map((t, idx) => ({
      id: `t${idx}`,
      label: t,
    }));
  }, [heroSettings.typewriter.texts]);

  const selectedBrickId = useMemo((): string => {
    const idx = heroSettings.typewriter.defaultIndex ?? 0;
    return `t${Math.max(0, Math.floor(idx))}`;
  }, [heroSettings.typewriter.defaultIndex]);

  const handleBrickSelect = (id: string): void => {
    const idx = Number(id.replace(/^t/, ""));
    if (!Number.isFinite(idx)) return;
    setHeroSettings((prev) => ({
      ...prev,
      typewriter: { ...prev.typewriter, defaultIndex: idx },
    }));
  };

  const handleBrickAdd = (label: string): void => {
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
  };

  const handleBrickDelete = (id: string): void => {
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
  };

  return (
    <div className="formGrid">
      <div className="formField">
        <label>Greeting</label>
        <input
          value={hero.greeting ?? ""}
          onChange={(e) => setHero({ ...hero, greeting: e.target.value })}
        />
      </div>
      <div className="formField">
        <label>Job Title</label>
        <input
          value={hero.job_title ?? ""}
          onChange={(e) => setHero({ ...hero, job_title: e.target.value })}
        />
      </div>

      <hr className="settingsHr" />

      {/* Typewriter Settings */}
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
                  typewriter: { ...prev.typewriter, enabled: e.target.checked },
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
                  typewriter: { ...prev.typewriter, rotate: e.target.checked },
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
                  typewriter: { ...prev.typewriter, loop: e.target.checked },
                }))
              }
            />
            Loop
          </label>
        </div>
      </div>

      <BrickListInput
        label="Texts (click a brick to set default)"
        items={brickItems}
        selectedId={selectedBrickId}
        onSelect={handleBrickSelect}
        onAdd={handleBrickAdd}
        onDelete={handleBrickDelete}
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
              typewriter: { ...prev.typewriter, typingMs: Number(e.target.value) || 0 },
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
              typewriter: { ...prev.typewriter, deletingMs: Number(e.target.value) || 0 },
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
              typewriter: { ...prev.typewriter, pauseMs: Number(e.target.value) || 0 },
            }))
          }
        />
      </div>

      <hr className="settingsHr" />

      {/* Welcome Popup */}
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
          onChange={(e) => setHero({ ...hero, welcome_title: e.target.value })}
        />
      </div>
      <div className="formField fullWidth">
        <label>Welcome Text (Alert)</label>
        <textarea
          value={hero.welcome_text ?? ""}
          onChange={(e) => setHero({ ...hero, welcome_text: e.target.value })}
        />
      </div>

      <hr className="settingsHr" />

      {/* Hero Image */}
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
                    storage: { ...prev.heroImage.storage, bucket: bucketName, path: "", isPublic },
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
                heroImage: { ...prev.heroImage, storage: { ...prev.heroImage.storage, path } },
              }))
            }
            getAccessToken={getAccessToken}
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
                  objectFit: e.target.value as "contain" | "cover" | "fill" | "none" | "scale-down",
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
        <button className="btn" onClick={handleReset} disabled={busy}>
          Reset
        </button>
        <TripleProgressButton
          label="Save Hero"
          busy={busy}
          disabled={busy}
          isDirty={isDirty}
          onConfirm={onSave}
        />
      </div>
    </div>
  );
};

export default HeroPanel;
