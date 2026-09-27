import type { GameState } from "./state";
import { offlineProduction, resolveLevelUps } from "./economy";
import { currentSimitPrice, simitPerSecond } from "./selectors";

export const OFFLINE_MODAL_THRESHOLD_SECONDS = 60;

export interface OfflineResult {
  state: GameState;
  elapsedSeconds: number;
  earnings: number;
  shouldShowModal: boolean;
}

/**
 * Called once on load. Computes what happened while the tab was closed
 * or hidden, using the same rate the player had when they left — no
 * per-tick replay, per FR-11.
 */
export function applyOffline(state: GameState, nowMs: number): OfflineResult {
  const elapsedSeconds = Math.max(0, (nowMs - state.lastSeen) / 1000);
  const rate = simitPerSecond(state);

  // Simit equivalent baked while away, then converted to money at the
  // player's current price — so a susamlı tarif upgrade still counts
  // for offline time, exactly as it would for live auto-sell.
  const baked = offlineProduction(rate, elapsedSeconds);
  const earnings = baked * currentSimitPrice(state);

  const { level, xp } = resolveLevelUps(state.level, state.xp + baked);

  const nextState: GameState = {
    ...state,
    money: state.money + earnings,
    xp,
    level,
    lastSeen: nowMs,
    stats: {
      ...state.stats,
      totalBaked: state.stats.totalBaked + baked,
      totalEarned: state.stats.totalEarned + earnings,
    },
  };

  return {
    state: nextState,
    elapsedSeconds,
    earnings,
    shouldShowModal: elapsedSeconds >= OFFLINE_MODAL_THRESHOLD_SECONDS,
  };
}
