/**
 * Ikon wajah sentimen kustom (flat design, SVG murni — bukan emoji bawaan OS/keyboard).
 * Dipakai di legend Donut Chart "Distribusi Sentimen Keseluruhan", KpiCards, dan
 * ringkasan global di Pusat Analisis, agar identitas visual Positif/Netral/Negatif
 * konsisten di seluruh dasbor.
 */
export type SentimentKind = "positive" | "neutral" | "negative";

interface Props {
  sentiment: SentimentKind;
  /** Ukuran lingkaran ikon dalam px. */
  size?: number;
  className?: string;
}

const STYLE: Record<SentimentKind, { bg: string; fg: string; ring?: string }> = {
  // Positif: wajah tersenyum di atas lingkaran hijau solid ECADIN.
  // Hijau terang ini kontrasnya rendah terhadap putih, jadi wajah digambar biru tua ECADIN
  // (masih dari palet resmi) agar tetap jelas dan justru menggemakan gradasi hijau→biru logo.
  positive: { bg: "var(--sentiment-positive)", fg: "var(--brand-navy)" },
  // Netral: wajah datar di atas lingkaran abu-abu terang/putih, wajah digambar abu-abu medium
  // agar tetap kontras terhadap lingkaran yang terang.
  neutral: { bg: "#E7E9EC", fg: "var(--sentiment-neutral)", ring: "var(--border)" },
  // Negatif: wajah marah di atas lingkaran merah solid.
  negative: { bg: "var(--sentiment-negative)", fg: "#ffffff" },
};

export function SentimentFaceIcon({ sentiment, size = 32, className }: Props) {
  const { bg, fg, ring } = STYLE[sentiment];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      className={className}
      role="img"
      aria-label={
        sentiment === "positive" ? "Sentimen positif" : sentiment === "neutral" ? "Sentimen netral" : "Sentimen negatif"
      }
    >
      <circle cx="20" cy="20" r="19" fill={bg} stroke={ring ?? "none"} strokeWidth={ring ? 1 : 0} />

      {sentiment === "positive" && (
        <g>
          <circle cx="14" cy="17.5" r="2.1" fill={fg} />
          <circle cx="26" cy="17.5" r="2.1" fill={fg} />
          <path
            d="M12 23.5c2.2 3.4 5.5 5.3 8 5.3s5.8-1.9 8-5.3"
            fill="none"
            stroke={fg}
            strokeWidth="2.4"
            strokeLinecap="round"
          />
        </g>
      )}

      {sentiment === "neutral" && (
        <g>
          <circle cx="14" cy="17.5" r="2.1" fill={fg} />
          <circle cx="26" cy="17.5" r="2.1" fill={fg} />
          <line x1="12.5" y1="26" x2="27.5" y2="26" stroke={fg} strokeWidth="2.4" strokeLinecap="round" />
        </g>
      )}

      {sentiment === "negative" && (
        <g>
          <circle cx="14" cy="19" r="2.1" fill={fg} />
          <circle cx="26" cy="19" r="2.1" fill={fg} />
          <path d="M10.5 14.5l6 2.6" stroke={fg} strokeWidth="2.2" strokeLinecap="round" />
          <path d="M29.5 14.5l-6 2.6" stroke={fg} strokeWidth="2.2" strokeLinecap="round" />
          <path
            d="M12 28.5c2.2-3.4 5.5-5.3 8-5.3s5.8 1.9 8 5.3"
            fill="none"
            stroke={fg}
            strokeWidth="2.4"
            strokeLinecap="round"
          />
        </g>
      )}
    </svg>
  );
}
