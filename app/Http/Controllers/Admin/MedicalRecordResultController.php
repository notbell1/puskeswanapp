<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AnimalType;
use App\Models\Staff;
use App\Models\User;
use App\Models\Visit;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MedicalRecordResultController extends Controller
{
    /**
     * Tampilkan daftar hasil pemeriksaan rekam medis yang telah selesai diperiksa oleh dokter.
     */
    public function index(Request $request): Response
    {
        $search = trim((string) $request->input('search', ''));
        $idJenisHewan = $request->input('id_jenis_hewan');
        $dateFilter = $request->input('tanggal');

        $query = Visit::with([
            'animal:id,id_pemilik,id_jenis_hewan,no_rm,nama_hewan,jenis_kelamin,umur,warna_hewan',
            'animal.pemilik:id,nama_lengkap,nik,no_hp_wa,alamat_lengkap',
            'animal.jenisHewan:id,nama_jenis',
            'animal.visits' => function ($q) {
                $q->where('status_antrean', 'Selesai')
                    ->with([
                        'examination:id,id_kunjungan,id_dokter,diagnosa,terapi_pengobatan,catatan',
                        'examination.dokter:id,name,foto,id_staf',
                        'examination.dokter.staf:id,nama_staf,foto',
                    ])
                    ->orderBy('tgl_kunjungan', 'desc');
            },
            'examination:id,id_kunjungan,id_dokter,diagnosa,terapi_pengobatan,catatan,waktu_selesai',
            'examination.dokter:id,name,foto,email,id_staf',
            'examination.dokter.staf:id,nama_staf,nip_strv,jabatan,foto',
            'admin:id,name',
        ])
            ->where('status_antrean', 'Selesai')
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
                                ->orWhere('catatan', 'like', "%{$search}%")
                                ->orWhereHas('dokter', function ($qd) use ($search) {
                                    $qd->where('name', 'like', "%{$search}%");
                                });
                        });
                });
            })
            ->orderBy('tgl_kunjungan', 'desc');

        $results = $query->paginate(5)->withQueryString();

        $results->getCollection()->transform(function ($visit, $index) {
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
                'id_jenis_hewan' => $visit->animal?->id_jenis_hewan,
                'jenis_hewan' => $visit->animal?->jenisHewan?->nama_jenis ?? '-',
                'jenis_kelamin' => $visit->animal?->jenis_kelamin ?? '-',
                'umur' => $visit->animal?->umur ?? '-',
                'warna_hewan' => $visit->animal?->warna_hewan ?? '-',
                'pemilik' => $visit->animal?->pemilik?->nama_lengkap ?? 'Umum',
                'nik_pemilik' => $visit->animal?->pemilik?->nik ?? '-',
                'no_hp' => $visit->animal?->pemilik?->no_hp_wa ?? '-',
                'alamat_pemilik' => $visit->animal?->pemilik?->alamat_lengkap ?? '-',
                'tgl_kunjungan' => $visit->tgl_kunjungan ? $visit->tgl_kunjungan->format('d/m/Y H:i') : '-',
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
                'dokter_foto' => User::resolvePhotoUrl($exam?->dokter?->foto ?: $exam?->dokter?->staf?->foto),
                'dokter_nip' => $exam?->dokter?->staf?->nip_strv ?? '-',
                'dokter_jabatan' => $exam?->dokter?->staf?->jabatan ?? 'Dokter Hewan Pemeriksa',
                'dokter_email' => $exam?->dokter?->email ?? '-',
                'admin_petugas' => $visit->admin?->name ?? 'Admin Loket',
                'historical_records' => $historicalRecords,
            ];
        });

        $animalTypes = AnimalType::all(['id', 'nama_jenis']);

        $today = now()->toDateString();
        $summary = Visit::where('status_antrean', 'Selesai')
            ->selectRaw('
                COUNT(*) as total_selesai,
                SUM(CASE WHEN date(tgl_kunjungan) = ? THEN 1 ELSE 0 END) as selesai_today,
                COUNT(DISTINCT id_hewan) as total_hewan_unik
            ', [$today])
            ->first();

        $totalHewanBesar = Visit::where('status_antrean', 'Selesai')
            ->whereHas('animal.jenisHewan', function ($q) {
                $q->where('nama_jenis', 'like', '%Sapi%')
                    ->orWhere('nama_jenis', 'like', '%Kerbau%')
                    ->orWhere('nama_jenis', 'like', '%Kambing%');
            })->count();

        $totalSelesai = (int) ($summary->total_selesai ?? 0);
        $selesaiHariIni = (int) ($summary->selesai_today ?? 0);
        $totalHewanUnik = (int) ($summary->total_hewan_unik ?? 0);

        return Inertia::render('admin/rekam-medis/hasil', [
            'results' => $results,
            'animalTypes' => $animalTypes,
            'summary' => [
                'total_selesai' => $totalSelesai,
                'selesai_hari_ini' => $selesaiHariIni,
                'total_hewan_unik' => $totalHewanUnik,
                'total_hewan_besar' => $totalHewanBesar,
            ],
            'filters' => [
                'search' => $search,
                'id_jenis_hewan' => $idJenisHewan,
                'tanggal' => $dateFilter,
            ],
        ]);
    }

    /**
     * Cetak dokumen resmi rekapitulasi pelaporan pengobatan penyakit hewan bulanan (Format Landscape).
     */
    public function rekapBulanan(Request $request)
    {
        $bulan = (int) $request->input('bulan', now()->month);
        $tahun = (int) $request->input('tahun', now()->year);

        if ($bulan < 1 || $bulan > 12) {
            $bulan = now()->month;
        }

        if ($tahun < 2020 || $tahun > 2099) {
            $tahun = now()->year;
        }

        $namaBulanList = [
            1 => 'Januari', 2 => 'Februari', 3 => 'Maret', 4 => 'April',
            5 => 'Mei', 6 => 'Juni', 7 => 'Juli', 8 => 'Agustus',
            9 => 'September', 10 => 'Oktober', 11 => 'November', 12 => 'Desember',
        ];

        $namaBulan = $namaBulanList[$bulan] ?? 'Januari';

        $records = Visit::with([
            'animal:id,id_pemilik,id_jenis_hewan,no_rm,nama_hewan',
            'animal.pemilik:id,nama_lengkap,no_hp_wa,alamat_lengkap',
            'animal.jenisHewan:id,nama_jenis',
            'examination:id,id_kunjungan,diagnosa,terapi_pengobatan',
        ])
            ->where('status_antrean', 'Selesai')
            ->whereYear('tgl_kunjungan', $tahun)
            ->whereMonth('tgl_kunjungan', $bulan)
            ->orderBy('tgl_kunjungan', 'asc')
            ->get();

        $now = now();
        $signatureDate = $now->day.' '.$namaBulanList[$now->month].' '.$now->year;
        $pimpinan = Staff::getPimpinan();

        return view('print.rekap-rekam-medis', [
            'records' => $records,
            'bulan' => $bulan,
            'tahun' => $tahun,
            'namaBulan' => $namaBulan,
            'signatureDate' => $signatureDate,
            'pimpinan' => $pimpinan,
        ]);
    }

    /**
     * Cetak dokumen kartu rekam medis pasien hewan tunggal (Format Portrait A4).
     */
    public function cetakKartu(Visit $visit, Request $request)
    {
        $visit->load([
            'animal:id,id_pemilik,id_jenis_hewan,no_rm,nama_hewan,jenis_kelamin,umur,warna_hewan',
            'animal.pemilik:id,nama_lengkap,nik,no_hp_wa,alamat_lengkap',
            'animal.jenisHewan:id,nama_jenis',
            'animal.visits' => function ($q) {
                $q->where('status_antrean', 'Selesai')
                    ->with([
                        'examination:id,id_kunjungan,id_dokter,diagnosa,terapi_pengobatan,catatan',
                    ])
                    ->orderBy('tgl_kunjungan', 'asc');
            },
            'examination:id,id_kunjungan,id_dokter,diagnosa,terapi_pengobatan,catatan',
        ]);

        $pastVisits = $visit->animal?->visits ?? collect();
        $allVisits = $pastVisits->filter(fn ($v) => $v->id !== $visit->id)->push($visit)->sortBy('tgl_kunjungan')->values();

        $namaBulanList = [
            1 => 'Januari', 2 => 'Februari', 3 => 'Maret', 4 => 'April',
            5 => 'Mei', 6 => 'Juni', 7 => 'Juli', 8 => 'Agustus',
            9 => 'September', 10 => 'Oktober', 11 => 'November', 12 => 'Desember',
        ];

        $now = now();
        $signatureDate = $now->day.' '.$namaBulanList[$now->month].' '.$now->year;
        $pimpinan = Staff::getPimpinan();

        return view('print.kartu-rekam-medis', [
            'visit' => $visit,
            'allVisits' => $allVisits,
            'signatureDate' => $signatureDate,
            'pimpinan' => $pimpinan,
        ]);
    }
}
