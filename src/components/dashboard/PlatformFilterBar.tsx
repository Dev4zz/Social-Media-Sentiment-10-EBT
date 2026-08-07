import { PLATFORMS, type PlatformSlug } from "@/lib/platforms";

interface Props {
  platform: PlatformSlug;
  onPlatformChange: (p: PlatformSlug) => void;
}

/** Filter platform (chip) — dipakai tab Analisis Waktu pada dasbor per-sektor. */
export function PlatformFilterBar({ platform, onPlatformChange }: Props) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-card p-5 shadow-[var(--shadow-card)]">
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">Platform</span>
        {PLATFORMS.map((p) => (
          <button
            key={p.slug}
            onClick={() => onPlatformChange(p.slug)}
            className={`rounded-full px-3.5 py-2 text-xs font-medium transition-all duration-200 ease-out ${
              p.slug === platform
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/70"
            }`}
          >
            {p.name}
          </button>
        ))}
      </div>
    </div>
  );
}
