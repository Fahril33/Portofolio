import React from "react";
import type { AboutRow } from "../../../types/adminTypes";
import type { AboutSettingsConfig } from "../../../../../shared/types/aboutSettings";
import { storagePublicUrl } from "../../../../../lib/supabaseRest";

export interface AboutImageFallbackUrlProps {
  about: AboutRow;
  aboutSettings: AboutSettingsConfig;
  setAbout: React.Dispatch<React.SetStateAction<AboutRow | null>>;
}

export const AboutImageFallbackUrl: React.FC<AboutImageFallbackUrlProps> = ({
  about,
  aboutSettings,
  setAbout,
}: AboutImageFallbackUrlProps): React.JSX.Element => {
  const syncToFallback = (): void => {
    const { bucket, path } = aboutSettings.image.storage;
    if (!bucket || !path) return;
    const url = storagePublicUrl(bucket, path);
    setAbout((prev: AboutRow | null): AboutRow | null => {
      if (!prev) return prev;
      return { ...prev, image_url: url, image_alt: aboutSettings.image.alt || prev.image_alt };
    });
  };

  const isStorageWithImage =
    aboutSettings.image.source === "storage" && Boolean(aboutSettings.image.storage.path);

  return (
    <div className="formField fullWidth">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <label>Fallback URL (Database table `about_section`)</label>
        {isStorageWithImage ? (
          <button
            type="button"
            className="btn thin"
            style={{ fontSize: "0.75rem", padding: "2px 8px" }}
            onClick={syncToFallback}
          >
            Sinkronkan URL Storage ke Sini
          </button>
        ) : null}
      </div>
      <input
        value={about.image_url ?? ""}
        onChange={(e: React.ChangeEvent<HTMLInputElement>): void =>
          setAbout((prev: AboutRow | null): AboutRow | null =>
            prev ? { ...prev, image_url: e.target.value } : prev
          )
        }
        placeholder="https://..."
      />
    </div>
  );
};
