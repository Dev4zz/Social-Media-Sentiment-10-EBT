# Dasbor Analisis Sentimen Transisi Energi Indonesia

Dasbor analisis sentimen publik untuk memetakan persepsi masyarakat Indonesia terhadap **10 sektor
Energi Baru Terbarukan (EBT)**. Dibangun untuk ECADIN Research, dasbor ini mengagregasi **15.074
percakapan riil** dari 5 platform digital (YouTube, TikTok, Instagram, Twitter/X, dan Portal Berita),
diklasifikasikan ke dalam sentimen Positif/Netral/Negatif melalui model AI (`w11wo/indonesian-roberta-base-sentiment-classifier`).
Seluruh angka dan grafik dihitung langsung dari dataset CSV riil — tidak ada data mock.

## Fitur Utama

- **Ringkasan Eksekutif** — KPI ringkas lintas 10 sektor (total percakapan, sektor teraktif,
  positivity/negativity rate, Net Sentiment Score/NSS) beserta narasi insight otomatis dari angka riil.
- **Distribusi Sentimen** — donut chart & breakdown Positif/Netral/Negatif dengan legend berikon wajah
  kustom, ditampilkan secara global maupun per platform/sektor.
- **Net Sentiment Score (NSS)** — skor agregat (positif − negatif) yang dihitung untuk keseluruhan
  dataset, per sektor, dan per bulan, untuk mengukur arah persepsi publik secara ringkas.
- **Perbandingan Sektor** — leaderboard Top 5 sektor paling positif & paling negatif, plus 100% stacked
  bar chart perbandingan seluruh sektor.
- **Aspek Analisis** — analisis berbasis lexicon Bahasa Indonesia terhadap 13 aspek diskusi (mis.
  kebijakan/regulasi, dampak lingkungan, teknologi pembangkit), lengkap dengan volume mention dan
  sentimen per aspek.
- **Analisis Waktu** — tren sentimen dari waktu ke waktu, word cloud, dan galeri komentar per sektor,
  dengan filter rentang tanggal (date picker) sesuai cakupan dataset.
- **Alert Lonjakan Volume** — banner otomatis saat volume percakapan harian melonjak signifikan di atas
  rata-rata bergerak 7 hari.

## Tech Stack

- **React 19** + **TanStack Start / TanStack Router** (routing & SSR)
- **Tailwind CSS v4** (styling, desain token berbasis CSS variable)
- **Recharts** (donut, bar, dan line chart)
- **TanStack Query** + **PapaParse** (fetching & parsing dataset CSV di sisi klien)
- **Lucide React** (ikon), SVG kustom untuk ikon wajah sentimen
- **TypeScript** end-to-end

## Menjalankan Proyek Secara Lokal

```bash
npm install
npm run dev
```

Build produksi:

```bash
npm run build
```
