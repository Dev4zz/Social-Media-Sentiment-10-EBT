import { AlertTriangle, TrendingUp, ShieldCheck } from "lucide-react";
import type { SpikeInfo } from "@/lib/sentiment-data";

interface Props {
  spike: SpikeInfo;
  /** Compact = slim top-of-page banner. Full = detailed card used in the Executive Overview tab. */
  compact?: boolean;
  /** "Sektor Pendorong" atau "Platform Pendorong" — dipakai kartu detail. */
  driverLabel?: string;
}

export function VolumeSpikeAlert({ spike, compact = false, driverLabel = "Sektor Pendorong" }: Props) {
  if (!spike.hasSpike) {
    if (compact) return null;
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-border/70 bg-card p-5 text-sm text-muted-foreground shadow-[var(--shadow-card)]">
        <ShieldCheck className="size-4 shrink-0 text-[var(--sentiment-positive)]" />
        Tidak ada lonjakan volume percakapan yang signifikan pada rentang waktu ini.
      </div>
    );
  }

  const isHigh = spike.severity === "high";
  const badgeColor = isHigh ? "var(--sentiment-negative)" : "var(--brand-orange)";
  const badgeLabel = isHigh ? "High Impact" : "Anomaly Warning";

  if (compact) {
    return (
      <div
        className="flex flex-wrap items-center gap-3 rounded-2xl border p-4 text-sm shadow-[var(--shadow-card)]"
        style={{ borderColor: `${badgeColor}55`, background: `${badgeColor}0D` }}
      >
        <AlertTriangle className="size-4 shrink-0" style={{ color: badgeColor }} />
        <span className="font-medium text-foreground">
          +{spike.ratioPercent}% anomaly volume spike detected
        </span>
        <span className="text-muted-foreground">
          · {spike.groupLabel} · {spike.topic} · {spike.date}
        </span>
        <span
          className="ml-auto rounded-full px-2.5 py-1 text-[11px] font-semibold text-white"
          style={{ background: badgeColor }}
        >
          {badgeLabel}
        </span>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border p-7 shadow-[var(--shadow-card)]" style={{ borderColor: `${badgeColor}55`, background: `${badgeColor}0D` }}>
      <div className="flex items-start gap-4">
        <div className="grid size-11 shrink-0 place-items-center rounded-xl" style={{ background: `${badgeColor}22`, color: badgeColor }}>
          <TrendingUp className="size-5" />
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold text-foreground">Lonjakan Volume Percakapan Terdeteksi</h3>
            <span className="rounded-full px-2.5 py-1 text-[11px] font-semibold text-white" style={{ background: badgeColor }}>
              {badgeLabel}
            </span>
          </div>
          <p className="mt-2 text-sm text-foreground/80">
            Sistem mendeteksi kenaikan volume percakapan sebesar{" "}
            <span className="font-semibold" style={{ color: badgeColor }}>+{spike.ratioPercent}%</span> dibanding
            rata-rata tren 2 minggu terakhir, pada tanggal <span className="font-medium">{spike.date}</span>.
          </p>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-border/60 bg-card p-3">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{driverLabel}</div>
              <div className="mt-1 text-sm font-semibold text-foreground">{spike.groupLabel}</div>
            </div>
            <div className="rounded-lg border border-border/60 bg-card p-3">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Topik Utama</div>
              <div className="mt-1 text-sm font-semibold text-foreground">{spike.topic}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
