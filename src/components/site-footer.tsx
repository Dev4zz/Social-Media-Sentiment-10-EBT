export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border/60 bg-[var(--brand-navy)] text-white/80">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-2 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p className="text-white/80">© {new Date().getFullYear()} <span className="font-semibold text-white">ECADIN</span> — Energy Academy Indonesia. Analisis sentimen untuk transisi energi Indonesia.</p>
        <p className="text-xs text-white/50">Data ditampilkan untuk keperluan demonstrasi.</p>
      </div>
    </footer>
  );
}
