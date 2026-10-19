import { defineConfig } from 'vite';

// Build untuk <script> biasa / CDN: satu file berisi Tiptap & ProseMirror (Alpine tidak ikut,
// dimuat sendiri). Plugin terdaftar otomatis saat Alpine mulai, dan API ada di window.Afwrite.
//
//   <link rel="stylesheet" href=".../dist/afwrite.css">
//   <script defer src=".../dist/afwrite.min.js"></script>   <!-- sebelum Alpine -->
//   <script defer src=".../alpinejs/dist/cdn.min.js"></script>
export default defineConfig({
  build: {
    emptyOutDir: false, // jangan hapus hasil build ES (vite.config.js)
    lib: {
      entry: 'src/index.js',
      name: 'Afwrite',
      fileName: () => 'afwrite.min.js',
      cssFileName: 'afwrite',
      formats: ['iife'],
    },
    rollupOptions: {
      output: { exports: 'named' },
    },
  },
});
