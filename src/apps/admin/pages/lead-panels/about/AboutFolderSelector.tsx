import React, { useEffect, useState } from "react";
import { listStorageObjects, type StorageObject } from "../../../../../lib/supabaseRest";

export interface AboutFolderSelectorProps {
  bucket: string;
  folderPrefix: string;
  onFolderChange: (folder: string) => void;
  getAccessToken: () => Promise<string | null>;
}

const PRESET_FOLDERS: string[] = ["about/", "hero/", "images/"];

export const AboutFolderSelector: React.FC<AboutFolderSelectorProps> = ({
  bucket,
  folderPrefix,
  onFolderChange,
  getAccessToken,
}: AboutFolderSelectorProps): React.JSX.Element => {
  const [manualMode, setManualMode] = useState<boolean>(false);
  const [discoveredFolders, setDiscoveredFolders] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect((): (() => void) => {
    const cleanBucket = bucket.trim();
    if (!cleanBucket) {
      setDiscoveredFolders([]);
      return (): void => {};
    }

    let cancelled = false;
    const fetchFolders = async (): Promise<void> => {
      setLoading(true);
      try {
        const token = await getAccessToken();
        if (!token) return;
        const objects = await listStorageObjects(cleanBucket, "", token, { limit: 100 });
        if (cancelled) return;

        const folderSet = new Set<string>();
        objects.forEach((obj: StorageObject): void => {
          if (!obj.name) return;
          const parts = obj.name.split("/").filter(Boolean);
          if (parts.length > 1) {
            folderSet.add(`${parts[0]}/`);
            if (parts.length > 2) {
              folderSet.add(`${parts.slice(0, -1).join("/")}/`);
            }
          } else if (obj.id === null) {
            folderSet.add(`${obj.name.replace(/\/+$/, "")}/`);
          }
        });

        setDiscoveredFolders(Array.from(folderSet));
      } catch {
        // Fallback to presets if listing root fails
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void fetchFolders();
    return (): void => {
      cancelled = true;
    };
  }, [bucket, getAccessToken]);

  const allFolders = Array.from(
    new Set([...PRESET_FOLDERS, ...discoveredFolders, ...(folderPrefix.trim() ? [folderPrefix.trim()] : [])])
  );

  return (
    <div className="formField">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <label>Folder Prefix</label>
        <button
          type="button"
          style={{ background: "none", border: "none", color: "#e35860", fontSize: "0.8rem", cursor: "pointer", textDecoration: "underline" }}
          onClick={(): void => setManualMode(!manualMode)}
        >
          {manualMode ? "Pilih dari dropdown" : "Input manual"}
        </button>
      </div>

      {manualMode ? (
        <input
          value={folderPrefix}
          onChange={(e: React.ChangeEvent<HTMLInputElement>): void => onFolderChange(e.target.value)}
          placeholder="misal: about/ atau Protofolio/About/ atau kosongkan"
        />
      ) : (
        <select
          value={folderPrefix}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>): void => onFolderChange(e.target.value)}
          disabled={!bucket}
        >
          <option value="">(Root / Tanpa Folder)</option>
          {allFolders.map((f: string): React.JSX.Element => (
            <option key={f} value={f}>
              📁 /{f}
            </option>
          ))}
        </select>
      )}

      <div style={{ fontSize: "0.74rem", color: "rgba(255, 255, 255, 0.45)", marginTop: 2 }}>
        {loading ? "Memindai folder di bucket..." : "Pilih folder yang tersedia atau beralih ke input manual"}
      </div>
    </div>
  );
};
