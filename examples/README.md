# Contoh pemakaian tanpa Alpine

Wrapper kecil di atas `create(el, options)`. Tidak ikut paket npm; salin ke proyekmu.

- [react/Afwrite.jsx](react/Afwrite.jsx): `<Afwrite value={html} onChange={setHtml} options={{ upload }} />`
- [vue/Afwrite.vue](vue/Afwrite.vue): `<Afwrite v-model="html" :options="{ upload }" />`

Keduanya diuji dari aplikasi Vite terpisah (build produksi, Chrome/Firefox/WebKit): React
StrictMode (dipasang dua kali), nilai dari state ke editor dan sebaliknya, slash menu, serta
lepas-pasang komponen.

Opsi dibaca sekali saat komponen dipasang. Untuk mengganti opsi, pasang ulang komponennya
(mis. dengan `key` di React).
