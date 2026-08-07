import { CalendarRange } from "lucide-react";
import { DATASET_MIN_DATE, DATASET_MAX_DATE, RANGE_PRESETS, type RangePreset } from "@/lib/platforms";
import type { DateRange } from "@/lib/sentiment-data";

interface Props {
  range: DateRange;
  onChange: (range: DateRange) => void;
}

function subtractDays(ymd: string, days: number): string {
  const d = new Date(`${ymd}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
}

function detectPreset(range: DateRange): RangePreset | null {
  if (range.until !== DATASET_MAX_DATE) return null;
  for (const p of RANGE_PRESETS) {
    const expectedSince = p.days == null ? DATASET_MIN_DATE : subtractDays(DATASET_MAX_DATE, p.days);
    if (range.since === expectedSince) return p.value;
  }
  return null;
}

/** Filter rentang waktu berbasis date picker (Since/Until), dibatasi ke rentang tanggal riil dataset. */
export function DateRangePicker({ range, onChange }: Props) {
  const activePreset = detectPreset(range);

  const applyPreset = (value: RangePreset) => {
    const preset = RANGE_PRESETS.find((p) => p.value === value)!;
    const since = preset.days == null ? DATASET_MIN_DATE : subtractDays(DATASET_MAX_DATE, preset.days);
    onChange({ since, until: DATASET_MAX_DATE });
  };

  const setSince = (value: string) => {
    if (!value) return;
    onChange({ since: value > range.until ? range.until : value, until: range.until });
  };
  const setUntil = (value: string) => {
    if (!value) return;
    onChange({ since: range.since, until: value < range.since ? range.since : value });
  };

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-card p-5 shadow-[var(--shadow-card)]">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        <CalendarRange className="size-3.5" />
        Rentang Waktu
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          Sejak
          <input
            type="date"
            value={range.since}
            min={DATASET_MIN_DATE}
            max={range.until}
            onChange={(e) => setSince(e.target.value)}
            className="rounded-md border border-input bg-background px-2 py-1.5 text-xs text-foreground outline-none focus:border-primary"
          />
        </label>
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          Hingga
          <input
            type="date"
            value={range.until}
            min={range.since}
            max={DATASET_MAX_DATE}
            onChange={(e) => setUntil(e.target.value)}
            className="rounded-md border border-input bg-background px-2 py-1.5 text-xs text-foreground outline-none focus:border-primary"
          />
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {RANGE_PRESETS.map((p) => (
          <button
            key={p.value}
            onClick={() => applyPreset(p.value)}
            className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-all duration-200 ease-out ${
              activePreset === p.value
                ? "bg-accent text-accent-foreground shadow-sm"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/70"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
      <p className="text-[11px] text-muted-foreground">
        Data tersedia {DATASET_MIN_DATE.split("-").reverse().join("-")} s.d. {DATASET_MAX_DATE.split("-").reverse().join("-")}.
      </p>
    </div>
  );
}
