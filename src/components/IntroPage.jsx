import React, { useMemo } from "react";
import TerminalSequence from "./TerminalSequence";

export default function IntroPage({ onStart }) {
  const steps = useMemo(
    () => [
      {
        type: "text",
        content: "In Italia ci sono 189 carceri.",
        pause: 2000,
      },
      {
        type: "text",
        content: "Di queste, 153 sono sovraffollate.",
        pause: 2000,
      },
      {
        type: "button",
        content: "scopri di più",
        onClick: onStart,
        variant: "medium",
      },
    ],
    [onStart]
  );

  return (
    <div className="intro-container">
      <TerminalSequence steps={steps} />
    </div>
  );
}
