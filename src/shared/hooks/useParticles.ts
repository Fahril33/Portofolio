import { useEffect } from "react";
import particlesConfig from "../../apps/portfolio/components/configs/particles-config";

export interface ParticlesDomItem {
  pJS?: {
    canvas?: {
      tag_id?: string;
      el?: HTMLCanvasElement;
    };
    fn?: {
      draw?: () => void;
      drawAnimFrame?: number | null;
    };
  };
}

export interface WindowWithParticles extends Window {
  particlesJS?: (id: string, config: object) => void;
  pJSDom?: ParticlesDomItem[] | null;
}

export const useParticles = (containerId: string): void => {
  useEffect((): (() => void) => {
    let cancelled = false;
    let animId: number | null = null;
    let frames = 0;
    const maxFrames = 60 * 5; // ~5s timeout

    const cleanupInstance = (): void => {
      if (typeof window === "undefined") return;
      const win = window as WindowWithParticles;
      if (!Array.isArray(win.pJSDom)) return;

      for (let i = win.pJSDom.length - 1; i >= 0; i -= 1) {
        const entry = win.pJSDom[i];
        const isMatch =
          entry?.pJS?.canvas?.tag_id === containerId ||
          entry?.pJS?.canvas?.el?.parentElement?.id === containerId;

        if (isMatch) {
          if (entry?.pJS?.fn?.drawAnimFrame != null) {
            cancelAnimationFrame(entry.pJS.fn.drawAnimFrame);
            entry.pJS.fn.drawAnimFrame = null;
          }
          entry?.pJS?.canvas?.el?.remove();
          win.pJSDom.splice(i, 1);
        }
      }
    };

    const tryInit = (): void => {
      if (cancelled) return;
      if (typeof window === "undefined") return;

      const container = document.getElementById(containerId);
      // Skip initialization if inside the temporary slide transition overlay
      if (container?.closest(".page-slide-overlay")) {
        return;
      }

      const win = window as WindowWithParticles;
      if (container && win.particlesJS) {
        if (!Array.isArray(win.pJSDom)) {
          win.pJSDom = [];
        }

        // Clean up any stale instances for this container so objects always spawn fresh from 0
        cleanupInstance();
        container.innerHTML = "";

        // Fresh particles spawn from 0
        win.particlesJS(containerId, particlesConfig);
        return;
      }

      frames += 1;
      if (frames < maxFrames) {
        animId = window.requestAnimationFrame(tryInit);
      }
    };

    tryInit();

    return (): void => {
      cancelled = true;
      if (animId != null) {
        window.cancelAnimationFrame(animId);
      }
      cleanupInstance();
    };
  }, [containerId]);
};
