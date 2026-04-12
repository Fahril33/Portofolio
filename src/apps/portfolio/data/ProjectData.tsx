import {
  JavascriptIcon,
  TypescriptIcon,
  PhpIcon,
  PythonIcon,
  NodeJsIcon,
  ReactIcon,
  CSS3Icon,
  FigmaIcon,
  TailwindIcon,
  BootstrapIcon,
  SupabaseIcon,
  MySQLIcon,
  MongoDBIcon,
} from "../components/icons/SVGs";

import { IconType } from "../components/icons/IconType";

export interface ProjectItem {
  id?: number | string;
  label: string;
  Icon: IconType;
}

export interface ProjectCategory {
  title: string;
  items: ProjectItem[];
}

export const projectData: ProjectCategory[] = [
  {
    title: "Programming Language",
    items: [
      { label: "Javascript", Icon: JavascriptIcon },
      { label: "Typescript", Icon: TypescriptIcon },
      { label: "PHP", Icon: PhpIcon },
      { label: "Python", Icon: PythonIcon },
    ],
  },
  {
    title: "Framework & Library",
    items: [
      { label: "NodeJs", Icon: NodeJsIcon },
      { label: "React", Icon: ReactIcon },
    ],
  },
  {
    title: "UI/UX Design",
    items: [
      { label: "Vanilla CSS", Icon: CSS3Icon },
      { label: "Tailwind CSS", Icon: TailwindIcon },
      { label: "Bootstrap", Icon: BootstrapIcon },
      { label: "Figma", Icon: FigmaIcon },
    ],
  },
  {
    title: "Database",
    items: [
      { label: "MongoDB", Icon: MongoDBIcon },
      { label: "Supabase", Icon: SupabaseIcon },
      { label: "MySQL", Icon: MySQLIcon },
    ],
  },
];
