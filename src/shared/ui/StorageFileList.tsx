import React from "react";
import type { StorageObject } from "../../lib/supabaseRest";

export interface StorageFileListProps {
  files: StorageObject[];
  selectedPath: string;
  prefix?: string;
  busy: boolean;
  onSelect: (fullPath: string) => void;
}

export const baseName = (path: string): string =>
  path.split("/").filter(Boolean).pop() ?? path;

export const toFullPath = (name: string, prefix = ""): string => {
  const p = prefix.trim().replace(/^\/+/, "").replace(/\/+$/, "");
  const n = name.trim().replace(/^\/+/, "");
  if (!p) return n;
  if (n === p || n.startsWith(`${p}/`)) return n;
  return `${p}/${n}`;
};

export const StorageFileList: React.FC<StorageFileListProps> = ({
  files,
  selectedPath,
  prefix = "",
  busy,
  onSelect,
}: StorageFileListProps): React.JSX.Element => {
  if (files.length === 0) {
    return (
      <div className="fileEmpty">
        {busy ? "Memuat file dari storage..." : "Belum ada file di folder ini"}
      </div>
    );
  }

  const cleanSelected = toFullPath(selectedPath, prefix);

  return (
    <div className="fileList">
      {files.map((file: StorageObject): React.JSX.Element => {
        const fullPath = toFullPath(file.name, prefix);
        const isSelected = cleanSelected === fullPath;
        const name = baseName(file.name);

        return (
          <button
            type="button"
            key={file.id ?? file.name}
            className={`fileRow ${isSelected ? "active" : ""}`}
            onClick={(): void => onSelect(fullPath)}
            title={fullPath}
          >
            <div className="fileIconBox">🖼️</div>
            <div className="fileMeta">
              <span className="fileName">{name}</span>
              <span className="filePath">{fullPath}</span>
            </div>
            {isSelected ? <span className="fileActiveCheck">Dipilih</span> : null}
          </button>
        );
      })}
    </div>
  );
};
