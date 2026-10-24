<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Animal;
use App\Models\Owner;
use App\Models\RabiesCase;
use App\Models\Visit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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

        $todaySummary = Visit::query()
            ->whereDate('tgl_kunjungan', $today)
            ->selectRaw('
                COUNT(*) as total,
                SUM(CASE WHEN status_antrean = ? THEN 1 ELSE 0 END) as antri,
                SUM(CASE WHEN status_antrean = ? THEN 1 ELSE 0 END) as periksa,
                SUM(CASE WHEN status_antrean = ? THEN 1 ELSE 0 END) as selesai
            ', ['Antri', 'Pemeriksaan', 'Selesai'])
            ->first();

        $totalAntreanHariIni = (int) ($todaySummary->total ?? 0);
        $antreHariIni = (int) ($todaySummary->antri ?? 0);
        $periksaHariIni = (int) ($todaySummary->periksa ?? 0);
        $selesaiHariIni = (int) ($todaySummary->selesai ?? 0);

        $totalPemilik = Owner::count();
        $totalHewan = Animal::count();
        $totalRabies = RabiesCase::count();
        $nextNoRm = Animal::generateNextNoRm();

        $todayVisits = Visit::with([
            'animal:id,id_pemilik,id_jenis_hewan,no_rm,nama_hewan',
            'animal.pemilik:id,nama_lengkap,no_hp_wa',
            'animal.jenisHewan:id,nama_jenis',
        ])
            ->whereDate('tgl_kunjungan', $today)
            ->orderBy('tgl_kunjungan', 'desc')
            ->take(5)
            ->get([
                'id',
                'id_hewan',
                'tgl_kunjungan',
                'berat_badan',
                'suhu_tubuh',
                'anamnesa',
                'status_antrean',
            ])
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

        $driver = DB::connection()->getDriverName();

        if ($period === '7d' || $period === '30d') {
            $daysCount = $period === '7d' ? 7 : 30;
            $startDate = now()->subDays($daysCount - 1)->startOfDay();
            $endDate = now()->endOfDay();

            $visitDateExpr = $driver === 'sqlite'
                ? "strftime('%Y-%m-%d', tgl_kunjungan)"
                : 'DATE(tgl_kunjungan)';

            $rabiesDateExpr = $driver === 'sqlite'
                ? "strftime('%Y-%m-%d', tgl_kejadian)"
                : 'DATE(tgl_kejadian)';

            $dailyVisits = Visit::query()
                ->selectRaw("{$visitDateExpr} as date_key, COUNT(*) as total, SUM(CASE WHEN status_antrean = ? THEN 1 ELSE 0 END) as selesai", ['Selesai'])
                ->whereBetween('tgl_kunjungan', [$startDate, $endDate])
                ->groupByRaw($visitDateExpr)
                ->get()
                ->keyBy('date_key');

            $dailyRabies = RabiesCase::query()
                ->selectRaw("{$rabiesDateExpr} as date_key,
                    COUNT(*) as kasus,
                    SUM(CASE WHEN status_var LIKE ? OR status_var LIKE ? OR status_var LIKE ? THEN 1 ELSE 0 END) as var,
                    SUM(CASE WHEN status_hewan LIKE ? THEN 1 ELSE 0 END) as observasi",
                    ['%Sudah%', '%Dosis%', '%diberikan%', '%Observasi%']
                )
                ->whereBetween('tgl_kejadian', [$startDate, $endDate])
                ->groupByRaw($rabiesDateExpr)
                ->get()
                ->keyBy('date_key');

            for ($i = $daysCount - 1; $i >= 0; $i--) {
                $targetDate = now()->subDays($i);
                $dateString = $targetDate->toDateString();
                $monthNum = (int) $targetDate->month;
                $label = $targetDate->format('d/m');
                $fullLabel = $targetDate->format('d').' '.$indonesianMonths[$monthNum].' '.$targetDate->year;

                $vStats = $dailyVisits->get($dateString);
                $countTotal = (int) ($vStats->total ?? 0);
                $countSelesai = (int) ($vStats->selesai ?? 0);
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

                $rStats = $dailyRabies->get($dateString);
                $countKasus = (int) ($rStats->kasus ?? 0);
                $countVar = (int) ($rStats->var ?? 0);
                $countObservasi = (int) ($rStats->observasi ?? 0);

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
            $startMonth = now()->startOfMonth()->subMonths($monthsCount - 1);
            $endMonth = now()->endOfMonth();

            $visitYearExpr = $driver === 'sqlite'
                ? "CAST(strftime('%Y', tgl_kunjungan) AS INTEGER)"
                : 'YEAR(tgl_kunjungan)';

            $visitMonthExpr = $driver === 'sqlite'
                ? "CAST(strftime('%m', tgl_kunjungan) AS INTEGER)"
                : 'MONTH(tgl_kunjungan)';

            $monthlyVisits = Visit::query()
                ->selectRaw("{$visitYearExpr} as yr, {$visitMonthExpr} as mo, COUNT(*) as total, SUM(CASE WHEN status_antrean = ? THEN 1 ELSE 0 END) as selesai", ['Selesai'])
                ->whereBetween('tgl_kunjungan', [$startMonth, $endMonth])
                ->groupByRaw("{$visitYearExpr}, {$visitMonthExpr}")
                ->get()
                ->keyBy(fn ($r) => sprintf('%04d-%02d', (int) $r->yr, (int) $r->mo));

            $rabiesYearExpr = $driver === 'sqlite'
                ? "CAST(strftime('%Y', tgl_kejadian) AS INTEGER)"
                : 'YEAR(tgl_kejadian)';

            $rabiesMonthExpr = $driver === 'sqlite'
                ? "CAST(strftime('%m', tgl_kejadian) AS INTEGER)"
                : 'MONTH(tgl_kejadian)';

            $monthlyRabies = RabiesCase::query()
                ->selectRaw("{$rabiesYearExpr} as yr, {$rabiesMonthExpr} as mo, COUNT(*) as kasus,
                    SUM(CASE WHEN status_var LIKE ? OR status_var LIKE ? OR status_var LIKE ? THEN 1 ELSE 0 END) as var,
                    SUM(CASE WHEN status_hewan LIKE ? THEN 1 ELSE 0 END) as observasi",
                    ['%Sudah%', '%Dosis%', '%diberikan%', '%Observasi%']
                )
                ->whereBetween('tgl_kejadian', [$startMonth, $endMonth])
                ->groupByRaw("{$rabiesYearExpr}, {$rabiesMonthExpr}")
                ->get()
                ->keyBy(fn ($r) => sprintf('%04d-%02d', (int) $r->yr, (int) $r->mo));

            for ($i = $monthsCount - 1; $i >= 0; $i--) {
                $targetDate = now()->subMonths($i);
                $year = (int) $targetDate->year;
                $month = (int) $targetDate->month;
                $monthKey = $targetDate->format('Y-m');
                $label = $indonesianMonths[$month];
                $fullLabel = $indonesianMonths[$month].' '.$year;

                $vStats = $monthlyVisits->get($monthKey);
                $countTotal = (int) ($vStats->total ?? 0);
                $countSelesai = (int) ($vStats->selesai ?? 0);
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

                $rStats = $monthlyRabies->get($monthKey);
                $countKasus = (int) ($rStats->kasus ?? 0);
                $countVar = (int) ($rStats->var ?? 0);
                $countObservasi = (int) ($rStats->observasi ?? 0);

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
