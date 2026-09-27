import { useState } from "react";
import { useGameStore } from "../store/gameStore";

export function SaveControls() {
  const exportCurrentSave = useGameStore((s) => s.exportCurrentSave);
  const importSaveString = useGameStore((s) => s.importSaveString);
  const resetSave = useGameStore((s) => s.resetSave);
  const save = useGameStore((s) => s.save);

  const [open, setOpen] = useState(false);
  const [importText, setImportText] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  function handleExport() {
    const code = exportCurrentSave();
    void navigator.clipboard?.writeText(code).catch(() => undefined);
    setMessage("Kayıt kodu panoya kopyalandı.");
  }

  function handleImport() {
    const ok = importSaveString(importText);
    setMessage(ok ? "Kayıt yüklendi." : "Kod geçersiz görünüyor.");
    if (ok) setImportText("");
  }

  function handleReset() {
    if (window.confirm("Tüm ilerleme silinsin mi? Bu geri alınamaz.")) {
      resetSave();
      setMessage("Yeni bir başlangıç yaptın.");
    }
  }

  if (!open) {
    return (
      <button type="button" className="save-toggle" onClick={() => setOpen(true)}>
        Kayıt seçenekleri
      </button>
    );
  }

  return (
    <div className="save-controls">
      <button type="button" className="save-toggle" onClick={() => setOpen(false)}>
        Kapat
      </button>
      <div className="save-controls-body">
        <button type="button" onClick={save}>
          Şimdi kaydet
        </button>
        <button type="button" onClick={handleExport}>
          Kaydı dışa aktar
        </button>
        <textarea
          placeholder="Kayıt kodunu buraya yapıştır"
          value={importText}
          onChange={(e) => setImportText(e.target.value)}
          rows={2}
        />
        <button type="button" onClick={handleImport} disabled={!importText.trim()}>
          Kaydı içe aktar
        </button>
        <button type="button" className="danger" onClick={handleReset}>
          Sıfırla
        </button>
        {message && <p className="muted save-message">{message}</p>}
      </div>
    </div>
  );
}
