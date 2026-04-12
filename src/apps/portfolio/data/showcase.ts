import { ShowcaseTag } from "../components/ShowcaseCard";

const placeholderImage =
  "https://preview-portfolio-7cl47fdfw0aqoci9j.vusercontent.net/placeholder.svg?height=400&width=600";

const tags: Record<string, ShowcaseTag> = {
  node: { label: "Node.js", backgroundColor: "#3C873A", color: "#fff" },
  react: { label: "React", backgroundColor: "#61dafb", color: "#222" },
  ts: { label: "TypeScript", backgroundColor: "#3178c6", color: "#fff" },
  css: { label: "CSS", backgroundColor: "#222", color: "#fff" },
  tailwind: { label: "Tailwind CSS", backgroundColor: "#3b82f6", color: "#fff" },
  supabase: { label: "Supabase", backgroundColor: "#3ecf8e", color: "#fff" },
};

export const currentShowcase = {
  headerTitle: "Ongoing Project",
  projectTitle: "Quick Notes",
  description:
    "Quick Notes is a personal scheduler application that is simple and flexible, designed to help users manage their daily routines, weekly schedules, important events, and task lists efficiently. With main features such as weekly flat schedule, daily schedule in template (reusable without data duplicate), interactive calendar with reminders, and multifunctional todo list (task, activity, notes).",
  imageSrc: placeholderImage,
  imageAlt: "Quick Notes logo (placeholder)",
  imageTitle:
    "This is a placeholder logo. It will be replaced with a real logo when the project is complete.",
  tags: [tags.node, tags.react, tags.ts, tags.css, tags.tailwind, tags.supabase],
};

export const futureShowcases = [
  {
    headerTitle: "Planned Project",
    projectTitle: "Quick Math",
    description:
      "Quick Math is a math game that challenges players to solve math problems as fast as possible. With many features and customization options, it is a fun and engaging way to improve your math skills.",
    imageSrc: placeholderImage,
    imageAlt: "Quick Math logo (placeholder)",
    imageTitle:
      "This is a placeholder logo. It will be replaced with a real logo when the project is complete.",
    tags: [tags.node, tags.react, tags.ts, tags.css, tags.supabase],
  },
] as const;
