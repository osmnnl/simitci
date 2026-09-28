import { useEffect } from "react";
import { ACHIEVEMENTS, type AchievementDef } from "../content/achievements";
import { achievementMult } from "../engine/derive";
import { useGame } from "../store/gameStore";

const GLYPH: Record<AchievementDef["group"], string> = {
  tik: "✋", kazanc: "₺", devir: "↻", ilce: "⌂", ustalik: "★", olay: "✦", siparis: "▤", kademe: "⚙",
};

export function AchievementsPanel({ markSeen = false }: { markSeen?: boolean }) {
  const have = useGame((s) => s.game.achievements);
  const game = useGame((s) => s.game);
  const seen = useGame((s) => s.markAchievementsSeen);
  useEffect(() => {
    if (markSeen) seen();
  }, [markSeen, have.length, seen]);
  const got = new Set(have);
  const bonus = Math.round((achievementMult(game) - 1) * 100);
  return (
    <section className="panel" aria-label="Başarımlar">
      <h2>Başarımlar <span className="muted small">{got.size}/{ACHIEVEMENTS.length} · +%{bonus} üretim</span></h2>
      <ul className="achievements">
        {ACHIEVEMENTS.map((a) => (
          <li key={a.id} className={got.has(a.id) ? "ach on" : "ach"}>
            <span className="ach-glyph" aria-hidden="true">{GLYPH[a.group]}</span>
            <span className="ach-text">
              <b>{a.name}</b>
              <span>{a.desc}</span>
            </span>
            <span className="sr-only">{got.has(a.id) ? "açıldı" : "kilitli"}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
