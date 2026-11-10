import React from "react";
import type { AboutSettingsConfig } from "../../../../../shared/types/aboutSettings";

export interface AboutImageSizeControlsProps {
  aboutSettings: AboutSettingsConfig;
  setAboutSettings: React.Dispatch<React.SetStateAction<AboutSettingsConfig>>;
}

export const AboutImageSizeControls: React.FC<AboutImageSizeControlsProps> = ({
  aboutSettings,
  setAboutSettings,
}: AboutImageSizeControlsProps): React.JSX.Element => {
  return (
    <>
      <div className="formField">
        <label>Width (px)</label>
        <input
          type="number"
          value={aboutSettings.image.size.widthPx ?? ""}
          onChange={(e: React.ChangeEvent<HTMLInputElement>): void =>
            setAboutSettings((prev: AboutSettingsConfig): AboutSettingsConfig => ({
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
          onChange={(e: React.ChangeEvent<HTMLInputElement>): void =>
            setAboutSettings((prev: AboutSettingsConfig): AboutSettingsConfig => ({
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
          onChange={(e: React.ChangeEvent<HTMLSelectElement>): void =>
            setAboutSettings((prev: AboutSettingsConfig): AboutSettingsConfig => ({
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
    </>
  );
};

