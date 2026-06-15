import React, { useMemo } from "react";
import type { AboutRow, AboutBaseline } from "../../types/adminTypes";
import type { AboutSettingsConfig } from "../../../../shared/types/aboutSettings";
import type { StorageBucket } from "../../../../lib/supabaseRest";
import TripleProgressButton from "../../../../shared/ui/TripleProgressButton";
import StorageImagePicker from "../../../../shared/ui/StorageImagePicker";

interface AboutPanelProps {
  about: AboutRow;
  aboutSettings: AboutSettingsConfig;
  busy: boolean;
  storageBuckets: StorageBucket[];
  baseline: AboutBaseline | null;
  setAbout: React.Dispatch<React.SetStateAction<AboutRow | null>>;
  setAboutSettings: React.Dispatch<React.SetStateAction<AboutSettingsConfig>>;
  onSave: () => Promise<void>;
  getAccessToken: () => Promise<string | null>;
}

const ABOUT_FIXED_PREFIX = "about/";

const AboutPanel: React.FC<AboutPanelProps> = ({
  about,
  aboutSettings,
  busy,
  storageBuckets,
  baseline,
  setAbout,
  setAboutSettings,
  onSave,
  getAccessToken,
}): React.ReactElement => {
  const isDirty = useMemo((): boolean => {
    if (!baseline) return false;
    return (
      JSON.stringify(about) !== JSON.stringify(baseline.about) ||
      JSON.stringify(aboutSettings) !== JSON.stringify(baseline.settings)
    );
  }, [about, aboutSettings, baseline]);

  const handleReset = (): void => {
    if (!baseline) return;
    setAbout(baseline.about);
    setAboutSettings(baseline.settings);
  };

  return (
    <div className="formGrid">
      <div className="formField">
        <label>Heading</label>
        <input
          value={about.heading ?? ""}
          onChange={(e) => setAbout({ ...about, heading: e.target.value })}
        />
      </div>
      <div className="formField">
        <label>Tagline</label>
        <input
          value={about.tagline ?? ""}
          onChange={(e) => setAbout({ ...about, tagline: e.target.value })}
        />
      </div>
      <div className="formField fullWidth">
        <label>Body Description</label>
        <textarea
          value={about.body ?? ""}
          onChange={(e) => setAbout({ ...about, body: e.target.value })}
        />
      </div>

      <hr className="settingsHr" />

      {/* About Image */}
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
                    storage: { ...prev.image.storage, bucket: bucketName, path: "", isPublic },
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
            getAccessToken={getAccessToken}
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
                size: {
                  ...prev.image.size,
                  objectFit: e.target.value as "contain" | "cover" | "fill" | "none" | "scale-down",
                },
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
        <button className="btn" onClick={handleReset} disabled={busy}>
          Reset
        </button>
        <TripleProgressButton
          label="Save About"
          busy={busy}
          disabled={busy}
          isDirty={isDirty}
          onConfirm={onSave}
        />
      </div>
    </div>
  );
};

export default AboutPanel;
