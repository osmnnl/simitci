/**
 * Headless player model used by the balance tests (CI). Mirrors the Python
 * reference sim from the design plan, but drives the real engine.
 */
import { BALANCE } from "../content/balance";
import { DISTRICTS, type DistrictId } from "../content/districts";
import type { FeatureFlags } from "../content/features";
import { ORDER_TEMPLATES } from "../content/orders";
import { buyTier, buyUpgrade, claimOrder, devir, selectDistrict, startOrder, unlockDistrict } from "../engine/actions";
import {
  clickValue, devirGain, districtUnlockable, tierAllowed, tierCost, tierMarginal, unlockedDistricts,
  upgradeCost, upgradeMarginal,
} from "../engine/derive";
import { createInitialState, type GameState } from "../engine/state";
import { applyOffline, tick } from "../engine/tick";

export interface Profile {
  checksPerDay: number;
  sessionSeconds: number;
  clicksPerSecond: number;
  hookHours: number;
}
export const NORMAL: Profile = { checksPerDay: 12, sessionSeconds: 120, clicksPerSecond: 4, hookHours: 2 };

export interface SimResult {
  state: GameState;
  firstTier: Partial<Record<DistrictId, Record<number, number>>>;
  devirs: { t: number; district: DistrictId; un: number }[];
  unlocks: Partial<Record<DistrictId, number>>;
}

function spendAll(state: GameState, t: number, f: FeatureFlags, r: SimResult): GameState {
  let s = state;
  const original = s.active;
  for (const id of unlockedDistricts(s, f)) {
    s = selectDistrict(s, id);
    for (let guard = 0; guard < 5000; guard++) {
      const money = s.districts[id].money;
      let best: { kind: "t" | "u"; tier: number; score: number } | null = null;
      for (let tier = 0; tier < 10; tier++) {
        if (!tierAllowed(s, tier, f)) continue;
        const c = tierCost(s, id, tier, 1, f);
        const d = tierMarginal(s, id, tier, f);
        if (c <= money && d > 0 && (!best || c / d < best.score)) best = { kind: "t", tier, score: c / d };
      }
      const uc = upgradeCost(s, id, f);
      const ud = upgradeMarginal(s, id, f);
      if (uc <= money && ud > 0 && (!best || uc / ud < best.score)) best = { kind: "u", tier: -1, score: uc / ud };
      if (!best) break;
      s = best.kind === "t" ? buyTier(s, best.tier, 1, f) : buyUpgrade(s, f);
    }
    const ft = (r.firstTier[id] ??= {});
    s.districts[id].owned.forEach((n, i) => {
      if (n > 0 && ft[i] === undefined) ft[i] = t;
    });
    if (f.devir) {
      const ds = s.districts[id];
      const gain = devirGain(s, id);
      if (gain >= Math.max(10, ds.un)) {
        s = devir(s, f);
        r.devirs.push({ t, district: id, un: s.districts[id].un });
      }
    }
  }
  for (const d of DISTRICTS) {
    if (districtUnlockable(s, d.id, f)) {
      s = unlockDistrict(s, d.id, f);
      r.unlocks[d.id] = t;
    }
  }
  // an active player plays the newest district they opened
  const newest = unlockedDistricts(s, f).at(-1) ?? original;
  return selectDistrict(s, newest);
}

function orders(state: GameState, nowMs: number, f: FeatureFlags): GameState {
  if (!f.orders) return state;
  let s = state;
  s.orders.forEach((_, i) => (s = claimOrder(s, i, nowMs, f)));
  s.orders.forEach((o, i) => {
    if (!o.templateId) s = startOrder(s, i, ORDER_TEMPLATES[1].id, nowMs, f);
  });
  return s;
}

function activeSeconds(state: GameState, seconds: number, step: number, t0: number, cps: number, f: FeatureFlags, r: SimResult) {
  let s = state;
  let t = t0;
  for (let e = 0; e < seconds; e += step) {
    // approximate cps clicks per second without calling click() thousands of times
    const cv = clickValue(s, f);
    s = tick(s, step, t * 1000 + step * 1000, f);
    const ds = s.districts[s.active];
    ds.money += cv * cps * step;
    ds.runEarned += cv * cps * step;
    if (f.skills) s.skillsXp.hamur += 3 * cps * step;
    if (f.crowd) s.crowd = BALANCE.crowdMax; // sustained clicking saturates the crowd meter
    t += step;
    s = spendAll(s, t, f, r);
  }
  if (f.crowd) s.crowd = 0;
  return { s, t };
}

export function simulate(days: number, f: FeatureFlags, p: Profile = NORMAL): SimResult {
  const r: SimResult = { state: createInitialState(0), firstTier: {}, devirs: [], unlocks: { korkuteli: 0 } };
  let s = r.state;
  let t = 0;
  ({ s, t } = activeSeconds(s, p.hookHours * 3600, 5, t, p.clicksPerSecond, f, r));
  const gap = (16 * 3600) / p.checksPerDay;
  while (t < days * 86400) {
    const tod = t % 86400;
    const next = tod < 8 * 3600 ? t - tod + 8 * 3600 : tod + gap >= 24 * 3600 ? t - tod + 86400 + 8 * 3600 : t + gap;
    s = applyOffline(s, next * 1000, f).state;
    t = next;
    s = orders(s, t * 1000, f);
    s = spendAll(s, t, f, r);
    ({ s, t } = activeSeconds(s, p.sessionSeconds, 10, t, p.clicksPerSecond, f, r));
  }
  r.state = s;
  return r;
}

export const fmtTime = (sec: number) =>
  sec < 3600 ? `${(sec / 60).toFixed(1)}dk` : sec < 172800 ? `${(sec / 3600).toFixed(1)}sa` : `${(sec / 86400).toFixed(1)}gün`;
