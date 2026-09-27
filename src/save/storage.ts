import type { GameState } from "../engine/state";
import { SAVE_KEY, SAVE_BACKUP_KEY, serialize, migrate } from "./schema";

function storageAvailable(): boolean {
  try {
    const testKey = "simitci:test";
    window.localStorage.setItem(testKey, "1");
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

export const hasStorage = storageAvailable();

/** Writes the save; never throws — a full disk or blocked storage just fails silently. */
export function saveGame(state: GameState): boolean {
  if (!hasStorage) return false;
  try {
    window.localStorage.setItem(SAVE_KEY, JSON.stringify(serialize(state)));
    return true;
  } catch {
    return false;
  }
}

/**
 * Loads the save. If the stored JSON is corrupt, it's moved aside to a
 * backup key (never lost outright) and the player starts clean instead
 * of the game crashing.
 */
export function loadGame(): GameState | null {
  if (!hasStorage) return null;
  const raw = window.localStorage.getItem(SAVE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return migrate(parsed);
  } catch {
    try {
      window.localStorage.setItem(SAVE_BACKUP_KEY, raw);
      window.localStorage.removeItem(SAVE_KEY);
    } catch {
      /* best effort */
    }
    return null;
  }
}

export function clearSave(): void {
  if (!hasStorage) return;
  try {
    window.localStorage.removeItem(SAVE_KEY);
  } catch {
    /* best effort */
  }
}

/** Should: a copy-pasteable save string (FR-14). */
export function exportSave(state: GameState): string {
  const json = JSON.stringify(serialize(state));
  return btoa(unescape(encodeURIComponent(json)));
}

export function importSave(base64: string): GameState | null {
  try {
    const json = decodeURIComponent(escape(atob(base64.trim())));
    return migrate(JSON.parse(json));
  } catch {
    return null;
  }
}
