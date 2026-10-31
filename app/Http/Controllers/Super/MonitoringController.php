<?php

namespace App\Http\Controllers\Super;

use App\Http\Controllers\Controller;
use App\Models\Visit;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MonitoringController extends Controller
{
    /**
     * Pantau Antrean Loket Pendaftaran (Realtime Read-Only Oversight).
     */
    public function antrianLoket(Request $request): Response
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

        $visits = $query->paginate(10)->withQueryString();

        $visits->getCollection()->transform(function ($visit, $index) use ($visits) {
            $queueNum = $visits->firstItem() ? ($visits->firstItem() + $index) : ($index + 1);

            return [
                'id' => $visit->id,
                'no_antrean' => str_pad((string) $queueNum, 3, '0', STR_PAD_LEFT),
                'no_rm' => $visit->animal?->no_rm ?? '-',
                'nama_hewan' => $visit->animal?->nama_hewan ?? '-',
                'jenis_hewan' => $visit->animal?->jenisHewan?->nama_jenis ?? '-',
                'id_jenis_hewan' => $visit->animal?->id_jenis_hewan,
                'jenis_kelamin' => $visit->animal?->jenis_kelamin ?? '-',
                'umur' => $visit->animal?->umur ?? '-',
                'warna_hewan' => $visit->animal?->warna_hewan ?? '-',
                'pemilik' => $visit->animal?->pemilik?->nama_lengkap ?? '-',
                'nik_pemilik' => $visit->animal?->pemilik?->nik ?? '-',
                'no_hp' => $visit->animal?->pemilik?->no_hp_wa ?? '-',
                'alamat_pemilik' => $visit->animal?->pemilik?->alamat_lengkap ?? '-',
                'tgl_kunjungan' => $visit->tgl_kunjungan ? $visit->tgl_kunjungan->format('d M Y, H:i') : '-',
                'raw_tgl' => $visit->tgl_kunjungan ? $visit->tgl_kunjungan->format('Y-m-d') : '',
                'berat_badan' => (float) ($visit->berat_badan ?? 0),
                'suhu_tubuh' => (float) ($visit->suhu_tubuh ?? 0),
                'anamnesa' => $visit->anamnesa ?? '-',
                'status_antrean' => $visit->status_antrean,
                'dokter' => $visit->examination?->dokter?->name ?? 'Belum Ditentukan',
                'dokter_foto' => $visit->examination?->dokter?->foto,
                'dokter_nip' => $visit->examination?->dokter?->staf?->nip_strv,
                'dokter_jabatan' => $visit->examination?->dokter?->staf?->jabatan,
                'diagnosa' => $visit->examination?->diagnosa ?? null,
                'terapi' => $visit->examination?->terapi_pengobatan ?? null,
                'admin_petugas' => $visit->admin?->name ?? 'Petugas Loket',
            ];
        });

        // Summary counts for monitoring indicators
        $summaryCounts = Visit::query()
            ->when($dateFilter, fn ($q, $date) => $q->whereDate('tgl_kunjungan', $date))
            ->selectRaw("
                COUNT(*) as total,
                SUM(CASE WHEN status_antrean = 'Antri' THEN 1 ELSE 0 END) as antri,
                SUM(CASE WHEN status_antrean = 'Pemeriksaan' THEN 1 ELSE 0 END) as periksa,
                SUM(CASE WHEN status_antrean = 'Selesai' THEN 1 ELSE 0 END) as selesai,
                SUM(CASE WHEN status_antrean = 'Batal' THEN 1 ELSE 0 END) as batal
            ")
            ->first();

        return Inertia::render('super/monitoring/antrian-loket', [
            'visits' => $visits,
            'filters' => [
                'search' => $search,
                'status' => $statusFilter,
                'tanggal' => $dateFilter,
            ],
            'summary' => [
                'total' => (int) ($summaryCounts->total ?? 0),
                'antri' => (int) ($summaryCounts->antri ?? 0),
                'periksa' => (int) ($summaryCounts->periksa ?? 0),
                'selesai' => (int) ($summaryCounts->selesai ?? 0),
                'batal' => (int) ($summaryCounts->batal ?? 0),
            ],
        ]);
    }

    /**
     * Pantau Ruang Pelayanan & Pemeriksaan Dokter Hewan (Realtime Read-Only Oversight).
     */
    public function pelayananDokter(Request $request): Response
    {
        $search = trim((string) $request->input('search', ''));
        $statusFilter = $request->input('status'); // null = semua status antrean
        $dateFilter = $request->input('tanggal');

        $query = Visit::with([
            'animal:id,id_pemilik,id_jenis_hewan,no_rm,nama_hewan,jenis_kelamin,umur,warna_hewan',
            'animal.pemilik:id,nama_lengkap,nik,no_hp_wa,alamat_lengkap',
            'animal.jenisHewan:id,nama_jenis',
            'admin:id,name',
            'examination:id,id_kunjungan,id_dokter,diagnosa,terapi_pengobatan,catatan',
            'examination.dokter:id,name,foto,id_staf',
            'examination.dokter.staf:id,nama_staf,foto',
            'animal.visits' => function ($q) {
                $q->where('status_antrean', 'Selesai')
                    ->with([
                        'examination:id,id_kunjungan,id_dokter,diagnosa,terapi_pengobatan,catatan',
                        'examination.dokter:id,name,foto,id_staf',
                        'examination.dokter.staf:id,nama_staf,foto',
                    ])
                    ->orderBy('tgl_kunjungan', 'desc');
            },
        ])
            ->when($statusFilter && $statusFilter !== 'Semua', function ($q) use ($statusFilter) {
                $q->where('status_antrean', $statusFilter);
            })
            ->when($dateFilter, function ($q, $date) {
                $q->whereDate('tgl_kunjungan', $date);
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
                        });
                });
            })
            ->orderByRaw("CASE 
                WHEN status_antrean = 'Pemeriksaan' THEN 1
                WHEN status_antrean = 'Antri' THEN 2
                ELSE 3 END")
            ->orderBy('tgl_kunjungan', 'asc');

        $visits = $query->paginate(10)->withQueryString();

        $visits->getCollection()->transform(function ($visit) {
            $exam = $visit->examination;

            $historicalRecords = $visit->animal?->visits
                ? $visit->animal->visits
                    ->filter(fn ($v) => $v->id !== $visit->id)
                    ->values()
                    ->map(fn ($v) => [
                        'id' => $v->id,
                        'tgl_kunjungan' => $v->tgl_kunjungan ? $v->tgl_kunjungan->format('d/m/Y') : '-',
                        'berat_badan' => (float) ($v->berat_badan ?? 0),
                        'suhu_tubuh' => (float) ($v->suhu_tubuh ?? 0),
                        'anamnesa' => $v->anamnesa ?? '-',
                        'diagnosa' => $v->examination?->diagnosa ?? '-',
                        'terapi_pengobatan' => $v->examination?->terapi_pengobatan ?? '-',
                        'catatan' => $v->examination?->catatan ?? '-',
                        'dokter' => $v->examination?->dokter?->staf?->nama_staf ?? ($v->examination?->dokter?->name ?? '-'),
                        'dokter_foto' => $v->examination?->dokter?->foto,
                        'dokter_nip' => $v->examination?->dokter?->staf?->nip_strv,
                    ])
                    ->all()
                : [];

            return [
                'id' => $visit->id,
                'no_rm' => $visit->animal?->no_rm ?? '-',
                'nama_hewan' => $visit->animal?->nama_hewan ?? 'Hewan Pasien',
                'jenis_hewan' => $visit->animal?->jenisHewan?->nama_jenis ?? '-',
                'jenis_kelamin' => $visit->animal?->jenis_kelamin ?? '-',
                'umur' => $visit->animal?->umur ?? '-',
                'warna_hewan' => $visit->animal?->warna_hewan ?? '-',
                'pemilik' => $visit->animal?->pemilik?->nama_lengkap ?? 'Umum',
                'nik_pemilik' => $visit->animal?->pemilik?->nik ?? '-',
                'no_hp' => $visit->animal?->pemilik?->no_hp_wa ?? '-',
                'alamat_pemilik' => $visit->animal?->pemilik?->alamat_lengkap ?? '-',
                'tgl_kunjungan' => $visit->tgl_kunjungan ? $visit->tgl_kunjungan->format('d M Y, H:i') : '-',
                'berat_badan' => (float) ($visit->berat_badan ?? 0),
                'suhu_tubuh' => (float) ($visit->suhu_tubuh ?? 0),
                'anamnesa' => $visit->anamnesa ?? '-',
                'status_antrean' => $visit->status_antrean,
                'diagnosa' => $exam?->diagnosa ?? '',
                'terapi_pengobatan' => $exam?->terapi_pengobatan ?? '',
                'catatan' => $exam?->catatan ?? '',
                'dokter_nama' => $exam?->dokter?->staf?->nama_staf ?? ($exam?->dokter?->name ?? 'Belum Ditentukan'),
                'petugas_loket' => $visit->admin?->name ?? '-',
                'riwayat_sebelumnya' => $historicalRecords,
            ];
        });

        // Summary counts
        $summaryCounts = Visit::query()
            ->when($dateFilter, fn ($q, $date) => $q->whereDate('tgl_kunjungan', $date))
            ->selectRaw("
                COUNT(*) as total,
                SUM(CASE WHEN status_antrean = 'Antri' THEN 1 ELSE 0 END) as antri,
                SUM(CASE WHEN status_antrean = 'Pemeriksaan' THEN 1 ELSE 0 END) as periksa,
                SUM(CASE WHEN status_antrean = 'Selesai' THEN 1 ELSE 0 END) as selesai
            ")
            ->first();

        return Inertia::render('super/monitoring/pelayanan-dokter', [
            'visits' => $visits,
            'filters' => [
                'search' => $search,
                'status' => $statusFilter,
                'tanggal' => $dateFilter,
            ],
            'summary' => [
                'total' => (int) ($summaryCounts->total ?? 0),
                'antri' => (int) ($summaryCounts->antri ?? 0),
                'periksa' => (int) ($summaryCounts->periksa ?? 0),
                'selesai' => (int) ($summaryCounts->selesai ?? 0),
            ],
        ]);
    }
}
