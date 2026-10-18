# Situs dokumentasi wyswyg

Dibangun dengan template [Nuxt UI Docs](https://ui.nuxt.com) (Nuxt 4 + Nuxt Content, lisensi MIT,
lihat `LICENSE`). Demo editor di dalam halaman memakai source library langsung dari `../src`.

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # build produksi (.output), halaman di-prerender
npm run preview
```

- Halaman: `content/` (Markdown + komponen MDC). Urutan mengikuti awalan angka nama file/folder.
- Editor yang bisa dicoba: komponen `::editor-demo` (`app/components/content/WyswygDemo.vue`),
  dengan prop `options`, `content`, dan `output`.
- Identitas situs (judul, warna, tautan): `app/app.config.ts`.
