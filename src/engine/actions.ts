import { BALANCE } from "../content/balance";
import { DISTRICTS_BY_ID, type DistrictId } from "../content/districts";
import { FEATURES, type FeatureFlags } from "../content/features";
import { ORDER_TEMPLATES } from "../content/orders";
import {
  baseIncome, clickValue, devirGain, districtUnlockable, tierAllowed, tierCost,
  tierMaxAffordable, upgradeCost,
} from "./derive";
import { clone, emptyOrder, newDistrict, type GameState } from "./state";

function earn(s: GameState, id: DistrictId, amount: number) {
  const ds = s.districts[id];
  ds.money += amount;
  ds.runEarned += amount;
  s.stats.totalEarned += amount;
}

export function click(state: GameState, f: FeatureFlags = FEATURES): GameState {
  const s = clone(state);
  earn(s, s.active, clickValue(state, f));
  s.stats.clicks += 1;
  if (f.skills) s.skillsXp.hamur += BALANCE.hamurXpPerClick;
  if (f.crowd) s.crowd = Math.min(BALANCE.crowdMax, s.crowd + BALANCE.crowdPerClick);
  return s;
}

export type BuyQty = number | "max";

export function buyTier(state: GameState, tier: number, qty: BuyQty = 1, f: FeatureFlags = FEATURES): GameState {
  const id = state.active;
  if (!tierAllowed(state, tier, f)) return state;
  const n = qty === "max" ? tierMaxAffordable(state, id, tier, f) : qty;
  if (n <= 0) return state;
  const cost = tierCost(state, id, tier, n, f);
  if (cost > state.districts[id].money) return state;
  const s = clone(state);
  s.districts[id].money -= cost;
  s.districts[id].owned[tier] += n;
  return s;
}

export function buyUpgrade(state: GameState, f: FeatureFlags = FEATURES): GameState {
  const id = state.active;
  const cost = upgradeCost(state, id, f);
  if (!isFinite(cost) || cost > state.districts[id].money) return state;
  const s = clone(state);
  s.districts[id].money -= cost;
  s.districts[id].upgrades += 1;
  return s;
}

export function devir(state: GameState, f: FeatureFlags = FEATURES): GameState {
  if (!f.devir) return state;
  const id = state.active;
  const gain = devirGain(state, id);
  if (gain < 1) return state;
  const s = clone(state);
  const old = s.districts[id];
  const fresh = newDistrict(true);
  fresh.un = old.un + gain;
  fresh.lifetimeEarned = old.lifetimeEarned + old.runEarned;
  fresh.devirs = old.devirs + 1;
  s.stats.devirsTotal += 1;
  // the new owner starts with one apprentice, so an idle district restarts by itself
  fresh.owned[0] = 1;
  s.districts[id] = fresh;
  return s;
}

export function selectDistrict(state: GameState, id: DistrictId): GameState {
  if (!state.districts[id].unlocked || state.active === id) return state;
  const s = clone(state);
  s.active = id;
  s.crowd = 0;
  return s;
}

export function unlockDistrict(state: GameState, id: DistrictId, f: FeatureFlags = FEATURES): GameState {
  if (!districtUnlockable(state, id, f)) return state;
  const s = clone(state);
  s.districts[id].unlocked = true;
  s.active = id;
  s.crowd = 0;
  return s;
}

export function startOrder(state: GameState, slot: number, templateId: string, now: number, f: FeatureFlags = FEATURES): GameState {
  if (!f.orders) return state;
  const tpl = ORDER_TEMPLATES.find((t) => t.id === templateId);
  const o = state.orders[slot];
  if (!tpl || !o || o.templateId) return state;
  const s = clone(state);
  const def = DISTRICTS_BY_ID[s.active];
  const orderMult = f.districts ? def.orderMult : 1;
  s.orders[slot] = {
    templateId,
    district: s.active,
    startedAt: now,
    endsAt: now + tpl.minutes * 60_000,
    reward: baseIncome(state, s.active, f) * tpl.minutes * 60 * BALANCE.orderRewardFactor * orderMult,
  };
  return s;
}

export function claimOrder(state: GameState, slot: number, now: number, f: FeatureFlags = FEATURES): GameState {
  const o = state.orders[slot];
  if (!o?.templateId || now < o.endsAt) return state;
  const tpl = ORDER_TEMPLATES.find((t) => t.id === o.templateId);
  const s = clone(state);
  earn(s, o.district, o.reward);
  if (f.skills && tpl) s.skillsXp.tedarik += tpl.xp;
  s.orders[slot] = emptyOrder();
  s.stats.ordersClaimed += 1;
  return s;
}
