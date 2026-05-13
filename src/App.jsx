import React, { useState } from "react";
import IntroPage from "./components/IntroPage.jsx";
import MapLayout from "./components/MapLayout.jsx";
import "./App.css";

export default function App() {
  const [showCanvas, setShowCanvas] = useState(false);

  return (
    <>
      {!showCanvas && <IntroPage onStart={() => setShowCanvas(true)} />}
      {showCanvas && <MapLayout />}
    </>
  );
}