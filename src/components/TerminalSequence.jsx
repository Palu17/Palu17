import React, { useState, useEffect, useRef } from "react";
import Button from "./Button";
import "./TerminalSequence.css";

function Cursor({ variant = "blink" }) {
  return <span className={`ts-cursor ts-cursor--${variant}`} />;
}

export default function TerminalSequence({ steps }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [prompts, setPrompts] = useState({});
  const [texts, setTexts] = useState({});
  const [stepState, setStepState] = useState({});
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const stepsRef = useRef(steps);
  const idsRef = useRef([]);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  stepsRef.current = steps;

  useEffect(() => {
    const steps = stepsRef.current;
    if (activeIdx >= steps.length) return;

    idsRef.current = [];
    const ids = idsRef.current;
    const step = steps[activeIdx];

    setPrompts((p) => ({ ...p, [activeIdx]: true }));

    if (step.type === "text") {
      ids.push(
        setTimeout(() => {
          setStepState((s) => ({ ...s, [activeIdx]: "typing" }));
          let i = 0;
          const int = setInterval(() => {
            if (i < step.content.length) {
              setTexts((t) => ({
                ...t,
                [activeIdx]: step.content.slice(0, i + 1),
              }));
              i++;
            } else {
              clearInterval(int);
              setStepState((s) => ({ ...s, [activeIdx]: "done" }));
              ids.push(
                setTimeout(() => setActiveIdx((a) => a + 1), step.pause ?? 2000)
              );
            }
          }, step.speed ?? 50);
          ids.push(int);
        }, step.promptDelay ?? 1000)
      );
    }

    if (step.type === "button") {
      ids.push(
        setTimeout(() => {
          setStepState((s) => ({ ...s, [activeIdx]: "done" }));
        }, step.promptDelay ?? 1000)
      );
    }

    return () => {
      idsRef.current.forEach((id) => clearInterval(id));
      idsRef.current = [];
    };
  }, [activeIdx]);

  const [cursorOn, setCursorOn] = useState(false);
  const isTyping =
    activeIdx < steps.length &&
    steps[activeIdx]?.type === "text" &&
    stepState[activeIdx] === "typing";

  useEffect(() => {
    if (!isTyping) {
      setCursorOn(false);
      return;
    }
    setCursorOn(true);
    const blink = setInterval(() => setCursorOn((c) => !c), 500);
    return () => clearInterval(blink);
  }, [isTyping]);

  return (
    <div className="ts">
      {steps.map((step, i) => (
        <div
          key={i}
          className={`ts-line${i > 0 ? " ts-line--secondary" : ""}`}
        >
          {prompts[i] && <span className="ts-prompt ts-prompt--in">&gt;</span>}

          {step.type === "text" && (
            <>
              <span className={`ts-text${step.variant ? ` ts-text--${step.variant}` : ""}`}>{texts[i] || ""}</span>
              {activeIdx === i && stepState[i] === "typing" &&
                (cursorOn ? (
                  <Cursor variant="blink" />
                ) : (
                  <Cursor variant="off" />
                ))}
            </>
          )}

          {step.type === "button" && stepState[i] === "done" && (
            <Button
              variant={isMobile ? "small" : (step.variant ?? "medium")}
              onClick={step.onClick}
            >
              {step.content}
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}
