import React from "react";
import "./Legenda.css";

export default function Legenda() {
  return (
    <div className="legenda">
      <p className="legenda-riga">
        Questa &egrave; la situazione delle carceri nel nostro paese.
      </p>
      <p className="legenda-riga">
        Passando il mouse sopra gli esagoni e cliccando potrai ottenere pi&ugrave;{" "}
        informazioni.
      </p>
      <p className="legenda-riga legenda-comune">
        Il colore degli esagoni indica progressivamente il livello di
        sovraffollamento del carcere.
      </p>
    </div>
  );
}
