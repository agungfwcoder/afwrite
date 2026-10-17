const ALLOWED_SCHEMES = ['http', 'https', 'mailto', 'tel'];

// Mengembalikan URL yang aman dipakai di href, atau null jika ditolak.
//   "example.com"          -> "https://example.com"
//   "/halaman", "#bagian"  -> apa adanya
//   "javascript:...", "data:..." (termasuk varian "java\tscript:") -> null
export function normalizeUrl(input) {
  const url = String(input ?? '').trim();
  if (!url) return null;

  // Browser mengabaikan karakter kontrol & spasi saat membaca skema, jadi dibuang dulu.
  const compact = url.replace(/[\u0000- \u007f-\u009f]/g, '').toLowerCase();
  const scheme = compact.match(/^([a-z][a-z0-9+.-]*):/);

  // "localhost:3000" atau "example.com:8080/x" adalah host:port, bukan skema.
  const isHostPort = scheme && /^[a-z0-9.-]+:\d/.test(compact);

  if (scheme && !isHostPort) {
    return ALLOWED_SCHEMES.includes(scheme[1]) ? url : null;
  }
  if (/^(\/|#|\?|\.)/.test(url)) return url;
  return `https://${url}`;
}
