/**
 * Every formula in the PRD lives here, and only here. Nothing in this file
 * touches React, Zustand, or the DOM — it is plain, testable math.
 */

export const BASE_SIMIT_PRICE = 1; // ₺ per simit, before priceMultiplier upgrades
export const BASE_CLICK_POWER = 1; // simit per click, before clickMultiplier upgrades
export const COST_GROWTH = 1.15;
export const XP_GROWTH = 1.25;
export const BASE_XP_PER_LEVEL = 50;
export const OFFLINE_CAP_SECONDS = 8 * 60 * 60; // 8 hour cap
export const OFFLINE_EFFICIENCY = 0.5; // 50% of the live rate while away

/** Cost to buy the (n+1)-th unit of a producer, given n currently owned. */
export function producerCost(baseCost: number, owned: number): number {
  return baseCost * Math.pow(COST_GROWTH, owned);
}

/** Total XP needed to go from `level` to `level + 1`. */
export function xpForNextLevel(level: number): number {
  return BASE_XP_PER_LEVEL * Math.pow(XP_GROWTH, level - 1);
}

/** Simit sale price after any price-multiplier upgrades are applied. */
export function simitPrice(priceMultiplier: number): number {
  return BASE_SIMIT_PRICE * priceMultiplier;
}

/** Simit produced by one click after any click-multiplier upgrades. */
export function clickYield(clickMultiplier: number): number {
  return BASE_CLICK_POWER * clickMultiplier;
}

/**
 * Analytic offline production: the simit-equivalent baked while away, as
 * one closed-form calculation instead of a per-tick simulation, capped at
 * OFFLINE_CAP_SECONDS and discounted by OFFLINE_EFFICIENCY, per the PRD.
 * Money earned from this is baked amount × the player's current simit
 * price — see engine/offline.ts.
 */
export function offlineProduction(
  simitPerSecond: number,
  elapsedSeconds: number,
): number {
  const clamped = Math.max(0, Math.min(elapsedSeconds, OFFLINE_CAP_SECONDS));
  return simitPerSecond * clamped * OFFLINE_EFFICIENCY;
}

/** Applies a level-up as many times as the accumulated XP allows. */
export function resolveLevelUps(
  level: number,
  xp: number,
): { level: number; xp: number; levelsGained: number } {
  let curLevel = level;
  let curXp = xp;
  let levelsGained = 0;
  let needed = xpForNextLevel(curLevel);
  while (curXp >= needed) {
    curXp -= needed;
    curLevel += 1;
    levelsGained += 1;
    needed = xpForNextLevel(curLevel);
  }
  return { level: curLevel, xp: curXp, levelsGained };
}
