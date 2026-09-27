import type { GameState } from "./state";
import { resolveLevelUps } from "./economy";
import { currentSimitPrice, hasAutoSell, simitPerSecond } from "./selectors";

/**
 * Advances the game by `dtSeconds` of real time. Pure and delta-time based,
 * so it produces the same result regardless of how often it's called —
 * FR-04's requirement that output not depend on frame rate or tab throttling.
 */
export function tick(state: GameState, dtSeconds: number): GameState {
  if (dtSeconds <= 0) return state;

  const produced = simitPerSecond(state) * dtSeconds;
  let stock = state.stock + produced;
  let money = state.money;
  let totalEarned = state.stats.totalEarned;

  if (hasAutoSell(state) && stock > 0) {
    const revenue = stock * currentSimitPrice(state);
    money += revenue;
    totalEarned += revenue;
    stock = 0;
  }

  const { level, xp } = resolveLevelUps(state.level, state.xp + produced);

  return {
    ...state,
    stock,
    money,
    xp,
    level,
    stats: {
      totalBaked: state.stats.totalBaked + produced,
      totalEarned,
      playTimeSec: state.stats.playTimeSec + dtSeconds,
    },
  };
}
