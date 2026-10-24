<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Animal;
use App\Models\AnimalType;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PatientController extends Controller
{
    /**
     * Tampilkan data master pasien hewan dan pemilik terdaftar.
     */
    public function index(Request $request): Response
    {
        $search = trim((string) $request->input('search', ''));
        $speciesFilter = $request->input('jenis_hewan');

        $query = Animal::with([
            'pemilik:id,nama_lengkap,nik,no_hp_wa,alamat_lengkap',
            'jenisHewan:id,nama_jenis',
            'visits:id,id_hewan,tgl_kunjungan,berat_badan,suhu_tubuh,anamnesa,status_antrean',
            'visits.examination:id,id_kunjungan,id_dokter,diagnosa,terapi_pengobatan,catatan',
            'visits.examination.dokter:id,name',
        ])
            ->when($speciesFilter, function ($q, $speciesId) {
                $q->where('id_jenis_hewan', $speciesId);
            })
            ->when($search, function ($q, $search) {
                $q->where(function ($sub) use ($search) {
                    $sub->where('nama_hewan', 'like', "%{$search}%")
                        ->orWhere('no_rm', 'like', "%{$search}%")
                        ->orWhere('warna_hewan', 'like', "%{$search}%")
                        ->orWhereHas('pemilik', function ($qp) use ($search) {
                            $qp->where('nama_lengkap', 'like', "%{$search}%")
                                ->orWhere('nik', 'like', "%{$search}%")
                                ->orWhere('no_hp_wa', 'like', "%{$search}%");
                        });
                });
            })
            ->orderBy('id', 'desc');

        $patients = $query->paginate(5)->withQueryString();

        $patients->getCollection()->transform(function ($animal) {
            $sortedVisits = $animal->visits->sortByDesc('tgl_kunjungan')->values();
            $lastVisit = $sortedVisits->first();

            return [
                'id' => $animal->id,
                'no_rm' => $animal->no_rm,
                'nama_hewan' => $animal->nama_hewan,
                'jenis_hewan' => $animal->jenisHewan?->nama_jenis ?? '-',
                'id_jenis_hewan' => $animal->id_jenis_hewan,
                'jenis_kelamin' => $animal->jenis_kelamin,
                'umur' => $animal->umur,
                'warna_hewan' => $animal->warna_hewan,
                'id_pemilik' => $animal->id_pemilik,
                'nama_pemilik' => $animal->pemilik?->nama_lengkap ?? '-',
                'nik_pemilik' => $animal->pemilik?->nik ?? '-',
                'no_hp_pemilik' => $animal->pemilik?->no_hp_wa ?? '-',
                'alamat_pemilik' => $animal->pemilik?->alamat_lengkap ?? '-',
                'total_kunjungan' => $animal->visits->count(),
                'last_visit_date' => $lastVisit ? $lastVisit->tgl_kunjungan->format('d/m/Y') : 'Belum pernah',
                'created_at' => $animal->created_at ? $animal->created_at->format('d/m/Y') : '-',
                'riwayat_kunjungan' => $sortedVisits->map(function ($visit) {
                    return [
                        'id' => $visit->id,
                        'tgl' => $visit->tgl_kunjungan ? $visit->tgl_kunjungan->format('d M Y, H:i') : '-',
                        'berat_badan' => $visit->berat_badan ? $visit->berat_badan.' kg' : '-',
                        'suhu_tubuh' => $visit->suhu_tubuh ? $visit->suhu_tubuh.' °C' : '-',
                        'anamnesa' => $visit->anamnesa,
                        'status' => $visit->status_antrean,
                        'dokter' => $visit->examination?->dokter?->name ?? 'Belum ada dokter',
                        'diagnosa' => $visit->examination?->diagnosa ?? 'Belum ada diagnosa',
                        'terapi' => $visit->examination?->terapi_pengobatan ?? 'Belum ada resep obat',
                        'catatan' => $visit->examination?->catatan,
                    ];
                })->toArray(),
            ];
        });

        $animalTypes = AnimalType::all(['id', 'nama_jenis']);
        $nextNoRm = Animal::generateNextNoRm();

        return Inertia::render('admin/pasien/index', [
            'patients' => $patients,
            'animalTypes' => $animalTypes,
            'nextNoRm' => $nextNoRm,
            'filters' => [
                'search' => $search,
                'jenis_hewan' => $speciesFilter,
            ],
        ]);
    }

    /**
     * Tambah data hewan baru untuk pemilik tertentu.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'id_pemilik' => 'required|exists:owners,id',
            'id_jenis_hewan' => 'required|exists:animal_types,id',
            'nama_hewan' => 'required|string|max:100',
            'jenis_kelamin' => 'required|in:Jantan,Betina',
            'umur' => 'required|string|max:50',
            'warna_hewan' => 'required|string|max:50',
        ]);

        $noRm = Animal::generateNextNoRm();

        $animal = Animal::create([
            'id_pemilik' => $validated['id_pemilik'],
            'id_jenis_hewan' => $validated['id_jenis_hewan'],
            'no_rm' => $noRm,
            'nama_hewan' => $validated['nama_hewan'],
            'jenis_kelamin' => $validated['jenis_kelamin'],
            'umur' => $validated['umur'],
            'warna_hewan' => $validated['warna_hewan'],
        ]);

        return redirect()->back()->with(
            'success',
            "Pasien baru {$animal->nama_hewan} berhasil didaftarkan dengan Nomor Rekam Medis: {$animal->no_rm}!"
        );
    }

    /**
     * Perbarui data identitas pasien hewan.
     */
    public function update(Request $request, Animal $animal): RedirectResponse
    {
        $validated = $request->validate([
            'id_jenis_hewan' => 'required|exists:animal_types,id',
            'nama_hewan' => 'required|string|max:100',
            'jenis_kelamin' => 'required|in:Jantan,Betina',
            'umur' => 'required|string|max:50',
            'warna_hewan' => 'required|string|max:50',
        ]);

        $animal->update($validated);

        return redirect()->back()->with(
            'success',
            "Data pasien hewan {$animal->nama_hewan} ({$animal->no_rm}) berhasil diperbarui!"
        );
    }
}
