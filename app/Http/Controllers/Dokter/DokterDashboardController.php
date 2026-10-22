<?php

namespace App\Http\Controllers\Dokter;

use App\Http\Controllers\Controller;
use App\Models\Examination;
use App\Models\Visit;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DokterDashboardController extends Controller
{
    /**
     * Tampilkan dashboard utama dokter hewan dengan grafik analitik detail, filter fleksibel, dan antrean prioritas.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $today = Carbon::today();
        $todayStr = $today->toDateString();

        $period = (string) $request->input('period', '7d');
        $filterType = (string) $request->input('filter_type', 'preset'); // 'preset' | 'month' | 'range'
        $selectedMonth = (int) $request->input('bulan', $today->month);
        $selectedYear = (int) $request->input('tahun', $today->year);
        $startDateInput = $request->input('start_date');
        $endDateInput = $request->input('end_date');

        if ($filterType === 'range' && $startDateInput && $endDateInput) {
            $startDate = Carbon::parse($startDateInput)->startOfDay();
            $endDate = Carbon::parse($endDateInput)->endOfDay();
            if ($startDate->gt($endDate)) {
                [$startDate, $endDate] = [$endDate->copy()->startOfDay(), $startDate->copy()->endOfDay()];
            }
            if ($startDate->diffInDays($endDate) > 90) {
                $startDate = $endDate->copy()->subDays(90)->startOfDay();
            }
        } elseif ($filterType === 'month') {
            $startDate = Carbon::createFromDate($selectedYear, $selectedMonth, 1)->startOfDay();
            $endDate = $startDate->copy()->endOfMonth()->endOfDay();
        } elseif ($period === '30d') {
            $startDate = $today->copy()->subDays(29)->startOfDay();
            $endDate = $today->copy()->endOfDay();
        } else {
            $period = '7d';
            $startDate = $today->copy()->subDays(6)->startOfDay();
            $endDate = $today->copy()->endOfDay();
        }

        $totalDays = (int) $startDate->diffInDays($endDate) + 1;
        $chartPoints = [];
        $maxCount = 0;

        $examinationsGrouped = Examination::where('id_dokter', $user->id)
            ->whereBetween('waktu_selesai', [$startDate->copy()->startOfDay(), $endDate->copy()->endOfDay()])
            ->selectRaw('DATE(waktu_selesai) as exam_date, COUNT(*) as total')
            ->groupBy('exam_date')
            ->pluck('total', 'exam_date');

        for ($i = 0; $i < $totalDays; $i++) {
            $curDate = $startDate->copy()->addDays($i);
            $dStr = $curDate->toDateString();
            $cnt = (int) ($examinationsGrouped[$dStr] ?? 0);

            if ($cnt > $maxCount) {
                $maxCount = $cnt;
            }

            if ($totalDays <= 14) {
                $lbl = $curDate->translatedFormat('D, d M');
            } else {
                $lbl = $curDate->translatedFormat('d/m');
            }

            $chartPoints[] = [
                'date' => $dStr,
                'label' => $lbl,
                'full_date' => $curDate->translatedFormat('l, d F Y'),
                'day_name' => $curDate->translatedFormat('D'),
                'day_num' => $curDate->format('d'),
                'count' => $cnt,
            ];
        }

        $yMax = $maxCount <= 10 ? 10 : (int) (ceil($maxCount / 5) * 5);

        $chartAll = [];
        foreach (['7d' => 7, '30d' => 30] as $pKey => $pDays) {
            $pStart = $today->copy()->subDays($pDays - 1)->startOfDay();
            $pEnd = $today->copy()->endOfDay();
            $pPoints = [];
            $pMax = 0;

            $pGrouped = Examination::where('id_dokter', $user->id)
                ->whereBetween('waktu_selesai', [$pStart, $pEnd])
                ->selectRaw('DATE(waktu_selesai) as exam_date, COUNT(*) as total')
                ->groupBy('exam_date')
                ->pluck('total', 'exam_date');

            for ($i = 0; $i < $pDays; $i++) {
                $d = $pStart->copy()->addDays($i);
                $dStr = $d->toDateString();
                $c = (int) ($pGrouped[$dStr] ?? 0);
                if ($c > $pMax) {
                    $pMax = $c;
                }
                $pPoints[] = [
                    'date' => $dStr,
                    'label' => $pDays <= 14 ? $d->translatedFormat('D, d M') : $d->translatedFormat('d/m'),
                    'full_date' => $d->translatedFormat('l, d F Y'),
                    'day_name' => $d->translatedFormat('D'),
                    'day_num' => $d->format('d'),
                    'count' => $c,
                ];
            }

            $chartAll[$pKey] = [
                'points' => $pPoints,
                'max' => $pMax <= 10 ? 10 : (int) (ceil($pMax / 5) * 5),
            ];
        }

        $priorityQueue = Visit::with(['animal.pemilik', 'animal.jenisHewan'])
            ->whereDate('tgl_kunjungan', $todayStr)
            ->where('status_antrean', 'Antri')
            ->orderBy('tgl_kunjungan', 'asc')
            ->limit(5)
            ->get()
            ->map(fn ($visit) => [
                'id' => $visit->id,
                'no_rm' => $visit->animal?->no_rm ?? '-',
                'nama_hewan' => $visit->animal?->nama_hewan ?? 'Hewan Pasien',
                'jenis_hewan' => $visit->animal?->jenisHewan?->nama_jenis ?? '-',
                'pemilik' => $visit->animal?->pemilik?->nama_lengkap ?? 'Umum',
                'tgl_kunjungan' => $visit->tgl_kunjungan ? $visit->tgl_kunjungan->format('H:i') : '-',
                'berat_badan' => (float) $visit->berat_badan,
                'suhu_tubuh' => (float) $visit->suhu_tubuh,
                'anamnesa' => $visit->anamnesa,
                'status_antrean' => $visit->status_antrean,
            ]);

        $totalAntreanAktif = Visit::whereDate('tgl_kunjungan', $todayStr)
            ->where('status_antrean', 'Antri')
            ->count();

        $antreanHariIni = Visit::whereDate('tgl_kunjungan', $todayStr)
            ->where('status_antrean', 'Antri')
            ->count();

        $pemeriksaanAktif = Visit::whereDate('tgl_kunjungan', $todayStr)
            ->where('status_antrean', 'Pemeriksaan')
            ->count();

        $selesaiHariIni = Examination::where('id_dokter', $user->id)
            ->whereDate('waktu_selesai', $todayStr)
            ->count();

        $totalPemeriksaanDokter = Examination::where('id_dokter', $user->id)->count();

        $recentExaminations = Examination::with(['kunjungan.animal.pemilik', 'kunjungan.animal.jenisHewan'])
            ->where('id_dokter', $user->id)
            ->orderBy('waktu_selesai', 'desc')
            ->limit(5)
            ->get()
            ->map(fn ($exam) => [
                'id' => $exam->kunjungan?->id,
                'no_rm' => $exam->kunjungan?->animal?->no_rm ?? '-',
                'nama_hewan' => $exam->kunjungan?->animal?->nama_hewan ?? 'Hewan Pasien',
                'jenis_hewan' => $exam->kunjungan?->animal?->jenisHewan?->nama_jenis ?? '-',
                'pemilik' => $exam->kunjungan?->animal?->pemilik?->nama_lengkap ?? 'Umum',
                'waktu_selesai' => $exam->waktu_selesai ? $exam->waktu_selesai->format('d/m/Y H:i') : '-',
                'diagnosa' => $exam->diagnosa,
                'terapi_pengobatan' => $exam->terapi_pengobatan,
            ]);

        return Inertia::render('dokter/dashboard', [
            'metrics' => [
                'antrean_hari_ini' => $antreanHariIni,
                'pemeriksaan_aktif' => $pemeriksaanAktif,
                'selesai_hari_ini' => $selesaiHariIni,
                'total_pemeriksaan_dokter' => $totalPemeriksaanDokter,
            ],
            'chart' => [
                'period' => $period,
                'filter_type' => $filterType,
                'bulan' => $selectedMonth,
                'tahun' => $selectedYear,
                'start_date' => $startDate->toDateString(),
                'end_date' => $endDate->toDateString(),
                'points' => $chartPoints,
                'max' => $yMax,
                'all' => $chartAll,
            ],
            'priorityQueue' => $priorityQueue,
            'totalAntreanAktif' => $totalAntreanAktif,
            'recentExaminations' => $recentExaminations,
        ]);
    }
}
