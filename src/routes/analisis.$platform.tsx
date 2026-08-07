import { useMemo } from "react";
import { createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { Loader2, AlertTriangle, Sparkles } from "lucide-react";
import { PLATFORM_MAP, SECTORS, DATASET_MIN_DATE, DATASET_MAX_DATE, type PlatformSlug, type Sector } from "@/lib/platforms";
import {
  useSentimentDataset,
  getSentimentData,
  getExecutiveSummary,
  getSectorLeaderboard,
  getVolumeSpike,
  FULL_RANGE,
  type DateRange,
} from "@/lib/sentiment-data";
import { getAspectAnalysis } from "@/lib/aspect-analysis";
import { FilterBar } from "@/components/dashboard/FilterBar";
import { DateRangePicker } from "@/components/dashboard/DateRangePicker";
import { TabNav } from "@/components/dashboard/TabNav";
import { KpiCards } from "@/components/dashboard/KpiCards";
import { TrendChart } from "@/components/dashboard/TrendChart";
import { WordCloud } from "@/components/dashboard/WordCloud";
import { SentimentGallery } from "@/components/dashboard/SentimentGallery";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { ExecutiveSummaryCard } from "@/components/dashboard/ExecutiveSummaryCard";
import { SectorLeaderboard } from "@/components/dashboard/SectorLeaderboard";
import { VolumeSpikeAlert } from "@/components/dashboard/VolumeSpikeAlert";
import { AspectAnalysisTab } from "@/components/dashboard/AspectAnalysisTab";

const DEFAULT_SECTOR: Sector = "Energi Surya";

const TABS = [
  { key: "executive", label: "Ringkasan Eksekutif" },
  { key: "leaderboard", label: "Perbandingan Sektor" },
  { key: "aspects", label: "Aspek Analisis" },
  { key: "time", label: "Analisis Waktu" },
] as const;
type TabKey = (typeof TABS)[number]["key"];

const searchSchema = z.object({
  sector: fallback(z.string(), DEFAULT_SECTOR).default(DEFAULT_SECTOR),
  since: fallback(z.string(), DATASET_MIN_DATE).default(DATASET_MIN_DATE),
  until: fallback(z.string(), DATASET_MAX_DATE).default(DATASET_MAX_DATE),
  tab: fallback(z.string(), "executive").default("executive"),
});

const validPlatforms = new Set<PlatformSlug>(["youtube", "instagram", "tiktok", "twitter", "news"]);

export const Route = createFileRoute("/analisis/$platform")({
  validateSearch: zodValidator(searchSchema),
  beforeLoad: ({ params }) => {
    if (!validPlatforms.has(params.platform as PlatformSlug)) throw notFound();
  },
  head: ({ params }) => {
    const p = PLATFORM_MAP[params.platform as PlatformSlug];
    const title = p ? `Sentimen ${p.name} — Ecadin Research` : "Dasbor Sentimen — Ecadin Research";
    return {
      meta: [
        { title },
        { name: "description", content: `Analisis sentimen publik di ${p?.name ?? "platform"} untuk 10 sektor EBT Indonesia, berbasis data riil master_sentiment_New.csv.` },
        { property: "og:title", content: title },
      ],
    };
  },
  component: PlatformDashboard,
  notFoundComponent: () => (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center">
      <h1 className="text-2xl font-bold text-foreground">Platform tidak ditemukan</h1>
      <p className="mt-2 text-muted-foreground">Silakan pilih salah satu platform dari pusat analisis.</p>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center">
      <h1 className="text-2xl font-bold text-foreground">Terjadi kesalahan</h1>
      <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
    </div>
  ),
});

function PlatformDashboard() {
  const { platform } = Route.useParams();
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const p = PLATFORM_MAP[platform as PlatformSlug];
  const { data: rows, isLoading, isError, error } = useSentimentDataset();

  const sector: Sector = (SECTORS as readonly string[]).includes(search.sector) ? (search.sector as Sector) : DEFAULT_SECTOR;
  const since = search.since >= DATASET_MIN_DATE && search.since <= DATASET_MAX_DATE ? search.since : DATASET_MIN_DATE;
  const until = search.until >= DATASET_MIN_DATE && search.until <= DATASET_MAX_DATE ? search.until : DATASET_MAX_DATE;
  const range: DateRange = since <= until ? { since, until } : FULL_RANGE;
  const tab: TabKey = TABS.some((t) => t.key === search.tab) ? (search.tab as TabKey) : "executive";

  const Icon = p.icon;

  const setSector = (s: Sector) => navigate({ search: (prev: Record<string, string>) => ({ ...prev, sector: s }) });
  const setRange = (r: DateRange) => navigate({ search: (prev: Record<string, string>) => ({ ...prev, since: r.since, until: r.until }) });
  const setTab = (t: string) => navigate({ search: (prev: Record<string, string>) => ({ ...prev, tab: t }) });
  const reset = () => navigate({ search: { sector: DEFAULT_SECTOR, since: DATASET_MIN_DATE, until: DATASET_MAX_DATE, tab } });

  // Semua modul diturunkan langsung dari master_sentiment_New.csv (15.074 baris riil)
  // setelah dataset selesai dimuat & di-parse oleh PapaParse pada useSentimentDataset().
  const data = useMemo(() => (rows ? getSentimentData(rows, p.slug, sector, range) : null), [rows, p.slug, sector, range]);
  const executive = useMemo(() => (rows ? getExecutiveSummary(rows, p.slug, range) : null), [rows, p.slug, range]);
  const leaderboard = useMemo(() => (rows ? getSectorLeaderboard(rows, p.slug, range) : null), [rows, p.slug, range]);
  const spike = useMemo(() => (rows ? getVolumeSpike(rows, p.slug, range) : null), [rows, p.slug, range]);
  const aspects = useMemo(() => (rows ? getAspectAnalysis(rows, p.slug, range) : null), [rows, p.slug, range]);

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
      <div className="mb-10 flex items-center gap-5">
        <div
          className="grid size-16 place-items-center rounded-2xl"
          style={{ background: `${p.accent}15`, color: p.accent }}
        >
          <Icon className="size-8" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{p.name}</h1>
          <p className="text-sm text-muted-foreground">{p.tagline}</p>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center gap-3 rounded-2xl border border-border/70 bg-card p-7 text-sm text-muted-foreground shadow-[var(--shadow-card)]">
          <Loader2 className="size-4 animate-spin text-primary" />
          Memuat dan menganalisis master_sentiment_New.csv (15.074 baris)…
        </div>
      )}

      {isError && (
        <div className="flex items-center gap-3 rounded-2xl border border-[var(--sentiment-negative)]/30 bg-[var(--sentiment-negative)]/5 p-7 text-sm text-foreground shadow-[var(--shadow-card)]">
          <AlertTriangle className="size-4 shrink-0 text-[var(--sentiment-negative)]" />
          Gagal memuat data CSV: {error instanceof Error ? error.message : "kesalahan tidak diketahui"}.
        </div>
      )}

      {rows && data && executive && leaderboard && spike && aspects && (
        <>
          <div className="mb-8">
            <VolumeSpikeAlert spike={spike} compact />
          </div>

          <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="lg:flex-1">
              <TabNav tabs={[...TABS]} active={tab} onChange={setTab} />
            </div>
            <div className="lg:w-auto lg:min-w-[22rem]">
              <DateRangePicker range={range} onChange={setRange} />
            </div>
          </div>

          {tab === "executive" && (
            <div className="flex flex-col gap-8">
              <ExecutiveSummaryCard summary={executive} scopeName={p.name} />
              <VolumeSpikeAlert spike={spike} />
            </div>
          )}

          {tab === "leaderboard" && (
            <SectorLeaderboard
              data={leaderboard}
              totalComments={executive.totalComments}
              groupNoun="Sektor"
              groupCountLabel="10 sektor EBT"
            />
          )}

          {tab === "aspects" && <AspectAnalysisTab data={aspects} />}

          {tab === "time" && (
            <div className="flex flex-col gap-6">
              <FilterBar sector={sector} onSectorChange={setSector} />

              {data.isEmpty ? (
                <EmptyState
                  onReset={reset}
                  message={`Belum ada percakapan yang terekam untuk ${sector} di ${p.name} pada rentang waktu ini. Coba perluas rentang waktu atau pilih sektor lain.`}
                />
              ) : (
                <div className="flex flex-col gap-8">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Menganalisis <span className="font-semibold text-foreground">{data.totalComments.toLocaleString("id-ID")}</span> komentar riil untuk sektor{" "}
                      <span className="font-semibold text-foreground">{sector}</span> (NSS {data.nss > 0 ? "+" : ""}{data.nss}).
                    </p>
                  </div>

                  <KpiCards kpi={data.kpi} />

                  <TrendChart data={data.trend} />

                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
                    <div className="rounded-2xl border border-border/70 bg-card p-7 shadow-[var(--shadow-card)] lg:col-span-3">
                      <div className="mb-3 flex items-center gap-2">
                        <Sparkles className="size-4 text-primary" />
                        <h3 className="text-base font-semibold text-foreground">Ringkasan Sentimen Otomatis</h3>
                      </div>
                      <p className="text-sm leading-relaxed text-foreground/80">{data.summary}</p>
                    </div>
                    <div className="lg:col-span-2">
                      <WordCloud keywords={data.keywords} />
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-3 text-base font-semibold text-foreground">Galeri Sentimen</h3>
                    <SentimentGallery comments={data.comments} />
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
