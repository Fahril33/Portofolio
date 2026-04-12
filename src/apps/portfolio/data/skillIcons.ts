import {
  BootstrapIcon,
  CSS3Icon,
  FigmaIcon,
  JavascriptIcon,
  MongoDBIcon,
  MySQLIcon,
  NodeJsIcon,
  PhpIcon,
  PythonIcon,
  ReactIcon,
  SupabaseIcon,
  TailwindIcon,
  TypescriptIcon,
} from "../components/icons/SVGs";

import type { IconType } from "../components/icons/IconType";

export const skillIconMap: Record<string, IconType> = {
  javascript: JavascriptIcon,
  typescript: TypescriptIcon,
  php: PhpIcon,
  python: PythonIcon,
  nodejs: NodeJsIcon,
  react: ReactIcon,
  css3: CSS3Icon,
  figma: FigmaIcon,
  tailwind: TailwindIcon,
  bootstrap: BootstrapIcon,
  supabase: SupabaseIcon,
  mysql: MySQLIcon,
  mongodb: MongoDBIcon,
};
