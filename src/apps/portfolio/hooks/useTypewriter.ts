import { useEffect, useMemo, useState } from "react";
import type { TypewriterSettings } from "../../../shared/types/heroSettings";
import { isReturningFromLoginActive } from "../../../lib/navigation";
import { advanceTypewriter, getNextSessionSpeed, getTypewriterDelay } from "./typewriterAnimation";
import type { TypewriterFrame } from "./typewriterAnimation";

export interface TypewriterResult {
  text: string;
  fullText: string;
  caret: "active" | "idle" | "hidden";
}

export const useTypewriter = (settings: TypewriterSettings): TypewriterResult => {
  const textsKey = JSON.stringify(settings.texts.filter((text: string): boolean => text.trim().length > 0));
  const texts = useMemo((): string[] => JSON.parse(textsKey), [textsKey]);
  const phrases = useMemo((): string[][] => {
    if (typeof Intl.Segmenter === "undefined") return texts.map((text: string): string[] => Array.from(text));
    const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });
    return texts.map((text: string): string[] =>
      Array.from(segmenter.segment(text), (part): string => part.segment)
    );
  }, [texts]);
  const baseIndex = Number.isFinite(settings.defaultIndex)
    ? Math.max(0, Math.min(texts.length - 1, Math.floor(settings.defaultIndex)))
    : 0;
  const [isReturning] = useState(isReturningFromLoginActive);
  const [reducedMotion, setReducedMotion] = useState((): boolean =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  const [frame, setFrame] = useState<TypewriterFrame>((): TypewriterFrame => ({
    textIndex: baseIndex,
    cursor: 0,
    phase: "starting",
    cycle: 0,
    sessionSpeed: getNextSessionSpeed(baseIndex, 0),
  }));

  useEffect((): (() => void) => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleMotionChange = (): void => setReducedMotion(media.matches);
    media.addEventListener("change", handleMotionChange);
    handleMotionChange();
    return (): void => media.removeEventListener("change", handleMotionChange);
  }, []);

  const { enabled, rotate, loop, typingMs, deletingMs, pauseMs } = settings;
  useEffect((): (() => void) | undefined => {
    const initial: TypewriterFrame = {
      textIndex: baseIndex,
      cursor: 0,
      phase: "starting",
      cycle: 0,
      sessionSpeed: getNextSessionSpeed(baseIndex, 0),
    };
    setFrame(initial);
    if (!enabled || reducedMotion || phrases.length === 0) return;

    let current = initial;
    let timer: number | undefined;
    let remaining = getTypewriterDelay(current, settings, isReturning, phrases[current.textIndex]);
    let deadline = 0;
    let disposed = false;

    const scheduleNextFrame = (): void => {
      if (disposed || document.hidden || timer !== undefined || remaining === null) return;
      deadline = performance.now() + remaining;
      timer = window.setTimeout((): void => {
        timer = undefined;
        current = advanceTypewriter(current, phrases, settings);
        setFrame(current);
        remaining = getTypewriterDelay(current, settings, isReturning, phrases[current.textIndex]);
        scheduleNextFrame();
      }, remaining);
    };
    const handleVisibilityChange = (): void => {
      if (document.hidden) {
        if (timer !== undefined) {
          window.clearTimeout(timer);
          timer = undefined;
          remaining = Math.max(0, deadline - performance.now());
        }
      } else {
        scheduleNextFrame();
      }
    };

    scheduleNextFrame();
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return (): void => {
      disposed = true;
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [baseIndex, phrases, enabled, rotate, loop, typingMs, deletingMs, pauseMs, reducedMotion, isReturning]);

  const animated = enabled && !reducedMotion;
  const fullText = texts[animated ? frame.textIndex : baseIndex] ?? "";
  return {
    text: animated ? (phrases[frame.textIndex] ?? []).slice(0, frame.cursor).join("") : fullText,
    fullText,
    caret: !animated || !fullText ? "hidden" : frame.phase === "holding" || frame.phase === "complete" ? "idle" : "active",
  };
};
