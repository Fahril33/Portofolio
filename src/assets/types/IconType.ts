import { FC, SVGProps } from "react";

export type IconType = FC<SVGProps<SVGSVGElement>> | (() => JSX.Element);
