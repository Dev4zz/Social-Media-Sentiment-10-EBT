import type { Comment } from "@/lib/sentiment-data";

interface Props {
  comments: { positive: Comment[]; neutral: Comment[]; negative: Comment[] };
}

const columns = [
  { key: "positive", label: "Positif", color: "var(--sentiment-positive)" },
  { key: "neutral", label: "Netral", color: "var(--sentiment-neutral)" },
  { key: "negative", label: "Negatif", color: "var(--sentiment-negative)" },
] as const;

export function SentimentGallery({ comments }: Props) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {columns.map(({ key, label, color }) => (
        <div key={key} className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-card p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between border-b border-border/60 pb-2">
            <h4 className="text-sm font-semibold text-foreground">{label}</h4>
            <span className="size-2 rounded-full" style={{ background: color }} />
          </div>
          <div className="flex flex-col gap-2">
            {comments[key].length === 0 && (
              <p className="rounded-lg border border-dashed border-border/60 p-3 text-xs text-muted-foreground">
                Tidak ada komentar {label.toLowerCase()} pada filter ini.
              </p>
            )}
            {comments[key].map((c, i) => (
              <div key={i} className="rounded-lg border border-border/50 bg-background p-3.5">
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-medium text-foreground">{c.author}</span>
                  <span className="text-muted-foreground">{c.date}</span>
                </div>
                {c.title && <p className="mb-1 text-xs font-semibold text-foreground/90">{c.title}</p>}
                <p className="text-sm leading-relaxed text-foreground/90">{c.text}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
