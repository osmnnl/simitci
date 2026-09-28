import { BALANCE } from "../content/balance";
import { DISTRICTS_BY_ID, type DistrictId } from "../content/districts";
import { FEATURES, type FeatureFlags } from "../content/features";
import { SKILLS } from "../content/skills";
import { TIERS } from "../content/tiers";
import {
  baseIncome, highestTier, masteryLevel, offlineCapSeconds, offlineEfficiency, onlineIncome, skillLevel,
  totalOwned, unlockedDistricts,
} from "./derive";
import { clone, type GameState } from "./state";

function gainXp(s: GameState, seconds: number, eff: number, f: FeatureFlags) {
  if (f.skills) {
    const rate = highestTier(s) + 1;
    s.skillsXp.firincilik += BALANCE.firinXpPerTier * rate * seconds * eff;
    s.skillsXp.satis += BALANCE.satisXpPerTier * rate * seconds * eff;
  }
  if (f.mastery) {
    for (let t = 0; t < TIERS.length; t++) {
      const owned = totalOwned(s, t, f);
      if (owned > 0) s.masteryXp[t] += BALANCE.masteryXpRate * Math.sqrt(owned) * seconds * eff;
    }
  }
}

/** Foreground time. Delta-time based: many small ticks == one big tick. */
export function tick(state: GameState, dt: number, now: number, f: FeatureFlags = FEATURES): GameState {
  if (dt <= 0) return state;
  const s = clone(state);
  for (const id of unlockedDistricts(state, f)) {
    const amount = onlineIncome(state, id, f) * dt;
    const ds = s.districts[id];
    ds.money += amount;
    ds.runEarned += amount;
    s.stats.totalEarned += amount;
  }
  gainXp(s, dt, 1, f);
  if (f.crowd) s.crowd = Math.max(0, s.crowd - BALANCE.crowdDecayPerSecond * dt);
  if (s.buffs.length) s.buffs = s.buffs.filter((b) => b.until > now);
  if (s.event && s.event.expiresAt <= now) s.event = null;
  s.stats.playTimeSec += dt;
  s.lastSeen = now;
  return s;
}

export interface LevelUp {
  name: string;
  from: number;
  to: number;
}

export interface OfflineReport {
  elapsedSeconds: number;
  cappedSeconds: number;
  earnings: Partial<Record<DistrictId, number>>;
  levelUps: LevelUp[];
}

function levelSnapshot(s: GameState, f: FeatureFlags): { name: string; level: number }[] {
  return [
    ...SKILLS.map((k) => ({ name: k.name, level: skillLevel(s, k.id, f) })),
    ...TIERS.map((t) => ({ name: `${t.name} ustalığı`, level: masteryLevel(s, t.id, f) })),
  ];
}

/** Closed-form catch-up for time away; production capped (4–12 h), XP capped at 24 h (Melvor-like). */
export function applyOffline(state: GameState, now: number, f: FeatureFlags = FEATURES): { state: GameState; report: OfflineReport } {
  const elapsed = Math.max(0, (now - state.lastSeen) / 1000);
  const capped = Math.min(elapsed, offlineCapSeconds(state, f));
  const eff = offlineEfficiency(state, f);
  const s = clone(state);
  const earnings: Partial<Record<DistrictId, number>> = {};
  for (const id of unlockedDistricts(state, f)) {
    const dm = f.districts ? DISTRICTS_BY_ID[id].offlineMult : 1;
    const amount = baseIncome(state, id, f) * eff * dm * capped;
    const ds = s.districts[id];
    ds.money += amount;
    ds.runEarned += amount;
    s.stats.totalEarned += amount;
    earnings[id] = amount;
  }
  const before = levelSnapshot(state, f);
  gainXp(s, Math.min(elapsed, BALANCE.offlineXpCapHours * 3600), BALANCE.offlineXpEfficiency, f);
  const after = levelSnapshot(s, f);
  const levelUps = after
    .map((a, i) => ({ name: a.name, from: before[i].level, to: a.level }))
    .filter((l) => l.to > l.from);
  s.crowd = 0;
  s.buffs = [];
  s.event = null;
  s.lastSeen = now;
  return { state: s, report: { elapsedSeconds: elapsed, cappedSeconds: capped, earnings, levelUps } };
}
