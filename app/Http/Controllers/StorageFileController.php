<?php

namespace App\Http\Controllers;

use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class StorageFileController extends Controller
{
    /**
     * Ekstensi berkas yang diizinkan untuk disajikan secara publik.
     */
    protected const ALLOWED_EXTENSIONS = [
        'jpg', 'jpeg', 'png', 'webp', 'gif', 'svg',
    ];

    /**
     * MIME types yang sah untuk media gambar.
     */
    protected const ALLOWED_MIME_TYPES = [
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/gif',
        'image/svg+xml',
    ];

    /**
     * Sajikan berkas media dari storage publik melalui kontroler dengan validasi keamanan ketat:
     * - Pencegahan Path Traversal (../, null byte, absolute path).
     * - Pemeriksaan whitelist ekstensi berkas.
     * - Verifikasi binary MIME type asli berkas (anti MIME-spoofing).
     * - Penambahan header keamanan (nosniff, cache control, CSP).
     */
    public function show(string $path): BinaryFileResponse|Response
    {
        // 1. Sanitasi path untuk mencegah Path Traversal & Directory Climbing
        if (str_contains($path, '..') || str_contains($path, "\0") || str_contains($path, '\\')) {
            abort(403, 'Akses ditolak: Terdeteksi upaya path traversal ilegal.');
        }

        $cleanPath = ltrim($path, '/');

        // 2. Validasi ekstensi dari whitelist
        $extension = strtolower(pathinfo($cleanPath, PATHINFO_EXTENSION));
        if (! in_array($extension, self::ALLOWED_EXTENSIONS, true)) {
            abort(403, 'Akses ditolak: Format berkas tidak diizinkan untuk diakses publik.');
        }

        // 3. Pastikan berkas fisik ada di storage disk public
        if (! Storage::disk('public')->exists($cleanPath)) {
            abort(404, 'Berkas yang diminta tidak ditemukan di server.');
        }

        $fullPath = Storage::disk('public')->path($cleanPath);
        $realPath = realpath($fullPath);
        $diskRoot = realpath(Storage::disk('public')->path(''));

        // 4. Pastikan berkas fisik ada dan berada di dalam boundary direktori storage disk public
        if (! $realPath || ! $diskRoot) {
            abort(404, 'Berkas yang diminta tidak ditemukan di server.');
        }

        $normalizedRealPath = str_replace('\\', '/', strtolower($realPath));
        $normalizedDiskRoot = str_replace('\\', '/', strtolower($diskRoot));

        if (! str_starts_with($normalizedRealPath, $normalizedDiskRoot)) {
            abort(403, 'Akses ditolak: Batas direktori berkas dilanggar.');
        }

        // 5. Cek tipe MIME fisik asli berkas menggunakan finfo
        try {
            $finfo = new \finfo(FILEINFO_MIME_TYPE);
            $mimeType = $finfo->file($realPath) ?: 'application/octet-stream';
        } catch (\Throwable) {
            $mimeType = 'application/octet-stream';
        }

        if (! in_array($mimeType, self::ALLOWED_MIME_TYPES, true)) {
            abort(403, 'Akses ditolak: Tipe konten biner berkas tidak valid.');
        }

        // 6. Sajikan berkas dengan header keamanan lengkap
        return response()->file($realPath, [
            'Content-Type' => $mimeType,
            'X-Content-Type-Options' => 'nosniff',
            'X-Frame-Options' => 'SAMEORIGIN',
            'Content-Security-Policy' => "default-src 'none'",
            'Cache-Control' => 'public, max-age=31536000, immutable',
        ]);
    }
}
