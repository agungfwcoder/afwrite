import Alpine from 'alpinejs';
import wyswyg from '../src/index.js';
import './demo.css';
import { PASTE_SAMPLES } from './paste-samples.js';

const params = new URLSearchParams(location.search);
window.demoLang = params.get('lang') || 'id';

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
  lang: params.get('lang') || 'id',
  readonly: false,
  framework: 'none',
  output: '',
  submitted: null,
  samples: PASTE_SAMPLES,
  pretty,

  // Tempel contoh isi clipboard di akhir editor lewat API editor.paste(), yang menjalankan
  // aturan yang sama dengan paste sungguhan (event sintetis tidak membawa data di Firefox).
  simulatePaste(key) {
    const sample = PASTE_SAMPLES[key];
    const editor = Alpine.$data(document.querySelector('.afw')).editor();
    editor.focus();
    editor.paste({ html: sample.html || '', text: sample.text || '' });
  },


  init() {
    const render = document.querySelector('[data-demo-render]');
    this.$watch('output', (html) => {
      render.innerHTML = html || '<p class="demo-empty">Belum ada konten.</p>';
    });
    // x-ignore juga mematikan binding di elemen itu sendiri, jadi tema dipasang manual.
    this.$watch('theme', (theme) => render.setAttribute('data-afw-theme', theme));
    // Komponen editor (anak) baru siap setelah komponen demo ini selesai init.
    this.$nextTick(() => {
      this.output = Alpine.$data(document.querySelector('.afw'))?.html || '';
    });
  },

  // Bahasa editor & framework CSS hanya berlaku saat inisialisasi -> muat ulang halaman.
  reloadWith(key, value) {
    const url = new URL(location.href);
    url.searchParams.set(key, value);
    location.href = url.toString();
  },
}));

const fw = params.get('fw');
if (FRAMEWORKS[fw]) {
  const { tag, attrs } = FRAMEWORKS[fw];
  const el = Object.assign(document.createElement(tag), attrs);
  document.head.appendChild(el);
  document.addEventListener('alpine:initialized', () => {
    Alpine.$data(document.querySelector('.demo')).framework = fw;
  });
}

// Simulasi upload untuk demo: jeda 1 detik lalu kembalikan data URL.
// Di aplikasi sungguhan, kirim file ke server dan kembalikan URL-nya:
//   upload: async (file) => {
//     const body = new FormData();
//     body.append('image', file);
//     const res = await fetch('/upload', { method: 'POST', body });
//     return (await res.json()).url;
//   }
window.demoUpload = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => setTimeout(() => resolve(reader.result), 1000);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

Alpine.plugin(wyswyg);
window.Alpine = Alpine;
Alpine.start();
