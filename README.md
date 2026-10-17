# wyswyg

Editor WYSIWYG ringan bergaya modern, berbasis vanilla JS + Alpine.js.
Semua CSS memakai prefix `afw` sehingga aman dipakai bersama Bootstrap, Tailwind, dll.

## Menjalankan demo

```bash
npm install
npm run dev     # buka http://localhost:5173
npm run build   # hasil di dist/
npm test        # unit test (Vitest)
```

## Pemakaian (Alpine)

```js
import Alpine from 'alpinejs';
import wyswyg from 'wyswyg';
import 'wyswyg/style.css';

Alpine.plugin(wyswyg);
Alpine.start();
```

```html
<div class="afw" x-data="wysiwyg({ placeholder: 'Tulis…' })">
  <div class="afw-toolbar">
    <template x-for="(group, gi) in toolbar" :key="gi">
      <div style="display: contents">
        <span class="afw-toolbar-sep" x-show="gi > 0"></span>
        <template x-for="item in group" :key="item.command">
          <button type="button" class="afw-btn"
                  :class="{ 'afw-is-active': isActive(item.command) }"
                  :title="`${item.label} (${item.shortcut})`"
                  @mousedown.prevent @click="exec(item.command)"
                  x-html="icon(item.command)"></button>
        </template>
      </div>
    </template>
  </div>

  <!-- x-ignore wajib: mencegah Alpine mengeksekusi atribut di dalam konten -->
  <div data-afw-editor x-ignore></div>

  <input type="hidden" name="content" :value="html">
</div>
```

Tema: tambahkan `data-afw-theme="dark"` atau `"auto"` pada `.afw`.
Warna, font, dan ukuran bisa diubah lewat variabel `--afw-*`.

## Pemakaian tanpa Alpine

```js
import { Editor } from 'wyswyg';

const editor = new Editor(document.querySelector('#editor'), { placeholder: 'Tulis…' });
editor.on('change', (html) => console.log(html));
editor.exec('bold');
```

## Perintah & shortcut

| Perintah | Shortcut |
|---|---|
| `bold` | Ctrl/⌘ + B |
| `italic` | Ctrl/⌘ + I |
| `link` | Ctrl/⌘ + K |
| `h2` / `h3` | Ctrl/⌘ + Alt + 2 / 3 |
| `quote` | Ctrl/⌘ + Shift + 9 |
| `ul` / `ol` | Ctrl/⌘ + Shift + 8 / 7 |

## Sanitasi & paste

Semua HTML yang masuk dan keluar editor lewat whitelist:

- **Tag yang diizinkan:** `p, h2, h3, blockquote, ul, ol, li, b, i, a, code, br`
- **Atribut:** tidak ada, kecuali `href` pada `<a>` (hanya `http(s)`, `mailto`, `tel`, dan URL relatif)
- `h1` menjadi `h2`, `h4`–`h6` menjadi `h3`, `strong`/`em` menjadi `b`/`i`, dan `div` menjadi `p`
- Paste dari Google Docs dan Word dibersihkan (format tebal/miring dari `style` tetap terbaca)
- Paragraf kosong, spasi ganda, dan `<br>` berlebih dibuang dari output

```js
import { sanitize } from 'wyswyg';
sanitize('<div style="x">Hai <script>x()</script><b>kamu</b></div>'); // '<p>Hai <b>kamu</b></p>'
```

Opsi `pasteAsPlainText: true` membuang semua format saat paste.

> **Penting:** sanitasi di browser tidak menggantikan sanitasi di server. Request bisa
> dikirim tanpa melewati editor, jadi server tetap wajib menyaring HTML sebelum
> menyimpan atau menampilkannya (mis. HTMLPurifier / `mews/purifier` di Laravel),
> dengan whitelist yang sama seperti di atas.
