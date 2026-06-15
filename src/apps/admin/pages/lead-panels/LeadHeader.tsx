import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faStar,
  faShareAlt,
  faImages,
  faCode,
  faSync,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import type { PortfolioTab } from "../../types/adminTypes";
import DbStatusIndicator from "../../../../shared/ui/DbStatusIndicator";

interface LeadHeaderProps {
  activeProject: string;
  activeTab: PortfolioTab;
  busy: boolean;
  onReload: () => Promise<void>;
  onSelectTab: (tab: PortfolioTab) => void;
  getConnectionStatus: (tab: PortfolioTab) => boolean;
}

const TABS: { label: PortfolioTab; icon: typeof faStar }[] = [
  { label: "Hero", icon: faStar },
  { label: "About", icon: faUser },
  { label: "Socials", icon: faShareAlt },
  { label: "Showcases", icon: faImages },
  { label: "Skills", icon: faCode },
];

const LeadHeader: React.FC<LeadHeaderProps> = ({
  activeProject,
  activeTab,
  busy,
  onReload,
  onSelectTab,
  getConnectionStatus,
}): React.ReactElement => {
  return (
    <>
      <header className="leadHeader">
        <div className="breadcrumb">
          <span>Projects</span>
          <FontAwesomeIcon icon={faChevronRight} style={{ fontSize: "0.7rem" }} />
          <span>{activeProject}</span>
          <FontAwesomeIcon icon={faChevronRight} style={{ fontSize: "0.7rem" }} />
          <span style={{ color: "var(--accent-color)" }}>{activeTab}</span>
        </div>
        <div className="headerActions">
          <button
            className="btn thin"
            onClick={() => void onReload()}
            disabled={busy}
          >
            <FontAwesomeIcon icon={faSync} spin={busy} />
            <span>Reload</span>
          </button>
        </div>
      </header>

      {activeProject === "Portfolio" && (
        <nav className="portfolioTabs">
          {TABS.map((t) => (
            <div
              key={t.label}
              className={`tabItem ${activeTab === t.label ? "active" : ""}`}
              onClick={() => onSelectTab(t.label)}
              style={{ display: "flex", alignItems: "center" }}
            >
              <FontAwesomeIcon icon={t.icon} style={{ marginRight: 8 }} />
              <span>{t.label}</span>
              <DbStatusIndicator isConnected={getConnectionStatus(t.label)} showLabel={false} />
            </div>
          ))}
        </nav>
      )}
    </>
  );
};

export default LeadHeader;
