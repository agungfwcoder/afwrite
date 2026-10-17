<?php

namespace Tests\Feature;

use App\Support\WyswygHtml;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Blade;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class WyswygTest extends TestCase
{
    public function test_komponen_mencetak_konten_yang_sudah_disanitasi(): void
    {
        $html = Blade::render('<x-wysiwyg name="body" :value="$value" upload-url="/wyswyg/upload" autosave="post-1" class="mb-4" />', [
            'value' => '<p onclick="alert(1)">Hai <b>kamu</b><script>alert(2)</script></p><img src=x onerror=alert(3)>',
        ]);

        $this->assertStringContainsString('<p>Hai <b>kamu</b></p>', $html);
        $this->assertStringNotContainsString('onclick', $html);
        $this->assertStringNotContainsString('<script', $html);
        $this->assertStringNotContainsString('onerror', $html);
        $this->assertStringContainsString('class="mb-4"', $html);
    }

    public function test_opsi_diteruskan_ke_alpine_dengan_aman(): void
    {
        $html = Blade::render('<x-wysiwyg name="body" :upload-url="$url" :placeholder="$placeholder" :toolbar="false" />', [
            'url' => "/up?a=1&b='x'",
            'placeholder' => 'Tulis "sesuatu" </div><script>alert(1)</script>',
        ]);
        $this->assertStringNotContainsString('<script>alert(1)', $html);

        preg_match('/x-data="([^"]*)"/', $html, $match);
        $this->assertNotEmpty($match, 'atribut x-data tidak ditemukan');
        $xData = html_entity_decode($match[1]);

        $this->assertStringStartsWith('wysiwyg({ ...JSON.parse(', $xData);
        $this->assertStringContainsString("upload: window.wyswygUpload('\\/up?a=1\\u0026b=\\u0027x\\u0027')", $xData);
        // Opsi dalam JSON.parse('...') dapat dibaca kembali dengan benar.
        preg_match("/JSON\\.parse\\('(.*?)'\\)/", $xData, $json);
        $options = json_decode(json_decode('"'.$json[1].'"'), true);
        $this->assertSame(['name' => 'body', 'lang' => 'id', 'placeholder' => 'Tulis "sesuatu" </div><script>alert(1)</script>', 'toolbar' => false, 'readonly' => false, 'format' => 'html'], $options);
    }

    public function test_nilai_old_diutamakan_setelah_validasi_gagal(): void
    {
        $this->withSession(['_old_input' => ['body' => '<p>dari old()</p>']]);
        $this->get('/'); // memulai session
        session()->flashInput(['body' => '<p>dari old()</p>']);

        $html = Blade::render('<x-wysiwyg name="body" value="<p>dari database</p>" />');
        $this->assertStringContainsString('<p>dari old()</p>', $html);
    }

    public function test_upload_gambar(): void
    {
        Storage::fake('public');

        $response = $this->postJson('/wyswyg/upload', ['image' => UploadedFile::fake()->image('foto.png', 40, 30)]);

        $response->assertOk()->assertJsonStructure(['url']);
        $this->assertStringContainsString('/storage/wyswyg/', $response->json('url'));
        Storage::disk('public')->assertExists('wyswyg/'.basename($response->json('url')));
    }

    public function test_upload_menolak_svg_dan_file_besar(): void
    {
        Storage::fake('public');

        $svg = UploadedFile::fake()->createWithContent('x.svg', '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>');
        $this->postJson('/wyswyg/upload', ['image' => $svg])->assertStatus(422);

        $besar = UploadedFile::fake()->image('besar.jpg')->size(6000);
        $this->postJson('/wyswyg/upload', ['image' => $besar])->assertStatus(422);

        $this->postJson('/wyswyg/upload', [])->assertStatus(422);
    }

    public function test_clean_mempertahankan_output_editor(): void
    {
        $html = '<h2>Judul</h2><p>Teks <b>tebal</b> <a href="https://a.com">link</a></p><figure data-size="wide"><img src="/x.png" alt="Foto"><figcaption>Ket</figcaption></figure><pre><code>a = 1</code></pre><hr>';
        $this->assertSame($html, WyswygHtml::clean($html));
    }
}
