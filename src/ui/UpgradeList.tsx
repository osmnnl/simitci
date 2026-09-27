import { useGameStore } from "../store/gameStore";
import { UPGRADES } from "../content/upgrades";
import { formatMoney } from "./format";

export function UpgradeList() {
  const game = useGameStore((s) => s.game);
  const buyUpgrade = useGameStore((s) => s.buyUpgrade);

  const visible = UPGRADES.filter(
    (def) => game.level >= def.unlockLevel || game.level >= def.unlockLevel - 1,
  );
  if (visible.length === 0) return null;

  return (
    <section aria-label="Yükseltmeler" className="panel-block">
      <h2>Yükseltmeler</h2>
      <ul className="card-list">
        {visible.map((def) => {
          const owned = game.upgrades.includes(def.id);
          const unlocked = game.level >= def.unlockLevel;
          const affordable = game.money >= def.cost;

          return (
            <li key={def.id} className="card">
              <div className="card-main">
                <div className="card-title-row">
                  <h3>{unlocked ? def.name : "???"}</h3>
                </div>
                <p className="card-desc">
                  {unlocked
                    ? def.description
                    : `Seviye ${def.unlockLevel}'de açılır`}
                </p>
              </div>
              <button
                type="button"
                className="card-buy"
                disabled={owned || !unlocked || !affordable}
                onClick={() => buyUpgrade(def.id)}
              >
                {owned ? "Alındı" : unlocked ? formatMoney(def.cost) : "Kilitli"}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
