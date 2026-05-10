import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./styles.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register the service worker for offline support after Add to Home Screen.
// Silently no-ops when SW isn't available (file:// builds, HTTP w/o TLS,
// browsers without SW support). Wrapped in try/catch as a final guard.
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    try {
      navigator.serviceWorker.register("./sw.js").catch(() => {});
    } catch {}
  });
}
