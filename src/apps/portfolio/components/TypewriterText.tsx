import React, { useEffect, useMemo, useRef, useState } from "react";
import type { TypewriterSettings } from "../../../shared/types/heroSettings";

type Props = {
  className?: string;
  settings: TypewriterSettings;
};

const safeIndex = (texts: string[], idx: number) => {
  if (texts.length === 0) return 0;
  if (!Number.isFinite(idx)) return 0;
  return Math.max(0, Math.min(texts.length - 1, Math.floor(idx)));
};

const TypewriterText: React.FC<Props> = ({ className, settings }) => {
  const texts = useMemo(
    () => settings.texts.filter((t) => t.trim().length > 0),
    [settings.texts]
  );

  const baseIndex = safeIndex(texts, settings.defaultIndex);
  const [textIndex, setTextIndex] = useState(baseIndex);
  const [cursor, setCursor] = useState(0);
  const [mode, setMode] = useState<"typing" | "pause" | "deleting">("typing");
  const timer = useRef<number | null>(null);

  const activeText = texts[textIndex] ?? "";

  useEffect(() => {
    setTextIndex(baseIndex);
    setCursor(0);
    setMode("typing");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseIndex, texts.join("\n")]);

  useEffect(() => {
    if (timer.current != null) window.clearTimeout(timer.current);
    timer.current = null;

    if (!settings.enabled) return;
    if (texts.length === 0) return;

    // If rotation disabled: type until full, then stop.
    if (!settings.rotate && cursor >= activeText.length) return;

    const tick = () => {
      if (mode === "typing") {
        const next = Math.min(activeText.length, cursor + 1);
        setCursor(next);
        if (next >= activeText.length) setMode("pause");
        return;
      }

      if (mode === "pause") {
        if (settings.rotate && texts.length > 1) {
          setMode("deleting");
        }
        return;
      }

      // deleting
      const next = Math.max(0, cursor - 1);
      setCursor(next);
      if (next === 0) {
        setTextIndex((prev) => {
          const nextIndex = (prev + 1) % texts.length;
          return settings.loop ? nextIndex : prev;
        });
        setMode("typing");
      }
    };

    let delay = settings.typingMs;
    if (mode === "pause") delay = settings.pauseMs;
    if (mode === "deleting") delay = settings.deletingMs;

    // Optional: add slight variance for professional feel
    const jitter = mode === "typing" ? Math.random() * 20 : 0;

    timer.current = window.setTimeout(tick, Math.max(0, delay + jitter));
    return () => {
      if (timer.current != null) window.clearTimeout(timer.current);
      timer.current = null;
    };
  }, [
    activeText.length,
    cursor,
    mode,
    settings.deletingMs,
    settings.enabled,
    settings.loop,
    settings.pauseMs,
    settings.rotate,
    settings.typingMs,
    texts.length,
  ]);

  const shown = settings.enabled ? activeText.slice(0, cursor) : activeText;

  return (
    <span className={className}>
      <span className="typewriterText">{shown}</span>
      <span className="typewriterCaret" aria-hidden="true" />
    </span>
  );
};

export default TypewriterText;

