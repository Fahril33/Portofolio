import React, { useCallback, useEffect, useRef, useState } from "react";
import "./styles/headbar.css";
import { navigateTo } from "../../../lib/navigation";

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
  const [show, setShow] = useState(true);
  const [activeSection, setActiveSection] = useState<SectionId>("hero");
  const lastScroll = useRef(typeof window !== "undefined" ? window.scrollY : 0);
  const rafId = useRef<number | null>(null);
  const logoClick = useRef<{ count: number; lastAt: number }>({
    count: 0,
    lastAt: 0,
  });

  const scrollToSection = useCallback((id: SectionId) => {
    const el = document.getElementById(id);
    if (!el) return;

    const headerOffset = 90;
    const elementPosition = el.getBoundingClientRect().top + window.scrollY;
    const offsetPosition = Math.max(0, elementPosition - headerOffset);
    window.scrollTo({ top: offsetPosition, behavior: "smooth" });
  }, []);

  const updateActiveSection = useCallback(() => {
    const currentScroll = window.scrollY;
    setShow((prev) => {
      const next = currentScroll <= lastScroll.current || currentScroll <= 50;
      return prev === next ? prev : next;
    });
    lastScroll.current = currentScroll;

    let found = false;
    for (const id of SECTION_IDS) {
      const el = document.getElementById(id);
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= 80 && rect.bottom > 80 && !found) {
          setActiveSection((prev) => (prev === id ? prev : id));
          found = true;
        }
      }
    }
    if (!found) setActiveSection((prev) => (prev === "hero" ? prev : "hero"));
  }, []);

  const handleScroll = useCallback(() => {
    if (rafId.current != null) return;
    rafId.current = window.requestAnimationFrame(() => {
      rafId.current = null;
      updateActiveSection();
    });
  }, [updateActiveSection]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    updateActiveSection();
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafId.current != null) window.cancelAnimationFrame(rafId.current);
    };
  }, [handleScroll, updateActiveSection]);

  const navbarStyle: React.CSSProperties = {
    transform: show ? "translateY(0)" : "translateY(-108%)",
    transition: "transform 0.5s cubic-bezier(0.86, 0, 0.07, 1)",
  };

  return (
    <nav className="navbar" style={navbarStyle}>
      <p
        className="DropdownNav"
        tabIndex={0}
        aria-label="Home"
        role="button"
        onClick={() => {
          const now = Date.now();
          const within = now - logoClick.current.lastAt < 450;
          logoClick.current.count = within ? logoClick.current.count + 1 : 1;
          logoClick.current.lastAt = now;

          if (logoClick.current.count >= 3) {
            logoClick.current.count = 0;
            navigateTo("/login");
            return;
          }

          scrollToSection("hero");
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") scrollToSection("hero");
        }}
      >
        <b>{codeSymbol}</b>
      </p>
      <ul>
        {SECTION_IDS.map((id) => (
          <li
            key={id}
            className={activeSection === id ? "active" : ""}
            aria-current={activeSection === id ? "page" : undefined}
          >
            <a
              href={`#${id}`}
              onClick={(e) => {
                e.preventDefault();
                scrollToSection(id);
              }}
            >
              {NAV_LABELS[id]}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Headbar;
