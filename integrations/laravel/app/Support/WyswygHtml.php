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
            'p', 'h2', 'h3', 'blockquote', 'ul', 'ol', 'li', 'b', 'i', 'code', 'br', 'pre', 'hr',
            'a[href]',
            'figure[data-size|data-embed]', 'figcaption',
            'img[src|alt]',
            'iframe[src|title|allow|allowfullscreen|loading|referrerpolicy]',
        ]));
        $config->set('CSS.AllowedProperties', []);
        // Buang elemen kosong (mis. <iframe> yang src-nya ditolak, <figure> tanpa isi).
        $config->set('AutoFormat.RemoveEmpty', true);
        $config->set('URI.AllowedSchemes', ['http' => true, 'https' => true, 'mailto' => true, 'tel' => true, 'data' => true]);

        // Iframe hanya YouTube (nocookie) & Vimeo, persis seperti yang dibuat editor.
        $config->set('HTML.SafeIframe', true);
        $config->set('URI.SafeIframeRegexp', '%^https://(www\.youtube-nocookie\.com/embed/[\w-]{11}|player\.vimeo\.com/video/\d{1,12})$%');

        // Elemen & atribut HTML5 yang belum dikenal HTMLPurifier.
        $config->set('HTML.DefinitionID', 'wyswyg');
        $config->set('HTML.DefinitionRev', 1);
        if ($def = $config->maybeGetRawHTMLDefinition()) {
            $def->addElement('figure', 'Block', 'Optional: (figcaption, Flow) | (Flow, figcaption) | Flow', 'Common');
            $def->addElement('figcaption', 'Inline', 'Flow', 'Common');
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
