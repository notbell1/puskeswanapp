<?php

namespace App\Http\Controllers\Super;

use App\Http\Controllers\Controller;
use App\Models\AnimalType;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class AnimalTypeController extends Controller
{
    /**
     * Tampilkan data master jenis hewan dengan pagination dan jumlah pasien terdaftar.
     */
    public function index(Request $request): Response
    {
        $search = trim((string) $request->input('search', ''));

        $animalTypes = AnimalType::withCount('animals')
            ->when($search, function ($query, $search) {
                $query->where('nama_jenis', 'like', "%{$search}%")
                    ->orWhere('keterangan', 'like', "%{$search}%");
            })
            ->orderBy('id', 'asc')
            ->paginate(5)
            ->withQueryString()
            ->through(fn ($type) => [
                'id' => $type->id,
                'nama_jenis' => $type->nama_jenis,
                'keterangan' => $type->keterangan,
                'animals_count' => $type->animals_count,
                'created_at' => $type->created_at?->format('d/m/Y'),
            ]);

        return Inertia::render('super/jenis-hewan/index', [
            'animalTypes' => $animalTypes,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    /**
     * Simpan jenis hewan baru.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'nama_jenis' => ['required', 'string', 'max:255'],
            'keterangan' => ['nullable', 'string', 'max:500'],
        ], [
            'nama_jenis.required' => 'Nama jenis/kategori hewan wajib diisi.',
            'nama_jenis.max' => 'Nama jenis/kategori hewan maksimal 255 karakter.',
        ]);

        $namaJenis = trim($validated['nama_jenis']);

        // Deteksi duplikasi cerdas: leetspeak, simbol, case-insensitive, kompresi huruf, & variasi ketikan
        $duplicate = AnimalType::findSimilar($namaJenis);
        if ($duplicate) {
            throw ValidationException::withMessages([
                'nama_jenis' => "Jenis/Kategori hewan sudah ada dalam sistem (serupa dengan '{$duplicate->nama_jenis}').",
            ]);
        }

        AnimalType::create([
            'nama_jenis' => strip_tags($namaJenis),
            'keterangan' => ! empty($validated['keterangan']) ? strip_tags($validated['keterangan']) : null,
        ]);

        return back()->with('success', "Jenis hewan {$namaJenis} berhasil ditambahkan!");
    }

    /**
     * Perbarui jenis hewan.
     */
    public function update(Request $request, AnimalType $animalType): RedirectResponse
    {
        $validated = $request->validate([
            'nama_jenis' => ['required', 'string', 'max:255'],
            'keterangan' => ['nullable', 'string', 'max:500'],
        ], [
            'nama_jenis.required' => 'Nama jenis/kategori hewan wajib diisi.',
            'nama_jenis.max' => 'Nama jenis/kategori hewan maksimal 255 karakter.',
        ]);

        $namaJenis = trim($validated['nama_jenis']);

        // Deteksi duplikasi cerdas dengan mengecualikan data saat ini
        $duplicate = AnimalType::findSimilar($namaJenis, $animalType->id);
        if ($duplicate) {
            throw ValidationException::withMessages([
                'nama_jenis' => "Jenis/Kategori hewan sudah ada dalam sistem (serupa dengan '{$duplicate->nama_jenis}').",
            ]);
        }

        $animalType->update([
            'nama_jenis' => strip_tags($namaJenis),
            'keterangan' => ! empty($validated['keterangan']) ? strip_tags($validated['keterangan']) : null,
        ]);

        return back()->with('success', "Jenis hewan {$animalType->nama_jenis} berhasil diperbarui!");
    }

    /**
     * Hapus jenis hewan dengan pengecekan relasi pasien.
     */
    public function destroy(AnimalType $animalType): RedirectResponse
    {
        if ($animalType->animals()->exists() || $animalType->rabiesCases()->exists()) {
            return back()->with('error', "Gagal menghapus: Masih terdapat data pasien hewan atau laporan gigitan yang terhubung dengan jenis {$animalType->nama_jenis}!");
        }

        $name = $animalType->nama_jenis;
        $animalType->delete();

        return back()->with('success', "Jenis hewan {$name} berhasil dihapus!");
    }
}
