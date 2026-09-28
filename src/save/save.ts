import { DISTRICTS } from "../content/districts";
import { BALANCE } from "../content/balance";
import { TIERS } from "../content/tiers";
import { createInitialState, emptyOrder, newDistrict, type GameState } from "../engine/state";

export const SAVE_KEY = "simitci:v2";
export const BACKUP_KEY = "simitci:v2:backup";

function num(v: unknown, d = 0): number {
  return typeof v === "number" && Number.isFinite(v) ? v : d;
}

/**
 * Accepts anything and returns a valid GameState: missing districts, skills or
 * tiers (e.g. added in a later release) are filled with defaults, so new
 * content never breaks an existing save.
 */
export function normalize(raw: unknown, now = Date.now()): GameState {
  const base = createInitialState(now);
  if (typeof raw !== "object" || raw === null) return base;
  const r = raw as Partial<GameState>;
  if (r.version !== 2) return base;
  for (const d of DISTRICTS) {
    const src = r.districts?.[d.id];
    const dst = newDistrict(d.id === "korkuteli");
    if (src) {
      dst.unlocked = d.id === "korkuteli" ? true : Boolean(src.unlocked);
      dst.money = num(src.money);
      dst.runEarned = num(src.runEarned);
      dst.lifetimeEarned = num(src.lifetimeEarned);
      dst.un = num(src.un);
      dst.upgrades = num(src.upgrades);
      dst.devirs = num(src.devirs);
      dst.owned = TIERS.map((_, i) => num(src.owned?.[i]));
    }
    base.districts[d.id] = dst;
  }
  if (r.active && base.districts[r.active]?.unlocked) base.active = r.active;
  for (const k of Object.keys(base.skillsXp) as (keyof GameState["skillsXp"])[]) base.skillsXp[k] = num(r.skillsXp?.[k]);
  base.orders = Array.from({ length: BALANCE.orderSlots }, (_, i) => {
    const o = r.orders?.[i];
    return o && typeof o.templateId === "string" ? { ...emptyOrder(), ...o } : emptyOrder();
  });
  base.lastSeen = num(r.lastSeen, now);
  base.masteryXp = TIERS.map((_, i) => num(r.masteryXp?.[i]));
  base.achievements = Array.isArray(r.achievements) ? r.achievements.filter((a): a is string => typeof a === "string") : [];
  // events and buffs never survive a reload: they only exist while playing
  base.event = null;
  base.buffs = [];
  base.nextEventAt = now + 60_000;
  const st: Partial<GameState["stats"]> = r.stats ?? {};
  base.stats = {
    clicks: num(st.clicks), totalEarned: num(st.totalEarned), playTimeSec: num(st.playTimeSec),
    startedAt: num(st.startedAt, now), ordersClaimed: num(st.ordersClaimed), eventsCaught: num(st.eventsCaught),
    devirsTotal: num(st.devirsTotal, Object.values(base.districts).reduce((a, d) => a + d.devirs, 0)),
  };
  return base;
}

export function saveGame(s: GameState): boolean {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(s));
    return true;
  } catch {
    return false;
  }
}

export function loadGame(now = Date.now()): GameState | null {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(SAVE_KEY);
  } catch {
    return null;
  }
  if (!raw) return null;
  try {
    return normalize(JSON.parse(raw), now);
  } catch {
    try {
      localStorage.setItem(BACKUP_KEY, raw);
      localStorage.removeItem(SAVE_KEY);
    } catch {
      /* best effort */
    }
    return null;
  }
}

export function exportSave(s: GameState): string {
  return btoa(unescape(encodeURIComponent(JSON.stringify(s))));
}

export function importSave(code: string, now = Date.now()): GameState | null {
  try {
    const parsed = JSON.parse(decodeURIComponent(escape(atob(code.trim()))));
    if (parsed?.version !== 2) return null;
    return normalize(parsed, now);
  } catch {
    return null;
  }
}
