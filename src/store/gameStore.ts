import { create } from "zustand";
import type { DistrictId } from "../content/districts";
import * as A from "../engine/actions";
import { BALANCE } from "../content/balance";
import { createInitialState, type GameState } from "../engine/state";
import { applyOffline, tick, type OfflineReport } from "../engine/tick";
import { exportSave, importSave, loadGame, saveGame } from "../save/save";

interface Store {
  game: GameState;
  offline: OfflineReport | null;
  buyQty: A.BuyQty;
  setBuyQty: (q: A.BuyQty) => void;
  dismissOffline: () => void;
  click: () => void;
  buyTier: (tier: number) => void;
  buyUpgrade: () => void;
  devir: () => void;
  selectDistrict: (id: DistrictId) => void;
  unlockDistrict: (id: DistrictId) => void;
  startOrder: (slot: number, templateId: string) => void;
  claimOrder: (slot: number) => void;
  tick: (dt: number) => void;
  catchUp: () => void;
  save: () => void;
  reset: () => void;
  exportCode: () => string;
  importCode: (code: string) => boolean;
}

export const useGame = create<Store>((set, get) => ({
  game: loadGame() ?? createInitialState(),
  offline: null,
  buyQty: 1,
  setBuyQty: (buyQty) => set({ buyQty }),
  dismissOffline: () => set({ offline: null }),
  click: () => set((s) => ({ game: A.click(s.game) })),
  buyTier: (tier) => set((s) => ({ game: A.buyTier(s.game, tier, s.buyQty) })),
  buyUpgrade: () => set((s) => ({ game: A.buyUpgrade(s.game) })),
  devir: () => set((s) => ({ game: A.devir(s.game) })),
  selectDistrict: (id) => set((s) => ({ game: A.selectDistrict(s.game, id) })),
  unlockDistrict: (id) => set((s) => ({ game: A.unlockDistrict(s.game, id) })),
  startOrder: (slot, t) => set((s) => ({ game: A.startOrder(s.game, slot, t, Date.now()) })),
  claimOrder: (slot) => set((s) => ({ game: A.claimOrder(s.game, slot, Date.now()) })),
  tick: (dt) => set((s) => ({ game: tick(s.game, dt, Date.now()) })),
  catchUp: () => {
    const { state, report } = applyOffline(get().game, Date.now());
    set({ game: state, offline: report.elapsedSeconds >= BALANCE.offlineModalMinSeconds ? report : get().offline });
  },
  save: () => void saveGame(get().game),
  reset: () => {
    const fresh = createInitialState();
    saveGame(fresh);
    set({ game: fresh, offline: null });
  },
  exportCode: () => exportSave(get().game),
  importCode: (code) => {
    const g = importSave(code);
    if (!g) return false;
    set({ game: g });
    return true;
  },
}));

useGame.getState().catchUp();
