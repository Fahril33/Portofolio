import React, { useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import type { ShowcaseRow, SkillItemRow } from "../../types/adminTypes";
import TripleProgressButton from "../../../../shared/ui/TripleProgressButton";

interface ShowcasesPanelProps {
  showcases: ShowcaseRow[];
  skillItems: SkillItemRow[];
  busy: boolean;
  baseline: ShowcaseRow[] | null;
  setShowcases: React.Dispatch<React.SetStateAction<ShowcaseRow[]>>;
  onSave: () => Promise<void>;
}

const ShowcasesPanel: React.FC<ShowcasesPanelProps> = ({
  showcases,
  skillItems,
  busy,
  baseline,
  setShowcases,
  onSave,
}): React.ReactElement => {
  const isDirty = useMemo((): boolean => {
    if (!baseline) return false;
    return JSON.stringify(showcases) !== JSON.stringify(baseline);
  }, [showcases, baseline]);

  const handleReset = (): void => {
    if (!baseline) return;
    setShowcases([...baseline]);
  };

  const handleUpdateRow = (idx: number, patch: Partial<ShowcaseRow>): void => {
    setShowcases((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], ...patch };
      return next;
    });
  };

  const handleDeleteRow = (idx: number): void => {
    setShowcases((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleAddRow = (): void => {
    setShowcases((prev) => [
      ...prev,
      {
        id: Math.max(0, ...prev.map((p) => p.id)) + 1,
        status: "current" as const,
        header_title: "New Project",
        project_title: "Title",
        description: "Description here...",
        image_url: "",
        image_alt: "",
        image_title: "",
        tags: [],
        sort_order: prev.length + 1,
        active: true,
      },
    ]);
  };

  const handleToggleTag = (idx: number, row: ShowcaseRow, skillId: number, checked: boolean): void => {
    const currentTags = Array.isArray(row.tags) ? [...(row.tags as number[])] : [];
    if (checked) {
      if (!currentTags.includes(skillId)) {
        currentTags.push(skillId);
      }
    } else {
      const ix = currentTags.indexOf(skillId);
      if (ix > -1) currentTags.splice(ix, 1);
    }
    handleUpdateRow(idx, { tags: currentTags });
  };

  return (
    <div className="listContainer">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h3 style={{ margin: 0, color: "var(--text-color)" }}>Works &amp; Showcases</h3>
        <button className="btn" onClick={handleAddRow}>
          <FontAwesomeIcon icon={faPlus} /> Add Project
        </button>
      </div>

      {showcases.map((row, idx) => (
        <div key={row.id} className="listItem">
          <div className="listItemHeader">
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <select
                value={row.status}
                onChange={(e) =>
                  handleUpdateRow(idx, { status: e.target.value as "current" | "future" })
                }
                style={{
                  background: row.status === "current" ? "#3ecf8e" : "#3178c6",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  padding: "2px 8px",
                  fontSize: "0.75rem",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                <option value="current">CURRENT</option>
                <option value="future">FUTURE</option>
              </select>
              <span style={{ fontWeight: 600 }}>{row.project_title || "Untitled"}</span>
            </div>
            <button
              className="btn thin"
              style={{ color: "var(--error-color)" }}
              onClick={() => handleDeleteRow(idx)}
              title="Hapus Project"
            >
              <FontAwesomeIcon icon={faTrash} />
            </button>
          </div>

          <div className="formGrid">
            <div className="formField">
              <label>Project Title</label>
              <input
                value={row.project_title}
                onChange={(e) => handleUpdateRow(idx, { project_title: e.target.value })}
              />
            </div>
            <div className="formField">
              <label>Header Title</label>
              <input
                value={row.header_title}
                onChange={(e) => handleUpdateRow(idx, { header_title: e.target.value })}
              />
            </div>
            <div className="formField fullWidth">
              <label>Description</label>
              <textarea
                value={row.description}
                onChange={(e) => handleUpdateRow(idx, { description: e.target.value })}
                style={{ minHeight: "80px" }}
              />
            </div>
            <div className="formField">
              <label>Image URL</label>
              <input
                value={row.image_url}
                onChange={(e) => handleUpdateRow(idx, { image_url: e.target.value })}
              />
            </div>

            <div className="formField fullWidth" style={{ gridColumn: "1 / -1" }}>
              <label style={{ marginBottom: 12, display: "block" }}>Linked Skills (Tags)</label>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
                  gap: "10px",
                  padding: "12px",
                  background: "rgba(255,255,255,0.05)",
                  borderRadius: "8px",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                {skillItems.map((skill) => (
                  <label
                    key={skill.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      cursor: "pointer",
                      fontSize: "0.8rem",
                      padding: "4px 8px",
                      borderRadius: "4px",
                      transition: "background 0.2s",
                    }}
                    className="hoverDim"
                  >
                    <input
                      type="checkbox"
                      checked={Array.isArray(row.tags) && (row.tags as number[]).includes(skill.id)}
                      onChange={(e) => handleToggleTag(idx, row, skill.id, e.target.checked)}
                    />
                    {skill.label}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}

      <div className="actionRow">
        <button className="btn" onClick={handleReset} disabled={busy}>
          Reset
        </button>
        <TripleProgressButton
          label="Save Showcases"
          busy={busy}
          disabled={busy}
          isDirty={isDirty}
          onConfirm={onSave}
        />
      </div>
    </div>
  );
};

export default ShowcasesPanel;
