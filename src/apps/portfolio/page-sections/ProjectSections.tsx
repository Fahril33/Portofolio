import React from "react";
import "../components/styles/projectSection.css";
import ProjectCard from "../components/ProjectCard";
import { isSupabaseConfigured, supabaseGet } from "../../../lib/supabaseRest";
import { skillIconMap } from "../data/skillIcons";
import type { ProjectCategory } from "../data/ProjectData";
import type { IconType } from "../components/icons/IconType";

type CategoryRow = {
  id: number;
  title: string;
  sort_order: number;
  active: boolean;
};

type ItemRow = {
  id: number;
  category_id: number;
  label: string;
  icon_key: string;
  sort_order: number;
  active: boolean;
};

const ProjectSections: React.FC = () => {
  const [remote, setRemote] = React.useState<ProjectCategory[] | null | undefined>(undefined);

  React.useEffect(() => {
    if (!isSupabaseConfigured()) {
      setRemote(null);
      return;
    }
    let cancelled = false;

    const load = async () => {
      try {
        const [categories, items] = await Promise.all([
          supabaseGet<CategoryRow[]>(
            "skill_categories",
            "active=eq.true&order=sort_order.asc",
            { select: "*" },
          ),
          supabaseGet<ItemRow[]>(
            "skill_items",
            "active=eq.true&order=sort_order.asc",
            { select: "*" },
          ),
        ]);

        if (cancelled) return;

        const byCategory = new Map<number, ItemRow[]>();
        for (const item of items) {
          const list = byCategory.get(item.category_id) ?? [];
          list.push(item);
          byCategory.set(item.category_id, list);
        }

        const mapped: ProjectCategory[] = categories
          .map((cat) => {
            const catItems = byCategory.get(cat.id) ?? [];
            const normalized = catItems
              .map((it) => {
                const key = it.icon_key?.toLowerCase?.() ?? "";
                const Icon = (skillIconMap as Record<string, IconType>)[key];
                if (!Icon) return null;
                return { id: it.id, label: it.label, Icon };
              })
              .filter((v): v is NonNullable<typeof v> => Boolean(v));

            return { title: cat.title, items: normalized };
          })
          .filter((cat) => cat.items.length > 0);

        if (mapped.length > 0) {
          setRemote(mapped);
        } else {
          setRemote(null);
        }
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
  if (remote === null) return null; // empty

  return (
    <div className="projectSectionContainer" id="projects">
      <h1 className="Text Header">What I've Been Through</h1>
      <div className="projectSection">
        {remote.map((section) => (
          <ProjectCard
            key={section.title}
            title={section.title}
            items={section.items}
          />
        ))}
        
      </div>
      {/* <p style={{ color: "grey", textAlign: "center" }}>Simple Carousel here</p> */}
    </div>
  );
};

export default ProjectSections;
