import React from "react";
import "./styles/transition.css";

type TransitionProps = {
  firstcolor: string;
};

type HeroTransitionProps = {
  firstcolor?: string;
  secondcolor?: string;
  /** Any CSS length, including clamp(), for responsive depth. */
  height?: string;
  /** Wave depth as a fraction of the transition height (0–0.3). */
  amplitude?: number;
  /** Number of wave cycles across the viewport (0.5–4). */
  waves?: number;
  /** Horizontal phase offset, in radians. */
  phase?: number;
};

type TransitionStyle = React.CSSProperties & {
  "--transition-from"?: string;
  "--transition-to"?: string;
  "--transition-height"?: string;
  "--transition-shape": string;
};

const bounded = (value: number, fallback: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, Number.isFinite(value) ? value : fallback));

function TransitionHero({
  firstcolor,
  secondcolor,
  height,
  amplitude = 0.18,
  waves = 1.5,
  phase = 0.3,
}: HeroTransitionProps) {
  const depth = bounded(amplitude, 0.18, 0, 0.3);
  const frequency = bounded(waves, 1.5, 0.5, 4);
  const offset = Number.isFinite(phase) ? phase : 0.3;
  // Percentage coordinates keep the same organic contour at every viewport width.
  const edge = Array.from({ length: 161 }, (_, index) => {
    const x = 1 - index / 160;
    const angle = x * Math.PI * 2 * frequency + offset;
    const y = 0.5 + depth * (Math.sin(angle) + 0.25 * Math.sin(angle * 2 + 0.8));
    return `${(x * 100).toFixed(3)}% ${(y * 100).toFixed(3)}%`;
  });
  const style: TransitionStyle = {
    "--transition-from": firstcolor,
    "--transition-to": secondcolor,
    "--transition-height": height,
    "--transition-shape": `polygon(0 0, 100% 0, ${edge.join(", ")})`,
  };

  return (
    <div className="section-transition" style={style} aria-hidden="true">
      <div className="section-transition__wash" />
      <div className="section-transition__surface" />
    </div>
  );
}

function TransitionFooter({ firstcolor }: TransitionProps) {
  return (
    <div className="transitionFooter">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
        <path
          fill={firstcolor}
          fillOpacity="1"
          d="M0,128L40,149.3C80,171,160,213,240,197.3C320,181,400,107,480,112C560,117,640,203,720,202.7C800,203,880,117,960,112C1040,107,1120,181,1200,181.3C1280,181,1360,107,1400,69.3L1440,32L1440,320L1400,320C1360,320,1280,320,1200,320C1120,320,1040,320,960,320C880,320,800,320,720,320C640,320,560,320,480,320C400,320,320,320,240,320C160,320,80,320,40,320L0,320Z"
        ></path>
      </svg>
    </div>
  );
}

export { TransitionHero, TransitionFooter };
