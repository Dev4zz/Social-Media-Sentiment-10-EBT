import { createFileRoute } from "@tanstack/react-router";
import { Database, Cpu, LineChart, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/metodologi")({
  head: () => ({
    meta: [
      { title: "Metodologi — Ecadin Research" },
      { name: "description", content: "Bagaimana Ecadin Research melakukan scraping, klasifikasi AI, dan validasi data sentimen untuk sektor transisi energi." },
      { property: "og:title", content: "Metodologi Analisis Sentimen — Ecadin Research" },
    ],
  }),
  component: Methodology,
});

const steps = [
  {
    icon: Database,
    title: "1. Pengumpulan Data",
    desc: "Modul scraping mengambil komentar dan postingan publik dari YouTube, Instagram, TikTok, Twitter (X), dan portal berita nasional (18.129 baris mentah dari 5 file CSV). Teks dibersihkan (hapus newline, URL, mention, emoji, tanda baca/angka), difilter minimum 3 kata, dan disaring dengan deteksi Bahasa Indonesia sebelum deduplikasi menghasilkan 15.074 percakapan final.",
  },
  {
    icon: Cpu,
    title: "2. Klasifikasi AI",
    desc: "Setiap teks diklasifikasikan memakai model pre-trained w11wo/indonesian-roberta-base-sentiment-classifier dengan pendekatan zero-shot (tanpa fine-tuning tambahan) ke kategori positif, netral, atau negatif.",
  },
  {
    icon: ShieldCheck,
    title: "3. Validasi Manual",
    desc: "500 data diberi label manual sebagai ground truth. Terhadap label ini, model mencapai Akurasi 82,80% dan F1-macro 83,27% — cukup kuat untuk membaca kecenderungan agregat, meski kelas netral, potongan teks singkat, slang, dan homonim masih menjadi sumber utama kesalahan.",
  },
  {
    icon: LineChart,
    title: "4. Agregasi & Visualisasi",
    desc: "Hasil diagregasi per sektor, platform, dan rentang tanggal (date picker), lalu disajikan dalam dasbor interaktif dengan ringkasan eksekutif, leaderboard sektor, analisis aspek berbasis lexicon, alert lonjakan volume, dan galeri sentimen.",
  },
];

function Methodology() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <span className="text-xs font-medium uppercase tracking-wider text-primary">Metodologi</span>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        Pipeline Analisis Sentimen Ecadin
      </h1>
      <p className="mt-4 text-muted-foreground">
        Kami menggabungkan pendekatan otomatis dan pengawasan manusia untuk memastikan hasil yang akurat,
        transparan, dan dapat direplikasi.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {steps.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="rounded-2xl border border-border/70 bg-card p-7 shadow-[var(--shadow-card)]">
            <div className="mb-4 grid size-11 place-items-center rounded-lg bg-primary/10 text-primary">
              <Icon className="size-5" />
            </div>
            <h3 className="text-base font-semibold text-foreground">{title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-2xl border border-border/70 bg-secondary/40 p-7">
        <h3 className="font-semibold text-foreground">Catatan Etika Data</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Ecadin hanya mengumpulkan data yang tersedia untuk publik dan tidak menyimpan informasi pribadi
          yang dapat diidentifikasi. Semua analisis ditujukan untuk kepentingan riset kebijakan publik.
        </p>
      </div>
    </div>
  );
}
