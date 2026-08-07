import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import type { MonthlyPoint } from "@/lib/sentiment-data";

interface Props {
  monthly: MonthlyPoint[];
}

/** Tren sentimen bulanan gabungan seluruh platform, dipakai di halaman Pusat Analisis. */
export function GlobalTrendChart({ monthly }: Props) {
  return (
    <div className="rounded-2xl border border-border/70 bg-card p-7 shadow-[var(--shadow-card)]">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-foreground">Tren Sentimen dari Waktu ke Waktu</h3>
        <p className="text-xs text-muted-foreground">
          Persentase sentimen bulanan gabungan seluruh platform (Januari–Juli 2026). Januari dan Juli adalah bulan
          parsial pada dataset.
        </p>
      </div>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={monthly} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="label" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} unit="%" />
            <Tooltip
              cursor={{ stroke: "var(--border)", strokeWidth: 1, strokeDasharray: "3 3" }}
              contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12, boxShadow: "var(--shadow-card-hover)", padding: "10px 14px" }}
            />
            <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} iconType="circle" iconSize={8} />
            <Line type="monotone" dataKey="positive" name="Positif" stroke="var(--sentiment-positive)" strokeWidth={2.5} dot={{ r: 3, strokeWidth: 0 }} activeDot={{ r: 5, strokeWidth: 0 }} isAnimationActive={false} />
            <Line type="monotone" dataKey="neutral" name="Netral" stroke="var(--sentiment-neutral)" strokeWidth={2.5} dot={{ r: 3, strokeWidth: 0 }} activeDot={{ r: 5, strokeWidth: 0 }} isAnimationActive={false} />
            <Line type="monotone" dataKey="negative" name="Negatif" stroke="var(--sentiment-negative)" strokeWidth={2.5} dot={{ r: 3, strokeWidth: 0 }} activeDot={{ r: 5, strokeWidth: 0 }} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
