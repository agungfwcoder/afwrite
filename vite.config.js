import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.js',
      name: 'Wyswyg',
      fileName: 'wyswyg',
      cssFileName: 'wyswyg',
      formats: ['es', 'umd'],
    },
    rollupOptions: {
      output: { exports: 'named' },
    },
  },
  test: {
    environment: 'jsdom',
  },
});
