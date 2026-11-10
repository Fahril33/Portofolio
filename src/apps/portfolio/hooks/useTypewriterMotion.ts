import { useLayoutEffect, useRef } from "react";
import type { RefObject } from "react";
import type { TypewriterSettings } from "../../../shared/types/heroSettings";
import { getTypewriterMotionMs } from "./typewriterAnimation";

export interface TypewriterMotionResult {
  stageRef: RefObject<HTMLSpanElement>;
  caretRef: RefObject<HTMLSpanElement>;
}

const getTranslateX = (element: HTMLElement): number => {
  const transform = window.getComputedStyle(element).transform;
  return transform === "none" ? 0 : new DOMMatrixReadOnly(transform).m41;
};

export const useTypewriterMotion = (
  text: string,
  settings: TypewriterSettings
): TypewriterMotionResult => {
  const stageRef = useRef<HTMLSpanElement>(null);
  const caretRef = useRef<HTMLSpanElement>(null);
  const previousWidth = useRef<number | null>(null);
  const stageAnimation = useRef<Animation | null>(null);
  const caretAnimation = useRef<Animation | null>(null);

  useLayoutEffect((): (() => void) | undefined => {
    const stage = stageRef.current;
    const caret = caretRef.current;
    if (!stage || !caret) return;

    const updatePosition = (): void => {
      const width = stage.getBoundingClientRect().width;
      const oldWidth = previousWidth.current;
      previousWidth.current = width;
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reducedMotion || !settings.enabled) {
        stageAnimation.current?.cancel();
        caretAnimation.current?.cancel();
        return;
      }
      if (oldWidth === null || Math.abs(width - oldWidth) < 0.01) return;

      // Continue from the current animated position when another letter arrives.
      // Only positions interpolate; each typed character is rendered in full.
      const delta = width - oldWidth;
      const stageOffset = getTranslateX(stage) + delta / 2;
      const caretOffset = getTranslateX(caret) - delta;
      stageAnimation.current?.cancel();
      caretAnimation.current?.cancel();
      const isDeleting = delta < 0;
      const options: KeyframeAnimationOptions = {
        duration: getTypewriterMotionMs(settings, isDeleting),
        easing: isDeleting ? "linear" : "cubic-bezier(0.16, 1, 0.3, 1)",
      };
      stageAnimation.current = stage.animate([
        { transform: `translateX(${stageOffset}px)` },
        { transform: "translateX(0)" },
      ], options);
      caretAnimation.current = caret.animate([
        { transform: `translate(${caretOffset}px, -50%)` },
        { transform: "translate(0, -50%)" },
      ], options);
    };

    updatePosition();
    const observer = new ResizeObserver(updatePosition);
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    observer.observe(stage);
    media.addEventListener("change", updatePosition);
    return (): void => {
      observer.disconnect();
      media.removeEventListener("change", updatePosition);
    };
  }, [text, settings.enabled, settings.typingMs, settings.deletingMs]);

  useLayoutEffect((): (() => void) => {
    return (): void => {
      stageAnimation.current?.cancel();
      caretAnimation.current?.cancel();
    };
  }, []);

  return { stageRef, caretRef };
};
