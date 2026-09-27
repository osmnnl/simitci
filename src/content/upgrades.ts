import { BALANCE } from "./balance";
import { TIERS } from "./tiers";

export interface UpgradeDef {
  index: number;
  name: string;
  tier: number;
  cost: number;
  mult: number;
}

const TITLES = ["usta dokunuşu", "gizli tarif", "altın kabuk"];

/** 30 upgrades, each ×3 to one tier, cycling through tiers; cost ×10 each. */
export const UPGRADES: UpgradeDef[] = Array.from(
  { length: BALANCE.upgradeCount },
  (_, j) => {
    const tier = j % TIERS.length;
    const round = Math.floor(j / TIERS.length);
    return {
      index: j,
      tier,
      name: `${TIERS[tier].name}: ${TITLES[round] ?? `seviye ${round + 1}`}`,
      cost: BALANCE.upgradeFirstCost * BALANCE.upgradeCostStep ** j,
      mult: BALANCE.upgradeMult,
    };
  },
);
