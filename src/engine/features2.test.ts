import { describe, expect, it } from "vitest";
import { createInitialState } from "./state";
import * as A from "./actions";
import { achievementMult, baseIncome, buffMult, clickValue, masteryLevel, masteryMult, masterySeals } from "./derive";
import { xpForLevel } from "./math";
import { applyOffline, tick } from "./tick";
import { claimEvent, eventTick, pickEvent } from "./events";
import { checkAchievements } from "./achievements";
import { normalize } from "../save/save";

const ALL = { devir: true, skills: true, districts: true, orders: true, crowd: true, mastery: true, events: true, achievements: true, mobileShell: false };
const OFF = { ...ALL, mastery: false, events: false, achievements: false, mobileShell: false };
const withCirak = (n = 100) => {
  const s = createInitialState(0);
  s.districts.korkuteli.money = 1e12;
  return A.buyTier(s, 0, n, ALL);
};
const seq = (...vals: number[]) => { let i = 0; return () => vals[i++ % vals.length]; };

describe("ürün ustalığı", () => {
  it("earns XP from owned units while playing", () => {
    const s = tick(withCirak(100), 100, 100_000, ALL);
    expect(s.masteryXp[0]).toBeGreaterThan(0);
    expect(s.masteryXp[1]).toBe(0); // nothing owned
  });
  it("level boosts only that producer, and 99 doubles it", () => {
    const s = withCirak(100);
    const base = baseIncome(s, "korkuteli", ALL);
    s.masteryXp[0] = xpForLevel(51);
    expect(masteryLevel(s, 0, ALL)).toBe(51);
    expect(masteryMult(s, 0, ALL)).toBeCloseTo(1.5);
    expect(baseIncome(s, "korkuteli", ALL)).toBeCloseTo(base * 1.5);
    s.masteryXp[0] = xpForLevel(99);
    expect(masteryMult(s, 0, ALL)).toBeCloseTo((1 + 0.01 * 98) * 2);
    expect(masterySeals(s, 0, ALL)).toBe(4);
  });
  it("survives Devir", () => {
    let s = withCirak(100);
    s.masteryXp[0] = 5000;
    s.districts.korkuteli.runEarned = 3e9;
    s = A.devir(s, ALL);
    expect(s.masteryXp[0]).toBe(5000);
  });
  it("keeps training offline and reports level-ups", () => {
    const s = withCirak(200);
    expect(s.districts.korkuteli.owned[0]).toBe(200);
    const { state, report } = applyOffline(s, 20 * 3600 * 1000, ALL);
    expect(state.masteryXp[0]).toBeGreaterThan(0);
    expect(report.levelUps.some((l) => l.name === "Çırak ustalığı")).toBe(true);
  });
  it("caps offline XP at 24 h so clock jumps cannot max skills", () => {
    const s = withCirak(200);
    const day = applyOffline(s, 24 * 3600 * 1000, ALL).state;
    const year = applyOffline(s, 365 * 24 * 3600 * 1000, ALL).state;
    expect(year.masteryXp[0]).toBeCloseTo(day.masteryXp[0]);
    expect(year.skillsXp.firincilik).toBeCloseTo(day.skillsXp.firincilik);
  });
  it("is inert when the flag is off", () => {
    const s = withCirak(100);
    s.masteryXp[0] = xpForLevel(99);
    expect(masteryMult(s, 0, OFF)).toBe(1);
  });
});

describe("rastgele olaylar", () => {
  it("spawns only when due and only one at a time", () => {
    const s = createInitialState(0);
    expect(eventTick(s, s.nextEventAt - 1, seq(0.5), ALL)).toBe(s);
    const s2 = eventTick(s, s.nextEventAt, seq(0.1, 0.5), ALL);
    expect(s2.event).not.toBeNull();
    expect(eventTick(s2, s2.nextEventAt + 1, seq(0.5), ALL)).toBe(s2);
  });
  it("picks by weight", () => {
    expect(pickEvent(() => 0)).toBe("altin");
    expect(pickEvent(() => 0.999)).toBe("siparis");
  });
  it("expires if not claimed in time", () => {
    const s = createInitialState(0);
    s.event = { kind: "bayram", expiresAt: 10_000 };
    expect(claimEvent(s, 10_000, ALL)).toBe(s);
    expect(tick(s, 1, 10_001, ALL).event).toBeNull();
  });
  it("altın simit pays 10 minutes of income", () => {
    const s = withCirak(100);
    s.districts.korkuteli.money = 0;
    s.event = { kind: "altin", expiresAt: 5_000 };
    const inc = baseIncome(s, "korkuteli", ALL);
    const out = claimEvent(s, 1_000, ALL);
    expect(out.districts.korkuteli.money).toBeCloseTo(inc * 600);
    expect(out.stats.eventsCaught).toBe(1);
  });
  it("bayram triples production, usta ×10 click, both expire", () => {
    let s = withCirak(100);
    s.lastSeen = 0;
    s.event = { kind: "bayram", expiresAt: 5_000 };
    s = claimEvent(s, 0, ALL);
    expect(buffMult(s, "prod", ALL, 1_000)).toBe(3);
    s.event = { kind: "usta", expiresAt: 5_000 };
    const cv = clickValue(s, ALL);
    s = claimEvent(s, 0, ALL);
    s.lastSeen = 1_000;
    expect(clickValue(s, ALL) / cv).toBeGreaterThan(9.9);
    s = tick(s, 1, 61_000, ALL);
    expect(s.buffs).toHaveLength(0);
  });
  it("unutulmuş sipariş finishes a pending order", () => {
    let s = withCirak(100);
    s = A.startOrder(s, 0, "ordu", 0, ALL);
    s.event = { kind: "siparis", expiresAt: 5_000 };
    s = claimEvent(s, 1_000, ALL);
    expect(s.orders[0].endsAt).toBe(1_000);
    expect(A.claimOrder(s, 0, 1_000, ALL).stats.ordersClaimed).toBe(1);
  });
});

describe("başarımlar", () => {
  it("unlock once, from real progress, and add +1% each", () => {
    let s = createInitialState(0);
    for (let i = 0; i < 100; i++) s = A.click(s, ALL);
    const r = checkAchievements(s, ALL);
    expect(r.unlocked).toContain("tik1");
    expect(checkAchievements(r.state, ALL).unlocked).toHaveLength(0);
    expect(achievementMult(r.state, ALL)).toBeCloseTo(1 + 0.01 * r.state.achievements.length);
  });
  it("tracks devir and order counters", () => {
    let s = withCirak(10);
    s.districts.korkuteli.runEarned = 3e9;
    s = A.devir(s, ALL);
    expect(s.stats.devirsTotal).toBe(1);
    expect(checkAchievements(s, ALL).unlocked).toContain("dev1");
  });
  it("does nothing when the flag is off", () => {
    let s = createInitialState(0);
    for (let i = 0; i < 100; i++) s = A.click(s, ALL);
    expect(checkAchievements(s, OFF).state).toBe(s);
  });
});

describe("save compatibility", () => {
  it("older v2 saves gain the new fields with safe defaults", () => {
    const old = { version: 2, districts: { korkuteli: { money: 5, devirs: 3 } }, stats: { clicks: 7 } };
    const s = normalize(old, 1000);
    expect(s.masteryXp).toHaveLength(10);
    expect(s.achievements).toEqual([]);
    expect(s.event).toBeNull();
    expect(s.stats.clicks).toBe(7);
    expect(s.stats.devirsTotal).toBe(3); // back-filled from district counters
  });
});
