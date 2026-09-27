import type { GameState } from "./state";
import { PRODUCERS } from "../content/producers";
import { UPGRADES_BY_ID } from "../content/upgrades";
import { clickYield, simitPrice } from "./economy";
import type { ProducerId } from "../content/types";

export function hasUpgrade(state: GameState, id: string): boolean {
  return state.upgrades.includes(id as never);
}

export function clickMultiplier(state: GameState): number {
  let m = 1;
  for (const id of state.upgrades) {
    const def = UPGRADES_BY_ID[id];
    if (def?.effect.kind === "clickMultiplier") m *= def.effect.factor;
  }
  return m;
}

export function priceMultiplier(state: GameState): number {
  let m = 1;
  for (const id of state.upgrades) {
    const def = UPGRADES_BY_ID[id];
    if (def?.effect.kind === "priceMultiplier") m *= def.effect.factor;
  }
  return m;
}

export function producerMultiplier(
  state: GameState,
  producerId: ProducerId,
): number {
  let m = 1;
  for (const id of state.upgrades) {
    const def = UPGRADES_BY_ID[id];
    if (
      def?.effect.kind === "producerMultiplier" &&
      def.effect.targets.includes(producerId)
    ) {
      m *= def.effect.factor;
    }
  }
  return m;
}

export function hasAutoSell(state: GameState): boolean {
  return state.upgrades.some(
    (id) => UPGRADES_BY_ID[id]?.effect.kind === "autoSell",
  );
}

/** Total simit produced per second by every owned producer, upgrades applied. */
export function simitPerSecond(state: GameState): number {
  let total = 0;
  for (const def of PRODUCERS) {
    const owned = state.producers[def.id] ?? 0;
    if (owned <= 0) continue;
    total += owned * def.baseRate * producerMultiplier(state, def.id);
  }
  return total;
}

export function currentClickPower(state: GameState): number {
  return clickYield(clickMultiplier(state));
}

export function currentSimitPrice(state: GameState): number {
  return simitPrice(priceMultiplier(state));
}

export function isProducerUnlocked(
  state: GameState,
  unlockLevel: number,
): boolean {
  return state.level >= unlockLevel;
}
