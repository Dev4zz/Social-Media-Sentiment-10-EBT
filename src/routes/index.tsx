import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { ArrowRight, BarChart3, Bot, Search } from "lucide-react";
import { useSentimentDataset } from "@/lib/sentiment-data";

export const Route = createFileRoute("/")({
  component: Index,
});

const pillars = [
  {
    icon: Search,
    title: "Scraping Terstruktur",
    desc: "Pengumpulan data publik dari YouTube, Instagram, TikTok, Twitter (X), dan portal berita nasional.",
  },
  {
    icon: Bot,
    title: "Klasifikasi Berbasis AI",
    desc: "Model bahasa memilah komentar ke dalam kategori positif, netral, dan negatif dengan konteks isu energi.",
  },
  {
    icon: BarChart3,
    title: "Insight yang Actionable",
    desc: "Ringkasan otomatis, tren waktu, dan word cloud yang mempermudah pengambilan keputusan.",
  },
];

function Index() {
  const { data: rows } = useSentimentDataset();
  const totalLabel = rows ? `${rows.length.toLocaleString("id-ID")}` : "15.074";

  return (
    <div>
      <section className="relative overflow-hidden">
        {/* Foto HD, wide-angle, sekelompok orang menatap layar smartphone — representasi "masyarakat aktif di
            media sosial". Tidak ada filter blur di sini — gambar dibiarkan tajam secara natural. */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1758520388468-81e8589ed04e?auto=format&fit=crop&w=1920&q=80')" }}
          aria-hidden="true"
        />
        {/* Overlay gradasi Teal ECADIN (#307e7c) — pekat di kiri agar teks putih sangat terbaca,
            memudar jauh lebih transparan di kanan agar suasana foto asli tetap terlihat.
            Warna teal ini sengaja dibatasi hanya untuk latar Hero Section & Navbar. */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#307e7c]/95 via-[#307e7c]/70 to-[#307e7c]/10" aria-hidden="true" />
        {/* Fade halus di bawah agar transisi ke seksi putih di bawahnya tidak terlalu keras */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#307e7c]/45 via-transparent to-transparent" aria-hidden="true" />

        <div className="relative mx-auto max-w-[1600px] px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
          <div className="max-w-3xl">
            <span className="inline-flex items-center rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
              Analisis Sentimen Ecadin
            </span>
            <h1 className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Memahami Suara Publik atas <span className="text-[var(--brand-lime)]">Transisi Energi</span> Indonesia
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-white/85">
              Ecadin Research menganalisis {totalLabel} percakapan digital nyata di lima kanal media melalui pipeline
              scraping dan klasifikasi berbasis AI, memberi Anda gambaran persepsi publik terhadap kebijakan dan
              proyek 10 sektor energi baru terbarukan Indonesia. Dataset mencakup rentang waktu{" "}
              <span className="font-semibold text-white">30 Januari 2026 hingga 29 Juli 2026</span>, dengan Net
              Sentiment Score (NSS) agregat <span className="font-semibold text-white">-27,7</span>.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/analisis"
                className="inline-flex items-center gap-2 rounded-md bg-[var(--brand-lime)] px-5 py-3 text-sm font-semibold text-[var(--brand-navy)] shadow-sm transition-all duration-200 ease-out hover:brightness-110"
              >
                Buka Dasbor Sentimen <ArrowRight className="size-4" />
              </Link>
              <Link
                to="/metodologi"
                className="inline-flex items-center gap-2 rounded-md border border-white/30 bg-white/10 px-5 py-3 text-sm font-medium text-white backdrop-blur-sm transition-all duration-200 ease-out hover:bg-white/20"
              >
                Pelajari Metodologi
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1600px] px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          {pillars.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-2xl border border-border/70 bg-card p-7 shadow-[var(--shadow-card)]">
              <div className="mb-4 grid size-11 place-items-center rounded-lg bg-primary/10 text-primary">
                <Icon className="size-5" />
              </div>
              <h3 className="text-base font-semibold text-foreground">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1600px] px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-4 rounded-2xl border border-border/70 bg-card p-7 shadow-[var(--shadow-card)] md:grid-cols-4">
          {[
            { v: "5", l: "Platform Media" },
            { v: "10", l: "Sektor Energi" },
            { v: totalLabel, l: "Percakapan Riil Dianalisis" },
            { v: "-27.7", l: "NSS Agregat (Laporan)" },
          ].map((s) => (
            <div key={s.l} className="text-center">
              <div className="text-3xl font-bold text-primary">{s.v}</div>
              <div className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">{s.l}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
