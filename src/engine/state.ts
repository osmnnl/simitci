import { DISTRICTS, type DistrictId } from "../content/districts";
import type { SkillId } from "../content/skills";
import { TIERS } from "../content/tiers";
import { BALANCE } from "../content/balance";

export interface DistrictState {
  unlocked: boolean;
  money: number;
  runEarned: number; // earned since last devir
  lifetimeEarned: number; // earned in all previous runs
  un: number;
  owned: number[];
  upgrades: number; // count of sequential upgrades bought
  devirs: number;
}

export interface OrderSlot {
  templateId: string | null;
  district: DistrictId;
  startedAt: number;
  endsAt: number;
  reward: number;
}

export interface GameState {
  version: 2;
  districts: Record<DistrictId, DistrictState>;
  active: DistrictId;
  skillsXp: Record<SkillId, number>;
  crowd: number;
  orders: OrderSlot[];
  lastSeen: number;
  stats: { clicks: number; totalEarned: number; playTimeSec: number; startedAt: number };
}

export function newDistrict(unlocked: boolean): DistrictState {
  return {
    unlocked,
    money: 0,
    runEarned: 0,
    lifetimeEarned: 0,
    un: 0,
    owned: TIERS.map(() => 0),
    upgrades: 0,
    devirs: 0,
  };
}

export function emptyOrder(): OrderSlot {
  return { templateId: null, district: "korkuteli", startedAt: 0, endsAt: 0, reward: 0 };
}

export function createInitialState(now: number = Date.now()): GameState {
  const districts = Object.fromEntries(
    DISTRICTS.map((d) => [d.id, newDistrict(d.id === "korkuteli")]),
  ) as Record<DistrictId, DistrictState>;
  return {
    version: 2,
    districts,
    active: "korkuteli",
    skillsXp: { firincilik: 0, hamur: 0, satis: 0, tedarik: 0 },
    crowd: 0,
    orders: Array.from({ length: BALANCE.orderSlots }, emptyOrder),
    lastSeen: now,
    stats: { clicks: 0, totalEarned: 0, playTimeSec: 0, startedAt: now },
  };
}

export function clone(s: GameState): GameState {
  return structuredClone(s);
}
