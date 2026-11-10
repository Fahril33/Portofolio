import React, { useState } from "react";
import { createStorageBucket, type StorageBucket } from "../../../../../lib/supabaseRest";

export interface AboutBucketCreatorProps {
  getAccessToken: () => Promise<string | null>;
  onCreated: (newBucket: StorageBucket) => void;
  onCancel: () => void;
}

export const AboutBucketCreator: React.FC<AboutBucketCreatorProps> = ({
  getAccessToken,
  onCreated,
  onCancel,
}: AboutBucketCreatorProps): React.JSX.Element => {
  const [bucketName, setBucketName] = useState<string>("portfolio");
  const [isPublic, setIsPublic] = useState<boolean>(true);
  const [busy, setBusy] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async (): Promise<void> => {
    const clean = bucketName.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");
    if (!clean) {
      setError("Nama bucket hanya boleh huruf kecil, angka, tanda hubung (-) atau garis bawah (_).");
      return;
    }

    setBusy(true);
    setError(null);
    try {
      const token = await getAccessToken();
      if (!token) throw new Error("Sesi login berakhir.");
      const bucket = await createStorageBucket(clean, isPublic, token);
      onCreated(bucket);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal membuat bucket.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      style={{
        marginTop: 10,
        marginBottom: 10,
        padding: 14,
        borderRadius: 14,
        background: "rgba(227, 88, 96, 0.08)",
        border: "1px solid rgba(227, 88, 96, 0.3)",
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: 8, fontSize: "0.9rem" }}>
        Buat Storage Bucket Baru di Supabase
      </div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <input
          style={{ flex: "1 1 180px", padding: "8px 12px", borderRadius: 8 }}
          placeholder="Nama bucket (misal: portfolio)"
          value={bucketName}
          onChange={(e: React.ChangeEvent<HTMLInputElement>): void => setBucketName(e.target.value)}
          disabled={busy}
        />
        <label style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "0.85rem", cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={isPublic}
            onChange={(e: React.ChangeEvent<HTMLInputElement>): void => setIsPublic(e.target.checked)}
            disabled={busy}
          />
          Public (Dianjurkan)
        </label>
        <button type="button" className="btn thin" onClick={(): void => void handleCreate()} disabled={busy}>
          {busy ? "Membuat..." : "Simpan Bucket"}
        </button>
        <button type="button" className="btn thin" onClick={onCancel} disabled={busy}>
          Batal
        </button>
      </div>
      {error ? (
        <div style={{ marginTop: 8, color: "#ff8888", fontSize: "0.85rem" }}>{error}</div>
      ) : null}
    </div>
  );
};
