<?php

namespace App\Http\Controllers\Super;

use App\Http\Controllers\Controller;
use App\Models\Medicine;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MedicineController extends Controller
{
    /**
     * Tampilkan data stok obat dan vaksin .
     */
    public function index(Request $request): Response
    {
        $search = trim((string) $request->input('search', ''));
        $stockFilter = $request->input('status');

        $medicines = Medicine::query()
            ->orderBy('id', 'asc')
            ->get()
            ->map(fn ($med) => [
                'id' => $med->id,
                'kode_obat' => $med->kode_obat,
                'nama_obat' => $med->nama_obat,
                'stok' => $med->stok,
                'satuan' => $med->satuan,
                'status_stok' => $med->stok <= 10 ? 'Kritis' : ($med->stok <= 30 ? 'Menipis' : 'Aman'),
                'created_at' => $med->created_at?->format('d/m/Y'),
            ]);

        return Inertia::render('super/obat/index', [
            'medicines' => [
                'data' => $medicines,
                'total' => $medicines->count(),
            ],
            'filters' => [
                'search' => $search,
                'status' => $stockFilter,
            ],
        ]);
    }

    /**
     * Simpan obat/vaksin baru.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'kode_obat' => ['required', 'string', 'max:50', 'unique:medicines,kode_obat'],
            'nama_obat' => ['required', 'string', 'max:255'],
            'stok' => ['required', 'integer', 'min:0'],
            'satuan' => ['required', 'string', 'max:50'],
        ]);

        Medicine::create([
            'kode_obat' => strtoupper(trim($validated['kode_obat'])),
            'nama_obat' => strip_tags($validated['nama_obat']),
            'stok' => (int) $validated['stok'],
            'satuan' => strip_tags($validated['satuan']),
        ]);

        return back()->with('success', "Obat {$validated['nama_obat']} berhasil ditambahkan ke inventori!");
    }

    /**
     * Perbarui data obat.
     */
    public function update(Request $request, Medicine $medicine): RedirectResponse
    {
        $validated = $request->validate([
            'kode_obat' => ['required', 'string', 'max:50', "unique:medicines,kode_obat,{$medicine->id}"],
            'nama_obat' => ['required', 'string', 'max:255'],
            'stok' => ['required', 'integer', 'min:0'],
            'satuan' => ['required', 'string', 'max:50'],
        ]);

        $medicine->update([
            'kode_obat' => strtoupper(trim($validated['kode_obat'])),
            'nama_obat' => strip_tags($validated['nama_obat']),
            'stok' => (int) $validated['stok'],
            'satuan' => strip_tags($validated['satuan']),
        ]);

        return back()->with('success', "Data obat {$medicine->nama_obat} berhasil diperbarui!");
    }

    /**
     * Hapus obat dari inventori.
     */
    public function destroy(Medicine $medicine): RedirectResponse
    {
        $name = $medicine->nama_obat;
        $medicine->delete();

        return back()->with('success', "Obat {$name} berhasil dihapus dari inventori!");
    }
}
