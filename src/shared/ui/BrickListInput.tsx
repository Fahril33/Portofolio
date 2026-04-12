import React, { useMemo, useState } from "react";
import "./brickListInput.css";

export type BrickItem = {
  id: string;
  label: string;
};

export type BrickListInputProps = {
  label: string;
  items: BrickItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAdd: (label: string) => void;
  onDelete: (id: string) => void;
  placeholder?: string;
};

const BrickListInput: React.FC<BrickListInputProps> = ({
  label,
  items,
  selectedId,
  onSelect,
  onAdd,
  onDelete,
  placeholder = "Tambah text…",
}) => {
  const [draft, setDraft] = useState("");

  const normalizedItems = useMemo(
    () =>
      items
        .map((i) => ({ ...i, label: i.label.trim() }))
        .filter((i) => i.label.length > 0),
    [items],
  );

  const submit = () => {
    const next = draft.trim();
    if (!next) return;
    onAdd(next);
    setDraft("");
  };

  return (
    <div className="brickField">
      <div className="brickLabel">{label}</div>
      <div className="brickList" role="list">
        {normalizedItems.map((item) => (
          <div
            key={item.id}
            role="listitem"
            className={`brick ${selectedId === item.id ? "selected" : ""}`}
            tabIndex={0}
            onClick={() => onSelect(item.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") onSelect(item.id);
            }}
            title="Klik untuk set default"
          >
            <span className="brickText">{item.label}</span>
            <button
              type="button"
              className="brickDelete"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(item.id);
              }}
              aria-label={`Delete ${item.label}`}
              title="Delete"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <div className="brickAddRow">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={placeholder}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
          }}
        />
        <button type="button" className="btn thin" onClick={submit}>
          Add
        </button>
      </div>
    </div>
  );
};

export default BrickListInput;

