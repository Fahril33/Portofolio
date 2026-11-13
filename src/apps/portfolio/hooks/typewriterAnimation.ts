export type TypewriterPhase = "starting" | "typing" | "holding" | "deleting" | "waiting" | "complete";

export interface TypewriterFrame {
  textIndex: number;
  cursor: number;
  phase: TypewriterPhase;
  cycle?: number;
  sessionSpeed?: number;
}

export interface TypewriterTiming {
  typingMs: number;
  deletingMs: number;
  pauseMs: number;
  rotate: boolean;
  loop: boolean;
}

export const getNextSessionSpeed = (textIndex: number, cycle: number = 0): number => {
  // Diverse speed profiles: snappy fast, thoughtful, brisk, measured, standard
  const speedProfiles = [0.76, 1.28, 0.88, 1.38, 0.82, 1.14, 1.24, 0.92];
  const profileIndex = Math.abs((textIndex * 3 + cycle * 5 + 2) % speedProfiles.length);
  const baseProfile = speedProfiles[profileIndex] ?? 1.0;
  // Micro-variation (+/- 0.05) so repeated loops remain natural and organic
  const microJitter = (Math.random() - 0.5) * 0.1;
  return Math.round(Math.max(0.68, Math.min(1.45, baseProfile + microJitter)) * 100) / 100;
};

export const advanceTypewriter = (
  frame: TypewriterFrame,
  phrases: readonly (readonly string[])[],
  settings: TypewriterTiming
): TypewriterFrame => {
  const { textIndex, cursor, phase, cycle = 0 } = frame;
  const length = phrases[textIndex]?.length ?? 0;
  if (length === 0 || phase === "complete") return { ...frame, phase: "complete" };
  if (phase === "holding") return { ...frame, phase: "deleting" };
  if (phase === "deleting") {
    if (cursor > 1) {
      return { ...frame, cursor: cursor - 1 };
    }
    const nextIndex = (textIndex + 1) % phrases.length;
    const nextCycle = nextIndex === 0 ? cycle + 1 : cycle;
    return {
      textIndex: nextIndex,
      cursor: 0,
      phase: "waiting",
      cycle: nextCycle,
      sessionSpeed: getNextSessionSpeed(nextIndex, nextCycle),
    };
  }
  const nextCursor = Math.min(length, cursor + 1);
  const canAdvance = settings.rotate && phrases.length > 1 && (settings.loop || textIndex < phrases.length - 1);
  return {
    ...frame,
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
    case "waiting": {
      const waitMultiplier = 0.85 + (((frame.textIndex * 3 + (frame.cycle ?? 0) * 7) % 4) * 0.1);
      return Math.round(260 * waitMultiplier);
    }
    case "holding": {
      const holdMultiplier = 0.9 + (((frame.textIndex * 7 + (frame.cycle ?? 0) * 11) % 5) * 0.075);
      return Math.max(1800, Math.round(settings.pauseMs * holdMultiplier));
    }
    case "deleting": {
      const totalLen = phrase?.length ?? 10;
      // Key repeat initial delay: the first backspace pauses briefly before rapid repeat
      const isInitialBackspace = frame.cursor >= totalLen - 1;
      if (isInitialBackspace) {
        return Math.max(180, Math.round(settings.deletingMs * 3.2));
      }
      // Rapid, steady mechanical backspacing tuned slightly by session cadence
      const delSessionMult = Math.min(1.2, Math.max(0.85, (frame.sessionSpeed ?? 1.0) * 0.95));
      return Math.max(24, Math.min(48, Math.round(settings.deletingMs * 0.65 * delSessionMult)));
    }
    case "typing": {
      const sessionMultiplier = frame.sessionSpeed ?? 1.0;
      const baseMs = Math.max(28, Math.round(settings.typingMs * sessionMultiplier));
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

      // Keystroke cadence jitter with occasional natural typing bursts
      const charCode = char ? char.charCodeAt(0) : frame.cursor;
      const seed = Math.sin(frame.cursor * 12.9898 + charCode * 78.233 + (frame.cycle ?? 0) * 37.719);
      const fraction = seed - Math.floor(seed);
      if (fraction < 0.22) {
        return Math.max(24, Math.round(baseMs * 0.72));
      }
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
