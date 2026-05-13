import React, { useState } from "react";
import "./Credits.css";

const CREDIT_TEXT =
  "Dati elaborati a partire dalle Schede di Trasparenza degli Istituiti Penitenziari del Ministero della Giustizia";

export default function Credits() {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <div className="credits">
        <button className="credits-trigger" onClick={() => setOpen(true)}>
          Dati
        </button>
      </div>
    );
  }

  return (
    <div className="credits expanded">
      <span
        className="credits-text"
        onClick={() =>
          window.open(
            "https://www.giustizia.it/giustizia/page/it/istituti_penitenziari#",
            "_blank"
          )
        }
      >
        {CREDIT_TEXT}
      </span>
      <button className="credits-close" onClick={() => setOpen(false)}>
        &times;
      </button>
    </div>
  );
}
