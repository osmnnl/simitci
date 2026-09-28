import { create } from "zustand";
import type { DistrictId } from "../content/districts";
import * as A from "../engine/actions";
import { BALANCE } from "../content/balance";
import { createInitialState, type GameState } from "../engine/state";
import { applyOffline, tick, type OfflineReport } from "../engine/tick";
import { exportSave, importSave, loadGame, saveGame } from "../save/save";
import { claimEvent, eventTick } from "../engine/events";
import { checkAchievements } from "../engine/achievements";
import { ACHIEVEMENTS } from "../content/achievements";

export interface Toast {
  id: number;
  title: string;
  body: string;
  tone: "achievement" | "event";
}
let toastSeq = 0;

interface Store {
  game: GameState;
  toasts: Toast[];
  unseenAchievements: number;
  pushToast: (t: Omit<Toast, "id">) => void;
  dismissToast: (id: number) => void;
  markAchievementsSeen: () => void;
  claimEvent: () => void;
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
  toasts: [],
  unseenAchievements: 0,
  pushToast: (t) => {
    const toast = { ...t, id: ++toastSeq };
    set((s) => ({ toasts: [...s.toasts.slice(-3), toast] }));
    window.setTimeout(() => get().dismissToast(toast.id), 4500);
  },
  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
  markAchievementsSeen: () => set({ unseenAchievements: 0 }),
  claimEvent: () => set((s) => ({ game: claimEvent(s.game, Date.now()) })),
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
  tick: (dt) => {
    const now = Date.now();
    const ticked = tick(get().game, dt, now);
    // no new events while the "Sen yokken" summary is still on screen
    let game = get().offline ? ticked : eventTick(ticked, now, Math.random);
    const { state, unlocked } = checkAchievements(game);
    game = state;
    set((s) => ({ game, unseenAchievements: s.unseenAchievements + unlocked.length }));
    const defs = unlocked.map((id) => ACHIEVEMENTS.find((x) => x.id === id)).filter((a) => !!a);
    if (defs.length === 1) {
      get().pushToast({ title: `Başarım: ${defs[0].name}`, body: `${defs[0].desc} · kalıcı +%1 üretim`, tone: "achievement" });
    } else if (defs.length > 1) {
      // several at once (e.g. first load of an older save): one summary instead of a wall of toasts
      const names = defs.slice(0, 3).map((a) => a.name).join(", ") + (defs.length > 3 ? ` +${defs.length - 3}` : "");
      get().pushToast({ title: `${defs.length} yeni başarım`, body: `${names} · kalıcı +%${defs.length} üretim`, tone: "achievement" });
    }
  },
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
