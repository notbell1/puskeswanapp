<?php

namespace App\Http\Controllers\Super;

use App\Http\Controllers\Controller;
use App\Models\Animal;
use App\Models\Article;
use App\Models\Inventory;
use App\Models\Medicine;
use App\Models\RabiesCase;
use App\Models\Staff;
use App\Models\User;
use App\Models\Visit;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class SuperDashboardController extends Controller
{
    public function index(): Response
    {
        $totalUsers = User::count();
        $totalStaff = Staff::count();
        $totalAnimals = Animal::count();
        $totalVisits = Visit::count();
        $totalMedicines = Medicine::count();
        $criticalMedicines = Medicine::where('stok', '<=', 10)->count();
        $totalInventories = Inventory::count();
        $activeRabiesCases = RabiesCase::count();
        $totalArticles = Article::count();

        $recentVisits = Visit::with([
            'animal:id,id_pemilik,id_jenis_hewan,no_rm,nama_hewan',
            'animal.pemilik:id,nama_lengkap',
            'animal.jenisHewan:id,nama_jenis',
        ])
            ->latest('tgl_kunjungan')
            ->take(5)
            ->get([
                'id',
                'id_hewan',
                'tgl_kunjungan',
                'status_antrean',
            ])
            ->map(function ($visit) {
                return [
                    'id' => $visit->id,
                    'no_rm' => $visit->animal?->no_rm ?? '-',
                    'nama_hewan' => $visit->animal?->nama_hewan ?? 'Hewan Pasien',
                    'jenis_hewan' => $visit->animal?->jenisHewan?->nama_jenis ?? '-',
                    'pemilik' => $visit->animal?->pemilik?->nama_lengkap ?? 'Umum',
                    'tgl_kunjungan' => $visit->tgl_kunjungan
                        ? $visit->tgl_kunjungan->format('d M Y, H:i')
                        : '-',
                    'status_antrean' => $visit->status_antrean ?? 'Selesai',
                ];
            });

        $lowStockMedicines = Medicine::where('stok', '<=', 30)
            ->orderBy('stok')
            ->take(5)
            ->get([
                'id',
                'kode_obat',
                'nama_obat',
                'stok',
                'satuan',
            ]);

        $indonesianMonths = [
            1 => 'Jan',
            2 => 'Feb',
            3 => 'Mar',
            4 => 'Apr',
            5 => 'Mei',
            6 => 'Jun',
            7 => 'Jul',
            8 => 'Agu',
            9 => 'Sep',
            10 => 'Okt',
            11 => 'Nov',
            12 => 'Des',
        ];

        $driver = DB::connection()->getDriverName();

        $currentMonth = now()->startOfMonth();
        $startDate = $currentMonth->copy()->subMonths(5);
        $endDate = $currentMonth->copy()->endOfMonth();

        $visitYearExpression = $driver === 'sqlite'
            ? "CAST(strftime('%Y', tgl_kunjungan) AS INTEGER)"
            : 'YEAR(tgl_kunjungan)';

        $visitMonthExpression = $driver === 'sqlite'
            ? "CAST(strftime('%m', tgl_kunjungan) AS INTEGER)"
            : 'MONTH(tgl_kunjungan)';

        $visitMonthlyStats = Visit::query()
            ->selectRaw(
                "{$visitYearExpression} as year,
                 {$visitMonthExpression} as month,
                 COUNT(*) as total,
                 SUM(
                     CASE
                         WHEN status_antrean = ? THEN 1
                         ELSE 0
                     END
                 ) as selesai",
                ['Selesai']
            )
            ->whereBetween('tgl_kunjungan', [$startDate, $endDate])
            ->groupByRaw("{$visitYearExpression}, {$visitMonthExpression}")
            ->get()
            ->keyBy(fn ($row) => sprintf(
                '%04d-%02d',
                (int) $row->year,
                (int) $row->month
            ));

        $medicalMonthly = [];
        $totalVisits6m = 0;
        $totalSelesai6m = 0;

        for ($i = 5; $i >= 0; $i--) {
            $targetDate = $currentMonth->copy()->subMonths($i);
            $year = (int) $targetDate->year;
            $month = (int) $targetDate->month;
            $monthKey = $targetDate->format('Y-m');
            $label = $indonesianMonths[$month].' '.$year;

            $stats = $visitMonthlyStats->get($monthKey);

            $countTotal = (int) ($stats->total ?? 0);
            $countSelesai = (int) ($stats->selesai ?? 0);

            $totalVisits6m += $countTotal;
            $totalSelesai6m += $countSelesai;

            $medicalMonthly[] = [
                'month_key' => $monthKey,
                'label' => $indonesianMonths[$month],
                'full_label' => $label,
                'total' => $countTotal,
                'selesai' => $countSelesai,
                'antri' => max(0, $countTotal - $countSelesai),
            ];
        }

        $speciesDistribution = Visit::query()
            ->leftJoin('animals', 'visits.id_hewan', '=', 'animals.id')
            ->leftJoin(
                'animal_types',
                'animals.id_jenis_hewan',
                '=',
                'animal_types.id'
            )
            ->selectRaw(
                "COALESCE(animal_types.nama_jenis, 'Lainnya') as name,
                 COUNT(*) as count"
            )
            ->groupByRaw("COALESCE(animal_types.nama_jenis, 'Lainnya')")
            ->orderByDesc('count')
            ->limit(5)
            ->get()
            ->map(fn ($row) => [
                'name' => $row->name,
                'count' => (int) $row->count,
            ])
            ->all();

        $rabiesYearExpression = $driver === 'sqlite'
            ? "CAST(strftime('%Y', tgl_kejadian) AS INTEGER)"
            : 'YEAR(tgl_kejadian)';

        $rabiesMonthExpression = $driver === 'sqlite'
            ? "CAST(strftime('%m', tgl_kejadian) AS INTEGER)"
            : 'MONTH(tgl_kejadian)';

        $rabiesMonthlyStats = RabiesCase::query()
            ->selectRaw(
                "{$rabiesYearExpression} as year,
                 {$rabiesMonthExpression} as month,
                 COUNT(*) as kasus,
                 SUM(
                     CASE
                         WHEN status_var LIKE ?
                           OR status_var LIKE ?
                           OR status_var LIKE ?
                         THEN 1
                         ELSE 0
                     END
                 ) as var,
                 SUM(
                     CASE
                         WHEN status_hewan LIKE ? THEN 1
                         ELSE 0
                     END
                 ) as observasi",
                [
                    '%diberikan%',
                    '%lengkap%',
                    '%sudah%',
                    '%Observasi%',
                ]
            )
            ->whereBetween('tgl_kejadian', [$startDate, $endDate])
            ->groupByRaw(
                "{$rabiesYearExpression}, {$rabiesMonthExpression}"
            )
            ->get()
            ->keyBy(fn ($row) => sprintf(
                '%04d-%02d',
                (int) $row->year,
                (int) $row->month
            ));

        $rabiesMonthly = [];
        $totalRabies6m = 0;
        $totalVar6m = 0;
        $totalObservasi6m = 0;

        for ($i = 5; $i >= 0; $i--) {
            $targetDate = $currentMonth->copy()->subMonths($i);
            $year = (int) $targetDate->year;
            $month = (int) $targetDate->month;
            $monthKey = $targetDate->format('Y-m');
            $label = $indonesianMonths[$month].' '.$year;

            $stats = $rabiesMonthlyStats->get($monthKey);

            $countKasus = (int) ($stats->kasus ?? 0);
            $countVar = (int) ($stats->var ?? 0);
            $countObservasi = (int) ($stats->observasi ?? 0);

            $totalRabies6m += $countKasus;
            $totalVar6m += $countVar;
            $totalObservasi6m += $countObservasi;

            $rabiesMonthly[] = [
                'month_key' => $monthKey,
                'label' => $indonesianMonths[$month],
                'full_label' => $label,
                'kasus' => $countKasus,
                'var' => $countVar,
                'observasi' => $countObservasi,
            ];
        }

        $statusHewanBreakdown = RabiesCase::query()
            ->selectRaw('status_hewan, COUNT(*) as count')
            ->groupBy('status_hewan')
            ->orderByDesc('count')
            ->get()
            ->map(fn ($row) => [
                'status' => $row->status_hewan ?: 'Observasi Lapangan',
                'count' => (int) $row->count,
            ])
            ->all();

        return Inertia::render('super/dashboard', [
            'metrics' => [
                'total_users' => $totalUsers,
                'total_staff' => $totalStaff,
                'total_animals' => $totalAnimals,
                'total_visits' => $totalVisits,
                'total_medicines' => $totalMedicines,
                'critical_medicines' => $criticalMedicines,
                'total_inventories' => $totalInventories,
                'active_rabies_cases' => $activeRabiesCases,
                'total_articles' => $totalArticles,
            ],
            'recent_visits' => $recentVisits,
            'low_stock_medicines' => $lowStockMedicines,
            'medical_chart' => [
                'monthly' => $medicalMonthly,
                'species' => $speciesDistribution,
                'summary' => [
                    'total_6m' => $totalVisits6m,
                    'selesai_6m' => $totalSelesai6m,
                    'avg_monthly' => round($totalVisits6m / 6, 1),
                    'completion_rate' => $totalVisits6m > 0
                        ? round(($totalSelesai6m / $totalVisits6m) * 100)
                        : 100,
                ],
            ],
            'rabies_chart' => [
                'monthly' => $rabiesMonthly,
                'status_hewan' => $statusHewanBreakdown,
                'summary' => [
                    'total_6m' => $totalRabies6m,
                    'var_6m' => $totalVar6m,
                    'observasi_6m' => $totalObservasi6m,
                    'var_coverage_rate' => $totalRabies6m > 0
                        ? round(($totalVar6m / $totalRabies6m) * 100)
                        : 100,
                ],
            ],
        ]);
    }
}
