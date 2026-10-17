import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.js',
      name: 'Wyswyg',
      fileName: 'wyswyg',
      cssFileName: 'wyswyg',
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
    exclude: ['tests/browser/**', 'node_modules/**'],
  },
});
