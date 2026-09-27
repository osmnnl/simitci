import type { ProducerId, UpgradeId } from "../content/types";
import { PRODUCERS } from "../content/producers";

export interface GameStats {
  totalBaked: number;
  totalEarned: number;
  playTimeSec: number;
}

export interface GameState {
  money: number;
  stock: number;
  xp: number;
  level: number;
  producers: Record<ProducerId, number>;
  upgrades: UpgradeId[];
  stats: GameStats;
  /** epoch ms of the last moment we know the player was present */
  lastSeen: number;
}

export function createInitialState(now: number = Date.now()): GameState {
  const producers = Object.fromEntries(
    PRODUCERS.map((p) => [p.id, 0]),
  ) as Record<ProducerId, number>;

  return {
    money: 0,
    stock: 0,
    xp: 0,
    level: 1,
    producers,
    upgrades: [],
    stats: { totalBaked: 0, totalEarned: 0, playTimeSec: 0 },
    lastSeen: now,
  };
}
