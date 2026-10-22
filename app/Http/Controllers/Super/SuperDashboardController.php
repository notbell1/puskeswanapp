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
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SuperDashboardController extends Controller
{
    /**
     * Tampilkan data analitik dan statistik utama dashboard Super Admin.
     */
    public function index(Request $request): Response
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

        $recentVisits = Visit::with(['animal.pemilik', 'animal.jenisHewan'])
            ->latest('tgl_kunjungan')
            ->take(5)
            ->get()
            ->map(function ($visit) {
                return [
                    'id' => $visit->id,
                    'no_rm' => $visit->animal?->no_rm ?? '-',
                    'nama_hewan' => $visit->animal?->nama_hewan ?? 'Hewan Pasien',
                    'jenis_hewan' => $visit->animal?->jenisHewan?->nama_jenis ?? '-',
                    'pemilik' => $visit->animal?->pemilik?->nama_lengkap ?? 'Umum',
                    'tgl_kunjungan' => $visit->tgl_kunjungan ? $visit->tgl_kunjungan->format('d M Y, H:i') : '-',
                    'status_antrean' => $visit->status_antrean ?? 'Selesai',
                ];
            });

        $lowStockMedicines = Medicine::where('stok', '<=', 30)
            ->orderBy('stok', 'asc')
            ->take(5)
            ->get(['id', 'kode_obat', 'nama_obat', 'stok', 'satuan']);

        $indonesianMonths = [
            1 => 'Jan', 2 => 'Feb', 3 => 'Mar', 4 => 'Apr', 5 => 'Mei', 6 => 'Jun',
            7 => 'Jul', 8 => 'Agu', 9 => 'Sep', 10 => 'Okt', 11 => 'Nov', 12 => 'Des',
        ];

        $medicalMonthly = [];
        $totalVisits6m = 0;
        $totalSelesai6m = 0;

        for ($i = 5; $i >= 0; $i--) {
            $targetDate = now()->subMonths($i);
            $year = (int) $targetDate->year;
            $month = (int) $targetDate->month;
            $monthKey = $targetDate->format('Y-m');
            $label = $indonesianMonths[$month].' '.$year;

            $countTotal = Visit::whereYear('tgl_kunjungan', $year)
                ->whereMonth('tgl_kunjungan', $month)
                ->count();

            $countSelesai = Visit::whereYear('tgl_kunjungan', $year)
                ->whereMonth('tgl_kunjungan', $month)
                ->where('status_antrean', 'Selesai')
                ->count();

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

        $speciesDistribution = Visit::with('animal.jenisHewan')
            ->get()
            ->groupBy(fn ($v) => $v->animal?->jenisHewan?->nama_jenis ?? 'Lainnya')
            ->map(fn ($group, $name) => [
                'name' => $name,
                'count' => $group->count(),
            ])
            ->sortByDesc('count')
            ->values()
            ->take(5)
            ->all();

        $rabiesMonthly = [];
        $totalRabies6m = 0;
        $totalVar6m = 0;
        $totalObservasi6m = 0;

        for ($i = 5; $i >= 0; $i--) {
            $targetDate = now()->subMonths($i);
            $year = (int) $targetDate->year;
            $month = (int) $targetDate->month;
            $monthKey = $targetDate->format('Y-m');
            $label = $indonesianMonths[$month].' '.$year;

            $countKasus = RabiesCase::whereYear('tgl_kejadian', $year)
                ->whereMonth('tgl_kejadian', $month)
                ->count();

            $countVar = RabiesCase::whereYear('tgl_kejadian', $year)
                ->whereMonth('tgl_kejadian', $month)
                ->where(function ($q) {
                    $q->where('status_var', 'like', '%diberikan%')
                        ->orWhere('status_var', 'like', '%lengkap%')
                        ->orWhere('status_var', 'like', '%sudah%');
                })
                ->count();

            $countObservasi = RabiesCase::whereYear('tgl_kejadian', $year)
                ->whereMonth('tgl_kejadian', $month)
                ->where('status_hewan', 'like', '%Observasi%')
                ->count();

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

        $statusHewanBreakdown = RabiesCase::selectRaw('status_hewan, count(*) as count')
            ->groupBy('status_hewan')
            ->orderByDesc('count')
            ->get()
            ->map(fn ($r) => [
                'status' => $r->status_hewan ?: 'Observasi Lapangan',
                'count' => $r->count,
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
                    'completion_rate' => $totalVisits6m > 0 ? round(($totalSelesai6m / $totalVisits6m) * 100) : 100,
                ],
            ],
            'rabies_chart' => [
                'monthly' => $rabiesMonthly,
                'status_hewan' => $statusHewanBreakdown,
                'summary' => [
                    'total_6m' => $totalRabies6m,
                    'var_6m' => $totalVar6m,
                    'observasi_6m' => $totalObservasi6m,
                    'var_coverage_rate' => $totalRabies6m > 0 ? round(($totalVar6m / $totalRabies6m) * 100) : 100,
                ],
            ],
        ]);
    }
}
