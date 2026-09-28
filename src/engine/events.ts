import { BALANCE } from "../content/balance";
import { EVENTS, EVENTS_BY_KIND, type EventKind } from "../content/events";
import { FEATURES, type FeatureFlags } from "../content/features";
import { onlineIncome } from "./derive";
import { clone, type GameState } from "./state";

/** rand() in [0,1). Injected so tests are deterministic. */
export type Rand = () => number;

export function nextGapMs(rand: Rand): number {
  const { eventMinGapSec: lo, eventMaxGapSec: hi } = BALANCE;
  return (lo + (hi - lo) * rand()) * 1000;
}

export function pickEvent(rand: Rand): EventKind {
  const total = EVENTS.reduce((a, e) => a + e.weight, 0);
  let r = rand() * total;
  for (const e of EVENTS) {
    r -= e.weight;
    if (r < 0) return e.kind;
  }
  return EVENTS[0].kind;
}

/** Called every foreground tick. Spawns an event when its time comes. */
export function eventTick(state: GameState, now: number, rand: Rand, f: FeatureFlags = FEATURES): GameState {
  if (!f.events || state.event || now < state.nextEventAt) return state;
  const s = clone(state);
  s.event = { kind: pickEvent(rand), expiresAt: now + BALANCE.eventClaimWindowSec * 1000 };
  s.nextEventAt = now + nextGapMs(rand);
  return s;
}

export function claimEvent(state: GameState, now: number, f: FeatureFlags = FEATURES): GameState {
  const ev = state.event;
  if (!f.events || !ev || now >= ev.expiresAt) return state;
  const def = EVENTS_BY_KIND[ev.kind];
  const s = clone(state);
  s.event = null;
  s.stats.eventsCaught += 1;
  const goldenPayout = () => {
    const amount = onlineIncome(state, state.active, f) * EVENTS_BY_KIND.altin.mult;
    const ds = s.districts[s.active];
    ds.money += amount;
    ds.runEarned += amount;
    s.stats.totalEarned += amount;
  };
  switch (ev.kind) {
    case "altin":
      goldenPayout();
      break;
    case "bayram":
      s.buffs.push({ kind: "prod", mult: def.mult, until: now + def.durationSec * 1000 });
      break;
    case "usta":
      s.buffs.push({ kind: "click", mult: def.mult, until: now + def.durationSec * 1000 });
      break;
    case "siparis": {
      const i = s.orders.findIndex((o) => o.templateId && o.endsAt > now);
      if (i >= 0) s.orders[i].endsAt = now;
      else goldenPayout(); // nothing pending: fall back so the event is never wasted
      break;
    }
  }
  return s;
}
