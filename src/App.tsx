import "./App.css";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  navigateTo,
  setEnteringLogin,
  setReturningFromLogin,
  usePathname,
} from "./lib/navigation";
import AdminApp from "./apps/admin/AdminApp";
import PortfolioApp from "./apps/portfolio/PortfolioApp";

interface SlideTransition {
  targetPath: string;
  direction: "forward" | "backward";
}

const resolveApp = (pathname: string): React.ReactNode => {
  return pathname === "/login" || pathname === "/lead" ? (
    <AdminApp />
  ) : (
    <PortfolioApp />
  );
};

const App: React.FC = () => {
  const pathname = usePathname();
  const [slide, setSlide] = useState<SlideTransition | null>(null);
  const [slideReady, setSlideReady] = useState<boolean>(false);
  const isTransitioning = useRef<boolean>(false);

  useEffect(() => {
    const handleSlide = (e: Event): void => {
      if (isTransitioning.current) return;
      const { targetPath, direction = "forward" } = (
        e as CustomEvent<{ targetPath: string; direction?: "forward" | "backward" }>
      ).detail;
      isTransitioning.current = true;
      setSlideReady(false);
      setSlide({ targetPath, direction });
    };

    window.addEventListener("page-slide-transition", handleSlide);
    return () => window.removeEventListener("page-slide-transition", handleSlide);
  }, []);

  /* Wait for overlay content to fully paint before starting slide */
  useEffect(() => {
    if (!slide || slideReady) return;

    let cancelled = false;
    /* Double rAF + setTimeout: ensures React commit, browser paint, AND
       complex child component layout are all settled before we animate */
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setTimeout(() => {
          if (!cancelled) setSlideReady(true);
        }, 50);
      });
    });

    return (): void => {
      cancelled = true;
    };
  }, [slide, slideReady]);

  /* Lock body scroll while overlay is active */
  useEffect(() => {
    if (slide) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [slide]);

  const handleSlideEnd = useCallback(
    (e: React.AnimationEvent<HTMLDivElement>): void => {
      /* Only respond to the overlay's own animation, not child bubbles */
      if (e.target !== e.currentTarget) return;
      if (!slide) return;
      const isReturnToPortfolio = slide.targetPath === "/" && slide.direction === "backward";
      const isEnteringLogin = slide.targetPath === "/login";
      navigateTo(slide.targetPath);
      setSlide(null);
      setSlideReady(false);
      isTransitioning.current = false;
      window.dispatchEvent(new CustomEvent("page-slide-end"));
      if (isReturnToPortfolio) {
        setReturningFromLogin(true);
      }
      if (isEnteringLogin) {
        setEnteringLogin(true);
      }
    },
    [slide]
  );

  return (
    <>
      {resolveApp(pathname)}
      {slide && (
        <div
          className={`page-slide-overlay slide-${slide.direction}${slideReady ? " sliding" : ""}`}
          onAnimationEnd={handleSlideEnd}
        >
          {resolveApp(slide.targetPath)}
        </div>
      )}
    </>
  );
};

export default App;
