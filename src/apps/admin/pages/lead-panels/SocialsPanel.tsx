import React, { useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import type { SocialRow } from "../../types/adminTypes";
import TripleProgressButton from "../../../../shared/ui/TripleProgressButton";

interface SocialsPanelProps {
  socials: SocialRow[];
  busy: boolean;
  baseline: SocialRow[] | null;
  setSocials: React.Dispatch<React.SetStateAction<SocialRow[]>>;
  onSave: () => Promise<void>;
}

const SocialsPanel: React.FC<SocialsPanelProps> = ({
  socials,
  busy,
  baseline,
  setSocials,
  onSave,
}): React.ReactElement => {
  const isDirty = useMemo((): boolean => {
    if (!baseline) return false;
    return JSON.stringify(socials) !== JSON.stringify(baseline);
  }, [socials, baseline]);

  const handleReset = (): void => {
    if (!baseline) return;
    setSocials([...baseline]);
  };

  const handleUpdateRow = (idx: number, patch: Partial<SocialRow>): void => {
    setSocials((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], ...patch };
      return next;
    });
  };

  const handleDeleteRow = (idx: number): void => {
    setSocials((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleAddRow = (): void => {
    setSocials((prev) => [
      ...prev,
      {
        id: Math.max(0, ...prev.map((p) => p.id)) + 1,
        label: "New",
        href: "https://",
        icon: "github",
        sort_order: prev.length + 1,
        active: true,
      },
    ]);
  };

  return (
    <div className="listContainer">
      {socials.map((row, idx) => (
        <div key={row.id} className="listItem">
          <div className="listItemHeader">
            <span className="listItemBadge">ID: {row.id}</span>
            <div style={{ display: "inline-flex", gap: 10, alignItems: "center" }}>
              <select
                style={{ width: "auto" }}
                value={row.active ? "true" : "false"}
                onChange={(e) => handleUpdateRow(idx, { active: e.target.value === "true" })}
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
              <button
                type="button"
                className="btn thin danger"
                onClick={() => handleDeleteRow(idx)}
                disabled={busy}
              >
                Delete
              </button>
            </div>
          </div>
          <div className="formGrid" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
            <div className="formField">
              <label>Label</label>
              <input
                value={row.label}
                onChange={(e) => handleUpdateRow(idx, { label: e.target.value })}
              />
            </div>
            <div className="formField">
              <label>URL</label>
              <input
                value={row.href}
                onChange={(e) => handleUpdateRow(idx, { href: e.target.value })}
              />
            </div>
            <div className="formField">
              <label>Icon Key</label>
              <input
                value={row.icon}
                onChange={(e) => handleUpdateRow(idx, { icon: e.target.value })}
              />
            </div>
          </div>
        </div>
      ))}
      <div className="actionRow">
        <button className="btn" onClick={handleAddRow}>
          <FontAwesomeIcon icon={faPlus} />
          Add Link
        </button>
        <div style={{ marginLeft: "auto", display: "flex", gap: 12 }}>
          <button className="btn" onClick={handleReset} disabled={busy}>
            Reset
          </button>
          <TripleProgressButton
            label="Save Socials"
            busy={busy}
            disabled={busy}
            isDirty={isDirty}
            onConfirm={onSave}
          />
        </div>
      </div>
    </div>
  );
};

export default SocialsPanel;
