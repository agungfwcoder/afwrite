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
  host.innerHTML = '<div id="art" x-data="wysiwyg({ name: \'artikel\', title: true })"></div>';
  document.body.prepend(host);
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
check('label Judul di margin (editor lebar)', await page.$eval(`${editor} h1`, (h) => getComputedStyle(h, '::after').content.includes('Judul')));
check('output kosong', (await out()) === '');

// ---------- Mengetik judul, Enter ke isi ----------
await page.click(`${editor} h1`);
await page.keyboard.type('Judul cerita');
await wait();
check('tebal tidak berlaku di judul', await disabled('Tebal'));
await page.keyboard.press('ControlOrMeta+b');
await page.keyboard.press('Enter');
await page.keyboard.type('Ringkasan singkat');
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
