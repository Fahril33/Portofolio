import React, { useEffect, useMemo, useState } from "react";
import "./storageImagePicker.css";
import {
  deleteStorageObjects,
  listStorageObjects,
  signStorageObjectUrl,
  storagePublicUrl,
  uploadStorageObject,
  type StorageObject,
} from "../../lib/supabaseRest";
import { StorageFileList, baseName, toFullPath } from "./StorageFileList";
import { StoragePickerTopBar } from "./StoragePickerTopBar";
import { StoragePreviewCard } from "./StoragePreviewCard";

export interface StorageImagePickerProps {
  bucket: string;
  fixedPrefix: string;
  isPublicBucket: boolean;
  selectedPath: string;
  onSelectPath: (path: string) => void;
  getAccessToken: () => Promise<string | null>;
}

const formatStorageError = (e: unknown, fallback: string): string =>
  /row-level security/i.test(e instanceof Error ? e.message : fallback)
    ? "Supabase Storage RLS belum diizinkan. Berikan policy INSERT/UPDATE pada storage.objects."
    : e instanceof Error ? e.message : fallback;

const StorageImagePicker: React.FC<StorageImagePickerProps> = ({
  bucket,
  fixedPrefix,
  isPublicBucket,
  selectedPath,
  onSelectPath,
  getAccessToken,
}: StorageImagePickerProps): React.JSX.Element => {
  const [items, setItems] = useState<StorageObject[]>([]);
  const [busy, setBusy] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [query, setQuery] = useState<string>("");

  const cleanBucket = bucket.trim();
  const cleanPrefix = fixedPrefix.trim().replace(/^\/+/, "");

  const refresh = async (): Promise<void> => {
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

  useEffect((): void => {
    if (!cleanBucket) setItems([]);
    else void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cleanBucket, cleanPrefix]);

  const filtered = useMemo((): StorageObject[] => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) => (i.name ?? "").toLowerCase().includes(q));
  }, [items, query]);

  const resolvePreview = async (path: string): Promise<void> => {
    setError(null);
    setPreviewUrl("");
    if (!cleanBucket || !path) return;

    const fullPath = toFullPath(path, cleanPrefix);
    try {
      if (isPublicBucket) {
        setPreviewUrl(storagePublicUrl(cleanBucket, fullPath));
        return;
      }
      const accessToken = await getAccessToken();
      if (!accessToken) throw new Error("Session expired.");
      setPreviewUrl(await signStorageObjectUrl(cleanBucket, fullPath, accessToken, 120));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to preview.");
    }
  };

  useEffect((): void => {
    if (!selectedPath) return;
    void resolvePreview(selectedPath);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPath, isPublicBucket, cleanBucket]);

  const upload = async (file: File): Promise<void> => {
    setError(null);
    if (!cleanBucket) {
      setError("Pilih atau isi nama bucket terlebih dahulu sebelum upload.");
      return;
    }

    const dest = toFullPath(file.name, cleanPrefix);
    setBusy(true);
    try {
      const accessToken = await getAccessToken();
      if (!accessToken) throw new Error("Session expired.");
      await uploadStorageObject(cleanBucket, dest, file, accessToken, true);
      await refresh();
      onSelectPath(dest);
      await resolvePreview(dest);
    } catch (e) {
      setError(formatStorageError(e, "Upload failed."));
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (path: string): Promise<void> => {
    if (!path || !cleanBucket) return;
    const fullPath = toFullPath(path, cleanPrefix);
    const confirmed = window.confirm(`Hapus file "${baseName(fullPath)}" dari bucket "${cleanBucket}"?`);
    if (!confirmed) return;

    setError(null);
    setBusy(true);
    try {
      const accessToken = await getAccessToken();
      if (!accessToken) throw new Error("Session expired.");
      await deleteStorageObjects(cleanBucket, [fullPath], accessToken);
      if (toFullPath(selectedPath, cleanPrefix) === fullPath) {
        onSelectPath("");
        setPreviewUrl("");
      }
      await refresh();
    } catch (e) {
      setError(formatStorageError(e, "Gagal menghapus file."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="storagePicker">
      <StoragePickerTopBar
        bucket={cleanBucket}
        prefix={cleanPrefix}
        isPublicBucket={isPublicBucket}
        query={query}
        busy={busy}
        onQueryChange={setQuery}
        onRefresh={(): void => void refresh()}
        onUpload={(file: File): void => void upload(file)}
      />

      {error ? <div className="storagePickerError">{error}</div> : null}

      <div className="storagePickerGrid">
        <div className="storagePickerLeft">
          <div className="fileListPanel">
            <div className="panelHeader">
              <span className="panelTitle">
                <span>📁</span> Daftar File
              </span>
              <span className="panelBadge">{filtered.length} item</span>
            </div>
            <StorageFileList
              files={filtered}
              selectedPath={selectedPath}
              prefix={cleanPrefix}
              busy={busy}
              onSelect={(fullPath: string): void => {
                onSelectPath(fullPath);
                void resolvePreview(fullPath);
              }}
            />
          </div>
        </div>
        <StoragePreviewCard
          selectedPath={selectedPath}
          previewUrl={previewUrl}
          busy={busy}
          onDelete={(path: string): void => void handleDelete(path)}
        />
      </div>
    </div>
  );
};

export { StorageImagePicker };
export default StorageImagePicker;
