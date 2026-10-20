# Kebijakan Keamanan

> **English:** please report vulnerabilities privately via
> [Report a vulnerability](https://github.com/agungfwcoder/afwrite/security/advisories/new), not in a public issue.

## Versi yang didukung

| Versi | Didukung |
| ----- | -------- |
| v2 (checkpoint terbaru) | ✅ |
| v1 | ❌ |

Perbaikan keamanan hanya dirilis sebagai checkpoint v2 terbaru. Jika memakai CDN `@2` atau
`github:agungfwcoder/afwrite#semver:^2`, perbaikan ikut terambil otomatis.

## Melaporkan celah keamanan

**Jangan** laporkan lewat Issue publik. Gunakan tombol
[Report a vulnerability](https://github.com/agungfwcoder/afwrite/security/advisories/new)
di tab **Security** repo ini; laporan hanya terlihat oleh pengelola.

Sertakan jika bisa:

- versi atau commit yang dipakai, serta browser;
- langkah atau HTML/JSON minimal untuk mereproduksi;
- dampaknya (mis. script berjalan, data bocor).

Perkiraan waktu (proyek dikelola satu orang, jadi bisa lebih lama):

- konfirmasi laporan diterima: dalam 7 hari;
- perbaikan untuk masalah yang terkonfirmasi: secepatnya, lalu diumumkan lewat
  [security advisory](https://github.com/agungfwcoder/afwrite/security/advisories) setelah checkpoint
  perbaikan rilis.

## Cakupan

Yang termasuk:

- XSS atau HTML berbahaya yang lolos dari sanitasi editor (paste, drop, `setHTML`, `setJSON`, embed);
- whitelist server bawaan (`WyswygHtml::clean()` / HTMLPurifier di `integrations/laravel`) yang
  meloloskan tag, atribut, atau URL berbahaya.

Yang tidak termasuk:

- aplikasi yang menyimpan atau menampilkan HTML dari editor **tanpa** sanitasi di server. Sanitasi di
  browser hanya untuk kenyamanan; data dari klien selalu bisa dipalsukan, jadi server wajib
  membersihkannya (lihat `integrations/laravel` dan halaman Keamanan di dokumentasi);
- celah di dependency (Tiptap, ProseMirror, Alpine.js): laporkan ke proyek aslinya.
