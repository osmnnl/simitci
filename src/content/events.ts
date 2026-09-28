export type EventKind = "altin" | "bayram" | "usta" | "siparis";

export interface EventDef {
  kind: EventKind;
  title: string;
  body: string;
  cta: string;
  weight: number;
  /** buff length in seconds (0 = instant effect) */
  durationSec: number;
  mult: number;
}

export const EVENTS: EventDef[] = [
  { kind: "altin", title: "Altın simit!", body: "Tezgâhta parlayan bir simit var. Hemen kap!", cta: "Kap", weight: 4, durationSec: 0, mult: 600 /* seconds of income */ },
  { kind: "bayram", title: "Bayram kalabalığı", body: "60 saniye boyunca üretim ×3.", cta: "Karşıla", weight: 3, durationSec: 60, mult: 3 },
  { kind: "usta", title: "Usta ziyareti", body: "30 saniye boyunca tıklama gücü ×10.", cta: "Ağırla", weight: 2, durationSec: 30, mult: 10 },
  { kind: "siparis", title: "Unutulmuş sipariş", body: "Bekleyen bir sipariş hemen hazır olur.", cta: "Teslim et", weight: 1, durationSec: 0, mult: 1 },
];

export const EVENTS_BY_KIND = Object.fromEntries(EVENTS.map((e) => [e.kind, e])) as Record<EventKind, EventDef>;
