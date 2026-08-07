interface Tab {
  key: string;
  label: string;
}

interface Props {
  tabs: Tab[];
  active: string;
  onChange: (key: string) => void;
}

/** Tab navigation for the four dashboard modules on a platform page. */
export function TabNav({ tabs, active, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-1 rounded-2xl border border-border/70 bg-card p-1.5 shadow-[var(--shadow-card)]">
      {tabs.map((t) => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          className={`rounded-lg px-5 py-2.5 text-sm font-medium transition-all duration-200 ease-out ${
            active === t.key
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-secondary hover:text-foreground"
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
