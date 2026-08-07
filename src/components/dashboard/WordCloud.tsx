interface Props {
  keywords: { text: string; weight: number }[];
}

export function WordCloud({ keywords }: Props) {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-border/70 bg-card p-7 shadow-[var(--shadow-card)]">
      <h3 className="text-base font-semibold text-foreground">WordCloud</h3>
      <p className="mb-4 text-xs text-muted-foreground">Kata kunci yang paling sering muncul dalam percakapan.</p>
      <div className="flex flex-1 flex-wrap items-center justify-center gap-x-3 gap-y-2 py-2">
        {keywords.map((k, i) => {
          const size = 0.85 + k.weight * 1.1;
          const tone = i % 3 === 0 ? "text-primary" : i % 3 === 1 ? "text-accent" : "text-foreground/70";
          return (
            <span
              key={k.text}
              className={`font-semibold leading-none ${tone}`}
              style={{ fontSize: `${size}rem`, opacity: 0.55 + k.weight * 0.45 }}
            >
              {k.text}
            </span>
          );
        })}
      </div>
    </div>
  );
}
