<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Animal;
use App\Models\Owner;
use App\Models\RabiesCase;
use App\Models\Visit;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminDashboardController extends Controller
{
    /**
     * Tampilkan dashboard operasional dan antrean hari ini untuk Petugas Loket Admin.
     * Dilengkapi dua grafik statistik interaktif (Rekam Medis & Surveilans Rabies)
     * beserta fitur filter periode dinamis (7 Hari, 30 Hari, 6 Bulan, 1 Tahun).
     */
    public function index(Request $request): Response
    {
        $today = now()->toDateString();
        $period = (string) $request->input('period', '30d');
        if (! in_array($period, ['7d', '30d', '6m', '1y'], true)) {
            $period = '30d';
        }

        $totalAntreanHariIni = Visit::whereDate('tgl_kunjungan', $today)->count();
        $antreHariIni = Visit::whereDate('tgl_kunjungan', $today)
            ->where('status_antrean', 'Antri')
            ->count();
        $periksaHariIni = Visit::whereDate('tgl_kunjungan', $today)
            ->where('status_antrean', 'Pemeriksaan')
            ->count();
        $selesaiHariIni = Visit::whereDate('tgl_kunjungan', $today)
            ->where('status_antrean', 'Selesai')
            ->count();

        $totalPemilik = Owner::count();
        $totalHewan = Animal::count();
        $totalRabies = RabiesCase::count();
        $nextNoRm = Animal::generateNextNoRm();

        $todayVisits = Visit::with(['animal.pemilik', 'animal.jenisHewan'])
            ->whereDate('tgl_kunjungan', $today)
            ->orderBy('tgl_kunjungan', 'desc')
            ->take(5)
            ->get()
            ->map(function ($visit, $index) {
                return [
                    'id' => $visit->id,
                    'no_antrean' => 'A-'.str_pad((string) ($index + 1), 3, '0', STR_PAD_LEFT),
                    'no_rm' => $visit->animal?->no_rm ?? '-',
                    'nama_hewan' => $visit->animal?->nama_hewan ?? 'Hewan Pasien',
                    'jenis_hewan' => $visit->animal?->jenisHewan?->nama_jenis ?? '-',
                    'pemilik' => $visit->animal?->pemilik?->nama_lengkap ?? 'Umum',
                    'no_hp' => $visit->animal?->pemilik?->no_hp_wa ?? '-',
                    'waktu' => $visit->tgl_kunjungan ? $visit->tgl_kunjungan->format('H:i') : '-',
                    'berat_badan' => $visit->berat_badan ? $visit->berat_badan.' kg' : '-',
                    'suhu_tubuh' => $visit->suhu_tubuh ? $visit->suhu_tubuh.' °C' : '-',
                    'anamnesa' => $visit->anamnesa ?? '-',
                    'status_antrean' => $visit->status_antrean ?? 'Antri',
                ];
            });

        $indonesianMonths = [
            1 => 'Jan', 2 => 'Feb', 3 => 'Mar', 4 => 'Apr', 5 => 'Mei', 6 => 'Jun',
            7 => 'Jul', 8 => 'Agu', 9 => 'Sep', 10 => 'Okt', 11 => 'Nov', 12 => 'Des',
        ];

        $medicalPoints = [];
        $rabiesPoints = [];
        $totalVisitsInPeriod = 0;
        $totalSelesaiInPeriod = 0;
        $totalAntriInPeriod = 0;
        $totalRabiesInPeriod = 0;
        $totalVarInPeriod = 0;
        $totalObservasiInPeriod = 0;

        if ($period === '7d' || $period === '30d') {
            $daysCount = $period === '7d' ? 7 : 30;

            for ($i = $daysCount - 1; $i >= 0; $i--) {
                $targetDate = now()->subDays($i);
                $dateString = $targetDate->toDateString();
                $monthNum = (int) $targetDate->month;
                $label = $targetDate->format('d/m');
                $fullLabel = $targetDate->format('d').' '.$indonesianMonths[$monthNum].' '.$targetDate->year;

                $countTotal = Visit::whereDate('tgl_kunjungan', $dateString)->count();
                $countSelesai = Visit::whereDate('tgl_kunjungan', $dateString)->where('status_antrean', 'Selesai')->count();
                $countAntri = max(0, $countTotal - $countSelesai);

                $totalVisitsInPeriod += $countTotal;
                $totalSelesaiInPeriod += $countSelesai;
                $totalAntriInPeriod += $countAntri;

                $medicalPoints[] = [
                    'key' => $dateString,
                    'label' => $label,
                    'full_label' => $fullLabel,
                    'total' => $countTotal,
                    'selesai' => $countSelesai,
                    'antri' => $countAntri,
                ];

                $countKasus = RabiesCase::whereDate('tgl_kejadian', $dateString)->count();
                $countVar = RabiesCase::whereDate('tgl_kejadian', $dateString)
                    ->where(function ($q) {
                        $q->where('status_var', 'like', '%Sudah%')
                            ->orWhere('status_var', 'like', '%Dosis%');
                    })
                    ->count();
                $countObservasi = RabiesCase::whereDate('tgl_kejadian', $dateString)
                    ->where('status_hewan', 'like', '%Observasi%')
                    ->count();

                $totalRabiesInPeriod += $countKasus;
                $totalVarInPeriod += $countVar;
                $totalObservasiInPeriod += $countObservasi;

                $rabiesPoints[] = [
                    'key' => $dateString,
                    'label' => $label,
                    'full_label' => $fullLabel,
                    'kasus' => $countKasus,
                    'var' => $countVar,
                    'observasi' => $countObservasi,
                ];
            }
        } else {
            $monthsCount = $period === '6m' ? 6 : 12;

            for ($i = $monthsCount - 1; $i >= 0; $i--) {
                $targetDate = now()->subMonths($i);
                $year = (int) $targetDate->year;
                $month = (int) $targetDate->month;
                $monthKey = $targetDate->format('Y-m');
                $label = $indonesianMonths[$month];
                $fullLabel = $indonesianMonths[$month].' '.$year;

                $countTotal = Visit::whereYear('tgl_kunjungan', $year)
                    ->whereMonth('tgl_kunjungan', $month)
                    ->count();
                $countSelesai = Visit::whereYear('tgl_kunjungan', $year)
                    ->whereMonth('tgl_kunjungan', $month)
                    ->where('status_antrean', 'Selesai')
                    ->count();
                $countAntri = max(0, $countTotal - $countSelesai);

                $totalVisitsInPeriod += $countTotal;
                $totalSelesaiInPeriod += $countSelesai;
                $totalAntriInPeriod += $countAntri;

                $medicalPoints[] = [
                    'key' => $monthKey,
                    'label' => $label,
                    'full_label' => $fullLabel,
                    'total' => $countTotal,
                    'selesai' => $countSelesai,
                    'antri' => $countAntri,
                ];

                $countKasus = RabiesCase::whereYear('tgl_kejadian', $year)
                    ->whereMonth('tgl_kejadian', $month)
                    ->count();
                $countVar = RabiesCase::whereYear('tgl_kejadian', $year)
                    ->whereMonth('tgl_kejadian', $month)
                    ->where(function ($q) {
                        $q->where('status_var', 'like', '%Sudah%')
                            ->orWhere('status_var', 'like', '%Dosis%');
                    })
                    ->count();
                $countObservasi = RabiesCase::whereYear('tgl_kejadian', $year)
                    ->whereMonth('tgl_kejadian', $month)
                    ->where('status_hewan', 'like', '%Observasi%')
                    ->count();

                $totalRabiesInPeriod += $countKasus;
                $totalVarInPeriod += $countVar;
                $totalObservasiInPeriod += $countObservasi;

                $rabiesPoints[] = [
                    'key' => $monthKey,
                    'label' => $label,
                    'full_label' => $fullLabel,
                    'kasus' => $countKasus,
                    'var' => $countVar,
                    'observasi' => $countObservasi,
                ];
            }
        }

        $completionRate = $totalVisitsInPeriod > 0
            ? round(($totalSelesaiInPeriod / $totalVisitsInPeriod) * 100)
            : 100;

        $varCoverageRate = $totalRabiesInPeriod > 0
            ? round(($totalVarInPeriod / $totalRabiesInPeriod) * 100)
            : 100;

        return Inertia::render('admin/dashboard', [
            'metrics' => [
                'total_antrean_hari_ini' => $totalAntreanHariIni,
                'menunggu_hari_ini' => $antreHariIni,
                'diperiksa_hari_ini' => $periksaHariIni,
                'selesai_hari_ini' => $selesaiHariIni,
                'total_pemilik' => $totalPemilik,
                'total_hewan' => $totalHewan,
                'total_rabies' => $totalRabies,
                'next_no_rm' => $nextNoRm,
            ],
            'todayVisits' => $todayVisits,
            'currentPeriod' => $period,
            'medicalChart' => [
                'points' => $medicalPoints,
                'summary' => [
                    'total' => $totalVisitsInPeriod,
                    'selesai' => $totalSelesaiInPeriod,
                    'antri' => $totalAntriInPeriod,
                    'completion_rate' => $completionRate,
                ],
            ],
            'rabiesChart' => [
                'points' => $rabiesPoints,
                'summary' => [
                    'total_kasus' => $totalRabiesInPeriod,
                    'total_var' => $totalVarInPeriod,
                    'total_observasi' => $totalObservasiInPeriod,
                    'var_coverage_rate' => $varCoverageRate,
                ],
            ],
        ]);
    }
}
