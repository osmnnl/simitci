/**
 * CI balance gate. If a content/balance change moves any pacing target out of
 * its band, the build fails before it can reach players.
 */
import { describe, expect, it } from "vitest";
import { simulate } from "./player";
import { unlockedDistricts } from "../engine/derive";

const H = 3600;
const D = 86400;
const ALL = { devir: true, skills: true, districts: true, orders: true, crowd: true };
const OFF = { devir: false, skills: false, districts: false, orders: false, crowd: false };

describe("Faz 1 pacing (no meta systems)", () => {
  const r = simulate(0.1, OFF);
  const k = r.firstTier.korkuteli!;
  it("buys early tiers within seconds to minutes", () => {
    expect(k[1]).toBeLessThan(60);
    expect(k[3]).toBeLessThan(5 * 60);
  });
  it("reaches Mahalle fırını around the one-hour mark", () => {
    expect(k[5]).toBeGreaterThan(40 * 60);
    expect(k[5]).toBeLessThan(90 * 60);
  });
});

describe("full game, normal player (12 checks/day)", () => {
  const r = simulate(35, ALL);
  const k = r.firstTier.korkuteli!;
  const between = (v: number | undefined, lo: number, hi: number) => {
    expect(v).toBeDefined();
    expect(v!).toBeGreaterThanOrEqual(lo);
    expect(v!).toBeLessThanOrEqual(hi);
  };
  it("first Devir lands in 30–100 minutes", () => between(r.devirs[0]?.t, 30 * 60, 100 * 60));
  it("Pastane ~day 1", () => between(k[7], 12 * H, 30 * H));
  it("Şube zinciri ~day 5", () => between(k[8], 3.5 * D, 7 * D));
  it("Fabrika ~week 3", () => between(k[9], 15 * D, 28 * D));
  it("Manavgat ~day 1", () => between(r.unlocks.manavgat, 0.5 * D, 2 * D));
  it("Antalya Merkez ~week 1", () => between(r.unlocks.antalya, 4 * D, 9 * D));
  it("İzmir ~week 2", () => between(r.unlocks.izmir, 10 * D, 18 * D));
  it("İstanbul ~week 4", () => between(r.unlocks.istanbul, 20 * D, 33 * D));
  it("economy stays finite and stable", () => {
    for (const id of unlockedDistricts(r.state, ALL)) {
      const ds = r.state.districts[id];
      expect(Number.isFinite(ds.money)).toBe(true);
      expect(ds.un).toBeLessThan(1e7);
    }
  });
  it("Devir intervals lengthen over time (long tail)", () => {
    const k2 = r.devirs.filter((d) => d.district === "korkuteli");
    const first = k2[2].t - k2[1].t;
    const last = k2.at(-1)!.t - k2.at(-2)!.t;
    expect(last).toBeGreaterThan(first * 3);
  });
});
