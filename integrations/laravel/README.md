# Integrasi Laravel

File di folder ini disalin ke proyek Laravel Anda (struktur foldernya sama):

| File | Isi |
|---|---|
| `app/Support/WyswygHtml.php` | Sanitasi HTML di server, whitelist sama dengan editor |
| `app/Http/Controllers/WyswygUploadController.php` | Upload gambar dari editor |
| `resources/views/components/wysiwyg.blade.php` | Komponen `<x-wysiwyg>` |
| `resources/js/wyswyg.js` | Memuat afwrite + fungsi upload (dengan token CSRF) |
| `tests/Feature/WyswygTest.php` | Feature test untuk ketiganya |

Diuji dengan Laravel 13 + Livewire 4 + `ezyang/htmlpurifier` (`php artisan test --filter=WyswygTest`).
Livewire 4 (x-model `$wire`, simpan, reload, `wire:navigate`) diuji dengan Playwright.

Komponen Blade memakai Alpine. Tanpa Alpine (mis. Inertia + React/Vue), pakai wrapper di
[`examples/`](../../examples) untuk sisi depan; controller upload dan `WyswygHtml::clean()` tetap sama.

## 1. Pasang

```bash
npm install github:agungfwcoder/afwrite#semver:^2 alpinejs
composer require ezyang/htmlpurifier
php artisan storage:link
```

Impor `resources/js/wyswyg.js` dari `resources/js/app.js`. Tanpa Livewire, jalankan Alpine sendiri:

```js
import Alpine from 'alpinejs';
import './wyswyg';

window.Alpine = Alpine;
Alpine.start();
```

Dengan Livewire cukup `import './wyswyg';` (lihat bagian Livewire). Pastikan layout memuat token CSRF:

```blade
<meta name="csrf-token" content="{{ csrf_token() }}">
@vite(['resources/css/app.css', 'resources/js/app.js'])
```

## 2. Route upload

```php
// routes/web.php
use App\Http\Controllers\WyswygUploadController;

Route::post('/wyswyg/upload', WyswygUploadController::class)
    ->middleware('auth')
    ->name('wyswyg.upload');
```

## 3. Form

```blade
<form method="POST" action="{{ route('posts.update', $post) }}">
    @csrf
    @method('PUT')

    <x-wysiwyg
        name="body"
        :value="$post->body"
        upload-url="{{ route('wyswyg.upload') }}"
        autosave="post-{{ $post->id }}"
    />

    <button>Simpan</button>
</form>
```

Props: `name` (wajib), `value`, `lang` (`en` bawaan / `id`), `placeholder`, `upload-url`, `autosave`,
`:toolbar="false"`, `:readonly="true"`, `format` (`html`/`json`), `:headings="[2, 3, 4]"`,
`:title="true"`, `title-name`, `:formats="['underline', 'align']"`. Atribut lain (mis. `class`)
diteruskan ke elemen editor. Setelah validasi gagal, isi dari `old()` dipakai otomatis.

## 4. Simpan — selalu sanitasi di server

```php
use App\Support\WyswygHtml;

public function update(Request $request, Post $post)
{
    $data = $request->validate(['body' => ['required', 'string']]);
    $post->update(['body' => WyswygHtml::clean($data['body'])]);

    return back();
}
```

Request bisa dikirim tanpa melewati editor, jadi `WyswygHtml::clean()` wajib dipanggil sebelum
menyimpan. Hasilnya aman dicetak dengan `{!! !!}`.

## 5. Tampilkan

```blade
<article class="afw-prose">{!! $post->body !!}</article>
```

## Upload dengan ID media library

Jika gambar dicatat di media library, kembalikan juga `mediaId` dari controller:

```php
return response()->json(['url' => $media->url, 'mediaId' => $media->id]);
```

Editor menyimpannya sebagai `<img data-media-id="42">` (hanya angka), dan `WyswygHtml::clean()`
mempertahankannya. Nama field upload bisa diganti: `window.wyswygUpload($url, { field: 'file' })`.

## Livewire 3/4

Livewire membawa Alpine sendiri: di `app.js` cukup `import './wyswyg';`, **tanpa** mengimpor
`alpinejs` atau memanggil `Alpine.start()`.

```blade
<div>
    <div wire:ignore>
        <div x-data="wysiwyg({ upload: window.wyswygUpload('{{ route('wyswyg.upload') }}') })"
             x-modelable="html" x-model="$wire.body"></div>
    </div>
    <button wire:click="save">Simpan</button>
</div>
```

```php
public string $body = '';

public function save(): void
{
    $this->body = WyswygHtml::clean($this->body);
    $this->post->update(['body' => $this->body]);
}
```

`wire:ignore` mencegah Livewire mengubah DOM editor. Setelah `save`, `$body` berisi hasil
HTMLPurifier yang penulisannya sedikit berbeda; editor membandingkannya setelah dinormalisasi,
jadi isi tidak dimuat ulang dan kursor tidak melompat. Dengan `wire:navigate`, editor dibersihkan
otomatis saat halaman ditinggalkan.
