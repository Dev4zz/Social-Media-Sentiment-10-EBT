import { Trophy, AlertTriangle, type LucideIcon } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import type { GroupLeaderboardData, LeaderboardEntry } from "@/lib/sentiment-data";

interface Props {
  data: GroupLeaderboardData;
  totalComments: number;
  /** "Sektor" atau "Platform" — dipakai judul & keterangan chart. */
  groupNoun: string;
  /** mis. "10 sektor EBT" atau "5 platform media". */
  groupCountLabel: string;
}

interface RankListProps {
  title: string;
  icon: LucideIcon;
  color: string;
  entries: LeaderboardEntry[];
  toneLabel: string;
}

function RankList({ title, icon: Icon, color, entries, toneLabel }: RankListProps) {
  return (
    <div className="rounded-2xl border border-border/70 bg-card p-7 shadow-[var(--shadow-card)]">
      <div className="mb-5 flex items-center gap-2">
        <Icon className="size-4" style={{ color }} />
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
      </div>
      <div className="flex flex-col gap-4">
        {entries.map((e, i) => (
          <div key={e.key} className="flex items-center gap-3.5">
            <div
              className="grid size-8 shrink-0 place-items-center rounded-full text-xs font-bold"
              style={{ background: `${color}1A`, color }}
            >
              {i + 1}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-foreground">{e.label}</span>
                <span className="font-semibold" style={{ color }}>{e.rate}%</span>
              </div>
              <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full transition-[width] duration-500 ease-out"
                  style={{ width: `${e.rate}%`, background: color }}
                />
              </div>
              <div className="mt-1.5 text-[11px] text-muted-foreground">
                {e.volume.toLocaleString("id-ID")} komentar · {toneLabel}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SectorLeaderboard({ data, totalComments, groupNoun, groupCountLabel }: Props) {
  const chartData = data.stacked;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-[var(--shadow-card)]">
          <div className="text-2xl font-bold tracking-tight text-foreground">{totalComments.toLocaleString("id-ID")}</div>
          <div className="mt-1.5 text-xs font-medium text-muted-foreground">Jumlah Absolut — total komentar seluruh {groupNoun.toLowerCase()}</div>
        </div>
        <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-[var(--shadow-card)]">
          <div className="text-2xl font-bold tracking-tight text-foreground">100%</div>
          <div className="mt-1.5 text-xs font-medium text-muted-foreground">Persentase — proporsi Positif/Netral/Negatif per {groupNoun.toLowerCase()} pada chart di bawah</div>
        </div>
        <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-[var(--shadow-card)]">
          <div className="text-2xl font-bold tracking-tight text-foreground">Rate (%)</div>
          <div className="mt-1.5 text-xs font-medium text-muted-foreground">Rate — persentase sentimen relatif terhadap total komentar {groupNoun.toLowerCase()} tsb.</div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RankList
          title={`Top 5 ${groupNoun} Paling Positif`}
          icon={Trophy}
          color="var(--sentiment-positive)"
          entries={data.topPositive}
          toneLabel="positivity rate"
        />
        <RankList
          title={`Top 5 ${groupNoun} Paling Negatif`}
          icon={AlertTriangle}
          color="var(--sentiment-negative)"
          entries={data.topNegative}
          toneLabel="negativity rate"
        />
      </div>

      <div className="rounded-2xl border border-border/70 bg-card p-7 shadow-[var(--shadow-card)]">
        <h3 className="mb-1 text-base font-semibold text-foreground">Distribusi Sentimen per {groupNoun}</h3>
        <p className="mb-4 text-xs text-muted-foreground">
          100% stacked bar — rasio Positif / Netral / Negatif di seluruh {groupCountLabel}
        </p>
        <div style={{ height: chartData.length * 42 + 20 }} className="w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} unit="%" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="label" stroke="var(--muted-foreground)" fontSize={11} width={150} tickLine={false} axisLine={false} />
              <Tooltip
                cursor={{ fill: "var(--muted)", opacity: 0.5 }}
                contentStyle={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  fontSize: 12,
                  boxShadow: "var(--shadow-card-hover)",
                  padding: "10px 14px",
                }}
              />
              <Bar dataKey="positive" name="Positif" stackId="s" fill="var(--sentiment-positive)" isAnimationActive={false} />
              <Bar dataKey="neutral" name="Netral" stackId="s" fill="var(--sentiment-neutral)" isAnimationActive={false} />
              <Bar dataKey="negative" name="Negatif" stackId="s" fill="var(--sentiment-negative)" radius={[0, 4, 4, 0]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
