import React, { useEffect, useRef, useState, useCallback } from "react";
import "./styles/headbar.css";

const SECTION_IDS = [
  "hero",
  "about",
  "projects",
  "current",
  "future",
  "contact",
] as const;

type SectionId = (typeof SECTION_IDS)[number];

const NAV_LABELS: Record<SectionId, string> = {
  hero: "Hero",
  about: "About",
  projects: "Projects",
  current: "Current",
  future: "Future",
  contact: "Contact",
};

const Headbar: React.FC = () => {
  const codeSymbol = "</>";
  const [show, setShow] = useState<boolean>(true);
  const [activeSection, setActiveSection] = useState<SectionId>("hero");
  const lastScroll = useRef<number>(
    typeof window !== "undefined" ? window.scrollY : 0
  );

  const handleScroll = useCallback(() => {
    const currentScroll = window.scrollY;
    setShow(currentScroll <= lastScroll.current || currentScroll <= 50);
    lastScroll.current = currentScroll;

    let found = false;
    for (const id of SECTION_IDS) {
      const el = document.getElementById(id);
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= 80 && rect.bottom > 80 && !found) {
          setActiveSection(id);
          found = true;
        }
      }
    }
    if (!found) setActiveSection("hero");
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const navbarStyle: React.CSSProperties = {
    transform: show ? "translateY(0)" : "translateY(-108%)",
    transition: "transform 0.5s cubic-bezier(0.86, 0, 0.07, 1)",
  };

  const handleNavClick = (id: SectionId) => {
    const el = document.getElementById(id);
    if (el) {
      window.scrollTo({ top: el.offsetTop, behavior: "smooth" });
    }
  };

  return (
    <nav className="navbar" style={navbarStyle}>
      <p className="DropdownNav" tabIndex={0} aria-label="Home">
        <b>{codeSymbol}</b>
      </p>
      <ul>
        {SECTION_IDS.map((id) => (
          <li
            key={id}
            className={activeSection === id ? "active" : ""}
            onClick={() => handleNavClick(id)}
            tabIndex={0}
            aria-current={activeSection === id ? "page" : undefined}
            role="button"
            onKeyPress={(e) => {
              if (e.key === "Enter" || e.key === " ") handleNavClick(id);
            }}
          >
            {NAV_LABELS[id]}
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Headbar;
