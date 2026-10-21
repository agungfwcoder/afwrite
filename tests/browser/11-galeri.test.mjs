// Gambar dari galeri aplikasi: opsi imageRequest, event wysiwyg-image-request (insert / pickFiles /
// cancel), deskriptor { src, mediaId } lewat exec('image') / insertImage(), validasi src, dan undo.
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

async function mount(id, options = '{}', content = '<p>x</p>') {
  await page.evaluate(({ id, html }) => {
    document.getElementById(`${id}-host`)?.remove();
    const host = document.createElement('div');
    host.id = `${id}-host`;
    host.innerHTML = html;
    document.body.append(host);
  }, { id, html: `<div id="${id}" x-data="wysiwyg({ lang: 'id', ...${options} })">${content}</div>` });
  await page.waitForSelector(`#${id} .afw-content`);
}
const data = (id) => `Alpine.$data(document.getElementById('${id}'))`;
const out = (id) => page.evaluate(`${data(id)}.getHTML()`);
const caretEnd = (id, index) => page.evaluate(({ id, index }) => {
  const block = document.querySelectorAll(`#${id} .afw-content > *`)[index];
  const range = document.createRange();
  range.selectNodeContents(block);
  range.collapse(false);
  getSelection().removeAllRanges();
  getSelection().addRange(range);
}, { id, index });
// Dialog file dibuka? (input type=file diklik)
const fileDialog = async (action) => {
  const chooser = page.waitForEvent('filechooser', { timeout: 800 }).then(() => true, () => false);
  await action();
  return chooser;
};

await mount('galeri', '{ imageRequest: true }', '<p>Satu</p><p>Dua</p>');
await page.evaluate(() => {
  window.requests = [];
  window.errorsSeen = [];
  document.addEventListener('wysiwyg-image-request', (e) => window.requests.push(e.detail));
  document.addEventListener('wysiwyg-error', (e) => window.errorsSeen.push(e.detail.message));
});

// ---------- Slash menu -> event, bukan dialog file ----------
await page.click('#galeri .afw-content');
await caretEnd('galeri', 0);
await page.keyboard.press('Enter');
await page.keyboard.type('/gam');
await wait();
const slashText = await page.$eval('#galeri .afw-menu', (el) => el.textContent);
check('slash: deskripsi "pilih dari galeri"', slashText.includes('Unggah atau pilih dari galeri'), slashText);
const opened = await fileDialog(() => page.keyboard.press('Enter'));
await wait();
check('imageRequest -> dialog file tidak dibuka', !opened);
check('imageRequest -> event wysiwyg-image-request', (await page.evaluate('window.requests.length')) === 1);
check('detail berisi insert/pickFiles/cancel', await page.evaluate(() => ['insert', 'pickFiles', 'cancel'].every((k) => typeof window.requests[0][k] === 'function')));

// Seleksi pindah (modal galeri mengambil fokus), lalu galeri memanggil insert().
await caretEnd('galeri', 2);
await page.evaluate(() => document.activeElement.blur());
await wait(600);
await page.evaluate(() => window.requests[0].insert({ src: '/storage/a.jpg', mediaId: '12' }));
await wait();
const expected = '<p>Satu</p><figure><img src="/storage/a.jpg" alt="" data-media-id="12"></figure><p>Dua</p>';
check('insert() di posisi seleksi tersimpan + data-media-id', (await out('galeri')) === expected, await out('galeri'));
await page.evaluate(() => window.requests[0].insert({ src: '/storage/b.jpg' }));
await wait();
check('insert() kedua diabaikan', (await out('galeri')) === expected, await out('galeri'));
await page.evaluate(`${data('galeri')}.exec('undo')`);
await wait();
const undone = await out('galeri');
check('undo menghapus gambar dalam satu langkah', !undone.includes('<figure') && undone.includes('Satu') && undone.includes('Dua'), undone);

// ---------- cancel() ----------
await page.evaluate(`${data('galeri')}.setHTML('<p>Satu</p><p>Dua</p>')`);
await page.click('#galeri .afw-content');
await caretEnd('galeri', 0);
await page.evaluate(`${data('galeri')}.exec('image')`);
await page.evaluate(() => document.activeElement.blur());
await page.evaluate(() => window.requests.at(-1).cancel());
await wait();
check('cancel(): tidak ada gambar', !(await out('galeri')).includes('<figure'), await out('galeri'));
check('cancel(): fokus kembali ke editor', await page.evaluate(() => document.activeElement?.closest('#galeri') !== null));
await page.keyboard.type('!');
check('cancel(): kursor kembali ke posisi semula', (await out('galeri')) === '<p>Satu!</p><p>Dua</p>', await out('galeri'));

// ---------- pickFiles() ----------
await page.evaluate(`${data('galeri')}.exec('image')`);
check('pickFiles() membuka dialog file', await fileDialog(() => page.evaluate(() => window.requests.at(-1).pickFiles())));

// ---------- insertImage(): array, ukuran, validasi ----------
await page.evaluate(`${data('galeri')}.setHTML('<p>x</p>')`);
await page.click('#galeri .afw-content');
await caretEnd('galeri', 0);
await page.evaluate(`${data('galeri')}.insertImage([{ src: '/a.jpg', alt: ' A ' }, { src: 'https://cdn.com/b.png', size: 'wide', mediaId: 'abc' }])`);
await wait();
check('array deskriptor -> beberapa figure berurutan',
  (await out('galeri')) === '<p>x</p><figure><img src="/a.jpg" alt="A"></figure><figure data-size="wide"><img src="https://cdn.com/b.png" alt=""></figure>', await out('galeri'));
const before = await out('galeri');
await page.evaluate(`${data('galeri')}.insertImage({ src: 'javascript:alert(1)' })`);
await wait();
check('src berbahaya -> tidak disisipkan', (await out('galeri')) === before, await out('galeri'));
check('src berbahaya -> event error', (await page.evaluate('window.errorsSeen')).includes('Alamat gambar tidak valid.'));

// ---------- Tanpa imageRequest: perilaku lama ----------
await mount('biasa', '{}', '<p>x</p>');
await page.click('#biasa .afw-content');
check('tanpa imageRequest -> dialog file dibuka', await fileDialog(() => page.evaluate(`${data('biasa')}.exec('image')`)));
await page.click('#biasa .afw-content');
await caretEnd('biasa', 0);
await page.keyboard.press('Enter');
await page.keyboard.type('/gam');
await wait();
check('slash tanpa imageRequest: "Unggah dari perangkat"', (await page.$eval('#biasa .afw-menu', (el) => el.textContent)).includes('Unggah dari perangkat'));
await page.keyboard.press('Escape');

check('tanpa error di halaman', errors.length === 0, errors.join(' | '));

console.log(results.join('\n'));
await browser.close();
