import React, { useState } from "react";
import type { AboutRow } from "../../../types/adminTypes";
import type { AboutSettingsConfig } from "../../../../../shared/types/aboutSettings";
import type { StorageBucket } from "../../../../../lib/supabaseRest";
import StorageImagePicker from "../../../../../shared/ui/StorageImagePicker";
import { AboutBucketCreator } from "./AboutBucketCreator";
import { AboutFolderSelector } from "./AboutFolderSelector";
import { AboutImageSourceControls } from "./AboutImageSourceControls";
import { AboutImageSizeControls } from "./AboutImageSizeControls";
import { AboutImageFallbackUrl } from "./AboutImageFallbackUrl";

export interface AboutImageConfigProps {
  about: AboutRow;
  aboutSettings: AboutSettingsConfig;
  storageBuckets: StorageBucket[];
  setAbout: React.Dispatch<React.SetStateAction<AboutRow | null>>;
  setAboutSettings: React.Dispatch<React.SetStateAction<AboutSettingsConfig>>;
  getAccessToken: () => Promise<string | null>;
  onBucketCreated: (bucket: StorageBucket) => void;
}

export const AboutImageConfig: React.FC<AboutImageConfigProps> = ({
  about,
  aboutSettings,
  storageBuckets,
  setAbout,
  setAboutSettings,
  getAccessToken,
  onBucketCreated,
}: AboutImageConfigProps): React.JSX.Element => {
  const [showCreator, setShowCreator] = useState<boolean>(false);
  const [folderPrefix, setFolderPrefix] = useState<string>("about/");
  const [manualBucketMode, setManualBucketMode] = useState<boolean>(false);

  return (
    <>
      <AboutImageSourceControls
        aboutSettings={aboutSettings}
        setAboutSettings={setAboutSettings}
      />

      {aboutSettings.image.source === "storage" ? (
        <>
          <div className="formField">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label>Bucket</label>
              <button
                type="button"
                style={{ background: "none", border: "none", color: "#e35860", fontSize: "0.8rem", cursor: "pointer", textDecoration: "underline" }}
                onClick={(): void => setManualBucketMode(!manualBucketMode)}
              >
                {manualBucketMode ? "Pilih dari list" : "Input manual"}
              </button>
            </div>
            {manualBucketMode || storageBuckets.length === 0 ? (
              <input
                value={aboutSettings.image.storage.bucket}
                onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
                  const bucketName = e.target.value;
                  setAboutSettings((prev: AboutSettingsConfig): AboutSettingsConfig => ({
                    ...prev,
                    image: { ...prev.image, storage: { ...prev.image.storage, bucket: bucketName } },
                  }));
                }}
                placeholder="misal: portfolio"
              />
            ) : (
              <select
                value={aboutSettings.image.storage.bucket}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>): void => {
                  const bucketName = e.target.value;
                  const bucket = storageBuckets.find((b: StorageBucket): boolean => b.name === bucketName);
                  const isPublic = bucket?.public ?? true;
                  setAboutSettings((prev: AboutSettingsConfig): AboutSettingsConfig => ({
                    ...prev,
                    image: {
                      ...prev.image,
                      storage: { ...prev.image.storage, bucket: bucketName, isPublic },
                    },
                  }));
                }}
              >
                <option value="">(Pilih Bucket)</option>
                {storageBuckets.map((b: StorageBucket): React.JSX.Element => (
                  <option key={b.id ?? b.name} value={b.name}>
                    {b.name} {b.public ? "(public)" : "(private)"}
                  </option>
                ))}
              </select>
            )}
            <div style={{ marginTop: 4 }}>
              <button
                type="button"
                className="btn thin"
                style={{ fontSize: "0.75rem", padding: "4px 8px" }}
                onClick={(): void => setShowCreator(!showCreator)}
              >
                {showCreator ? "Tutup Form Buat Bucket" : "+ Buat Bucket Baru di Supabase"}
              </button>
            </div>
          </div>

          <AboutFolderSelector
            bucket={aboutSettings.image.storage.bucket}
            folderPrefix={folderPrefix}
            onFolderChange={setFolderPrefix}
            getAccessToken={getAccessToken}
          />

          <div className="formField">
            <label>Akses Bucket</label>
            <select
              value={aboutSettings.image.storage.isPublic ? "true" : "false"}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>): void =>
                setAboutSettings((prev: AboutSettingsConfig): AboutSettingsConfig => ({
                  ...prev,
                  image: {
                    ...prev.image,
                    storage: { ...prev.image.storage, isPublic: e.target.value === "true" },
                  },
                }))
              }
            >
              <option value="true">Public (Dapat diakses publik)</option>
              <option value="false">Private (Butuh signed token)</option>
            </select>
          </div>

          {showCreator ? (
            <div className="formField fullWidth">
              <AboutBucketCreator
                getAccessToken={getAccessToken}
                onCreated={(newBucket: StorageBucket): void => {
                  onBucketCreated(newBucket);
                  setShowCreator(false);
                  setAboutSettings((prev: AboutSettingsConfig): AboutSettingsConfig => ({
                    ...prev,
                    image: {
                      ...prev.image,
                      storage: {
                        ...prev.image.storage,
                        bucket: newBucket.name,
                        isPublic: Boolean(newBucket.public),
                      },
                    },
                  }));
                }}
                onCancel={(): void => setShowCreator(false)}
              />
            </div>
          ) : null}

          <StorageImagePicker
            bucket={aboutSettings.image.storage.bucket}
            fixedPrefix={folderPrefix}
            isPublicBucket={aboutSettings.image.storage.isPublic}
            selectedPath={aboutSettings.image.storage.path}
            onSelectPath={(path: string): void =>
              setAboutSettings((prev: AboutSettingsConfig): AboutSettingsConfig => ({
                ...prev,
                image: { ...prev.image, storage: { ...prev.image.storage, path } },
              }))
            }
            getAccessToken={getAccessToken}
          />
        </>
      ) : null}

      <AboutImageSizeControls
        aboutSettings={aboutSettings}
        setAboutSettings={setAboutSettings}
      />

      <AboutImageFallbackUrl
        about={about}
        aboutSettings={aboutSettings}
        setAbout={setAbout}
      />
    </>
  );
};
