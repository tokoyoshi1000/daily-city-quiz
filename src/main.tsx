import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import "@fontsource-variable/oswald";
import "@fontsource/b612/400.css";
import "@fontsource/b612/400-italic.css";
import "@fontsource/b612/700.css";
import "@fontsource/b612-mono/400.css";
import "@fontsource/b612-mono/700.css";
import App from "./App";
import "./index.css";
import { initAnalytics } from "./analytics";
import { captureInstallPrompt } from "./game/installPrompt";

registerSW();
captureInstallPrompt();
initAnalytics();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
