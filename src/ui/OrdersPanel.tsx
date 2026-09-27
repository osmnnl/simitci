import { DISTRICTS_BY_ID } from "../content/districts";
import { ORDER_TEMPLATES } from "../content/orders";
import { BALANCE } from "../content/balance";
import { baseIncome } from "../engine/derive";
import { useGame } from "../store/gameStore";
import { duration, money } from "./format";

export function OrdersPanel() {
  const game = useGame((s) => s.game);
  const start = useGame((s) => s.startOrder);
  const claim = useGame((s) => s.claimOrder);
  const now = game.lastSeen; // updated every tick, keeps render pure
  const inc = baseIncome(game, game.active);
  const orderMult = DISTRICTS_BY_ID[game.active].orderMult;
  return (
    <section className="panel" aria-label="Siparişler">
      <h2>Siparişler</h2>
      <p className="muted tiny">Siparişi al, süre dolunca teslim et. Ödül, siparişi aldığın andaki gelire göre hesaplanır.</p>
      {game.orders.map((o, i) => {
        if (!o.templateId) {
          return (
            <div key={i} className="order empty">
              <span className="tiny muted">Boş tezgâh {i + 1}</span>
              <div className="order-choices">
                {ORDER_TEMPLATES.map((t) => (
                  <button key={t.id} type="button" disabled={inc <= 0} onClick={() => start(i, t.id)} title={`${t.name}: ${money(inc * t.minutes * 60 * BALANCE.orderRewardFactor * orderMult)}`}>
                    {t.minutes < 60 ? `${t.minutes} dk` : `${t.minutes / 60} sa`}
                  </button>
                ))}
              </div>
            </div>
          );
        }
        const tpl = ORDER_TEMPLATES.find((t) => t.id === o.templateId)!;
        const done = now >= o.endsAt;
        const p = Math.min(1, (now - o.startedAt) / (o.endsAt - o.startedAt));
        return (
          <div key={i} className="order">
            <div className="skill-row"><b>{tpl.name}</b><span className="small">{DISTRICTS_BY_ID[o.district].name}</span></div>
            <div className="bar"><div className="fill" style={{ width: `${p * 100}%` }} /></div>
            <div className="skill-row">
              <span className="tiny muted">{done ? "Hazır" : `${duration((o.endsAt - now) / 1000)} kaldı`}</span>
              <button type="button" className="buy" disabled={!done} onClick={() => claim(i)}>{money(o.reward)}</button>
            </div>
          </div>
        );
      })}
    </section>
  );
}
