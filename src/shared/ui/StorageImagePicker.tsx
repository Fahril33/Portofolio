import React, { useEffect, useMemo, useRef, useState } from "react";
import "./storageImagePicker.css";
import {
  listStorageObjects,
  signStorageObjectUrl,
  storagePublicUrl,
  uploadStorageObject,
  type StorageObject,
} from "../../lib/supabaseRest";

export type StorageImagePickerProps = {
  bucket: string;
  fixedPrefix: string; // e.g. "hero/"
  isPublicBucket: boolean;
  selectedPath: string;
  onSelectPath: (path: string) => void;
  getAccessToken: () => Promise<string | null>;
};

const baseName = (path: string) => path.split("/").filter(Boolean).pop() ?? path;

const StorageImagePicker: React.FC<StorageImagePickerProps> = ({
  bucket,
  fixedPrefix,
  isPublicBucket,
  selectedPath,
  onSelectPath,
  getAccessToken,
}) => {
  const [items, setItems] = useState<StorageObject[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [query, setQuery] = useState("");
  const intervalRef = useRef<number | null>(null);

  const cleanBucket = bucket.trim();
  const cleanPrefix = fixedPrefix.trim().replace(/^\/+/, "");

  const refresh = async () => {
    if (!cleanBucket) return;
    setError(null);
    setBusy(true);
    try {
      const accessToken = await getAccessToken();
      if (!accessToken) throw new Error("Session expired.");
      const rows = await listStorageObjects(cleanBucket, cleanPrefix, accessToken);
      setItems(rows);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load files.");
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (!cleanBucket) return;
    void refresh();
    intervalRef.current = window.setInterval(() => {
      void refresh();
    }, 5000);
    return () => {
      if (intervalRef.current != null) window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cleanBucket, cleanPrefix]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) => (i.name ?? "").toLowerCase().includes(q));
  }, [items, query]);

  const resolvePreview = async (path: string) => {
    setError(null);
    setPreviewUrl("");
    if (!cleanBucket || !path) return;

    try {
      if (isPublicBucket) {
        setPreviewUrl(storagePublicUrl(cleanBucket, path));
        return;
      }

      const accessToken = await getAccessToken();
      if (!accessToken) throw new Error("Session expired.");
      setPreviewUrl(await signStorageObjectUrl(cleanBucket, path, accessToken, 120));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to preview.");
    }
  };

  useEffect(() => {
    if (!selectedPath) return;
    void resolvePreview(selectedPath);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPath, isPublicBucket, cleanBucket]);

  const upload = async (file: File) => {
    setError(null);
    if (!cleanBucket) return;

    const dest = `${cleanPrefix}${cleanPrefix.endsWith("/") || cleanPrefix === "" ? "" : "/"}${file.name}`;
    setBusy(true);
    try {
      const accessToken = await getAccessToken();
      if (!accessToken) throw new Error("Session expired.");
      await uploadStorageObject(cleanBucket, dest, file, accessToken, true);
      await refresh();
      onSelectPath(dest);
      await resolvePreview(dest);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="storagePicker">
      <div className="storagePickerTop">
        <div className="storagePickerMeta">
          <span className="pill">bucket: {cleanBucket || "-"}</span>
          <span className="pill">folder: /{cleanPrefix || ""}</span>
          <span className="pill">{isPublicBucket ? "public" : "private"}</span>
        </div>
        <div className="storagePickerActions">
          <input
            className="storagePickerSearch"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search file…"
          />
          <button type="button" className="btn thin" onClick={() => void refresh()} disabled={busy}>
            Refresh
          </button>
          <label className={`btn thin ${busy ? "disabledLike" : ""}`}>
            Upload
            <input
              type="file"
              accept="image/*"
              disabled={busy}
              onChange={(e) => {
                const f = e.target.files?.[0];
                e.target.value = "";
                if (f) void upload(f);
              }}
              style={{ display: "none" }}
            />
          </label>
        </div>
      </div>

      {error ? <div className="storagePickerError">{error}</div> : null}

      <div className="storagePickerGrid">
        <div className="storagePickerLeft">
          <div className="fileList">
            {filtered.length === 0 ? (
              <div className="fileEmpty">{busy ? "Loading..." : "No files"}</div>
            ) : (
              filtered.map((o) => (
                <button
                  type="button"
                  key={o.id ?? o.name}
                  className={`fileRow ${selectedPath === o.name ? "active" : ""}`}
                  onClick={() => {
                    onSelectPath(o.name);
                    void resolvePreview(o.name);
                  }}
                >
                  <span className="fileName">{baseName(o.name)}</span>
                  <span className="filePath">{o.name}</span>
                </button>
              ))
            )}
          </div>
        </div>
        <div className="storagePickerRight">
          <div className="previewCard">
            <div className="previewTitle">Preview</div>
            {previewUrl ? (
              <img src={previewUrl} alt="preview" />
            ) : (
              <div className="previewEmpty">
                {selectedPath ? "Loading preview..." : "Select a file"}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StorageImagePicker;

