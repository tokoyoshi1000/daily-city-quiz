import { track } from "../analytics";
import { saveInstallHintDone } from "../storage/storage";

export interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

let deferred: BeforeInstallPromptEvent | null = null;

/** Einmal beim App-Start aufrufen (main.tsx) — fängt den Install-Prompt des Browsers ab. */
export function captureInstallPrompt(): void {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferred = e as BeforeInstallPromptEvent;
  });
  window.addEventListener("appinstalled", () => {
    deferred = null;
    saveInstallHintDone();
    track("installiert");
  });
}

export function getInstallPrompt(): BeforeInstallPromptEvent | null {
  return deferred;
}
