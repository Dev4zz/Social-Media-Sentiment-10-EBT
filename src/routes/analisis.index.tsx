import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Loader2, MessageSquare, Gauge, Radio, Layers } from "lucide-react";
import { PLATFORMS, SECTORS, SECTOR_LABELS, SECTOR_META, type Sector } from "@/lib/platforms";
import { useSentimentDataset, getGlobalSummary, getGlobalMonthlyTrend, type GlobalSummary } from "@/lib/sentiment-data";
import { GlobalSentimentCharts } from "@/components/dashboard/GlobalSentimentCharts";
import { GlobalTrendChart } from "@/components/dashboard/GlobalTrendChart";
import { SentimentFaceIcon, type SentimentKind } from "@/components/dashboard/SentimentFaceIcon";

export const Route = createFileRoute("/analisis/")({
  head: () => ({
    meta: [
      { title: "Pusat Analisis Sentimen — Ecadin Research" },
      { name: "description", content: "Pilih platform media atau sektor EBT untuk melihat dasbor analisis sentimen publik, berbasis 15.074 percakapan riil." },
      { property: "og:title", content: "Pusat Analisis Sentimen — Ecadin Research" },
      { property: "og:description", content: "Dasbor sentimen per platform & per sektor energi bersih, dari data riil master_sentiment_New.csv." },
    ],
  }),
  component: Hub,
});

const SUB_TABS = [
  { key: "platform", label: "Berdasarkan Platform Media Sosial", icon: Radio },
  { key: "sektor", label: "Berdasarkan Sektor Energi", icon: Layers },
] as const;
type SubTabKey = (typeof SUB_TABS)[number]["key"];

function Hub() {
  const { data: rows, isLoading } = useSentimentDataset();
  const global = rows ? getGlobalSummary(rows) : null;
  const monthly = rows ? getGlobalMonthlyTrend(rows) : null;
  const [subTab, setSubTab] = useState<SubTabKey>("platform");

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <div className="max-w-2xl">
        <span className="text-xs font-medium uppercase tracking-wider text-primary">Sentiment Analysis Hub</span>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Pusat Analisis Sentimen</h1>
        <p className="mt-3 text-muted-foreground">
          Jelajahi dasbor sentimen khusus per platform maupun per sektor, dihitung langsung dari{" "}
          <code className="rounded bg-secondary px-1.5 py-0.5 text-xs">master_sentiment_New.csv</code>. Data mencakup 10
          sektor EBT resmi lintas 5 platform, lengkap dengan ringkasan eksekutif, perbandingan, aspek analisis, dan
          deteksi lonjakan percakapan.
        </p>
      </div>

      <div className="mt-8 rounded-2xl border border-border/70 bg-card p-7 shadow-[var(--shadow-card)]">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Ringkasan Global — Seluruh Platform &amp; Sektor
        </h2>
        {isLoading || !global ? (
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin text-primary" />
            Memuat 15.074 baris data sentimen…
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
            <GlobalStat icon={MessageSquare} label="Total Percakapan" value={global.totalComments.toLocaleString("id-ID")} color="var(--brand-blue)" />
            <GlobalStat face="positive" label="Positif" value={`${global.positive}%`} sub={`${global.positiveCount.toLocaleString("id-ID")} data`} />
            <GlobalStat face="neutral" label="Netral" value={`${global.neutral}%`} sub={`${global.neutralCount.toLocaleString("id-ID")} data`} />
            <GlobalStat face="negative" label="Negatif" value={`${global.negative}%`} sub={`${global.negativeCount.toLocaleString("id-ID")} data`} />
            <GlobalStat icon={Gauge} label="NSS Agregat" value={`${global.nss > 0 ? "+" : ""}${global.nss}`} color={global.nss >= 0 ? "var(--sentiment-positive)" : "var(--sentiment-negative)"} />
          </div>
        )}
      </div>

      {global && (
        <div className="mt-6">
          <GlobalSentimentCharts global={global} />
        </div>
      )}

      {monthly && monthly.length > 1 && (
        <div className="mt-6">
          <GlobalTrendChart monthly={monthly} />
        </div>
      )}

      <div className="mt-10">
        <div className="mb-6 inline-flex rounded-2xl border border-border/70 bg-card p-1.5 shadow-[var(--shadow-card)]">
          {SUB_TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setSubTab(key)}
              className={`flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-all duration-200 ease-out ${
                subTab === key ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="size-4" />
              {label}
            </button>
          ))}
        </div>

        {subTab === "platform" ? <PlatformCards global={global} /> : <SectorCards global={global} />}
      </div>
    </div>
  );
}

function PlatformCards({ global }: { global: GlobalSummary | null }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {PLATFORMS.map(({ slug, name, tagline, icon: Icon, accent }) => {
        const stat = global?.byPlatform.find((p) => p.platform === slug);
        return (
          <Link
            key={slug}
            to="/analisis/$platform"
            params={{ platform: slug }}
            className="group relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-border/70 bg-card p-7 shadow-[var(--shadow-card)] transition-all duration-200 ease-out hover:-translate-y-1 hover:border-primary/40 hover:shadow-[var(--shadow-card-hover)]"
          >
            <div className="grid size-12 place-items-center rounded-xl" style={{ background: `${accent}15`, color: accent }}>
              <Icon className="size-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">{name}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{tagline}</p>
            </div>
            {stat && (
              <p className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground">{stat.count.toLocaleString("id-ID")}</span> komentar ·{" "}
                {stat.negative}% negatif · NSS {stat.nss > 0 ? "+" : ""}
                {stat.nss}
              </p>
            )}
            <div className="mt-auto flex items-center gap-1 text-sm font-medium text-primary opacity-0 transition-all duration-200 ease-out group-hover:opacity-100">
              Buka dasbor <ArrowRight className="size-4" />
            </div>
          </Link>
        );
      })}
    </div>
  );
}

function SectorCards({ global }: { global: GlobalSummary | null }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {SECTORS.map((sector) => {
        const { icon: Icon, accent } = SECTOR_META[sector as Sector];
        const stat = global?.bySector.find((s) => s.sector === sector);
        return (
          <Link
            key={sector}
            to="/analisis/sektor/$sector"
            params={{ sector }}
            className="group relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-border/70 bg-card p-7 shadow-[var(--shadow-card)] transition-all duration-200 ease-out hover:-translate-y-1 hover:border-primary/40 hover:shadow-[var(--shadow-card-hover)]"
          >
            <div className="grid size-12 place-items-center rounded-xl" style={{ background: `${accent}15`, color: accent }}>
              <Icon className="size-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">{SECTOR_LABELS[sector as Sector]}</h2>
              <p className="mt-1 text-sm text-muted-foreground">Sentimen publik lintas 5 platform media.</p>
            </div>
            {stat && (
              <p className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground">{stat.totalComments.toLocaleString("id-ID")}</span> komentar ·{" "}
                {stat.negative}% negatif · NSS {stat.nss > 0 ? "+" : ""}
                {stat.nss}
              </p>
            )}
            <div className="mt-auto flex items-center gap-1 text-sm font-medium text-primary opacity-0 transition-all duration-200 ease-out group-hover:opacity-100">
              Buka dasbor <ArrowRight className="size-4" />
            </div>
          </Link>
        );
      })}
    </div>
  );
}

function GlobalStat({
  icon: Icon,
  face,
  label,
  value,
  sub,
  color,
}: {
  icon?: typeof MessageSquare;
  /** Jika diisi, render ikon wajah sentimen kustom alih-alih ikon lucide + badge warna. */
  face?: SentimentKind;
  label: string;
  value: string;
  sub?: string;
  color?: string;
}) {
  return (
    <div>
      {face ? (
        <SentimentFaceIcon sentiment={face} size={36} className="mb-2" />
      ) : (
        Icon && (
          <div className="mb-2 grid size-9 place-items-center rounded-lg" style={{ background: `${color}1A`, color }}>
            <Icon className="size-4" />
          </div>
        )
      )}
      <div className="text-xl font-bold leading-tight tracking-tight text-foreground">{value}</div>
      <div className="mt-0.5 text-xs text-muted-foreground">{label}</div>
      {sub && <div className="text-[11px] text-muted-foreground/80">{sub}</div>}
    </div>
  );
}
