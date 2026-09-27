import { useEffect, useRef } from "react";
import { useGameStore } from "../store/gameStore";

const TICK_MS = 100;
const AUTOSAVE_MS = 15_000;
/** Above this gap, treat it as an offline period instead of a giant tick. */
const OFFLINE_GAP_SECONDS = 5;

export function useGameLoop(): void {
  const tick = useGameStore((s) => s.tick);
  const catchUpOffline = useGameStore((s) => s.catchUpOffline);
  const save = useGameStore((s) => s.save);
  const lastFrameRef = useRef<number>(0);

  useEffect(() => {
    lastFrameRef.current = performance.now();
    const interval = window.setInterval(() => {
      const now = performance.now();
      const dtSeconds = (now - lastFrameRef.current) / 1000;
      lastFrameRef.current = now;

      if (dtSeconds > OFFLINE_GAP_SECONDS) {
        catchUpOffline(Date.now());
      } else {
        tick(dtSeconds);
      }
    }, TICK_MS);

    return () => window.clearInterval(interval);
  }, [tick, catchUpOffline]);

  useEffect(() => {
    const autosave = window.setInterval(save, AUTOSAVE_MS);

    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") save();
      else lastFrameRef.current = performance.now();
    };
    const onPageHide = () => save();

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("pagehide", onPageHide);

    return () => {
      window.clearInterval(autosave);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("pagehide", onPageHide);
    };
  }, [save]);
}
