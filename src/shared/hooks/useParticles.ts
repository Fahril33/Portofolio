import { useEffect } from "react";
import particlesConfig from "../../apps/portfolio/components/configs/particles-config";

export interface ParticlesCanvas {
  tag_id?: string;
  el?: HTMLCanvasElement;
  w?: number;
  h?: number;
}

export interface ParticlesFunctions {
  draw?: () => void;
  drawAnimFrame?: number | null;
  checkAnimFrame?: number | null;
  particlesRefresh?: () => void;
  vendors?: {
    drawAnimFrame?: number | null;
    checkAnimFrame?: number | null;
    destroypJS?: () => void;
  };
}

export interface ParticlesState {
  array?: unknown[];
}

export interface ParticleJSInstance {
  tag_id?: string;
  canvas?: ParticlesCanvas;
  particles?: ParticlesState;
  fn?: ParticlesFunctions;
  tmp?: {
    checkAnimFrame?: number | null;
  };
}

export interface ParticlesDomItem {
  pJS?: ParticleJSInstance;
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

    const cleanupInstance = (tag: string): void => {
      if (typeof window === "undefined") return;
      const win = window as unknown as WindowWithParticles;
      if (!Array.isArray(win.pJSDom)) return;

      for (let i = win.pJSDom.length - 1; i >= 0; i -= 1) {
        const entry = win.pJSDom[i];
        const canvasEl = entry?.pJS?.canvas?.el;
        const isDetached = Boolean(canvasEl && !canvasEl.isConnected);
        const isTagMatch =
          entry?.pJS?.tag_id === tag ||
          entry?.pJS?.canvas?.tag_id === tag ||
          canvasEl?.parentElement?.id === tag;

        if (isTagMatch || isDetached) {
          if (entry?.pJS?.fn?.drawAnimFrame != null) {
            cancelAnimationFrame(entry.pJS.fn.drawAnimFrame);
            entry.pJS.fn.drawAnimFrame = null;
          }
          if (entry?.pJS?.fn?.checkAnimFrame != null) {
            cancelAnimationFrame(entry.pJS.fn.checkAnimFrame);
            entry.pJS.fn.checkAnimFrame = null;
          }
          if (entry?.pJS?.tmp?.checkAnimFrame != null) {
            cancelAnimationFrame(entry.pJS.tmp.checkAnimFrame);
            entry.pJS.tmp.checkAnimFrame = null;
          }
          canvasEl?.remove();
          win.pJSDom.splice(i, 1);
        }
      }
    };

    const scheduleNextFrame = (): void => {
      frames += 1;
      if (frames < maxFrames && !cancelled) {
        animId = window.requestAnimationFrame(tryInit);
      }
    };

    const tryInit = (): void => {
      if (cancelled) return;
      if (typeof window === "undefined") return;

      const container = document.getElementById(containerId);
      // If container is not yet mounted or is detached, wait for next animation frame
      if (!container || !container.isConnected) {
        scheduleNextFrame();
        return;
      }

      // If container is within slide transition overlay, wait until transition completes
      if (container.closest(".page-slide-overlay")) {
        scheduleNextFrame();
        return;
      }

      // Ensure container has non-zero geometry to prevent densityAutoParticles from removing all particles
      if (container.offsetWidth <= 0 || container.offsetHeight <= 0) {
        scheduleNextFrame();
        return;
      }

      const win = window as unknown as WindowWithParticles;
      if (typeof win.particlesJS !== "function") {
        scheduleNextFrame();
        return;
      }

      if (!Array.isArray(win.pJSDom)) {
        win.pJSDom = [];
      }

      // Clean up stale instances for this container or detached canvases
      cleanupInstance(containerId);
      container.innerHTML = "";

      // Spawn fresh particles
      win.particlesJS(containerId, particlesConfig);

      // Tag the newly created instance for unambiguous teardown
      const created = win.pJSDom[win.pJSDom.length - 1];
      if (created?.pJS) {
        created.pJS.tag_id = containerId;
        if (created.pJS.canvas) {
          created.pJS.canvas.tag_id = containerId;
          created.pJS.canvas.el?.classList.add("particles-fade-in");
        }

        // If particles array was emptied due to momentary zero-size during spawn, refresh particles
        if (
          Array.isArray(created.pJS.particles?.array) &&
          created.pJS.particles.array.length === 0 &&
          typeof created.pJS.fn?.particlesRefresh === "function"
        ) {
          created.pJS.fn.particlesRefresh();
        }
      }
    };

    const handleReInit = (): void => {
      frames = 0;
      tryInit();
    };

    window.addEventListener("page-slide-end", handleReInit);
    window.addEventListener("portfolio-return-from-login", handleReInit);
    window.addEventListener("popstate", handleReInit);

    tryInit();

    return (): void => {
      cancelled = true;
      if (animId != null) {
        window.cancelAnimationFrame(animId);
      }
      window.removeEventListener("page-slide-end", handleReInit);
      window.removeEventListener("portfolio-return-from-login", handleReInit);
      window.removeEventListener("popstate", handleReInit);
      cleanupInstance(containerId);
    };
  }, [containerId]);
};
