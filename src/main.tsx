import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { LanguageProvider } from "./LanguageProvider";

// if ("serviceWorker" in navigator) {
//   navigator.serviceWorker
//     .register("/preview-sw.js")
//     .then((registration) => {
//       console.log("Service Worker registered with scope:", registration.scope);
//       // Send the file mapping to the SW
//     })
//     .catch((error) => {
//       console.error("Service Worker registration failed:", error);
//     });
// }

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </React.StrictMode>
);
