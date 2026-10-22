<?php

namespace App\Http\Controllers\Super;

use App\Http\Controllers\Controller;
use App\Models\AnimalType;
use App\Models\Medicine;
use App\Models\RabiesCase;
use App\Models\Visit;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    /**
     * Rute Utama / Kompatibilitas Pusat Laporan.
     */
    public function index(Request $request): Response
    {
        $reportType = $request->input('tipe', 'kunjungan');

        if ($reportType === 'rabies') {
            return $this->rabies($request);
        }

        if ($reportType === 'obat') {
            return $this->obat($request);
        }

        return $this->rekamMedis($request);
    }

    /**
     * Modul Laporan Rekam Medis Pasien Puskeswan.
     */
    public function rekamMedis(Request $request): Response
    {
        $search = trim((string) $request->input('search', ''));
        $startDate = $request->input('tgl_mulai', now()->startOfMonth()->toDateString());
        $endDate = $request->input('tgl_selesai', now()->endOfMonth()->toDateString());
        $statusFilter = $request->input('status');
        $jenisFilter = $request->input('jenis_hewan');

        $query = Visit::with(['animal.pemilik', 'animal.jenisHewan', 'examination.dokter', 'admin'])
            ->whereBetween('tgl_kunjungan', ["{$startDate} 00:00:00", "{$endDate} 23:59:59"])
            ->when($search, function ($q, $search) {
                $q->where(function ($sub) use ($search) {
                    $sub->where('anamnesa', 'like', "%{$search}%")
                        ->orWhereHas('animal', function ($qa) use ($search) {
                            $qa->where('no_rm', 'like', "%{$search}%")
                                ->orWhere('nama_hewan', 'like', "%{$search}%");
                        })
                        ->orWhereHas('animal.pemilik', function ($qp) use ($search) {
                            $qp->where('nama_lengkap', 'like', "%{$search}%")
                                ->orWhere('no_hp_wa', 'like', "%{$search}%");
                        })
                        ->orWhereHas('examination', function ($qe) use ($search) {
                            $qe->where('diagnosa', 'like', "%{$search}%")
                                ->orWhere('terapi_pengobatan', 'like', "%{$search}%");
                        });
                });
            })
            ->when($statusFilter, function ($q, $statusFilter) {
                $q->where('status_antrean', $statusFilter);
            })
            ->when($jenisFilter, function ($q, $jenisFilter) {
                $q->whereHas('animal', fn ($qa) => $qa->where('id_jenis_hewan', $jenisFilter));
            })
            ->orderBy('tgl_kunjungan', 'desc');

        $records = $query->paginate(5)
            ->withQueryString()
            ->through(fn ($v) => [
                'id' => $v->id,
                'tgl' => $v->tgl_kunjungan ? $v->tgl_kunjungan->format('d/m/Y H:i') : '-',
                'raw_tgl' => $v->tgl_kunjungan ? $v->tgl_kunjungan->toDateString() : '',
                'no_rm' => $v->animal?->no_rm ?? '-',
                'nama_hewan' => $v->animal?->nama_hewan ?? '-',
                'jenis_hewan' => $v->animal?->jenisHewan?->nama_jenis ?? '-',
                'id_jenis_hewan' => $v->animal?->id_jenis_hewan,
                'jenis_kelamin' => $v->animal?->jenis_kelamin ?? '-',
                'umur' => $v->animal?->umur ?? '-',
                'pemilik' => $v->animal?->pemilik?->nama_lengkap ?? '-',
                'no_hp_pemilik' => $v->animal?->pemilik?->no_hp_wa ?? '-',
                'alamat_pemilik' => $v->animal?->pemilik?->alamat_lengkap ?? '-',
                'berat_badan' => $v->berat_badan ?? 0,
                'suhu_tubuh' => $v->suhu_tubuh ?? 0,
                'anamnesa' => $v->anamnesa ?? '-',
                'diagnosa' => $v->examination?->diagnosa ?? 'Menunggu Pemeriksaan',
                'terapi' => $v->examination?->terapi_pengobatan ?? '-',
                'catatan_dokter' => $v->examination?->catatan ?? '-',
                'dokter' => $v->examination?->dokter?->name ?? 'Belum Ditugaskan',
                'admin_loket' => $v->admin?->name ?? 'Petugas Loket',
                'status' => $v->status_antrean ?? 'Selesai',
            ]);

        $basePeriodQuery = Visit::whereBetween('tgl_kunjungan', ["{$startDate} 00:00:00", "{$endDate} 23:59:59"]);
        $totalPeriod = (clone $basePeriodQuery)->count();
        $totalSelesai = (clone $basePeriodQuery)->where('status_antrean', 'Selesai')->count();
        $totalAntre = (clone $basePeriodQuery)->where('status_antrean', '!=', 'Selesai')->count();

        $animalTypes = AnimalType::all(['id', 'nama_jenis']);

        return Inertia::render('super/laporan/rekam-medis', [
            'records' => $records,
            'startDate' => $startDate,
            'endDate' => $endDate,
            'animalTypes' => $animalTypes,
            'summary' => [
                'total_records' => $totalPeriod,
                'total_selesai' => $totalSelesai,
                'total_antri' => $totalAntre,
                'completion_rate' => $totalPeriod > 0 ? round(($totalSelesai / $totalPeriod) * 100) : 100,
            ],
            'filters' => [
                'search' => $search,
                'tgl_mulai' => $startDate,
                'tgl_selesai' => $endDate,
                'status' => $statusFilter,
                'jenis_hewan' => $jenisFilter,
            ],
        ]);
    }

    /**
     * Modul Laporan Surveilans Kasus Gigitan Rabies (GHPR).
     */
    public function rabies(Request $request): Response
    {
        $search = trim((string) $request->input('search', ''));
        $startDate = $request->input('tgl_mulai', now()->startOfMonth()->toDateString());
        $endDate = $request->input('tgl_selesai', now()->endOfMonth()->toDateString());
        $statusVarFilter = $request->input('status_var');
        $statusHewanFilter = $request->input('status_hewan');

        $query = RabiesCase::with(['jenisHewan', 'admin'])
            ->whereBetween('tgl_kejadian', [$startDate, $endDate])
            ->when($search, function ($q, $search) {
                $q->where(function ($sub) use ($search) {
                    $sub->where('no_surat', 'like', "%{$search}%")
                        ->orWhere('nama_pasien', 'like', "%{$search}%")
                        ->orWhere('nik_pasien', 'like', "%{$search}%")
                        ->orWhere('alamat_pasien', 'like', "%{$search}%")
                        ->orWhere('lokasi_gigitan', 'like', "%{$search}%")
                        ->orWhere('alamat_kejadian', 'like', "%{$search}%")
                        ->orWhere('kronologi', 'like', "%{$search}%");
                });
            })
            ->when($statusVarFilter, function ($q, $statusVarFilter) {
                $q->where('status_var', $statusVarFilter);
            })
            ->when($statusHewanFilter, function ($q, $statusHewanFilter) {
                $q->where('status_hewan', $statusHewanFilter);
            })
            ->orderBy('tgl_kejadian', 'desc');

        $cases = $query->paginate(5)
            ->withQueryString()
            ->through(fn ($r) => [
                'id' => $r->id,
                'no_surat' => $r->no_surat,
                'perihal' => $r->perihal,
                'nama_pasien' => $r->nama_pasien,
                'nik_pasien' => $r->nik_pasien,
                'jenis_kelamin_pasien' => $r->jenis_kelamin_pasien,
                'umur_pasien' => $r->umur_pasien,
                'alamat_pasien' => $r->alamat_pasien,
                'no_hp_pasien' => $r->no_hp_pasien ?? '-',
                'lokasi_gigitan' => $r->lokasi_gigitan,
                'status_var' => $r->status_var,
                'jenis_hewan' => $r->jenisHewan?->nama_jenis ?? 'Anjing',
                'ras_hewan' => $r->ras_hewan ?? '-',
                'status_hewan' => $r->status_hewan,
                'nama_pemilik_hewan' => $r->nama_pemilik_hewan ?? 'Liar / Tidak Diketahui',
                'tgl_kejadian' => $r->tgl_kejadian ? $r->tgl_kejadian->format('d/m/Y') : '-',
                'raw_tgl_kejadian' => $r->tgl_kejadian ? $r->tgl_kejadian->toDateString() : '',
                'alamat_kejadian' => $r->alamat_kejadian,
                'kronologi' => $r->kronologi,
                'petugas' => $r->admin?->name ?? 'Petugas Surveilans',
            ]);

        $basePeriodQuery = RabiesCase::whereBetween('tgl_kejadian', [$startDate, $endDate]);
        $totalKasus = (clone $basePeriodQuery)->count();
        $totalVar = (clone $basePeriodQuery)->where(function ($q) {
            $q->where('status_var', 'like', '%diberikan%')
                ->orWhere('status_var', 'like', '%lengkap%')
                ->orWhere('status_var', 'like', '%sudah%');
        })->count();
        $totalObservasi = (clone $basePeriodQuery)->where('status_hewan', 'like', '%Observasi%')->count();
        $totalMati = (clone $basePeriodQuery)->where('status_hewan', 'like', '%Mati%')->count();

        return Inertia::render('super/laporan/rabies', [
            'cases' => $cases,
            'startDate' => $startDate,
            'endDate' => $endDate,
            'summary' => [
                'total_kasus' => $totalKasus,
                'total_var' => $totalVar,
                'total_observasi' => $totalObservasi,
                'total_mati' => $totalMati,
                'var_coverage_rate' => $totalKasus > 0 ? round(($totalVar / $totalKasus) * 100) : 100,
            ],
            'filters' => [
                'search' => $search,
                'tgl_mulai' => $startDate,
                'tgl_selesai' => $endDate,
                'status_var' => $statusVarFilter,
                'status_hewan' => $statusHewanFilter,
            ],
        ]);
    }

    /**
     * Kompatibilitas Laporan Logistik Obat (Bila Diakses via tipe=obat).
     */
    protected function obat(Request $request): Response
    {
        $reportData = Medicine::orderBy('stok', 'asc')
            ->get()
            ->map(fn ($m) => [
                'id' => $m->id,
                'kode_obat' => $m->kode_obat,
                'nama_obat' => $m->nama_obat,
                'stok' => $m->stok,
                'satuan' => $m->satuan,
                'status' => $m->stok <= 10 ? 'Kritis' : ($m->stok <= 30 ? 'Menipis' : 'Aman'),
            ]);

        return Inertia::render('super/laporan/index', [
            'reportType' => 'obat',
            'startDate' => now()->startOfMonth()->toDateString(),
            'endDate' => now()->endOfMonth()->toDateString(),
            'reportData' => $reportData,
            'summary' => [
                'total_records' => count($reportData),
                'total_kunjungan_bulan_ini' => Visit::whereBetween('tgl_kunjungan', [now()->startOfMonth(), now()->endOfMonth()])->count(),
                'total_rabies_tahun_ini' => RabiesCase::whereYear('tgl_kejadian', now()->year)->count(),
                'total_obat_kritis' => Medicine::where('stok', '<=', 10)->count(),
            ],
        ]);
    }
}
