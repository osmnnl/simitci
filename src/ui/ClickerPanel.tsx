import { useState } from "react";
import { useConfirm } from "./ConfirmModal";
import { BuffChips } from "./EventBanner";
import { BALANCE } from "../content/balance";
import { DISTRICTS_BY_ID } from "../content/districts";
import { FEATURES } from "../content/features";
import { clickValue, devirGain, onlineIncome } from "../engine/derive";
import { useGame } from "../store/gameStore";
import { fmt, money, mult, rate } from "./format";
import { Simit } from "./Simit";

export function ClickerPanel({ compact = false }: { compact?: boolean }) {
  const game = useGame((s) => s.game);
  const click = useGame((s) => s.click);
  const [floaters, setFloaters] = useState<{ id: number; v: number; x: number }[]>([]);
  const [pressed, setPressed] = useState(false);
  const id = game.active;
  const ds = game.districts[id];
  const def = DISTRICTS_BY_ID[id];
  const cv = clickValue(game);
  const inc = onlineIncome(game, id);

  function onClick() {
    click();
    setPressed(true);
    window.setTimeout(() => setPressed(false), 80);
    const fid = performance.now() + Math.random();
    setFloaters((f) => [...f.slice(-12), { id: fid, v: cv, x: (Math.random() - 0.5) * 80 }]);
    window.setTimeout(() => setFloaters((f) => f.filter((x) => x.id !== fid)), 700);
  }

  return (
    <section className={"clicker" + (compact ? " compact" : "")} aria-label="Dükkân">
      {!compact && <div className="stat-row">
        <div>
          <span className="label">Kasa</span>
          <span className="big gold">{money(ds.money)}</span>
        </div>
        <div className="right">
          <span className="label">Gelir</span>
          <span className="big">{money(inc)}<small>/sn</small></span>
        </div>
      </div>}
      <div className="simit-wrap">
        <button type="button" className={"simit-btn" + (pressed ? " pressed" : "")} onClick={onClick} aria-label={`${def.productName} yap, +${fmt(cv)}`}>
          <Simit size={210} />
        </button>
        {floaters.map((f) => (
          <span key={f.id} className="floater" style={{ ["--fx" as string]: `${f.x}px` }}>+{fmt(f.v)}</span>
        ))}
      </div>
      {!compact && <p className="muted small">Tık başına {money(cv)} · {rate(inc)} ₺/sn</p>}
      <BuffChips />
      {FEATURES.crowd && (
        <div className="meter" title={`Kalabalık: tıkladıkça artar, üretimi en fazla ×${mult(1 + BALANCE.crowdMax)} yapar`}>
          <span className="label">{compact ? `Tık ${money(cv)} · ` : ""}Kalabalık ×{(1 + game.crowd).toFixed(2).replace(".", ",")}</span>
          <div className="bar"><div className="fill" style={{ width: `${(game.crowd / BALANCE.crowdMax) * 100}%` }} /></div>
        </div>
      )}
      {FEATURES.devir && !compact && <DevirBox />}
    </section>
  );
}

/** Devir controls. Inside the clicker on desktop; its own card on mobile (rare action, below the shop). */
export function DevirBox({ card = false }: { card?: boolean }) {
  const game = useGame((s) => s.game);
  const doDevir = useGame((s) => s.devir);
  const { confirm, node: confirmModal } = useConfirm();
  const ds = game.districts[game.active];
  const gain = devirGain(game, game.active);
  const ready = gain >= Math.max(10, ds.un);
  return (
    <div className={"devir" + (card ? " devir-card" + (ready ? " is-ready" : "") : "")}>
      <div className="devir-row">
        <span>Ün <b>{fmt(ds.un)}</b> · ün bonusu ×{mult(1 + 0.05 * ds.un)}</span>
      </div>
      <button type="button" className={"devir-btn" + (ready ? " ready" : " soft")} disabled={gain < 1} onClick={async () => {
        if (await confirm({
          title: "Dükkânı devret",
          body: `Çırağına devredersin: +${fmt(gain)} ün kazanırsın, kasa ve dükkân sıfırlanır.`,
          confirmLabel: `Devret (+${fmt(gain)} ün)`,
        })) doDevir();
      }}>
        Devret {gain >= 1 ? `(+${fmt(gain)} ün)` : ""}
      </button>
      <p className="muted small">{ready ? "Şimdi devretmek iyi bir fikir." : "Ün kazancı arttıkça devretmek daha değerli olur."}</p>
      {confirmModal}
    </div>
  );
}
