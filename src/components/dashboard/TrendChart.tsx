import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend } from "recharts";

interface Props {
  data: { date: string; positive: number; neutral: number; negative: number }[];
}

export function TrendChart({ data }: Props) {
  return (
    <div className="rounded-2xl border border-border/70 bg-card p-7 shadow-[var(--shadow-card)]">
      <div className="mb-5 flex items-baseline justify-between">
        <div>
          <h3 className="text-base font-semibold text-foreground">Tren Sentimen</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">Pergerakan persentase sentimen selama periode terpilih</p>
        </div>
      </div>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} unit="%" />
            <Tooltip
              cursor={{ stroke: "var(--border)", strokeWidth: 1, strokeDasharray: "3 3" }}
              contentStyle={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                fontSize: 12,
                boxShadow: "var(--shadow-card-hover)",
                padding: "10px 14px",
              }}
            />
            <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} iconType="circle" iconSize={8} />
            <Line
              type="monotone"
              dataKey="positive"
              name="Positif"
              stroke="var(--sentiment-positive)"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5, strokeWidth: 0 }}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="neutral"
              name="Netral"
              stroke="var(--sentiment-neutral)"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5, strokeWidth: 0 }}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="negative"
              name="Negatif"
              stroke="var(--sentiment-negative)"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5, strokeWidth: 0 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
