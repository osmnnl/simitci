# Simitçi

Tabladan fabrikaya: tarayıcıda çalışan, günler ve haftalar süren bir idle/clicker oyunu.

Oyna: https://osmnnl.github.io/simitci/

## Geliştirme

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # birim testleri + denge testleri (CI kapısı)
npm run build
REPORT=1 DAYS=30 npx vitest run src/sim/report.test.ts   # denge raporu
```

## Mimari

- `src/content/` — tüm oyun verisi ve denge sabitleri (`balance.ts`). Sayılar yalnızca burada.
- `src/content/features.ts` — faz bayrakları; her faz bir bayrağı açarak yayınlanır.
- `src/engine/` — saf oyun mantığı (React yok): türetilmiş değerler, aksiyonlar, tick, offline.
- `src/sim/` — gerçek motoru süren başsız oyuncu modeli. `balance.test.ts` hedef zamanlar
  bandın dışına çıkarsa CI'ı kırar.
- `src/save/` — kayıt şeması v2; eksik alanlar varsayılanla doldurulur.
- `src/store/`, `src/loop/`, `src/ui/` — Zustand store, oyun döngüsü, React arayüzü.

Tasarım ve denge kararları: "Simitçi — Uzun Oyun Tasarım Planı (v2)" dokümanı.
