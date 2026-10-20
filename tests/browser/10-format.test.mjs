// Format tambahan (garis bawah, coret, warna, stabilo, perataan), data-media-id, opsi extensions,
// dark mode lewat class .dark, watcher x-model yang dinormalisasi, dan buat-hapus berulang.
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

await page.goto(`${BASE_URL}/`);
await page.waitForSelector('.afw-btn');

// Editor uji di halaman demo. `options` berupa teks JS (boleh berisi fungsi).
async function mount(id, options = '{}', content = '<p>x</p>', wrapper = (editor) => editor, attrs = '') {
  const html = wrapper(`<div id="${id}" ${attrs} x-data="wysiwyg(${options})">${content}</div>`);
  await page.evaluate(({ id, html }) => {
    document.getElementById(`${id}-host`)?.remove();
    const host = document.createElement('div');
    host.id = `${id}-host`;
    host.innerHTML = html;
    document.body.append(host);
  }, { id, html });
  await page.waitForSelector(`#${id} .afw-content`);
}
const data = (id) => `Alpine.$data(document.getElementById('${id}'))`;
const out = (id) => page.evaluate(`${data(id)}.getHTML()`);
const set = async (id, html) => {
  await page.evaluate(`${data(id)}.setHTML(${JSON.stringify(html)})`);
  await page.click(`#${id} .afw-content`);
};
const labels = (sel) => page.$$eval(sel, (els) => els.filter((b) => b.offsetParent !== null || b.closest('.afw-bubble')).map((b) => b.getAttribute('aria-label')));

// Blok teks: dari offset `start` sampai `end` di node teks pertama blok ke-`index`.
async function select(id, index, start, end) {
  await page.evaluate(({ id, index, start, end }) => {
    const block = document.querySelectorAll(`#${id} .afw-content > *`)[index];
    const walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT);
    const text = walker.nextNode();
    const range = document.createRange();
    range.setStart(text, start);
    range.setEnd(text, end);
    getSelection().removeAllRanges();
    getSelection().addRange(range);
  }, { id, index, start, end });
  await wait(200);
}

// ---------- Lengkap (bawaan) ----------
await mount('lengkap', "{ name: 'lengkap' }");
const toolbar = await labels('#lengkap .afw-toolbar .afw-btn');
check('Lengkap: toolbar berisi garis bawah, coret, warna, perataan',
  ['Garis bawah', 'Coret', 'Warna & stabilo', 'Perataan'].every((l) => toolbar.includes(l)), JSON.stringify(toolbar));
const bubbleFull = await labels('#lengkap .afw-bubble:not(.afw-mediabar):not(.afw-pop) .afw-bubble-row:first-child .afw-btn');
check('Lengkap: bubble berisi garis bawah, warna, perataan',
  ['Garis bawah', 'Warna & stabilo', 'Perataan'].every((l) => bubbleFull.includes(l)), JSON.stringify(bubbleFull));

// ---------- Sederhana (bubble saja) ----------
await mount('sederhana', "{ toolbar: false, stats: false }");
const bubbleSimple = await labels('#sederhana .afw-bubble:not(.afw-mediabar):not(.afw-pop) .afw-bubble-row:first-child .afw-btn');
check('Sederhana: bubble berisi garis bawah, warna, perataan',
  ['Garis bawah', 'Warna & stabilo', 'Perataan'].every((l) => bubbleSimple.includes(l)), JSON.stringify(bubbleSimple));

// ---------- Ala Medium: tidak berubah ----------
await mount('medium', "{ title: true, toolbar: false, stats: false }", '<h1>Judul</h1><p>Isi tulisan</p>');
const bubbleMedium = await labels('#medium .afw-bubble:not(.afw-mediabar):not(.afw-pop) .afw-bubble-row:first-child .afw-btn');
check('Ala Medium: bubble sama seperti sebelumnya', JSON.stringify(bubbleMedium) === JSON.stringify(['Tebal', 'Miring', 'Link', 'Judul', 'Subjudul', 'Kutipan']), JSON.stringify(bubbleMedium));
check('Ala Medium: tidak ada palet', !(await page.$$eval('#medium .afw-swatch', (els) => els.length)));
await select('medium', 1, 0, 3);
await page.keyboard.press('ControlOrMeta+u');
await page.keyboard.press('ControlOrMeta+Shift+KeyE');
check('Ala Medium: Ctrl+U & Ctrl+Shift+E tidak menambah format', (await out('medium')) === '<h1>Judul</h1><p>Isi tulisan</p>', await out('medium'));
await set('medium', '<h1>Judul</h1><p class="afw-align-center"><u>Isi</u> <mark>x</mark></p>');
check('Ala Medium: format dari luar dibuang (tetap polos)', (await out('medium')) === '<h1>Judul</h1><p>Isi x</p>', await out('medium'));

// ---------- Shortcut ----------
await set('lengkap', '<p>satu dua tiga</p>');
await select('lengkap', 0, 0, 4);
await page.keyboard.press('ControlOrMeta+u');
check('Ctrl/Cmd+U -> <u>', (await out('lengkap')) === '<p><u>satu</u> dua tiga</p>', await out('lengkap'));
check('tombol garis bawah aktif', await page.$eval('#lengkap .afw-toolbar .afw-btn[aria-label="Garis bawah"]', (b) => b.classList.contains('afw-is-active')));
await select('lengkap', 0, 0, 4);
await page.keyboard.press('ControlOrMeta+u');
await select('lengkap', 0, 5, 8);
await page.keyboard.press('ControlOrMeta+Shift+KeyX');
check('Ctrl/Cmd+Shift+X -> <s>', (await out('lengkap')) === '<p>satu <s>dua</s> tiga</p>', await out('lengkap'));
await page.keyboard.press('ControlOrMeta+Shift+KeyE');
check('Ctrl/Cmd+Shift+E -> rata tengah', (await out('lengkap')) === '<p class="afw-align-center">satu <s>dua</s> tiga</p>', await out('lengkap'));
await page.keyboard.press('ControlOrMeta+Shift+KeyL');
check('Ctrl/Cmd+Shift+L -> kembali rata kiri', (await out('lengkap')) === '<p>satu <s>dua</s> tiga</p>', await out('lengkap'));

// ---------- Palet warna dari bubble ----------
await set('lengkap', '<p>satu dua tiga</p>');
await select('lengkap', 0, 5, 8);
await page.click('#lengkap .afw-bubble .afw-btn[aria-label="Warna & stabilo"]');
await wait(200);
const popOpen = () => page.$eval('#lengkap .afw-pop', (el) => el.classList.contains('afw-is-ready'));
check('palet warna terbuka', await popOpen());
const popPos = await page.evaluate(() => {
  const pop = document.querySelector('#lengkap .afw-pop').getBoundingClientRect();
  const bubble = document.querySelector('#lengkap .afw-bubble').getBoundingClientRect();
  return { popBottom: pop.bottom, bubbleTop: bubble.top };
});
check('palet di atas bubble (tidak menutupi seleksi)', popPos.popBottom <= popPos.bubbleTop, JSON.stringify(popPos));
check('palet: 7 warna teks + 5 stabilo', (await page.$$eval('#lengkap .afw-swatch:not(.afw-swatch-none)', (els) => els.length)) === 12);
await page.click('#lengkap .afw-swatch-color[title="#e11d48"]');
await wait();
check('warna teks diterapkan', (await out('lengkap')) === '<p>satu <span style="color: #e11d48">dua</span> tiga</p>', await out('lengkap'));
check('palet tertutup setelah memilih', !(await popOpen()));
check('seleksi tetap (bubble masih tampil)', await page.$eval('#lengkap .afw-bubble', (el) => el.classList.contains('afw-is-open')));
await page.click('#lengkap .afw-bubble .afw-btn[aria-label="Warna & stabilo"]');
await wait(200);
check('warna aktif ditandai di palet', await page.$eval('#lengkap .afw-swatch-color[title="#e11d48"]', (b) => b.classList.contains('afw-is-active')),
  JSON.stringify(await page.evaluate(`({ values: ${data('lengkap')}.values, fv: ${data('lengkap')}.editor().formatValues(), sel: getSelection().toString() })`)));
await page.click('#lengkap .afw-swatch-highlight[title="#fef08a"]');
await wait();
check('stabilo diterapkan', (await out('lengkap')) === '<p>satu <span style="color: #e11d48"><mark style="background-color: #fef08a">dua</mark></span> tiga</p>', await out('lengkap'));
await page.click('#lengkap .afw-bubble .afw-btn[aria-label="Warna & stabilo"]');
await wait(200);
await page.click('#lengkap .afw-swatch-none[title="Warna bawaan"]');
await page.click('#lengkap .afw-bubble .afw-btn[aria-label="Warna & stabilo"]');
await wait(200);
await page.click('#lengkap .afw-swatch-none[title="Tanpa stabilo"]');
await wait();
check('hapus warna & stabilo', (await out('lengkap')) === '<p>satu dua tiga</p>', await out('lengkap'));
await page.click('#lengkap .afw-bubble .afw-btn[aria-label="Warna & stabilo"]');
await wait(200);
await page.keyboard.press('Escape');
await wait();
check('Esc menutup palet', !(await popOpen()));
await page.click('#lengkap .afw-bubble .afw-btn[aria-label="Warna & stabilo"]');
await wait(200);
await page.mouse.click(5, 5);
await wait();
check('klik di luar menutup palet', !(await popOpen()));

// ---------- Perataan dari toolbar ----------
await set('lengkap', '<h2>Judul</h2><p>Isi</p>');
await page.click('#lengkap .afw-content h2');
await page.click('#lengkap .afw-toolbar .afw-btn[aria-label="Perataan"]');
await wait(200);
const toolbarPop = await page.evaluate(() => {
  const pop = document.querySelector('#lengkap .afw-pop').getBoundingClientRect();
  const btn = document.querySelector('#lengkap .afw-toolbar .afw-btn[aria-label="Perataan"]').getBoundingClientRect();
  return { popTop: pop.top, btnBottom: btn.bottom };
});
check('palet perataan di bawah tombol toolbar', toolbarPop.popTop >= toolbarPop.btnBottom, JSON.stringify(toolbarPop));
check('rata kiri aktif', await page.$eval('#lengkap .afw-pop .afw-btn[aria-label="Rata kiri"]', (b) => b.classList.contains('afw-is-active')));
await page.click('#lengkap .afw-pop .afw-btn[aria-label="Rata kanan"]');
await wait();
check('judul rata kanan', (await out('lengkap')) === '<h2 class="afw-align-right">Judul</h2><p>Isi</p>', await out('lengkap'));
check('ikon tombol perataan mengikuti', await page.$eval('#lengkap .afw-toolbar .afw-btn[aria-label="Perataan"]', (b) => b.innerHTML.includes('M21 12H9')));
await page.keyboard.press('ControlOrMeta+a');
await page.keyboard.press('ControlOrMeta+Shift+KeyJ');
check('seleksi beberapa blok -> semua rata kanan-kiri', (await out('lengkap')) === '<h2 class="afw-align-justify">Judul</h2><p class="afw-align-justify">Isi</p>', await out('lengkap'));
await page.evaluate(`${data('lengkap')}.exec('h3')`);
check('ganti judul -> perataan tetap', (await out('lengkap')).startsWith('<h3 class="afw-align-justify">'), await out('lengkap'));

// ---------- Upload dengan mediaId ----------
await mount('upload', "{ upload: async () => ({ url: '/storage/a.png', mediaId: 42 }) }", '<p>x</p>');
await page.click('#upload .afw-content');
await page.evaluate(async () => {
  const png = Uint8Array.from(atob('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='), (c) => c.charCodeAt(0));
  await Alpine.$data(document.getElementById('upload')).editor().insertImages([new File([png], 'a.png', { type: 'image/png' })]);
});
await wait(200);
check('upload { url, mediaId } -> data-media-id', (await out('upload')).includes('<img src="/storage/a.png" alt="" data-media-id="42">'), await out('upload'));
check('getMeta().image.mediaId', (await page.evaluate(`${data('upload')}.getMeta().image.mediaId`)) === '42');
await page.evaluate(`${data('upload')}.setHTML('<figure><img src="/b.png" alt="" data-media-id="7"></figure><p>y</p>')`);
await page.evaluate(`${data('upload')}.editor().selectMedia(document.querySelector('#upload .afw-content figure'))`);
await wait();
await page.evaluate(`${data('upload')}.editor().setMediaAlt('Foto')`);
check('mengubah alt tidak menghapus data-media-id', (await out('upload')).includes('alt="Foto" data-media-id="7"'), await out('upload'));

// ---------- Opsi extensions + sanitize.allowTags ----------
await page.evaluate(async () => {
  const { Sup } = await import('/tests/browser/fixtures/sup-mark.js');
  window.SupMark = Sup;
});
await mount('ext', "{ extensions: [window.SupMark], sanitize: { allowTags: ['sup'] } }", '<p>E = mc<sup>2</sup></p>');
check('extension: konten awal lolos', (await out('ext')) === '<p>E = mc<sup>2</sup></p>', await out('ext'));
await set('ext', '<p>x2</p>');
await select('ext', 0, 1, 2);
await page.keyboard.press('ControlOrMeta+Period');
check('extension: shortcut sendiri jalan', (await out('ext')) === '<p>x<sup>2</sup></p>', await out('ext'));
const json = await page.evaluate(`${data('ext')}.getJSON()`);
check('extension: ikut di getJSON', JSON.stringify(json).includes('"type":"sup"'), JSON.stringify(json));

// ---------- Dark mode lewat class .dark ----------
await mount('gelap', '{}', '<p>x</p>', (inner) => `${inner}<div id="terang" data-afw-theme="light" class="afw-prose"><p>y</p></div>`);
const bg = (sel) => page.$eval(sel, (el) => getComputedStyle(el).getPropertyValue('--afw-bg').trim());
check('tanpa .dark: terang', (await bg('#gelap')) === '#ffffff');
await page.evaluate(() => document.documentElement.classList.add('dark'));
check('.dark di <html>: langsung gelap', (await bg('#gelap')) === '#18181b');
check('data-afw-theme="light" tetap terang', (await bg('#terang')) === '#ffffff');
await page.evaluate(() => document.documentElement.classList.remove('dark'));
check('.dark dilepas: terang lagi', (await bg('#gelap')) === '#ffffff');

// ---------- x-model: HTML setara dari luar tidak memuat ulang editor ----------
await mount('model', '{}', '', (editor) => `<div x-data="{ body: '<p>abc <span style=&quot;color: #e11d48&quot;>merah</span></p>' }">${editor}</div>`, 'x-modelable="html" x-model="body"');
check('x-model: nilai awal masuk ke editor', (await out('model')) === '<p>abc <span style="color: #e11d48">merah</span></p>', await out('model'));
await page.click('#model .afw-content p');
await page.keyboard.press('End');
await page.keyboard.type(' x');
const before = await page.evaluate(`${data('model')}.editor().tiptap.state.selection.from`);
// Penulisan khas sanitizer server (HTMLPurifier): tanpa spasi, dengan titik koma.
const purified = (await out('model')).replace('color: #e11d48', 'color:#e11d48;');
check('varian HTMLPurifier memang beda teks', purified !== (await out('model')) && purified.includes('color:#e11d48;'), purified);
await page.evaluate((html) => {
  Alpine.$data(document.getElementById('model-host').firstElementChild).body = html;
}, purified);
await wait();
const after = await page.evaluate(`({ from: ${data('model')}.editor().tiptap.state.selection.from, undo: ${data('model')}.editor().canUndo() })`);
check('HTML setara dari luar: kursor & riwayat undo tetap', after.from === before && after.undo, JSON.stringify({ before, after }));
await page.evaluate(() => {
  Alpine.$data(document.getElementById('model-host').firstElementChild).body = '<p>isi baru</p>';
});
await wait();
check('HTML berbeda dari luar tetap dimuat', (await out('model')) === '<p>isi baru</p>', await out('model'));

// ---------- Buat & hapus berulang (mis. wire:navigate) ----------
const counts = await page.evaluate(async () => {
  const active = new Map();
  const add = Document.prototype.addEventListener;
  const remove = Document.prototype.removeEventListener;
  document.addEventListener = function (type, fn, opts) { active.set(fn, type); return add.call(this, type, fn, opts); };
  document.removeEventListener = function (type, fn, opts) { active.delete(fn); return remove.call(this, type, fn, opts); };
  const sizes = [];
  for (let i = 0; i < 5; i++) {
    const host = document.createElement('div');
    host.className = 'nav-host';
    host.innerHTML = '<form><div x-data="wysiwyg({ name: \'nav\' })"><p>halaman</p></div></form>';
    document.body.append(host);
    await new Promise((r) => setTimeout(r, 60));
    sizes.push(document.querySelectorAll('.nav-host .afw-content').length);
    host.remove();
    await new Promise((r) => setTimeout(r, 60));
  }
  document.addEventListener = add;
  document.removeEventListener = remove;
  return { leaked: active.size, editorsWhileMounted: sizes, editorsAfter: document.querySelectorAll('.nav-host').length };
});
check('buat & hapus 5x: tidak ada listener document yang tertinggal', counts.leaked === 0, JSON.stringify(counts));
check('buat & hapus 5x: tidak ada instance ganda', counts.editorsAfter === 0 && counts.editorsWhileMounted.every((n) => n === 1), JSON.stringify(counts));

check('tanpa error di halaman', errors.length === 0, errors.join(' | '));

console.log(results.join('\n'));
await browser.close();
