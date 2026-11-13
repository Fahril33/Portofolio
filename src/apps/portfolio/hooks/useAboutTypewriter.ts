import { useEffect, useState } from "react";

export interface UseAboutTypewriterParams {
  targetHeading: string;
  targetTagline: string;
  targetBody: string;
  isReady: boolean;
  containerRef: React.RefObject<HTMLElement | null>;
}

export interface UseAboutTypewriterResult {
  heading: string;
  tagline: string;
  body: string;
  isTypingHeading: boolean;
  isTypingTagline: boolean;
  isTypingBody: boolean;
  isComplete: boolean;
}

export type AboutTypingPhase = "idle" | "heading" | "tagline" | "body" | "complete";

export const useAboutTypewriter = ({
  targetHeading,
  targetTagline,
  targetBody,
  isReady,
  containerRef,
}: UseAboutTypewriterParams): UseAboutTypewriterResult => {
  const [heading, setHeading] = useState<string>("");
  const [tagline, setTagline] = useState<string>("");
  const [body, setBody] = useState<string>("");
  const [phase, setPhase] = useState<AboutTypingPhase>("idle");
  const [isVisible, setIsVisible] = useState<boolean>(false);

  // Detect when About section enters the viewport
  useEffect((): (() => void) => {
    if (typeof window === "undefined" || typeof IntersectionObserver === "undefined") {
      setIsVisible(true);
      return (): void => {};
    }

    const node = containerRef.current;
    if (!node) {
      setIsVisible(true);
      return (): void => {};
    }

    const observer = new IntersectionObserver(
      (entries: IntersectionObserverEntry[]): void => {
        const first = entries[0];
        if (first && first.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(node);
    return (): void => {
      observer.disconnect();
    };
  }, [containerRef]);

  // Main typing state machine
  useEffect((): (() => void) => {
    if (!isReady || !isVisible) return (): void => {};

    // Support reduced-motion accessibility preference
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      setHeading(targetHeading);
      setTagline(targetTagline);
      setBody(targetBody);
      setPhase("complete");
      return (): void => {};
    }

    let timer: number | null = null;
    let cancelled = false;

    if (phase === "idle") {
      setPhase(targetHeading ? "heading" : targetTagline ? "tagline" : "body");
      return (): void => {};
    }

    if (phase === "heading") {
      if (heading.length < targetHeading.length) {
        timer = window.setTimeout((): void => {
          if (!cancelled) {
            setHeading(targetHeading.slice(0, heading.length + 1));
          }
        }, 36);
      } else {
        timer = window.setTimeout((): void => {
          if (!cancelled) {
            setPhase(targetTagline ? "tagline" : "body");
          }
        }, 200);
      }
      return (): void => {
        cancelled = true;
        if (timer !== null) window.clearTimeout(timer);
      };
    }

    if (phase === "tagline") {
      if (tagline.length < targetTagline.length) {
        timer = window.setTimeout((): void => {
          if (!cancelled) {
            setTagline(targetTagline.slice(0, tagline.length + 1));
          }
        }, 28);
      } else {
        timer = window.setTimeout((): void => {
          if (!cancelled) {
            setPhase("body");
          }
        }, 250);
      }
      return (): void => {
        cancelled = true;
        if (timer !== null) window.clearTimeout(timer);
      };
    }

    if (phase === "body") {
      if (body.length < targetBody.length) {
        const nextChar = targetBody[body.length];
        const isPauseChar = nextChar === "\n" || nextChar === "." || nextChar === "!";
        const delay = isPauseChar ? 55 : 18;

        timer = window.setTimeout((): void => {
          if (!cancelled) {
            setBody(targetBody.slice(0, body.length + 1));
          }
        }, delay);
      } else {
        setPhase("complete");
      }
      return (): void => {
        cancelled = true;
        if (timer !== null) window.clearTimeout(timer);
      };
    }

    return (): void => {
      cancelled = true;
      if (timer !== null) window.clearTimeout(timer);
    };
  }, [isReady, isVisible, phase, heading, tagline, body, targetHeading, targetTagline, targetBody]);

  return {
    heading,
    tagline,
    body,
    isTypingHeading: phase === "heading",
    isTypingTagline: phase === "tagline",
    isTypingBody: phase === "body",
    isComplete: phase === "complete",
  };
};

