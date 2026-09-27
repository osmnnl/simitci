import { useEffect, useRef } from "react";
import { useGame } from "../store/gameStore";

const TICK_MS = 100;
const AUTOSAVE_MS = 10_000;
const GAP_SECONDS = 5; // bigger gaps (throttled/hidden tab) are treated as offline time

export function useGameLoop(): void {
  const last = useRef(0);
  useEffect(() => {
    last.current = performance.now();
    const id = window.setInterval(() => {
      const now = performance.now();
      const dt = (now - last.current) / 1000;
      last.current = now;
      const g = useGame.getState();
      if (dt > GAP_SECONDS) g.catchUp();
      else g.tick(dt);
    }, TICK_MS);
    const save = () => useGame.getState().save();
    const autosave = window.setInterval(save, AUTOSAVE_MS);
    const onVis = () => {
      if (document.visibilityState === "hidden") save();
      else last.current = performance.now();
    };
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("pagehide", save);
    return () => {
      window.clearInterval(id);
      window.clearInterval(autosave);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("pagehide", save);
    };
  }, []);
}
