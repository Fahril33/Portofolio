import React, { useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import type { SkillsDraft } from "../../types/adminTypes";
import TripleProgressButton from "../../../../shared/ui/TripleProgressButton";

interface SkillsPanelProps {
  skillsDraft: SkillsDraft;
  skillCounts: { categories: number; items: number };
  busy: boolean;
  baseline: SkillsDraft | null;
  setSkillsDraft: React.Dispatch<React.SetStateAction<SkillsDraft>>;
  onSave: () => Promise<void>;
}

const SkillsPanel: React.FC<SkillsPanelProps> = ({
  skillsDraft,
  skillCounts,
  busy,
  baseline,
  setSkillsDraft,
  onSave,
}): React.ReactElement => {
  const isDirty = useMemo((): boolean => {
    if (!baseline) return false;
    return JSON.stringify(skillsDraft) !== JSON.stringify(baseline);
  }, [skillsDraft, baseline]);

  const handleReset = (): void => {
    if (!baseline) return;
    setSkillsDraft({ ...baseline });
  };

  const handleAddCategory = (): void => {
    const nextCats = [...skillsDraft.categories];
    nextCats.push({
      id: Math.max(0, ...nextCats.map((c) => c.id)) + 1,
      title: "New Category",
      sort_order: nextCats.length + 1,
      active: true,
    });
    setSkillsDraft((prev) => ({ ...prev, categories: nextCats }));
  };

  const handleDeleteCategory = (catIdx: number, catId: number): void => {
    const nextCats = skillsDraft.categories.filter((_, i) => i !== catIdx);
    const nextItems = skillsDraft.items.filter((i) => i.category_id !== catId);
    setSkillsDraft({ categories: nextCats, items: nextItems });
  };

  const handleAddSkill = (catId: number): void => {
    const nextItems = [...skillsDraft.items];
    nextItems.push({
      id: Math.max(0, ...nextItems.map((i) => i.id)) + 1,
      category_id: catId,
      label: "New Skill",
      icon_key: "code",
      text_color: "#ffffff",
      bg_color: "#3C873A",
      sort_order: nextItems.filter((i) => i.category_id === catId).length + 1,
      active: true,
    });
    setSkillsDraft((prev) => ({ ...prev, items: nextItems }));
  };

  const handleDeleteSkill = (itemId: number): void => {
    const nextItems = skillsDraft.items.filter((x) => x.id !== itemId);
    setSkillsDraft((prev) => ({ ...prev, items: nextItems }));
  };

  const handleUpdateCategoryTitle = (catIdx: number, title: string): void => {
    const nextCats = [...skillsDraft.categories];
    nextCats[catIdx] = { ...nextCats[catIdx], title };
    setSkillsDraft((prev) => ({ ...prev, categories: nextCats }));
  };

  const handleUpdateItem = (globalIdx: number, patch: Record<string, unknown>): void => {
    const nextItems = [...skillsDraft.items];
    nextItems[globalIdx] = { ...nextItems[globalIdx], ...patch };
    setSkillsDraft((prev) => ({ ...prev, items: nextItems }));
  };

  return (
    <div className="formGrid">
      <div className="formField fullWidth">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ margin: 0, color: "var(--text-color)" }}>Skill Matrix</h3>
          <button className="btn" onClick={handleAddCategory}>
            <FontAwesomeIcon icon={faPlus} /> Add Category
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {skillsDraft.categories.map((cat, catIdx) => (
            <div
              key={cat.id}
              className="listItem"
              style={{ display: "flex", flexDirection: "column", gap: 16 }}
            >
              {/* Category Row */}
              <div style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
                <div className="formField" style={{ flex: 1, marginBottom: 0 }}>
                  <label>Category Title</label>
                  <input
                    value={cat.title}
                    onChange={(e) => handleUpdateCategoryTitle(catIdx, e.target.value)}
                  />
                </div>
                <button className="btn thin" onClick={() => handleAddSkill(cat.id)}>
                  <FontAwesomeIcon icon={faPlus} /> Add Skill
                </button>
                <button
                  className="btn thin"
                  style={{ color: "var(--error-color)" }}
                  onClick={() => handleDeleteCategory(catIdx, cat.id)}
                >
                  Hapus
                </button>
              </div>

              {/* Items Grid */}
              {skillsDraft.items.filter((i) => i.category_id === cat.id).length > 0 && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
                    gap: 12,
                    paddingLeft: 16,
                    borderLeft: "2px solid rgba(255,255,255,0.1)",
                  }}
                >
                  {skillsDraft.items
                    .filter((i) => i.category_id === cat.id)
                    .map((item) => {
                      const globalIdx = skillsDraft.items.findIndex((x) => x.id === item.id);
                      return (
                        <div
                          key={item.id}
                          style={{
                            display: "flex",
                            gap: 8,
                            background: "rgba(0,0,0,0.2)",
                            padding: "8px 12px",
                            borderRadius: 6,
                            alignItems: "center",
                          }}
                        >
                          <input
                            value={item.label}
                            placeholder="Skill Label"
                            style={{ flex: 1, padding: "6px 8px" }}
                            onChange={(e) => handleUpdateItem(globalIdx, { label: e.target.value })}
                          />
                          <input
                            value={item.icon_key}
                            placeholder="Icon"
                            style={{ width: 100, padding: "6px 8px" }}
                            onChange={(e) => handleUpdateItem(globalIdx, { icon_key: e.target.value })}
                          />
                          <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                            <input
                              type="color"
                              value={item.text_color || "#ffffff"}
                              title="Text Color"
                              style={{ width: 30, height: 30, padding: 0, border: "none", background: "none" }}
                              onChange={(e) => handleUpdateItem(globalIdx, { text_color: e.target.value })}
                            />
                            <input
                              type="color"
                              value={item.bg_color || "#3C873A"}
                              title="BG Color"
                              style={{ width: 30, height: 30, padding: 0, border: "none", background: "none" }}
                              onChange={(e) => handleUpdateItem(globalIdx, { bg_color: e.target.value })}
                            />
                          </div>
                          <button
                            className="btn thin"
                            style={{ color: "var(--error-color)", padding: "6px 10px" }}
                            onClick={() => handleDeleteSkill(item.id)}
                            title="Remove Skill"
                          >
                            &times;
                          </button>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="actionRow">
        <div style={{ marginRight: "auto", display: "flex", alignItems: "center", gap: 12 }}>
          <span className="listItemBadge">{skillCounts.categories} Categories</span>
          <span className="listItemBadge">{skillCounts.items} Items</span>
        </div>
        <button className="btn" onClick={handleReset} disabled={busy}>
          Reset
        </button>
        <TripleProgressButton
          label="Save Skills"
          busy={busy}
          disabled={busy}
          isDirty={isDirty}
          onConfirm={onSave}
        />
      </div>
    </div>
  );
};

export default SkillsPanel;
