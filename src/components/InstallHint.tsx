import { useState } from "react";
import { installMode } from "../game/install";
import { getInstallPrompt } from "../game/installPrompt";
import { loadInstallHintDone, saveInstallHintDone } from "../storage/storage";

function isStandalone(): boolean {
  return (
    (window.matchMedia?.("(display-mode: standalone)").matches ?? false) ||
    (navigator as { standalone?: boolean }).standalone === true
  );
}

function isIOS(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

/** Dezente Install-Zeile auf dem Ergebnis-Screen — abweisbar, nie ein Popup. */
export function InstallHint() {
  const [hidden, setHidden] = useState(false);
  const prompt = getInstallPrompt();
  const mode = installMode({
    standalone: isStandalone(),
    dismissed: hidden || loadInstallHintDone(),
    hasPrompt: prompt !== null,
    isIOS: isIOS(),
  });
  if (mode === "none") return null;

  const dismiss = () => {
    saveInstallHintDone();
    setHidden(true);
  };

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-edge bg-cell px-3 py-2.5">
      <p className="font-mono text-xs uppercase tracking-wider text-dim">
        {mode === "prompt" ? "Als App aufs Handy?" : "Als App: Teilen-Menü → „Zum Home-Bildschirm“"}
      </p>
      {mode === "prompt" && (
        <button
          type="button"
          className="shrink-0 rounded border border-amber px-2 py-1 font-mono text-[11px] uppercase tracking-wider text-amber"
          onClick={async () => {
            const p = getInstallPrompt();
            if (p) {
              try {
                await p.prompt();
                await p.userChoice;
              } catch {
                // Browser hat den Prompt verweigert — egal, nicht nerven.
              }
            }
            dismiss();
          }}
        >
          Installieren
        </button>
      )}
      <button
        type="button"
        aria-label="Hinweis ausblenden"
        className="min-h-6 min-w-6 shrink-0 px-1 font-mono text-sm text-dim"
        onClick={dismiss}
      >
        ×
      </button>
    </div>
  );
}
