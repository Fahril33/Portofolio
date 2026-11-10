import React from "react";
import type { TypewriterSettings } from "../../../shared/types/heroSettings";
import { useTypewriter } from "../hooks/useTypewriter";
import { useTypewriterMotion } from "../hooks/useTypewriterMotion";

export interface TypewriterTextProps {
  className?: string;
  settings: TypewriterSettings;
}

const TypewriterText: React.FC<TypewriterTextProps> = ({ className, settings }: TypewriterTextProps): React.JSX.Element => {
  const { text, fullText, caret } = useTypewriter(settings);
  const { stageRef, caretRef } = useTypewriterMotion(text, settings);

  return (
    <span className={className} data-caret={caret}>
      <span className="typewriterAccessible">{fullText}</span>
      <span ref={stageRef} className="typewriterStage" aria-hidden="true">
        <span className="typewriterText">{text}</span>
        <span ref={caretRef} className="typewriterCaretPosition">
          <span className="typewriterCaret">|</span>
        </span>
      </span>
    </span>
  );
};

export default TypewriterText;
