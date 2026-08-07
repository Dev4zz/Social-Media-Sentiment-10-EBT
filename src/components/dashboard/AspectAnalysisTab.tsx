import { useMemo, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { TrendingDown, TrendingUp, MessageCircle } from "lucide-react";
import { SECTORS, SECTOR_LABELS, type Sector } from "@/lib/platforms";
import type { AspectAnalysisResult, AspectExample } from "@/lib/aspect-analysis";

interface Props {
  data: AspectAnalysisResult;
}

const SENTIMENT_COLOR: Record<string, string> = {
  Positif: "var(--sentiment-positive)",
  Netral: "var(--sentiment-neutral)",
  Negatif: "var(--sentiment-negative)",
};

export function AspectAnalysisTab({ data }: Props) {
  const withMentions = data.aspects.filter((a) => a.mentions > 0);
  const hasSectorBreakdown = !!data.bySector;

  // Mode dua-tingkat (dasbor per-platform): Sektor Energi -> Aspek, karena relevansi aspek
  // berbeda-beda per sektor. Mode datar (dasbor per-sektor): sektor sudah tetap dari route,
  // jadi cukup satu dropdown Aspek langsung dari data.examplesByAspect.
  const sectorsWithAspects = useMemo(
    () => (data.bySector ? SECTORS.filter((s) => (data.bySector![s]?.aspects.filter((a) => a.mentions > 0).length ?? 0) > 0) : []),
    [data.bySector],
  );

  const [sector, setSector] = useState<Sector | "">(sectorsWithAspects[0] ?? "");
  const sectorCore = hasSectorBreakdown ? (sector ? data.bySector?.[sector as Sector] : undefined) : data;
  const sectorAspects = hasSectorBreakdown ? (sectorCore?.aspects ?? []).filter((a) => a.mentions > 0) : withMentions;

  const [aspectId, setAspectId] = useState("");
  const effectiveAspectId = aspectId && sectorAspects.some((a) => a.id === aspectId) ? aspectId : sectorAspects[0]?.id ?? "";

  const handleSectorChange = (value: string) => {
    setSector(value as Sector);
    setAspectId(""); // reset ke aspek pertama milik sektor baru
  };

  const examples: AspectExample[] = sectorCore?.examplesByAspect[effectiveAspectId] ?? [];

  if (withMentions.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border/70 bg-card p-9 text-center text-sm text-muted-foreground shadow-[var(--shadow-card)]">
        Tidak cukup data untuk mendeteksi aspek pada filter ini.
      </div>
    );
  }

  const volumeData = [...withMentions].sort((a, b) => b.mentions - a.mentions).map((a) => ({ label: a.label, mentions: a.mentions }));
  const stackedData = [...withMentions]
    .sort((a, b) => b.mentions - a.mentions)
    .map((a) => ({ label: a.label, positive: a.positive, neutral: a.neutral, negative: a.negative }));

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl border border-border/70 bg-card p-5 text-xs text-muted-foreground shadow-[var(--shadow-card)]">
        <span className="font-semibold text-foreground">Metode:</span> pendekatan lexicon Bahasa Indonesia + pemecahan
        klausa (clause-splitting), bukan model ML. Satu komentar dapat memiliki lebih dari satu aspek dengan sentimen
        berbeda-beda. Dihitung dari {data.totalRowsAnalyzed.toLocaleString("id-ID")} baris pada filter platform &amp;
        rentang waktu terpilih.
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border/70 bg-card p-7 shadow-[var(--shadow-card)]">
          <h3 className="mb-4 text-base font-semibold text-foreground">Aspek Paling Banyak Dibahas</h3>
          <div style={{ height: volumeData.length * 30 + 20 }} className="w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={volumeData} layout="vertical" margin={{ top: 0, right: 24, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="label" stroke="var(--muted-foreground)" fontSize={10.5} width={170} tickLine={false} axisLine={false} />
                <Tooltip
                  cursor={{ fill: "var(--muted)", opacity: 0.5 }}
                  formatter={(value: number) => [`${value.toLocaleString("id-ID")} mention`, "Mention"]}
                  contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12, boxShadow: "var(--shadow-card-hover)", padding: "10px 14px" }}
                />
                <Bar dataKey="mentions" fill="var(--brand-blue)" radius={[0, 4, 4, 0]} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-border/70 bg-card p-7 shadow-[var(--shadow-card)]">
          <h3 className="mb-4 text-base font-semibold text-foreground">Sentimen per Aspek (100% Stacked)</h3>
          <div style={{ height: stackedData.length * 30 + 20 }} className="w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stackedData} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} unit="%" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="label" stroke="var(--muted-foreground)" fontSize={10.5} width={170} tickLine={false} axisLine={false} />
                <Tooltip
                  cursor={{ fill: "var(--muted)", opacity: 0.5 }}
                  contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12, boxShadow: "var(--shadow-card-hover)", padding: "10px 14px" }}
                />
                <Bar dataKey="positive" name="Positif" stackId="s" fill="var(--sentiment-positive)" isAnimationActive={false} />
                <Bar dataKey="neutral" name="Netral" stackId="s" fill="var(--sentiment-neutral)" isAnimationActive={false} />
                <Bar dataKey="negative" name="Negatif" stackId="s" fill="var(--sentiment-negative)" radius={[0, 4, 4, 0]} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {data.mostNegative && (
          <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-[var(--shadow-card)]">
            <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <TrendingDown className="size-3.5 text-[var(--sentiment-negative)]" />
              Aspek Paling Negatif
            </div>
            <div className="text-xl font-bold text-foreground">{data.mostNegative.label}</div>
            <span className="mt-2 inline-block rounded-full bg-[var(--sentiment-negative)]/10 px-2.5 py-1 text-xs font-semibold text-[var(--sentiment-negative)]">
              ↑ {data.mostNegative.negative}% negatif
            </span>
          </div>
        )}
        {data.mostPositive && (
          <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-[var(--shadow-card)]">
            <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <TrendingUp className="size-3.5 text-[var(--sentiment-positive)]" />
              Aspek Paling Positif
            </div>
            <div className="text-xl font-bold text-foreground">{data.mostPositive.label}</div>
            <span className="mt-2 inline-block rounded-full bg-[var(--sentiment-positive)]/10 px-2.5 py-1 text-xs font-semibold text-[var(--sentiment-positive)]">
              ↑ {data.mostPositive.positive}% positif
            </span>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-border/70 bg-card p-7 shadow-[var(--shadow-card)]">
        <div className="mb-1 flex items-center gap-2">
          <MessageCircle className="size-4 text-primary" />
          <h3 className="text-base font-semibold text-foreground">Contoh Komentar per Aspek</h3>
        </div>
        <p className="mb-4 text-xs text-muted-foreground">
          Kutipan asli yang memicu deteksi aspek terpilih.
          {hasSectorBreakdown && " Relevansi aspek berbeda-beda per sektor, jadi pilih sektor energi terlebih dahulu."}
        </p>

        <div className={`mb-5 grid grid-cols-1 gap-3 sm:max-w-xl ${hasSectorBreakdown ? "sm:grid-cols-2" : "sm:max-w-sm"}`}>
          {hasSectorBreakdown && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground" htmlFor="sector-select">
                Pilih Sektor Energi
              </label>
              <select
                id="sector-select"
                value={sector}
                onChange={(e) => handleSectorChange(e.target.value)}
                className="rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              >
                {sectorsWithAspects.length === 0 && <option value="">Tidak ada sektor terdeteksi</option>}
                {sectorsWithAspects.map((s) => (
                  <option key={s} value={s}>
                    {SECTOR_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground" htmlFor="aspect-select">
              Pilih Aspek
            </label>
            <select
              id="aspect-select"
              value={effectiveAspectId}
              onChange={(e) => setAspectId(e.target.value)}
              disabled={sectorAspects.length === 0}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary disabled:opacity-50"
            >
              {sectorAspects.length === 0 && <option value="">Tidak ada aspek untuk sektor ini</option>}
              {sectorAspects.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.label} ({a.mentions})
                </option>
              ))}
            </select>
          </div>
        </div>

        <ul className="flex flex-col gap-3">
          {examples.length === 0 && (
            <li className="text-sm text-muted-foreground">Belum ada contoh komentar untuk kombinasi sektor &amp; aspek ini.</li>
          )}
          {examples.map((c, i) => (
            <li key={i} className="rounded-lg border border-border/60 bg-background p-4">
              <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">{c.author}</span>
                <span className="flex items-center gap-2">
                  {c.date}
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-semibold text-white"
                    style={{ background: SENTIMENT_COLOR[c.sentiment] }}
                  >
                    {c.sentiment}
                  </span>
                </span>
              </div>
              {c.title && <p className="mb-1 text-sm font-semibold text-foreground">{c.title}</p>}
              <p className="text-sm leading-relaxed text-foreground/80">{c.content}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
