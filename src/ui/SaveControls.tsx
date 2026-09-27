import { useState } from "react";
import { useGame } from "../store/gameStore";

export function SaveControls() {
  const { save, reset, exportCode, importCode } = useGame.getState();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  if (!open) return <button type="button" className="ghost" onClick={() => setOpen(true)}>Kayıt seçenekleri</button>;
  return (
    <div className="save-box">
      <button type="button" onClick={() => { save(); setMsg("Kaydedildi."); }}>Şimdi kaydet</button>
      <button type="button" onClick={() => { void navigator.clipboard?.writeText(exportCode()).catch(() => undefined); setMsg("Kayıt kodu panoya kopyalandı."); }}>Dışa aktar</button>
      <textarea rows={2} placeholder="Kayıt kodunu yapıştır" value={text} onChange={(e) => setText(e.target.value)} />
      <button type="button" disabled={!text.trim()} onClick={() => setMsg(importCode(text) ? "Kayıt yüklendi." : "Kod geçersiz.")}>İçe aktar</button>
      <button type="button" className="danger" onClick={() => { if (window.confirm("Tüm ilerleme silinsin mi?")) { reset(); setMsg("Sıfırlandı."); } }}>Sıfırla</button>
      <button type="button" className="ghost" onClick={() => setOpen(false)}>Kapat</button>
      {msg && <p className="muted small">{msg}</p>}
    </div>
  );
}
