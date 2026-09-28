import { BALANCE } from "../content/balance";
import { TIERS } from "../content/tiers";
import { masteryLevel, masteryMult, totalOwned } from "../engine/derive";
import { xpForLevel } from "../engine/math";
import { useGame } from "../store/gameStore";
import { fmt } from "./format";

/** Ürün ustalığı: one row per producer the player has ever owned. */
export function MasteryPanel() {
  const game = useGame((s) => s.game);
  const rows = TIERS.filter((t) => game.masteryXp[t.id] > 0 || totalOwned(game, t.id) > 0);
  return (
    <section className="panel" aria-label="Ürün ustalığı">
      <h2>Ürün ustalığı</h2>
      <p className="muted tiny">Sahip olduğun her üretici zamanla ustalaşır. Devir'de sıfırlanmaz. 25/50/75'te mühür, 99'da büyük mühür (×2).</p>
      {rows.length === 0 && <p className="muted small">İlk üreticini aldığında ustalık başlar.</p>}
      <ul className="mastery">
        {rows.map((t) => {
          const L = masteryLevel(game, t.id);
          const xp = game.masteryXp[t.id];
          const lo = xpForLevel(L);
          const hi = xpForLevel(L + 1);
          const p = L >= 99 ? 1 : (xp - lo) / (hi - lo);
          const bonus = (masteryMult(game, t.id) - 1) * 100;
          return (
            <li key={t.id}>
              <div className="skill-row">
                <b>{t.name}</b>
                <span className="seals" aria-label={`${BALANCE.masterySeals.filter((x) => L >= x).length} mühür`}>
                  {BALANCE.masterySeals.map((x) => (
                    <i key={x} className={L >= x ? "seal on" : "seal"} title={`${x}. seviye mührü`} />
                  ))}
                  <span className="lvl">{L}</span>
                </span>
              </div>
              <div className="bar"><div className="fill" style={{ width: `${Math.max(0, Math.min(1, p)) * 100}%` }} /></div>
              <p className="tiny muted">+%{fmt(bonus)} üretim{L < 99 ? ` · sonraki seviyeye ${fmt(hi - xp)} XP` : " · büyük mühür"}</p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
