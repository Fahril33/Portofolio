import React, { useEffect, useRef, useState } from "react";
import "./styles/headbar.css";
import {
  clearReturningFromLogin,
  isReturningFromLoginActive,
  navigateWithSlide,
} from "../../../lib/navigation";
import { LogoDynamicSlot } from "./LogoDynamicSlot";
import { NavMenuList } from "./NavMenuList";
import { useLogoWordCycle } from "../hooks/useLogoWordCycle";
import { useHeadbarScroll } from "../hooks/useHeadbarScroll";

const Headbar: React.FC = () => {
  const { show, activeSection, scrollToSection } = useHeadbarScroll();
  const [isPeeking, setIsPeeking] = useState<boolean>(false);
  const [isNavHovered, setIsNavHovered] = useState<boolean>(false);
  const [clickCount, setClickCount] = useState<number>(0);
  const [isReturningFromLogin, setIsEnteringFromLogin] = useState<boolean>(() => {
    return isReturningFromLoginActive();
  });
  const {
    step,
    activeWord,
    handleTopbarMouseEnter,
    handleTopbarMouseLeave,
    fastClose,
    forceIdle,
  } = useLogoWordCycle({
    disabled: clickCount > 0 || isReturningFromLogin || activeSection === "hero",
  });
  const clickTimer = useRef<number | null>(null);
  const isCooldown = useRef<boolean>(false);
  const logoClick = useRef<{ count: number; lastAt: number }>({
    count: 0,
    lastAt: 0,
  });

  useEffect(() => {
    const handleReturnEvent = (): void => {
      setIsEnteringFromLogin(true);
    };

    window.addEventListener("portfolio-return-from-login", handleReturnEvent);
    return () => window.removeEventListener("portfolio-return-from-login", handleReturnEvent);
  }, []);

  useEffect(() => {
    if (!isReturningFromLogin) return;
    const t = window.setTimeout(() => {
      setIsEnteringFromLogin(false);
      clearReturningFromLogin();
    }, 1500);
    return () => window.clearTimeout(t);
  }, [isReturningFromLogin]);

  useEffect(() => {
    if (!show) {
      setIsNavHovered(false);
      setIsPeeking(false);
    }
  }, [show]);

  useEffect(() => {
    if (show) {
      setIsPeeking(false);
      return;
    }

    const handleMouseMove = (e: MouseEvent): void => {
      if (e.clientY <= 5) {
        setIsPeeking(true);
      } else if (e.clientY > 30 && !isNavHovered) {
        setIsPeeking(false);
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [show, isNavHovered]);

  const handleLogoClick = (): void => {
    if (isCooldown.current || isReturningFromLogin) return;

    const now = Date.now();
    const within = now - logoClick.current.lastAt < 600;
    const nextCount = within ? logoClick.current.count + 1 : 1;
    logoClick.current.count = nextCount;
    logoClick.current.lastAt = now;

    setClickCount(nextCount);

    if (nextCount === 1) {
      fastClose();
    } else if (nextCount >= 3) {
      forceIdle();
    }

    if (clickTimer.current) {
      window.clearTimeout(clickTimer.current);
      clickTimer.current = null;
    }

    if (nextCount >= 3) {
      isCooldown.current = true;
      logoClick.current.count = 0;

      // After launch animation, trigger slide page transition
      window.setTimeout(() => {
        navigateWithSlide("/login");
      }, 1200);
      return;
    }

    clickTimer.current = window.setTimeout(() => {
      scrollToSection("hero");
      logoClick.current.count = 0;
      // Start cooldown during fadeout back to white
      isCooldown.current = true;
      setClickCount(0);
      window.setTimeout(() => {
        isCooldown.current = false;
      }, 600);
    }, 600);
  };

  const handleNavMouseEnter = (): void => {
    setIsNavHovered(true);
    handleTopbarMouseEnter();
  };

  const handleNavMouseLeave = (): void => {
    setIsNavHovered(false);
    setIsPeeking(false);
    handleTopbarMouseLeave();
  };

  const isVisible = show || isNavHovered;
  const isCompact = activeSection !== "hero";
  const transformValue = isVisible
    ? "translateY(0)"
    : isPeeking
    ? "translateY(calc(-100% + 7px))"
    : "translateY(-108%)";

  const navbarStyle: React.CSSProperties = {
    transform: transformValue,
    transition:
      "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), padding 0.35s cubic-bezier(0.16, 1, 0.3, 1), background 0.35s ease, background-color 0.35s ease, backdrop-filter 0.35s ease, -webkit-backdrop-filter 0.35s ease, box-shadow 0.35s ease, border-color 0.35s ease",
  };

  return (
    <nav
      className={`navbar ${isCompact ? "compact" : ""} ${isPeeking && !isVisible ? "peeking" : ""}`}
      style={navbarStyle}
      onMouseEnter={handleNavMouseEnter}
      onMouseLeave={handleNavMouseLeave}
    >
      <p
        className={`DropdownNav ${clickCount === 3 ? "launching" : ""} ${isReturningFromLogin ? "entering-from-login" : ""}`}
        tabIndex={0}
        aria-label="Home"
        role="button"
        onClick={handleLogoClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") scrollToSection("hero");
        }}
      >
        <span className={`logo-char char-1 ${clickCount >= 1 ? "active" : ""}`}>&lt;</span>
        <span className={`logo-char char-2 ${clickCount >= 2 ? "active" : ""}`}>/</span>
        <LogoDynamicSlot
          step={step}
          activeWord={activeWord}
          clickCount={clickCount}
          isReturningFromLogin={isReturningFromLogin}
        />
      </p>
      <NavMenuList activeSection={activeSection} onSelectSection={scrollToSection} />
    </nav>
  );
};

export default Headbar;
