import { Inbox } from "lucide-react";

interface Props {
  onReset: () => void;
  message?: string;
}

export function EmptyState({ onReset, message }: Props) {
  return (
    <div className="grid place-items-center rounded-2xl border border-dashed border-border/70 bg-card p-14 text-center shadow-[var(--shadow-card)]">
      <div className="mb-4 grid size-14 place-items-center rounded-full bg-primary/10 text-primary">
        <Inbox className="size-6" />
      </div>
      <h3 className="text-lg font-semibold text-foreground">Data Tidak Ditemukan</h3>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        {message ?? "Belum ada data sentimen untuk kombinasi filter ini. Coba perluas rentang waktu atau pilih sektor lain."}
      </p>
      <button
        onClick={onReset}
        className="mt-6 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-all duration-200 ease-out hover:bg-primary/90"
      >
        Reset Filter
      </button>
    </div>
  );
}
