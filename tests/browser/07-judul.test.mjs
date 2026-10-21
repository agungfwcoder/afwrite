// Opsi `headings`: level judul H2-H6 di toolbar, bubble, slash menu, markdown, dan shortcut.
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

// ---------- Bawaan: hanya H2 & H3 ----------
const labels = (root, area) => page.$$eval(`${root} ${area} .afw-btn`, (els) => els.map((b) => b.getAttribute('aria-label')));
let toolbar = await labels('.demo-panel-editor .afw', '.afw-toolbar');
check('bawaan: toolbar hanya Judul & Subjudul', toolbar.includes('Judul') && toolbar.includes('Subjudul') && !toolbar.some((l) => /Judul [4-6]/.test(l)), JSON.stringify(toolbar));

// ---------- Editor dengan headings [2..6] ----------
await page.evaluate(() => {
  const host = document.createElement('div');
  host.id = 'judul-host';
  host.innerHTML = '<div id="judul" x-data="wysiwyg({ name: \'judul\', lang: \'id\', headings: [2, 3, 4, 5, 6], autosave: null })"><p>x</p></div>';
  document.body.append(host);
});
await page.waitForSelector('#judul .afw-btn');
const out = () => page.evaluate(() => Alpine.$data(document.getElementById('judul')).getHTML());
const set = async (html) => {
  await page.evaluate((h) => Alpine.$data(document.getElementById('judul')).setHTML(h), html);
  await page.click('#judul .afw-content');
  await page.keyboard.press('ControlOrMeta+End');
};

toolbar = await labels('#judul', '.afw-toolbar');
check('toolbar berisi H2-H6', ['Judul', 'Subjudul', 'Judul 4', 'Judul 5', 'Judul 6'].every((l) => toolbar.includes(l)), JSON.stringify(toolbar));

await set('<p>Bab</p>');
await page.click('#judul .afw-toolbar .afw-btn[aria-label="Judul 5"]');
check('tombol Judul 5 -> <h5>', (await out()) === '<h5>Bab</h5>', await out());
check('tombol Judul 5 aktif', await page.$eval('#judul .afw-toolbar .afw-btn[aria-label="Judul 5"]', (b) => b.classList.contains('afw-is-active')));
await page.click('#judul .afw-toolbar .afw-btn[aria-label="Judul 5"]');
check('klik lagi kembali ke <p>', (await out()) === '<p>Bab</p>', await out());

await set('<p>Bagian</p>');
await page.keyboard.press('ControlOrMeta+Alt+Digit6');
check('Ctrl/Cmd+Alt+6 -> <h6>', (await out()) === '<h6>Bagian</h6>', await out());

await set('');
await page.keyboard.type('#### Empat');
check('markdown #### -> <h4>', (await out()) === '<h4>Empat</h4>', await out());

await set('');
await page.keyboard.type('/');
await wait();
const slash = await page.$$eval('#judul .afw-menu-item .afw-menu-label', (els) => els.map((e) => e.textContent));
check('slash menu berisi 5 judul', ['Judul', 'Subjudul', 'Judul 4', 'Judul 5', 'Judul 6'].every((l) => slash.includes(l)) && slash.length === 13, JSON.stringify(slash));
await page.keyboard.press('Escape');

// Bubble: paling banyak 2 level judul.
await set('<p>blok teks</p>');
await page.keyboard.down('Shift'); for (let i = 0; i < 4; i++) await page.keyboard.press('ArrowLeft'); await page.keyboard.up('Shift');
await wait(250);
const bubble = await page.$$eval('#judul .afw-bubble:not(.afw-mediabar) .afw-bubble-row:not(.afw-is-hidden) .afw-btn', (els) => els.map((b) => b.getAttribute('aria-label')));
check('bubble: Judul & Subjudul saja', bubble.includes('Judul') && bubble.includes('Subjudul') && !bubble.some((l) => /Judul [4-6]/.test(l)), JSON.stringify(bubble));

// Paste & setHTML mempertahankan level aktif.
await set('<h4>a</h4><h6>b</h6><h1>c</h1>');
check('setHTML: h4 & h6 dipertahankan, h1 -> h2', (await out()) === '<h4>a</h4><h6>b</h6><h2>c</h2>', await out());
check('getJSON: level 6', (await page.evaluate(() => Alpine.$data(document.getElementById('judul')).getJSON().content[1].attrs.level)) === 6);
check('input hidden ikut', (await page.$eval('input[name=judul]', (i) => i.value)) === '<h4>a</h4><h6>b</h6><h2>c</h2>');

// ---------- Editor bawaan tetap menurunkan h4 ke h3 ----------
await page.evaluate(() => Alpine.$data(document.querySelector('.demo-panel-editor .afw')).setHTML('<h4>a</h4><h5>b</h5>'));
const demoOut = await page.evaluate(() => Alpine.$data(document.querySelector('.demo-panel-editor .afw')).getHTML());
check('bawaan: h4/h5 -> h3', demoOut === '<h3>a</h3><h3>b</h3>', demoOut);
await page.click('.demo-panel-editor .afw-content');
await page.keyboard.press('ControlOrMeta+Alt+Digit5');
check('bawaan: Ctrl/Cmd+Alt+5 tidak mengubah apa-apa', (await page.evaluate(() => Alpine.$data(document.querySelector('.demo-panel-editor .afw')).getHTML())) === '<h3>a</h3><h3>b</h3>');

// Ikon: lebih dari dua level = H2/H3/..., tepat dua level (bawaan demo) = T besar & t kecil.
const iconOf = (root, label) => page.$eval(`${root} .afw-toolbar .afw-btn[aria-label="${label}"]`, (b) => b.innerHTML);
const ICON_T = 'M5 7V5h14v2';
check('ikon H saat lebih dari dua level', !(await iconOf('#judul', 'Judul')).includes(ICON_T));
check('ikon T besar & t kecil saat dua level', (await iconOf('.demo-panel-editor .afw', 'Judul')).includes(ICON_T) && (await iconOf('.demo-panel-editor .afw', 'Subjudul')).includes('M8 12v-1.5h8V12'));

check('tidak ada error JS', errors.length === 0, errors.join(' | '));
console.log(results.join('\n'));
await browser.close();
