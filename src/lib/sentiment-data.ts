import Papa from "papaparse";
import { useQuery } from "@tanstack/react-query";
import {
  PLATFORMS,
  PLATFORM_MAP,
  SECTORS,
  SECTOR_LABELS,
  DATASET_MIN_DATE,
  DATASET_MAX_DATE,
  type PlatformSlug,
  type Sector,
} from "./platforms";

// ---------------------------------------------------------------------------
// 0. Dataset loading — master_sentiment_New.csv (15.074 baris riil), disajikan
//    dari /public dan diambil di sisi klien dengan PapaParse (download: true
//    memakai fetch di bawah tenda). Hasil parse di-cache dalam satu Promise
//    modul-level, lalu dipakai ulang oleh React Query di seluruh dasbor.
// ---------------------------------------------------------------------------
export interface SentimentRow {
  id: string;
  /** Nilai mentah kolom `platform` pada CSV: youtube | instagram | tiktok | twitter | portal_berita */
  platform: string;
  /** Nilai mentah kolom `sektor` — salah satu dari 10 sektor EBT resmi. */
  sektor: string;
  /** Kolom `sumber` — handle/akun/domain penulis konten. */
  sumber: string;
  /** Kolom `text_content` — teks asli (belum dibersihkan). */
  text: string;
  /** Kolom `text_clean` — dipakai untuk analisis kata kunci & aspek. */
  textClean: string;
  wordCount: number;
  /** Kolom `tanggal` (yyyy-mm-dd), null jika timestamp tidak valid (33 baris). */
  tanggal: string | null;
  date: Date | null;
  sentiment: "Positif" | "Netral" | "Negatif";
  sentimentScore: number;
}

const CSV_URL = "/master_sentiment_New.csv";

let cachedDataset: Promise<SentimentRow[]> | null = null;

function parseRow(raw: Record<string, string>): SentimentRow | null {
  if (!raw.id_unik) return null;
  const tanggal = raw.tanggal && raw.tanggal.trim() ? raw.tanggal.trim() : null;
  const sentiment =
    raw.sentiment === "Positif" || raw.sentiment === "Negatif" || raw.sentiment === "Netral"
      ? raw.sentiment
      : "Netral";
  return {
    id: raw.id_unik,
    platform: raw.platform ?? "",
    sektor: raw.sektor ?? "",
    sumber: raw.sumber ?? "",
    text: raw.text_content ?? "",
    textClean: raw.text_clean ?? "",
    wordCount: Number(raw.word_count) || 0,
    tanggal,
    date: tanggal ? new Date(`${tanggal}T00:00:00Z`) : null,
    sentiment,
    sentimentScore: Number(raw.sentiment_score) || 0,
  };
}

/** Memuat dan mem-parsing master_sentiment_New.csv sekali saja (hasilnya di-cache). */
export function loadSentimentDataset(): Promise<SentimentRow[]> {
  if (!cachedDataset) {
    cachedDataset = new Promise((resolve, reject) => {
      Papa.parse<Record<string, string>>(CSV_URL, {
        download: true,
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const rows: SentimentRow[] = [];
          for (const raw of results.data) {
            const row = parseRow(raw);
            if (row) rows.push(row);
          }
          resolve(rows);
        },
        error: (err: Error) => reject(err),
      });
    });
  }
  return cachedDataset;
}

/** Hook React Query yang membungkus loadSentimentDataset() untuk dipakai di komponen/rute. */
export function useSentimentDataset() {
  return useQuery({
    queryKey: ["sentiment-dataset", CSV_URL],
    queryFn: loadSentimentDataset,
    staleTime: Infinity,
    gcTime: Infinity,
    enabled: typeof window !== "undefined",
  });
}

// ---------------------------------------------------------------------------
// Rentang tanggal — sejak v2, filter waktu memakai date picker (since/until)
// alih-alih chip preset. `since`/`until` adalah string yyyy-mm-dd.
// ---------------------------------------------------------------------------
export interface DateRange {
  since: string;
  until: string;
}

export const FULL_RANGE: DateRange = { since: DATASET_MIN_DATE, until: DATASET_MAX_DATE };

function isFullRange(range: DateRange): boolean {
  return range.since <= DATASET_MIN_DATE && range.until >= DATASET_MAX_DATE;
}

export function formatRangeLabel(range: DateRange): string {
  if (isFullRange(range)) {
    return `Seluruh Data (${formatDateID(DATASET_MIN_DATE)} – ${formatDateID(DATASET_MAX_DATE)})`;
  }
  return `${formatDateID(range.since)} – ${formatDateID(range.until)}`;
}

/**
 * Menyaring baris berdasarkan rentang tanggal. Bila rentang mencakup seluruh dataset,
 * 33 baris tanpa tanggal valid tetap disertakan (konsisten dengan "total 15.074 data"
 * pada laporan); pada rentang custom yang lebih sempit, baris tanpa tanggal otomatis
 * tersisih karena tidak bisa diuji terhadap batas tanggal.
 */
export function filterByDateRange(rows: SentimentRow[], range: DateRange): SentimentRow[] {
  if (isFullRange(range)) return rows;
  const since = new Date(`${range.since}T00:00:00Z`);
  const until = new Date(`${range.until}T23:59:59Z`);
  return rows.filter((r) => r.date && r.date >= since && r.date <= until);
}

export function filterByPlatform(rows: SentimentRow[], platformSlug: PlatformSlug): SentimentRow[] {
  const csvValue = PLATFORM_MAP[platformSlug].csvValue;
  return rows.filter((r) => r.platform === csvValue);
}

export function formatDateID(ymd: string): string {
  const d = new Date(`${ymd}T00:00:00Z`);
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

export function truncate(text: string, max = 320): string {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > max ? `${clean.slice(0, max).trim()}…` : clean;
}

/** Portal berita menyimpan teks sebagai "JUDUL: ... | ISI: ..." — pisahkan bila cocok. */
export function extractPortalTitle(text: string): string | null {
  const m = text.match(/^JUDUL:\s*(.+?)\s*\|\s*ISI:/);
  return m ? m[1].trim() : null;
}

export function splitTitleAndBody(text: string): { title?: string; body: string } {
  const title = extractPortalTitle(text);
  if (!title) return { body: text };
  const idx = text.indexOf("ISI:");
  return { title, body: idx >= 0 ? text.slice(idx + 4) : text };
}

// ---------------------------------------------------------------------------
// Util dasar: breakdown sentimen & kata kunci.
// ---------------------------------------------------------------------------
interface Breakdown {
  positive: number;
  neutral: number;
  negative: number;
  total: number;
  nss: number;
  counts: { pos: number; neu: number; neg: number };
}

function sentimentBreakdown(rows: SentimentRow[]): Breakdown {
  let pos = 0;
  let neu = 0;
  let neg = 0;
  for (const r of rows) {
    if (r.sentiment === "Positif") pos++;
    else if (r.sentiment === "Negatif") neg++;
    else neu++;
  }
  const total = rows.length;
  if (total === 0) {
    return { positive: 0, neutral: 0, negative: 0, total: 0, nss: 0, counts: { pos: 0, neu: 0, neg: 0 } };
  }
  const positive = Math.round((pos / total) * 100);
  const negative = Math.round((neg / total) * 100);
  const neutral = 100 - positive - negative;
  const nss = Math.round(((pos - neg) / total) * 1000) / 10;
  return { positive, neutral, negative, total, nss, counts: { pos, neu, neg } };
}

const STOPWORDS = new Set([
  "yang", "dan", "di", "ke", "dari", "untuk", "dengan", "ini", "itu", "pada", "juga", "akan",
  "tidak", "atau", "adalah", "dalam", "ada", "saya", "kita", "kami", "mereka", "dia", "nya",
  "tersebut", "sudah", "belum", "masih", "bisa", "dapat", "harus", "agar", "karena", "jika",
  "saat", "oleh", "sebagai", "secara", "yaitu", "antara", "namun", "tetapi", "seperti", "lebih",
  "sangat", "banyak", "satu", "dua", "tiga", "para", "hal", "kata", "orang", "bagi", "maka",
  "the", "and", "for", "to", "of", "in", "on", "is", "an", "https", "http", "www", "com",
]);

function buildKeywords(rows: SentimentRow[]): { text: string; weight: number }[] {
  const freq = new Map<string, number>();
  for (const r of rows) {
    if (!r.textClean) continue;
    const seen = new Set<string>();
    for (const tok of r.textClean.split(/\s+/)) {
      const w = tok.trim();
      if (w.length < 4 || STOPWORDS.has(w) || /^\d+$/.test(w)) continue;
      if (seen.has(w)) continue; // hitung sekali per komentar agar satu dokumen panjang tak mendominasi
      seen.add(w);
      freq.set(w, (freq.get(w) ?? 0) + 1);
    }
  }
  const sorted = [...freq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 18);
  const max = sorted.length ? sorted[0][1] : 1;
  return sorted.map(([text, count]) => ({ text, weight: Math.max(0.3, count / max) }));
}

// ---------------------------------------------------------------------------
// Agregasi bulanan — dipakai tren per sektor, tren global gabungan, dan
// ringkasan otomatis yang menyoroti bulan puncak volume/negativitas.
// ---------------------------------------------------------------------------
export interface MonthlyPoint {
  key: string; // yyyy-mm
  label: string; // "Jan 2026"
  total: number;
  positive: number; // persen
  neutral: number;
  negative: number;
  posCount: number;
  neuCount: number;
  negCount: number;
}

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

function formatMonthLabel(ym: string): string {
  const [y, m] = ym.split("-").map(Number);
  return `${MONTH_NAMES[m - 1]} ${y}`;
}

export function buildMonthlyBreakdown(rows: SentimentRow[]): MonthlyPoint[] {
  const buckets = new Map<string, { pos: number; neu: number; neg: number }>();
  for (const r of rows) {
    if (!r.date) continue;
    const key = r.date.toISOString().slice(0, 7);
    const b = buckets.get(key) ?? { pos: 0, neu: 0, neg: 0 };
    if (r.sentiment === "Positif") b.pos++;
    else if (r.sentiment === "Negatif") b.neg++;
    else b.neu++;
    buckets.set(key, b);
  }
  return [...buckets.keys()].sort().map((key) => {
    const b = buckets.get(key)!;
    const total = b.pos + b.neu + b.neg;
    const positive = total ? Math.round((b.pos / total) * 100) : 0;
    const negative = total ? Math.round((b.neg / total) * 100) : 0;
    const neutral = 100 - positive - negative;
    return { key, label: formatMonthLabel(key), total, positive, neutral, negative, posCount: b.pos, neuCount: b.neu, negCount: b.neg };
  });
}

/** Tren bulanan gabungan seluruh platform — dipakai chart tren di halaman Pusat Analisis. */
export function getGlobalMonthlyTrend(rows: SentimentRow[]): MonthlyPoint[] {
  return buildMonthlyBreakdown(rows);
}

// ---------------------------------------------------------------------------
// 1. Per-sektor, per-platform, per-rentang tanggal (tab "Analisis Waktu")
// ---------------------------------------------------------------------------
export interface Comment {
  author: string;
  text: string;
  title?: string;
  date: string;
  sentiment: SentimentRow["sentiment"];
  platform: string;
}

export interface SentimentData {
  isEmpty: boolean;
  kpi: { positive: number; neutral: number; negative: number };
  trend: { date: string; positive: number; neutral: number; negative: number }[];
  monthly: MonthlyPoint[];
  summary: string;
  keywords: { text: string; weight: number }[];
  comments: { positive: Comment[]; neutral: Comment[]; negative: Comment[] };
  totalComments: number;
  nss: number;
}

function bucketKeyDay(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function buildTrend(rows: SentimentRow[]): { granularity: "day" | "month"; points: SentimentData["trend"] } {
  const dated = rows.filter((r): r is SentimentRow & { date: Date } => r.date !== null);
  if (dated.length === 0) return { granularity: "day", points: [] };
  let min = dated[0].date;
  let max = dated[0].date;
  for (const r of dated) {
    if (r.date < min) min = r.date;
    if (r.date > max) max = r.date;
  }
  const spanDays = (max.getTime() - min.getTime()) / 86_400_000;
  const granularity: "day" | "month" = spanDays > 45 ? "month" : "day";

  if (granularity === "month") {
    const monthly = buildMonthlyBreakdown(dated);
    return { granularity, points: monthly.map((m) => ({ date: m.label, positive: m.positive, neutral: m.neutral, negative: m.negative })) };
  }

  const buckets = new Map<string, { pos: number; neu: number; neg: number }>();
  for (const r of dated) {
    const key = bucketKeyDay(r.date);
    const b = buckets.get(key) ?? { pos: 0, neu: 0, neg: 0 };
    if (r.sentiment === "Positif") b.pos++;
    else if (r.sentiment === "Negatif") b.neg++;
    else b.neu++;
    buckets.set(key, b);
  }
  const points = [...buckets.keys()].sort().map((key) => {
    const b = buckets.get(key)!;
    const total = b.pos + b.neu + b.neg;
    const positive = total ? Math.round((b.pos / total) * 100) : 0;
    const negative = total ? Math.round((b.neg / total) * 100) : 0;
    const neutral = 100 - positive - negative;
    return { date: key.slice(5), positive, neutral, negative };
  });
  return { granularity, points };
}

function toComment(r: SentimentRow): Comment {
  const { title, body } = splitTitleAndBody(r.text);
  return {
    author: r.sumber || "Anonim",
    text: truncate(body),
    title,
    date: r.tanggal ? formatDateID(r.tanggal) : "Tanggal tidak tersedia",
    sentiment: r.sentiment,
    platform: r.platform,
  };
}

function buildCommentSample(rows: SentimentRow[]): SentimentData["comments"] {
  const pick = (label: SentimentRow["sentiment"]) =>
    rows
      .filter((r) => r.sentiment === label && r.text && r.text.trim().length >= 25)
      .sort((a, b) => (b.date?.getTime() ?? 0) - (a.date?.getTime() ?? 0))
      .slice(0, 4)
      .map(toComment);

  return { positive: pick("Positif"), neutral: pick("Netral"), negative: pick("Negatif") };
}

/** Menyoroti bulan dengan volume tertinggi dan bulan dengan sentimen paling negatif secara dinamis. */
function analyticalHighlights(monthly: MonthlyPoint[]): string[] {
  if (monthly.length < 2) return [];
  const withVolume = monthly.filter((m) => m.total > 0);
  if (withVolume.length === 0) return [];
  const peakVolume = withVolume.reduce((a, b) => (b.total > a.total ? b : a));
  const mostNegative = withVolume.reduce((a, b) => (b.negative > a.negative ? b : a));
  const lines: string[] = [];
  lines.push(`Volume percakapan tertinggi terjadi pada ${peakVolume.label} dengan ${peakVolume.total.toLocaleString("id-ID")} data.`);
  if (mostNegative.key !== peakVolume.key || withVolume.length > 1) {
    lines.push(`${mostNegative.label} tercatat sebagai bulan paling negatif (${mostNegative.negative}% negatif dari ${mostNegative.total.toLocaleString("id-ID")} data).`);
  }
  if (withVolume.length >= 3) {
    const last = withVolume[withVolume.length - 1];
    const prev = withVolume[withVolume.length - 2];
    const delta = last.negative - prev.negative;
    if (Math.abs(delta) >= 8) {
      lines.push(
        `Negativity rate ${delta > 0 ? "naik" : "turun"} ${Math.abs(delta)} poin dari ${prev.label} ke ${last.label}, menandakan pergeseran ${delta > 0 ? "memburuk" : "membaik"} yang perlu diperhatikan.`,
      );
    }
  }
  return lines;
}

export function getSentimentData(
  rows: SentimentRow[],
  platformSlug: PlatformSlug,
  sector: Sector,
  range: DateRange,
): SentimentData {
  const platformRows = filterByPlatform(rows, platformSlug);
  const rangeRows = filterByDateRange(platformRows, range);
  const sectorRows = rangeRows.filter((r) => r.sektor === sector);

  if (sectorRows.length === 0) {
    return {
      isEmpty: true,
      kpi: { positive: 0, neutral: 0, negative: 0 },
      trend: [],
      monthly: [],
      summary: "",
      keywords: [],
      comments: { positive: [], neutral: [], negative: [] },
      totalComments: 0,
      nss: 0,
    };
  }

  const breakdown = sentimentBreakdown(sectorRows);
  const { points: trend } = buildTrend(sectorRows);
  const monthly = buildMonthlyBreakdown(sectorRows);
  const keywords = buildKeywords(sectorRows);
  const comments = buildCommentSample(sectorRows);
  const rangeLabel = formatRangeLabel(range);
  const platformName = PLATFORM_MAP[platformSlug].name;

  const dominant =
    breakdown.positive >= breakdown.neutral && breakdown.positive >= breakdown.negative
      ? "positif"
      : breakdown.negative >= breakdown.neutral
        ? "negatif"
        : "netral";
  const dominantValue =
    dominant === "positif" ? breakdown.positive : dominant === "negatif" ? breakdown.negative : breakdown.neutral;

  const sentences = [
    `Selama ${rangeLabel}, ${sectorRows.length.toLocaleString("id-ID")} percakapan nyata mengenai ${sector} di ${platformName} berhasil dianalisis, didominasi sentimen ${dominant} (${dominantValue}%). Net Sentiment Score (NSS) sektor ini tercatat ${breakdown.nss > 0 ? "+" : ""}${breakdown.nss}.`,
    ...analyticalHighlights(monthly),
  ];
  if (keywords.length) {
    sentences.push(`Kata kunci yang paling banyak muncul: ${keywords.slice(0, 3).map((k) => k.text).join(", ")}.`);
  }

  return {
    isEmpty: false,
    kpi: { positive: breakdown.positive, neutral: breakdown.neutral, negative: breakdown.negative },
    trend,
    monthly,
    summary: sentences.join(" "),
    keywords,
    comments,
    totalComments: sectorRows.length,
    nss: breakdown.nss,
  };
}

// ---------------------------------------------------------------------------
// 2. Agregasi lintas sektor — dipakai Ringkasan Eksekutif + Perbandingan Sektor
// ---------------------------------------------------------------------------
export interface SectorSummaryPoint {
  sector: Sector;
  positive: number;
  neutral: number;
  negative: number;
  totalComments: number;
  nss: number;
}

export function getAllSectorsSummary(rows: SentimentRow[], platformSlug: PlatformSlug, range: DateRange): SectorSummaryPoint[] {
  const platformRows = filterByPlatform(rows, platformSlug);
  const rangeRows = filterByDateRange(platformRows, range);

  return SECTORS.map((sector) => {
    const sectorRows = rangeRows.filter((r) => r.sektor === sector);
    const b = sentimentBreakdown(sectorRows);
    return {
      sector,
      positive: b.positive,
      neutral: b.neutral,
      negative: b.negative,
      totalComments: sectorRows.length,
      nss: b.nss,
    };
  });
}

export interface PlatformSummaryPoint {
  platform: PlatformSlug;
  positive: number;
  neutral: number;
  negative: number;
  totalComments: number;
  nss: number;
}

/** Kebalikan dari getAllSectorsSummary — dipakai dasbor /analisis/sektor/$sector untuk memecah satu sektor per platform. */
export function getAllPlatformsSummaryForSector(rows: SentimentRow[], sector: Sector, range: DateRange): PlatformSummaryPoint[] {
  const sectorRows = rows.filter((r) => r.sektor === sector);
  const rangeRows = filterByDateRange(sectorRows, range);

  return PLATFORMS.map((p) => {
    const platformRows = rangeRows.filter((r) => r.platform === p.csvValue);
    const b = sentimentBreakdown(platformRows);
    return {
      platform: p.slug,
      positive: b.positive,
      neutral: b.neutral,
      negative: b.negative,
      totalComments: platformRows.length,
      nss: b.nss,
    };
  });
}

// ---------------------------------------------------------------------------
// 3. Ringkasan Eksekutif — dipakai dasbor per-platform (grup = sektor) maupun
//    dasbor per-sektor (grup = platform). `groupDimensionLabel` menyimpan teks
//    label yang sudah disiapkan supaya komponen kartu tidak perlu tahu apakah
//    ia sedang menampilkan sektor atau platform.
// ---------------------------------------------------------------------------
export interface ExecutiveSummary {
  totalComments: number;
  mostActiveGroupLabel: string;
  mostActiveGroupVolume: number;
  mostActiveGroupDimension: string; // "Sektor Teraktif" | "Platform Teraktif"
  mostNegativeGroupLabel: string;
  mostNegativeGroupRate: number;
  globalPositivity: number;
  globalNegativity: number;
  globalNeutrality: number;
  globalNSS: number;
  dateRangeLabel: string;
  insights: string[];
}

export function getExecutiveSummary(rows: SentimentRow[], platformSlug: PlatformSlug, range: DateRange): ExecutiveSummary {
  const sectors = getAllSectorsSummary(rows, platformSlug, range);
  const totalComments = sectors.reduce((sum, s) => sum + s.totalComments, 0);
  const withVolume = sectors.filter((s) => s.totalComments > 0);

  const rangeLabel = formatRangeLabel(range);
  const platformName = PLATFORM_MAP[platformSlug].name;

  if (withVolume.length === 0) {
    return {
      totalComments: 0,
      mostActiveGroupLabel: SECTOR_LABELS[sectors[0].sector],
      mostActiveGroupVolume: 0,
      mostActiveGroupDimension: "Sektor Teraktif",
      mostNegativeGroupLabel: SECTOR_LABELS[sectors[0].sector],
      mostNegativeGroupRate: 0,
      globalPositivity: 0,
      globalNegativity: 0,
      globalNeutrality: 0,
      globalNSS: 0,
      dateRangeLabel: rangeLabel,
      insights: [`Belum ada data percakapan untuk ${platformName} pada rentang waktu ini.`],
    };
  }

  const mostActive = sectors.reduce((a, b) => (b.totalComments > a.totalComments ? b : a));
  const mostNegative = withVolume.reduce((a, b) => (b.negative > a.negative ? b : a));
  const mostPositiveNSS = withVolume.reduce((a, b) => (b.nss > a.nss ? b : a));

  const platformRows = filterByPlatform(rows, platformSlug);
  const rangeRows = filterByDateRange(platformRows, range);
  const overall = sentimentBreakdown(rangeRows);
  const monthly = buildMonthlyBreakdown(rangeRows);

  const dominant =
    overall.positive >= overall.neutral && overall.positive >= overall.negative
      ? "positif"
      : overall.negative >= overall.neutral
        ? "negatif"
        : "netral";

  const insights: string[] = [
    `Secara keseluruhan, ${totalComments.toLocaleString("id-ID")} percakapan lintas 10 sektor EBT di ${platformName} selama ${rangeLabel.toLowerCase()} didominasi sentimen ${dominant}, dengan positivity rate ${overall.positive}% dan negativity rate ${overall.negative}% (NSS ${overall.nss > 0 ? "+" : ""}${overall.nss}).`,
    `Sektor ${mostActive.sector} mencatat volume percakapan tertinggi dengan ${mostActive.totalComments.toLocaleString("id-ID")} komentar, menunjukkan tingginya perhatian publik terhadap perkembangan sektor ini.`,
    `Sektor ${mostNegative.sector} tercatat paling sensitif dengan negativity rate ${mostNegative.negative}% dan NSS ${mostNegative.nss > 0 ? "+" : ""}${mostNegative.nss} dari ${mostNegative.totalComments.toLocaleString("id-ID")} komentar.`,
    `Sektor ${mostPositiveNSS.sector} memiliki Net Sentiment Score terbaik sebesar ${mostPositiveNSS.nss > 0 ? "+" : ""}${mostPositiveNSS.nss}, didorong ${mostPositiveNSS.positive}% sentimen positif berbanding ${mostPositiveNSS.negative}% negatif.`,
    ...analyticalHighlights(monthly),
  ];

  return {
    totalComments,
    mostActiveGroupLabel: SECTOR_LABELS[mostActive.sector],
    mostActiveGroupVolume: mostActive.totalComments,
    mostActiveGroupDimension: "Sektor Teraktif",
    mostNegativeGroupLabel: SECTOR_LABELS[mostNegative.sector],
    mostNegativeGroupRate: mostNegative.negative,
    globalPositivity: overall.positive,
    globalNegativity: overall.negative,
    globalNeutrality: overall.neutral,
    globalNSS: overall.nss,
    dateRangeLabel: rangeLabel,
    insights,
  };
}

/** Kebalikan dari getExecutiveSummary — grup = platform di dalam satu sektor tetap. */
export function getExecutiveSummaryForSector(rows: SentimentRow[], sector: Sector, range: DateRange): ExecutiveSummary {
  const platforms = getAllPlatformsSummaryForSector(rows, sector, range);
  const totalComments = platforms.reduce((sum, s) => sum + s.totalComments, 0);
  const withVolume = platforms.filter((s) => s.totalComments > 0);

  const rangeLabel = formatRangeLabel(range);
  const sectorLabel = SECTOR_LABELS[sector];

  if (withVolume.length === 0) {
    return {
      totalComments: 0,
      mostActiveGroupLabel: PLATFORM_MAP[platforms[0].platform].name,
      mostActiveGroupVolume: 0,
      mostActiveGroupDimension: "Platform Teraktif",
      mostNegativeGroupLabel: PLATFORM_MAP[platforms[0].platform].name,
      mostNegativeGroupRate: 0,
      globalPositivity: 0,
      globalNegativity: 0,
      globalNeutrality: 0,
      globalNSS: 0,
      dateRangeLabel: rangeLabel,
      insights: [`Belum ada data percakapan untuk ${sectorLabel} pada rentang waktu ini.`],
    };
  }

  const mostActive = platforms.reduce((a, b) => (b.totalComments > a.totalComments ? b : a));
  const mostNegative = withVolume.reduce((a, b) => (b.negative > a.negative ? b : a));
  const mostPositiveNSS = withVolume.reduce((a, b) => (b.nss > a.nss ? b : a));

  const sectorRows = rows.filter((r) => r.sektor === sector);
  const rangeRows = filterByDateRange(sectorRows, range);
  const overall = sentimentBreakdown(rangeRows);
  const monthly = buildMonthlyBreakdown(rangeRows);

  const dominant =
    overall.positive >= overall.neutral && overall.positive >= overall.negative
      ? "positif"
      : overall.negative >= overall.neutral
        ? "negatif"
        : "netral";

  const mostActiveName = PLATFORM_MAP[mostActive.platform].name;
  const mostNegativeName = PLATFORM_MAP[mostNegative.platform].name;
  const mostPositiveName = PLATFORM_MAP[mostPositiveNSS.platform].name;

  const insights: string[] = [
    `Secara keseluruhan, ${totalComments.toLocaleString("id-ID")} percakapan mengenai ${sectorLabel} lintas 5 platform selama ${rangeLabel.toLowerCase()} didominasi sentimen ${dominant}, dengan positivity rate ${overall.positive}% dan negativity rate ${overall.negative}% (NSS ${overall.nss > 0 ? "+" : ""}${overall.nss}).`,
    `${mostActiveName} mencatat volume percakapan tertinggi dengan ${mostActive.totalComments.toLocaleString("id-ID")} komentar, menunjukkan platform ini sebagai kanal utama diskusi ${sectorLabel}.`,
    `${mostNegativeName} tercatat paling sensitif dengan negativity rate ${mostNegative.negative}% dan NSS ${mostNegative.nss > 0 ? "+" : ""}${mostNegative.nss} dari ${mostNegative.totalComments.toLocaleString("id-ID")} komentar.`,
    `${mostPositiveName} memiliki Net Sentiment Score terbaik sebesar ${mostPositiveNSS.nss > 0 ? "+" : ""}${mostPositiveNSS.nss}, didorong ${mostPositiveNSS.positive}% sentimen positif berbanding ${mostPositiveNSS.negative}% negatif.`,
    ...analyticalHighlights(monthly),
  ];

  return {
    totalComments,
    mostActiveGroupLabel: mostActiveName,
    mostActiveGroupVolume: mostActive.totalComments,
    mostActiveGroupDimension: "Platform Teraktif",
    mostNegativeGroupLabel: mostNegativeName,
    mostNegativeGroupRate: mostNegative.negative,
    globalPositivity: overall.positive,
    globalNegativity: overall.negative,
    globalNeutrality: overall.neutral,
    globalNSS: overall.nss,
    dateRangeLabel: rangeLabel,
    insights,
  };
}

// ---------------------------------------------------------------------------
// 4. Leaderboard Top 5 Positif & Negatif — dipakai tab "Perbandingan Sektor"
//    (platform tetap, grup = sektor) maupun "Perbandingan Platform" (sektor
//    tetap, grup = platform). `key` tetap dijaga (nilai asli sektor/slug
//    platform) untuk keperluan navigasi/tautan; `label` sudah siap tampil.
// ---------------------------------------------------------------------------
export interface LeaderboardEntry {
  key: string;
  label: string;
  rate: number;
  volume: number;
}

export interface StackedGroupPoint {
  key: string;
  label: string;
  positive: number;
  neutral: number;
  negative: number;
}

export interface GroupLeaderboardData {
  topPositive: LeaderboardEntry[];
  topNegative: LeaderboardEntry[];
  stacked: StackedGroupPoint[];
}

export function getSectorLeaderboard(rows: SentimentRow[], platformSlug: PlatformSlug, range: DateRange): GroupLeaderboardData {
  const sectors = getAllSectorsSummary(rows, platformSlug, range);
  const withVolume = sectors.filter((s) => s.totalComments > 0);

  const topPositive = [...withVolume]
    .sort((a, b) => b.positive - a.positive)
    .slice(0, 5)
    .map((s) => ({ key: s.sector, label: SECTOR_LABELS[s.sector], rate: s.positive, volume: s.totalComments }));

  const topNegative = [...withVolume]
    .sort((a, b) => b.negative - a.negative)
    .slice(0, 5)
    .map((s) => ({ key: s.sector, label: SECTOR_LABELS[s.sector], rate: s.negative, volume: s.totalComments }));

  const stacked = sectors.map((s) => ({ key: s.sector, label: SECTOR_LABELS[s.sector], positive: s.positive, neutral: s.neutral, negative: s.negative }));

  return { topPositive, topNegative, stacked };
}

/** Kebalikan dari getSectorLeaderboard — dipakai tab "Perbandingan Platform" pada dasbor per-sektor. */
export function getPlatformLeaderboardForSector(rows: SentimentRow[], sector: Sector, range: DateRange): GroupLeaderboardData {
  const platforms = getAllPlatformsSummaryForSector(rows, sector, range);
  const withVolume = platforms.filter((s) => s.totalComments > 0);

  const topPositive = [...withVolume]
    .sort((a, b) => b.positive - a.positive)
    .slice(0, 5)
    .map((s) => ({ key: s.platform, label: PLATFORM_MAP[s.platform].name, rate: s.positive, volume: s.totalComments }));

  const topNegative = [...withVolume]
    .sort((a, b) => b.negative - a.negative)
    .slice(0, 5)
    .map((s) => ({ key: s.platform, label: PLATFORM_MAP[s.platform].name, rate: s.negative, volume: s.totalComments }));

  const stacked = platforms.map((s) => ({ key: s.platform, label: PLATFORM_MAP[s.platform].name, positive: s.positive, neutral: s.neutral, negative: s.negative }));

  return { topPositive, topNegative, stacked };
}

// ---------------------------------------------------------------------------
// 5. Deteksi Lonjakan Volume Percakapan — berbasis rasio volume harian riil
//    terhadap rata-rata bergerak 7 hari sebelumnya (bukan lagi acak).
// ---------------------------------------------------------------------------
export interface SpikeInfo {
  hasSpike: boolean;
  date: string;
  ratioPercent: number;
  groupLabel: string;
  topic: string;
  severity: "high" | "warning";
}

function detectSpike(rangeRowsInput: SentimentRow[], groupOf: (r: SentimentRow) => string, labelOf: (key: string) => string, fallbackLabel: string): SpikeInfo {
  const noSpike: SpikeInfo = { hasSpike: false, date: "", ratioPercent: 0, groupLabel: fallbackLabel, topic: "", severity: "warning" };

  const rangeRows = rangeRowsInput.filter((r) => r.date && r.tanggal);
  if (rangeRows.length < 20) return noSpike;

  const byDay = new Map<string, SentimentRow[]>();
  for (const r of rangeRows) {
    const key = r.tanggal!;
    const arr = byDay.get(key) ?? [];
    arr.push(r);
    byDay.set(key, arr);
  }
  const days = [...byDay.keys()].sort();
  if (days.length < 8) return noSpike;

  let bestIdx = -1;
  let bestRatio = 0;
  for (let i = 7; i < days.length; i++) {
    const todayCount = byDay.get(days[i])!.length;
    let trailingSum = 0;
    for (let j = i - 7; j < i; j++) trailingSum += byDay.get(days[j])!.length;
    const trailingAvg = trailingSum / 7;
    if (trailingAvg < 1) continue;
    const ratio = (todayCount / trailingAvg) * 100;
    if (ratio > bestRatio) {
      bestRatio = ratio;
      bestIdx = i;
    }
  }
  if (bestIdx === -1 || bestRatio < 150) return noSpike;

  const spikeRows = byDay.get(days[bestIdx])!;
  const byGroup = new Map<string, number>();
  for (const r of spikeRows) {
    const key = groupOf(r);
    byGroup.set(key, (byGroup.get(key) ?? 0) + 1);
  }
  const topEntry = [...byGroup.entries()].sort((a, b) => b[1] - a[1])[0];
  const topKey = topEntry?.[0];
  const topLabel = topKey ? labelOf(topKey) : fallbackLabel;

  const groupSpikeRows = topKey ? spikeRows.filter((r) => groupOf(r) === topKey) : spikeRows;
  const keywords = buildKeywords(groupSpikeRows);
  const topic = keywords.length
    ? `Lonjakan pembahasan seputar "${keywords.slice(0, 3).map((k) => k.text).join(", ")}"`
    : `Lonjakan volume percakapan ${topLabel}`;

  return {
    hasSpike: true,
    date: formatDateID(days[bestIdx]),
    ratioPercent: Math.round(bestRatio - 100),
    groupLabel: topLabel,
    topic,
    severity: bestRatio >= 250 ? "high" : "warning",
  };
}

function platformNameByCsvValue(csvValue: string): string {
  const found = PLATFORMS.find((p) => p.csvValue === csvValue);
  return found ? found.name : csvValue;
}

export function getVolumeSpike(rows: SentimentRow[], platformSlug: PlatformSlug, range: DateRange): SpikeInfo {
  const platformRows = filterByPlatform(rows, platformSlug);
  const rangeRows = filterByDateRange(platformRows, range);
  return detectSpike(rangeRows, (r) => r.sektor, (key) => SECTOR_LABELS[key as Sector] ?? key, SECTOR_LABELS[SECTORS[0]]);
}

/** Kebalikan dari getVolumeSpike — mendeteksi lonjakan dalam satu sektor, dipecah per platform. */
export function getVolumeSpikeForSector(rows: SentimentRow[], sector: Sector, range: DateRange): SpikeInfo {
  const sectorRows = rows.filter((r) => r.sektor === sector);
  const rangeRows = filterByDateRange(sectorRows, range);
  return detectSpike(rangeRows, (r) => r.platform, platformNameByCsvValue, PLATFORMS[0].name);
}

// ---------------------------------------------------------------------------
// 6. Ringkasan Global — seluruh 15.074 baris lintas platform, dipakai di
//    halaman Pusat Analisis untuk menampilkan angka agregat resmi laporan.
// ---------------------------------------------------------------------------
export interface GlobalSummary {
  totalComments: number;
  positive: number;
  neutral: number;
  negative: number;
  positiveCount: number;
  neutralCount: number;
  negativeCount: number;
  nss: number;
  byPlatform: { platform: PlatformSlug; name: string; count: number; negative: number; nss: number }[];
  bySector: SectorSummaryPoint[];
}

export function getGlobalSummary(rows: SentimentRow[]): GlobalSummary {
  const overall = sentimentBreakdown(rows);

  const byPlatform = PLATFORMS.map((p) => {
    const subset = rows.filter((r) => r.platform === p.csvValue);
    const b = sentimentBreakdown(subset);
    return { platform: p.slug, name: p.name, count: subset.length, negative: b.negative, nss: b.nss };
  });

  const bySector = SECTORS.map((sector) => {
    const subset = rows.filter((r) => r.sektor === sector);
    const b = sentimentBreakdown(subset);
    return { sector, positive: b.positive, neutral: b.neutral, negative: b.negative, totalComments: subset.length, nss: b.nss };
  });

  return {
    totalComments: rows.length,
    positive: overall.positive,
    neutral: overall.neutral,
    negative: overall.negative,
    positiveCount: overall.counts.pos,
    neutralCount: overall.counts.neu,
    negativeCount: overall.counts.neg,
    nss: overall.nss,
    byPlatform,
    bySector,
  };
}
