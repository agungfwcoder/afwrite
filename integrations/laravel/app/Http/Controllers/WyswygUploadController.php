<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

/**
 * Upload gambar dari editor.
 *
 *   Route::post('/wyswyg/upload', WyswygUploadController::class)
 *       ->middleware('auth')
 *       ->name('wyswyg.upload');
 *
 * Butuh disk "public" yang tertaut: php artisan storage:link
 */
class WyswygUploadController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $request->validate([
            // Format sama dengan yang diterima editor; SVG sengaja tidak diizinkan.
            'image' => ['required', 'file', 'mimetypes:image/png,image/jpeg,image/gif,image/webp,image/avif', 'max:5120'],
        ]);

        $path = $request->file('image')->store('wyswyg', 'public');

        return response()->json(['url' => Storage::disk('public')->url($path)]);
    }
}
