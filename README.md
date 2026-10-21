<p align="center"><img src="website/public/logo.svg" width="72" height="72" alt="afwrite"></p>

# afwrite

**English** · [Bahasa Indonesia](https://github.com/agungfwcoder/afwrite/blob/main/README.id.md)

A modern, Medium-style WYSIWYG editor built with **vanilla JS + Alpine.js**, powered by
[Tiptap](https://tiptap.dev) / [ProseMirror](https://prosemirror.net).

**Free for every feature.** There is no paid plan, no license key, and no usage limit: everything
below is MIT-licensed. [Why afwrite?](https://agungfwcoder.github.io/afwrite/more/why)

- Bubble toolbar on text selection, `/` slash commands, `+` button on empty lines
- Markdown shortcuts: `##`, `>`, `-`, `1.`, `---`, `**bold**`, `*italic*`, `` `code` ``
- Images (upload, caption, alt text, 3 sizes), YouTube/Vimeo video, dividers, code blocks
- HTML or JSON output (ProseMirror document format), draft autosave to localStorage
- Pasting from Word, Google Docs, and the web always comes out clean; HTML output is sanitized
- Consistent typing behavior across browsers (ProseMirror engine), undo/redo, read-only mode,
  `x-model`, Indonesian & English UI
- CSS isolated under the `afw` prefix — safe alongside Bootstrap, Tailwind, etc.
- Tested in Chrome, Firefox, and Safari (WebKit); ready-made Laravel integration

Full documentation (in Indonesian): https://agungfwcoder.github.io/afwrite/

## Installation

### Via CDN (no build step)

Load the afwrite script **before** Alpine; the plugin registers itself and the rest of the API is on `window.Afwrite`:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/agungfwcoder/afwrite@2/dist/afwrite.css">
<script defer src="https://cdn.jsdelivr.net/gh/agungfwcoder/afwrite@2/dist/afwrite.min.js"></script>
<script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3/dist/cdn.min.js"></script>
```

### Via a bundler

```bash
npm install github:agungfwcoder/afwrite#semver:^2 alpinejs
# once published to npm: npm install afwrite alpinejs
```

Tiptap/ProseMirror are installed as dependencies. Use it through a bundler (Vite, including Vite in
Laravel). The total size in your app is about 135 KB gzip (ProseMirror accounts for about 77 KB of
that); load it only on pages that use the editor if needed (dynamic `import()`).

```js
import Alpine from 'alpinejs';
import afwrite from 'afwrite';
import 'afwrite/style.css';

Alpine.plugin(afwrite);
Alpine.start();
```

Livewire 3/4 ships and starts its own Alpine: don't import `alpinejs` or call `Alpine.start()`.
Just `import 'afwrite'` and `import 'afwrite/style.css'`; the plugin registers itself on the
`alpine:init` event.

## Usage

```html
<form method="post">
  <div x-data="wysiwyg({ name: 'body', upload: uploadImage, lang: 'en' })">
    <p>Initial content (optional)</p>
  </div>
  <button>Save</button>
</form>
```

The UI markup (toolbar, bubble, menus) is generated automatically. The element's content becomes
the initial content, and `name` creates an `<input type="hidden">` holding the HTML, submitted with
the form.

With `x-model`:

```html
<div x-data="{ body: '' }">
  <div x-data="wysiwyg()" x-modelable="html" x-model="body"></div>
</div>
```

### Options

| Option | Default | Description |
|---|---|---|
| `name` | `''` | Hidden input name for forms |
| `lang` | `'en'` | UI language: `'en'` or `'id'` |
| `strings` | `{}` | Override some strings, e.g. `{ placeholder: 'Write…' }` (see `src/i18n.js`) |
| `placeholder` | from `lang` | Text shown while the editor is empty |
| `toolbar` | `true` | Top toolbar; `false` = bubble only (Medium style) |
| `bubble` | `true` | Bubble toolbar on text selection |
| `stats` | `true` | Word count & reading time |
| `dragHandle` | `true` | ⋮⋮ handle left of each block: drag to move, click to select |
| `readonly` | `false` | Read-only mode |
| `upload` | `null` | `async (file) => url` or `{ url, mediaId, alt }` (`mediaId` is written as `data-media-id`). Without it, images are stored as base64 |
| `maxImageSize` | `5 MB` | Maximum image size (bytes); `0` = no limit |
| `allowDataImages` | `true` | Allow `<img src="data:image/…">` in the output |
| `imageRequest` | `false` | `true` = the `image` command fires `wysiwyg-image-request` instead of opening the file dialog, so your app can show its own gallery (see [Choosing from your app's gallery](#choosing-from-your-apps-gallery)) |
| `headings` | `[2, 3]` | Heading levels in use (2–6), e.g. `[2, 3, 4, 5, 6]`. Toolbar buttons, slash menu, shortcuts, and markdown follow it; other levels are mapped to the nearest active level |
| `title` | `false` | Medium-style article mode: the topmost text is an `<h1>` title (only images/video/dividers may sit above it); the small heading button (second level) on the line right after it makes a `<p class="afw-subtitle">` subtitle |
| `formats` | all | Extra formats: `'underline'`, `'strike'`, `'color'`, `'highlight'`, `'align'`. Article mode: none (stays plain). `false` = none |
| `colors`, `highlights` | built-in palette | Text color & highlight palettes (hex); colors outside the palette are dropped |
| `extensions` | `[]` | Extra Tiptap extensions (your app's own nodes/marks) |
| `sanitize` | `null` | Whitelist for the extensions above: `{ allowTags, allowAttributes, allowClasses }` |
| `markdown` | `true` | Markdown shortcuts |
| `slash` | `true` | Slash menu |
| `pasteAsPlainText` | `false` | Strip all formatting on paste |
| `toolbarItems`, `bubbleItems` | built-in | Button layout (see `src/icons.js`) |
| `historyLimit` | `100` | Number of undo steps |
| `format` | `'html'` | Hidden input content: `'html'` or `'json'` |
| `titleName` | `''` | Name of a hidden input holding the title (article `<h1>` / first text) |
| `autosave` | `null` | `'unique-key'` or `{ key, delay }`: save drafts to localStorage |

Example `upload`:

```js
async function uploadImage(file) {
  const body = new FormData();
  body.append('image', file);
  const res = await fetch('/upload', { method: 'POST', body });
  return (await res.json()).url;
}
```

### Alpine component methods

Call them from markup inside the component or via `Alpine.$data(el)`:

| Method | Description |
|---|---|
| `getHTML()` / `setHTML(html)` | Get / replace the content (always sanitized) |
| `getJSON()` / `setJSON(doc)` | Content as a ProseMirror document JSON |
| `getMeta()` | Medium-style preview: `{ image, title, subtitle, slug }` from the first image (with `mediaId`), first text, and second text |
| `exec(command, ...args)` | Run a command, see the commands table |
| `insertImage(images)` | Insert images that already have a URL: `{ src, alt?, mediaId?, size? }` or an array of them |
| `replaceImage(image?)` | Replace the selected image (`{ src, alt?, mediaId?, size? }` or a `File`); no argument opens the gallery/file dialog |
| `isActive(command)` | Whether a format is active at the cursor |
| `setReadOnly(bool)` | Toggle read-only mode |
| `focus()` | Focus the end of the editor |
| `editor()` | The `Editor` instance (full API below) |

### Events

Dispatched from the editor element and *bubbling*, so a parent can listen:

```html
<div x-data="wysiwyg()" @wysiwyg-change="console.log($event.detail.html)"></div>
```

`wysiwyg-ready` (`{ editor }`), `wysiwyg-change` (`{ html, meta }`), `wysiwyg-focus`, `wysiwyg-blur`,
`wysiwyg-error` (`{ message }`), `wysiwyg-image-request` (`{ mode, current?, insert, pickFiles, cancel }`, only with
`imageRequest: true`).

### Choosing from your app's gallery

By default the `image` command opens the device file dialog. With `imageRequest: true` it fires the
`wysiwyg-image-request` event instead, so your app can show its own media picker (a CMS gallery
modal, for example). The event `detail` has three functions, and each one works only once, so a
double click in the gallery can't insert two images:

| Function | Description |
|---|---|
| `insert(images)` | Insert at the cursor position from when the request started. Takes `{ src, alt?, mediaId?, size? }`, an array of them, or a `FileList` |
| `pickFiles()` | Open the device file dialog instead (for an "Upload from device" button in your picker) |
| `cancel()` | Return the cursor to the editor without inserting anything |

```html
<div x-data="wysiwyg({ name: 'body', imageRequest: true, upload: uploadImage })"
     @wysiwyg-image-request="openGallery($event.detail)"></div>
```

```js
let request = null // keep it outside Alpine's reactive data
function openGallery(detail) {
  request = detail
  galleryModal.show()
}
galleryModal.onSelect = (media) => request.insert({ src: media.url, mediaId: media.id })
galleryModal.onClose = () => request?.cancel()
```

`src` follows the same rules as pasted HTML (`http(s)`, `//`, relative paths, and raster `data:`
images when `allowDataImages` is on). An invalid `src` is skipped with a `wysiwyg-error`. A
non-numeric `mediaId` is dropped. Drag & drop and pasted files still go through `upload`.

### Replacing an image

Click an image and choose **Replace image** in the media toolbar. The new image takes the old one's
place: the caption, position, and size stay, and it is a single undo step. The alt text and
`mediaId` come from the new image (the old alt described the old picture), so the alt button shows
right away when it still needs filling in.

Without `imageRequest`, the button opens the file dialog (one file, uploaded through `upload`). With
`imageRequest: true`, the same `wysiwyg-image-request` event fires, with two extra properties:

| Property | Description |
|---|---|
| `mode` | `'insert'` (the `image` command) or `'replace'` (the **Replace image** button) |
| `current` | Only with `'replace'`: `{ src, alt, mediaId }` of the image being replaced, e.g. to highlight it in your gallery |

In `'replace'` mode, `insert(image)` replaces the selected image instead of inserting a new one, and
`pickFiles()` replaces it with the chosen file. The gallery code above works unchanged; only the
modal title needs to look at `mode`:

```js
function openGallery(detail) {
  request = detail
  galleryModal.title = detail.mode === 'replace' ? 'Replace image' : 'Insert image'
  galleryModal.highlight(detail.current?.mediaId)
  galleryModal.show()
}
```

If the image was removed while the modal was open, `insert()` does nothing. If an upload for the
replacement fails, the old image comes back and `wysiwyg-error` fires.

### Commands & shortcuts

| Command | Shortcut | Markdown |
|---|---|---|
| `bold` / `italic` | Ctrl/⌘ + B / I | `**text**` / `*text*` |
| `underline` / `strike` | Ctrl/⌘ + U / Ctrl/⌘ + Shift + X | |
| `color` / `highlight` | palette in toolbar & bubble; `exec('color', '#e11d48')` | |
| `alignLeft` … `alignJustify` | Ctrl/⌘ + Shift + L / E / R / J; `exec('align', 'center')` | |
| `link` | Ctrl/⌘ + K | paste a URL over selected text |
| `h2` … `h6` | Ctrl/⌘ + Alt + 2 … 6 | `## ` … `###### ` (level must be enabled in `headings`) |
| `paragraph` | Ctrl/⌘ + Alt + 0 | |
| `quote` | Ctrl/⌘ + Shift + 9 | `> ` |
| `ul` / `ol` | Ctrl/⌘ + Shift + 8 / 7 | `- ` / `1. ` |
| `indent` / `outdent` | Tab / Shift + Tab (inside a list) | |
| `image` | | `/image`, drop a file, paste a screenshot; `exec('image', { src, mediaId })` inserts from a URL |
| `replaceImage` | | **Replace image** in the media toolbar; `exec('replaceImage', { src, mediaId })` replaces the selected image |
| `embed` | | `/video`, paste a YouTube link on an empty line |
| `hr` | | `--- ` |
| `codeblock` | Ctrl/⌘ + Alt + C | ```` ``` ```` + space, `/code` |
| `undo` / `redo` | Ctrl/⌘ + Z / Ctrl/⌘ + Shift + Z (or Ctrl + Y) | |
| move block | Ctrl/⌘ + Shift + ↑ / ↓, or drag the ⋮⋮ handle | |
| `unlink` | | |

Slash menu entries follow the UI language (`/gambar`, `/kode` with `lang: 'id'`).

Inside a code block: **Enter** = new line, **Tab / Shift+Tab** = indent, **Enter** on the last
empty line = leave the block, paste is always plain text.

When an image/video/divider is selected: **Backspace/Delete** removes it, **Enter** creates a new
paragraph below, **arrow keys** move out of the media.

## Without Alpine

The editor core doesn't depend on Alpine (no floating UI; links & video use `prompt()`):

```js
import { Editor } from 'afwrite';
import 'afwrite/style.css';

const editor = new Editor(document.querySelector('#editor'), { lang: 'en' });
editor.on('change', (html) => (input.value = html));
document.querySelector('#bold').onclick = () => editor.exec('bold');
```

The `#editor` element must be wrapped in an element with the `afw` class for styles to apply.

| `Editor` API | Description |
|---|---|
| `exec(name, ...args)`, `isActive(name)`, `state()`, `formatValues()` | Commands & format state (`formatValues()`: `{ color, highlight, align }` at the cursor) |
| `getHTML()`, `setHTML(html, { resetHistory })`, `getJSON()`, `setJSON(doc)`, `getText()`, `clear()`, `isEmpty()` | Content |
| `normalizeHTML(html)` | The HTML `getHTML()` would return after `setHTML(html)`, without changing the content; for comparing external content |
| `insertHTML(html)`, `insertText(text)`, `paste({ html, text, files })`, `insertImages(files \| images)` | Insert |
| `undo()`, `redo()`, `canUndo()`, `canRedo()` | History |
| `restoreDraft()`, `discardDraft()`, `clearDraft()`, `draft` | Autosave |
| `setReadOnly(bool)`, `focus()`, `stats()` | Other |
| `on(event, fn)` → unsubscribe function, `off()`, `destroy()` | Events |

`Editor` events: `change`, `state`, `selection`, `slash`, `history`, `readonly`, `linkrequest`,
`embedrequest`, `imagerequest`, `error`, `focus`, `blur`. `imagerequest` fires only while it has a
listener; without one, the `image` and `replaceImage` commands open the file dialog.

The Tiptap instance is available as `editor.tiptap` for advanced use (e.g.
`editor.tiptap.commands`, `editor.tiptap.state`). Changes made this way still fire the `change`
event, and the output is still limited by the sanitizer whitelist.

## JSON format

The ProseMirror/Tiptap document format, so tools from the same ecosystem can read it:

```js
editor.getJSON();
// { type: 'doc', content: [
//   { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Title' }] },
//   { type: 'paragraph', content: [
//     { type: 'text', text: 'Hello ' },
//     { type: 'text', marks: [{ type: 'bold' }], text: 'world' } ] },
//   { type: 'bulletList', content: [{ type: 'listItem', content: [{ type: 'paragraph', ... }] }] },
//   { type: 'image', attrs: { src: '/x.png', alt: '', size: 'wide' }, content: [/* caption */] },
//   { type: 'embed', attrs: { provider: 'youtube', id: '...' } },
//   { type: 'codeBlock', content: [...] }, { type: 'horizontalRule' } ] }
```

Nodes: `paragraph`, `heading` (level 2/3), `blockquote`, `bulletList`, `orderedList`, `listItem`,
`codeBlock`, `horizontalRule`, `image`, `embed`, `hardBreak`, `text`. Marks: `bold`, `italic`,
`code`, `link` (`href`). `toJSON(html)` and `fromJSON(doc)` are exported too; `fromJSON` drops
unknown nodes/marks and always sanitizes, so JSON from untrusted sources stays safe.

> Changed in v2: the v1 JSON format (`blocks` + range `marks`) is no longer supported. HTML is unchanged.

## Autosave

```html
<div x-data="wysiwyg({ name: 'body', autosave: 'post-42' })"></div>
```

Drafts are saved to localStorage on every change (1 second debounce). When the page is reopened and
a different draft exists, a **Restore / Discard** banner appears; until one is chosen, the old draft
is not overwritten. The draft is cleared automatically when its parent form is submitted.

## Laravel

A tested `<x-wysiwyg>` component, upload controller, and server-side sanitization (HTMLPurifier)
live in [`integrations/laravel`](integrations/laravel/README.md).

## Displaying content

Use the `afw-prose` class to get the same typography as in the editor:

```html
<article class="afw-prose">{!! $post->body !!}</article>
```

Dark theme: `data-afw-theme="dark"` (or `"auto"`) on `.afw` or `.afw-prose`, or a `.dark` class on
an ancestor (Tailwind, Flux, Nuxt UI), which applies immediately without a reload;
`data-afw-theme="light"` keeps it light inside `.dark`.
Full-size media in `.afw-prose` bleeds outward by `--afw-prose-bleed` (default `0`).

## Customizing the look

All colors, fonts, and sizes use `--afw-*` CSS variables:

```css
.afw, .afw-prose {
  --afw-accent: #e11d48;
  --afw-font-content: Georgia, serif;
  --afw-content-size: 1.25rem;
  --afw-quote-style: italic; /* italic quotes (default: normal) */
}
```

## Security

All incoming HTML (paste, drop, `setHTML`) and outgoing HTML (`getHTML`) goes through a whitelist:

- Tags: `p h1 (article mode) h2–h6 (per headings) blockquote ul ol li b i a code br pre figure img figcaption iframe hr`,
  plus `u s span mark` when extra formats are enabled
- Extra formats: `span[style=color]` & `mark[style=background-color]` only with palette colors (hex),
  `class="afw-align-center|right|justify"` on `p` & `h2`–`h6`
- Attributes: `a[href]` (http/https/mailto/tel/relative), `img[src alt data-media-id]` (src validated; data URLs
  only PNG/JPG/GIF/WebP/AVIF; `data-media-id` digits only), `figure[data-size data-embed]`, iframes only
  YouTube/Vimeo with `src` rebuilt from the video ID.

> **Important:** browser-side sanitization does not replace server-side sanitization. Requests can be
> sent without going through the editor, so the server must filter HTML before storing or displaying
> it (e.g. HTMLPurifier / `mews/purifier` in Laravel) with the same whitelist.

`sanitize()` can also be used directly:

```js
import { sanitize } from 'afwrite';
sanitize('<div style="x">Hi <script>x()</script><b>you</b></div>'); // '<p>Hi <b>you</b></p>'
```

## Documentation

The full documentation site (with a live editor to try) is in the [`website/`](website/README.md) folder:

```bash
cd website && npm install && npm run dev
```

## Development

```bash
npm install
npm run dev            # demo at http://localhost:5173
npm run build          # dist/
npm test               # unit tests (Vitest)

npx playwright install chromium firefox webkit   # once
npm run test:browser                             # browser tests in Chromium
npm run test:browser -- all                      # Chromium, Firefox, WebKit
```

Laravel integration: `php artisan test --filter=WyswygTest` in a Laravel project that includes the
files from `integrations/laravel`.

Layout:

```
src/
  core/        editor core without Alpine (Tiptap engine: schema, commands, sanitizer, media, markdown)
  alpine.js    Alpine component: bubble, slash menu, media toolbar, link input
  template.js  default UI markup
  i18n.js      Indonesian & English strings
  style.css    all CSS (afw prefix)
demo/          demo page
integrations/  Laravel integration (Blade, upload, server sanitization)
tests/         unit tests (Vitest) & browser tests (Playwright)
website/       documentation site (Nuxt UI Docs)
```

## Credits

Built on [Tiptap](https://tiptap.dev), [ProseMirror](https://prosemirror.net), and
[Alpine.js](https://alpinejs.dev) (all MIT licensed). Icons based on [Lucide](https://lucide.dev)
(ISC). The documentation site uses the [Nuxt UI Docs](https://github.com/nuxt-ui-templates/docs)
template (MIT, license in `website/LICENSE`).

## License

[MIT](LICENSE) © 2026 agungfwcoder
