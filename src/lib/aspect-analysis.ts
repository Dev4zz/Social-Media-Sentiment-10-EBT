import { filterByPlatform, filterByDateRange, truncate, formatDateID, splitTitleAndBody, type SentimentRow, type DateRange } from "./sentiment-data";
import { SECTORS, type PlatformSlug, type Sector } from "./platforms";

// ---------------------------------------------------------------------------
// Aspect-Based Sentiment Analysis — pendekatan lexicon Bahasa Indonesia +
// pemecahan klausa (clause-splitting), BUKAN model ML. Satu komentar bisa
// memiliki lebih dari satu aspek dengan sentimen berbeda-beda, karena setiap
// klausa dinilai secara independen terhadap leksikon polaritas di bawah.
// Metodologi ini meniru dashboard Streamlit lama (`Aspect Analysis`) dan
// dijalankan di sisi klien atas kolom `text_clean` (sudah lowercase & tanpa
// tanda baca) — lihat README untuk keterbatasannya.
// ---------------------------------------------------------------------------

export interface AspectDef {
  id: string;
  label: string;
  keywords: string[];
}

export const ASPECTS: AspectDef[] = [
  {
    id: "manfaat_lingkungan_emisi",
    label: "Manfaat Lingkungan & Emisi",
    keywords: ["emisi", "karbon", "net zero", "ramah lingkungan", "energi bersih", "lingkungan hidup", "hijau", "dekarbonisasi"],
  },
  {
    id: "kebijakan_regulasi",
    label: "Kebijakan & Regulasi",
    keywords: ["kebijakan", "regulasi", "peraturan", "undang undang", "permen", "perpres", "kepmen", "kementerian esdm", "pemerintah"],
  },
  {
    id: "teknologi_pembangkit",
    label: "Teknologi Pembangkit",
    keywords: ["teknologi", "turbin", "panel surya", "reaktor", "smr", "pltn", "pltp", "plta", "pltb", "pltu", "megawatt", "kapasitas terpasang"],
  },
  {
    id: "efektivitas_operasional",
    label: "Efektivitas Operasional",
    keywords: ["efisiensi", "operasional", "kapasitas produksi", "performa", "kinerja", "produktivitas", "target produksi"],
  },
  {
    id: "transisi_energi",
    label: "Transisi Energi",
    keywords: ["transisi energi", "bauran energi", "net zero emission", "energi terbarukan", "diversifikasi energi", "kemandirian energi"],
  },
  {
    id: "biaya_investasi_tarif",
    label: "Biaya, Investasi & Tarif",
    keywords: ["biaya", "investasi", "tarif", "harga listrik", "subsidi", "pendanaan", "anggaran", "triliun", "miliar", "pinjaman"],
  },
  {
    id: "pencemaran_kerusakan_lingkungan",
    label: "Pencemaran & Kerusakan Lingkungan",
    keywords: ["pencemaran", "limbah", "kerusakan lingkungan", "polusi", "tercemar", "deforestasi", "longsor", "banjir"],
  },
  {
    id: "transparansi",
    label: "Transparansi",
    keywords: ["transparansi", "transparan", "akuntabilitas", "keterbukaan informasi", "tidak jelas", "disembunyikan"],
  },
  {
    id: "keandalan_listrik",
    label: "Keandalan Listrik",
    keywords: ["byar pet", "padam", "pemadaman", "keandalan", "stabilitas listrik", "gangguan listrik", "blackout", "listrik mati"],
  },
  {
    id: "sosialisasi_edukasi",
    label: "Sosialisasi & Edukasi",
    keywords: ["sosialisasi", "edukasi", "penyuluhan", "pelatihan", "kampanye", "pemahaman masyarakat", "literasi energi"],
  },
  {
    id: "konflik_penolakan_warga",
    label: "Konflik & Penolakan Warga",
    keywords: ["tolak", "penolakan", "demo", "protes", "unjuk rasa", "konflik", "warga menolak", "aksi warga"],
  },
  {
    id: "pembebasan_lahan",
    label: "Pembebasan Lahan",
    keywords: ["pembebasan lahan", "ganti rugi", "tanah warga", "sengketa lahan", "penggusuran", "lahan warga"],
  },
  {
    id: "penerimaan_warga",
    label: "Penerimaan Warga",
    keywords: ["dukungan warga", "apresiasi warga", "antusias warga", "warga mendukung", "masyarakat menyambut"],
  },
];

const POSITIVE_WORDS = [
  "bagus", "baik", "mendukung", "dukungan", "apresiasi", "positif", "untung", "manfaat", "hemat",
  "canggih", "inovatif", "aman", "adil", "sukses", "berhasil", "bersih", "murah", "cepat", "efisien",
  "maju", "bangga", "senang", "terima kasih", "luar biasa", "hebat", "keren", "mantap", "optimis",
  "menguntungkan", "meningkat", "membaik", "lancar",
];

const NEGATIVE_WORDS = [
  "buruk", "rusak", "tercemar", "mahal", "korupsi", "gagal", "bahaya", "berbahaya", "resah", "marah",
  "tolak", "menolak", "protes", "rugi", "kerugian", "lambat", "curang", "minim", "kurang", "konflik",
  "masalah", "kecewa", "khawatir", "was was", "ancaman", "darurat", "krisis", "sengketa", "penipuan",
  "parah", "hancur", "memburuk", "menyesatkan", "menderita",
];

/** Kata penanda batas klausa (konjungsi/diskursus) — dipakai karena text_clean sudah tanpa tanda baca. */
const CLAUSE_MARKERS = new Set([
  "tapi", "namun", "tetapi", "meski", "meskipun", "walau", "walaupun", "sedangkan", "padahal",
  "karena", "sehingga", "akibatnya", "selain", "akan",
]);

const MAX_TOKENS_PER_ROW = 300;

function splitClauses(textClean: string): string[] {
  const tokens = textClean.split(/\s+/).slice(0, MAX_TOKENS_PER_ROW);
  const clauses: string[][] = [[]];
  for (const tok of tokens) {
    if (CLAUSE_MARKERS.has(tok) && clauses[clauses.length - 1].length > 2) {
      clauses.push([]);
    } else {
      clauses[clauses.length - 1].push(tok);
    }
  }
  return clauses.filter((c) => c.length >= 2).map((c) => c.join(" "));
}

function clauseSentiment(clauseText: string): "Positif" | "Netral" | "Negatif" {
  let score = 0;
  for (const w of POSITIVE_WORDS) if (clauseText.includes(w)) score++;
  for (const w of NEGATIVE_WORDS) if (clauseText.includes(w)) score--;
  if (score > 0) return "Positif";
  if (score < 0) return "Negatif";
  return "Netral";
}

export interface AspectStat {
  id: string;
  label: string;
  mentions: number;
  positive: number; // persen
  neutral: number;
  negative: number;
  positiveCount: number;
  neutralCount: number;
  negativeCount: number;
}

export interface AspectExample {
  content: string;
  title?: string;
  author: string;
  date: string;
  sentiment: "Positif" | "Netral" | "Negatif";
}

export interface AspectAnalysisCore {
  aspects: AspectStat[];
  mostPositive: AspectStat | null;
  mostNegative: AspectStat | null;
  examplesByAspect: Record<string, AspectExample[]>;
  totalRowsAnalyzed: number;
}

export interface AspectAnalysisResult extends AspectAnalysisCore {
  /** Hanya diisi oleh getAspectAnalysis() — pemecahan per sektor untuk dropdown "Contoh Komentar per Aspek". */
  bySector?: Partial<Record<Sector, AspectAnalysisCore>>;
}

const EMPTY_CORE: AspectAnalysisCore = {
  aspects: [],
  mostPositive: null,
  mostNegative: null,
  examplesByAspect: {},
  totalRowsAnalyzed: 0,
};

/** Inti perhitungan aspek — beroperasi pada baris yang SUDAH difilter (platform/sektor/rentang tanggal). */
function computeAspectCore(rangeRows: SentimentRow[]): AspectAnalysisCore {
  if (rangeRows.length === 0) return EMPTY_CORE;

  const counts = new Map<string, { pos: number; neu: number; neg: number }>();
  const examples = new Map<string, { row: SentimentRow; clause: string; sentiment: "Positif" | "Netral" | "Negatif" }[]>();
  for (const a of ASPECTS) {
    counts.set(a.id, { pos: 0, neu: 0, neg: 0 });
    examples.set(a.id, []);
  }

  for (const row of rangeRows) {
    if (!row.textClean) continue;
    const clauses = splitClauses(row.textClean);
    for (const clause of clauses) {
      const matched = ASPECTS.filter((a) => a.keywords.some((kw) => clause.includes(kw)));
      if (matched.length === 0) continue;
      const sentiment = clauseSentiment(clause);
      for (const aspect of matched) {
        const c = counts.get(aspect.id)!;
        if (sentiment === "Positif") c.pos++;
        else if (sentiment === "Negatif") c.neg++;
        else c.neu++;

        const bucket = examples.get(aspect.id)!;
        if (bucket.length < 12) bucket.push({ row, clause, sentiment });
      }
    }
  }

  const aspects: AspectStat[] = ASPECTS.map((a) => {
    const c = counts.get(a.id)!;
    const mentions = c.pos + c.neu + c.neg;
    const positive = mentions ? Math.round((c.pos / mentions) * 100) : 0;
    const negative = mentions ? Math.round((c.neg / mentions) * 100) : 0;
    const neutral = mentions ? 100 - positive - negative : 0;
    return {
      id: a.id,
      label: a.label,
      mentions,
      positive,
      neutral,
      negative,
      positiveCount: c.pos,
      neutralCount: c.neu,
      negativeCount: c.neg,
    };
  }).sort((a, b) => b.mentions - a.mentions);

  const withMentions = aspects.filter((a) => a.mentions > 0);
  const mostPositive = withMentions.length ? withMentions.reduce((a, b) => (b.positive > a.positive ? b : a)) : null;
  const mostNegative = withMentions.length ? withMentions.reduce((a, b) => (b.negative > a.negative ? b : a)) : null;

  const examplesByAspect: Record<string, AspectExample[]> = {};
  for (const a of ASPECTS) {
    const bucket = examples.get(a.id)!;
    const deduped = bucket
      .sort((x, y) => (y.row.date?.getTime() ?? 0) - (x.row.date?.getTime() ?? 0))
      .slice(0, 6)
      .map(({ row, sentiment }) => {
        const { title, body } = splitTitleAndBody(row.text);
        return {
          content: truncate(body, 260),
          title,
          author: row.sumber || "Anonim",
          date: row.tanggal ? formatDateID(row.tanggal) : "-",
          sentiment,
        };
      });
    examplesByAspect[a.id] = deduped;
  }

  return { aspects, mostPositive, mostNegative, examplesByAspect, totalRowsAnalyzed: rangeRows.length };
}

/**
 * Dipakai dasbor per-platform (tab "Aspek Analisis"). Grafik & kartu indikator tetap lintas-sektor
 * (agregat seluruh sektor di platform ini), tapi `bySector` memecah aspek + contoh komentar per
 * sektor EBT — dipakai dropdown dua tingkat "Pilih Sektor Energi" → "Pilih Aspek".
 */
export function getAspectAnalysis(rows: SentimentRow[], platformSlug: PlatformSlug, range: DateRange): AspectAnalysisResult {
  const platformRows = filterByPlatform(rows, platformSlug);
  const rangeRows = filterByDateRange(platformRows, range);
  const core = computeAspectCore(rangeRows);
  if (rangeRows.length === 0) return core;

  const bySector: Partial<Record<Sector, AspectAnalysisCore>> = {};
  for (const sector of SECTORS) {
    const sectorRows = rangeRows.filter((r) => r.sektor === sector);
    if (sectorRows.length === 0) continue;
    bySector[sector] = computeAspectCore(sectorRows);
  }

  return { ...core, bySector };
}

/** Dipakai dasbor per-sektor (tab "Aspek Analisis") — sektor sudah tetap, jadi cukup satu dropdown aspek. */
export function getAspectAnalysisForSector(rows: SentimentRow[], sector: Sector, range: DateRange): AspectAnalysisCore {
  const sectorRows = rows.filter((r) => r.sektor === sector);
  const rangeRows = filterByDateRange(sectorRows, range);
  return computeAspectCore(rangeRows);
}
