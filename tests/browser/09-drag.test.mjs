// Pindah blok: pegangan drag (seret / klik) dan Ctrl/Cmd+Shift+Panah.
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
const wait = (ms = 120) => page.waitForTimeout(ms);

await page.goto(`${BASE_URL}/?lang=id`);
await page.waitForSelector('.afw-btn');
const ed = '.demo-panel-editor .afw';
const out = () => page.evaluate((s) => Alpine.$data(document.querySelector(s)).getHTML(), ed);
const set = (html) => page.evaluate(([s, h]) => Alpine.$data(document.querySelector(s)).setHTML(h), [ed, html]);
const box = (sel) => page.locator(`${ed} ${sel}`).first().boundingBox();
const hover = async (sel) => {
  const r = await box(sel);
  await page.mouse.move(r.x + 20, r.y + r.height / 2);
  await wait();
};
const handleVisible = () => page.locator(`${ed} .afw-handle`).isVisible();
// Seret pegangan ke titik (x, y) dengan gerakan bertahap seperti mouse sungguhan.
const dragHandleTo = async (x, y) => {
  const h = await box('.afw-handle');
  await page.mouse.move(h.x + h.width / 2, h.y + h.height / 2);
  await page.mouse.down();
  await page.mouse.move(h.x + 30, h.y - 10, { steps: 5 });
  await page.mouse.move(x, y, { steps: 12 });
  await page.mouse.up();
  await wait(250);
};

// ---------- Pegangan muncul di blok berisi ----------
await set('<p>Satu</p><p>Dua</p><h2>Tiga</h2>');
await hover('.afw-content h2');
check('pegangan tampil saat mouse di atas blok', await handleVisible());
const h = await box('.afw-handle');
const tiga = await box('.afw-content h2');
check('pegangan di kiri teks & sejajar baris', h.x + h.width <= tiga.x && Math.abs(h.y + h.height / 2 - (tiga.y + tiga.height / 2)) < 8, JSON.stringify({ h, tiga }));

// ---------- Seret ke atas ----------
const satu = await box('.afw-content p');
await dragHandleTo(satu.x + 10, satu.y + 2);
check('seret judul ke paling atas', (await out()) === '<h2>Tiga</h2><p>Satu</p><p>Dua</p>', await out());
await page.keyboard.press('ControlOrMeta+z');
await wait();
check('undo mengembalikan urutan (satu langkah)', (await out()) === '<p>Satu</p><p>Dua</p><h2>Tiga</h2>', await out());

// ---------- Seret ke bawah ----------
await hover('.afw-content p');
// Posisi jatuh mengikuti garis penanda ProseMirror; di bawah blok terakhir = paling bawah.
const tigaBox = await box('.afw-content h2');
await dragHandleTo(tigaBox.x + 10, tigaBox.y + tigaBox.height + 14);
check('seret paragraf pertama ke paling bawah', (await out()) === '<p>Dua</p><h2>Tiga</h2><p>Satu</p>', await out());

// ---------- Klik pegangan = pilih blok ----------
await set('<p>Satu</p><p>Dua</p>');
await hover('.afw-content p:nth-child(2)');
await page.click(`${ed} .afw-handle`);
await wait();
check('klik pegangan memilih blok', await page.$eval(`${ed} .afw-content p:nth-child(2)`, (p) => p.classList.contains('ProseMirror-selectednode')));
await page.keyboard.press('Backspace');
check('blok terpilih bisa dihapus', (await out()) === '<p>Satu</p>', await out());

// ---------- Keyboard ----------
await set('<p>Satu</p><p>Dua</p><p>Tiga</p>');
await page.click(`${ed} .afw-content p:nth-child(2)`);
await page.keyboard.press('ControlOrMeta+Shift+ArrowUp');
check('Ctrl/Cmd+Shift+Atas memindah blok ke atas', (await out()) === '<p>Dua</p><p>Satu</p><p>Tiga</p>', await out());
await page.keyboard.press('ControlOrMeta+Shift+ArrowDown');
await page.keyboard.press('ControlOrMeta+Shift+ArrowDown');
check('Ctrl/Cmd+Shift+Bawah dua kali', (await out()) === '<p>Satu</p><p>Tiga</p><p>Dua</p>', await out());
await page.keyboard.type('!');
check('kursor ikut blok yang dipindah', (await out()).includes('<p>Dua!</p>') || (await out()).includes('<p>!Dua</p>') || /<p>D[^<]*!/.test(await out()), await out());

// ---------- Baris kosong: tombol +, bukan pegangan ----------
// setHTML membuang paragraf kosong, jadi baris kosong dibuat dengan Enter.
await set('<p>Isi</p>');
await page.click(`${ed} .afw-content p`);
await page.keyboard.press('End');
await page.keyboard.press('Enter');
await wait(250);
await hover('.afw-content p:nth-child(2)');
check('baris kosong: pegangan tidak tampil', !(await handleVisible()));
check('baris kosong: tombol + tampil (24px)', await page.$eval(`${ed} .afw-plus`, (b) => b.classList.contains('afw-is-open') && b.offsetWidth === 24));

// ---------- Mode artikel ----------
await page.evaluate(() => {
  const host = document.createElement('div');
  host.style.width = '900px';
  host.innerHTML = '<div id="art" x-data="wysiwyg({ title: true })"><h1>Judul</h1><p>Satu</p><p>Dua</p></div>';
  document.body.prepend(host);
});
await page.waitForSelector('#art .afw-content h1');
const artBox = await page.locator('#art .afw-content h1').boundingBox();
await page.mouse.move(artBox.x + 20, artBox.y + artBox.height / 2);
await wait();
check('artikel: judul tidak punya pegangan', !(await page.locator('#art .afw-handle').isVisible()));
await page.click('#art .afw-content p');
await page.keyboard.press('ControlOrMeta+Shift+ArrowUp');
check('artikel: blok tidak bisa dipindah ke atas judul', (await page.evaluate(() => Alpine.$data(document.getElementById('art')).getHTML())) === '<h1>Judul</h1><p>Satu</p><p>Dua</p>');
await page.evaluate(() => document.getElementById('art').parentElement.remove());

// ---------- Baca saja ----------
await set('<p>Satu</p><p>Dua</p>');
await page.evaluate((s) => Alpine.$data(document.querySelector(s)).setReadOnly(true), ed);
await hover('.afw-content p');
check('baca saja: tanpa pegangan', !(await handleVisible()));
await page.evaluate((s) => Alpine.$data(document.querySelector(s)).setReadOnly(false), ed);

check('tidak ada error JS', errors.length === 0, errors.join(' | '));
console.log(results.join('\n'));
await browser.close();
