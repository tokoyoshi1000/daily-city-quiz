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

  it('respektiert Do-Not-Track auch als "yes" (ältere Firefox)', () => {
    setAnalyticsEndpoint("https://beispiel.goatcounter.com/count");
    vi.stubGlobal("navigator", { doNotTrack: "yes" });
    expect(analyticsEnabled()).toBe(false);
  });

  it("respektiert window.doNotTrack", () => {
    setAnalyticsEndpoint("https://beispiel.goatcounter.com/count");
    vi.stubGlobal("doNotTrack", "1");
    expect(analyticsEnabled()).toBe(false);
  });

  it("puffert Events, bis count.js geladen ist", () => {
    setAnalyticsEndpoint("https://beispiel.goatcounter.com/count");
    track("spiel-gestartet"); // noch kein goatcounter-Global → gepuffert
    const count = vi.fn();
    (globalThis as GoatGlobal).goatcounter = { count };
    track("geloest-h3");
    expect(count).toHaveBeenNthCalledWith(1, { path: "spiel-gestartet", event: true });
    expect(count).toHaveBeenNthCalledWith(2, { path: "geloest-h3", event: true });
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
