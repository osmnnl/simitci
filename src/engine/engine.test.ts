import { describe, expect, it } from "vitest";
import { bulkCost, levelFromXp, maxAffordable, unFromLifetime, xpForLevel } from "./math";
import { createInitialState } from "./state";
import * as A from "./actions";
import { baseIncome, devirGain, offlineCapSeconds, tierAllowed, tierMult } from "./derive";
import { applyOffline, tick } from "./tick";
import { normalize } from "../save/save";

const ALL = { devir: true, skills: true, districts: true, orders: true, crowd: true };
const OFF = { devir: false, skills: false, districts: false, orders: false, crowd: false };
const rich = (money = 1e30) => {
  const s = createInitialState(0);
  s.districts.korkuteli.money = money;
  return s;
};

describe("math", () => {
  it("bulk cost equals the sum of single purchases", () => {
    let sum = 0;
    for (let k = 3; k < 13; k++) sum += 4 * 1.07 ** k;
    expect(bulkCost(4, 1.07, 3, 10)).toBeCloseTo(sum, 6);
  });
  it("maxAffordable is consistent with bulkCost", () => {
    const n = maxAffordable(4, 1.07, 5, 1000);
    expect(bulkCost(4, 1.07, 5, n)).toBeLessThanOrEqual(1000);
    expect(bulkCost(4, 1.07, 5, n + 1)).toBeGreaterThan(1000);
  });
  it("uses the Melvor XP curve", () => {
    expect(xpForLevel(2)).toBe(83);
    expect(levelFromXp(0)).toBe(1);
    expect(levelFromXp(83)).toBe(2);
    expect(levelFromXp(13_034_431)).toBe(99);
    expect(levelFromXp(1e12)).toBe(99);
  });
  it("ün grows with the cube root of lifetime earnings", () => {
    expect(unFromLifetime(3e9)).toBe(20);
    expect(unFromLifetime(3e9 * 8)).toBe(40);
    expect(unFromLifetime(0)).toBe(0);
  });
});

describe("actions", () => {
  it("click earns money in the active district", () => {
    const s = A.click(createInitialState(0), OFF);
    expect(s.districts.korkuteli.money).toBe(1);
  });
  it("buyTier supports 1, 10 and max", () => {
    let s = A.buyTier(rich(1000), 0, 10, OFF);
    expect(s.districts.korkuteli.owned[0]).toBe(10);
    s = A.buyTier(s, 0, "max", OFF);
    expect(s.districts.korkuteli.money).toBeLessThan(4 * 1.07 ** s.districts.korkuteli.owned[0]);
  });
  it("refuses unaffordable purchases", () => {
    const s = createInitialState(0);
    expect(A.buyTier(s, 0, 1, OFF)).toBe(s);
    expect(A.buyUpgrade(s, OFF)).toBe(s);
  });
  it("milestones double a tier at 25 units", () => {
    let s = A.buyTier(rich(), 0, 25, OFF);
    expect(tierMult(s.districts.korkuteli, 0)).toBe(2);
    s = A.buyTier(s, 0, 25, OFF);
    expect(tierMult(s.districts.korkuteli, 0)).toBe(4);
  });
  it("upgrades are sequential and ×3 a tier", () => {
    let s = A.buyTier(rich(), 0, 1, OFF);
    s = A.buyUpgrade(s, OFF);
    expect(s.districts.korkuteli.upgrades).toBe(1);
    expect(tierMult(s.districts.korkuteli, 0)).toBe(3);
  });
  it("gates late tiers behind Fırıncılık when skills are on", () => {
    const s = rich();
    expect(tierAllowed(s, 6, ALL)).toBe(false);
    expect(tierAllowed(s, 6, OFF)).toBe(true);
  });
  it("devir converts lifetime earnings into ün and keeps one Çırak", () => {
    let s = rich(0);
    s.districts.korkuteli.runEarned = 3e9;
    expect(devirGain(s, "korkuteli")).toBe(20);
    s = A.devir(s, ALL);
    const k = s.districts.korkuteli;
    expect(k.un).toBe(20);
    expect(k.owned[0]).toBe(1);
    expect(k.money).toBe(0);
    expect(k.lifetimeEarned).toBe(3e9);
  });
  it("devir is a no-op when the feature is off", () => {
    const s = rich(0);
    s.districts.korkuteli.runEarned = 3e9;
    expect(A.devir(s, OFF)).toBe(s);
  });
  it("districts unlock from Korkuteli ün and switch active", () => {
    let s = createInitialState(0);
    expect(A.unlockDistrict(s, "manavgat", ALL)).toBe(s);
    s.districts.korkuteli.un = 500;
    s = A.unlockDistrict(s, "manavgat", ALL);
    expect(s.districts.manavgat.unlocked).toBe(true);
    expect(s.active).toBe("manavgat");
  });
  it("orders pay out after their duration", () => {
    let s = A.buyTier(rich(1000), 0, 10, ALL);
    s.districts.korkuteli.money = 0;
    s = A.startOrder(s, 0, "okul", 0, ALL);
    expect(s.orders[0].reward).toBeGreaterThan(0);
    expect(A.claimOrder(s, 0, 60_000, ALL)).toBe(s);
    const done = A.claimOrder(s, 0, 15 * 60_000, ALL);
    expect(done.districts.korkuteli.money).toBeCloseTo(s.orders[0].reward);
    expect(done.skillsXp.tedarik).toBe(400);
  });
});

describe("time", () => {
  it("tick is frame-rate independent", () => {
    const s0 = A.buyTier(rich(1e6), 3, 5, OFF);
    let a = s0;
    for (let i = 0; i < 100; i++) a = tick(a, 0.1, 0, OFF);
    const b = tick(s0, 10, 0, OFF);
    expect(a.districts.korkuteli.money).toBeCloseTo(b.districts.korkuteli.money, 3);
  });
  it("offline pays 50% and is capped at 4 hours", () => {
    const s = A.buyTier(rich(1e6), 0, 10, OFF);
    const inc = baseIncome(s, "korkuteli", OFF);
    const { state, report } = applyOffline(s, 10 * 3600 * 1000, OFF);
    expect(report.cappedSeconds).toBe(offlineCapSeconds(s, OFF));
    expect(state.districts.korkuteli.money - s.districts.korkuteli.money).toBeCloseTo(inc * 0.5 * 4 * 3600, 3);
  });
  it("crowd decays over time", () => {
    let s = createInitialState(0);
    for (let i = 0; i < 10; i++) s = A.click(s, ALL);
    expect(s.crowd).toBeCloseTo(0.5);
    s = tick(s, 30, 0, ALL);
    expect(s.crowd).toBe(0);
  });
});

describe("save", () => {
  it("round-trips and fills missing fields", () => {
    const s = A.buyTier(rich(1e6), 0, 3, OFF);
    const back = normalize(JSON.parse(JSON.stringify(s)));
    expect(back.districts.korkuteli.owned[0]).toBe(3);
    const partial = normalize({ version: 2, districts: { korkuteli: { money: 5 } } });
    expect(partial.districts.korkuteli.money).toBe(5);
    expect(partial.districts.izmir.unlocked).toBe(false);
  });
  it("ignores non-v2 data (MVP saves are not migrated)", () => {
    expect(normalize({ version: 1, money: 999 }).districts.korkuteli.money).toBe(0);
  });
});
