import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.js',
      name: 'Afwrite',
      fileName: 'afwrite',
      cssFileName: 'afwrite',
      formats: ['es'],
    },
    // Tiptap/ProseMirror tetap dependency (dipasang npm), tidak ikut di-bundle.
    rollupOptions: {
      external: [/^@tiptap\//],
      output: { exports: 'named' },
    },
  },
  test: {
    environment: 'jsdom',
    include: ['tests/*.test.js'],
  },
});
