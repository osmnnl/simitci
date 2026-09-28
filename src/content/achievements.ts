import type { GameState } from "../engine/state";

export interface AchievementDef {
  id: string;
  name: string;
  desc: string;
  group: "tik" | "kazanc" | "devir" | "ilce" | "ustalik" | "olay" | "siparis" | "kademe";
  /** pure check; receives helpers so this file stays free of engine imports */
  check: (s: GameState, h: AchievementHelpers) => boolean;
}

export interface AchievementHelpers {
  skillLevel: (id: "firincilik" | "hamur" | "satis" | "tedarik") => number;
  maxMastery: () => number;
  totalDevirs: () => number;
  anyOwned: (tier: number) => boolean;
}

const earn = (id: string, name: string, v: number, label: string): AchievementDef => ({
  id, name, desc: `Toplamda ${label} kazan`, group: "kazanc", check: (s) => s.stats.totalEarned >= v,
});
const clicks = (id: string, name: string, v: number, label: string): AchievementDef => ({
  id, name, desc: `${label} kez simite dokun`, group: "tik", check: (s) => s.stats.clicks >= v,
});
const district = (id: string, name: string, d: keyof GameState["districts"], label: string): AchievementDef => ({
  id, name, desc: `${label} şubesini aç`, group: "ilce", check: (s) => s.districts[d].unlocked,
});

export const ACHIEVEMENTS: AchievementDef[] = [
  clicks("tik1", "İlk hamur", 100, "100"),
  clicks("tik2", "Bilek gücü", 1_000, "1.000"),
  clicks("tik3", "Demir bilek", 10_000, "10.000"),
  earn("kaz1", "İlk milyon", 1e6, "₺1M"),
  earn("kaz2", "Milyarder simitçi", 1e9, "₺1Mr"),
  earn("kaz3", "Trilyonluk tabla", 1e12, "₺1T"),
  earn("kaz4", "Kentilyon kasası", 1e18, "₺1Kn"),
  earn("kaz5", "Sayılar yetmez", 1e24, "₺1Sp"),
  { id: "dev1", name: "Devir teslim", desc: "İlk kez dükkânı devret", group: "devir", check: (_s, h) => h.totalDevirs() >= 1 },
  { id: "dev2", name: "Çırak yetiştiren", desc: "Toplam 10 kez devret", group: "devir", check: (_s, h) => h.totalDevirs() >= 10 },
  { id: "dev3", name: "Nesiller boyu", desc: "Toplam 50 kez devret", group: "devir", check: (_s, h) => h.totalDevirs() >= 50 },
  district("ilc1", "Sahil yolu", "manavgat", "Manavgat"),
  district("ilc2", "Şehre iniş", "antalya", "Antalya Merkez"),
  district("ilc3", "Gevrek diyarı", "izmir", "İzmir"),
  district("ilc4", "Boğaz'da simit", "istanbul", "İstanbul"),
  { id: "usk1", name: "Kalfalık", desc: "Herhangi bir skill'de 50. seviye", group: "ustalik", check: (_s, h) => (["firincilik", "hamur", "satis", "tedarik"] as const).some((k) => h.skillLevel(k) >= 50) },
  { id: "usk2", name: "Fırının ustası", desc: "Fırıncılık 99", group: "ustalik", check: (_s, h) => h.skillLevel("firincilik") >= 99 },
  { id: "mst1", name: "Mühürlü ürün", desc: "Bir üründe 50. ustalık seviyesi", group: "ustalik", check: (_s, h) => h.maxMastery() >= 50 },
  { id: "mst2", name: "Büyük mühür", desc: "Bir üründe 99. ustalık seviyesi", group: "ustalik", check: (_s, h) => h.maxMastery() >= 99 },
  { id: "olay1", name: "Şanslı gün", desc: "Bir olayı yakala", group: "olay", check: (s) => s.stats.eventsCaught >= 1 },
  { id: "olay2", name: "Fırsatçı", desc: "25 olay yakala", group: "olay", check: (s) => s.stats.eventsCaught >= 25 },
  { id: "sip1", name: "Toptancı", desc: "10 sipariş teslim et", group: "siparis", check: (s) => s.stats.ordersClaimed >= 10 },
  { id: "sip2", name: "Lojistik dehası", desc: "100 sipariş teslim et", group: "siparis", check: (s) => s.stats.ordersClaimed >= 100 },
  { id: "kdm1", name: "Fabrikatör", desc: "Bir Fabrika sahibi ol", group: "kademe", check: (_s, h) => h.anyOwned(9) },
];
