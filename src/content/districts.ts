export type DistrictId = "korkuteli" | "manavgat" | "antalya" | "izmir" | "istanbul";

export interface DistrictDef {
  id: DistrictId;
  name: string;
  productName: string;
  unlockUn: number; // Korkuteli total ün required
  tagline: string;
  priceMult: number;
  costMult: number;
  clickMult: number;
  offlineMult: number; // multiplies offline efficiency
  orderMult: number;
}

export const DISTRICTS: DistrictDef[] = [
  { id: "korkuteli", name: "Korkuteli", productName: "simit", unlockUn: 0, tagline: "Her şeyin başladığı yer.", priceMult: 1, costMult: 1, clickMult: 1, offlineMult: 1, orderMult: 1 },
  { id: "manavgat", name: "Manavgat", productName: "simit", unlockUn: 500, tagline: "Turist sezonu: fiyat +%50, ama sen yokken işler yavaş.", priceMult: 1.5, costMult: 1, clickMult: 1, offlineMult: 0.7, orderMult: 1 },
  { id: "antalya", name: "Antalya Merkez", productName: "simit", unlockUn: 1e4, tagline: "Kalabalık cadde: tıklama ×2.", priceMult: 1, costMult: 1, clickMult: 2, offlineMult: 1, orderMult: 1 },
  { id: "izmir", name: "İzmir", productName: "gevrek", unlockUn: 2e4, tagline: "Burada adı gevrek. Siparişler +%50.", priceMult: 1, costMult: 1, clickMult: 1, offlineMult: 1, orderMult: 1.5 },
  { id: "istanbul", name: "İstanbul", productName: "simit", unlockUn: 8e4, tagline: "Her şey pahalı, her şey büyük.", priceMult: 3, costMult: 4, clickMult: 1, offlineMult: 1, orderMult: 1 },
];

export const DISTRICTS_BY_ID = Object.fromEntries(DISTRICTS.map((d) => [d.id, d])) as Record<DistrictId, DistrictDef>;
