import React from "react";

export interface StoragePickerTopBarProps {
  bucket: string;
  prefix: string;
  isPublicBucket: boolean;
  query: string;
  busy: boolean;
  onQueryChange: (q: string) => void;
  onRefresh: () => void;
  onUpload: (file: File) => void;
}

export const StoragePickerTopBar: React.FC<StoragePickerTopBarProps> = ({
  bucket,
  prefix,
  isPublicBucket,
  query,
  busy,
  onQueryChange,
  onRefresh,
  onUpload,
}: StoragePickerTopBarProps): React.JSX.Element => {
  const isDisabled = busy || !bucket;

  return (
    <div className="storagePickerTop">
      <div className="storagePickerMeta">
        <span className="pill">
          <span>🪣</span> {bucket || "Pilih Bucket"}
        </span>
        <span className="pill">
          <span>📁</span> /{prefix || ""}
        </span>
        <span className="pill">
          <span className={`pillDot ${isPublicBucket ? "" : "private"}`} />
          {isPublicBucket ? "Public" : "Private"}
        </span>
      </div>

      <div className="storagePickerActions">
        <input
          className="storagePickerSearch"
          value={query}
          onChange={(e: React.ChangeEvent<HTMLInputElement>): void => onQueryChange(e.target.value)}
          placeholder="Cari file..."
          disabled={!bucket}
        />
        <button
          type="button"
          className="btn thin"
          onClick={onRefresh}
          disabled={isDisabled}
          title="Segarkan daftar file"
        >
          🔄 Refresh
        </button>
        <label className={`btn thin ${isDisabled ? "disabledLike" : ""}`} title="Unggah file baru">
          ⬆️ Upload
          <input
            type="file"
            accept="image/*"
            disabled={isDisabled}
            onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (file) onUpload(file);
            }}
            style={{ display: "none" }}
          />
        </label>
      </div>
    </div>
  );
};
