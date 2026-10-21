// Ganti gambar yang sudah ada: tombol "Ganti gambar" di toolbar media, perintah replaceImage,
// replaceMedia(deskriptor | File), imagerequest mode 'replace', upload, undo, dan regresi sisip.
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
const core = (id) => `${data(id)}.editor()`;
const out = (id) => page.evaluate(`${data(id)}.getHTML()`);
const run = (js) => page.evaluate(js);
const select = async (id) => { await run(`${core(id)}.selectMedia(0)`); await wait(); };
const fileDialog = async (action) => {
  const chooser = page.waitForEvent('filechooser', { timeout: 800 }).then((c) => c, () => null);
  await action();
  return chooser;
};

// Gambar 1x1 agar bisa diklik (img melebar mengikuti editor).
const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
const START = `<figure data-size="wide"><img src="${PNG}" alt="Lama" data-media-id="5"><figcaption>Halo</figcaption></figure><p>x</p>`;
const replaced = (img) => `<figure data-size="wide">${img}<figcaption>Halo</figcaption></figure><p>x</p>`;

await mount('ganti', '{ imageRequest: true }', START);
await run(() => {
  window.requests = [];
  window.errorsSeen = [];
  document.addEventListener('wysiwyg-image-request', (e) => window.requests.push(e.detail));
  document.addEventListener('wysiwyg-error', (e) => window.errorsSeen.push(e.detail.message));
});

// ---------- Klik gambar -> tombol Ganti gambar -> galeri ----------
await page.click('#ganti .afw-content figure img');
await wait(200);
const replaceBtn = '#ganti .afw-mediabar button[aria-label="Ganti gambar"]';
check('toolbar media: tombol "Ganti gambar" tampil untuk gambar', await page.isVisible(replaceBtn));
check('state media berisi src & mediaId',
  await run(`${data('ganti')}.media.src === '${PNG}' && ${data('ganti')}.media.mediaId === '5'`));
check('selectedMedia() berisi src & mediaId',
  await run(`(({ src, mediaId }) => src === '${PNG}' && mediaId === '5')(${core('ganti')}.selectedMedia())`));

const opened = await fileDialog(() => page.click(replaceBtn));
await wait();
check('imageRequest -> dialog file tidak dibuka', !opened);
check('event wysiwyg-image-request terpancar', (await run('window.requests.length')) === 1);
check('detail.mode === "replace" + current', await run(`(({ mode, current }) =>
  mode === 'replace' && current.src === '${PNG}' && current.alt === 'Lama' && current.mediaId === '5')(window.requests[0])`));

// Modal galeri mengambil fokus, lalu memanggil insert().
await run(() => document.activeElement.blur());
await wait(300);
await run(() => window.requests[0].insert({ src: '/storage/b.jpg', mediaId: '7' }));
await wait(200);
check('insert() mengganti di tempat: caption, ukuran tetap; alt dikosongkan; mediaId baru',
  (await out('ganti')) === replaced('<img src="/storage/b.jpg" alt="" data-media-id="7">'), await out('ganti'));
check('jumlah figure tetap satu', (await page.$$('#ganti .afw-content figure')).length === 1);
check('gambar tetap terpilih + toolbar media terbuka',
  (await run(`${core('ganti')}.selectedMedia()?.src`)) === '/storage/b.jpg' && (await run(`${data('ganti')}.media.open`)));
check('state media diperbarui (src baru)', (await run(`${data('ganti')}.media.src`)) === '/storage/b.jpg');
await run(() => window.requests[0].insert({ src: '/storage/c.jpg' }));
await wait();
check('insert() kedua diabaikan', (await out('ganti')).includes('/storage/b.jpg'));

await run(`${data('ganti')}.exec('undo')`);
await wait();
check('satu kali undo -> gambar lama kembali', (await out('ganti')) === START, await out('ganti'));

// ---------- replaceMedia(deskriptor) ----------
await select('ganti');
await run(`${core('ganti')}.replaceMedia({ src: '/c.jpg', alt: ' Baru ' })`);
await wait();
check('alt dari deskriptor dipakai; mediaId hilang', (await out('ganti')) === replaced('<img src="/c.jpg" alt="Baru">'), await out('ganti'));
await run(`${core('ganti')}.replaceMedia([{ src: '/d.jpg', size: 'full' }, { src: '/e.jpg' }])`);
await wait();
check('array -> elemen pertama; size dari deskriptor dipakai',
  (await out('ganti')) === '<figure data-size="full"><img src="/d.jpg" alt=""><figcaption>Halo</figcaption></figure><p>x</p>', await out('ganti'));
const beforeBad = await out('ganti');
await run(`${data('ganti')}.replaceImage({ src: 'javascript:alert(1)' })`);
await wait();
check('src berbahaya -> gambar lama utuh', (await out('ganti')) === beforeBad, await out('ganti'));
check('src berbahaya -> event error', (await run('window.errorsSeen')).includes('Alamat gambar tidak valid.'));

// ---------- Seleksi bukan gambar ----------
await run(`${data('ganti')}.setHTML('<p>Satu</p><figure data-embed="youtube"><iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ"></iframe></figure><hr><p>x</p>')`);
await page.click('#ganti .afw-content p');
const plain = await out('ganti');
await run(`${core('ganti')}.replaceMedia({ src: '/z.jpg' })`);
await run(`${data('ganti')}.exec('replaceImage')`);
await run(`${core('ganti')}.selectMedia(document.querySelector('#ganti .afw-content figure'))`);
await run(`${data('ganti')}.exec('replaceImage', { src: '/z.jpg' })`);
await run(`${data('ganti')}.exec('replaceImage')`);
await run(`${core('ganti')}.selectMedia(document.querySelector('#ganti .afw-content hr'))`);
await run(`${core('ganti')}.replaceMedia({ src: '/z.jpg' })`);
await wait();
check('paragraf / video / pemisah -> tidak berbuat apa-apa', (await out('ganti')) === plain && (await run('window.requests.length')) === 1, await out('ganti'));
check('video: tombol "Ganti gambar" disembunyikan', !(await page.isVisible(replaceBtn)));

// ---------- cancel() ----------
await run(`${data('ganti')}.setHTML(${JSON.stringify(START)})`);
await select('ganti');
const undoBefore = await run(`${core('ganti')}.tiptap.can().undo()`);
await run(`${data('ganti')}.exec('replaceImage')`);
await run(() => document.activeElement.blur());
await run(() => window.requests.at(-1).cancel());
await wait();
check('cancel(): tidak ada perubahan', (await out('ganti')) === START, await out('ganti'));
check('cancel(): gambar tetap terpilih', (await run(`${core('ganti')}.selectedMedia()?.mediaId`)) === '5');
check('cancel(): tidak ada langkah undo baru', (await run(`${core('ganti')}.tiptap.can().undo()`)) === undoBefore);

// ---------- pickFiles() pada mode ganti ----------
await run(`${data('ganti')}.exec('replaceImage')`);
const chooser = await fileDialog(() => run(() => window.requests.at(-1).pickFiles()));
check('pickFiles() membuka dialog satu file', !!chooser && !chooser.isMultiple());
await chooser?.setFiles({ name: 'baru.png', mimeType: 'image/png', buffer: Buffer.from(PNG.split(',')[1], 'base64') });
await page.waitForFunction(() => !document.querySelector('#ganti .afw-content figure[data-afw-uploading]'), null, { timeout: 5000 });
await wait();
check('file dari dialog menggantikan gambar (data URL, caption & ukuran tetap)',
  /^<figure data-size="wide"><img src="data:image\/png;base64,[^"]+" alt=""><figcaption>Halo<\/figcaption><\/figure><p>x<\/p>$/.test(await out('ganti'))
    && (await page.$$('#ganti .afw-content figure')).length === 1, await out('ganti'));

// ---------- Regresi: perintah image tetap menyisipkan ----------
await page.click('#ganti .afw-content p');
await run(`${data('ganti')}.exec('image')`);
check('exec("image") -> detail.mode === "insert", tanpa current',
  await run(() => window.requests.at(-1).mode === 'insert' && !('current' in window.requests.at(-1))));
await run(() => window.requests.at(-1).cancel());

// ---------- Upload: placeholder -> berhasil / gagal ----------
await mount('unggah', `{ upload: (file) => new Promise((ok, fail) => setTimeout(() =>
  file.name === 'gagal.png' ? fail(new Error('x')) : ok({ url: '/up/' + file.name, mediaId: '9' }), 300)) }`, START);
await run(() => {
  window.uploadErrors = [];
  document.addEventListener('wysiwyg-error', (e) => window.uploadErrors.push(e.detail.message));
});
const file = (name) => `new File([Uint8Array.from(atob('${PNG.split(',')[1]}'), (c) => c.charCodeAt(0))], '${name}', { type: 'image/png' })`;
await select('unggah');
await run(`void ${core('unggah')}.replaceMedia(${file('ok.png')})`); // jangan tunggu upload
await wait(60);
const placeholder = await page.$eval('#unggah .afw-content figure', (f) => ({
  uploading: f.hasAttribute('data-afw-uploading'), src: f.querySelector('img').src.slice(0, 5), caption: f.querySelector('figcaption').textContent }));
check('upload: placeholder (blob + status upload) di figure yang sama',
  placeholder.uploading && placeholder.src === 'blob:' && placeholder.caption === 'Halo', JSON.stringify(placeholder));
await page.waitForFunction(() => !document.querySelector('#unggah .afw-content figure[data-afw-uploading]'), null, { timeout: 5000 });
check('upload berhasil: src & mediaId baru', (await out('unggah')) === replaced('<img src="/up/ok.png" alt="" data-media-id="9">'), await out('unggah'));
check('upload berhasil: gambar tetap terpilih', (await run(`${core('unggah')}.selectedMedia()?.mediaId`)) === '9');
await run(`${data('unggah')}.exec('undo')`);
await wait();
check('undo setelah upload -> langsung gambar lama (tanpa keadaan upload)', (await out('unggah')) === START, await out('unggah'));

await select('unggah');
await run(`${core('unggah')}.replaceMedia(${file('gagal.png')})`);
await page.waitForFunction(() => !document.querySelector('#unggah .afw-content figure[data-afw-uploading]'), null, { timeout: 5000 });
await wait();
check('upload gagal: atribut lama kembali', (await out('unggah')) === START, await out('unggah'));
check('upload gagal: event error', (await run('window.uploadErrors')).some((m) => m.includes('gagal.png')));

// ---------- Tanpa imageRequest: tombol membuka dialog file ----------
await mount('biasa', '{}', START);
await page.click('#biasa .afw-content figure img');
await wait(200);
const plainChooser = await fileDialog(() => page.click('#biasa .afw-mediabar button[aria-label="Ganti gambar"]'));
check('tanpa imageRequest -> dialog file (satu file)', !!plainChooser && !plainChooser.isMultiple());

check('tanpa error di halaman', errors.length === 0, errors.join(' | '));

console.log(results.join('\n'));
await browser.close();
