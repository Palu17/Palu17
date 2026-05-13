import React from "react";
import "./Button.css";

export default function Button({ children, onClick, variant = "medium" }) {
  return (
    <button className={`btn btn-${variant}`} onClick={onClick}>
      {children}
    </button>
  );
}