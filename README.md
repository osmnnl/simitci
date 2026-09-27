# Simitçi

Tabladan fırın imparatorluğuna: sıfır bütçeli, tarayıcı tabanlı bir idle/clicker oyunu.

Bu depo, PRD'nin S0–S3 sprintlerini ve S4'ün bir kısmını kapsar: çekirdek ekonomi,
üretici/upgrade sistemi, delta-time game loop, kalıcı kayıt, offline kazanç ve
temel seviye/XP sistemi çalışır durumdadır.

## Geliştirme

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # vitest, tek seferlik
npm run test:coverage
npm run lint       # oxlint
npm run build      # tsc -b && vite build -> dist/
npm run preview    # dist/ içeriğini yerelde servis eder
```

## Klasör yapısı

- `src/engine/` — saf oyun mantığı (React yok): ekonomi formülleri, tick, actions, offline hesap.
- `src/content/` — üretici, upgrade ve tip tanımları. Denge değerleri yalnızca burada.
- `src/save/` — kayıt şeması, versiyon/migration, localStorage okuma-yazma, export/import.
- `src/store/` — Zustand store; engine fonksiyonlarını React'e bağlar.
- `src/loop/` — delta-time game loop hook'u (tick, otomatik kayıt, sekme görünürlüğü).
- `src/ui/` — React bileşenleri.
- `src/sim/` — S5'te eklenecek headless denge simülasyonu için ayrılmış, şu an boş.

## Durum

PRD ve sprint planı: proje içindeki Claude Doc'a bakın (bu depoda değil, ayrı bir dokümanda).

Kapsam dışı / henüz yapılmadı: Kalfa/Tabla/Seyyar araba'nın tam üretim zinciri testi
(üreticiler tanımlı ve satın alınabilir, ancak asıl playtest S5'te dengelenecek),
squash/uçuşan-sayı polish'inin bir kısmı, istatistik paneli, toplu satın alma,
ve S5'in tamamı (headless sim, playtest, itch.io yayını).
