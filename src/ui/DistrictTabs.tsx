import { DISTRICTS } from "../content/districts";
import { districtUnlockable, markaMult } from "../engine/derive";
import { useGame } from "../store/gameStore";
import { fmt } from "./format";

export function DistrictTabs() {
  const game = useGame((s) => s.game);
  const select = useGame((s) => s.selectDistrict);
  const unlock = useGame((s) => s.unlockDistrict);
  const firstLocked = DISTRICTS.find((d) => !game.districts[d.id].unlocked);
  const marka = markaMult(game);
  return (
    <nav className="districts" aria-label="İlçeler">
      {DISTRICTS.filter((d) => game.districts[d.id].unlocked).map((d) => (
        <button key={d.id} type="button" className={"tab" + (game.active === d.id ? " on" : "")} onClick={() => select(d.id)} title={d.tagline}>
          {d.name}
        </button>
      ))}
      {firstLocked && (
        districtUnlockable(game, firstLocked.id) ? (
          <button type="button" className="tab new" onClick={() => unlock(firstLocked.id)} title={firstLocked.tagline}>
            + {firstLocked.name} aç
          </button>
        ) : (
          <span className="tab locked" title={firstLocked.tagline}>
            {firstLocked.name} · Korkuteli'de {fmt(firstLocked.unlockUn)} ün
          </span>
        )
      )}
      {marka > 1 && <span className="marka">Marka ×{marka.toFixed(1).replace(".", ",")}</span>}
    </nav>
  );
}
