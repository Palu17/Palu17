import React, { useState, useCallback } from "react";
import CanvasScene from "./CanvasScene.jsx";
import InfoPanel from "./InfoPanel.jsx";
import Legenda from "./Legenda.jsx";
import Credits from "./Credits.jsx";
import "./MapLayout.css";

export default function MapLayout() {
  const [mapData, setMapData] = useState(null);

  const handleDataChange = useCallback((data) => {
    setMapData(data);
  }, []);

  return (
    <div className="map-layout">
      <CanvasScene onDataChange={handleDataChange} />
      <div className="map-overlay">
        <header className="map-header">
          <h1 className="map-title">Chiusi Dentro</h1>
          <p className="map-subtitle">il sovraffollamento delle carceri Italiane</p>
        </header>
        <div className="map-grid">
          <aside className="col col-left">
            <Legenda />
          </aside>
          <div className="col col-center" />
          <aside className="col col-right">
            <InfoPanel data={mapData} />
          </aside>
        </div>
        <Credits />
      </div>
    </div>
  );
}
