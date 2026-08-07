import { SECTORS, type Sector } from "@/lib/platforms";

interface Props {
  sector: Sector;
  onSectorChange: (s: Sector) => void;
}

/** Filter sektor (chip). Rentang waktu kini dikontrol lewat DateRangePicker di level halaman. */
export function FilterBar({ sector, onSectorChange }: Props) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-card p-5 shadow-[var(--shadow-card)]">
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">Sektor</span>
        {SECTORS.map((s) => (
          <button
            key={s}
            onClick={() => onSectorChange(s)}
            className={`rounded-full px-3.5 py-2 text-xs font-medium transition-all duration-200 ease-out ${
              s === sector
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/70"
            }`}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
