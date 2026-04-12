import React, { useEffect, useMemo, useRef, useState } from "react";
import "./tripleProgressButton.css";

type FloatingToast = {
  id: string;
  text: string;
};

export type TripleProgressButtonProps = {
  label: string;
  busy?: boolean;
  disabled?: boolean;
  isDirty: boolean;
  noChangeText?: string;
  successText?: string;
  onConfirm: () => Promise<void> | void;
};

const uid = () => `${Date.now()}_${Math.random().toString(16).slice(2)}`;

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

const TripleProgressButton: React.FC<TripleProgressButtonProps> = ({
  label,
  busy = false,
  disabled = false,
  isDirty,
  noChangeText = "tidak ada perubahan",
  successText = "Selesai!",
  onConfirm,
}) => {
  const [stage, setStage] = useState(0); // 0..3
  const [hitTick, setHitTick] = useState(0);
  const [toasts, setToasts] = useState<FloatingToast[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const decayTimer = useRef<number | null>(null);

  const progress = useMemo(() => (stage / 3) * 100, [stage]);

  const clearDecay = () => {
    if (decayTimer.current != null) window.clearTimeout(decayTimer.current);
    decayTimer.current = null;
  };

  const scheduleDecay = () => {
    clearDecay();
    decayTimer.current = window.setTimeout(() => {
      setStage(0);
    }, 1400);
  };

  const pushToast = (text: string) => {
    const id = uid();
    setToasts((prev) => [...prev, { id, text }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 1200);
  };

  const click = async () => {
    if (busy || disabled || showSuccess) return;

    // arcade "hit" feedback
    setHitTick((t) => t + 1);

    if (!isDirty) {
      pushToast(noChangeText);
      return;
    }

    setStage((prev) => clamp(prev + 1, 0, 3));
  };

  useEffect(() => {
    if (busy || disabled || !isDirty) {
      if (stage !== 0) setStage(0);
      return;
    }

    if (stage === 0) return;
    if (stage < 3) {
      scheduleDecay();
      return;
    }

    clearDecay();
    const run = async () => {
      try {
        await onConfirm();
        setShowSuccess(true);
        window.setTimeout(() => setShowSuccess(false), 2500);
      } finally {
        setStage(0);
      }
    };
    void run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  const buttonDisabled = (disabled || busy || showSuccess) && !(!isDirty && !busy && !showSuccess);

  const getLabel = () => {
    if (busy) return "Saving...";
    if (showSuccess) return successText;
    return label;
  };

  return (
    <div className={`tripleBtnWrap ${showSuccess ? "isSuccess" : ""}`}>
      <button
        type="button"
        className={`tripleBtn ${stage > 0 ? "hasProgress" : ""} ${buttonDisabled ? "disabled" : ""} ${showSuccess ? "success" : ""}`}
        onClick={() => void click()}
        disabled={disabled || busy || showSuccess}
        aria-label={label}
      >
        <span className="tripleBtnFill" style={{ height: `${progress}%` }} />
        <span key={hitTick} className="tripleBtnHit" aria-hidden="true" />

        <div className="tripleBtnBorders" aria-hidden="true">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none">
            <path className="border-path" d="M 50 100 L 100 100 L 100 0 L 50 0 M 50 100 L 0 100 L 0 0 L 50 0" />
          </svg>
        </div>

        <span className="tripleBtnContent">
          <span className="tripleBtnLabel">{getLabel()}</span>
          {!showSuccess && (
            <span className="tripleBtnStages" aria-hidden="true">
              <span className={`dot ${stage >= 1 ? "on" : ""}`} />
              <span className={`dot ${stage >= 2 ? "on" : ""}`} />
              <span className={`dot ${stage >= 3 ? "on" : ""}`} />
            </span>
          )}
        </span>
      </button>

      <div className="tripleBtnToasts" aria-hidden="true">
        {toasts.map((t) => (
          <div key={t.id} className="tripleBtnToast">
            {t.text}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TripleProgressButton;

