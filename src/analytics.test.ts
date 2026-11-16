// src/analytics.test.ts
import { afterEach, describe, expect, it, vi } from "vitest";
import { analyticsEnabled, setAnalyticsEndpoint, track } from "./analytics";

type GoatGlobal = { goatcounter?: { count: (opts: { path: string; event?: boolean }) => void } };

afterEach(() => {
  setAnalyticsEndpoint("");
  delete (globalThis as GoatGlobal).goatcounter;
  vi.unstubAllGlobals();
});

describe("analytics", () => {
  it("ist ohne Endpoint aus und track ruft nichts auf", () => {
    const count = vi.fn();
    (globalThis as GoatGlobal).goatcounter = { count };
    expect(analyticsEnabled()).toBe(false);
    track("spiel-gestartet");
    expect(count).not.toHaveBeenCalled();
  });

  it("ist mit Endpoint an", () => {
    setAnalyticsEndpoint("https://beispiel.goatcounter.com/count");
    expect(analyticsEnabled()).toBe(true);
  });

  it("respektiert Do-Not-Track", () => {
    setAnalyticsEndpoint("https://beispiel.goatcounter.com/count");
    vi.stubGlobal("navigator", { doNotTrack: "1" });
    expect(analyticsEnabled()).toBe(false);
  });

  it("reicht Events an goatcounter durch", () => {
    setAnalyticsEndpoint("https://beispiel.goatcounter.com/count");
    const count = vi.fn();
    (globalThis as GoatGlobal).goatcounter = { count };
    track("geteilt-bild");
    expect(count).toHaveBeenCalledWith({ path: "geteilt-bild", event: true });
  });

  it("schluckt Fehler des goatcounter-Objekts", () => {
    setAnalyticsEndpoint("https://beispiel.goatcounter.com/count");
    (globalThis as GoatGlobal).goatcounter = {
      count: () => {
        throw new Error("kaputt");
      },
    };
    expect(() => track("verloren")).not.toThrow();
  });
});
