import { useEffect, useState, type RefObject } from "react";
import { createAboutKineticScene } from "../lib/aboutKineticScene";

const DURATION = 21;
const BOUNDARIES = [4.5, 9, 13.5];
const clamp = (value: number, min = 0, max = 1): number =>
  Math.min(max, Math.max(min, value));

/** Material weights are shared by manual scrolling and idle step transitions. */
export function sampleAboutTimeline(progress: number): { time: number; morph: number[]; phase: number } {
  const time = clamp(progress) * DURATION;
  const morph = [1, 0, 0, 0];
  BOUNDARIES.forEach((boundary, index) => {
    const fraction = clamp((time - boundary + 0.9) / 1.8);
    const blend = fraction * fraction * (3 - 2 * fraction);
    morph[index] -= blend;
    morph[index + 1] += blend;
  });
  const phase = morph.indexOf(Math.max(...morph));
  return { time: 1 + time, morph, phase };
}

export function useAboutKinetic(rootRef: RefObject<HTMLDivElement>): { phase: number; form: number; together: boolean } {
  const [phase, setPhase] = useState(0);
  const [form, setForm] = useState(3);
  const [together, setTogether] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    const sticky = root?.querySelector<HTMLElement>(".aboutSticky");
    const stage = root?.querySelector<HTMLElement>(".idc-stage");
    const canvas = root?.querySelector<HTMLCanvasElement>("canvas");
    const control = root?.querySelector<HTMLButtonElement>(".idc-object-control");
    if (!root || !sticky || !stage || !canvas || !control) return;

    const colors = (): string[] => Array.from(
      root.querySelectorAll<HTMLElement>(".idc-palette span"),
      (element) => getComputedStyle(element).color
    );
    const scene = createAboutKineticScene(canvas, colors());
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const theme = window.matchMedia("(prefers-color-scheme: dark)");
    const IDLE_DELAY = 10_000;
    const STEP_TRANSITION = 1_200;
    const STEP_CENTERS = [0.1, 0.32, 0.53, 0.85];
    const FRAME_INTERVAL = 1000 / 30;
    let frameId: number | null = null;
    let disposed = false;
    let visible = false;
    let activePhase = -1;
    let needsResize = true;
    let needsPalette = true;
    let needsMeasure = true;
    let initialized = false;
    let scrollProgress = 0;
    let progress = 0;
    let lastPaintedProgress = -1;
    let sceneTime = 1;
    let lastFrame = 0;
    let lastDraw = 0;
    let lastActivity = performance.now();
    let inTogether = false;
    let formIndex = 3;
    let formMorph = [0, 0, 0, 1];
    let formTransition: { from: number[]; to: number[]; started: number } | null = null;
    let lastFormChange = performance.now();
    let rotationX = 0;
    let rotationY = 0;
    let interactionDirty = false;
    let dragging: { id: number; x: number; y: number; startX: number; startY: number; moved: boolean } | null = null;
    let suppressClick = false;
    let automatic: { from: number; to: number; started: number } | null = null;

    function render(now: number): void {
      frameId = null;
      if (disposed || document.hidden || !visible) return;
      const elapsed = lastFrame ? Math.min((now - lastFrame) / 1000, 0.1) : 0;
      lastFrame = now;
      let force = needsResize || needsPalette;

      // Geometry is read only after scrolling/resizing, not on every idle frame.
      if (needsMeasure) {
        const bounds = root!.getBoundingClientRect();
        const distance = Math.max(1, bounds.height - sticky!.offsetHeight);
        const nextScrollProgress = clamp(-bounds.top / distance);
        const previous = progress;
        if (!initialized || bounds.top > 0 || bounds.bottom < sticky!.offsetHeight) {
          progress = nextScrollProgress;
        } else {
          // Continue from the auto-advanced position instead of snapping backward.
          progress = clamp(progress + nextScrollProgress - scrollProgress);
        }
        sceneTime += (progress - previous) * DURATION;
        scrollProgress = nextScrollProgress;
        initialized = true;
        needsMeasure = false;
      }
      if (needsResize) {
        const size = stage!.getBoundingClientRect();
        scene.resize(size.width, size.height);
        needsResize = false;
      }
      if (needsPalette) {
        scene.setColors(colors());
        needsPalette = false;
      }

      if (motion.matches) {
        automatic = null;
      } else {
        // Drag rotation is additive; ambient motion keeps running while the pointer is held.
        sceneTime += elapsed;
        if (!automatic && now - lastActivity >= IDLE_DELAY) {
          const currentPhase = sampleAboutTimeline(progress).phase;
          if (currentPhase < 3) {
            automatic = { from: progress, to: STEP_CENTERS[currentPhase + 1], started: now };
          }
        }
        if (automatic) {
          const fraction = clamp((now - automatic.started) / STEP_TRANSITION);
          const eased = fraction * fraction * (3 - 2 * fraction);
          const nextProgress = automatic.from + (automatic.to - automatic.from) * eased;
          sceneTime += (nextProgress - progress) * DURATION;
          progress = nextProgress;
          if (fraction === 1) {
            automatic = null;
            lastActivity = now; // Each new step gets its own ten-second dwell.
          }
        }
      }

      const displayedProgress = motion.matches ? 1 : progress;
      const layoutSample = sampleAboutTimeline(displayedProgress);
      const nextTogether = layoutSample.morph[3] > 0.95;
      if (nextTogether !== inTogether) {
        inTogether = nextTogether;
        setTogether(inTogether);
        lastFormChange = now;
        if (!inTogether && dragging) cancelDrag();
        interactionDirty = true;
      }
      if (layoutSample.morph[3] === 0 && (formIndex !== 3 || formTransition)) {
        formIndex = 3;
        setForm(3);
        formMorph = [0, 0, 0, 1];
        formTransition = null;
        interactionDirty = true;
      }
      if (inTogether && !motion.matches && !dragging && !formTransition &&
          now - lastFormChange >= IDLE_DELAY && now - lastActivity >= IDLE_DELAY) {
        advanceForm(now);
      }
      if (formTransition) {
        const fraction = motion.matches ? 1 : clamp((now - formTransition.started) / STEP_TRANSITION);
        const eased = fraction * fraction * (3 - 2 * fraction);
        formMorph = formTransition.from.map((value, index) => value + (formTransition!.to[index] - value) * eased);
        interactionDirty = true;
        if (fraction === 1) { formTransition = null; lastFormChange = now; }
      }
      force ||= displayedProgress !== lastPaintedProgress || interactionDirty;
      if (force || (!motion.matches && now - lastDraw >= FRAME_INTERVAL)) {
        const sample = sampleAboutTimeline(displayedProgress);
        if (displayedProgress !== lastPaintedProgress) {
          sample.morph.forEach((weight, index) => root!.style.setProperty(`--phase-${index}`, String(weight)));
          root!.style.setProperty("--together", String(sample.morph[3]));
          root!.dataset.progress = displayedProgress.toFixed(5);
          lastPaintedProgress = displayedProgress;
        }
        if (sample.phase !== activePhase) {
          activePhase = sample.phase;
          setPhase(activePhase);
        }
        // Continuous scene time loops rotation, neural pulses, paint and data flow.
        const material = sample.morph.map((weight, index) =>
          (index === 3 ? 0 : weight) + formMorph[index] * sample.morph[3]
        );
        material.forEach((weight, index) => root!.style.setProperty(`--material-${index}`, String(weight)));
        scene.draw(motion.matches ? sample.time : Math.max(0, sceneTime), material, rotationX, rotationY, sample.morph[3]);
        interactionDirty = false;
        lastDraw = now;
      }
      if (!motion.matches) schedule();
    }

    function schedule(): void {
      if (!disposed && visible && !document.hidden && frameId === null) {
        frameId = requestAnimationFrame(render);
      }
    }
    function advanceForm(now = performance.now()): void {
      if (!inTogether) return;
      formIndex = (formIndex + 1) % 4;
      const target = [0, 0, 0, 0];
      target[formIndex] = 1;
      formTransition = { from: formMorph.slice(), to: target, started: now };
      setForm(formIndex);
      lastFormChange = now;
      interactionDirty = true;
      schedule();
    }
    function cancelDrag(): void {
      const previousDrag = dragging;
      dragging = null;
      if (previousDrag && control!.hasPointerCapture(previousDrag.id)) control!.releasePointerCapture(previousDrag.id);
      control!.classList.remove("is-dragging");
    }
    const pointerDown = (event: PointerEvent): void => {
      if (!inTogether || event.button !== 0 || !event.isPrimary) return;
      dragging = { id: event.pointerId, x: event.clientX, y: event.clientY,
        startX: event.clientX, startY: event.clientY, moved: false };
      suppressClick = false;
      control!.setPointerCapture(event.pointerId);
      control!.classList.add("is-dragging");
    };
    const pointerMove = (event: PointerEvent): void => {
      if (!dragging || event.pointerId !== dragging.id) return;
      const dx = event.clientX - dragging.x;
      const dy = event.clientY - dragging.y;
      dragging.moved ||= Math.hypot(event.clientX - dragging.startX, event.clientY - dragging.startY) > 6;
      if (dragging.moved) {
        rotationX += dx * 0.012;
        rotationY += dy * 0.012;
        interactionDirty = true;
        schedule();
      }
      dragging.x = event.clientX;
      dragging.y = event.clientY;
    };
    const pointerUp = (event: PointerEvent): void => {
      if (!dragging || event.pointerId !== dragging.id) return;
      suppressClick = dragging.moved || event.type === "pointercancel";
      cancelDrag();
      lastFormChange = performance.now();
    };
    const click = (): void => {
      if (suppressClick) { suppressClick = false; return; }
      advanceForm();
    };
    const keyDown = (event: KeyboardEvent): void => {
      if (event.key === "Enter" || event.key === " ") suppressClick = false;
      if (!inTogether || !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;
      event.preventDefault();
      rotationX += event.key === "ArrowLeft" ? -0.15 : event.key === "ArrowRight" ? 0.15 : 0;
      rotationY += event.key === "ArrowUp" ? -0.15 : event.key === "ArrowDown" ? 0.15 : 0;
      interactionDirty = true;
      schedule();
    };
    control.addEventListener("pointerdown", pointerDown);
    control.addEventListener("pointermove", pointerMove);
    control.addEventListener("pointerup", pointerUp);
    control.addEventListener("pointercancel", pointerUp);
    control.addEventListener("lostpointercapture", pointerUp);
    control.addEventListener("click", click);
    control.addEventListener("keydown", keyDown);
    const activity = (): void => { lastActivity = performance.now(); };
    const scroll = (): void => {
      activity();
      automatic = null;
      needsMeasure = true;
      schedule();
    };
    const resize = (): void => {
      needsResize = true;
      needsMeasure = true;
      activity();
      automatic = null;
      schedule();
    };
    const palette = (): void => { needsPalette = true; schedule(); };
    const visibility = (): void => {
      if (frameId !== null) cancelAnimationFrame(frameId);
      frameId = null;
      lastFrame = 0;
      automatic = null;
      if (formTransition) formMorph = formTransition.to;
      formTransition = null;
      lastFormChange = performance.now();
      cancelDrag();
      activity();
      needsMeasure = true;
      schedule();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(root);
    observer.observe(stage);
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting && entry.intersectionRatio >= 0.1;
      visibility();
    }, { threshold: [0, 0.1] });
    intersection.observe(sticky);
    const themeObserver = new MutationObserver(palette);
    themeObserver.observe(document.documentElement, {
      attributes: true, attributeFilter: ["class", "style", "data-theme"],
    });
    const activityEvents = ["pointermove", "pointerdown", "keydown", "touchmove", "wheel"] as const;
    activityEvents.forEach((event) => window.addEventListener(event, activity, { passive: true }));
    window.addEventListener("scroll", scroll, { passive: true });
    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("pageshow", resize);
    document.addEventListener("visibilitychange", visibility);
    motion.addEventListener("change", resize);
    theme.addEventListener("change", palette);

    return () => {
      disposed = true;
      if (frameId !== null) cancelAnimationFrame(frameId);
      cancelDrag();
      control.removeEventListener("pointerdown", pointerDown);
      control.removeEventListener("pointermove", pointerMove);
      control.removeEventListener("pointerup", pointerUp);
      control.removeEventListener("pointercancel", pointerUp);
      control.removeEventListener("lostpointercapture", pointerUp);
      control.removeEventListener("click", click);
      control.removeEventListener("keydown", keyDown);
      observer.disconnect();
      intersection.disconnect();
      themeObserver.disconnect();
      activityEvents.forEach((event) => window.removeEventListener(event, activity));
      window.removeEventListener("scroll", scroll);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pageshow", resize);
      document.removeEventListener("visibilitychange", visibility);
      motion.removeEventListener("change", resize);
      theme.removeEventListener("change", palette);
    };
  }, [rootRef]);

  return { phase, form, together };
}
