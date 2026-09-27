import { create } from "zustand";
import type { GameState } from "../engine/state";
import { createInitialState } from "../engine/state";
import { tick as engineTick } from "../engine/tick";
import {
  click as engineClick,
  sell as engineSell,
  buyProducer as engineBuyProducer,
  buyUpgrade as engineBuyUpgrade,
} from "../engine/actions";
import { applyOffline } from "../engine/offline";
import { loadGame, saveGame, exportSave, importSave } from "../save/storage";
import type { ProducerId, UpgradeId } from "../content/types";

export interface OfflineReport {
  elapsedSeconds: number;
  earnings: number;
}

interface GameStore {
  game: GameState;
  offlineReport: OfflineReport | null;
  dismissOfflineReport: () => void;

  click: () => void;
  sell: () => void;
  buyProducer: (id: ProducerId) => void;
  buyUpgrade: (id: UpgradeId) => void;

  /** Advances simulated time by dtSeconds of real, foreground play. */
  tick: (dtSeconds: number) => void;
  /** Called once on load, and whenever the tab returns from a long hidden spell. */
  catchUpOffline: (nowMs?: number) => void;

  save: () => void;
  resetSave: () => void;
  exportCurrentSave: () => string;
  importSaveString: (base64: string) => boolean;
}

function loadInitialGame(): GameState {
  return loadGame() ?? createInitialState();
}

export const useGameStore = create<GameStore>((set, get) => ({
  game: loadInitialGame(),
  offlineReport: null,

  dismissOfflineReport: () => set({ offlineReport: null }),

  click: () => set((s) => ({ game: engineClick(s.game) })),
  sell: () => set((s) => ({ game: engineSell(s.game) })),
  buyProducer: (id) => set((s) => ({ game: engineBuyProducer(s.game, id) })),
  buyUpgrade: (id) => set((s) => ({ game: engineBuyUpgrade(s.game, id) })),

  tick: (dtSeconds) =>
    set((s) => ({
      game: { ...engineTick(s.game, dtSeconds), lastSeen: Date.now() },
    })),

  catchUpOffline: (nowMs = Date.now()) => {
    const s = get();
    const result = applyOffline(s.game, nowMs);
    set({
      game: result.state,
      offlineReport: result.shouldShowModal
        ? { elapsedSeconds: result.elapsedSeconds, earnings: result.earnings }
        : s.offlineReport,
    });
  },

  save: () => {
    saveGame(get().game);
  },

  resetSave: () => {
    set({ game: createInitialState(), offlineReport: null });
  },

  exportCurrentSave: () => exportSave(get().game),

  importSaveString: (base64) => {
    const state = importSave(base64);
    if (!state) return false;
    set({ game: state });
    return true;
  },
}));

// Run the offline catch-up exactly once, right after the store exists and
// the initial (possibly loaded) state is in place.
useGameStore.getState().catchUpOffline();
