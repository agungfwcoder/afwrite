// UI tanpa Alpine: create(el, options), toolbar (status aktif/disabled, keyboard), statistik,
// input hidden (HTML / JSON / judul), event on() + wysiwyg-*, read-only, draf autosave, toast,
// layout sendiri (data-afw-editor), dan destroy() yang mengembalikan elemen seperti semula.
import { launch, BASE_URL } from './setup.mjs';

const { browser } = await launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));

const results = [];
const bail = (e) => { console.log(results.join('\n')); console.log('ERROR', e.message.split('\n')[0]); process.exit(1); };
process.on('uncaughtException', bail);
process.on('unhandledRejection', bail);
const check = (name, ok, extra = '') => results.push(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? '  -> ' + String(extra).slice(0, 300) : ''}`);
const wait = (ms = 150) => page.waitForTimeout(ms);
const btn = (label, root = '#ed') => `${root} .afw-toolbar .afw-btn[aria-label="${label}"]`;
const input = (name) => page.$eval(`input[name=${name}]`, (i) => i.value);

await page.goto(`${BASE_URL}/tests/browser/pages/vanilla.html`);
await page.waitForSelector('#ed .afw-content');
await wait();

// ---------- Pemasangan ----------
check('tanpa Alpine di halaman', await page.evaluate(() => typeof window.Alpine === 'undefined'));
check('class .afw dipasang', await page.$eval('#ed', (el) => el.classList.contains('afw')));
check('konten awal dari isi elemen', (await page.textContent('#ed .afw-content')).includes('Hello world'));
check('toolbar tampil', await page.isVisible(btn('Bold')));
check('event ready lewat on()', await page.evaluate(() => events.some(([e]) => e === 'ready')));
check('input hidden konten', (await input('content')) === '<p>Hello world</p>', await input('content'));
check('input hidden judul', (await input('title')) === 'Hello world', await input('title'));
check('statistik', (await page.textContent('#ed .afw-footer')).includes('2 words'), await page.textContent('#ed .afw-footer'));
check('undo nonaktif di awal', (await page.getAttribute(btn('Undo'), 'aria-disabled')) === 'true');
check('ikon tombol terisi', await page.$eval(btn('Bold'), (b) => b.querySelector('svg') !== null));

// ---------- Mengetik & event ----------
await page.click('#ed .afw-content p');
await page.keyboard.press('End');
await page.keyboard.type(' again');
await wait();
check('change lewat on()', await page.evaluate(() => events.some(([e, html]) => e === 'change' && html.includes('again'))));
check('change lewat event DOM', await page.evaluate(() => events.some(([e, html]) => e === 'dom-change' && html.includes('again'))));
check('input hidden ikut berubah', (await input('content')).includes('again'));
check('undo aktif setelah mengetik', (await page.getAttribute(btn('Undo'), 'aria-disabled')) === 'false');
check('statistik ikut berubah', (await page.textContent('#ed .afw-footer')).includes('3 words'));

// ---------- Tombol format ----------
await page.keyboard.down('Shift');
for (let i = 0; i < 5; i++) await page.keyboard.press('ArrowLeft');
await page.keyboard.up('Shift');
await wait();
await page.click(btn('Bold'));
await wait();
check('klik Bold menebalkan seleksi', (await page.evaluate(() => ed.getHTML())).includes('<b>again</b>'), await page.evaluate(() => ed.getHTML()));
check('Bold aktif (class + aria-pressed)', await page.$eval(btn('Bold'), (b) => b.classList.contains('afw-is-active') && b.getAttribute('aria-pressed') === 'true'));
check('fokus tetap di editor setelah klik tombol', await page.evaluate(() => document.activeElement?.classList.contains('afw-content')));
await page.click(btn('Undo'));
await wait();
check('klik Undo', !(await page.evaluate(() => ed.getHTML())).includes('<b>'));

// ---------- Keyboard toolbar ----------
const tabStops = await page.$$eval('#ed .afw-toolbar .afw-btn', (bs) => bs.filter((b) => b.tabIndex === 0).length);
check('toolbar: satu tab stop', tabStops === 1, tabStops);
await page.focus('#ed .afw-toolbar .afw-btn[tabindex="0"]');
await page.keyboard.press('ArrowRight');
const second = await page.evaluate(() => [...document.querySelectorAll('#ed .afw-toolbar .afw-btn')].indexOf(document.activeElement));
check('toolbar: panah kanan pindah tombol', second === 1, second);
await page.keyboard.press('End');
const last = await page.evaluate(() => {
  const bs = [...document.querySelectorAll('#ed .afw-toolbar .afw-btn')].filter((b) => b.offsetParent);
  return bs.indexOf(document.activeElement) === bs.length - 1;
});
check('toolbar: End ke tombol terakhir', last);

// ---------- API ----------
await page.evaluate(() => ed.setHTML('<h2>Judul</h2><p>Isi</p>'));
await wait();
check('setHTML + getHTML', (await page.evaluate(() => ed.getHTML())) === '<h2>Judul</h2><p>Isi</p>');
check('judul ikut setHTML', (await input('title')) === 'Judul');
check('getJSON', (await page.evaluate(() => ed.getJSON().content[0].type)) === 'heading');
check('editor inti tersedia', await page.evaluate(() => typeof ed.editor.exec === 'function'));

await page.evaluate(() => ed.setReadOnly(true));
await wait();
check('read-only menyembunyikan toolbar', !(await page.isVisible('#ed .afw-toolbar')));
check('read-only: konten tidak bisa diedit', (await page.getAttribute('#ed .afw-content', 'contenteditable')) === 'false');
await page.evaluate(() => ed.setReadOnly(false));
await wait();
check('read-only dimatikan', await page.isVisible('#ed .afw-toolbar'));

await page.evaluate(() => ed.editor.emit('error', { message: 'Upload gagal' }));
await wait();
check('toast error', await page.$eval('#ed .afw-toast', (t) => t.classList.contains('afw-is-open') && t.textContent === 'Upload gagal'));

// ---------- Bubble ----------
const selectText = (text) => page.evaluate((text) => {
  const content = document.querySelector('#ed .afw-content');
  const walker = document.createTreeWalker(content, NodeFilter.SHOW_TEXT);
  let node;
  while ((node = walker.nextNode()) && !node.data.includes(text));
  const start = node.data.indexOf(text);
  content.focus();
  const range = document.createRange();
  range.setStart(node, start);
  range.setEnd(node, start + text.length);
  getSelection().removeAllRanges();
  getSelection().addRange(range);
}, text);
const bubbleOpen = () => page.$eval('#ed .afw-bubble-main', (b) => b.classList.contains('afw-is-open') && b.classList.contains('afw-is-ready'));
const bubbleMode = () => page.$eval('#ed .afw-bubble-main', (b) =>
  [...b.querySelectorAll(':scope > .afw-bubble-row')].findIndex((r) => !r.classList.contains('afw-is-hidden')));
const bubbleBtn = (label) => `#ed .afw-bubble-format .afw-btn[aria-label="${label}"]`;

await page.evaluate(() => ed.setHTML('<p>Satu dua tiga</p><p>Empat lima</p>'));
await selectText('dua');
await wait();
check('bubble muncul saat teks dipilih', await bubbleOpen());
check('bubble mode format', (await bubbleMode()) === 0);
const pos = await page.evaluate(() => {
  const b = document.querySelector('#ed .afw-bubble-main').getBoundingClientRect();
  const r = getSelection().getRangeAt(0).getBoundingClientRect();
  return { above: b.bottom <= r.top, centered: Math.abs((b.left + b.width / 2) - (r.left + r.width / 2)) < 3 };
});
check('bubble di atas seleksi, rata tengah', pos.above && pos.centered, JSON.stringify(pos));
await page.click(bubbleBtn('Italic'));
await wait();
check('tombol bubble menjalankan perintah', (await page.evaluate(() => ed.getHTML())).includes('<i>dua</i>'));
check('tombol bubble aktif', await page.$eval(bubbleBtn('Italic'), (b) => b.classList.contains('afw-is-active')));
await page.keyboard.press('ArrowRight');
await wait();
check('bubble tertutup saat seleksi kosong', !(await bubbleOpen()));

// ---------- Link ----------
await selectText('tiga');
await wait();
await page.click(bubbleBtn('Link'));
await wait();
check('klik Link membuka input', (await bubbleMode()) === 1 && await page.evaluate(() => document.activeElement?.classList.contains('afw-link-input')));
check('placeholder input link', (await page.getAttribute('#ed .afw-link-input', 'placeholder')) === 'Paste or type a URL…');
check('tombol hapus link tersembunyi (link baru)', await page.$eval('#ed .afw-link-remove', (b) => b.classList.contains('afw-is-hidden')));
await page.keyboard.type('javascript:alert(1)');
await page.keyboard.press('Enter');
await wait();
check('URL tidak valid ditolak', (await page.textContent('#ed .afw-link-error')) === 'Invalid URL' && await page.isVisible('#ed .afw-link-error'));
await page.fill('#ed .afw-link-input', 'example.com');
check('error hilang saat mengetik', !(await page.isVisible('#ed .afw-link-error')));
await page.keyboard.press('Enter');
await wait();
check('link dipasang', (await page.evaluate(() => ed.getHTML())).includes('<a href="https://example.com">tiga</a>'), await page.evaluate(() => ed.getHTML()));
check('fokus kembali ke editor', await page.evaluate(() => document.activeElement?.classList.contains('afw-content')));

await page.click('#ed .afw-content a');
await wait(250);
check('info link saat kursor di link', (await bubbleOpen()) && (await bubbleMode()) === 2);
check('href di info link', (await page.getAttribute('#ed .afw-link-preview', 'href')) === 'https://example.com');
await page.click('#ed .afw-bubble-linkinfo [aria-label="Edit link"]');
await wait();
check('edit link: input berisi URL lama', (await page.inputValue('#ed .afw-link-input')) === 'https://example.com');
check('edit link: tombol hapus tampil', !(await page.$eval('#ed .afw-link-remove', (b) => b.classList.contains('afw-is-hidden'))));
await page.keyboard.press('Escape');
await wait();
check('Esc membatalkan input', !(await page.$eval('#ed .afw-bubble-main', (b) => b.classList.contains('afw-is-open') && !b.querySelector('.afw-link-form').classList.contains('afw-is-hidden'))));
check('Esc: link tidak berubah', (await page.evaluate(() => ed.getHTML())).includes('href="https://example.com"'));
await page.click('#ed .afw-content a');
await wait(250);
await page.click('#ed .afw-bubble-linkinfo [aria-label="Remove link"]');
await wait();
check('hapus link', !(await page.evaluate(() => ed.getHTML())).includes('<a '));

// ---------- Video ----------
await page.click('#ed .afw-content p:last-child');
await page.keyboard.press('End');
await page.evaluate(() => ed.exec('embed'));
await wait();
check('embed: input video', (await bubbleMode()) === 1 && (await page.getAttribute('#ed .afw-link-input', 'placeholder')).includes('YouTube'));
await page.keyboard.type('https://example.com/bukan-video');
await page.keyboard.press('Enter');
await wait();
check('embed: link bukan video ditolak', await page.isVisible('#ed .afw-link-error'));
await page.fill('#ed .afw-link-input', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ');
await page.keyboard.press('Enter');
await wait();
check('embed: video disisipkan', (await page.evaluate(() => ed.getHTML())).includes('data-embed'));

// ---------- Media bar ----------
await page.evaluate(() => ed.setHTML('<p>Atas</p>'));
await page.click('#ed .afw-content p');
await page.keyboard.press('End');
await page.evaluate(() => ed.insertImage({ src: '/demo/sample.png', alt: '' }));
await wait(300);
await page.click('#ed .afw-content figure img');
await wait(250);
const mediaOpen = () => page.$eval('#ed .afw-mediabar', (b) => b.classList.contains('afw-is-open') && b.classList.contains('afw-is-ready'));
check('media bar muncul saat gambar dipilih', await mediaOpen());
check('media bar: tombol ukuran', (await page.$$('#ed .afw-media-sizes .afw-btn')).length === 3);
check('media bar: ukuran normal aktif', await page.$eval('#ed .afw-media-sizes .afw-btn[aria-label="Normal size"]', (b) => b.classList.contains('afw-is-active')));
check('bubble tidak muncul bersama media bar', !(await bubbleOpen()));
await page.click('#ed .afw-mediabar [aria-label="Wide"]');
await wait();
check('ubah ukuran gambar', (await page.evaluate(() => ed.getHTML())).includes('data-size="wide"'));
check('ukuran aktif ikut berubah', await page.$eval('#ed .afw-media-sizes .afw-btn[aria-label="Wide"]', (b) => b.getAttribute('aria-pressed') === 'true'));
await page.click('#ed .afw-mediabar [aria-label="Alt text"]');
await wait();
check('alt text: input', (await bubbleMode()) === 1 && !(await mediaOpen()));
await page.keyboard.type('Contoh gambar');
await page.keyboard.press('Enter');
await wait(250);
check('alt text tersimpan', (await page.evaluate(() => ed.getHTML())).includes('alt="Contoh gambar"'));
await page.click('#ed .afw-content figure img');
await wait(250);
check('tombol alt aktif bila ada alt', await page.$eval('#ed .afw-media-alt', (b) => b.classList.contains('afw-is-active')));
await page.click('#ed .afw-mediabar [aria-label="Remove media"]');
await wait();
check('hapus gambar', !(await page.evaluate(() => ed.getHTML())).includes('<figure'));

await page.evaluate(() => ed.setHTML('<p>A</p><hr><p>B</p>'));
await page.click('#ed .afw-content hr');
await wait(250);
check('pemisah: media bar tanpa ukuran & alt', (await mediaOpen()) && !(await page.isVisible('#ed .afw-media-sizes')) && !(await page.isVisible('#ed .afw-media-alt')));

// ---------- Palet ----------
await page.evaluate(() => ed.setHTML('<p>Warna teks di sini</p>'));
await selectText('teks');
await wait();
await page.click(btn('Color & highlight'));
await wait();
const popOpen = () => page.$eval('#ed .afw-pop', (p) => p.classList.contains('afw-is-open') && p.classList.contains('afw-is-ready'));
check('palet warna terbuka dari toolbar', await popOpen());
check('palet warna: dua baris', (await page.$$('#ed .afw-pop-row')).length === 2);
check('palet: aria-label', (await page.getAttribute('#ed .afw-pop', 'aria-label')) === 'Color & highlight');
const popBelow = await page.evaluate(() => {
  const p = document.querySelector('#ed .afw-pop').getBoundingClientRect();
  const b = document.querySelector('#ed .afw-toolbar [aria-label="Color & highlight"]').getBoundingClientRect();
  return p.top >= b.bottom;
});
check('palet dari toolbar di bawah tombol', popBelow);
check('warna bawaan aktif', await page.$eval('#ed .afw-pop-row .afw-swatch-none', (b) => b.classList.contains('afw-is-active')));
await page.click('#ed .afw-pop-row:first-child .afw-swatch-color');
await wait();
check('warna dipasang', /<span style="color:/.test(await page.evaluate(() => ed.getHTML())), await page.evaluate(() => ed.getHTML()));
check('palet tertutup setelah memilih', !(await popOpen()));
await page.click(btn('Color & highlight'));
await wait();
check('swatch terpilih aktif', await page.$eval('#ed .afw-pop-row:first-child .afw-swatch-color', (b) => b.classList.contains('afw-is-active')));
await page.keyboard.press('Escape');
await wait();
check('Esc menutup palet', !(await popOpen()));
await page.click(btn('Color & highlight'));
await wait();
await page.mouse.click(5, 5);
await wait();
check('klik di luar menutup palet', !(await popOpen()));
await page.click(btn('Color & highlight'));
await wait();
await page.click(btn('Color & highlight'));
await wait();
check('klik tombol palet lagi menutupnya', !(await popOpen()));

await page.click('#ed .afw-content p');
await page.click(btn('Alignment'));
await wait();
check('palet perataan', (await popOpen()) && await page.isVisible('#ed .afw-pop-align [aria-label="Align center"]') && !(await page.isVisible('#ed .afw-pop-colors')));
await page.click('#ed .afw-pop-align [aria-label="Align center"]');
await wait();
check('perataan tengah', (await page.evaluate(() => ed.getHTML())).includes('class="afw-align-center"'));
check('ikon tombol perataan ikut berubah', await page.evaluate(() => {
  const expected = document.createElement('span');
  expected.innerHTML = Afwrite.ICONS.alignCenter;
  return document.querySelector('#ed .afw-toolbar [aria-label="Alignment"]').innerHTML === expected.innerHTML;
}));

// ---------- Slash menu ----------
const menuOpen = () => page.$eval('#ed .afw-menu', (m) => m.classList.contains('afw-is-open') && m.classList.contains('afw-is-ready'));
const menuLabels = () => page.$$eval('#ed .afw-menu-label', (els) => els.map((e) => e.textContent));
const activeLabel = () => page.$eval('#ed .afw-menu-item.afw-is-active .afw-menu-label', (e) => e.textContent);

await page.evaluate(() => ed.setHTML('<p>Satu</p>'));
await page.click('#ed .afw-content p');
await page.keyboard.press('End');
await page.keyboard.press('Enter');
await page.keyboard.type('/');
await wait();
check('slash: menu terbuka', await menuOpen());
check('slash: daftar blok', (await menuLabels()).includes('Heading') && (await menuLabels()).includes('Divider'), (await menuLabels()).join(','));
check('slash: shortcut markdown', (await page.$$eval('#ed .afw-menu-kbd', (k) => k.filter((x) => x.style.display !== 'none').map((x) => x.textContent))).includes('##'));
const menuPos = await page.evaluate(() => {
  const m = document.querySelector('#ed .afw-menu').getBoundingClientRect();
  const p = document.querySelector('#ed .afw-content p:last-child').getBoundingClientRect();
  return m.top >= p.bottom && Math.abs(m.left - p.left) < 40;
});
check('slash: di bawah baris kursor', menuPos);
check('slash: aria-activedescendant', (await page.getAttribute('#ed .afw-content', 'aria-activedescendant')).endsWith('-opt-0'));
check('slash: aria-controls ke menu', await page.evaluate(() =>
  document.getElementById(document.querySelector('#ed .afw-content').getAttribute('aria-controls'))?.classList.contains('afw-menu')));
await page.keyboard.press('ArrowDown');
await wait();
const secondLabel = (await menuLabels())[1];
check('slash: panah bawah pindah item', (await activeLabel()) === secondLabel, await activeLabel());
check('slash: aria-selected', await page.$eval('#ed .afw-menu-item.afw-is-active', (b) => b.getAttribute('aria-selected') === 'true'));
await page.keyboard.type('head');
await wait();
check('slash: filter', (await menuLabels()).join(',') === 'Heading,Subheading', (await menuLabels()).join(','));
await page.keyboard.type('zzz');
await wait();
check('slash: pesan tidak ada hasil', await page.isVisible('#ed .afw-menu-empty') && (await page.$$('#ed .afw-menu-item')).length === 0);
for (let i = 0; i < 3; i++) await page.keyboard.press('Backspace');
await wait();
await page.hover('#ed .afw-menu-item:nth-of-type(2)');
await wait();
check('slash: hover memilih item', (await activeLabel()) === 'Subheading', await activeLabel());
await page.keyboard.press('Enter');
await wait();
// Heading kosong di akhir tidak ikut getHTML(), jadi dicek di DOM.
check('slash: Enter menjalankan item', await page.$eval('#ed .afw-content', (c) => c.lastElementChild.tagName === 'H3'));
check('slash: menu tertutup', !(await menuOpen()));
await page.evaluate(() => ed.setHTML('<p>Satu</p>'));
await page.click('#ed .afw-content p');
await page.keyboard.press('End');
await page.keyboard.press('Enter');
await page.keyboard.type('/divi');
await wait();
await page.click('#ed .afw-menu-item');
await wait();
check('slash: klik item', (await page.evaluate(() => ed.getHTML())).includes('<hr>'), await page.evaluate(() => ed.getHTML()));
await page.click('#ed .afw-content p');
await page.keyboard.press('End');
await page.keyboard.type(' /');
await wait();
await page.keyboard.press('Escape');
await wait();
check('slash: Esc menutup', !(await menuOpen()));

// ---------- Tombol + ----------
// setHTML membuang paragraf kosong di akhir, jadi baris kosong dibuat lewat Enter.
// Fokus lewat API, bukan klik: klik cepat di titik yang sama dengan langkah sebelumnya dianggap
// double-click oleh Firefox/WebKit (kata terpilih lalu tertimpa Enter).
await page.evaluate(() => ed.setHTML('<p>Satu</p>'));
await page.evaluate(() => ed.focus());
await page.keyboard.press('Enter');
await wait(250);
const plusOpen = () => page.$eval('#ed .afw-plus', (b) => b.classList.contains('afw-is-open'));
check('tombol + tampil di baris kosong', await plusOpen());
const plusPos = await page.evaluate(() => {
  const b = document.querySelector('#ed .afw-plus').getBoundingClientRect();
  const p = document.querySelector('#ed .afw-content p:last-child').getBoundingClientRect();
  return b.right <= p.left && Math.abs((b.top + b.height / 2) - (p.top + p.height / 2)) < 6;
});
check('tombol + di kiri baris, sejajar', plusPos);
await page.click('#ed .afw-plus');
await wait();
check('klik + membuka slash menu', (await menuOpen()) && !(await plusOpen()));
await page.keyboard.press('Escape');
await page.click('#ed .afw-content p:first-child');
await wait(250);
check('tombol + hilang di baris berisi', !(await plusOpen()));

// ---------- Pegangan drag ----------
const box = (sel) => page.locator(`#ed ${sel}`).first().boundingBox();
const handleVisible = () => page.$eval('#ed .afw-handle', (b) => b.classList.contains('afw-is-open'));
await page.evaluate(() => ed.setHTML('<p>Satu</p><p>Dua</p><h2>Tiga</h2>'));
const tiga = await box('.afw-content h2');
await page.mouse.move(tiga.x + 20, tiga.y + tiga.height / 2);
await wait();
check('pegangan tampil saat hover blok', await handleVisible());
const h = await box('.afw-handle');
check('pegangan di kiri & sejajar', h.x + h.width <= tiga.x && Math.abs(h.y + h.height / 2 - (tiga.y + tiga.height / 2)) < 8);
const satu = await box('.afw-content p');
await page.mouse.move(h.x + h.width / 2, h.y + h.height / 2);
await page.mouse.down();
await page.mouse.move(h.x + 30, h.y - 10, { steps: 5 });
await page.mouse.move(satu.x + 10, satu.y + 2, { steps: 12 });
await page.mouse.up();
await wait(250);
check('seret blok ke atas', (await page.evaluate(() => ed.getHTML())) === '<h2>Tiga</h2><p>Satu</p><p>Dua</p>', await page.evaluate(() => ed.getHTML()));
check('pegangan hilang setelah drag', !(await handleVisible()));
const dua = await box('.afw-content p:nth-child(3)');
await page.mouse.move(dua.x + 20, dua.y + dua.height / 2);
await wait();
await page.click('#ed .afw-handle');
await wait();
check('klik pegangan memilih blok', await page.$eval('#ed .afw-content p:nth-child(3)', (p) => p.classList.contains('ProseMirror-selectednode')));
await page.mouse.move(5, 5);
await wait();
check('pegangan hilang saat mouse keluar', !(await handleVisible()));

// ---------- Opsi lain ----------
async function mount(id, options, content = '<p>x</p>') {
  await page.evaluate(({ id, options, content }) => {
    document.getElementById(id)?.remove();
    const host = document.createElement('div');
    host.id = id;
    host.innerHTML = content;
    document.body.append(host);
    window[id] = Afwrite.create(host, { lang: 'en', ...options });
  }, { id, options, content });
  await wait();
}

await mount('json', { name: 'doc', format: 'json', toolbar: false, stats: false }, '<p>A</p>');
check('format json di input hidden', JSON.parse(await input('doc')).type === 'doc');
check('toolbar: false', !(await page.isVisible('#json .afw-toolbar')));
check('stats: false', !(await page.isVisible('#json .afw-footer')));

await page.evaluate(() => localStorage.setItem('afw:draft:v13', JSON.stringify({ html: '<p>Draf lama</p>', time: Date.now() })));
await mount('draft', { autosave: 'v13' }, '<p>Baru</p>');
check('banner draf tampil', await page.isVisible('#draft .afw-draft'));
check('teks banner draf', (await page.textContent('#draft .afw-draft')).includes('unsaved draft'));
await page.click('#draft .afw-draft-primary');
await wait();
check('pulihkan draf', (await page.evaluate(() => draft.getHTML())) === '<p>Draf lama</p>');
check('banner hilang setelah dipulihkan', !(await page.isVisible('#draft .afw-draft')));

await mount('custom', {}, '<div class="my-bar"></div><div data-afw-editor><p>Sendiri</p></div>');
check('layout sendiri: tanpa toolbar bawaan', (await page.$$('#custom .afw-toolbar')).length === 0);
check('layout sendiri: editor jalan', (await page.evaluate(() => custom.getHTML())) === '<p>Sendiri</p>');

// ---------- destroy & pasang lagi ----------
await page.evaluate(() => ed.destroy());
check('destroy mengembalikan isi elemen', (await page.$eval('#ed', (el) => el.innerHTML)) === '<p>Hello world</p>');
check('destroy melepas class .afw', !(await page.$eval('#ed', (el) => el.classList.contains('afw'))));
await page.evaluate(() => (window.ed = Afwrite.create('#ed', { lang: 'en' })));
await wait();
check('pasang lagi setelah destroy', (await page.$$('#ed .afw-toolbar')).length === 1 && (await page.evaluate(() => ed.getHTML())) === '<p>Hello world</p>');
check('create dua kali di elemen sama', await page.evaluate(() => Afwrite.create('#ed') === ed));

// ---------- Di proyek yang sudah memakai Alpine ----------
// create() di dalam komponen x-data: tidak bentrok, dan atribut Alpine di konten tidak dieksekusi.
await page.evaluate(async () => {
  const { default: Alpine } = await import('/node_modules/alpinejs/dist/module.esm.js');
  window.Alpine = Alpine;
  Alpine.plugin(Afwrite.plugin);
  Alpine.start();
  const host = document.createElement('div');
  host.innerHTML = `<div x-data="{ body: '' }">
    <div id="mix" x-init="window.mix = Afwrite.create($el, { lang: 'en' }); mix.on('change', (e) => body = e.html)"><p>Halo</p></div>
    <span id="mix-body" x-text="body"></span>
    <div id="mix-alpine" x-data="wysiwyg({ lang: 'en' })"><p>Alpine</p></div>
  </div>`;
  document.body.append(host);
});
await page.waitForSelector('#mix .afw-content');
await page.waitForSelector('#mix-alpine .afw-content');
await page.click('#mix .afw-content p');
await page.keyboard.press('End');
await page.keyboard.type(' dunia');
await wait();
check('Alpine: create() di dalam x-data', (await page.textContent('#mix-body')) === '<p>Halo dunia</p>', await page.textContent('#mix-body'));
await page.evaluate(() => mix.setHTML('<p x-init="window.pwned = 1" @click="window.pwned = 2">Isi</p>'));
await wait();
await page.click('#mix .afw-content p');
check('Alpine: atribut Alpine di konten dibuang', (await page.evaluate(() => window.pwned ?? null)) === null && (await page.evaluate(() => mix.getHTML())) === '<p>Isi</p>');
check('Alpine: versi x-data jalan berdampingan', (await page.evaluate(() => Alpine.$data(document.getElementById('mix-alpine')).getHTML())) === '<p>Alpine</p>');

// Layout sendiri (contoh di docs) + x-model: bergantung pada state yang dicerminkan ke Alpine.
await page.evaluate(() => {
  const host = document.createElement('div');
  host.innerHTML = `<div x-data="{ body: '<p>Awal</p>', n: 0 }">
    <div id="own" x-data="wysiwyg({ lang: 'en' })" x-modelable="html" x-model="body">
      <button type="button" id="own-bold" @mousedown.prevent @click="exec('bold')" :class="{ active: isActive('bold') }">B</button>
      <button type="button" id="own-undo" :disabled="isDisabled('undo')" @click="exec('undo')">U</button>
      <div data-afw-editor x-ignore></div>
    </div>
    <span id="own-body" x-text="body"></span>
    <div x-effect="n++; Alpine.$data(document.getElementById('own'))?.setReadOnly(false)"></div>
  </div>`;
  document.body.append(host);
});
await page.waitForSelector('#own .afw-content');
await wait();
check('Alpine layout sendiri: x-model -> isi awal', (await page.evaluate(() => Alpine.$data(document.getElementById('own')).getHTML())) === '<p>Awal</p>');
check('Alpine layout sendiri: tanpa toolbar bawaan', (await page.$$('#own .afw-toolbar')).length === 0);
check('Alpine layout sendiri: undo nonaktif', await page.$eval('#own-undo', (b) => b.disabled));
await page.click('#own .afw-content p');
await page.keyboard.press('End');
await page.keyboard.down('Shift');
for (let i = 0; i < 4; i++) await page.keyboard.press('ArrowLeft');
await page.keyboard.up('Shift');
await page.click('#own-bold');
await wait();
check('Alpine layout sendiri: tombol sendiri menjalankan perintah', (await page.textContent('#own-body')) === '<p><b>Awal</b></p>', await page.textContent('#own-body'));
check('Alpine layout sendiri: isActive reaktif', await page.$eval('#own-bold', (b) => b.classList.contains('active')));
check('Alpine layout sendiri: canUndo reaktif', !(await page.$eval('#own-undo', (b) => b.disabled)));
await page.evaluate(() => { Alpine.$data(document.getElementById('own-body').parentElement).body = '<p>Dari luar</p>'; });
await wait();
check('Alpine: x-model dari luar -> editor', (await page.evaluate(() => Alpine.$data(document.getElementById('own')).getHTML())) === '<p>Dari luar</p>');
await page.click('#own .afw-content p');
await page.keyboard.press('End');
await page.keyboard.press('Enter');
await page.keyboard.type('/');
await wait();
check('Alpine: x-effect aplikasi tidak ikut berjalan ulang karena state editor',
  (await page.evaluate(() => Alpine.$data(document.getElementById('own-body').parentElement).n)) === 1,
  await page.evaluate(() => Alpine.$data(document.getElementById('own-body').parentElement).n));

check('tanpa error halaman', errors.length === 0, errors.join(' | '));
console.log(results.join('\n'));
await browser.close();
