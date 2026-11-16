export type InstallMode = "prompt" | "ios" | "none";

/** Entscheidet, ob und wie die Install-Zeile erscheint — pur und testbar. */
export function installMode(opts: {
  standalone: boolean;
  dismissed: boolean;
  hasPrompt: boolean;
  isIOS: boolean;
}): InstallMode {
  if (opts.standalone || opts.dismissed) return "none";
  if (opts.hasPrompt) return "prompt";
  if (opts.isIOS) return "ios";
  return "none";
}
