import React from "react";
import "../components/styles/currentSection.css";
import "../components/styles/cards.css";
import ShowcaseCard from "../components/ShowcaseCard";
import { isSupabaseConfigured, supabaseGet } from "../../../lib/supabaseRest";
import type { ShowcaseTag } from "../components/ShowcaseCard";

type ShowcaseModel = {
  headerTitle: string;
  projectTitle: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  imageTitle?: string;
  tags: ShowcaseTag[];
};

type ShowcaseRow = {
  id: number;
  status: "current" | "future";
  header_title: string;
  project_title: string;
  description: string;
  image_url: string;
  image_alt: string;
  image_title: string | null;
  tags: unknown;
  sort_order: number;
  active: boolean;
};

type SkillItemRow = {
  id: number;
  label: string;
  text_color: string | null;
  bg_color: string | null;
};

const normalizeTags = (
  value: unknown,
  skills: SkillItemRow[],
): ShowcaseTag[] => {
  if (!Array.isArray(value)) return [];

  // value is expected to be number[] (IDs) or string[] / old object format
  return value
    .map((v) => {
      let skill: SkillItemRow | undefined;

      if (typeof v === "number") {
        skill = skills.find((s) => s.id === v);
      } else if (typeof v === "string") {
        // Fallback for old string tags
        skill = skills.find((s) => s.label.toLowerCase() === v.toLowerCase());
      } else if (v && typeof v === "object") {
        // Fallback for old object tags
        const label = (v as any).label || "";
        skill = skills.find((s) => s.label.toLowerCase() === label.toLowerCase());
      }

      if (!skill) return null;

      return {
        label: skill.label,
        backgroundColor: skill.bg_color || "#3C873A",
        color: skill.text_color || "#ffffff",
      };
    })
    .filter((v): v is ShowcaseTag => Boolean(v));
};

function CurrentSection() {
  const [remote, setRemote] = React.useState<ShowcaseModel | null | undefined>(undefined);

  React.useEffect(() => {
    if (!isSupabaseConfigured()) {
      setRemote(null);
      return;
    }
    let cancelled = false;

    const load = async () => {
      try {
        const [showcaseRows, skillItems] = await Promise.all([
          supabaseGet<ShowcaseRow[]>(
            "showcases",
            "status=eq.current&active=eq.true&order=sort_order.asc&limit=1",
            { select: "*" },
          ),
          supabaseGet<SkillItemRow[]>("skill_items", "active=eq.true", {
            select: "id,label,text_color,bg_color",
          }),
        ]);

        if (cancelled) return;
        const row = showcaseRows[0];
        if (!row) {
          setRemote(null);
          return;
        }

        const tags = normalizeTags(row.tags, skillItems);
        setRemote({
          headerTitle: row.header_title,
          projectTitle: row.project_title,
          description: row.description,
          imageSrc: row.image_url,
          imageAlt: row.image_alt,
          ...(row.image_title ? { imageTitle: row.image_title } : {}),
          tags,
        });
      } catch {
        setRemote(null);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (remote === undefined) return null; // loading

  if (remote === null) {
    return null; // Don't render section if there are no current projects
  }

  return (
    <div className="currentSectionContainer" id="current">
      <h1 className="Text Header">Where I'm At</h1>
      <div className="currentSection">
        <ShowcaseCard {...remote} />
      </div>
    </div>
  );
}

export default CurrentSection;
