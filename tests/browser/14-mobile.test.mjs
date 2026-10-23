// Perangkat sentuh dengan keyboard virtual: elemen melayang diukur terhadap visualViewport (area di
// atas keyboard), seleksi lewat sentuhan digeser ke area terlihat, dan posisi diperbarui saat
// keyboard muncul. Keyboard disimulasikan dengan visualViewport tiruan, karena Playwright tidak bisa
// menampilkan keyboard HP sungguhan.
import { launch, BASE_URL } from './setup.mjs';

const { browser } = await launch();
const context = await browser.newContext({
  viewport: { width: 360, height: 780 }, // ukuran CSS Galaxy S23
  isMobile: true,
  hasTouch: true,
  deviceScaleFactor: 3,
});
// visualViewport tiruan: tingginya bisa dikurangi seperti saat keyboard muncul (__keyboard(px)).
await context.addInitScript(() => {
  const target = new EventTarget();
  let keyboard = 0;
  const fake = {
    get offsetLeft() { return 0; },
    get offsetTop() { return 0; },
    get width() { return innerWidth; },
    get height() { return innerHeight - keyboard; },
    get scale() { return 1; },
    addEventListener: target.addEventListener.bind(target),
    removeEventListener: target.removeEventListener.bind(target),
  };
  Object.defineProperty(window, 'visualViewport', { configurable: true, get: () => fake });
  window.__keyboard = (px) => {
    keyboard = px;
    target.dispatchEvent(new Event('resize'));
  };
});
const page = await context.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));

const results = [];
const bail = (e) => { console.log(results.join('\n')); console.log('ERROR', e.message.split('\n')[0]); process.exit(1); };
process.on('uncaughtException', bail);
process.on('unhandledRejection', bail);
const check = (name, ok, extra = '') => results.push(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? '  -> ' + String(extra).slice(0, 300) : ''}`);
const wait = (ms = 150) => page.waitForTimeout(ms);
const KEYBOARD = 330;

await page.goto(`${BASE_URL}/tests/browser/pages/vanilla.html`);
await page.waitForSelector('#ed .afw-content');
check('perangkat sentuh (pointer: coarse)', await page.evaluate(() => matchMedia('(pointer: coarse)').matches));

const lines = Array.from({ length: 40 }, (_, i) => `<p>Baris ${i + 1} kalimat contoh</p>`).join('');
await page.evaluate((html) => ed.setHTML(html), lines);

// Pilih teks di paragraf pertama yang bagian bawahnya berada di [dari, sampai] (koordinat layar),
// tanpa menggulir. Mengembalikan nomor paragrafnya.
const selectNear = (from, to) => page.evaluate(({ from, to }) => {
  const paragraphs = [...document.querySelectorAll('#ed .afw-content p')];
  const index = paragraphs.findIndex((p) => {
    const r = p.getBoundingClientRect();
    return r.bottom >= from && r.bottom <= to;
  });
  if (index < 0) return -1;
  const text = paragraphs[index].firstChild;
  const content = document.querySelector('#ed .afw-content');
  content.focus({ preventScroll: true });
  const range = document.createRange();
  range.setStart(text, 0);
  range.setEnd(text, 5);
  getSelection().removeAllRanges();
  getSelection().addRange(range);
  return index;
}, { from, to });
const layout = () => page.evaluate(() => {
  const bubble = document.querySelector('#ed .afw-bubble-main');
  const b = bubble.getBoundingClientRect();
  const s = getSelection().rangeCount ? getSelection().getRangeAt(0).getBoundingClientRect() : null;
  return {
    open: bubble.classList.contains('afw-is-open') && bubble.classList.contains('afw-is-ready'),
    pinned: bubble.classList.contains('afw-is-pinned'),
    bubbleTop: b.top,
    bubbleBottom: b.bottom,
    selTop: s?.top,
    selBottom: s?.bottom,
    visibleBottom: visualViewport.offsetTop + visualViewport.height,
    scrollY,
  };
});

// Tunggu sampai kondisi terpenuhi (posisi elemen melayang diselesaikan lewat beberapa frame + reveal).
const until = async (fn, ms = 2500) => {
  const deadline = Date.now() + ms;
  while (Date.now() < deadline) { if (await fn()) return true; await wait(60); }
  return false;
};
const visibleBottom = 780 - KEYBOARD;

// ---------- Tanpa keyboard: dipatok ke seleksi, tanpa scroll berlebih ----------
await page.evaluate(() => { __keyboard(0); scrollTo(0, 0); getSelection().removeAllRanges(); });
await wait(200);
const mid = await selectNear(300, 420);
await until(async () => (await layout()).open);
await wait(300);
let l = await layout();
check('tanpa keyboard: bubble di bawah seleksi', mid >= 0 && l.open && !l.pinned && l.bubbleTop >= l.selBottom, JSON.stringify(l));
check('tanpa keyboard: halaman tidak digeser', l.scrollY === 0, l.scrollY);

// ---------- Keyboard terbuka, seleksi tepat di atas keyboard ----------
await page.keyboard.press('Escape');
await page.evaluate(() => { getSelection().removeAllRanges(); scrollTo(0, 0); });
await wait(150);
await page.evaluate((px) => __keyboard(px), KEYBOARD);
await wait(200);
const low = await selectNear(visibleBottom - 50, visibleBottom - 8);
check('keyboard: seleksi dekat keyboard dipilih', low >= 0, low);
check('keyboard: bilah menempel di atas keyboard (pinned)', await until(async () => (await layout()).pinned), JSON.stringify(await layout()));
await wait(500); // reveal (350ms) + repin
l = await layout();
check('keyboard: bilah terlihat di atas keyboard', l.open && l.bubbleBottom <= l.visibleBottom, JSON.stringify(l));
check('keyboard: halaman digeser, seleksi terlihat di atas bilah', l.scrollY > 0 && l.selBottom <= l.bubbleTop && l.selTop >= 0, JSON.stringify(l));

// ---------- Keyboard muncul saat bubble sudah terbuka ----------
await page.evaluate(() => { __keyboard(0); getSelection().removeAllRanges(); scrollTo(0, 0); });
await wait(200);
await selectNear(560, 640);
await until(async () => (await layout()).open);
await wait(300);
l = await layout();
const before = l.scrollY;
check('bubble terbuka sebelum keyboard muncul', l.open && !l.pinned && l.bubbleTop >= l.selBottom, JSON.stringify(l));
await page.evaluate((px) => __keyboard(px), KEYBOARD);
check('keyboard muncul: bilah pindah ke pinned', await until(async () => (await layout()).pinned), JSON.stringify(await layout()));
await wait(500);
l = await layout();
check('keyboard muncul: bilah terlihat & seleksi di atasnya', l.open && l.bubbleBottom <= l.visibleBottom && l.selBottom <= l.bubbleTop, JSON.stringify(l));
check('keyboard muncul: halaman digeser', l.scrollY > before, `${before} -> ${l.scrollY}`);

// ---------- Keyboard hilang: kembali dipatok ke seleksi ----------
await page.evaluate(() => { __keyboard(0); getSelection().removeAllRanges(); scrollTo(0, 0); });
await wait(200);
await selectNear(300, 420);
await until(async () => (await layout()).open);
await wait(300);
l = await layout();
check('keyboard hilang: bilah tidak lagi pinned', l.open && !l.pinned, JSON.stringify(l));

// ---------- Slash menu dekat keyboard ----------
await page.keyboard.press('Escape');
await page.evaluate(() => { getSelection().removeAllRanges(); scrollTo(0, 0); });
await page.evaluate((px) => __keyboard(px), KEYBOARD);
await wait(200);
const slashLine = await selectNear(visibleBottom - 60, visibleBottom - 10);
// Kursor di akhir paragraf lewat skrip: tombol End tidak berlaku di emulasi mobile.
await page.evaluate((index) => {
  const text = document.querySelectorAll('#ed .afw-content p')[index].firstChild;
  getSelection().collapse(text, text.length);
}, slashLine);
await wait();
await page.keyboard.press('Enter');
await page.keyboard.type('/');
await until(async () => page.$eval('#ed .afw-menu', (m) => m.classList.contains('afw-is-ready')).catch(() => false));
await wait(300);
const menu = await page.evaluate(() => {
  const m = document.querySelector('#ed .afw-menu');
  const r = m.getBoundingClientRect();
  return { open: m.classList.contains('afw-is-ready'), top: r.top, bottom: r.bottom, visibleBottom: visualViewport.offsetTop + visualViewport.height };
});
check('slash menu dekat keyboard: terbuka', slashLine >= 0 && menu.open, JSON.stringify(menu));
check('slash menu dekat keyboard: tidak tertutup keyboard', menu.bottom <= menu.visibleBottom && menu.top >= 0, JSON.stringify(menu));

check('tanpa error halaman', errors.length === 0, errors.join(' | '));
console.log(results.join('\n'));
await browser.close();
