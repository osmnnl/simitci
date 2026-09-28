import { BALANCE } from "../content/balance";
import { DISTRICTS, DISTRICTS_BY_ID, type DistrictId } from "../content/districts";
import { FEATURES, type FeatureFlags } from "../content/features";
import type { SkillId } from "../content/skills";
import { TIERS } from "../content/tiers";
import { UPGRADES } from "../content/upgrades";
import { bulkCost, levelFromXp, maxAffordable, unFromLifetime } from "./math";
import type { DistrictState, GameState } from "./state";

export function skillLevel(s: GameState, id: SkillId, f: FeatureFlags = FEATURES): number {
  return f.skills ? levelFromXp(s.skillsXp[id]) : 1;
}

export function unlockedDistricts(s: GameState, f: FeatureFlags = FEATURES): DistrictId[] {
  return DISTRICTS.filter((d) => s.districts[d.id].unlocked && (f.districts || d.id === "korkuteli")).map((d) => d.id);
}

export function markaMult(s: GameState, f: FeatureFlags = FEATURES): number {
  if (!f.districts) return 1;
  return 1 + BALANCE.markaPerDistrict * (unlockedDistricts(s, f).length - 1);
}

export function tierMult(ds: DistrictState, tier: number, owned = ds.owned[tier]): number {
  let m = 1;
  for (let j = 0; j < ds.upgrades; j++) if (UPGRADES[j].tier === tier) m *= UPGRADES[j].mult;
  for (const ms of BALANCE.milestones) if (owned >= ms) m *= BALANCE.milestoneMult;
  return m;
}

/** Ürün ustalığı level of one producer (1–99). */
export function masteryLevel(s: GameState, tier: number, f: FeatureFlags = FEATURES): number {
  return f.mastery ? levelFromXp(s.masteryXp[tier] ?? 0) : 1;
}

export function masteryMult(s: GameState, tier: number, f: FeatureFlags = FEATURES): number {
  const L = masteryLevel(s, tier, f);
  const grand = L >= BALANCE.skillMaxLevel ? BALANCE.masteryGrandSealMult : 1;
  return (1 + BALANCE.masteryBonusPerLevel * (L - 1)) * grand;
}

/** Seals reached (0–4) for UI badges. */
export function masterySeals(s: GameState, tier: number, f: FeatureFlags = FEATURES): number {
  const L = masteryLevel(s, tier, f);
  return BALANCE.masterySeals.filter((x) => L >= x).length;
}

export function achievementMult(s: GameState, f: FeatureFlags = FEATURES): number {
  return f.achievements ? 1 + BALANCE.achievementBonus * s.achievements.length : 1;
}

/** Active buff multiplier of a kind; `now` defaults to the last tick time. */
export function buffMult(s: GameState, kind: "prod" | "click", f: FeatureFlags = FEATURES, now = s.lastSeen): number {
  if (!f.events) return 1;
  return s.buffs.reduce((m, b) => (b.kind === kind && b.until > now ? m * b.mult : m), 1);
}

/** Everything that multiplies a district's whole production. */
export function globalMult(s: GameState, id: DistrictId, f: FeatureFlags = FEATURES): number {
  const ds = s.districts[id];
  const def = DISTRICTS_BY_ID[id];
  const devir = f.devir ? 1 + BALANCE.unBonus * ds.un : 1;
  const firin = 1 + BALANCE.skillBonusPerLevel * (skillLevel(s, "firincilik", f) - 1);
  const satis = 1 + BALANCE.skillBonusPerLevel * (skillLevel(s, "satis", f) - 1);
  return devir * firin * satis * markaMult(s, f) * def.priceMult * achievementMult(s, f);
}

/** Idle production (₺/sn), no crowd. */
export function baseIncome(s: GameState, id: DistrictId, f: FeatureFlags = FEATURES): number {
  const ds = s.districts[id];
  let sum = 0;
  for (const t of TIERS) {
    const own = ds.owned[t.id];
    if (own > 0) sum += own * t.baseRate * tierMult(ds, t.id) * masteryMult(s, t.id, f);
  }
  return sum * globalMult(s, id, f);
}

export function crowdMult(s: GameState, id: DistrictId, f: FeatureFlags = FEATURES): number {
  return f.crowd && id === s.active ? 1 + s.crowd : 1;
}

/** Live production while the player is present. */
export function onlineIncome(s: GameState, id: DistrictId, f: FeatureFlags = FEATURES): number {
  return baseIncome(s, id, f) * crowdMult(s, id, f) * buffMult(s, "prod", f);
}

export function clickValue(s: GameState, f: FeatureFlags = FEATURES): number {
  const def = DISTRICTS_BY_ID[s.active];
  const hamur = 1 + BALANCE.hamurClickBonusPerLevel * (skillLevel(s, "hamur", f) - 1);
  const clickMult = f.districts ? def.clickMult : 1;
  return (BALANCE.clickBase + BALANCE.clickIncomePct * onlineIncome(s, s.active, f)) * hamur * clickMult * buffMult(s, "click", f);
}

export function tierCostBase(id: DistrictId, tier: number, f: FeatureFlags = FEATURES): number {
  const cm = f.districts ? DISTRICTS_BY_ID[id].costMult : 1;
  return TIERS[tier].baseCost * cm;
}

export function tierCost(s: GameState, id: DistrictId, tier: number, n = 1, f: FeatureFlags = FEATURES): number {
  return bulkCost(tierCostBase(id, tier, f), TIERS[tier].growth, s.districts[id].owned[tier], n);
}

export function tierMaxAffordable(s: GameState, id: DistrictId, tier: number, f: FeatureFlags = FEATURES): number {
  const ds = s.districts[id];
  return maxAffordable(tierCostBase(id, tier, f), TIERS[tier].growth, ds.owned[tier], ds.money);
}

export function tierAllowed(s: GameState, tier: number, f: FeatureFlags = FEATURES): boolean {
  return !f.skills || skillLevel(s, "firincilik", f) >= TIERS[tier].gateLevel;
}

/** Tier visible if owned, allowed-and-previous-owned, or it's the first. */
export function tierVisible(s: GameState, id: DistrictId, tier: number): boolean {
  const ds = s.districts[id];
  return tier === 0 || ds.owned[tier] > 0 || ds.owned[tier - 1] > 0;
}

/** Income gained by buying one more unit (for the headless sim / hints). */
export function tierMarginal(s: GameState, id: DistrictId, tier: number, f: FeatureFlags = FEATURES): number {
  const ds = s.districts[id];
  const t = TIERS[tier];
  const own = ds.owned[tier];
  const before = own * t.baseRate * tierMult(ds, tier, own);
  const after = (own + 1) * t.baseRate * tierMult(ds, tier, own + 1);
  return (after - before) * masteryMult(s, tier, f) * globalMult(s, id, f);
}

export function nextUpgrade(ds: DistrictState) {
  return UPGRADES[ds.upgrades] ?? null;
}

export function upgradeCost(s: GameState, id: DistrictId, f: FeatureFlags = FEATURES): number {
  const u = nextUpgrade(s.districts[id]);
  if (!u) return Infinity;
  const cm = f.districts ? DISTRICTS_BY_ID[id].costMult : 1;
  return u.cost * cm;
}

export function upgradeMarginal(s: GameState, id: DistrictId, f: FeatureFlags = FEATURES): number {
  const ds = s.districts[id];
  const u = nextUpgrade(ds);
  if (!u) return 0;
  const t = TIERS[u.tier];
  return ds.owned[u.tier] * t.baseRate * tierMult(ds, u.tier) * (u.mult - 1) * masteryMult(s, u.tier, f) * globalMult(s, id, f);
}

export function devirGain(s: GameState, id: DistrictId): number {
  const ds = s.districts[id];
  return Math.max(0, unFromLifetime(ds.lifetimeEarned + ds.runEarned) - ds.un);
}

export function highestTier(s: GameState): number {
  let top = 0;
  for (const id of Object.keys(s.districts) as DistrictId[]) {
    const ds = s.districts[id];
    if (!ds.unlocked) continue;
    ds.owned.forEach((n, i) => {
      if (n > 0 && i > top) top = i;
    });
  }
  return top;
}

export function offlineEfficiency(s: GameState, f: FeatureFlags = FEATURES): number {
  const L = skillLevel(s, "tedarik", f);
  return BALANCE.offlineEfficiency + ((BALANCE.offlineEfficiencyMax - BALANCE.offlineEfficiency) * (L - 1)) / (BALANCE.skillMaxLevel - 1);
}

export function offlineCapSeconds(s: GameState, f: FeatureFlags = FEATURES): number {
  const L = skillLevel(s, "tedarik", f);
  const h = BALANCE.offlineCapHours + ((BALANCE.offlineCapHoursMax - BALANCE.offlineCapHours) * (L - 1)) / (BALANCE.skillMaxLevel - 1);
  return h * 3600;
}

export function districtUnlockable(s: GameState, id: DistrictId, f: FeatureFlags = FEATURES): boolean {
  if (!f.districts || s.districts[id].unlocked) return false;
  return s.districts.korkuteli.un >= DISTRICTS_BY_ID[id].unlockUn;
}

/** Total owned of one producer across all unlocked districts (drives mastery XP). */
export function totalOwned(s: GameState, tier: number, f: FeatureFlags = FEATURES): number {
  return unlockedDistricts(s, f).reduce((a, id) => a + s.districts[id].owned[tier], 0);
}
