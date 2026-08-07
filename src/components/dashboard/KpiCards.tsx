import { RadialBar, RadialBarChart, ResponsiveContainer, PolarAngleAxis } from "recharts";
import { SentimentFaceIcon, type SentimentKind } from "./SentimentFaceIcon";

interface Props {
  kpi: { positive: number; neutral: number; negative: number };
}

const items = [
  { key: "positive", label: "Positif", color: "var(--sentiment-positive)", sentiment: "positive" as SentimentKind },
  { key: "neutral", label: "Netral", color: "var(--sentiment-neutral)", sentiment: "neutral" as SentimentKind },
  { key: "negative", label: "Negatif", color: "var(--sentiment-negative)", sentiment: "negative" as SentimentKind },
] as const;

export function KpiCards({ kpi }: Props) {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
      {items.map(({ key, label, color, sentiment }) => {
        const value = kpi[key];
        return (
          <div
            key={key}
            className="flex items-center gap-5 rounded-2xl border border-border/70 bg-card p-7 shadow-[var(--shadow-card)] transition-shadow duration-200 hover:shadow-[var(--shadow-card-hover)]"
          >
            <div className="relative size-24 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart innerRadius="70%" outerRadius="100%" data={[{ name: label, value, fill: color }]} startAngle={90} endAngle={-270}>
                  <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                  <RadialBar background={{ fill: "var(--muted)" }} dataKey="value" cornerRadius={8} isAnimationActive={false} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 grid place-items-center">
                <span className="text-2xl font-bold tracking-tight text-foreground">{value}%</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <SentimentFaceIcon sentiment={sentiment} size={26} />
                <span className="text-sm font-semibold text-foreground">{label}</span>
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground">Distribusi sentimen keseluruhan</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
