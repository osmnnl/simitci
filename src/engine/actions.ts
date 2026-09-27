import type { GameState } from "./state";
import type { ProducerId, UpgradeId } from "../content/types";
import { PRODUCERS_BY_ID } from "../content/producers";
import { UPGRADES_BY_ID } from "../content/upgrades";
import { producerCost, resolveLevelUps } from "./economy";
import { currentClickPower, currentSimitPrice } from "./selectors";

/** 1 XP per simit baked, whether by click, producer or offline catch-up. */
const XP_PER_SIMIT = 1;

function withXpGain(
  state: GameState,
  bakedAmount: number,
): Pick<GameState, "xp" | "level"> {
  return resolveLevelUps(state.level, state.xp + bakedAmount * XP_PER_SIMIT);
}

export function click(state: GameState): GameState {
  const amount = currentClickPower(state);
  const { level, xp } = withXpGain(state, amount);
  return {
    ...state,
    stock: state.stock + amount,
    xp,
    level,
    stats: { ...state.stats, totalBaked: state.stats.totalBaked + amount },
  };
}

export function sell(state: GameState): GameState {
  if (state.stock <= 0) return state;
  const price = currentSimitPrice(state);
  const revenue = state.stock * price;
  return {
    ...state,
    money: state.money + revenue,
    stock: 0,
    stats: {
      ...state.stats,
      totalEarned: state.stats.totalEarned + revenue,
    },
  };
}

export function buyProducer(state: GameState, id: ProducerId): GameState {
  const def = PRODUCERS_BY_ID[id];
  if (!def || state.level < def.unlockLevel) return state;
  const owned = state.producers[id] ?? 0;
  const cost = producerCost(def.baseCost, owned);
  if (state.money < cost) return state;
  return {
    ...state,
    money: state.money - cost,
    producers: { ...state.producers, [id]: owned + 1 },
  };
}

export function buyUpgrade(state: GameState, id: UpgradeId): GameState {
  const def = UPGRADES_BY_ID[id];
  if (!def || state.level < def.unlockLevel) return state;
  if (state.upgrades.includes(id)) return state;
  if (state.money < def.cost) return state;
  return {
    ...state,
    money: state.money - def.cost,
    upgrades: [...state.upgrades, id],
  };
}
