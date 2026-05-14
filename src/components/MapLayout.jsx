import React, { useState, useCallback, useMemo } from "react";
import CanvasScene from "./CanvasScene.jsx";
import InfoPanel from "./InfoPanel.jsx";
import Legenda from "./Legenda.jsx";
import LegendCanvas from "./LegendCanvas.jsx";
import Credits from "./Credits.jsx";
import TerminalSequence from "./TerminalSequence";
import "./MapLayout.css";

function TitleSequence() {
  const steps = useMemo(
    () => [
      {
        type: "text",
        content: "Chiusi Dentro",
        pause: 2000,
        speed: 80,
      },
      {
        type: "text",
        content: "il sovraffollamento delle carceri Italiane",
        pause: 2000,
        speed: 40,
        variant: "small",
      },
    ],
    []
  );

  return <TerminalSequence steps={steps} />;
}

export default function MapLayout() {
  const [mapData, setMapData] = useState(null);

  const handleDataChange = useCallback((data) => {
    setMapData(data);
  }, []);

  return (
    <div className="map-layout">
      <div className="map-overlay">
        <header className="map-header">
          <TitleSequence />
        </header>
        <div className="map-grid">
          <aside className="col col-left">
            <Legenda />
            <LegendCanvas />
          </aside>
          <div className="col col-center" />
          <aside className="col col-right">
            <InfoPanel data={mapData} />
          </aside>
        </div>
        <Credits />
      </div>
      <CanvasScene onDataChange={handleDataChange} />
    </div>
  );
}
