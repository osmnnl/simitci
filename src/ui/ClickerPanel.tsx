import { useState } from "react";
import { DISTRICTS_BY_ID } from "../content/districts";
import { FEATURES } from "../content/features";
import { clickValue, devirGain, onlineIncome } from "../engine/derive";
import { useGame } from "../store/gameStore";
import { fmt, money, mult, rate } from "./format";
import { Simit } from "./Simit";

export function ClickerPanel() {
  const game = useGame((s) => s.game);
  const click = useGame((s) => s.click);
  const doDevir = useGame((s) => s.devir);
  const [floaters, setFloaters] = useState<{ id: number; v: number; x: number }[]>([]);
  const [pressed, setPressed] = useState(false);
  const id = game.active;
  const ds = game.districts[id];
  const def = DISTRICTS_BY_ID[id];
  const cv = clickValue(game);
  const inc = onlineIncome(game, id);
  const gain = devirGain(game, id);

  function onClick() {
    click();
    setPressed(true);
    window.setTimeout(() => setPressed(false), 80);
    const fid = performance.now() + Math.random();
    setFloaters((f) => [...f.slice(-12), { id: fid, v: cv, x: (Math.random() - 0.5) * 80 }]);
    window.setTimeout(() => setFloaters((f) => f.filter((x) => x.id !== fid)), 700);
  }

  return (
    <section className="clicker" aria-label="Dükkân">
      <div className="stat-row">
        <div>
          <span className="label">Kasa</span>
          <span className="big gold">{money(ds.money)}</span>
        </div>
        <div className="right">
          <span className="label">Gelir</span>
          <span className="big">{money(inc).replace("₺", "₺")}<small>/sn</small></span>
        </div>
      </div>
      <div className="simit-wrap">
        <button type="button" className={"simit-btn" + (pressed ? " pressed" : "")} onClick={onClick} aria-label={`${def.productName} yap, +${fmt(cv)}`}>
          <Simit size={210} />
        </button>
        {floaters.map((f) => (
          <span key={f.id} className="floater" style={{ ["--fx" as string]: `${f.x}px` }}>+{fmt(f.v)}</span>
        ))}
      </div>
      <p className="muted small">Tık başına {money(cv)} · {rate(inc)} ₺/sn</p>
      {FEATURES.crowd && (
        <div className="meter" title="Kalabalık: tıkladıkça artar, üretimi en fazla ×1,5'e çıkarır">
          <span className="label">Kalabalık ×{(1 + game.crowd).toFixed(2).replace(".", ",")}</span>
          <div className="bar"><div className="fill" style={{ width: `${(game.crowd / 0.5) * 100}%` }} /></div>
        </div>
      )}
      {FEATURES.devir && (
        <div className="devir">
          <div className="devir-row">
            <span>Ün <b>{fmt(ds.un)}</b> · ün bonusu ×{mult(1 + 0.05 * ds.un)}</span>
          </div>
          <button type="button" className="devir-btn" disabled={gain < 1} onClick={() => {
            if (window.confirm(`Dükkânı çırağına devret: +${fmt(gain)} ün kazanırsın, kasa ve dükkân sıfırlanır. Emin misin?`)) doDevir();
          }}>
            Devret {gain >= 1 ? `(+${fmt(gain)} ün)` : ""}
          </button>
          <p className="muted small">{gain >= Math.max(10, ds.un) ? "Şimdi devretmek iyi bir fikir." : "Ün kazancı arttıkça devretmek daha değerli olur."}</p>
        </div>
      )}
    </section>
  );
}
