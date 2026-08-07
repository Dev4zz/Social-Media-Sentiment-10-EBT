import {
  Youtube,
  Instagram,
  Music2,
  Twitter,
  Newspaper,
  Atom,
  Sun,
  Recycle,
  Droplets,
  Mountain,
  Wind,
  Waves,
  Leaf,
  Sprout,
  FlaskConical,
  type LucideIcon,
} from "lucide-react";

export type PlatformSlug = "youtube" | "instagram" | "tiktok" | "twitter" | "news";

export interface Platform {
  slug: PlatformSlug;
  name: string;
  tagline: string;
  icon: LucideIcon;
  accent: string;
  /** Exact value used in the `platform` column of master_sentiment_New.csv. */
  csvValue: string;
}

export const PLATFORMS: Platform[] = [
  { slug: "youtube", name: "YouTube", tagline: "Komentar video & diskusi kreator", icon: Youtube, accent: "#FF0000", csvValue: "youtube" },
  { slug: "instagram", name: "Instagram", tagline: "Caption dan komentar publik", icon: Instagram, accent: "#E4405F", csvValue: "instagram" },
  { slug: "tiktok", name: "TikTok", tagline: "Tren video pendek & respons audiens", icon: Music2, accent: "#111111", csvValue: "tiktok" },
  { slug: "twitter", name: "Twitter (X)", tagline: "Percakapan real-time & wacana publik", icon: Twitter, accent: "#1DA1F2", csvValue: "twitter" },
  { slug: "news", name: "Berita Portal", tagline: "Pemberitaan media daring nasional", icon: Newspaper, accent: "#0F5E5C", csvValue: "portal_berita" },
];

export const PLATFORM_MAP: Record<PlatformSlug, Platform> = Object.fromEntries(
  PLATFORMS.map((p) => [p.slug, p]),
) as Record<PlatformSlug, Platform>;

// 10 sektor Energi Baru Terbarukan resmi — nilai persis sesuai kolom `sektor`
// pada master_sentiment_New.csv dan Laporan Rangkuman Eksekutif Analisis Sentimen 10 EBT.
export const SECTORS = [
  "Energi Nuklir",
  "Energi Surya",
  "PSEL",
  "Energi Air",
  "Panas Bumi",
  "Energi Bayu",
  "Energi Laut",
  "Bahan Bakar Nabati",
  "Biomassa",
  "Biogas",
] as const;
export type Sector = (typeof SECTORS)[number];

// Label ramah-baca untuk tiap sektor, dipakai di kartu, leaderboard, dan chart.
export const SECTOR_LABELS: Record<Sector, string> = {
  "Energi Nuklir": "Energi Nuklir (PLTN)",
  "Energi Surya": "Energi Surya (PLTS)",
  "PSEL": "PSEL (Sampah jadi Energi Listrik)",
  "Energi Air": "Energi Air (PLTA)",
  "Panas Bumi": "Panas Bumi (PLTP)",
  "Energi Bayu": "Energi Bayu (PLTB)",
  "Energi Laut": "Energi Laut (PLTL)",
  "Bahan Bakar Nabati": "Bahan Bakar Nabati (BBN)",
  "Biomassa": "Biomassa",
  "Biogas": "Biogas",
};

// Ikon & warna aksen per sektor — dipakai kartu sektor di hub Analisis Sentimen
// dan header dasbor /analisis/sektor/$sector.
export const SECTOR_META: Record<Sector, { icon: LucideIcon; accent: string }> = {
  "Energi Nuklir": { icon: Atom, accent: "#7C3AED" },
  "Energi Surya": { icon: Sun, accent: "#F59E0B" },
  "PSEL": { icon: Recycle, accent: "#16A34A" },
  "Energi Air": { icon: Droplets, accent: "#0EA5E9" },
  "Panas Bumi": { icon: Mountain, accent: "#B45309" },
  "Energi Bayu": { icon: Wind, accent: "#0F5E5C" },
  "Energi Laut": { icon: Waves, accent: "#0369A1" },
  "Bahan Bakar Nabati": { icon: Leaf, accent: "#65A30D" },
  "Biomassa": { icon: Sprout, accent: "#4D7C0F" },
  "Biogas": { icon: FlaskConical, accent: "#C2410C" },
};

// Rentang tanggal riil dataset (dari master_sentiment_New.csv: min(tanggal)=2026-01-30,
// max(tanggal)=2026-07-29). Dipakai sebagai batas min/max date picker dan nilai default
// "Seluruh Data" — data bersifat historis, jadi tidak dihitung relatif ke tanggal hari ini.
export const DATASET_MIN_DATE = "2026-01-30";
export const DATASET_MAX_DATE = "2026-07-29";

// Preset cepat untuk mengisi date picker (Since/Until). `days` dihitung mundur dari
// DATASET_MAX_DATE, bukan dari tanggal hari ini.
export const RANGE_PRESETS = [
  { value: "all", label: "Seluruh Data", days: null },
  { value: "3m", label: "3 Bulan Terakhir", days: 90 },
  { value: "1m", label: "1 Bulan Terakhir", days: 30 },
  { value: "1w", label: "1 Minggu Terakhir", days: 7 },
] as const;
export type RangePreset = (typeof RANGE_PRESETS)[number]["value"];
