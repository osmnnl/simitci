import { SKILLS } from "../content/skills";
import { skillLevel } from "../engine/derive";
import { xpForLevel } from "../engine/math";
import { useGame } from "../store/gameStore";
import { fmt } from "./format";

export function SkillsPanel() {
  const game = useGame((s) => s.game);
  return (
    <section className="panel" aria-label="Ustalık">
      <h2>Ustalık</h2>
      <ul className="skills">
        {SKILLS.map((sk) => {
          const L = skillLevel(game, sk.id);
          const xp = game.skillsXp[sk.id];
          const lo = xpForLevel(L);
          const hi = xpForLevel(L + 1);
          const p = L >= 99 ? 1 : (xp - lo) / (hi - lo);
          return (
            <li key={sk.id}>
              <div className="skill-row"><b>{sk.name}</b><span>{L}/99</span></div>
              <div className="bar"><div className="fill" style={{ width: `${Math.max(0, Math.min(1, p)) * 100}%` }} /></div>
              <p className="tiny muted">{sk.source} · {sk.bonus}{L < 99 ? ` · sonraki seviyeye ${fmt(hi - xp)} XP` : ""}</p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
