export type ProducerId = "cirak" | "kalfa" | "tabla" | "seyyarAraba";
export type UpgradeId = "guclubilek" | "tezgah" | "susamliTarif" | "ustaEli";

export interface ProducerDef {
  id: ProducerId;
  name: string;
  description: string;
  baseCost: number;
  /** simit produced per second, per unit owned, before upgrade multipliers */
  baseRate: number;
  /** minimum Fırıncılık level required before this producer can be bought */
  unlockLevel: number;
}

export interface UpgradeDef {
  id: UpgradeId;
  name: string;
  description: string;
  cost: number;
  unlockLevel: number;
  /** applied once, when purchased */
  effect:
    | { kind: "clickMultiplier"; factor: number }
    | { kind: "autoSell" }
    | { kind: "priceMultiplier"; factor: number }
    | { kind: "producerMultiplier"; targets: ProducerId[]; factor: number };
}

export interface LevelDef {
  level: number;
  /** total XP required to reach this level from level 1 */
  xpRequired: number;
}
