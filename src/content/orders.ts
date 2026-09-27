export interface OrderTemplate {
  id: string;
  name: string;
  minutes: number;
  xp: number; // Tedarik XP on claim
}

export const ORDER_TEMPLATES: OrderTemplate[] = [
  { id: "okul", name: "Okul kantini", minutes: 15, xp: 400 },
  { id: "otel", name: "Otel kahvaltısı", minutes: 60, xp: 1_800 },
  { id: "dugun", name: "Düğün salonu", minutes: 240, xp: 8_000 },
  { id: "ordu", name: "Kışla tedariki", minutes: 480, xp: 17_000 },
];
