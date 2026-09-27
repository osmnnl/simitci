import { describe, it, expect } from "vitest";
import {
  producerCost,
  xpForNextLevel,
  offlineProduction,
  resolveLevelUps,
  clickYield,
  simitPrice,
  OFFLINE_CAP_SECONDS,
} from "./economy";

describe("producerCost", () => {
  it("returns the base cost when nothing is owned", () => {
    expect(producerCost(100, 0)).toBe(100);
  });

  it("grows by 15% per unit owned", () => {
    expect(producerCost(100, 1)).toBeCloseTo(115, 5);
    expect(producerCost(100, 2)).toBeCloseTo(132.25, 5);
  });
});

describe("xpForNextLevel", () => {
  it("is the base amount at level 1", () => {
    expect(xpForNextLevel(1)).toBe(50);
  });

  it("grows by 25% per level", () => {
    expect(xpForNextLevel(2)).toBeCloseTo(62.5, 5);
    expect(xpForNextLevel(3)).toBeCloseTo(78.125, 5);
  });
});

describe("resolveLevelUps", () => {
  it("stays at the same level when xp is insufficient", () => {
    const r = resolveLevelUps(1, 10);
    expect(r).toEqual({ level: 1, xp: 10, levelsGained: 0 });
  });

  it("levels up exactly once when xp meets the threshold", () => {
    const r = resolveLevelUps(1, 50);
    expect(r.level).toBe(2);
    expect(r.xp).toBeCloseTo(0, 5);
    expect(r.levelsGained).toBe(1);
  });

  it("cascades through several levels in one call", () => {
    // 50 (L1->2) + 62.5 (L2->3) + a bit left over
    const r = resolveLevelUps(1, 50 + 62.5 + 10);
    expect(r.level).toBe(3);
    expect(r.xp).toBeCloseTo(10, 5);
    expect(r.levelsGained).toBe(2);
  });
});

describe("offlineProduction", () => {
  it("is zero for zero elapsed time", () => {
    expect(offlineProduction(10, 0)).toBe(0);
  });

  it("applies the 50% offline efficiency", () => {
    expect(offlineProduction(10, 100)).toBeCloseTo(10 * 100 * 0.5, 5);
  });

  it("caps at the offline ceiling", () => {
    const beyond = OFFLINE_CAP_SECONDS + 10_000;
    expect(offlineProduction(10, beyond)).toBeCloseTo(
      10 * OFFLINE_CAP_SECONDS * 0.5,
      5,
    );
  });

  it("never returns a negative amount for negative elapsed time", () => {
    expect(offlineProduction(10, -50)).toBe(0);
  });
});

describe("clickYield / simitPrice", () => {
  it("scale linearly with their multiplier", () => {
    expect(clickYield(1)).toBe(1);
    expect(clickYield(2)).toBe(2);
    expect(simitPrice(1)).toBe(1);
    expect(simitPrice(1.5)).toBe(1.5);
  });
});
