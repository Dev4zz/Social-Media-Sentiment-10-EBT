import { MessageSquare, Flame, TrendingUp, TrendingDown, CalendarRange, Sparkles, Gauge } from "lucide-react";
import type { ExecutiveSummary } from "@/lib/sentiment-data";

interface Props {
  summary: ExecutiveSummary;
  /** Nama platform atau label sektor yang sedang dianalisis, dipakai judul kartu. */
  scopeName: string;
}

export function ExecutiveSummaryCard({ summary, scopeName }: Props) {
  const cards = [
    {
      icon: MessageSquare,
      label: "Total Percakapan Dianalisis",
      value: summary.totalComments.toLocaleString("id-ID"),
      color: "var(--brand-blue)",
    },
    {
      icon: Flame,
      label: summary.mostActiveGroupDimension,
      value: summary.mostActiveGroupLabel,
      sub: `${summary.mostActiveGroupVolume.toLocaleString("id-ID")} komentar`,
      color: "var(--brand-orange)",
    },
    {
      icon: TrendingUp,
      label: "Global Positivity Rate",
      value: `${summary.globalPositivity}%`,
      color: "var(--sentiment-positive)",
    },
    {
      icon: TrendingDown,
      label: "Global Negativity Rate",
      value: `${summary.globalNegativity}%`,
      color: "var(--sentiment-negative)",
    },
    {
      icon: Gauge,
      label: "Net Sentiment Score (NSS)",
      value: `${summary.globalNSS > 0 ? "+" : ""}${summary.globalNSS}`,
      color: summary.globalNSS >= 0 ? "var(--sentiment-positive)" : "var(--sentiment-negative)",
    },
    {
      icon: CalendarRange,
      label: "Rentang Data",
      value: summary.dateRangeLabel,
      color: "var(--brand-teal)",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[var(--brand-navy)] p-7 text-white shadow-[var(--shadow-card)] sm:p-9">
        <span className="text-xs font-medium uppercase tracking-wider text-[var(--brand-lime)]">Executive Deck</span>
        <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
          Ringkasan Eksekutif — {scopeName}
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-white/70">
          Rangkuman sentimen publik lintas 10 sektor Energi Baru Terbarukan, disusun otomatis untuk kebutuhan
          pengambilan keputusan Dirjen EBTKE.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {cards.map(({ icon: Icon, label, value, sub, color }) => (
          <div
            key={label}
            className="rounded-2xl border border-border/70 bg-card p-6 shadow-[var(--shadow-card)] transition-shadow duration-200 hover:shadow-[var(--shadow-card-hover)]"
          >
            <div className="mb-4 grid size-10 place-items-center rounded-lg" style={{ background: `${color}1A`, color }}>
              <Icon className="size-5" />
            </div>
            <div className="text-2xl font-bold leading-tight tracking-tight text-foreground">{value}</div>
            <div className="mt-1.5 text-xs font-medium text-muted-foreground">{label}</div>
            {sub && <div className="mt-0.5 text-[11px] text-muted-foreground/70">{sub}</div>}
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border/70 bg-card p-7 shadow-[var(--shadow-card)]">
        <div className="mb-5 flex items-center gap-2">
          <Sparkles className="size-4 text-primary" />
          <h3 className="text-base font-semibold text-foreground">Executive Insights</h3>
        </div>
        <ul className="flex flex-col gap-4">
          {summary.insights.map((insight, i) => (
            <li key={i} className="flex gap-3 text-sm leading-relaxed text-foreground/85">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
              <span>{insight}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
