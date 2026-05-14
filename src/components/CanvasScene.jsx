import React, { useEffect, useRef } from "react";
import p5 from "p5";
import { createSketch } from "../sketch/sketch.js";

export default function CanvasScene({ onDataChange }) {
  const containerRef = useRef(null);
  const onDataChangeRef = useRef(onDataChange);
  onDataChangeRef.current = onDataChange;

  useEffect(() => {
    const sketch = createSketch((data) => onDataChangeRef.current(data));
    const instance = new p5(sketch, containerRef.current);

    return () => {
      instance.remove();
    };
  }, []);

  return <div ref={containerRef} className="canvas-layer" />;
}
