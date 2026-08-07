import { Link } from "@tanstack/react-router";

const links: { to: string; label: string; exact?: boolean }[] = [
  { to: "/", label: "Beranda", exact: true },
  { to: "/analisis", label: "Analisis Sentimen" },
  { to: "/metodologi", label: "Metodologi" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-[#307e7c] text-white shadow-sm">
      <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex shrink-0 items-center py-2">
          <img src="/ecadin-logo.png" alt="ECADIN" className="h-8 w-auto md:h-9" />
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={{ exact: l.exact }}
              activeProps={{ className: "text-[var(--brand-lime)] bg-white/10" }}
              inactiveProps={{ className: "text-white/70 hover:text-white" }}
              className="rounded-md px-3 py-2 text-sm font-medium transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <Link
          to="/analisis"
          className="hidden rounded-md bg-[var(--brand-lime)] px-4 py-2 text-sm font-semibold text-[var(--brand-navy)] shadow-sm transition-all duration-200 ease-out hover:brightness-110 md:inline-flex"
        >
          Buka Dasbor
        </Link>
      </div>
      <div className="flex justify-center gap-1 border-t border-white/10 py-2 md:hidden">
        {links.map((l) => (
          <Link
            key={l.to}
            to={l.to}
            activeOptions={{ exact: l.exact }}
            activeProps={{ className: "text-[var(--brand-lime)]" }}
            inactiveProps={{ className: "text-white/70" }}
            className="px-2 py-1 text-xs font-medium"
          >
            {l.label}
          </Link>
        ))}
      </div>
    </header>
  );
}
