<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Animal;
use App\Models\AnimalType;
use App\Models\Owner;
use App\Models\User;
use App\Models\Visit;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class RegistrationController extends Controller
{
    /**
     * Tampilkan antrean dan riwayat pendaftaran loket hari ini / periode terpilih.
     */
    public function index(Request $request): Response
    {
        $search = trim((string) $request->input('search', ''));
        $statusFilter = $request->input('status');
        $dateFilter = $request->input('tanggal');

        $query = Visit::with([
            'animal:id,id_pemilik,id_jenis_hewan,no_rm,nama_hewan,jenis_kelamin,umur,warna_hewan',
            'animal.pemilik:id,nama_lengkap,nik,no_hp_wa,alamat_lengkap',
            'animal.jenisHewan:id,nama_jenis',
            'examination:id,id_kunjungan,id_dokter,diagnosa,terapi_pengobatan',
            'examination.dokter:id,name,foto,id_staf',
            'examination.dokter.staf:id,nama_staf,nip_strv,jabatan,foto',
            'admin:id,name',
        ])
            ->when($dateFilter, function ($q, $date) {
                $q->whereDate('tgl_kunjungan', $date);
            })
            ->when($statusFilter, function ($q, $status) {
                $q->where('status_antrean', $status);
            })
            ->when($search, function ($q, $search) {
                $q->where(function ($sub) use ($search) {
                    $sub->where('anamnesa', 'like', "%{$search}%")
                        ->orWhereHas('animal', function ($qa) use ($search) {
                            $qa->where('nama_hewan', 'like', "%{$search}%")
                                ->orWhere('no_rm', 'like', "%{$search}%")
                                ->orWhereHas('pemilik', function ($qp) use ($search) {
                                    $qp->where('nama_lengkap', 'like', "%{$search}%")
                                        ->orWhere('nik', 'like', "%{$search}%")
                                        ->orWhere('no_hp_wa', 'like', "%{$search}%");
                                });
                        });
                });
            })
            ->orderByRaw("CASE 
                WHEN status_antrean = 'Pemeriksaan' THEN 1
                WHEN status_antrean = 'Antri' THEN 2
                WHEN status_antrean = 'Selesai' THEN 3
                ELSE 4 END")
            ->orderBy('tgl_kunjungan', 'desc');

        $visits = $query->paginate(5)->withQueryString();

        $visits->getCollection()->transform(function ($visit, $index) use ($visits) {
            $queueNum = $visits->firstItem() ? ($visits->firstItem() + $index) : ($index + 1);

            return [
                'id' => $visit->id,
                'no_antrean' => 'A-'.str_pad((string) $queueNum, 3, '0', STR_PAD_LEFT),
                'no_rm' => $visit->animal?->no_rm ?? '-',
                'nama_hewan' => $visit->animal?->nama_hewan ?? 'Hewan Pasien',
                'jenis_hewan' => $visit->animal?->jenisHewan?->nama_jenis ?? '-',
                'id_jenis_hewan' => $visit->animal?->id_jenis_hewan,
                'jenis_kelamin' => $visit->animal?->jenis_kelamin ?? '-',
                'umur' => $visit->animal?->umur ?? '-',
                'warna_hewan' => $visit->animal?->warna_hewan ?? '-',
                'pemilik' => $visit->animal?->pemilik?->nama_lengkap ?? 'Umum',
                'nik_pemilik' => $visit->animal?->pemilik?->nik ?? '-',
                'no_hp' => $visit->animal?->pemilik?->no_hp_wa ?? '-',
                'alamat_pemilik' => $visit->animal?->pemilik?->alamat_lengkap ?? '-',
                'tgl_kunjungan' => $visit->tgl_kunjungan ? $visit->tgl_kunjungan->format('d/m/Y H:i') : '-',
                'raw_tgl' => $visit->tgl_kunjungan ? $visit->tgl_kunjungan->toDateString() : '',
                'berat_badan' => (float) $visit->berat_badan,
                'suhu_tubuh' => (float) $visit->suhu_tubuh,
                'anamnesa' => $visit->anamnesa,
                'status_antrean' => $visit->status_antrean ?? 'Antri',
                'dokter' => $visit->examination?->dokter?->name ?? 'Menunggu Dokter',
                'dokter_foto' => User::resolvePhotoUrl($visit->examination?->dokter?->foto ?: $visit->examination?->dokter?->staf?->foto),
                'dokter_nip' => $visit->examination?->dokter?->staf?->nip_strv ?? '-',
                'dokter_jabatan' => $visit->examination?->dokter?->staf?->jabatan ?? 'Dokter Hewan Pemeriksa',
                'diagnosa' => $visit->examination?->diagnosa ?? null,
                'terapi' => $visit->examination?->terapi_pengobatan ?? null,
                'admin_petugas' => $visit->admin?->name ?? '-',
            ];
        });

        $animalTypes = AnimalType::all(['id', 'nama_jenis']);
        $nextNoRm = Animal::generateNextNoRm();

        $summaryQuery = Visit::query()
            ->when($dateFilter, function ($q, $date) {
                $q->whereDate('tgl_kunjungan', $date);
            });

        $summaryData = $summaryQuery->selectRaw('
                COUNT(*) as total,
                SUM(CASE WHEN status_antrean = ? THEN 1 ELSE 0 END) as antri,
                SUM(CASE WHEN status_antrean = ? THEN 1 ELSE 0 END) as periksa,
                SUM(CASE WHEN status_antrean = ? THEN 1 ELSE 0 END) as selesai
            ', ['Antri', 'Pemeriksaan', 'Selesai'])
            ->first();

        $summary = [
            'total' => (int) ($summaryData->total ?? 0),
            'total_today' => (int) ($summaryData->total ?? 0),
            'antri' => (int) ($summaryData->antri ?? 0),
            'antri_today' => (int) ($summaryData->antri ?? 0),
            'periksa' => (int) ($summaryData->periksa ?? 0),
            'periksa_today' => (int) ($summaryData->periksa ?? 0),
            'selesai' => (int) ($summaryData->selesai ?? 0),
            'selesai_today' => (int) ($summaryData->selesai ?? 0),
        ];

        return Inertia::render('admin/rekam-medis/antrian', [
            'visits' => $visits,
            'animalTypes' => $animalTypes,
            'nextNoRm' => $nextNoRm,
            'summary' => $summary,
            'filters' => [
                'search' => $search,
                'status' => $statusFilter,
                'tanggal' => $dateFilter,
            ],
        ]);
    }

    /**
     * Tampilkan formulir pembuatan / pendaftaran rekam medis pasien (Dedicated Page).
     */
    public function create(Request $request): Response
    {
        $animalTypes = AnimalType::all(['id', 'nama_jenis']);
        $nextNoRm = Animal::generateNextNoRm();
        $initialNik = trim((string) $request->input('nik', ''));

        return Inertia::render('admin/rekam-medis/create', [
            'animalTypes' => $animalTypes,
            'nextNoRm' => $nextNoRm,
            'initialNik' => $initialNik,
        ]);
    }

    /**
     * Cari pemilik berdasarkan NIK (Autofill Data Pemilik & Daftar Hewan Terdaftar).
     */
    public function searchOwner(Request $request): JsonResponse
    {
        $nik = trim((string) $request->input('nik', ''));

        if (empty($nik)) {
            return response()->json(['found' => false, 'message' => 'NIK tidak boleh kosong.'], 400);
        }

        $owner = Owner::with([
            'animals.jenisHewan:id,nama_jenis',
            'animals.latestVisit',
        ])
            ->where('nik', $nik)
            ->first();

        if (! $owner) {
            return response()->json([
                'found' => false,
                'message' => 'Pemilik dengan NIK tersebut belum terdaftar. Silakan lengkapi formulir pendaftaran pemilik baru.',
                'next_no_rm' => Animal::generateNextNoRm(),
            ]);
        }

        $animals = $owner->animals->map(function ($animal) {
            $lastVisit = $animal->latestVisit;

            return [
                'id' => $animal->id,
                'no_rm' => $animal->no_rm,
                'nama_hewan' => $animal->nama_hewan,
                'id_jenis_hewan' => $animal->id_jenis_hewan,
                'nama_jenis' => $animal->jenisHewan?->nama_jenis ?? '-',
                'jenis_kelamin' => $animal->jenis_kelamin,
                'umur' => $animal->umur,
                'warna_hewan' => $animal->warna_hewan,
                'last_visit' => $lastVisit ? $lastVisit->tgl_kunjungan->format('d M Y') : 'Belum pernah',
                'last_anamnesa' => $lastVisit?->anamnesa,
                'last_bb' => $lastVisit?->berat_badan,
                'last_suhu' => $lastVisit?->suhu_tubuh,
            ];
        });

        return response()->json([
            'found' => true,
            'owner' => [
                'id' => $owner->id,
                'nik' => $owner->nik,
                'nama_lengkap' => $owner->nama_lengkap,
                'jenis_kelamin' => $owner->jenis_kelamin ?? 'Laki-Laki',
                'no_hp_wa' => $owner->no_hp_wa,
                'alamat_lengkap' => $owner->alamat_lengkap,
            ],
            'animals' => $animals,
            'next_no_rm' => Animal::generateNextNoRm(),
        ]);
    }

    /**
     * Daftarkan kunjungan pasien baru / pasien lama ke dalam antrean loket secara otomatis.
     */
    public function store(Request $request): RedirectResponse
    {
        $rules = [
            'nik' => 'required|string|size:16',
            'nama_lengkap' => 'required|string|max:150',
            'jenis_kelamin_pemilik' => 'nullable|string|in:Laki-Laki,Perempuan',
            'no_hp_wa' => 'required|string|max:20',
            'alamat_lengkap' => 'required|string|max:500',

            'id_hewan' => 'nullable|exists:animals,id',
            'nama_hewan' => 'required|string|max:100',
            'id_jenis_hewan' => 'required|exists:animal_types,id',
            'jenis_kelamin_hewan' => 'nullable|in:Jantan,Betina',
            'jenis_kelamin' => 'nullable|in:Jantan,Betina',
            'umur' => 'required|string|max:50',
            'warna_hewan' => 'required|string|max:50',

            'berat_badan' => 'required|numeric|min:0.05|max:1500',
            'suhu_tubuh' => 'required|numeric|min:30|max:45',
            'anamnesa' => 'required|string|max:1000',
        ];

        $validated = $request->validate($rules);
        $genderHewan = $validated['jenis_kelamin_hewan'] ?? $validated['jenis_kelamin'] ?? 'Jantan';

        return DB::transaction(function () use ($request, $validated, $genderHewan) {
            $owner = Owner::firstOrCreate(
                ['nik' => $validated['nik']],
                [
                    'nama_lengkap' => $validated['nama_lengkap'],
                    'jenis_kelamin' => $validated['jenis_kelamin_pemilik'] ?? 'Laki-Laki',
                    'no_hp_wa' => $validated['no_hp_wa'],
                    'alamat_lengkap' => $validated['alamat_lengkap'],
                ]
            );

            $owner->update([
                'nama_lengkap' => $validated['nama_lengkap'],
                'jenis_kelamin' => $validated['jenis_kelamin_pemilik'] ?? $owner->jenis_kelamin ?? 'Laki-Laki',
                'no_hp_wa' => $validated['no_hp_wa'],
                'alamat_lengkap' => $validated['alamat_lengkap'],
            ]);

            $animal = null;
            if (! empty($validated['id_hewan'])) {
                $animal = Animal::where('id', $validated['id_hewan'])
                    ->where('id_pemilik', $owner->id)
                    ->first();
            }

            if (! $animal) {
                $animal = Animal::where('id_pemilik', $owner->id)
                    ->whereRaw('LOWER(TRIM(nama_hewan)) = ?', [strtolower(trim($validated['nama_hewan']))])
                    ->first();
            }

            if ($animal) {
                $animal->update([
                    'umur' => $validated['umur'],
                    'warna_hewan' => $validated['warna_hewan'],
                ]);
            } else {
                $noRm = Animal::generateNextNoRm();
                $animal = Animal::create([
                    'id_pemilik' => $owner->id,
                    'id_jenis_hewan' => $validated['id_jenis_hewan'],
                    'no_rm' => $noRm,
                    'nama_hewan' => $validated['nama_hewan'],
                    'jenis_kelamin' => $genderHewan,
                    'umur' => $validated['umur'],
                    'warna_hewan' => $validated['warna_hewan'],
                ]);
            }

            $visit = Visit::create([
                'id_hewan' => $animal->id,
                'id_admin' => $request->user()->id,
                'tgl_kunjungan' => now(),
                'berat_badan' => $validated['berat_badan'],
                'suhu_tubuh' => $validated['suhu_tubuh'],
                'anamnesa' => $validated['anamnesa'],
                'status_antrean' => 'Antri',
            ]);

            return redirect()->route('admin.rekam-medis.antrian')->with(
                'success',
                "Pendaftaran berhasil! Pasien {$animal->nama_hewan} ({$animal->no_rm}) telah masuk ke dalam antrean pelayanan."
            );
        });
    }

    /**
     * Perbarui status antrean pasien (misal: Batal atau panggil ulang).
     */
    public function updateStatus(Request $request, Visit $visit): RedirectResponse
    {
        $validated = $request->validate([
            'status_antrean' => 'required|in:Antri,Pemeriksaan,Selesai,Batal',
        ]);

        $visit->update([
            'status_antrean' => $validated['status_antrean'],
        ]);

        return redirect()->back()->with(
            'success',
            "Status antrean pasien {$visit->animal?->nama_hewan} ({$visit->animal?->no_rm}) diubah menjadi '{$validated['status_antrean']}'."
        );
    }
}
