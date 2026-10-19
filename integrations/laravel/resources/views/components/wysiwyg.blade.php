{{--
    Editor wyswyg sebagai komponen Blade.

    <x-wysiwyg name="body" :value="$post->body" upload-url="{{ route('wyswyg.upload') }}" autosave="post-{{ $post->id }}" />
    <x-wysiwyg name="body" :headings="[2, 3, 4, 5, 6]" />   level judul yang dipakai (bawaan [2, 3])
    <x-wysiwyg name="body" :title="true" />                 mode artikel: judul <h1> + subjudul

    Konten awal disanitasi di server (WyswygHtml::clean) sebelum dicetak: HTML mentah di halaman
    akan dijalankan browser (mis. <img onerror>) sebelum editor sempat menyaringnya.
--}}
@props([
    'name',
    'value' => '',
    'lang' => 'id',
    'placeholder' => null,
    'uploadUrl' => null,
    'autosave' => null,
    'toolbar' => true,
    'readonly' => false,
    'format' => 'html',
    'headings' => null,
    'title' => false,
])

@php
    $options = array_filter([
        'name' => $name,
        'lang' => $lang,
        'placeholder' => $placeholder,
        'autosave' => $autosave,
        'toolbar' => (bool) $toolbar,
        'readonly' => (bool) $readonly,
        'format' => $format,
        'headings' => $headings,
        'title' => $title ? true : null,
    ], fn ($option) => $option !== null);

    $upload = $uploadUrl ? 'window.wyswygUpload('.\Illuminate\Support\Js::from($uploadUrl).')' : 'null';
    $content = \App\Support\WyswygHtml::clean(old($name, $value));
@endphp

<div x-data="wysiwyg({ ...{{ \Illuminate\Support\Js::from($options) }}, upload: {{ $upload }} })" {{ $attributes }}>{!! $content !!}</div>
