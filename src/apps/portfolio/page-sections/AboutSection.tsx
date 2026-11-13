import React, { useId, useRef } from "react";
import "../components/styles/aboutSection.css";
import AboutProfile from "../components/AboutProfile";
import { useAboutKinetic } from "../hooks/useAboutKinetic";

const phases = [
  {
    world: "THE POSSIBILITY",
    description:
      "A rotating organic form with a purple neural network and flowing signals.",
  },
  {
    world: "THE INTENTION",
    description:
      "A rotating geometric form with colorful brushstrokes and fading paint splashes.",
  },
  {
    world: "THE REALITY",
    description: "A rotating geometric wireframe with green streams of data.",
  },
  {
    world: "THE WHOLE PICTURE",
    description:
      "Imagine, Design, Code come together with neural connections, paint, and a wireframe in one form.",
  },
] as const;

const About: React.FC = (): React.JSX.Element => {
  const rootRef = useRef<HTMLDivElement>(null);
  const headingId = useId();
  const { phase, form, together } = useAboutKinetic(rootRef);
  const currentPhase = phases[phase];

  return (
    <div className="aboutSectionContainer" id="about" ref={rootRef} data-scroll-driven data-form={form} data-together={together}>
      <div className="aboutSticky">
        <section
          className="idc-shell"
          data-phase={phase}
          aria-labelledby={headingId}
        >
          <h2 className="idc-screenreader" id={headingId}>
            About Me — Imagine, Design, Code
          </h2>
          <div
            className="idc-stage"
            role="group"
            aria-label="Imagine, Design, Code. Scroll down to advance, scroll up to go back."
          >
            <div className="idc-atmosphere" aria-hidden="true">
              <div className="idc-haze dream" />
              <div className="idc-haze form" />
              <div className="idc-haze logic" />
            </div>
            <canvas aria-hidden="true" />
            <AboutProfile form={form} visible={phase === 3} />
            <button
              type="button"
              className="idc-object-control"
              disabled={!together}
              aria-label={`Rotate ${["Imagine", "Design", "Code", "Together"][form]} object with arrow keys or drag. Click or press Enter to change form.`}
            />
            <p className="idc-object-hint" aria-hidden="true">DRAG TO ROTATE <span>·</span> CLICK TO TRANSFORM</p>
            <div className="idc-coordinate" aria-hidden="true">
              <span className="idc-index">
                {String(phase + 1).padStart(2, "0")}
              </span>
              <span className="idc-world">{currentPhase.world}</span>
            </div>
            <p className="idc-word idc-imagine" aria-hidden="true">
              Imagine
              <span className="idc-accent" />
            </p>
            <p className="idc-word idc-design" aria-hidden="true">
              DESIGN
              <span className="idc-accent" />
            </p>
            <p className="idc-word idc-code" aria-hidden="true">
              <span className="idc-punctuation">&lt;</span>
              Code
              <span className="idc-punctuation">/&gt;</span>
              <span className="idc-accent" />
            </p>
            <div className="idc-blueprint" aria-hidden="true">
              <div className="idc-bound">
                <span className="idc-handle" />
                <span className="idc-handle" />
                <span className="idc-handle" />
                <span className="idc-handle" />
                <span className="idc-bound-label">
                  FORM / PROPORTION / INTENT
                </span>
              </div>
            </div>
            <pre className="idc-snippet" aria-hidden="true">
              <span className="idc-green">const</span>
              {" idea = imagine();\n"}
              <span className="idc-green">const</span>
              {" form = design(idea);\n"}
              <span className="idc-green">await</span>
              {" build(form);"}
            </pre>
          </div>
          <p className="idc-screenreader">{(together ? phases[form] : currentPhase).description}</p>
          <div className="idc-palette" aria-hidden="true">
            {Array.from({ length: 9 }, (_, index) => (
              <span key={index} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;
