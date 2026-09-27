import { useState } from "react";
import { useGameStore } from "../store/gameStore";
import {
  currentClickPower,
  currentSimitPrice,
  simitPerSecond,
} from "../engine/selectors";
import { xpForNextLevel } from "../engine/economy";
import { formatMoney, formatNumber, formatRate } from "./format";
import { Simit } from "./Simit";

interface Floater {
  id: number;
  amount: number;
  x: number;
}

export function ClickerPanel() {
  const game = useGameStore((s) => s.game);
  const click = useGameStore((s) => s.click);
  const sell = useGameStore((s) => s.sell);

  const [floaters, setFloaters] = useState<Floater[]>([]);
  const [pressed, setPressed] = useState(false);

  const power = currentClickPower(game);
  const rate = simitPerSecond(game);
  const price = currentSimitPrice(game);
  const xpNeeded = xpForNextLevel(game.level);
  const xpProgress = Math.min(1, game.xp / xpNeeded);
  const stockValue = game.stock * price;

  function handleClick() {
    click();
    setPressed(true);
    window.setTimeout(() => setPressed(false), 90);

    const id = Date.now() + Math.random();
    const x = (Math.random() - 0.5) * 70;
    setFloaters((f) => [...f, { id, amount: power, x }]);
    window.setTimeout(() => {
      setFloaters((f) => f.filter((fl) => fl.id !== id));
    }, 650);
  }

  return (
    <section className="clicker-panel" aria-label="Fırın">
      <div className="stat-row">
        <div className="stat">
          <span className="stat-label">Simit stoku</span>
          <span className="stat-value">{formatNumber(game.stock)}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Para</span>
          <span className="stat-value gold">{formatMoney(game.money)}</span>
        </div>
      </div>

      <div className="simit-wrap">
        <button
          type="button"
          className={"simit-button" + (pressed ? " pressed" : "")}
          onClick={handleClick}
          aria-label={`Simit yap, +${formatNumber(power)}`}
        >
          <Simit size={220} />
        </button>
        {floaters.map((f) => (
          <span
            key={f.id}
            className="floater"
            style={{ ["--fx" as string]: `${f.x}px` }}
          >
            +{formatNumber(f.amount)}
          </span>
        ))}
      </div>

      <button
        type="button"
        className="sell-button"
        onClick={sell}
        disabled={game.stock <= 0}
      >
        Sat — {formatMoney(stockValue)}
      </button>

      {rate > 0 && (
        <p className="rate-line">+{formatRate(rate)} simit / sn</p>
      )}

      <div className="level-block">
        <div className="level-row">
          <span>Fırıncılık — Seviye {game.level}</span>
          <span className="muted">
            {formatNumber(game.xp)} / {formatNumber(xpNeeded)} XP
          </span>
        </div>
        <div className="xp-bar">
          <div className="xp-bar-fill" style={{ width: `${xpProgress * 100}%` }} />
        </div>
      </div>
    </section>
  );
}
