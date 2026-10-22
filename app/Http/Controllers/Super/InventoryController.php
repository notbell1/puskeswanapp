<?php

namespace App\Http\Controllers\Super;

use App\Http\Controllers\Controller;
use App\Models\Inventory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class InventoryController extends Controller
{
    /**
     * Tampilkan daftar inventaris dan peralatan Puskeswan.
     */
    public function index(Request $request): Response
    {
        $search = trim((string) $request->input('search', ''));
        $conditionFilter = $request->input('kondisi');

        $inventories = Inventory::with('pengelola')
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('kode_barang', 'like', "%{$search}%")
                        ->orWhere('nama_barang', 'like', "%{$search}%")
                        ->orWhere('kategori', 'like', "%{$search}%");
                });
            })
            ->when($conditionFilter, function ($query, $conditionFilter) {
                $query->where('kondisi', $conditionFilter);
            })
            ->orderBy('id', 'asc')
            ->paginate(5)
            ->withQueryString()
            ->through(fn ($inv) => [
                'id' => $inv->id,
                'kode_barang' => $inv->kode_barang,
                'nama_barang' => $inv->nama_barang,
                'kategori' => $inv->kategori,
                'jumlah' => $inv->jumlah,
                'kondisi' => $inv->kondisi,
                'keterangan' => $inv->keterangan,
                'pengelola' => $inv->pengelola?->name ?? 'Puskeswan',
                'created_at' => $inv->created_at?->format('d/m/Y'),
            ]);

        return Inertia::render('super/inventaris/index', [
            'inventories' => $inventories,
            'filters' => [
                'search' => $search,
                'kondisi' => $conditionFilter,
            ],
        ]);
    }

    /**
     * Simpan peralatan baru.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'kode_barang' => ['required', 'string', 'max:50', 'unique:inventories,kode_barang'],
            'nama_barang' => ['required', 'string', 'max:255'],
            'kategori' => ['required', 'string', 'max:100'],
            'jumlah' => ['required', 'integer', 'min:1'],
            'kondisi' => ['required', 'string', 'in:Baik,Rusak Ringan,Rusak Berat'],
            'keterangan' => ['nullable', 'string', 'max:500'],
        ]);

        Inventory::create([
            'kode_barang' => strtoupper(trim($validated['kode_barang'])),
            'nama_barang' => strip_tags($validated['nama_barang']),
            'kategori' => strip_tags($validated['kategori']),
            'jumlah' => (int) $validated['jumlah'],
            'kondisi' => $validated['kondisi'],
            'keterangan' => ! empty($validated['keterangan']) ? strip_tags($validated['keterangan']) : null,
            'id_pengelola' => Auth::id(),
        ]);

        return back()->with('success', "Barang inventaris {$validated['nama_barang']} berhasil dicatat!");
    }

    /**
     * Perbarui data inventaris.
     */
    public function update(Request $request, Inventory $inventory): RedirectResponse
    {
        $validated = $request->validate([
            'kode_barang' => ['required', 'string', 'max:50', "unique:inventories,kode_barang,{$inventory->id}"],
            'nama_barang' => ['required', 'string', 'max:255'],
            'kategori' => ['required', 'string', 'max:100'],
            'jumlah' => ['required', 'integer', 'min:1'],
            'kondisi' => ['required', 'string', 'in:Baik,Rusak Ringan,Rusak Berat'],
            'keterangan' => ['nullable', 'string', 'max:500'],
        ]);

        $inventory->update([
            'kode_barang' => strtoupper(trim($validated['kode_barang'])),
            'nama_barang' => strip_tags($validated['nama_barang']),
            'kategori' => strip_tags($validated['kategori']),
            'jumlah' => (int) $validated['jumlah'],
            'kondisi' => $validated['kondisi'],
            'keterangan' => ! empty($validated['keterangan']) ? strip_tags($validated['keterangan']) : null,
        ]);

        return back()->with('success', "Data inventaris {$inventory->nama_barang} berhasil diperbarui!");
    }

    /**
     * Hapus barang inventaris.
     */
    public function destroy(Inventory $inventory): RedirectResponse
    {
        $name = $inventory->nama_barang;
        $inventory->delete();

        return back()->with('success', "Barang inventaris {$name} berhasil dihapus!");
    }
}
