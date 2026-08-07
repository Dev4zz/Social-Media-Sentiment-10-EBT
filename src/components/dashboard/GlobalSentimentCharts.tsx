import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { SECTOR_LABELS, type Sector } from "@/lib/platforms";
import type { GlobalSummary } from "@/lib/sentiment-data";
import { SentimentFaceIcon, type SentimentKind } from "./SentimentFaceIcon";

interface Props {
  global: GlobalSummary;
}

const DONUT_COLORS = {
  Negatif: "var(--sentiment-negative)",
  Netral: "var(--sentiment-neutral)",
  Positif: "var(--sentiment-positive)",
};

const SENTIMENT_KIND: Record<string, SentimentKind> = {
  Positif: "positive",
  Netral: "neutral",
  Negatif: "negative",
};

export function GlobalSentimentCharts({ global }: Props) {
  const donutData = [
    { name: "Negatif", value: global.negativeCount, pct: global.negative },
    { name: "Netral", value: global.neutralCount, pct: global.neutral },
    { name: "Positif", value: global.positiveCount, pct: global.positive },
  ];

  const barData = [...global.bySector]
    .sort((a, b) => b.totalComments - a.totalComments)
    .map((s) => ({ label: SECTOR_LABELS[s.sector as Sector] ?? s.sector, volume: s.totalComments }));

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="rounded-2xl border border-border/70 bg-card p-7 shadow-[var(--shadow-card)]">
        <h3 className="mb-1 text-base font-semibold text-foreground">Distribusi Sentimen Keseluruhan</h3>
        <p className="mb-4 text-xs text-muted-foreground">
          {global.totalComments.toLocaleString("id-ID")} percakapan lintas 5 platform &amp; 10 sektor EBT.
        </p>

        {/* Donut tanpa label/leader-line bawaan Recharts (rawan terpotong di dalam card) —
            total ditampilkan di tengah, rincian per kelas ditampilkan lewat legend kustom
            berikon wajah di bawah, sehingga tidak ada teks yang bisa tertutup batas kontainer. */}
        <div className="relative h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
              <Pie
                data={donutData}
                dataKey="value"
                nameKey="name"
                innerRadius="62%"
                outerRadius="92%"
                paddingAngle={2}
                isAnimationActive={false}
                stroke="var(--card)"
                strokeWidth={3}
              >
                {donutData.map((d) => (
                  <Cell key={d.name} fill={DONUT_COLORS[d.name as keyof typeof DONUT_COLORS]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number, name: string) => [`${value.toLocaleString("id-ID")} data`, name]}
                contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12, boxShadow: "var(--shadow-card-hover)", padding: "10px 14px" }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 grid place-items-center">
            <div className="text-center">
              <div className="text-2xl font-bold tracking-tight text-foreground">
                {global.totalComments.toLocaleString("id-ID")}
              </div>
              <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Percakapan</div>
            </div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
          {donutData.map((d) => (
            <div key={d.name} className="flex items-center gap-3 rounded-xl border border-border/60 bg-background p-3">
              <SentimentFaceIcon sentiment={SENTIMENT_KIND[d.name]} size={34} className="shrink-0" />
              <div className="min-w-0">
                <div className="text-sm font-bold leading-tight text-foreground">{d.pct}%</div>
                <div className="truncate text-[11px] text-muted-foreground">
                  {d.name} · {d.value.toLocaleString("id-ID")}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-border/70 bg-card p-7 shadow-[var(--shadow-card)]">
        <h3 className="mb-1 text-base font-semibold text-foreground">Volume Komentar per Sektor</h3>
        <p className="mb-4 text-xs text-muted-foreground">Jumlah percakapan riil per sektor EBT, seluruh platform.</p>
        <div style={{ height: barData.length * 34 + 20 }} className="w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} layout="vertical" margin={{ top: 0, right: 24, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="label" stroke="var(--muted-foreground)" fontSize={11} width={150} tickLine={false} axisLine={false} />
              <Tooltip
                cursor={{ fill: "var(--muted)", opacity: 0.5 }}
                formatter={(value: number) => [`${value.toLocaleString("id-ID")} komentar`, "Volume"]}
                contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12, boxShadow: "var(--shadow-card-hover)", padding: "10px 14px" }}
              />
              <Bar dataKey="volume" fill="var(--brand-blue)" radius={[0, 4, 4, 0]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
