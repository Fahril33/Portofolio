import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBriefcase,
  faCode,
  faPlus,
  faSignOutAlt,
  faExternalLinkAlt,
} from "@fortawesome/free-solid-svg-icons";

interface LeadSidebarProps {
  activeProject: string;
  onSelectProject: (name: string) => void;
  onViewSite: () => void;
  onLogout: () => Promise<void>;
}

const PROJECTS = [
  { name: "Portfolio", icon: faBriefcase, enabled: true },
  { name: "Quick Notes", icon: faCode, enabled: false },
  { name: "Quick Math", icon: faPlus, enabled: false },
] as const;

const LeadSidebar: React.FC<LeadSidebarProps> = ({
  activeProject,
  onSelectProject,
  onViewSite,
  onLogout,
}): React.ReactElement => {
  return (
    <aside className="leadSidebar">
      <div className="sidebarBrand">
        <h2>Admin Center</h2>
      </div>
      <nav className="sidebarMenu">
        {PROJECTS.map((p) => (
          <div
            key={p.name}
            className={`sidebarItem ${activeProject === p.name ? "active" : ""} ${
              !p.enabled ? "disabled" : ""
            }`}
            onClick={() => p.enabled && onSelectProject(p.name)}
          >
            <div className="sidebarItemContent">
              <FontAwesomeIcon icon={p.icon} fixedWidth />
              <span>{p.name}</span>
            </div>
            {p.enabled && (
              <div
                className="sidebarItemAction"
                title="View Site"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewSite();
                }}
              >
                <FontAwesomeIcon
                  icon={faExternalLinkAlt}
                  style={{ fontSize: "0.8rem" }}
                />
              </div>
            )}
          </div>
        ))}
      </nav>
      <div className="sidebarFooter">
        <button className="btn btnLogout" onClick={() => void onLogout()}>
          <FontAwesomeIcon icon={faSignOutAlt} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default LeadSidebar;
