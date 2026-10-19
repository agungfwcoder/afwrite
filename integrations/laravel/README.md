# Integrasi Laravel

File di folder ini disalin ke proyek Laravel Anda (struktur foldernya sama):

| File | Isi |
|---|---|
| `app/Support/WyswygHtml.php` | Sanitasi HTML di server, whitelist sama dengan editor |
| `app/Http/Controllers/WyswygUploadController.php` | Upload gambar dari editor |
| `resources/views/components/wysiwyg.blade.php` | Komponen `<x-wysiwyg>` |
| `resources/js/wyswyg.js` | Setup Alpine + fungsi upload (dengan token CSRF) |
| `tests/Feature/WyswygTest.php` | Feature test untuk ketiganya |

Diuji dengan Laravel 13 + `ezyang/htmlpurifier` (`php artisan test --filter=WyswygTest`).

## 1. Pasang

```bash
npm install github:agungfwcoder/afwrite#v2.1.0 alpinejs
composer require ezyang/htmlpurifier
php artisan storage:link
```

Isi `resources/js/app.js` dengan `resources/js/wyswyg.js` (atau impor file itu), lalu pastikan
layout memuat token CSRF:

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

Props: `name` (wajib), `value`, `lang` (`id`/`en`), `placeholder`, `upload-url`, `autosave`,
`:toolbar="false"`, `:readonly="true"`, `format` (`html`/`json`), `:headings="[2, 3, 4]"`. Atribut lain (mis. `class`)
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

## Livewire 3

> Contoh ini belum diuji otomatis seperti bagian di atas.

```blade
<div wire:ignore x-data="{ body: $wire.entangle('body') }">
    <div x-data="wysiwyg({ upload: window.wyswygUpload('{{ route('wyswyg.upload') }}') })"
         x-modelable="html" x-model="body"></div>
</div>
```

`wire:ignore` mencegah Livewire mengubah DOM editor. Sanitasi tetap di server:

```php
public string $body = '';

public function save(): void
{
    $this->post->update(['body' => WyswygHtml::clean($this->body)]);
}
```
