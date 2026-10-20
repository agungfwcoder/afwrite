<?php

namespace App\Support;

use HTMLPurifier;
use HTMLPurifier_Config;

/**
 * Sanitasi HTML di server dengan whitelist yang sama seperti editor wyswyg.
 *
 *   composer require ezyang/htmlpurifier
 *
 *   $post->body = WyswygHtml::clean($request->input('body'));
 *
 * Wajib dipakai sebelum menyimpan/menampilkan: sanitasi di browser bisa dilewati
 * oleh request yang tidak dikirim lewat editor.
 */
class WyswygHtml
{
    private static ?HTMLPurifier $purifier = null;

    public static function clean(?string $html): string
    {
        return trim(self::purifier()->purify((string) $html));
    }

    public static function config(?string $cachePath = null): HTMLPurifier_Config
    {
        $config = HTMLPurifier_Config::createDefault();
        $config->set('Core.Encoding', 'UTF-8');
        $config->set('HTML.Doctype', 'HTML 4.01 Transitional');
        $config->set('Cache.SerializerPath', $cachePath);
        if ($cachePath === null) {
            $config->set('Cache.DefinitionImpl', null);
        }

        $config->set('HTML.Allowed', implode(',', [
            // Semua level judul yang bisa diaktifkan editor (opsi `headings`); h1 & p.afw-subtitle
            // dipakai mode artikel (opsi `title`). class pada p & h2-h6: perataan (afw-align-*).
            'p[class]', 'h1', 'h2[class]', 'h3[class]', 'h4[class]', 'h5[class]', 'h6[class]',
            'blockquote', 'ul', 'ol', 'li', 'b', 'i', 'code', 'br', 'pre', 'hr',
            // Format tambahan (opsi `formats`): garis bawah, coret, warna teks, stabilo.
            'u', 's', 'span[style]', 'mark[style]',
            'a[href]',
            'figure[data-size|data-embed]', 'figcaption',
            'img[src|alt|data-media-id]',
            'iframe[src|title|allow|allowfullscreen|loading|referrerpolicy]',
        ]));
        // Hanya warna teks (span) & stabilo (mark). Editor membatasi lagi ke paletnya saat konten dimuat.
        $config->set('CSS.AllowedProperties', ['color', 'background-color']);
        // Class yang boleh ada di konten: subjudul artikel dan perataan.
        $config->set('Attr.AllowedClasses', ['afw-subtitle', 'afw-align-center', 'afw-align-right', 'afw-align-justify']);
        // Buang elemen kosong (mis. <iframe> yang src-nya ditolak, <figure> tanpa isi).
        $config->set('AutoFormat.RemoveEmpty', true);
        $config->set('URI.AllowedSchemes', ['http' => true, 'https' => true, 'mailto' => true, 'tel' => true, 'data' => true]);

        // Iframe hanya YouTube (nocookie) & Vimeo, persis seperti yang dibuat editor.
        $config->set('HTML.SafeIframe', true);
        $config->set('URI.SafeIframeRegexp', '%^https://(www\.youtube-nocookie\.com/embed/[\w-]{11}|player\.vimeo\.com/video/\d{1,12})$%');

        // Elemen & atribut HTML5 yang belum dikenal HTMLPurifier.
        $config->set('HTML.DefinitionID', 'wyswyg');
        $config->set('HTML.DefinitionRev', 2);
        if ($def = $config->maybeGetRawHTMLDefinition()) {
            $def->addElement('figure', 'Block', 'Optional: (figcaption, Flow) | (Flow, figcaption) | Flow', 'Common');
            $def->addElement('figcaption', 'Inline', 'Flow', 'Common');
            $def->addElement('mark', 'Inline', 'Inline', 'Common');
            // ID media library aplikasi (mis. untuk memilih gambar utama dari isi artikel).
            $def->addAttribute('img', 'data-media-id', 'Number');
            $def->addAttribute('figure', 'data-size', 'Enum#wide,full');
            $def->addAttribute('figure', 'data-embed', 'Enum#youtube,vimeo');
            $def->addAttribute('iframe', 'allow', 'Text');
            $def->addAttribute('iframe', 'allowfullscreen', 'Bool');
            $def->addAttribute('iframe', 'loading', 'Enum#lazy,eager');
            $def->addAttribute('iframe', 'referrerpolicy', 'Enum#strict-origin-when-cross-origin,no-referrer');
        }

        return $config;
    }

    private static function purifier(): HTMLPurifier
    {
        $cache = function_exists('storage_path') ? storage_path('framework/cache/htmlpurifier') : null;
        if ($cache !== null && ! is_dir($cache)) {
            @mkdir($cache, 0755, true);
        }

        return self::$purifier ??= new HTMLPurifier(self::config($cache));
    }
}
