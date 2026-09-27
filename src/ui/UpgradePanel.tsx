import { UPGRADES } from "../content/upgrades";
import { upgradeCost } from "../engine/derive";
import { useGame } from "../store/gameStore";
import { money } from "./format";

export function UpgradePanel() {
  const game = useGame((s) => s.game);
  const buy = useGame((s) => s.buyUpgrade);
  const ds = game.districts[game.active];
  const next = UPGRADES[ds.upgrades];
  const cost = upgradeCost(game, game.active);
  return (
    <section className="panel" aria-label="Yükseltmeler">
      <h2>Yükseltmeler <span className="muted small">{ds.upgrades}/{UPGRADES.length}</span></h2>
      {next ? (
        <div className="card">
          <div className="card-main">
            <h3>{next.name}</h3>
            <p className="muted small">Bu üreticinin üretimi ×{next.mult}</p>
          </div>
          <button type="button" className="buy" disabled={cost > ds.money} onClick={buy}>{money(cost)}</button>
        </div>
      ) : (
        <p className="muted">Tüm yükseltmeler alındı.</p>
      )}
      {UPGRADES.slice(ds.upgrades + 1, ds.upgrades + 3).map((u) => (
        <p key={u.index} className="muted tiny">Sırada: {u.name}</p>
      ))}
    </section>
  );
}
