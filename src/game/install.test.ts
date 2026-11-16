import { describe, expect, it } from "vitest";
import { installMode } from "./install";

const base = { standalone: false, dismissed: false, hasPrompt: false, isIOS: false };

describe("installMode", () => {
  it("none, wenn bereits als App installiert (standalone)", () => {
    expect(installMode({ ...base, standalone: true, hasPrompt: true })).toBe("none");
  });
  it("none, wenn der Hinweis abgewiesen wurde", () => {
    expect(installMode({ ...base, dismissed: true, hasPrompt: true })).toBe("none");
  });
  it("prompt, wenn der Browser einen Install-Prompt hergibt", () => {
    expect(installMode({ ...base, hasPrompt: true })).toBe("prompt");
  });
  it("ios, wenn iOS ohne Prompt", () => {
    expect(installMode({ ...base, isIOS: true })).toBe("ios");
  });
  it("none auf Desktop ohne Prompt", () => {
    expect(installMode(base)).toBe("none");
  });
});
