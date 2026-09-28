import { BALANCE } from "../content/balance";
import { EVENTS_BY_KIND } from "../content/events";
import { useGame } from "../store/gameStore";

/** Time-limited event call-out. Lives outside tabs so it is visible everywhere. */
export function EventBanner() {
  const ev = useGame((s) => s.game.event);
  const now = useGame((s) => s.game.lastSeen);
  const claim = useGame((s) => s.claimEvent);
  if (!ev) return null;
  const def = EVENTS_BY_KIND[ev.kind];
  const left = Math.max(0, (ev.expiresAt - now) / 1000);
  const pct = (left / BALANCE.eventClaimWindowSec) * 100;
  return (
    <div className={`event-banner ev-${ev.kind}`} role="status" aria-live="polite">
      <div className="event-text">
        <b>{def.title}</b>
        <span>{def.body}</span>
      </div>
      <button type="button" className="event-cta" onClick={claim}>{def.cta}</button>
      <div className="event-timer" aria-hidden="true"><div style={{ width: `${pct}%` }} /></div>
    </div>
  );
}

/** Small chips for buffs that are currently running. */
export function BuffChips() {
  const buffs = useGame((s) => s.game.buffs);
  const now = useGame((s) => s.game.lastSeen);
  const live = buffs.filter((b) => b.until > now);
  if (!live.length) return null;
  return (
    <div className="buffs" aria-label="Aktif etkiler">
      {live.map((b, i) => (
        <span key={i} className="buff">
          {b.kind === "prod" ? "Üretim" : "Tıklama"} ×{b.mult} · {Math.ceil((b.until - now) / 1000)} sn
        </span>
      ))}
    </div>
  );
}
