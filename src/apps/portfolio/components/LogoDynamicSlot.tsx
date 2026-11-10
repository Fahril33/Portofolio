import React from "react";
import type { CycleStep } from "../hooks/useLogoWordCycle";

export interface LogoDynamicSlotProps {
  step: CycleStep;
  activeWord?: string;
  clickCount: number;
  isReturningFromLogin: boolean;
}

export const LogoDynamicSlot: React.FC<LogoDynamicSlotProps> = ({
  step,
  activeWord,
  clickCount,
  isReturningFromLogin,
}: LogoDynamicSlotProps): React.JSX.Element => {
  if (step === "fast-closing") {
    const word = activeWord || "Fahril";
    return (
      <span className="logo-dyn-slot" aria-label={word}>
        {word.split("").map((ch, idx) => (
          <span
            key={`fast-close-${word}-${idx}`}
            className="word-char fast-dive"
            style={{ animationDelay: `${idx * 0.015}s` }}
          >
            {ch}
          </span>
        ))}
      </span>
    );
  }

  const isGtMode =
    step === "idle" ||
    step === "gt-leaving" ||
    step === "gt-entering" ||
    isReturningFromLogin ||
    clickCount > 0;

  if (isGtMode) {
    const animClass =
      step === "gt-leaving"
        ? "slide-into-slash"
        : step === "gt-entering"
        ? "slide-out-slash"
        : "";

    return (
      <span className="logo-dyn-slot">
        <span
          className={`logo-char char-3 ${clickCount >= 3 ? "active" : ""} ${animClass}`}
        >
          &gt;
        </span>
      </span>
    );
  }

  const isFahril = step.startsWith("fahril");
  const word = isFahril ? "Fahril" : "Ori7on";
  const isEntering = step.endsWith("-entering");
  const isLeaving = step.endsWith("-leaving");
  const animClass = isEntering ? "emerge" : isLeaving ? "dive" : "";

  return (
    <span className="logo-dyn-slot" aria-label={word}>
      {word.split("").map((ch, idx) => {
        const emergeDistance = -(idx * 20 + 28);
        const delay = isEntering
          ? `${(word.length - 1 - idx) * 0.07}s`
          : isLeaving
          ? `${idx * 0.07}s`
          : "0s";

        const charStyle: React.CSSProperties & Record<string, string> = {
          animationDelay: delay,
          ...(isEntering ? { "--emerge-x": `${emergeDistance}px` } : {}),
        };

        return (
          <span
            key={`${word}-${idx}`}
            className={`word-char ${animClass}`}
            style={charStyle}
          >
            {ch}
          </span>
        );
      })}
    </span>
  );
};
