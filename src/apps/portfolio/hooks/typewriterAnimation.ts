export type TypewriterPhase = "starting" | "typing" | "holding" | "deleting" | "waiting" | "complete";

export interface TypewriterFrame {
  textIndex: number;
  cursor: number;
  phase: TypewriterPhase;
}

export interface TypewriterTiming {
  typingMs: number;
  deletingMs: number;
  pauseMs: number;
  rotate: boolean;
  loop: boolean;
}

export const advanceTypewriter = (
  frame: TypewriterFrame,
  phrases: readonly (readonly string[])[],
  settings: TypewriterTiming
): TypewriterFrame => {
  const { textIndex, cursor, phase } = frame;
  const length = phrases[textIndex]?.length ?? 0;
  if (length === 0 || phase === "complete") return { ...frame, phase: "complete" };
  if (phase === "holding") return { ...frame, phase: "deleting" };
  if (phase === "deleting") {
    return cursor > 1
      ? { ...frame, cursor: cursor - 1 }
      : { textIndex: (textIndex + 1) % phrases.length, cursor: 0, phase: "waiting" };
  }
  const nextCursor = Math.min(length, cursor + 1);
  const canAdvance = settings.rotate && phrases.length > 1 && (settings.loop || textIndex < phrases.length - 1);
  return {
    textIndex,
    cursor: nextCursor,
    phase: nextCursor < length ? "typing" : canAdvance ? "holding" : "complete",
  };
};

export const getTypewriterDelay = (
  frame: TypewriterFrame,
  settings: TypewriterTiming,
  returningFromLogin: boolean,
  phrase?: readonly string[]
): number | null => {
  switch (frame.phase) {
    case "complete":
      return null;
    case "starting":
      return returningFromLogin ? 650 : 250;
    case "waiting":
      return 260;
    case "holding":
      return Math.max(2200, settings.pauseMs);
    case "deleting": {
      const totalLen = phrase?.length ?? 10;
      // Key repeat initial delay: the first backspace pauses briefly before rapid repeat
      const isInitialBackspace = frame.cursor >= totalLen - 1;
      if (isInitialBackspace) {
        return Math.max(180, Math.round(settings.deletingMs * 3.2));
      }
      // Rapid, steady mechanical backspacing
      return Math.max(24, Math.min(48, Math.round(settings.deletingMs * 0.65)));
    }
    case "typing": {
      const baseMs = Math.max(35, settings.typingMs);
      const char = phrase?.[frame.cursor - 1] ?? "";

      // First character in a phrase has a brief initial press latency
      if (frame.cursor === 1) {
        return Math.round(baseMs * 1.35);
      }

      // Word breaks and symbols have natural slight hesitation
      if (char === " " || char === "_" || char === "-" || char === "." || char === "/") {
        return Math.round(baseMs * 1.55);
      }

      // Numbers or symbols
      if (/[0-9]/.test(char)) {
        return Math.round(baseMs * 1.25);
      }

      // Deterministic natural typing cadence variation (-15% to +20%)
      const charCode = char ? char.charCodeAt(0) : frame.cursor;
      const seed = Math.sin(frame.cursor * 12.9898 + charCode * 78.233);
      const fraction = seed - Math.floor(seed);
      const jitter = fraction * 0.35 - 0.15;
      return Math.max(28, Math.round(baseMs * (1 + jitter)));
    }
  }
};

export const getTypewriterMotionMs = (
  _settings: { typingMs: number; deletingMs: number },
  deleting: boolean
): number => {
  return deleting ? 24 : 36;
};
