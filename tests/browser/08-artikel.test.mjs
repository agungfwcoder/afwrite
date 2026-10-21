// Opsi `title`: mode artikel ala Medium (judul <h1> + subjudul lewat tombol judul kecil).
import { launch, BASE_URL } from './setup.mjs';

const { browser } = await launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));

const results = [];
const bail = (e) => { console.log(results.join('\n')); console.log('ERROR', e.message.split('\n')[0]); process.exit(1); };
process.on('uncaughtException', bail);
process.on('unhandledRejection', bail);
const check = (name, ok, extra = '') => results.push(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? '  -> ' + extra : ''}`);
const wait = (ms = 150) => page.waitForTimeout(ms);

await page.goto(`${BASE_URL}/`);
await page.waitForSelector('.afw-btn');
await page.evaluate(() => {
  const host = document.createElement('div');
  host.style.width = '900px';
  host.innerHTML = '<div id="art" x-data="wysiwyg({ name: \'artikel\', lang: \'id\', title: true, titleName: \'judul\' })"></div>';
  document.body.prepend(host);
  // Catat detail event perubahan terakhir.
  host.addEventListener('wysiwyg-change', (e) => (window.__lastChange = e.detail));
});
await page.waitForSelector('#art .afw-content h1');
// Label di margin dipasang satu frame setelah ukuran editor diketahui.
await page.waitForSelector('#art .afw-content[data-afw-wide]');
const out = () => page.evaluate(() => Alpine.$data(document.getElementById('art')).getHTML());
const editor = '#art .afw-content';
const set = (html) => page.evaluate((h) => Alpine.$data(document.getElementById('art')).setHTML(h), html);
const disabled = (label) => page.$eval(`#art .afw-toolbar .afw-btn[aria-label="${label}"]`, (b) => b.getAttribute('aria-disabled') === 'true');
const blocks = () => page.$$eval(`${editor} > *`, (els) => els.map((e) => e.tagName.toLowerCase() + (e.className.includes('afw-subtitle') ? '.sub' : '')));

// ---------- Awal: judul kosong + placeholder ----------
let b = await blocks();
check('awal: judul <h1> + paragraf', b[0] === 'h1' && b[1] === 'p', JSON.stringify(b));
check('placeholder judul', await page.$eval(`${editor} h1`, (h) => h.classList.contains('afw-is-empty') && getComputedStyle(h, '::before').content.includes('Judul')));
check('judul kosong: tanpa label', await page.$eval(`${editor} h1`, (h) => getComputedStyle(h, '::after').content === 'none'));
check('output kosong', (await out()) === '');

// ---------- Mengetik judul, Enter ke isi ----------
await page.click(`${editor} h1`);
await page.keyboard.type('Judul cerita');
await wait();
check('label Judul tampil setelah ada tulisan (editor lebar)', await page.$eval(`${editor} h1`, (h) => getComputedStyle(h, '::after').content.includes('Judul')));
check('tebal tidak berlaku di judul', await disabled('Tebal'));
await page.keyboard.press('ControlOrMeta+b');
await page.keyboard.press('Enter');
await page.keyboard.type('Ringkasan singkat');
const last = await page.evaluate(() => window.__lastChange);
check('event wysiwyg-change membawa meta (judul & slug)', last?.meta?.title === 'Judul cerita' && last.meta.slug === 'judul-cerita' && typeof last.html === 'string', JSON.stringify(last?.meta));
check('opsi titleName: input hidden berisi judul', (await page.$eval('input[name=judul]', (i) => i.value)) === 'Judul cerita');
check('Enter dari judul -> paragraf di bawahnya', (await out()) === '<h1>Judul cerita</h1><p>Ringkasan singkat</p>', await out());

// ---------- t kecil (Subjudul) di baris tepat setelah judul = subjudul ----------
await page.click('#art .afw-toolbar .afw-btn[aria-label="Subjudul"]');
check('t kecil -> subjudul', (await out()) === '<h1>Judul cerita</h1><p class="afw-subtitle">Ringkasan singkat</p>', await out());
await wait();
check('tombol Subjudul aktif', await page.$eval('#art .afw-toolbar .afw-btn[aria-label="Subjudul"]', (x) => x.classList.contains('afw-is-active')));
check('tebal redup di subjudul', await disabled('Tebal'));
check('link tetap bisa di subjudul', !(await disabled('Link')));
check('label Subjudul', await page.$eval(`${editor} .afw-subtitle`, (p) => getComputedStyle(p, '::after').content.includes('Subjudul')));

await page.keyboard.press('Enter');
await page.keyboard.type('Isi tulisan.');
await page.keyboard.press('Enter');
await page.keyboard.type('Bagian lain');
await page.click('#art .afw-toolbar .afw-btn[aria-label="Subjudul"]');
check('t kecil di tempat lain = judul bagian biasa', (await out()).endsWith('<h3>Bagian lain</h3>'), await out());

// Klik t kecil lagi di subjudul -> kembali paragraf.
await page.click(`${editor} .afw-subtitle`);
await page.click('#art .afw-toolbar .afw-btn[aria-label="Subjudul"]');
check('t kecil lagi -> paragraf', (await out()).startsWith('<h1>Judul cerita</h1><p>Ringkasan singkat</p>'), await out());

// ---------- Subjudul tanpa Enter: baris di bawah judul adalah satu-satunya isi ----------
await set('<h1>Judul</h1><p>sub</p>');
await page.click(`${editor} p`);
await page.click('#art .afw-toolbar .afw-btn[aria-label="Subjudul"]');
check('t kecil di satu-satunya baris isi -> subjudul', (await out()) === '<h1>Judul</h1><p class="afw-subtitle">sub</p>', await out());
check('paragraf isi kosong disediakan di bawahnya', (await blocks()).join() === 'h1,p.sub,p', (await blocks()).join());
await set('<h1>Judul</h1>');
await page.click(`${editor} p`);
await page.click('#art .afw-toolbar .afw-btn[aria-label="Subjudul"]');
await page.keyboard.type('Ringkas');
check('t kecil di baris kosong lalu mengetik', (await out()) === '<h1>Judul</h1><p class="afw-subtitle">Ringkas</p>', await out());

// ---------- Backspace ----------
await set('<h1>Judul</h1><p class="afw-subtitle">Sub</p><p>Isi</p>');
await page.click(`${editor} .afw-subtitle`);
// Awal baris: di macOS tombol Home tidak memindahkan kursor (Firefox/Safari), pakai Cmd+Panah kiri.
await page.keyboard.press(process.platform === 'darwin' ? 'Meta+ArrowLeft' : 'Home');
await page.keyboard.press('Backspace');
check('Backspace di awal subjudul -> gabung ke judul', (await out()) === '<h1>JudulSub</h1><p>Isi</p>', await out());

// ---------- Paste beberapa baris ke judul ----------
await set('<h1></h1><p>Isi lama</p>');
await page.click(`${editor} h1`);
await page.evaluate(() => Alpine.$data(document.getElementById('art')).editor().paste({ text: 'Baris judul\nParagraf satu\nParagraf dua' }));
check('paste multi-baris: baris pertama judul, sisanya isi', (await out()) === '<h1>Baris judul</h1><p>Paragraf satu<br>Paragraf dua</p><p>Isi lama</p>', await out());

// ---------- setHTML & JSON ----------
await set('<h1>A</h1><p class="afw-subtitle">B <b>tebal</b></p><h1>C</h1><p class="afw-subtitle">D</p>');
check('setHTML: h1 kedua -> h2, subjudul di tempat lain -> p, format dibuang', (await out()) === '<h1>A</h1><p class="afw-subtitle">B tebal</p><h2>C</h2><p>D</p>', await out());
await set('<p>Tanpa judul</p>');
b = await blocks();
check('konten tanpa h1: judul kosong ditambahkan', b[0] === 'h1' && (await out()) === '<p>Tanpa judul</p>', JSON.stringify(b) + ' ' + (await out()));
await set('<h1>J</h1><p>x</p>');
const json = await page.evaluate(() => Alpine.$data(document.getElementById('art')).getJSON());
check('getJSON: node title', json.content[0].type === 'title' && json.content[0].content[0].text === 'J', JSON.stringify(json.content[0]));
check('input hidden ikut', (await page.$eval('input[name=artikel]', (i) => i.value)) === '<h1>J</h1><p>x</p>');

// ---------- Gambar/video/pemisah di atas judul (gambar pertama = gambar utama) ----------
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
const plusOpen = () => page.$eval('#art .afw-plus', (b) => b.classList.contains('afw-is-open'));
await set('<p>Isi</p>');
await page.click(`${editor} h1`);
await wait();
check('judul kosong: tombol + tampil', await plusOpen());
await page.click('#art .afw-plus');
await page.waitForSelector('#art .afw-menu.afw-is-open');
const [chooser] = await Promise.all([page.waitForEvent('filechooser'), page.click('#art .afw-menu.afw-is-open [role=option]:has-text("Gambar")')]);
await chooser.setFiles({ name: 'a.png', mimeType: 'image/png', buffer: PNG });
await page.waitForFunction(() => document.querySelector('#art .afw-content > figure img[src^="data:"]'));
await page.keyboard.type('Judul');
b = await blocks();
check('gambar dari judul -> gambar utama di atas judul, kursor tetap di judul', b.join() === 'figure,h1,p' && /^<figure><img src="data:image\/png[^"]*" alt=""><\/figure><h1>Judul<\/h1><p>Isi<\/p>$/.test(await out()), b.join() + ' ' + (await out()).slice(-60));
for (let i = 0; i < 'Judul'.length; i++) await page.keyboard.press('Backspace');
await wait();
check('judul dikosongkan, gambar utama tetap', (await blocks()).join() === 'figure,h1,p', (await blocks()).join());
check('judul kosong lagi: + tetap tampil', await plusOpen());
// "/" di judul: slash menu hanya berisi blok non-teks.
await page.keyboard.type('/');
await wait();
const items = await page.$$eval('#art .afw-menu.afw-is-open [role=option]', (els) => els.map((e) => e.textContent.trim()));
check('slash di judul: hanya gambar, video, pemisah', items.length === 3 && !items.some((t) => /Paragraf|Kutipan|Kode/.test(t)), JSON.stringify(items));
await page.keyboard.type('pemisah');
await page.keyboard.press('Enter');
await wait();
check('pemisah dari judul dipasang di atas judul', (await blocks()).join() === 'figure,hr,h1,p', (await blocks()).join());
await page.keyboard.type('X');
check('kursor tetap di judul', (await out()).includes('<hr><h1>X</h1>'), await out());
await page.keyboard.press('Backspace');
await page.keyboard.press('ArrowUp');
await page.keyboard.press('Enter');
await wait();
check('Enter di pemisah atas judul -> ke judul, bukan paragraf baru', (await blocks()).join() === 'figure,hr,h1,p', (await blocks()).join());
let meta = await page.evaluate(() => Alpine.$data(document.getElementById('art')).getMeta());
check('getMeta: judul kosong -> teks pertama', meta.image?.src.startsWith('data:image/png') && meta.title === 'Isi' && meta.subtitle === '', JSON.stringify({ ...meta, image: !!meta.image }));

await set('<figure><img src="https://example.com/a.png" alt="A"><figcaption>Foto</figcaption></figure><h1>J</h1><p class="afw-subtitle">S</p><p>x</p>');
check('setHTML: gambar + judul dipertahankan', (await blocks()).join() === 'figure,h1,p.sub,p', (await blocks()).join());
check('setHTML: kursor di judul, bukan keterangan gambar', !(await page.$('#art .afw-is-editing')));
meta = await page.evaluate(() => Alpine.$data(document.getElementById('art')).getMeta());
check('getMeta: gambar, judul, subjudul', JSON.stringify(meta) === JSON.stringify({ image: { src: 'https://example.com/a.png', alt: 'A', caption: 'Foto', mediaId: null }, title: 'J', subtitle: 'S', slug: 'j' }), JSON.stringify(meta));
await set('<figure><img src="https://example.com/a.png" alt=""></figure><p>x</p>');
check('gambar tanpa judul sesudahnya tetap isi biasa', (await blocks()).join() === 'h1,figure,p', (await blocks()).join());

// ---------- Editor biasa tidak terpengaruh ----------
await page.evaluate(() => Alpine.$data(document.querySelector('.demo-panel-editor .afw')).setHTML('<h1>A</h1><p class="afw-subtitle">B</p>'));
const demo = await page.evaluate(() => Alpine.$data(document.querySelector('.demo-panel-editor .afw')).getHTML());
check('tanpa opsi title: h1 -> h2, class subjudul dibuang', demo === '<h2>A</h2><p>B</p>', demo);

// ---------- Editor sempit: label disembunyikan ----------
await page.evaluate(() => (document.getElementById('art').parentElement.style.width = '420px'));
await wait(300);
check('editor sempit: tanpa label', await page.$eval(`${editor} h1`, (h) => getComputedStyle(h, '::after').content === 'none'));

check('tidak ada error JS', errors.length === 0, errors.join(' | '));
console.log(results.join('\n'));
await browser.close();
