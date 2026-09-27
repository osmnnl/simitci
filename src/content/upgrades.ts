import type { UpgradeDef } from "./types";

export const UPGRADES: UpgradeDef[] = [
  {
    id: "guclubilek",
    name: "Güçlü bilek",
    description: "Tıklama gücün ikiye katlanır.",
    cost: 50,
    unlockLevel: 1,
    effect: { kind: "clickMultiplier", factor: 2 },
  },
  {
    id: "tezgah",
    name: "Tezgah",
    description: "Stoktaki simitler artık kendiliğinden satılır.",
    cost: 200,
    unlockLevel: 2,
    effect: { kind: "autoSell" },
  },
  {
    id: "susamliTarif",
    name: "Susamlı tarif",
    description: "Simit satış fiyatı %50 artar.",
    cost: 500,
    unlockLevel: 4,
    effect: { kind: "priceMultiplier", factor: 1.5 },
  },
  {
    id: "ustaEli",
    name: "Usta eli",
    description: "Çırak ve Kalfa üretimi ikiye katlanır.",
    cost: 2500,
    unlockLevel: 7,
    effect: {
      kind: "producerMultiplier",
      targets: ["cirak", "kalfa"],
      factor: 2,
    },
  },
];

export const UPGRADES_BY_ID: Record<string, UpgradeDef> = Object.fromEntries(
  UPGRADES.map((u) => [u.id, u]),
);
