import React, { useEffect, useRef } from "react";
import p5 from "p5";
import { Legenda } from "../modelli/Legenda.js";
import "./Legenda.css";

export default function LegendCanvas() {
  const containerRef = useRef(null);

  useEffect(() => {
    const sketch = (p) => {
      let legenda;

      p.setup = () => {
        p.createCanvas(80, 150);
        p.clear();
        legenda = new Legenda(p);
      };

      p.draw = () => {
        p.clear();
        if (legenda) legenda.disegna();
      };
    };

    const instance = new p5(sketch, containerRef.current);
    return () => instance.remove();
  }, []);

  return (
    <div className="legend-wrapper">
      <div ref={containerRef} className="legend-canvas" />
      <div className="legend-labels">
        <span className="legend-label">Grave sovraffollamento</span>
        <span className="legend-label">Nei limiti normativi</span>
      </div>
    </div>
  );
}
