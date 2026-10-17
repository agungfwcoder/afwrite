
import { launch, SHOTS, BASE_URL } from './setup.mjs';

const { engine, browser } = await launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
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
const out = () => page.$eval('input[name=content]', (i) => i.value);
const dom = () => page.$eval('.afw-content', (el) => el.innerHTML);
const set = (html) => page.evaluate((h) => Alpine.$data(document.querySelector('.afw')).setHTML(h), html);
const wait = (ms = 120) => page.waitForTimeout(ms);
const visible = (sel) => page.$eval(sel, (el) => getComputedStyle(el).display !== 'none' && el.classList.contains('afw-is-ready')).catch(() => false);
const shown = (sel) => page.$eval(sel, (el) => getComputedStyle(el).display !== 'none' && !el.closest('.afw-is-hidden')).catch(() => false);
const caretEnd = async (sel = 'p') => {
  await page.evaluate((s) => {
    const el = document.querySelector('.afw-content').querySelector(s) || document.querySelector('.afw-content');
    el.closest('.afw-content').focus();
    const r = document.createRange();
    r.selectNodeContents(el);
    r.collapse(false);
    if (el.lastChild?.nodeName === 'BR') { r.setStartBefore(el.lastChild); r.collapse(true); }
    getSelection().removeAllRanges();
    getSelection().addRange(r);
  }, sel);
  await wait();
};
const selectText = async (sel, start, end) => {
  await page.evaluate(([s, a, b]) => {
    const el = document.querySelector('.afw-content').querySelector(s);
    el.closest('.afw-content').focus();
    const t = el.firstChild;
    const r = document.createRange();
    r.setStart(t, a);
    r.setEnd(t, b);
    getSelection().removeAllRanges();
    getSelection().addRange(r);
  }, [sel, start, end]);
  await wait();
};
const fresh = async (html = '') => {
  const newLine = html.endsWith('<p><br></p>') && html !== '<p><br></p>';
  await set(newLine ? html.slice(0, -'<p><br></p>'.length) : html);
  await caretEnd(html ? ':scope > :last-child' : 'p');
  if (newLine) {
    await page.keyboard.press('Enter');
    await wait();
  }
};

await page.goto(`${BASE_URL}/`);
await page.waitForSelector('.afw-content');
await page.evaluate(() => window.scrollTo(0, 0));

// ---------- Bubble toolbar ----------
await fresh('<p>Halo</p><p>Teks yang akan diblok di sini</p>');
await selectText('p:nth-child(2)', 10, 14);
check('bubble muncul saat teks diblok', await visible('.afw-bubble'));
const pos = await page.evaluate(() => {
  const b = document.querySelector('.afw-bubble').getBoundingClientRect();
  const s = getSelection().getRangeAt(0).getBoundingClientRect();
  return { bubbleBottom: b.bottom, selTop: s.top, bubbleCenter: b.left + b.width / 2, selCenter: s.left + s.width / 2 };
});
check('bubble di atas seleksi & di tengah', pos.bubbleBottom <= pos.selTop && Math.abs(pos.bubbleCenter - pos.selCenter) < 2, JSON.stringify(pos));
await page.screenshot({ path: `${SHOTS}/6-bubble.png`, clip: { x: 0, y: 100, width: 660, height: 420 } });

await selectText('p:nth-child(2)', 0, 4);
check('bubble di tepi kiri tetap di dalam layar', await page.$eval('.afw-bubble', (b) => b.getBoundingClientRect().left >= 8));
await selectText('p:nth-child(2)', 10, 14);
await page.click('.afw-bubble button[aria-label="Tebal"]');
check('tombol tebal di bubble', (await out()).includes('<b>akan</b>'), await out());
check('bubble tetap terbuka setelah format', await visible('.afw-bubble'));
check('tombol tebal di bubble aktif', await page.$eval('.afw-bubble button[aria-label="Tebal"]', (b) => b.classList.contains('afw-is-active')));

await page.keyboard.press('ArrowRight');
await wait();
check('bubble hilang saat seleksi dilepas', !(await visible('.afw-bubble')));

// Mouse drag: bubble muncul setelah mouse dilepas
await fresh('<p>Seleksi dengan mouse untuk menguji</p>');
const box = await page.$eval('.afw-content p', (p) => { const r = p.getBoundingClientRect(); return { x: r.left, y: r.top + r.height / 2 }; });
await page.mouse.move(box.x + 2, box.y);
await page.mouse.down();
await page.mouse.move(box.x + 80, box.y, { steps: 5 });
await wait();
const duringDrag = await visible('.afw-bubble');
await page.mouse.up();
await wait();
check('bubble tidak muncul selama drag, muncul setelah mouseup', !duringDrag && (await visible('.afw-bubble')));

// ---------- Link inline ----------
await fresh('<p>buka situs kami</p>');
await selectText('p', 5, 10);
await page.click('.afw-bubble button[aria-label="Link"]');
await page.waitForSelector('.afw-link-input', { state: 'visible' });
await wait();
check('input link fokus', await page.evaluate(() => document.activeElement.classList.contains('afw-link-input')));
check('bubble mode link: tombol format disembunyikan', !(await shown('.afw-bubble button[aria-label="Tebal"]')));
await page.screenshot({ path: `${SHOTS}/7-link-input.png`, clip: { x: 0, y: 100, width: 660, height: 360 } });
await page.keyboard.type('example.org/x');
await page.keyboard.press('Enter');
await wait();
check('link dipasang dari bubble', (await out()) === '<p>buka <a href="https://example.org/x">situs</a> kami</p>', await out());
check('fokus kembali ke editor', await page.evaluate(() => document.activeElement.classList.contains('afw-content')));

await page.click('.afw-content a');
await wait();
check('preview link muncul saat kursor di link', (await visible('.afw-bubble')) && (await shown('.afw-link-preview')));
check('preview menampilkan URL', (await page.textContent('.afw-link-preview')).includes('https://example.org/x'));
await page.screenshot({ path: `${SHOTS}/8-link-preview.png`, clip: { x: 0, y: 100, width: 660, height: 360 } });

await page.locator('.afw-bubble-row:visible button[aria-label="Ubah link"]').click();
await page.fill('.afw-link-input', 'https://baru.com');
await page.keyboard.press('Enter');
await wait();
check('ubah URL link', (await out()) === '<p>buka <a href="https://baru.com">situs</a> kami</p>', await out());

await page.click('.afw-content a');
await wait();
await page.locator('.afw-bubble-row:visible button[aria-label="Ubah link"]').click();
await wait();
await page.keyboard.press('Escape');
await wait();
check('Esc membatalkan edit link', !(await shown('.afw-link-input')), await out());
check('Esc: link tidak berubah', (await out()) === '<p>buka <a href="https://baru.com">situs</a> kami</p>', await out());

// ---------- Slash menu ----------
await fresh('<p>Paragraf</p><p><br></p>');
await page.keyboard.type('/');
await wait();
check('slash menu terbuka', await visible('.afw-menu'));
check('slash menu berisi 10 blok', (await page.$$eval('.afw-menu-item', (els) => els.length)) === 10);
await page.screenshot({ path: `${SHOTS}/9-slash.png`, clip: { x: 0, y: 100, width: 660, height: 560 } });
await page.keyboard.type('ju');
await wait();
const filtered = await page.$$eval('.afw-menu-item .afw-menu-label', (els) => els.map((e) => e.textContent));
check('filter "ju"', JSON.stringify(filtered) === '["Judul","Subjudul"]', JSON.stringify(filtered));
await page.keyboard.press('Enter');
await wait();
check('Enter memilih Judul dan menghapus "/ju"', (await dom()).endsWith('<h2><br></h2>') || (await dom()).endsWith('<h2></h2>'), await dom());
check('slash menu tertutup', !(await visible('.afw-menu')));
await page.keyboard.type('Judul baru');
check('lanjut mengetik di judul', (await out()) === '<p>Paragraf</p><h2>Judul baru</h2>', await out());

await fresh('<p><br></p>');
await page.keyboard.type('/');
for (let i = 0; i < 4; i++) await page.keyboard.press('ArrowDown');
await page.keyboard.press('Enter');
await page.keyboard.type('poin');
check('navigasi panah -> daftar berpoin', (await out()) === '<ul><li>poin</li></ul>', await out());

await fresh('<p><br></p>');
await page.keyboard.type('/');
await wait();
await page.click('.afw-menu-item:has-text("Kutipan")');
await page.keyboard.type('kutip');
check('klik item menu -> kutipan', (await out()) === '<blockquote>kutip</blockquote>', await out());

await fresh('<p><br></p>');
await page.keyboard.type('/');
await page.keyboard.press('Escape');
await page.keyboard.type('xyz');
await wait();
check('Esc menutup & tidak muncul lagi saat lanjut mengetik', !(await visible('.afw-menu')) && (await out()) === '<p>/xyz</p>', await out());

await fresh('<p>dan</p>');
await page.keyboard.type('/atau');
await wait();
check('"/" di tengah kalimat tidak membuka menu', !(await visible('.afw-menu')));

await fresh('<p><br></p>');
await page.keyboard.type('/qqq');
await wait();
check('query tanpa hasil -> "Tidak ada hasil"', await page.isVisible('.afw-menu-empty'));
await page.keyboard.press('Enter');
check('Enter tanpa hasil tidak menghapus teks', (await dom()).includes('/qqq'), await dom());

// ---------- Tombol + ----------
await fresh('<p>Isi</p><p><br></p>');
await wait(200);
check('tombol + muncul di baris kosong', await page.isVisible('.afw-plus'));
const plusPos = await page.evaluate(() => {
  const plus = document.querySelector('.afw-plus').getBoundingClientRect();
  const p = document.querySelector('.afw-content p:last-child').getBoundingClientRect();
  return Math.abs(plus.top + plus.height / 2 - (p.top + p.height / 2));
});
check('tombol + sejajar baris', plusPos < 3, String(plusPos));
await page.click('.afw-plus');
await wait();
check('klik + membuka menu blok', await visible('.afw-menu'));
await page.keyboard.press('ArrowDown');
await page.keyboard.press('Enter');
await page.keyboard.type('Dari plus');
check('pilih dari menu +', (await out()) === '<p>Isi</p><h2>Dari plus</h2>', await out());
await caretEnd('h2');
check('tombol + hilang di baris berisi', !(await page.isVisible('.afw-plus')));

// ---------- Markdown ----------
const md = async (typed, expected, name) => {
  await fresh('<p><br></p>');
  await page.keyboard.type(typed);
  await wait(50);
  const o = await out();
  check(`markdown ${name}`, o === expected, o);
};
await md('## Judul', '<h2>Judul</h2>', '"## " -> h2');
await md('# Judul', '<h2>Judul</h2>', '"# " -> h2');
await md('### Sub', '<h3>Sub</h3>', '"### " -> h3');
await md('> Kutip', '<blockquote>Kutip</blockquote>', '"> " -> kutipan');
await md('- satu', '<ul><li>satu</li></ul>', '"- " -> ul');
await md('* satu', '<ul><li>satu</li></ul>', '"* " -> ul');
await md('1. satu', '<ol><li>satu</li></ol>', '"1. " -> ol');
await md('ini **tebal** lalu biasa', '<p>ini <b>tebal</b> lalu biasa</p>', '**tebal** (lalu tidak tebal lagi)');
await md('ini *miring* lalu', '<p>ini <i>miring</i> lalu</p>', '*miring*');
await md('ini _miring_ lalu', '<p>ini <i>miring</i> lalu</p>', '_miring_');
await md('pakai `npm i` ya', '<p>pakai <code>npm i</code> ya</p>', '`kode` (lalu keluar dari kode)');
await md('2 * 3 * 4', '<p>2 * 3 * 4</p>', 'bintang matematika tidak jadi miring');
await md('snake_case_name', '<p>snake_case_name</p>', 'garis bawah dalam kata tidak jadi miring');
await md('teks ## bukan judul', '<p>teks ## bukan judul</p>', '## di tengah kalimat diabaikan');

await fresh('<p><br></p>');
await page.keyboard.type('## Judul');
await page.keyboard.press('ControlOrMeta+z');
await wait();
check('undo setelah markdown tidak error', errors.length === 0);

// ---------- Tab di list ----------
await fresh('<p><br></p>');
await page.keyboard.type('- satu');
await page.keyboard.press('Enter');
await page.keyboard.type('dua');
await page.keyboard.press('Tab');
check('Tab membuat sub-list', /<ul><li>satu<ul><li>dua<\/li><\/ul><\/li><\/ul>/.test(await out()), await out());
await page.keyboard.press('Shift+Tab');
check('Shift+Tab mengembalikan', (await out()) === '<ul><li>satu</li><li>dua</li></ul>', await out());

await fresh('<p>bukan list</p>');
await page.keyboard.press('Tab');
check('Tab di luar list tidak ditahan (fokus pindah)', !(await page.evaluate(() => document.activeElement.classList.contains('afw-content'))));

// ---------- Statistik ----------
await set('<h2>Judul artikel</h2><p>satu dua tiga empat</p><ul><li>lima</li></ul>');
await wait();
check('jumlah kata', (await page.textContent('.afw-footer')).includes('7 kata'), await page.textContent('.afw-footer'));

// ---------- Mode minimal ----------
await page.selectOption('select[x-model=mode]', 'minimal');
await wait();
check('mode minimal menyembunyikan toolbar', !(await page.isVisible('.afw-toolbar')));
await page.selectOption('select[x-model=mode]', 'full');

// ---------- Bubble di dekat tepi atas layar -> pindah ke bawah ----------
await fresh('<p>Baris pertama di paling atas</p>' + '<p>isi</p>'.repeat(30));
await page.evaluate(() => {
  const p = document.querySelector('.afw-content p');
  window.scrollTo(0, p.getBoundingClientRect().top + window.scrollY - 5);
});
await selectText('p', 0, 5);
const flip = await page.evaluate(() => {
  const b = document.querySelector('.afw-bubble').getBoundingClientRect();
  const s = getSelection().getRangeAt(0).getBoundingClientRect();
  return { bubbleTop: b.top, selBottom: s.bottom };
});
check('bubble pindah ke bawah jika tidak muat di atas', flip.bubbleTop >= flip.selBottom, JSON.stringify(flip));
await page.evaluate(() => window.scrollTo(0, 0));

// ---------- Dark mode menu ----------
await page.selectOption('select[x-model=theme]', 'dark');
await fresh('<p>Mode gelap</p><p><br></p>');
await page.keyboard.type('/');
await wait(200);
await page.screenshot({ path: `${SHOTS}/10-dark-slash.png`, clip: { x: 0, y: 100, width: 660, height: 560 } });
await page.keyboard.press('Escape');
await selectText('p', 0, 4);
await page.screenshot({ path: `${SHOTS}/11-dark-bubble.png`, clip: { x: 0, y: 100, width: 660, height: 300 } });

check('tidak ada error JS', errors.length === 0, errors.join(' | '));
console.log(results.join('\n'));
await browser.close();
