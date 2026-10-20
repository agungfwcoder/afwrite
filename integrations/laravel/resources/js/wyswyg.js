// resources/js/wyswyg.js: impor dari resources/js/app.js.
//
// Laravel + Alpine dari npm (tanpa Livewire):
//
//   import Alpine from 'alpinejs';
//   import './wyswyg';
//   window.Alpine = Alpine;
//   Alpine.start();
//
// Livewire 3/4: Alpine sudah dibawa dan dijalankan Livewire. JANGAN impor alpinejs atau memanggil
// Alpine.start() (dua Alpine akan bentrok); cukup `import './wyswyg';`. afwrite mendaftarkan
// dirinya sendiri saat event alpine:init.
import 'afwrite';
import 'afwrite/style.css';

// Fungsi upload untuk <x-wysiwyg upload-url="...">: kirim file ke controller Laravel beserta token
// CSRF. Respons { url, mediaId? }: mediaId (ID media library) disimpan sebagai data-media-id pada
// <img>. Nama field bisa diganti, mis. window.wyswygUpload(url, { field: 'file' }).
window.wyswygUpload = (url, { field = 'image' } = {}) => async (file) => {
  const body = new FormData();
  body.append(field, file);

  const response = await fetch(url, {
    method: 'POST',
    body,
    headers: {
      Accept: 'application/json',
      'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content ?? '',
    },
  });
  if (!response.ok) throw new Error(`Upload gagal (${response.status})`);
  const data = await response.json();
  return { url: data.url, mediaId: data.mediaId ?? data.media_id ?? null };
};
