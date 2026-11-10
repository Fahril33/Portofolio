import { useCallback, useEffect, useRef, useState } from "react";
import { SECTION_IDS, type SectionId } from "../data/navSections";

export interface UseHeadbarScrollResult {
  show: boolean;
  activeSection: SectionId;
  scrollToSection: (id: SectionId) => void;
}

const SCROLL_THRESHOLD = 12;

export const useHeadbarScroll = (): UseHeadbarScrollResult => {
  const [show, setShow] = useState<boolean>(true);
  const [activeSection, setActiveSection] = useState<SectionId>("hero");
  const lastScroll = useRef<number>(typeof window !== "undefined" ? window.scrollY : 0);
  const scrollAnchor = useRef<number>(typeof window !== "undefined" ? window.scrollY : 0);
  const lastDirection = useRef<"up" | "down">("down");
  const rafId = useRef<number | null>(null);

  const scrollToSection = useCallback((id: SectionId): void => {
    const el = document.getElementById(id);
    if (!el) return;

    const headerOffset = 90;
    const elementPosition = el.getBoundingClientRect().top + window.scrollY;
    const offsetPosition = Math.max(0, elementPosition - headerOffset);
    window.scrollTo({ top: offsetPosition, behavior: "smooth" });
  }, []);

  const updateActiveSection = useCallback((): void => {
    const currentScroll = Math.max(0, window.scrollY);
    const prevScroll = lastScroll.current;
    const delta = currentScroll - prevScroll;
    lastScroll.current = currentScroll;

    // Hysteresis scroll direction management to prevent glitching/flicker
    if (currentScroll <= 50) {
      setShow(true);
      scrollAnchor.current = currentScroll;
      lastDirection.current = "up";
    } else if (delta > 0) {
      // Scrolling down
      if (lastDirection.current !== "down") {
        lastDirection.current = "down";
        scrollAnchor.current = currentScroll;
      } else if (currentScroll - scrollAnchor.current > SCROLL_THRESHOLD && currentScroll > 60) {
        setShow(false);
        scrollAnchor.current = currentScroll;
      }
    } else if (delta < 0) {
      // Scrolling up
      if (lastDirection.current !== "up") {
        lastDirection.current = "up";
        scrollAnchor.current = currentScroll;
      } else if (scrollAnchor.current - currentScroll > SCROLL_THRESHOLD) {
        setShow(true);
        scrollAnchor.current = currentScroll;
      }
    }

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

  const handleScroll = useCallback((): void => {
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

  return {
    show,
    activeSection,
    scrollToSection,
  };
};
