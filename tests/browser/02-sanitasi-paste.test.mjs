
import { launch, SHOTS, BASE_URL } from './setup.mjs';

const { engine, browser } = await launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 1100 } });
const errors = [];
const dialogs = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
page.on('dialog', (d) => { dialogs.push(d.message()); d.dismiss(); });

const results = [];
const bail = (e) => { console.log(results.join('\n')); console.log('ERROR', e.message.split('\n')[0]); process.exit(1); };
process.on('uncaughtException', bail);
process.on('unhandledRejection', bail);
const check = (name, ok, extra = '') => results.push(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? '  -> ' + extra : ''}`);
const dom = () => page.$eval('.afw-content', (el) => el.innerHTML);
const out = () => page.$eval('input[name=content]', (i) => i.value);
const set = (html) => page.evaluate((h) => Alpine.$data(document.querySelector('.afw')).setHTML(h), html);

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
const paste = (html, text = '') => fire('paste', { html, text });
const caretAt = (selector, offset = 'end') => page.evaluate(([sel, off]) => {
  const el = document.querySelector('.afw-content').querySelector(sel);
  const text = el.firstChild;
  const range = document.createRange();
  range.setStart(text, off === 'end' ? text.length : off);
  range.collapse(true);
  document.querySelector('.afw-content').focus();
  getSelection().removeAllRanges();
  getSelection().addRange(range);
}, [selector, offset]);

await page.goto(`${BASE_URL}/`);
await page.waitForSelector('.afw-btn');

// --- Paste dari demo (tombol simulasi) ---
await set('');
await page.click('.demo-chip:has-text("Google Docs")');
let o = await out();
check('paste Google Docs bersih', o === '<h2>Dari Google Docs</h2><p>Teks biasa, <b>tebal</b>, dan <i>miring</i>.</p><ul><li>Item satu</li><li>Item dua</li></ul>', o);
check('DOM editor tanpa span/style', !/<span|style=|class=|dir=/.test(await dom()), await dom());

await set('');
await page.click('.demo-chip:has-text("Microsoft Word")');
o = await out();
check('paste Word bersih', o === '<p><b>Dari Microsoft Word</b></p><p>Simbol bullet palsu dari Word dibuang</p><p><i>Catatan</i> akhir</p>', o);

await set('');
await page.click('.demo-chip:has-text("HTML berbahaya")');
await page.waitForTimeout(300);
o = await out();
const d = await dom();
check('paste berbahaya: tidak ada alert', dialogs.length === 0, dialogs.join(','));
check('paste berbahaya: tanpa script/img/iframe/on*/x-', !/<script|<img|<iframe|on\w+=|x-init|javascript:/i.test(d + o), d);
check('paste berbahaya: link aman tetap ada', o.includes('<a href="https://example.com">link aman</a>'), o);

await set('');
await page.click('.demo-chip:has-text("Teks polos")');
o = await out();
check('paste teks polos jadi paragraf', o === '<p>Paragraf pertama dari teks polos.<br>Baris kedua masih di paragraf yang sama.</p><p>Paragraf kedua. Karakter &lt;b&gt;HTML&lt;/b&gt; tetap jadi teks.</p>', o);

// --- Paste satu baris di tengah paragraf: tidak memecah paragraf ---
await set('<p>Halo dunia</p>');
await caretAt('p', 5);
await paste('<p style="color:red"><b>indah</b> </p>', 'indah ');
o = await out();
check('paste inline di tengah paragraf', o === '<p>Halo <b>indah</b> dunia</p>', o);

await set('<p>awal akhir</p>');
await caretAt('p', 5);
await paste('', 'teks biasa ');
o = await out();
check('paste teks satu baris di tengah paragraf', o === '<p>awal teks biasa akhir</p>', o);

// --- Undo setelah paste ---
await set('<p>abc</p>');
await caretAt('p');
await paste('<p>XYZ</p>', 'XYZ');
await page.keyboard.press('ControlOrMeta+z');
o = await out();
check('undo membatalkan paste', o === '<p>abc</p>', o);

// --- Pembersihan langsung: Backspace menggabung blok (Chrome biasanya membuat <span style>) ---
await set('<h2>Judul</h2><p>isi <b>tebal</b></p>');
await caretAt('p', 0);
await page.keyboard.press('Backspace');
check('gabung p ke h2 tanpa span', !/<span|style=/.test(await dom()), await dom());
await page.keyboard.type('X');
check('kursor tetap di posisi setelah dibersihkan', (await out()).startsWith('<h2>JudulXisi'), await out());

await set('<p>satu</p><h3>dua</h3>');
await caretAt('p');
await page.keyboard.press('Delete');
check('gabung h3 ke p (Delete) tanpa span', !/<span|style=/.test(await dom()), await dom());

// --- setHTML dari luar disanitasi ---
await set('<div style="x"><h1 onclick="a()">T</h1><script>alert(1)</script>isi</div>');
o = await out();
check('setHTML disanitasi', o === '<h2>T</h2><p>isi</p>', o);
check('DOM setHTML juga bersih', (await dom()) === '<h2>T</h2><p>isi</p>', await dom());

// --- Drop HTML dari luar ---
await set('<p>target</p>');
const box = await page.$eval('.afw-content p', (p) => { const r = p.getBoundingClientRect(); return { x: r.right - 2, y: r.top + r.height / 2 }; });
await fire('drop', { html: '<span style="color:red"> <i>dijatuhkan</i></span>', text: ' dijatuhkan', point: box });
o = await out();
check('drop HTML disanitasi', /^<p>target ?<i>dijatuhkan<\/i><\/p>$/.test(o), o);

// --- Output: paragraf kosong di akhir tidak ikut ---
await set('<p>a</p>');
await caretAt('p');
await page.keyboard.press('Enter');
await page.keyboard.press('Enter');
o = await out();
check('paragraf kosong tidak masuk output', o === '<p>a</p>', o);

await set('');
await page.click('.demo-chip:has-text("Google Docs")');
await page.screenshot({ path: `${SHOTS}/5-termin2.png`, fullPage: true });

check('tidak ada error JS', errors.length === 0, errors.join(' | '));
console.log(results.join('\n'));
await browser.close();
