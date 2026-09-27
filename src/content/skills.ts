export type SkillId = "firincilik" | "hamur" | "satis" | "tedarik";

export interface SkillDef {
  id: SkillId;
  name: string;
  source: string;
  bonus: string;
}

export const SKILLS: SkillDef[] = [
  { id: "firincilik", name: "Fırıncılık", source: "Üretimle", bonus: "Üretim +%1/seviye · ileri kademelerin kapısı" },
  { id: "hamur", name: "Hamur", source: "Tıklamayla", bonus: "Tıklama gücü +%2/seviye" },
  { id: "satis", name: "Satış", source: "Satışla", bonus: "Fiyat +%1/seviye" },
  { id: "tedarik", name: "Tedarik", source: "Siparişlerle", bonus: "Offline tavanı 4→12 sa, verim %50→%70" },
];
