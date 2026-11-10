import { useCallback, useEffect, useRef, useState } from "react";

export type CycleStep =
  | "idle"
  | "gt-leaving"
  | "fahril-entering"
  | "fahril-visible"
  | "fahril-leaving"
  | "ori7on-entering"
  | "ori7on-visible"
  | "ori7on-leaving"
  | "gt-entering"
  | "fast-closing";

export interface UseLogoWordCycleOptions {
  disabled?: boolean;
}

export interface UseLogoWordCycleResult {
  step: CycleStep;
  activeWord: string;
  handleTopbarMouseEnter: () => void;
  handleTopbarMouseLeave: () => void;
  fastClose: () => void;
  forceIdle: () => void;
}

const STEP_DURATIONS: Record<Exclude<CycleStep, "fast-closing">, number> = {
  idle: 2200,
  "gt-leaving": 350,
  "fahril-entering": 800,
  "fahril-visible": 1800,
  "fahril-leaving": 850,
  "ori7on-entering": 800,
  "ori7on-visible": 1800,
  "ori7on-leaving": 850,
  "gt-entering": 350,
};

const NEXT_STEP: Record<Exclude<CycleStep, "fast-closing">, CycleStep> = {
  idle: "gt-leaving",
  "gt-leaving": "fahril-entering",
  "fahril-entering": "fahril-visible",
  "fahril-visible": "fahril-leaving",
  "fahril-leaving": "ori7on-entering",
  "ori7on-entering": "ori7on-visible",
  "ori7on-visible": "ori7on-leaving",
  "ori7on-leaving": "gt-entering",
  "gt-entering": "idle",
};

export const useLogoWordCycle = (
  options: UseLogoWordCycleOptions = {}
): UseLogoWordCycleResult => {
  const { disabled = false } = options;
  const [step, setStep] = useState<CycleStep>("idle");
  const isHoveredRef = useRef<boolean>(false);
  const timerRef = useRef<number | null>(null);
  const lastWordRef = useRef<string>("Fahril");

  const clearTimer = useCallback((): void => {
    if (timerRef.current != null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect((): void => {
    if (step.startsWith("fahril")) {
      lastWordRef.current = "Fahril";
    } else if (step.startsWith("ori7on")) {
      lastWordRef.current = "Ori7on";
    }
  }, [step]);

  const advanceStep = useCallback((current: CycleStep): void => {
    if (disabled || current === "fast-closing") {
      setStep("idle");
      return;
    }

    // If hovering topbar when at idle, stay at idle
    if (current === "idle" && isHoveredRef.current) {
      setStep("idle");
      return;
    }

    const next = NEXT_STEP[current];
    setStep(next);
  }, [disabled]);

  useEffect((): (() => void) => {
    if (step === "fast-closing") return (): void => {};
    clearTimer();

    if (disabled) {
      setStep("idle");
      return (): void => {};
    }

    const duration = STEP_DURATIONS[step as keyof typeof STEP_DURATIONS] || 2200;
    timerRef.current = window.setTimeout((): void => {
      advanceStep(step);
    }, duration);

    return (): void => {
      clearTimer();
    };
  }, [advanceStep, clearTimer, disabled, step]);

  const fastClose = useCallback((): void => {
    clearTimer();
    setStep((prev) => {
      if (prev === "idle") return "idle";
      if (prev === "fast-closing") return prev;

      // If dynamic word is active, trigger 120ms fast close
      if (prev.startsWith("fahril") || prev.startsWith("ori7on")) {
        timerRef.current = window.setTimeout((): void => {
          setStep("idle");
        }, 130);
        return "fast-closing";
      }

      // If gt-leaving or gt-entering, immediately snap to idle
      return "idle";
    });
  }, [clearTimer]);

  const forceIdle = useCallback((): void => {
    clearTimer();
    setStep("idle");
  }, [clearTimer]);

  const handleTopbarMouseEnter = useCallback((): void => {
    isHoveredRef.current = true;
  }, []);

  const handleTopbarMouseLeave = useCallback((): void => {
    isHoveredRef.current = false;
    if (disabled || step === "fast-closing") return;

    setStep((prev) => {
      if (prev === "idle") {
        clearTimer();
        timerRef.current = window.setTimeout((): void => {
          advanceStep("idle");
        }, 300);
      }
      return prev;
    });
  }, [advanceStep, clearTimer, disabled, step]);

  return {
    step,
    activeWord: lastWordRef.current,
    handleTopbarMouseEnter,
    handleTopbarMouseLeave,
    fastClose,
    forceIdle,
  };
};
