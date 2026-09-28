import { FEATURES } from "../content/features";
import { TIERS } from "../content/tiers";
import { devirGain, tierAllowed, tierCost, tierVisible, upgradeCost } from "../engine/derive";
import type { GameState } from "../engine/state";

/** What each mobile tab should flag, so players know where to look. */
export function tabBadges(g: GameState, unseenAchievements: number) {
  const id = g.active;
  const ds = g.districts[id];
  const affordable =
    TIERS.filter((t) => tierVisible(g, id, t.id) && tierAllowed(g, t.id) && tierCost(g, id, t.id) <= ds.money).length +
    (upgradeCost(g, id) <= ds.money ? 1 : 0);
  const readyOrders = g.orders.filter((o) => o.templateId && o.endsAt <= g.lastSeen).length;
  const idleOrders = g.orders.filter((o) => !o.templateId).length;
  const gain = devirGain(g, id);
  return {
    dukkan: FEATURES.devir && gain >= Math.max(10, ds.un) ? "!" : null,
    uretim: affordable > 0 ? String(Math.min(affordable, 9)) : null,
    siparis: FEATURES.orders ? (readyOrders ? String(readyOrders) : idleOrders ? "•" : null) : null,
    ustalik: null as string | null,
    basarim: unseenAchievements > 0 ? String(unseenAchievements) : null,
  };
}
