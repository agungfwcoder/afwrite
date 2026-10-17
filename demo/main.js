import Alpine from 'alpinejs';
import wyswyg from '../src/index.js';
import './demo.css';
import { PASTE_SAMPLES } from './paste-samples.js';

const FRAMEWORKS = {
  bootstrap: { tag: 'link', attrs: { rel: 'stylesheet', href: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css' } },
  tailwind: { tag: 'script', attrs: { src: 'https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4.1.11/dist/index.global.js' } },
};

// Format HTML sederhana: satu blok per baris, isi list diberi indentasi.
function pretty(html) {
  return (html || '')
    .replace(/(<\/(p|h[1-6]|blockquote|li)>)/g, '$1\n')
    .replace(/(<(ul|ol)>)/g, '$1\n')
    .replace(/(<\/(ul|ol)>)/g, '$1\n')
    .replace(/^<li>/gm, '  <li>')
    .trim();
}

Alpine.data('demo', () => ({
  theme: 'light',
  mode: 'full',
  framework: 'none',
  output: '',
  submitted: null,
  samples: PASTE_SAMPLES,
  pretty,

  // Meniru paste sungguhan: event 'paste' dengan isi clipboard, di akhir editor.
  simulatePaste(key) {
    const sample = PASTE_SAMPLES[key];
    const editor = document.querySelector('[data-afw-editor]');
    editor.focus();
    const range = document.createRange();
    range.selectNodeContents(editor);
    range.collapse(false);
    getSelection().removeAllRanges();
    getSelection().addRange(range);

    const data = new DataTransfer();
    if (sample.html) data.setData('text/html', sample.html);
    data.setData('text/plain', sample.text || '');
    editor.dispatchEvent(new ClipboardEvent('paste', { clipboardData: data, bubbles: true, cancelable: true }));
  },

  init() {
    const render = document.querySelector('[data-demo-render]');
    this.$watch('output', (html) => {
      render.innerHTML = html || '<p class="demo-empty">Belum ada konten.</p>';
    });
    // Komponen editor (anak) baru siap setelah komponen demo ini selesai init.
    this.$nextTick(() => {
      this.output = Alpine.$data(document.querySelector('.afw'))?.html || '';
    });
  },

  loadFramework() {
    // Tailwind CDN tidak bisa dilepas lagi setelah aktif, jadi halaman dimuat ulang.
    const url = new URL(location.href);
    url.searchParams.set('fw', this.framework);
    location.href = url.toString();
  },
}));

const fw = new URLSearchParams(location.search).get('fw');
if (FRAMEWORKS[fw]) {
  const { tag, attrs } = FRAMEWORKS[fw];
  const el = Object.assign(document.createElement(tag), attrs);
  document.head.appendChild(el);
  document.addEventListener('alpine:initialized', () => {
    Alpine.$data(document.querySelector('.demo')).framework = fw;
  });
}

Alpine.plugin(wyswyg);
window.Alpine = Alpine;
Alpine.start();
