export interface TierDef {
  id: number;
  name: string;
  description: string;
  baseCost: number;
  baseRate: number; // ₺/sn per unit
  growth: number;
  gateLevel: number; // Fırıncılık level (only enforced when skills are on)
}

const NAMES: [string, string, number][] = [
  ["Çırak", "Tablayı taşır, simidi satar.", 1.07],
  ["Kalfa", "Hamuru yoğurur, çırağa yol gösterir.", 1.15],
  ["Tabla", "Aynı anda daha çok simit.", 1.14],
  ["Seyyar araba", "Mahalleyi dolaşır.", 1.13],
  ["Köşe tezgâhı", "Kalabalık köşede sabit satış.", 1.12],
  ["Mahalle fırını", "Kendi fırının, kendi ekmeğin.", 1.11],
  ["Taş fırın", "Odun ateşi, çıtır kabuk.", 1.1],
  ["Pastane", "Poğaça, açma, kurabiye.", 1.09],
  ["Şube zinciri", "Tabelan şehrin her yerinde.", 1.08],
  ["Fabrika", "Paketli simit, raflarda.", 1.07],
];
const GATES = [0, 0, 0, 0, 0, 0, 22, 42, 62, 78];

export const TIERS: TierDef[] = NAMES.map(([name, description, growth], i) => ({
  id: i,
  name,
  description,
  baseCost: 4 * 18 ** i,
  baseRate: 6 ** i,
  growth,
  gateLevel: GATES[i],
}));
