import { useMemo } from "react";
import { createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { Loader2, AlertTriangle, Sparkles } from "lucide-react";
import { SECTORS, SECTOR_LABELS, SECTOR_META, PLATFORMS, DATASET_MIN_DATE, DATASET_MAX_DATE, type Sector, type PlatformSlug } from "@/lib/platforms";
import {
  useSentimentDataset,
  getSentimentData,
  getExecutiveSummaryForSector,
  getPlatformLeaderboardForSector,
  getVolumeSpikeForSector,
  FULL_RANGE,
  type DateRange,
} from "@/lib/sentiment-data";
import { getAspectAnalysisForSector } from "@/lib/aspect-analysis";
import { PlatformFilterBar } from "@/components/dashboard/PlatformFilterBar";
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

const DEFAULT_PLATFORM: PlatformSlug = "youtube";

const TABS = [
  { key: "executive", label: "Ringkasan Eksekutif" },
  { key: "leaderboard", label: "Perbandingan Platform" },
  { key: "aspects", label: "Aspek Analisis" },
  { key: "time", label: "Analisis Waktu" },
] as const;
type TabKey = (typeof TABS)[number]["key"];

const searchSchema = z.object({
  platform: fallback(z.string(), DEFAULT_PLATFORM).default(DEFAULT_PLATFORM),
  since: fallback(z.string(), DATASET_MIN_DATE).default(DATASET_MIN_DATE),
  until: fallback(z.string(), DATASET_MAX_DATE).default(DATASET_MAX_DATE),
  tab: fallback(z.string(), "executive").default("executive"),
});

const validSectors = new Set<string>(SECTORS);

export const Route = createFileRoute("/analisis/sektor/$sector")({
  validateSearch: zodValidator(searchSchema),
  beforeLoad: ({ params }) => {
    if (!validSectors.has(params.sector)) throw notFound();
  },
  head: ({ params }) => {
    const label = SECTOR_LABELS[params.sector as Sector] ?? params.sector;
    const title = `Sentimen ${label} — Ecadin Research`;
    return {
      meta: [
        { title },
        { name: "description", content: `Analisis sentimen publik terhadap sektor ${label} lintas 5 platform media, berbasis data riil master_sentiment_New.csv.` },
        { property: "og:title", content: title },
      ],
    };
  },
  component: SectorDashboard,
  notFoundComponent: () => (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center">
      <h1 className="text-2xl font-bold text-foreground">Sektor tidak ditemukan</h1>
      <p className="mt-2 text-muted-foreground">Silakan pilih salah satu sektor dari pusat analisis.</p>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center">
      <h1 className="text-2xl font-bold text-foreground">Terjadi kesalahan</h1>
      <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
    </div>
  ),
});

function SectorDashboard() {
  const { sector: sectorParam } = Route.useParams();
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const sector = sectorParam as Sector;
  const meta = SECTOR_META[sector];
  const { data: rows, isLoading, isError, error } = useSentimentDataset();

  const validPlatforms = new Set<PlatformSlug>(PLATFORMS.map((p) => p.slug));
  const platform: PlatformSlug = validPlatforms.has(search.platform as PlatformSlug) ? (search.platform as PlatformSlug) : DEFAULT_PLATFORM;
  const since = search.since >= DATASET_MIN_DATE && search.since <= DATASET_MAX_DATE ? search.since : DATASET_MIN_DATE;
  const until = search.until >= DATASET_MIN_DATE && search.until <= DATASET_MAX_DATE ? search.until : DATASET_MAX_DATE;
  const range: DateRange = since <= until ? { since, until } : FULL_RANGE;
  const tab: TabKey = TABS.some((t) => t.key === search.tab) ? (search.tab as TabKey) : "executive";

  const Icon = meta.icon;

  const setPlatform = (p: PlatformSlug) => navigate({ search: (prev: Record<string, string>) => ({ ...prev, platform: p }) });
  const setRange = (r: DateRange) => navigate({ search: (prev: Record<string, string>) => ({ ...prev, since: r.since, until: r.until }) });
  const setTab = (t: string) => navigate({ search: (prev: Record<string, string>) => ({ ...prev, tab: t }) });
  const reset = () => navigate({ search: { platform: DEFAULT_PLATFORM, since: DATASET_MIN_DATE, until: DATASET_MAX_DATE, tab } });

  // Sektor sudah tetap dari route; semua modul memecah lintas 5 platform, kebalikan dari
  // dasbor /analisis/$platform yang memecah lintas 10 sektor.
  const data = useMemo(() => (rows ? getSentimentData(rows, platform, sector, range) : null), [rows, platform, sector, range]);
  const executive = useMemo(() => (rows ? getExecutiveSummaryForSector(rows, sector, range) : null), [rows, sector, range]);
  const leaderboard = useMemo(() => (rows ? getPlatformLeaderboardForSector(rows, sector, range) : null), [rows, sector, range]);
  const spike = useMemo(() => (rows ? getVolumeSpikeForSector(rows, sector, range) : null), [rows, sector, range]);
  const aspects = useMemo(() => (rows ? getAspectAnalysisForSector(rows, sector, range) : null), [rows, sector, range]);

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
      <div className="mb-10 flex items-center gap-5">
        <div
          className="grid size-16 place-items-center rounded-2xl"
          style={{ background: `${meta.accent}15`, color: meta.accent }}
        >
          <Icon className="size-8" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{SECTOR_LABELS[sector]}</h1>
          <p className="text-sm text-muted-foreground">Analisis sentimen sektor ini lintas 5 platform media.</p>
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
              <ExecutiveSummaryCard summary={executive} scopeName={SECTOR_LABELS[sector]} />
              <VolumeSpikeAlert spike={spike} driverLabel="Platform Pendorong" />
            </div>
          )}

          {tab === "leaderboard" && (
            <SectorLeaderboard
              data={leaderboard}
              totalComments={executive.totalComments}
              groupNoun="Platform"
              groupCountLabel="5 platform media"
            />
          )}

          {tab === "aspects" && <AspectAnalysisTab data={aspects} />}

          {tab === "time" && (
            <div className="flex flex-col gap-6">
              <PlatformFilterBar platform={platform} onPlatformChange={setPlatform} />

              {data.isEmpty ? (
                <EmptyState
                  onReset={reset}
                  message={`Belum ada percakapan yang terekam untuk ${SECTOR_LABELS[sector]} di platform ini pada rentang waktu ini. Coba perluas rentang waktu atau pilih platform lain.`}
                />
              ) : (
                <div className="flex flex-col gap-8">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Menganalisis <span className="font-semibold text-foreground">{data.totalComments.toLocaleString("id-ID")}</span> komentar riil untuk{" "}
                      <span className="font-semibold text-foreground">{SECTOR_LABELS[sector]}</span> di platform terpilih (NSS {data.nss > 0 ? "+" : ""}{data.nss}).
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
