import { DISTRICTS_BY_ID, type DistrictId } from "../content/districts";
import { useGame } from "../store/gameStore";
import { duration, money } from "./format";

export function OfflineModal() {
  const report = useGame((s) => s.offline);
  const dismiss = useGame((s) => s.dismissOffline);
  if (!report) return null;
  const rows = Object.entries(report.earnings).filter(([, v]) => (v ?? 0) > 0) as [DistrictId, number][];
  return (
    <div className="modal-bg" role="dialog" aria-modal="true" aria-labelledby="off-title">
      <div className="modal">
        <p className="eyebrow">Sen yokken</p>
        <h2 id="off-title">{duration(report.elapsedSeconds)} geçti</h2>
        {report.cappedSeconds < report.elapsedSeconds && (
          <p className="muted small">Dükkânlar {duration(report.cappedSeconds)} boyunca çalıştı (offline tavanı).</p>
        )}
        {rows.length === 0 ? <p className="muted">Henüz kimse çalışmıyordu.</p> : rows.map(([id, v]) => (
          <p key={id} className="earn-row"><span>{DISTRICTS_BY_ID[id].name}</span><b>+{money(v)}</b></p>
        ))}
        <button type="button" className="primary" onClick={dismiss}>Devam et</button>
      </div>
    </div>
  );
}
