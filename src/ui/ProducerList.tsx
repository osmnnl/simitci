import { useGameStore } from "../store/gameStore";
import { PRODUCERS } from "../content/producers";
import { producerCost } from "../engine/economy";
import { formatMoney, formatRate } from "./format";

export function ProducerList() {
  const game = useGameStore((s) => s.game);
  const buyProducer = useGameStore((s) => s.buyProducer);

  return (
    <section aria-label="Üreticiler" className="panel-block">
      <h2>Üreticiler</h2>
      <ul className="card-list">
        {PRODUCERS.map((def) => {
          const owned = game.producers[def.id] ?? 0;
          const unlocked = game.level >= def.unlockLevel;
          const cost = producerCost(def.baseCost, owned);
          const affordable = game.money >= cost;

          return (
            <li key={def.id} className="card">
              <div className="card-main">
                <div className="card-title-row">
                  <h3>{unlocked ? def.name : "???"}</h3>
                  {owned > 0 && <span className="badge">×{owned}</span>}
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
                disabled={!unlocked || !affordable}
                onClick={() => buyProducer(def.id)}
              >
                {unlocked ? formatMoney(cost) : "Kilitli"}
              </button>
              {unlocked && (
                <p className="card-foot">
                  {formatRate(def.baseRate)} simit/sn / adet
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
