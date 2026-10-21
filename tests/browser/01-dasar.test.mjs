
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
const check = (name, ok, extra = '') => results.push(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? '  -> ' + extra : ''}`);
// Output editor (sudah dinormalisasi). DOM editor bisa berbeda, mis. <li><p> di ProseMirror.
const html = () => page.evaluate(() => Alpine.$data(document.querySelector('.afw')).getHTML());
const reset = async () => {
  await page.evaluate(() => Alpine.$data(document.querySelector('.afw')).setHTML(''));
  await page.click('.afw-content');
};

await page.goto(`${BASE_URL}/?lang=id`);
await page.waitForSelector('.afw-btn');
await page.screenshot({ path: `${SHOTS}/1-initial.png`, fullPage: true });

// Empty + placeholder + typing creates <p>
await reset();
check('placeholder tampil saat kosong', await page.$eval('.afw-content', (el) => el.classList.contains('afw-is-empty') && getComputedStyle(el, '::before').content.includes('Mulai menulis')));
await page.keyboard.type('Halo dunia');
await page.keyboard.press('Enter');
await page.keyboard.type('Baris dua');
let h = await html();
check('Enter menghasilkan <p>, bukan <div>', /^<p>Halo dunia<\/p><p>Baris dua<\/p>$/.test(h), h);

// Bold via shortcut + active state
await page.keyboard.down('Shift'); for (let i = 0; i < 3; i++) await page.keyboard.press('ArrowLeft'); await page.keyboard.up('Shift');
await page.keyboard.press('ControlOrMeta+b');
h = await html();
check('Ctrl/Cmd+B membuat <b>', h.includes('<b>dua</b>'), h);
await page.waitForTimeout(50);
check('tombol bold aktif', await page.$eval('.afw-toolbar .afw-btn[aria-label="Tebal"]', (b) => b.classList.contains('afw-is-active')));

// Italic via toolbar
await page.click('.afw-toolbar .afw-btn[aria-label="Miring"]');
h = await html();
check('tombol miring membuat <i>', /<i>|<b><i>|<i><b>/.test(h), h);
check('tidak ada <span style>', !/style=/.test(h), h);

// H2 toggle
await reset();
await page.keyboard.type('Judul');
await page.click('.afw-toolbar .afw-btn[aria-label="Judul"]');
h = await html();
check('H2 dari toolbar', h === '<h2>Judul</h2>', h);
await page.keyboard.press('Enter'); await page.keyboard.type('isi');
h = await html();
check('Enter setelah H2 jadi <p>', h === '<h2>Judul</h2><p>isi</p>', h);
await page.keyboard.press('ArrowUp');
await page.click('.afw-toolbar .afw-btn[aria-label="Judul"]');
h = await html();
check('klik H2 lagi mengembalikan ke <p>', h.startsWith('<p>Judul</p>'), h);

// H3 shortcut
await reset();
await page.keyboard.type('Sub');
await page.keyboard.press('ControlOrMeta+Alt+Digit3');
h = await html();
check('Ctrl/Cmd+Alt+3 membuat H3', h === '<h3>Sub</h3>', h);

// Quote toggle
await reset();
await page.keyboard.type('Kutipan');
await page.click('.afw-toolbar .afw-btn[aria-label="Kutipan"]');
h = await html();
check('quote dari toolbar', /^<blockquote>(<p>)?Kutipan(<\/p>)?<\/blockquote>$/.test(h), h);
await page.click('.afw-toolbar .afw-btn[aria-label="Kutipan"]');
h = await html();
check('klik quote lagi menghapus quote', !h.includes('blockquote'), h);

// Lists
await reset();
await page.keyboard.type('satu');
await page.click('.afw-toolbar .afw-btn[aria-label="Daftar berpoin"]');
await page.keyboard.press('Enter'); await page.keyboard.type('dua');
h = await html();
check('daftar berpoin', h === '<ul><li>satu</li><li>dua</li></ul>', h);
await page.click('.afw-toolbar .afw-btn[aria-label="Daftar bernomor"]');
h = await html();
check('ganti ke daftar bernomor', h.includes('<ol>') && !h.includes('<ul>'), h);
await page.keyboard.press('Enter'); await page.keyboard.press('Enter'); await page.keyboard.type('keluar');
h = await html();
check('Enter 2x keluar dari list jadi <p>', /<\/ol><p>keluar<\/p>$/.test(h), h);

// Link via input di bubble
await reset();
await page.keyboard.type('kunjungi situs');
await page.keyboard.down('Shift'); for (let i = 0; i < 5; i++) await page.keyboard.press('ArrowLeft'); await page.keyboard.up('Shift');
await page.keyboard.press('ControlOrMeta+k');
await page.waitForSelector('.afw-link-input', { state: 'visible' });
await page.fill('.afw-link-input', 'example.com');
await page.keyboard.press('Enter');
h = await html();
check('link dari Ctrl/Cmd+K (https otomatis)', h.includes('<a href="https://example.com">situs</a>'), h);
await page.click('.afw-content a');
await page.waitForTimeout(150);
await page.locator('.afw-bubble-row:visible button[aria-label="Hapus link"]').click();
h = await html();
check('hapus link dari preview link', !h.includes('<a'), h);

await reset();
await page.keyboard.type('x');
await page.keyboard.down('Shift'); await page.keyboard.press('ArrowLeft'); await page.keyboard.up('Shift');
await page.click('.afw-toolbar .afw-btn[aria-label="Link"]');
await page.fill('.afw-link-input', 'javascript:alert(1)');
await page.keyboard.press('Enter');
await page.waitForTimeout(100);
check('URL javascript: ditolak', !(await html()).includes('<a') && (await page.isVisible('.afw-link-error')), await html());
await page.keyboard.press('Escape');

// Hidden input & rendered panel sync
await reset();
await page.keyboard.type('Sinkron');
const hidden = await page.$eval('input[name=content]', (i) => i.value);
check('input hidden ikut terisi', hidden === '<p>Sinkron</p>', hidden);
const rendered = await page.$eval('[data-demo-render]', (el) => el.innerHTML);
check('panel render ikut terisi', rendered === '<p>Sinkron</p>', rendered);

// Delete everything → back to empty <p>
await page.keyboard.press('ControlOrMeta+a'); await page.keyboard.press('Backspace');
h = await page.$eval('.afw-content', (el) => el.children.length === 1 && el.firstElementChild.tagName === 'P' && !el.textContent);
check('hapus semua kembali ke satu paragraf kosong', h);
check('hidden kosong saat editor kosong', (await page.$eval('input[name=content]', (i) => i.value)) === '');

// Alpine directive injection through editor content
await page.evaluate(() => document.execCommand('insertHTML', false, '<b x-init="window.__pwned = 1">tes</b>'));
await page.waitForTimeout(100);
check('atribut Alpine di konten tidak dieksekusi', !(await page.evaluate(() => window.__pwned)));

// Dark theme screenshot
await page.evaluate(() => Alpine.$data(document.querySelector('.afw')).setHTML(document.querySelector('.afw-content').dataset.seed || '<h2>Mode gelap</h2><p>Contoh <b>tebal</b> dan <a href="#">link</a>.</p><blockquote>Kutipan</blockquote><ul><li>satu</li></ul>'));
await page.selectOption('select[x-model=theme]', 'dark');
await page.locator('.afw').screenshot({ path: `${SHOTS}/2-dark.png` });

// Framework collision screenshots
for (const fw of ['bootstrap', 'tailwind']) {
  await page.goto(`${BASE_URL}/?fw=${fw}&lang=id`);
  await page.waitForSelector('.afw-btn');
  await page.waitForTimeout(1500);
  const s = await page.evaluate(() => {
    const q = (sel, prop) => getComputedStyle(document.querySelector(sel))[prop];
    return {
      h2: q('.afw-content h2', 'fontSize'),
      ul: q('.afw-content ul', 'listStyleType'),
      quoteBorder: q('.afw-content blockquote', 'borderLeftWidth'),
      btn: q('.afw-btn', 'width'),
    };
  });
  check(`${fw}: heading, list, quote, tombol tetap utuh`, s.h2 === '31.5px' && s.ul === 'disc' && s.quoteBorder === '3px' && s.btn === '34px', JSON.stringify(s));
  await page.screenshot({ path: `${SHOTS}/3-${fw}.png` });
}

// Mobile
await page.setViewportSize({ width: 390, height: 800 });
await page.goto(`${BASE_URL}/?lang=id`);
await page.waitForSelector('.afw-btn');
const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
check('mobile: tidak ada scroll horizontal', !overflow);
await page.screenshot({ path: `${SHOTS}/4-mobile.png` });

check('tidak ada error JS', errors.length === 0, errors.join(' | '));
console.log(results.join('\n'));
await browser.close();
