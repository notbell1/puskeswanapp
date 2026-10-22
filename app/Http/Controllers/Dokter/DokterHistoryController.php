<?php

namespace App\Http\Controllers\Dokter;

use App\Http\Controllers\Controller;
use App\Models\AnimalType;
use App\Models\Medicine;
use App\Models\User;
use App\Models\Visit;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DokterHistoryController extends Controller
{
    /**
     * Tampilkan riwayat hasil pemeriksaan medis yang ditangani oleh dokter yang sedang login.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $search = trim((string) $request->input('search', ''));
        $idJenisHewan = $request->input('id_jenis_hewan');
        $dateFilter = $request->input('tanggal');

        $query = Visit::with([
            'animal.pemilik',
            'animal.jenisHewan',
            'animal.visits.examination.dokter.staf',
            'examination.dokter.staf',
            'admin',
        ])
            ->where('status_antrean', 'Selesai')
            ->whereHas('examination', function ($q) use ($user) {
                $q->where('id_dokter', $user->id);
            })
            ->when($dateFilter, function ($q, $date) {
                $q->whereDate('tgl_kunjungan', $date);
            })
            ->when($idJenisHewan, function ($q, $typeId) {
                $q->whereHas('animal', function ($qa) use ($typeId) {
                    $qa->where('id_jenis_hewan', $typeId);
                });
            })
            ->when($search, function ($q, $search) {
                $q->where(function ($sub) use ($search) {
                    $sub->where('anamnesa', 'like', "%{$search}%")
                        ->orWhereHas('animal', function ($qa) use ($search) {
                            $qa->where('nama_hewan', 'like', "%{$search}%")
                                ->orWhere('no_rm', 'like', "%{$search}%")
                                ->orWhereHas('pemilik', function ($qp) use ($search) {
                                    $qp->where('nama_lengkap', 'like', "%{$search}%")
                                        ->orWhere('nik', 'like', "%{$search}%");
                                });
                        })
                        ->orWhereHas('examination', function ($qe) use ($search) {
                            $qe->where('diagnosa', 'like', "%{$search}%")
                                ->orWhere('terapi_pengobatan', 'like', "%{$search}%")
                                ->orWhere('catatan', 'like', "%{$search}%");
                        });
                });
            })
            ->orderBy('tgl_kunjungan', 'desc');

        $history = $query->paginate(5)->withQueryString();

        $history->getCollection()->transform(function ($visit) {
            $exam = $visit->examination;

            $historicalRecords = $visit->animal?->visits
                ? $visit->animal->visits
                    ->filter(fn ($v) => $v->id !== $visit->id)
                    ->values()
                    ->map(fn ($oldVisit) => [
                        'id' => $oldVisit->id,
                        'tgl_kunjungan' => $oldVisit->tgl_kunjungan ? $oldVisit->tgl_kunjungan->format('d/m/Y H:i') : '-',
                        'berat_badan' => (float) $oldVisit->berat_badan,
                        'suhu_tubuh' => (float) $oldVisit->suhu_tubuh,
                        'anamnesa' => $oldVisit->anamnesa,
                        'diagnosa' => $oldVisit->examination?->diagnosa ?? '-',
                        'terapi_pengobatan' => $oldVisit->examination?->terapi_pengobatan ?? '-',
                        'catatan' => $oldVisit->examination?->catatan ?? '-',
                        'dokter' => $oldVisit->examination?->dokter?->name ?? 'drh. Puskeswan',
                        'dokter_foto' => User::resolvePhotoUrl($oldVisit->examination?->dokter?->foto ?: $oldVisit->examination?->dokter?->staf?->foto),
                    ])
                : collect();

            return [
                'id' => $visit->id,
                'id_examination' => $exam?->id,
                'no_rm' => $visit->animal?->no_rm ?? '-',
                'nama_hewan' => $visit->animal?->nama_hewan ?? 'Hewan Pasien',
                'id_hewan' => $visit->animal?->id,
                'id_jenis_hewan' => $visit->animal?->id_jenis_hewan,
                'jenis_hewan' => $visit->animal?->jenisHewan?->nama_jenis ?? '-',
                'jenis_kelamin' => $visit->animal?->jenis_kelamin ?? '-',
                'umur' => $visit->animal?->umur ?? '-',
                'warna_hewan' => $visit->animal?->warna_hewan ?? '-',
                'pemilik' => $visit->animal?->pemilik?->nama_lengkap ?? 'Umum',
                'nik_pemilik' => $visit->animal?->pemilik?->nik ?? '-',
                'no_hp' => $visit->animal?->pemilik?->no_hp_wa ?? '-',
                'alamat_pemilik' => $visit->animal?->pemilik?->alamat_lengkap ?? '-',
                'tgl_kunjungan' => $visit->tgl_kunjungan ? $visit->tgl_kunjungan->format('d/m/Y') : '-',
                'jam_kunjungan' => $visit->tgl_kunjungan ? $visit->tgl_kunjungan->format('H:i').' WIB' : '-',
                'waktu_lengkap' => $visit->tgl_kunjungan ? $visit->tgl_kunjungan->format('d/m/Y H:i') : '-',
                'raw_tgl_kunjungan' => $visit->tgl_kunjungan ? $visit->tgl_kunjungan->toDateString() : '',
                'berat_badan' => (float) $visit->berat_badan,
                'suhu_tubuh' => (float) $visit->suhu_tubuh,
                'anamnesa' => $visit->anamnesa,
                'status_antrean' => $visit->status_antrean,
                'waktu_selesai' => $exam?->waktu_selesai ? $exam->waktu_selesai->format('d/m/Y H:i') : ($visit->updated_at ? $visit->updated_at->format('d/m/Y H:i') : '-'),
                'diagnosa' => $exam?->diagnosa ?? 'Pemeriksaan Rutin / Observasi Klinis',
                'terapi_pengobatan' => $exam?->terapi_pengobatan ?? 'Istirahat dan perawatan suportif',
                'catatan' => $exam?->catatan ?? '-',
                'dokter' => $exam?->dokter?->name ?? 'drh. Tim Medis Puskeswan',
                'dokter_nama' => $exam?->dokter?->name ?? 'drh. Tim Medis Puskeswan',
                'dokter_foto' => User::resolvePhotoUrl($exam?->dokter?->foto ?: $exam?->dokter?->staf?->foto),
                'dokter_nip' => $exam?->dokter?->staf?->nip_strv ?? '-',
                'dokter_jabatan' => $exam?->dokter?->staf?->jabatan ?? 'Dokter Hewan Pemeriksa',
                'dokter_email' => $exam?->dokter?->email ?? '-',
                'admin_petugas' => $visit->admin?->name ?? 'Admin Loket',
                'has_examination' => (bool) $exam,
                'historical_records' => $historicalRecords,
            ];
        });

        $animalTypes = AnimalType::all(['id', 'nama_jenis']);
        $medicines = Medicine::orderBy('nama_obat', 'asc')->get([
            'id',
            'kode_obat',
            'nama_obat',
            'stok',
            'satuan',
        ]);

        $today = now()->toDateString();
        $totalSelesaiDokter = Visit::where('status_antrean', 'Selesai')
            ->whereHas('examination', fn ($q) => $q->where('id_dokter', $user->id))
            ->count();

        $selesaiHariIniDokter = Visit::where('status_antrean', 'Selesai')
            ->whereHas('examination', fn ($q) => $q->where('id_dokter', $user->id))
            ->whereDate('tgl_kunjungan', $today)
            ->count();

        $totalHewanUnikDokter = Visit::where('status_antrean', 'Selesai')
            ->whereHas('examination', fn ($q) => $q->where('id_dokter', $user->id))
            ->distinct('id_hewan')
            ->count('id_hewan');

        return Inertia::render('dokter/riwayat', [
            'results' => $history,
            'medicines' => $medicines,
            'animalTypes' => $animalTypes,
            'metrics' => [
                'total_selesai' => $totalSelesaiDokter,
                'selesai_hari_ini' => $selesaiHariIniDokter,
                'total_hewan_unik' => $totalHewanUnikDokter,
            ],
            'filters' => [
                'search' => $search,
                'id_jenis_hewan' => $idJenisHewan,
                'tanggal' => $dateFilter,
            ],
        ]);
    }
}
