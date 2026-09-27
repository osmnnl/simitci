import { useGameStore } from "../store/gameStore";
import { formatMoney } from "./format";

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h} sa ${m} dk`;
  if (m > 0) return `${m} dk`;
  return `${Math.floor(seconds)} sn`;
}

export function OfflineModal() {
  const report = useGameStore((s) => s.offlineReport);
  const dismiss = useGameStore((s) => s.dismissOfflineReport);

  if (!report) return null;

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal">
        <p className="modal-eyebrow">Sen yokken</p>
        <h2>{formatDuration(report.elapsedSeconds)} geçti</h2>
        <p className="modal-earn">+{formatMoney(report.earnings)}</p>
        <button type="button" className="modal-close" onClick={dismiss}>
          Devam et
        </button>
      </div>
    </div>
  );
}
