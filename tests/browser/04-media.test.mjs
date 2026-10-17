
import { launch, SHOTS, BASE_URL } from './setup.mjs';

const { engine, browser } = await launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));

const results = [];
const bail = (e) => { console.log(results.join('\n')); console.log('ERROR', e.message.split('\n')[0]); process.exit(1); };
process.on('uncaughtException', bail);
process.on('unhandledRejection', bail);
const check = (name, ok, extra = '') => results.push(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? '  -> ' + String(extra).slice(0, 300) : ''}`);
const out = () => page.$eval('input[name=content]', (i) => i.value);
const dom = () => page.$eval('.afw-content', (el) => el.innerHTML);
const set = (html) => page.evaluate((h) => Alpine.$data(document.querySelector('.afw')).setHTML(h), html);
const wait = (ms = 150) => page.waitForTimeout(ms);
const shown = (sel) => page.$eval(sel, (el) => getComputedStyle(el).display !== 'none' && !el.closest('.afw-is-hidden') && (!el.classList.contains('afw-bubble') || el.classList.contains('afw-is-ready'))).catch(() => false);
const caretEnd = async (sel) => {
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
const caretStart = async (sel) => {
  await page.evaluate((s) => {
    const root = document.querySelector('.afw-content');
    const el = root.querySelector(s);
    root.focus();
    const r = document.createRange();
    r.selectNodeContents(el);
    r.collapse(true);
    getSelection().removeAllRanges();
    getSelection().addRange(r);
  }, sel);
  await wait();
};

// Kirim paste/drop. Chromium & WebKit: event sungguhan. Firefox: event sintetis tidak membawa
// clipboardData/dataTransfer, jadi handler editor dipanggil dengan objek data tiruan.
const fire = (kind, { html = '', text = '', fileFrom = null, fileType = 'image/png', fileName = 'foto.png', point = null } = {}) =>
  page.evaluate(async ([k, h, t, src, ft, fn, pt, eng]) => {
    const files = [];
    if (src !== null) {
      const blob = ft.startsWith('image/') ? await (await fetch(src)).blob() : new Blob(['halo'], { type: ft });
      files.push(new File([blob], fn, { type: ft }));
    }
    const el = document.querySelector('.afw-content');
    if (eng === 'firefox') {
      const ed = Alpine.$data(document.querySelector('.afw')).editor();
      const data = { getData: (type) => (type === 'text/html' ? h : type === 'text/plain' ? t : ''), files };
      const fake = { preventDefault() {}, clientX: pt?.x ?? 0, clientY: pt?.y ?? 0 };
      if (k === 'paste') ed._handlePaste({ ...fake, clipboardData: data });
      else ed._handleDrop({ ...fake, dataTransfer: data });
      return;
    }
    const dt = new DataTransfer();
    if (h) dt.setData('text/html', h);
    if (t) dt.setData('text/plain', t);
    files.forEach((f) => dt.items.add(f));
    if (k === 'paste') el.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true }));
    else el.dispatchEvent(new DragEvent('drop', { dataTransfer: dt, clientX: pt?.x ?? 0, clientY: pt?.y ?? 0, bubbles: true, cancelable: true }));
  }, [kind, html, text, fileFrom, fileType, fileName, point, engine]);
const dropOrPasteFile = async (kind, type = 'image/png', name = 'foto.png') => {
  const point = await page.$eval('.afw-content p:last-of-type', (p) => { const r = p.getBoundingClientRect(); return { x: r.left + 5, y: r.top + 5 }; });
  await fire(kind, { fileFrom: '/demo/sample.png', fileType: type, fileName: name, point });
};
const pasteText = (text, html = '') => fire('paste', { text, html });

await page.goto(`${BASE_URL}/`);
await page.waitForSelector('.afw-content figure img');
await page.waitForFunction(() => document.querySelector('.afw-content figure img').complete);

// ---------- Gambar awal ----------
let o = await out();
check('output gambar bersih (tanpa atribut editor)', o.includes('<figure><img src="/demo/sample.png" alt="Ilustrasi pegunungan"><figcaption>Klik gambar untuk mengatur ukuran, alt text, atau menghapusnya.</figcaption></figure>') && !/contenteditable|draggable|class=/.test(o), o.slice(o.indexOf('<figure'), o.indexOf('</figure>') + 9));
check('figure tidak bisa diketik, keterangan bisa', await page.evaluate(() => {
  const f = document.querySelector('.afw-content figure');
  return f.contentEditable === 'false' && f.querySelector('figcaption').contentEditable === 'true';
}));

// ---------- Pilih gambar ----------
await page.click('.afw-content figure img');
await wait();
check('klik gambar -> terpilih', await page.$eval('.afw-content figure', (f) => f.classList.contains('afw-is-selected')));
check('toolbar media muncul', await shown('.afw-mediabar'));
check('bubble format tidak muncul', !(await shown('.afw-bubble:not(.afw-mediabar)')));
const barPos = await page.evaluate(() => ({ bar: document.querySelector('.afw-mediabar').getBoundingClientRect().bottom, fig: document.querySelector('.afw-content figure').getBoundingClientRect().top }));
check('toolbar media di atas gambar', barPos.bar <= barPos.fig, JSON.stringify(barPos));
await page.screenshot({ path: `${SHOTS}/12-media-selected.png`, clip: { x: 0, y: 380, width: 660, height: 520 } });

await page.click('.afw-mediabar button[aria-label="Lebar"]');
await wait();
check('ukuran lebar', (await out()).includes('<figure data-size="wide">'), await out());
check('tetap terpilih setelah ubah ukuran', await page.$eval('.afw-content figure', (f) => f.classList.contains('afw-is-selected')));
await page.click('.afw-mediabar button[aria-label="Penuh"]');
await wait();
check('ukuran penuh', (await out()).includes('<figure data-size="full">'));
const fullWidth = await page.evaluate(() => {
  const f = document.querySelector('.afw-content figure').getBoundingClientRect();
  const c = document.querySelector('.afw-content').getBoundingClientRect();
  return Math.abs(f.width - c.width) < 2;
});
check('ukuran penuh selebar editor', fullWidth);
await page.click('.afw-mediabar button[aria-label="Ukuran normal"]');
await wait();
check('kembali ke normal', (await out()).includes('<figure><img'));

// Alt text
await page.click('.afw-mediabar button[aria-label="Alt text"]');
await wait();
check('input alt terbuka berisi alt lama', (await page.inputValue('.afw-link-input')) === 'Ilustrasi pegunungan');
await page.fill('.afw-link-input', 'Pegunungan saat senja');
await page.keyboard.press('Enter');
await wait();
check('alt text tersimpan', (await out()).includes('alt="Pegunungan saat senja"'), await out());
check('gambar tetap terpilih setelah alt', await page.$eval('.afw-content figure', (f) => f.classList.contains('afw-is-selected')));

// Mengetik saat gambar terpilih diabaikan
const before = await out();
await page.keyboard.type('xyz');
check('mengetik tidak mengganti gambar', (await out()) === before);

// Panah bawah -> paragraf berikutnya
await page.keyboard.press('ArrowDown');
await wait();
check('panah bawah keluar dari gambar', !(await page.$eval('.afw-content figure', (f) => f.classList.contains('afw-is-selected'))) && !(await shown('.afw-mediabar')));
await page.keyboard.type('Z');
check('kursor di paragraf setelah gambar', (await out()).includes('</figure><p>ZSeret'), await out());

// ---------- Keterangan ----------
await page.click('.afw-content figcaption');
await page.evaluate(() => {
  const cap = document.querySelector('.afw-content figcaption');
  cap.focus();
  const r = document.createRange();
  r.selectNodeContents(cap);
  r.collapse(false);
  if (cap.lastChild?.nodeName === 'BR') { r.setStartBefore(cap.lastChild); r.collapse(true); }
  getSelection().removeAllRanges();
  getSelection().addRange(r);
});
await page.keyboard.type(' **bukan tebal**');
await wait();
check('mengetik di keterangan', (await out()).includes('menghapusnya. **bukan tebal**</figcaption>'), await out());
await page.keyboard.press('Enter');
await page.keyboard.type('Q');
check('Enter di keterangan pindah ke paragraf setelahnya', (await out()).includes('</figure><p>QZSeret'), await out());

// ---------- Backspace di dekat gambar ----------
await caretStart('figure + p');
await page.keyboard.press('Backspace');
await wait();
check('Backspace di awal paragraf setelah gambar -> memilih gambar', await page.$eval('.afw-content figure', (f) => f.classList.contains('afw-is-selected')));
check('teks paragraf tidak hilang', (await out()).includes('<p>QZSeret'));
await page.keyboard.press('Backspace');
await wait();
check('Backspace kedua menghapus gambar', !(await out()).includes('<figure'), await out());
await page.keyboard.type('W');
check('kursor pindah setelah gambar dihapus', (await out()).includes('<p>WQZSeret'), await out());

// ---------- Upload: drop & paste file ----------
await set('<p>Awal</p>');
await caretEnd('p');
await page.keyboard.press('Enter');
await dropOrPasteFile('drop');
await wait(200);
check('drop gambar: pratinjau + status upload', await page.$eval('.afw-content figure', (f) => f.hasAttribute('data-afw-uploading') && f.querySelector('img').src.startsWith('blob:')));
check('gambar yang sedang diupload tidak masuk output', !(await out()).includes('<figure'), await out());
await page.screenshot({ path: `${SHOTS}/13-uploading.png`, clip: { x: 0, y: 200, width: 660, height: 520 } });
await page.waitForFunction(() => !document.querySelector('.afw-content figure[data-afw-uploading]'), null, { timeout: 5000 });
o = await out();
check('setelah upload: src dari fungsi upload', /<figure><img src="data:image\/png;base64,[^"]+" alt=""><\/figure>/.test(o), o.slice(0, 120));
check('ada paragraf setelah gambar', (await dom()).trim().endsWith('<p><br></p>') || /<\/figure><p>/.test(await dom()));

await caretEnd('figure + p');
await dropOrPasteFile('paste');
await page.waitForFunction(() => document.querySelectorAll('.afw-content figure').length === 2 && !document.querySelector('.afw-content figure[data-afw-uploading]'), null, { timeout: 5000 });
check('paste gambar (screenshot)', ((await out()).match(/<figure>/g) || []).length === 2);

await dropOrPasteFile('drop', 'text/plain', 'catatan.txt');
await wait(200);
check('file bukan gambar -> pesan error', (await page.$eval('.afw-toast', (t) => t.classList.contains('afw-is-open'))) && (await page.textContent('.afw-toast')).includes('tidak didukung'), await page.textContent('.afw-toast'));

// ---------- Pemisah ----------
await set('<p>Bagian satu</p>');
await caretEnd('p');
await page.keyboard.press('Enter');
await page.keyboard.type('--- Bagian dua');
check('markdown "---" -> pemisah', (await out()) === '<p>Bagian satu</p><hr><p>Bagian dua</p>', await out());

await set('<p>A</p>');
await caretEnd('p');
await page.keyboard.press('Enter');
await page.keyboard.type('/pem');
await page.keyboard.press('Enter');
await page.keyboard.type('B');
check('slash "Pemisah"', (await out()) === '<p>A</p><hr><p>B</p>', await out());
await page.click('.afw-content hr');
await wait();
check('klik pemisah -> terpilih + toolbar tanpa ukuran', (await page.$eval('.afw-content hr', (h) => h.classList.contains('afw-is-selected'))) && !(await shown('.afw-mediabar button[aria-label="Lebar"]')));
await page.click('.afw-mediabar button[aria-label="Hapus media"]');
await wait();
check('hapus pemisah dari toolbar', (await out()) === '<p>A</p><p>B</p>', await out());

// ---------- Video ----------
await set('<p>Video:</p>');
await caretEnd('p');
await page.keyboard.press('Enter');
await page.keyboard.type('/video');
await page.keyboard.press('Enter');
await wait();
check('slash "Video" membuka input link', await shown('.afw-link-input'));
await page.keyboard.type('https://example.com/bukan-video');
await page.keyboard.press('Enter');
await wait();
check('link bukan video ditolak', (await shown('.afw-link-error')) && !(await out()).includes('iframe'));
await page.fill('.afw-link-input', 'https://youtu.be/dQw4w9WgXcQ');
await page.keyboard.press('Enter');
await wait();
o = await out();
check('embed YouTube (nocookie)', o.includes('<figure data-embed="youtube"><iframe src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ"'), o);
check('iframe tidak bisa diklik di editor (klik memilih)', await page.$eval('.afw-content iframe', (f) => getComputedStyle(f).pointerEvents === 'none'));
await page.click('.afw-content figure[data-embed]');
await wait();
check('klik video -> terpilih', await page.$eval('.afw-content figure[data-embed]', (f) => f.classList.contains('afw-is-selected')));
await page.screenshot({ path: `${SHOTS}/14-video.png`, clip: { x: 0, y: 200, width: 660, height: 560 } });

await set('<p>X</p>');
await caretEnd('p');
await page.keyboard.press('Enter');
await pasteText('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
await wait();
check('tempel link YouTube di baris kosong -> embed', (await out()).includes('data-embed="youtube"'), await out());

await set('<p>X</p>');
await caretEnd('p');
await page.keyboard.type(' lihat https://youtu.be/dQw4w9WgXcQ');
check('link YouTube di tengah kalimat tetap teks', !(await out()).includes('iframe'));

// Tempel URL saat teks terseleksi -> link
await set('<p>baca dokumentasi ini</p>');
await page.evaluate(() => {
  const t = document.querySelector('.afw-content p').firstChild;
  document.querySelector('.afw-content').focus();
  const r = document.createRange();
  r.setStart(t, 5);
  r.setEnd(t, 16);
  getSelection().removeAllRanges();
  getSelection().addRange(r);
});
await pasteText('https://docs.example.com');
check('tempel URL di atas teks terseleksi -> link', (await out()) === '<p>baca <a href="https://docs.example.com">dokumentasi</a> ini</p>', await out());

// ---------- setHTML dengan media dari luar ----------
await set('<figure><img src="https://example.com/a.png" onerror="alert(1)"></figure><iframe src="https://evil.com/x"></iframe><hr>');
o = await out();
check('setHTML: media dari luar disanitasi', o === '<figure><img src="https://example.com/a.png" alt=""></figure><hr>', o);
check('setHTML: paragraf ditambahkan setelah media terakhir', (await dom()).endsWith('<p><br></p>'));

check('tidak ada error JS', errors.filter((e) => !e.includes('example.com')).length === 0, errors.join(' | '));
console.log(results.join('\n'));
await browser.close();
