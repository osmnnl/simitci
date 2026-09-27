import type { ProducerDef } from "./types";

// Balance values are the PRD's first estimate — S5 will tune these against
// the headless simulation. Keep every number here, never inline in engine code.
export const PRODUCERS: ProducerDef[] = [
  {
    id: "cirak",
    name: "Çırak",
    description: "Sen yokken de simit yapar.",
    baseCost: 15,
    baseRate: 0.5,
    unlockLevel: 1,
  },
  {
    id: "kalfa",
    name: "Kalfa",
    description: "Çıraktan daha hızlı ve daha becerikli.",
    baseCost: 120,
    baseRate: 4,
    unlockLevel: 3,
  },
  {
    id: "tabla",
    name: "Tabla",
    description: "Aynı anda çok daha fazla simit pişirir.",
    baseCost: 900,
    baseRate: 25,
    unlockLevel: 6,
  },
  {
    id: "seyyarAraba",
    name: "Seyyar araba",
    description: "Mahalleyi dolaşıp sürekli satış yapar.",
    baseCost: 8000,
    baseRate: 150,
    unlockLevel: 10,
  },
];

export const PRODUCERS_BY_ID: Record<string, ProducerDef> = Object.fromEntries(
  PRODUCERS.map((p) => [p.id, p]),
);
