import { launch, SHOTS, BASE_URL } from './setup.mjs';

const { engine, browser } = await launch();
const context = await browser.newContext({ viewport: { width: 1280, height: 1000 } });
const page = await context.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
// Hanya error dari halaman sendiri; pesan dari iframe pihak ketiga (YouTube/Vimeo) diabaikan.
page.on('console', (m) => {
  const url = m.location()?.url || '';
  if (m.type() === 'error' && !/youtube|ytimg|vimeo|googlevideo/.test(url)) errors.push(`${m.text()} @ ${url}`);
});

const results = [];
const bail = (e) => { console.log(results.join('\n')); console.log('ERROR', e.message.split('\n')[0]); process.exit(1); };
process.on('uncaughtException', bail);
process.on('unhandledRejection', bail);
const check = (name, ok, extra = '') => results.push(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? '  -> ' + String(extra).slice(0, 300) : ''}`);
const out = () => page.$eval('input[name=content]', (i) => i.value);
const set = (html) => page.evaluate((h) => Alpine.$data(document.querySelector('.afw')).setHTML(h), html);
const wait = (ms = 150) => page.waitForTimeout(ms);
const caretEnd = async (sel = ':scope > :last-child') => {
  await page.evaluate((s) => {
    const root = document.querySelector('.afw-content');
    const el = root.querySelector(s);
    root.focus();
    const r = document.createRange();
    r.selectNodeContents(el);
    r.collapse(false);
    if (el.lastChild?.nodeName === 'BR') { r.setStartBefore(el.lastChild); r.collapse(true); }
    getSelection().removeAllRanges();
    getSelection().addRange(r);
  }, sel);
  await wait();
};
// Kursor di akhir isi kode (sebelum "\n" cadangan).
const caretEndOfCode = () => page.evaluate(() => {
  const code = document.querySelector('.afw-content pre code');
  document.querySelector('.afw-content').focus();
  const t = code.firstChild;
  const r = document.createRange();
  r.setStart(t, t.data.replace(/\n$/, '').length);
  r.collapse(true);
  getSelection().removeAllRanges();
  getSelection().addRange(r);
});

await page.goto(`${BASE_URL}/`);
await page.waitForSelector('.afw-content');
await page.evaluate(() => localStorage.clear());

// ---------- Blok kode ----------
await set('<p>Contoh:</p>');
await caretEnd();
await page.keyboard.press('Enter');
await page.keyboard.type('``` ');
await wait();
check('markdown ``` -> blok kode', await page.$eval('.afw-content', (el) => !!el.querySelector('pre > code')), await page.$eval('.afw-content', (el) => el.innerHTML));
await page.keyboard.type('function halo() {');
await page.keyboard.press('Enter');
await page.keyboard.press('Tab');
await page.keyboard.type('return 1;');
await page.keyboard.press('Enter');
await page.keyboard.type('}');
let o = await out();
check('Enter = baris baru, Tab = 2 spasi di blok kode', o === '<p>Contoh:</p><pre><code>function halo() {\n  return 1;\n}</code></pre>', JSON.stringify(o));
await page.keyboard.type(' **bukan tebal** ');
check('markdown tidak berlaku di dalam kode', (await out()).includes('} **bukan tebal** </code>'), await out());
await page.keyboard.press('Enter');
await page.keyboard.press('Enter');
await page.keyboard.type('Setelah kode');
o = await out();
check('Enter 2x di akhir keluar dari blok kode', o.endsWith('</code></pre><p>Setelah kode</p>') && !o.includes('\n</code>'), JSON.stringify(o));

await set('<pre><code>a</code></pre>');
await caretEndOfCode();
await page.keyboard.press('Shift+Tab');
// Kursor ke awal baris lewat script (di macOS tombol Home menggulir halaman di Safari/Firefox).
await page.evaluate(() => {
  const r = document.createRange();
  r.setStart(document.querySelector('.afw-content pre code').firstChild, 0);
  r.collapse(true);
  getSelection().removeAllRanges();
  getSelection().addRange(r);
});
await page.keyboard.press('Tab');
await page.keyboard.press('Tab');
await page.keyboard.press('Shift+Tab');
check('Shift+Tab mengurangi indentasi', (await out()) === '<pre><code>  a</code></pre>', JSON.stringify(await out()));

await set('<pre><code>x</code></pre>');
await caretEndOfCode();
await page.evaluate(() => {
  const ed = Alpine.$data(document.querySelector('.afw')).editor();
  ed.paste({ html: '<b>tebal</b>', text: '\nbaris <b>2</b>\n  baris 3' });
});
await wait();
check('paste di blok kode = teks apa adanya', (await out()) === '<pre><code>x\nbaris &lt;b&gt;2&lt;/b&gt;\n  baris 3</code></pre>', JSON.stringify(await out()));

await set('<pre><code>x</code></pre>');
await caretEndOfCode();
await page.keyboard.press('Backspace');
await page.keyboard.press('Backspace');
await wait();
check('Backspace di blok kode kosong -> paragraf', await page.$eval('.afw-content', (el) => !el.querySelector('pre') && !!el.querySelector('p')), await page.$eval('.afw-content', (el) => el.innerHTML));

await set('<p>baris biasa</p>');
await caretEnd();
await page.click('.afw-toolbar .afw-btn[aria-label="Blok kode"]');
check('tombol toolbar: paragraf -> kode', (await out()) === '<pre><code>baris biasa</code></pre>', await out());
check('tombol kode aktif', await page.$eval('.afw-toolbar .afw-btn[aria-label="Blok kode"]', (b) => b.classList.contains('afw-is-active')));
await page.click('.afw-toolbar .afw-btn[aria-label="Blok kode"]');
check('tombol toolbar: kode -> paragraf', (await out()) === '<p>baris biasa</p>', await out());

await set('<p>a</p>');
await caretEnd();
await page.keyboard.press('Enter');
await page.keyboard.type('/kode');
await page.keyboard.press('Enter');
await page.keyboard.type('x = 1');
check('slash "Kode"', (await out()) === '<p>a</p><pre><code>x = 1</code></pre>', await out());

await set('<pre><code>kode</code></pre>');
await page.evaluate(() => {
  const t = document.querySelector('.afw-content pre code').firstChild;
  document.querySelector('.afw-content').focus();
  const r = document.createRange();
  r.setStart(t, 0);
  r.setEnd(t, 4);
  getSelection().removeAllRanges();
  getSelection().addRange(r);
});
await wait();
check('bubble format tidak muncul di blok kode', !(await page.$eval('.afw-bubble', (b) => b.classList.contains('afw-is-ready'))));
await page.screenshot({ path: `${SHOTS}/16-kode.png`, clip: { x: 0, y: 100, width: 660, height: 400 } });

// ---------- JSON ----------
await set('<h2>Judul</h2><p>Halo <b>dunia</b></p>');
const json = await page.evaluate(() => Alpine.$data(document.querySelector('.afw')).getJSON());
check('getJSON', JSON.stringify(json.blocks) === JSON.stringify([
  { type: 'heading', level: 2, text: 'Judul', marks: [] },
  { type: 'paragraph', text: 'Halo dunia', marks: [{ type: 'bold', start: 5, end: 10 }] },
]), JSON.stringify(json));
await page.evaluate(() => Alpine.$data(document.querySelector('.afw')).setJSON({
  blocks: [{ type: 'quote', text: 'dari JSON', marks: [{ type: 'italic', start: 5, end: 9 }] }],
}));
check('setJSON', (await out()) === '<blockquote>dari <i>JSON</i></blockquote>', await out());

await page.evaluate(() => {
  const wrap = document.createElement('form');
  wrap.id = 'json-form';
  wrap.innerHTML = '<div x-data="wysiwyg({ name: \'doc\', format: \'json\', toolbar: false, stats: false })"><p>isi <b>JSON</b></p></div>';
  document.body.append(wrap);
});
await page.waitForSelector('#json-form input[name=doc]', { state: 'attached' });
await wait();
const docValue = JSON.parse(await page.$eval('#json-form input[name=doc]', (i) => i.value));
check('format: json -> input hidden berisi JSON', docValue.blocks?.[0]?.text === 'isi JSON' && docValue.blocks[0].marks[0].type === 'bold', JSON.stringify(docValue));
await page.evaluate(() => document.getElementById('json-form').remove());

// ---------- Autosave ----------
await set('<p>Draf penting</p>');
await caretEnd();
await page.keyboard.type(' yang belum disimpan');
await wait(1300);
const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('afw:draft:demo') || 'null'));
check('autosave menyimpan draf', stored?.html === '<p>Draf penting yang belum disimpan</p>', JSON.stringify(stored));

await page.reload();
await page.waitForSelector('.afw-content');
await wait(300);
check('setelah muat ulang: banner draf muncul', await page.isVisible('.afw-draft'));
check('isi editor belum diganti sebelum memilih', !(await out()).includes('Draf penting'));
await page.keyboard.type('x'); // mengetik tanpa memutuskan tidak boleh menimpa draf
await page.click('.afw-content p');
await page.keyboard.type('ketikan baru');
await wait(1300);
check('draf tidak tertimpa selama belum diputuskan', (await page.evaluate(() => JSON.parse(localStorage.getItem('afw:draft:demo')).html)) === '<p>Draf penting yang belum disimpan</p>');
await page.screenshot({ path: `${SHOTS}/17-draf.png`, clip: { x: 0, y: 100, width: 660, height: 300 } });
await page.click('.afw-draft-btn.afw-draft-primary');
await wait();
check('Pulihkan -> isi draf kembali', (await out()) === '<p>Draf penting yang belum disimpan</p>' && !(await page.isVisible('.afw-draft')), await out());
await page.keyboard.press('ControlOrMeta+z');
check('pemulihan draf bisa di-undo', (await out()) !== '<p>Draf penting yang belum disimpan</p>', await out());
await page.keyboard.press('ControlOrMeta+Shift+z');

await page.click('.demo-submit');
await wait();
check('kirim form menghapus draf', (await page.evaluate(() => localStorage.getItem('afw:draft:demo'))) === null);

await set('<p>lagi</p>');
await caretEnd();
await page.keyboard.type('!');
await wait(1300);
await page.reload();
await page.waitForSelector('.afw-content');
await wait(300);
await page.click('.afw-draft-btn:not(.afw-draft-primary)');
await wait();
check('Buang -> banner hilang, isi awal tetap', !(await page.isVisible('.afw-draft')) && (await out()).includes('Selamat datang'));
await page.reload();
await page.waitForSelector('.afw-content');
await wait(300);
check('setelah dibuang, banner tidak muncul lagi', !(await page.isVisible('.afw-draft')));

check('tidak ada error JS', errors.length === 0, errors.join(' | '));
console.log(results.join('\n'));
await browser.close();
