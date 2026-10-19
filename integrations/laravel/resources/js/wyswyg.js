// resources/js/app.js (atau impor file ini dari sana)
import Alpine from 'alpinejs';
import afwrite from 'afwrite';
import 'afwrite/style.css';

// Fungsi upload untuk <x-wysiwyg upload-url="...">: kirim file ke controller Laravel
// beserta token CSRF, lalu kembalikan URL gambar.
window.wyswygUpload = (url) => async (file) => {
  const body = new FormData();
  body.append('image', file);

  const response = await fetch(url, {
    method: 'POST',
    body,
    headers: {
      Accept: 'application/json',
      'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content ?? '',
    },
  });
  if (!response.ok) throw new Error(`Upload gagal (${response.status})`);
  return (await response.json()).url;
};

Alpine.plugin(afwrite);
window.Alpine = Alpine;
Alpine.start();
