import { describe, it, expect } from "vitest";
import { createInitialState } from "./state";
import { tick } from "./tick";
import { applyOffline, OFFLINE_MODAL_THRESHOLD_SECONDS } from "./offline";
import { buyProducer, buyUpgrade } from "./actions";

function withCirak(owned: number) {
  let s = createInitialState(0);
  s = { ...s, money: 1_000_000 };
  for (let i = 0; i < owned; i++) s = buyProducer(s, "cirak");
  return s;
}

describe("tick", () => {
  it("does nothing for zero or negative dt", () => {
    const s = withCirak(1);
    expect(tick(s, 0)).toBe(s);
    expect(tick(s, -1)).toBe(s);
  });

  it("is frame-rate independent: many small ticks equal one big tick", () => {
    const start = withCirak(3);
    let stepped = start;
    for (let i = 0; i < 100; i++) stepped = tick(stepped, 0.1);
    const oneShot = tick(start, 10);
    expect(stepped.stock).toBeCloseTo(oneShot.stock, 6);
    expect(stepped.xp).toBeCloseTo(oneShot.xp, 6);
  });

  it("accumulates stock without auto-sell", () => {
    const s = withCirak(2); // 2 * 0.5 simit/sec = 1 simit/sec
    const next = tick(s, 10);
    expect(next.stock).toBeCloseTo(10, 5);
    expect(next.money).toBe(s.money); // no upgrade bought => no auto-sell
  });

  it("auto-sells every tick once Tezgah is owned", () => {
    let s = withCirak(2);
    s = { ...s, money: s.money + 200, level: 2 };
    s = buyUpgrade(s, "tezgah");
    const moneyBefore = s.money;
    const next = tick(s, 10);
    expect(next.stock).toBe(0);
    expect(next.money).toBeGreaterThan(moneyBefore);
  });
});

describe("applyOffline", () => {
  it("reports no modal below the threshold", () => {
    const s = withCirak(1);
    const r = applyOffline(s, s.lastSeen + 30_000);
    expect(r.shouldShowModal).toBe(false);
  });

  it("reports the modal at or above the threshold", () => {
    const s = withCirak(1);
    const r = applyOffline(
      s,
      s.lastSeen + OFFLINE_MODAL_THRESHOLD_SECONDS * 1000,
    );
    expect(r.shouldShowModal).toBe(true);
  });

  it("adds money based on the rate that was active when the player left", () => {
    const s = withCirak(4); // 4 * 0.5 = 2 simit/sec, price 1
    const r = applyOffline(s, s.lastSeen + 100_000); // 100s elapsed
    expect(r.earnings).toBeCloseTo(2 * 100 * 0.5, 5);
    expect(r.state.money).toBeCloseTo(s.money + r.earnings, 5);
  });

  it("awards XP for the simits actually baked, not for raw elapsed seconds", () => {
    const s = withCirak(4); // 2 simit/sec
    const elapsed = 100;
    const r = applyOffline(s, s.lastSeen + elapsed * 1000);
    // baked = rate * elapsed * 0.5 efficiency = 2 * 100 * 0.5 = 100 simit,
    // which must NOT equal the raw elapsed-seconds count coincidentally
    // matching here — use a rate where that distinction is unambiguous.
    const s2 = withCirak(1); // 0.5 simit/sec
    const r2 = applyOffline(s2, s2.lastSeen + elapsed * 1000);
    const expectedBaked = 0.5 * elapsed * 0.5;
    expect(r2.state.stats.totalBaked).toBeCloseTo(expectedBaked, 5);
    expect(r2.state.stats.totalBaked).not.toBeCloseTo(elapsed, 1);
    expect(r.state.stats.totalBaked).toBeGreaterThan(0);
  });

  it("values offline earnings at the current simit price, upgrades included", () => {
    let s = withCirak(4); // 2 simit/sec
    s = { ...s, level: 4, money: s.money + 500 };
    s = buyUpgrade(s, "susamliTarif"); // price ×1.5
    const r = applyOffline(s, s.lastSeen + 100_000);
    const expectedBaked = 2 * 100 * 0.5;
    expect(r.earnings).toBeCloseTo(expectedBaked * 1.5, 5);
  });

  it("advances lastSeen to the moment it was called", () => {
    const s = withCirak(1);
    const now = s.lastSeen + 5000;
    const r = applyOffline(s, now);
    expect(r.state.lastSeen).toBe(now);
  });
});
