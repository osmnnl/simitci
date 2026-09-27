import { BALANCE } from "../content/balance";

/** Cost of the next `n` units given `owned` (geometric series). */
export function bulkCost(base: number, growth: number, owned: number, n: number): number {
  if (n <= 0) return 0;
  return (base * growth ** owned * (growth ** n - 1)) / (growth - 1);
}

/** How many units `money` buys (closed form, Pecorella). */
export function maxAffordable(base: number, growth: number, owned: number, money: number): number {
  if (money <= 0) return 0;
  const n = Math.floor(Math.log((money * (growth - 1)) / (base * growth ** owned) + 1) / Math.log(growth));
  return Math.max(0, n);
}

/** Melvor XP curve: cumulative XP needed to reach each level. */
const XP_TABLE: number[] = (() => {
  const t = [0, 0];
  let acc = 0;
  for (let L = 2; L <= BALANCE.skillMaxLevel; L++) {
    acc += Math.floor(0.25 * (L - 1 + 300 * 2 ** ((L - 1) / 7)));
    t.push(acc);
  }
  return t;
})();

export function xpForLevel(level: number): number {
  return XP_TABLE[Math.min(Math.max(level, 1), BALANCE.skillMaxLevel)];
}

export function levelFromXp(xp: number): number {
  let lo = 1;
  let hi = BALANCE.skillMaxLevel;
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2);
    if (XP_TABLE[mid] <= xp) lo = mid;
    else hi = mid - 1;
  }
  return lo;
}

/** Total ün earned for a given lifetime (cube root → stable economy). */
export function unFromLifetime(lifetime: number): number {
  if (lifetime <= 0) return 0;
  return Math.floor(BALANCE.unK * (lifetime / BALANCE.unL0) ** BALANCE.unExp);
}
