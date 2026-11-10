import React from "react";
import type { AboutSettingsConfig } from "../../../../../shared/types/aboutSettings";

export interface AboutImageSourceControlsProps {
  aboutSettings: AboutSettingsConfig;
  setAboutSettings: React.Dispatch<React.SetStateAction<AboutSettingsConfig>>;
}

export const AboutImageSourceControls: React.FC<AboutImageSourceControlsProps> = ({
  aboutSettings,
  setAboutSettings,
}: AboutImageSourceControlsProps): React.JSX.Element => {
  return (
    <>
      <div className="formField fullWidth">
        <label>About Image Settings</label>
        <div className="toggleRow">
          <label className="inlineToggle">
            <input
              type="checkbox"
              checked={aboutSettings.image.enabled}
              onChange={(e: React.ChangeEvent<HTMLInputElement>): void =>
                setAboutSettings((prev: AboutSettingsConfig): AboutSettingsConfig => ({
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
                onChange={(e: React.ChangeEvent<HTMLSelectElement>): void =>
                  setAboutSettings((prev: AboutSettingsConfig): AboutSettingsConfig => ({
                    ...prev,
                    image: {
                      ...prev.image,
                      source: e.target.value === "storage" ? "storage" : "url",
                    },
                  }))
                }
              >
                <option value="storage">Supabase Storage</option>
                <option value="url">Direct URL</option>
              </select>
            </label>
          </div>
        </div>
      </div>

      {aboutSettings.image.source === "url" ? (
        <>
          <div className="formField fullWidth">
            <label>Image URL</label>
            <input
              value={aboutSettings.image.url}
              onChange={(e: React.ChangeEvent<HTMLInputElement>): void =>
                setAboutSettings((prev: AboutSettingsConfig): AboutSettingsConfig => ({
                  ...prev,
                  image: { ...prev.image, url: e.target.value },
                }))
              }
              placeholder="https://..."
            />
          </div>
          <div className="formField fullWidth">
            <label>Alt Text</label>
            <input
              value={aboutSettings.image.alt}
              onChange={(e: React.ChangeEvent<HTMLInputElement>): void =>
                setAboutSettings((prev: AboutSettingsConfig): AboutSettingsConfig => ({
                  ...prev,
                  image: { ...prev.image, alt: e.target.value },
                }))
              }
            />
          </div>
        </>
      ) : null}
    </>
  );
};

