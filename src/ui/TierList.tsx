import { BALANCE } from "../content/balance";
import { FEATURES } from "../content/features";
import { TIERS } from "../content/tiers";
import { tierAllowed, tierCost, tierMaxAffordable, tierMult, tierVisible, globalMult } from "../engine/derive";
import { useGame } from "../store/gameStore";
import { money, rate } from "./format";

export function TierList() {
  const game = useGame((s) => s.game);
  const qty = useGame((s) => s.buyQty);
  const setQty = useGame((s) => s.setBuyQty);
  const buy = useGame((s) => s.buyTier);
  const id = game.active;
  const ds = game.districts[id];
  const gm = globalMult(game, id);

  return (
    <section className="panel" aria-label="Üreticiler">
      <div className="panel-head">
        <h2>Üreticiler</h2>
        <div className="qty" role="group" aria-label="Alım miktarı">
          {([1, 10, "max"] as const).map((q) => (
            <button key={q} type="button" className={qty === q ? "on" : ""} onClick={() => setQty(q)}>{q === "max" ? "Maks" : `×${q}`}</button>
          ))}
        </div>
      </div>
      <ul className="cards">
        {TIERS.map((t) => {
          if (!tierVisible(game, id, t.id)) return null;
          const own = ds.owned[t.id];
          const allowed = tierAllowed(game, t.id);
          const n = qty === "max" ? Math.max(1, tierMaxAffordable(game, id, t.id)) : qty;
          const cost = tierCost(game, id, t.id, n);
          const next = BALANCE.milestones.find((m) => m > own);
          const each = t.baseRate * tierMult(ds, t.id) * gm;
          return (
            <li key={t.id} className={"card" + (allowed ? "" : " locked")}>
              <div className="card-main">
                <div className="title-row">
                  <h3>{t.name}</h3>
                  {own > 0 && <span className="badge">{own}</span>}
                </div>
                <p className="muted small">{allowed ? t.description : `Fırıncılık ${t.gateLevel}. seviyede açılır`}</p>
                {allowed && own > 0 && (
                  <p className="tiny">
                    {rate(each)} ₺/sn/adet{next ? ` · ${next} adette ×2 (${next - own} kaldı)` : ""}
                  </p>
                )}
              </div>
              <button type="button" className="buy" disabled={!allowed || cost > ds.money} onClick={() => buy(t.id)}>
                {allowed ? <>{n > 1 && <small>×{n} </small>}{money(cost)}</> : "Kilitli"}
              </button>
            </li>
          );
        })}
      </ul>
      {FEATURES.skills && <p className="muted tiny">İleri kademeler Fırıncılık seviyesiyle açılır.</p>}
    </section>
  );
}
