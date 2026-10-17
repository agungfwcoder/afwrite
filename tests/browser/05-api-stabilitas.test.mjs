
import { launch, SHOTS, BASE_URL } from './setup.mjs';

const { engine, browser } = await launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
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
const btn = (label) => `.afw-toolbar .afw-btn[aria-label="${label}"]`;

await page.goto(`${BASE_URL}/`);
await page.waitForSelector('.afw-content');

// ---------- Undo / redo ----------
await set('<p>Awal</p>');
check('setelah setHTML tidak ada yang bisa di-undo', await page.$eval(btn('Urungkan'), (b) => b.getAttribute('aria-disabled') === 'true'));
await caretEnd();
await page.keyboard.type(' satu dua tiga');
check('tombol undo aktif setelah mengetik', !(await page.$eval(btn('Urungkan'), (b) => b.getAttribute('aria-disabled') === 'true')));
await page.keyboard.press('ControlOrMeta+z');
check('undo ketikan beruntun = satu langkah', (await out()) === '<p>Awal</p>', await out());
await page.keyboard.press('ControlOrMeta+Shift+z');
check('redo', (await out()) === '<p>Awal satu dua tiga</p>', await out());
await page.keyboard.press('ControlOrMeta+z');
await page.keyboard.press('ControlOrMeta+y');
check('Ctrl/Cmd+Y = redo', (await out()) === '<p>Awal satu dua tiga</p>', await out());

await page.keyboard.down('Shift');
for (let i = 0; i < 4; i++) await page.keyboard.press('ArrowLeft');
await page.keyboard.up('Shift');
await page.keyboard.press('ControlOrMeta+b');
check('format tebal', (await out()).includes('<b>tiga</b>'), await out());
await page.click(btn('Urungkan'));
check('tombol undo membatalkan format', (await out()) === '<p>Awal satu dua tiga</p>', await out());
await page.click(btn('Ulangi'));
check('tombol redo', (await out()).includes('<b>tiga</b>'), await out());

// Undo operasi media
await set('<p>Teks</p>');
await caretEnd();
await page.keyboard.press('Enter');
await page.keyboard.type('--- ');
await wait();
check('pemisah dibuat', (await out()).includes('<hr>'), await out());
await page.keyboard.press('ControlOrMeta+z');
await wait();
check('undo pemisah', !(await out()).includes('<hr>'), await out());
await page.keyboard.press('ControlOrMeta+Shift+z');
check('redo pemisah', (await out()).includes('<hr>'), await out());
await page.click('.afw-content hr');
await page.keyboard.press('Backspace');
check('hapus pemisah', !(await out()).includes('<hr>'));
await page.keyboard.press('ControlOrMeta+z');
check('undo hapus media', (await out()).includes('<hr>'), await out());

// Mengetik setelah undo membuang redo
await set('<p>x</p>');
await caretEnd();
await page.keyboard.type('y');
await wait(1100);
await page.keyboard.type('z');
await page.keyboard.press('ControlOrMeta+z');
check('jeda > 1 detik memisah langkah undo', (await out()) === '<p>xy</p>', await out());
await page.keyboard.type('Q');
check('redo kosong setelah perubahan baru', await page.$eval(btn('Ulangi'), (b) => b.getAttribute('aria-disabled') === 'true'));

// ---------- Read-only ----------
await set('<p>Tidak bisa diubah <a href="https://example.com">link</a></p>');
await page.check('.demo-check input');
await wait();
check('read-only: toolbar disembunyikan', !(await page.isVisible('.afw-toolbar')));
check('read-only: contenteditable=false', await page.$eval('.afw-content', (el) => el.getAttribute('contenteditable') === 'false'));
await page.click('.afw-content p');
await page.keyboard.type('abc');
check('read-only: mengetik tidak mengubah isi', (await out()) === '<p>Tidak bisa diubah <a href="https://example.com">link</a></p>', await out());
await page.evaluate(() => {
  const t = document.querySelector('.afw-content p').firstChild;
  const r = document.createRange();
  r.setStart(t, 0);
  r.setEnd(t, 5);
  getSelection().removeAllRanges();
  getSelection().addRange(r);
});
await wait();
check('read-only: bubble tidak muncul', !(await page.$eval('.afw-bubble', (b) => b.classList.contains('afw-is-ready'))));
await page.uncheck('.demo-check input');
await wait();
check('kembali bisa diedit', (await page.isVisible('.afw-toolbar')) && (await page.$eval('.afw-content', (el) => el.getAttribute('contenteditable') === 'true')));

// ---------- Aksesibilitas ----------
check('editor punya aria-label', (await page.$eval('.afw-content', (el) => el.getAttribute('aria-label'))) === 'Editor teks');
await page.focus(btn('Tebal'));
await page.keyboard.press('ArrowRight');
check('panah kanan di toolbar pindah fokus', await page.evaluate(() => document.activeElement.getAttribute('aria-label') === 'Miring'));
await page.keyboard.press('End');
check('End ke tombol terakhir', await page.evaluate(() => document.activeElement.getAttribute('aria-label') === 'Ulangi'));
check('toolbar hanya satu tab stop', (await page.$$eval('.afw-toolbar .afw-btn[tabindex="0"]', (b) => b.length)) === 1);

await set('<p>a</p>');
await caretEnd();
await page.keyboard.press('Enter');
await page.keyboard.type('/');
await wait();
await page.keyboard.press('ArrowDown');
await wait();
const active = await page.$eval('.afw-content', (el) => el.getAttribute('aria-activedescendant'));
const optionLabel = await page.evaluate((id) => document.getElementById(id)?.textContent, active);
check('slash menu: aria-activedescendant menunjuk opsi aktif', !!optionLabel && optionLabel.includes('Judul'), `${active} ${optionLabel}`);
await page.keyboard.press('Escape');

// ---------- .afw-prose ----------
await set('<h2>Judul</h2><p>Isi</p><ul><li>satu</li></ul><figure data-embed="youtube"><iframe src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ"></iframe></figure>');
await wait();
const prose = await page.evaluate(() => {
  const ed = document.querySelector('.afw-content h2');
  const pr = document.querySelector('.afw-prose h2');
  return {
    same: getComputedStyle(ed).fontSize === getComputedStyle(pr).fontSize,
    list: getComputedStyle(document.querySelector('.afw-prose ul')).listStyleType,
    iframe: getComputedStyle(document.querySelector('.afw-prose iframe')).pointerEvents,
    editorIframe: getComputedStyle(document.querySelector('.afw-content iframe')).pointerEvents,
  };
});
check('prose: tipografi sama dengan editor', prose.same, JSON.stringify(prose));
check('prose: video bisa diputar (pointer-events auto)', prose.iframe === 'auto' && prose.editorIframe === 'none', JSON.stringify(prose));

// ---------- x-model ----------
await page.evaluate(() => {
  const wrap = document.createElement('div');
  wrap.id = 'model-test';
  wrap.setAttribute('x-data', "{ body: '<p>dari model</p>' }");
  wrap.innerHTML = '<div x-data="wysiwyg({ toolbar: false, stats: false })" x-modelable="html" x-model="body"></div><output x-text="body"></output>';
  document.body.append(wrap);
});
await page.waitForSelector('#model-test .afw-content');
await wait(200);
check('x-model: nilai awal masuk ke editor', (await page.$eval('#model-test .afw-content', (el) => el.innerHTML)) === '<p>dari model</p>', await page.$eval('#model-test .afw-content', (el) => el.innerHTML));
await page.evaluate(() => (Alpine.$data(document.getElementById('model-test')).body = '<h2>diubah dari luar</h2>'));
await wait();
check('x-model: perubahan dari luar', (await page.$eval('#model-test .afw-content', (el) => el.innerHTML)) === '<h2>diubah dari luar</h2>');
await page.evaluate(() => {
  const el = document.querySelector('#model-test .afw-content h2');
  el.closest('.afw-content').focus();
  const r = document.createRange();
  r.selectNodeContents(el);
  r.collapse(false);
  if (el.lastChild?.nodeName === 'BR') { r.setStartBefore(el.lastChild); r.collapse(true); }
  getSelection().removeAllRanges();
  getSelection().addRange(r);
});
await page.keyboard.type('!');
await wait();
check('x-model: ketikan mengalir ke model', (await page.textContent('#model-test output')) === '<h2>diubah dari luar!</h2>', await page.textContent('#model-test output'));
check('dua editor di satu halaman punya id unik', await page.evaluate(() => {
  const ids = [...document.querySelectorAll('.afw-menu')].map((m) => m.id);
  return ids.length === 2 && ids[0] !== ids[1];
}));

check('tidak ada error JS', errors.length === 0, errors.join(' | '));

// ---------- Bahasa Inggris ----------
await page.goto(`${BASE_URL}/?lang=en`);
await page.waitForSelector('.afw-content');
await set('');
check('en: placeholder', (await page.$eval('.afw-content', (el) => el.dataset.afwPlaceholder)).startsWith('Start writing'));
check('en: label toolbar', await page.isVisible('.afw-toolbar .afw-btn[aria-label="Bold"]'));
await page.click('.afw-content');
await page.keyboard.type('/');
await wait();
const labels = await page.$$eval('.afw-menu-label', (els) => els.map((e) => e.textContent));
check('en: slash menu', labels.includes('Heading') && labels.includes('Divider'), labels.join(','));
await page.keyboard.type('head');
await wait();
check('en: filter dengan kata Inggris', (await page.$$eval('.afw-menu-label', (els) => els.map((e) => e.textContent))).join(',') === 'Heading,Subheading');
check('en: statistik', (await page.textContent('.afw-footer')).includes('words'));
await page.screenshot({ path: `${SHOTS}/15-english.png`, clip: { x: 0, y: 100, width: 660, height: 560 } });

console.log(results.join('\n'));
await browser.close();
