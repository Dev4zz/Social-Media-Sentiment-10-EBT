// Standalone replacement for the Lovable-provided error page renderer.
// Returns a minimal, dependency-free HTML fallback page used when SSR fails.
export function renderErrorPage(): string {
  return `<!doctype html>
<html lang="id">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Terjadi Kesalahan — Ecadin Research</title>
    <style>
      body {
        margin: 0;
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Inter, sans-serif;
        background: #0f1b3d;
        color: #ffffff;
        text-align: center;
        padding: 24px;
      }
      .card { max-width: 420px; }
      h1 { font-size: 24px; margin-bottom: 8px; }
      p { color: rgba(255, 255, 255, 0.7); font-size: 14px; }
      a {
        display: inline-block;
        margin-top: 20px;
        padding: 10px 20px;
        border-radius: 8px;
        background: #a3e635;
        color: #0f1b3d;
        text-decoration: none;
        font-weight: 600;
        font-size: 14px;
      }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>Halaman ini gagal dimuat</h1>
      <p>Terjadi kesalahan pada server. Silakan coba muat ulang halaman.</p>
      <a href="/">Kembali ke Beranda</a>
    </div>
  </body>
</html>`;
}
