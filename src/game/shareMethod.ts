// src/game/shareMethod.ts
export type ShareMethod = "bild" | "text" | "clipboard";

/** Der relevante Ausschnitt aus Navigator — so bleiben die Tests ohne DOM möglich. */
export interface ShareCapabilities {
  share?: (data: { files?: File[]; text?: string }) => Promise<void>;
  canShare?: (data: { files: File[] }) => boolean;
}

/**
 * Entscheidet die beste verfügbare Teilen-Methode. `probeFile` ist eine
 * Mini-PNG-Datei nur für die Fähigkeits-Abfrage (canShare prüft den Typ,
 * nicht den Inhalt) — das echte Bild wird erst gerendert, wenn es gebraucht wird.
 */
export function pickShareMethod(nav: ShareCapabilities, probeFile: File): ShareMethod {
  if (typeof nav.share !== "function") return "clipboard";
  if (typeof nav.canShare === "function" && nav.canShare({ files: [probeFile] })) return "bild";
  return "text";
}

/** PNG-Magic-Bytes für die canShare-Probe. */
export const PNG_PROBE = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

/** true, wenn der Nutzer den nativen Teilen-Dialog selbst geschlossen hat. */
export function isAbortError(e: unknown): boolean {
  return e instanceof DOMException && e.name === "AbortError";
}
