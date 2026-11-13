import React from "react";
import { NAV_LABELS, SECTION_IDS, type SectionId } from "../data/navSections";

export interface NavMenuListProps {
  activeSection: SectionId;
  onSelectSection: (id: SectionId) => void;
}

export const NavMenuList: React.FC<NavMenuListProps> = ({
  activeSection,
  onSelectSection,
}: NavMenuListProps): React.JSX.Element => {
  const handleItemClick = (id: SectionId): void => {
    onSelectSection(id);
  };

  const handleLinkClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    id: SectionId
  ): void => {
    e.preventDefault();
    e.stopPropagation();
    onSelectSection(id);
  };

  return (
    <ul>
      {SECTION_IDS.map((id) => (
        <li
          key={id}
          className={activeSection === id ? "active" : ""}
          aria-current={activeSection === id ? "page" : undefined}
          onClick={(): void => handleItemClick(id)}
        >
          <a
            href={`#${id}`}
            onClick={(e: React.MouseEvent<HTMLAnchorElement>): void =>
              handleLinkClick(e, id)
            }
          >
            {NAV_LABELS[id]}
          </a>
        </li>
      ))}
    </ul>
  );
};
