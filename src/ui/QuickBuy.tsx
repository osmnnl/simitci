import { TIERS } from "../content/tiers";
import { UPGRADES } from "../content/upgrades";
import { tierAllowed, tierCost, tierVisible, upgradeCost } from "../engine/derive";
import { useGame } from "../store/gameStore";
import { money } from "./format";

/** Thumb-zone shop on the mobile Dükkân tab: cheapest next buys, no tab switch needed. */
export function QuickBuy({ onMore }: { onMore: () => void }) {
  const game = useGame((s) => s.game);
  const buy = useGame((s) => s.buyTier);
  const setQty = useGame((s) => s.setBuyQty);
  const qty = useGame((s) => s.buyQty);
  const buyUpgrade = useGame((s) => s.buyUpgrade);
  const id = game.active;
  const ds = game.districts[id];
  const tiers = TIERS.filter((t) => tierVisible(game, id, t.id) && tierAllowed(game, t.id))
    .map((t) => ({ t, cost: tierCost(game, id, t.id, 1) }))
    .sort((a, b) => a.cost - b.cost)
    .slice(0, 3);
  const up = UPGRADES[ds.upgrades];
  const uc = upgradeCost(game, id);
  return (
    <section className="panel quick" aria-label="Hızlı alım">
      <div className="panel-head">
        <h2>Hızlı alım</h2>
        <button type="button" className="link" onClick={onMore}>Tümü ›</button>
      </div>
      <ul className="quick-list">
        {tiers.map(({ t, cost }) => (
          <li key={t.id}>
            <span className="q-name">{t.name}{ds.owned[t.id] > 0 && <small> · {ds.owned[t.id]}</small>}</span>
            <button type="button" className="buy" disabled={cost > ds.money} onClick={() => { if (qty !== 1) setQty(1); buy(t.id); }}>
              {money(cost)}
            </button>
          </li>
        ))}
        {up && (
          <li className="q-up">
            <span className="q-name">{up.name}<small> · ×{up.mult}</small></span>
            <button type="button" className="buy" disabled={uc > ds.money} onClick={buyUpgrade}>{money(uc)}</button>
          </li>
        )}
      </ul>
    </section>
  );
}
