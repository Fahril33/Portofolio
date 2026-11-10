import React, { useEffect, useState } from "react";

export interface StoragePreviewCardProps {
  selectedPath: string;
  previewUrl: string;
  busy: boolean;
  onDelete: (path: string) => void;
}

export const StoragePreviewCard: React.FC<StoragePreviewCardProps> = ({
  selectedPath,
  previewUrl,
  busy,
  onDelete,
}: StoragePreviewCardProps): React.JSX.Element => {
  const [loadError, setLoadError] = useState<boolean>(false);

  useEffect((): void => {
    setLoadError(false);
  }, [previewUrl]);

  return (
    <div className="storagePickerRight">
      <div className="previewCard">
        <div className="panelHeader">
          <span className="panelTitle">
            <span>👁️</span> Pratinjau Gambar
          </span>
          {selectedPath ? <span className="panelBadge">Aktif</span> : null}
        </div>

        {previewUrl ? (
          <>
            <div className="previewImageContainer">
              {loadError ? (
                <div style={{ color: "#fca5a5", textAlign: "center", padding: "16px", fontSize: "0.84rem" }}>
                  Gagal memuat pratinjau. Pastikan bucket public atau izin akses file sesuai.
                </div>
              ) : (
                <img
                  src={previewUrl}
                  alt="preview"
                  onError={(): void => setLoadError(true)}
                />
              )}
            </div>

            <div className="previewMetaInfo">
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {selectedPath}
              </span>
            </div>

            <button
              type="button"
              className="btn danger thin"
              style={{ marginTop: "12px", width: "100%" }}
              onClick={(): void => onDelete(selectedPath)}
              disabled={busy}
            >
              Hapus File Dari Bucket
            </button>
          </>
        ) : (
          <div className="previewEmpty">
            <span style={{ fontSize: "1.8rem", opacity: 0.7 }}>🖼️</span>
            <span>{selectedPath ? "Memuat pratinjau..." : "Pilih file di sebelah kiri untuk melihat pratinjau"}</span>
          </div>
        )}
      </div>
    </div>
  );
};
