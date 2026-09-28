import { useState } from "react";
import { useConfirm } from "./ConfirmModal";
import { useGame } from "../store/gameStore";

export function SaveControls() {
  const { save, reset, exportCode, importCode } = useGame.getState();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const { confirm, node: confirmModal } = useConfirm();
  if (!open) return (
    <>
      <button type="button" className="ghost" onClick={() => setOpen(true)}>Kayıt seçenekleri</button>
      {confirmModal}
    </>
  );
  return (
    <>
    <div className="save-box">
      <button type="button" onClick={() => { save(); setMsg("Kaydedildi."); }}>Şimdi kaydet</button>
      <button type="button" onClick={async () => {
        const code = exportCode();
        try {
          if (!navigator.clipboard) throw new Error("clipboard API yok");
          await navigator.clipboard.writeText(code);
          setMsg("Kayıt kodu panoya kopyalandı.");
        } catch {
          setText(code);
          setMsg("Kopyalama başarısız oldu; kodu aşağıdaki kutudan elle kopyala.");
        }
      }}>Dışa aktar</button>
      <textarea rows={2} placeholder="Kayıt kodunu yapıştır" value={text} onChange={(e) => setText(e.target.value)} />
      <button type="button" disabled={!text.trim()} onClick={() => setMsg(importCode(text) ? "Kayıt yüklendi." : "Kod geçersiz.")}>İçe aktar</button>
      <button type="button" className="danger" onClick={async () => {
        if (await confirm({ title: "Sıfırla", body: "Tüm ilerleme silinir; bu geri alınamaz.", confirmLabel: "Sıfırla", danger: true })) {
          reset(); setMsg("Sıfırlandı.");
        }
      }}>Sıfırla</button>
      <button type="button" className="ghost" onClick={() => setOpen(false)}>Kapat</button>
      {msg && <p className="muted small">{msg}</p>}
    </div>
    {confirmModal}
    </>
  );
}
