import React from "react";
import "./InfoPanel.css";

export default function InfoPanel({ data }) {
  if (!data) return null;

  const { regione, descrizione, carcere, sovraffollamento, persone, spazio } = data;
  const hasStats = carcere && sovraffollamento != null;

  const statColor = sovraffollamento <= 100 ? "white"
    : sovraffollamento <= 150 ? "yellow"
    : "rgb(230, 50, 50)";

  return (
    <div className="info-panel">
      <div className="info-content">
        <div className="info-regione">
          <h2 className="info-regione-nome">{regione}</h2>
          {descrizione && <p className="info-regione-desc">{descrizione}</p>}
        </div>

        {carcere && (
          <div className="info-carcere">
            <p className="info-carcere-nome">{carcere}</p>
          </div>
        )}

        {hasStats && (
          <div className="info-stats">
            <InfoStat label="Tasso di affollamento:" value={`${sovraffollamento}%`} color={statColor} />
            {spazio != null && <InfoStat label="Spazio per persona:" value={`${spazio} m\u00B2`} />}
            {persone != null && <InfoStat label="Persone per stanza:" value={persone} />}
          </div>
        )}
      </div>
    </div>
  );
}

function InfoStat({ label, value, color }) {
  return (
    <div className="info-stat">
      <span className="info-stat-label">{label}</span>
      <span className="info-stat-value" style={color ? { color } : undefined}>{value}</span>
    </div>
  );
}
