import { BALANCE } from "../content/balance";
import { DISTRICTS_BY_ID, type DistrictId } from "../content/districts";
import { FEATURES, type FeatureFlags } from "../content/features";
import {
  baseIncome, highestTier, offlineCapSeconds, offlineEfficiency, onlineIncome, unlockedDistricts,
} from "./derive";
import { clone, type GameState } from "./state";

function gainXp(s: GameState, seconds: number, eff: number, f: FeatureFlags) {
  if (!f.skills) return;
  const rate = highestTier(s) + 1;
  s.skillsXp.firincilik += BALANCE.firinXpPerTier * rate * seconds * eff;
  s.skillsXp.satis += BALANCE.satisXpPerTier * rate * seconds * eff;
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
  s.stats.playTimeSec += dt;
  s.lastSeen = now;
  return s;
}

export interface OfflineReport {
  elapsedSeconds: number;
  cappedSeconds: number;
  earnings: Partial<Record<DistrictId, number>>;
}

/** Closed-form catch-up for time away; production capped, skills uncapped (Melvor-like). */
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
  gainXp(s, elapsed, BALANCE.offlineXpEfficiency, f);
  s.crowd = 0;
  s.lastSeen = now;
  return { state: s, report: { elapsedSeconds: elapsed, cappedSeconds: capped, earnings } };
}
