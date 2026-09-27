import type { GameState } from "../engine/state";
import { createInitialState } from "../engine/state";

export const SAVE_KEY = "simitci:save";
export const SAVE_BACKUP_KEY = "simitci:save:backup";
export const CURRENT_SAVE_VERSION = 1 as const;

export interface SaveV1 {
  version: 1;
  savedAt: number;
  state: GameState;
}

export type AnySave = SaveV1;

export function serialize(state: GameState, now: number = Date.now()): SaveV1 {
  return { version: CURRENT_SAVE_VERSION, savedAt: now, state };
}

/**
 * Runs an unknown blob through the migration chain up to the current
 * version. Returns a fresh state if the data can't be trusted at all —
 * the game should never crash on a bad save (FR-10).
 */
export function migrate(raw: unknown): GameState {
  if (!isPlausibleSave(raw)) return createInitialState();

  // Only version 1 exists today. Future versions add a case here, each
  // one transforming the previous shape into the next.
  switch (raw.version) {
    case 1:
      return raw.state;
    default:
      return createInitialState();
  }
}

function isPlausibleSave(raw: unknown): raw is SaveV1 {
  if (typeof raw !== "object" || raw === null) return false;
  const r = raw as Record<string, unknown>;
  if (typeof r.version !== "number") return false;
  if (typeof r.state !== "object" || r.state === null) return false;
  const s = r.state as Record<string, unknown>;
  return (
    typeof s.money === "number" &&
    typeof s.stock === "number" &&
    typeof s.xp === "number" &&
    typeof s.level === "number" &&
    typeof s.producers === "object" &&
    Array.isArray(s.upgrades)
  );
}
