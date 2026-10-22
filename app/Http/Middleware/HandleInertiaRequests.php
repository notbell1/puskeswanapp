<?php

namespace App\Http\Middleware;

use App\Models\Visit;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     * Mencegah Information Disclosure dengan hanya membagikan atribut publik yang aman.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        if ($user) {
            $user->loadMissing(['role', 'staf']);
            $rawRole = strtoupper((string) ($user->role?->nama_role ?? ''));

            $normalizedRole = match ($rawRole) {
                'SUPER_ADMIN' => 'super',
                'ADMIN' => 'admin',
                'DOKTER' => 'dokter',
                default => 'admin',
            };

            $roleDisplay = match ($rawRole) {
                'SUPER_ADMIN' => 'Super Administrator',
                'ADMIN' => 'Petugas Administrasi',
                'DOKTER' => 'Dokter Hewan',
                default => 'Pengguna',
            };

            $sharedUser = [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'foto' => $user->foto,
                'role' => $normalizedRole,
                'role_raw' => $rawRole,
                'role_display' => $roleDisplay,
                'staf' => $user->staf ? [
                    'id' => $user->staf->id,
                    'nama_staf' => $user->staf->nama_staf,
                    'jabatan' => $user->staf->jabatan,
                    'nip_strv' => $user->staf->nip_strv,
                ] : null,
            ];
        } else {
            $sharedUser = null;
        }

        $queueSummary = [
            'count' => 0,
            'waiting_list' => [],
        ];

        if ($user && in_array($normalizedRole, ['dokter', 'admin'])) {
            $today = now()->toDateString();
            $queueCount = Visit::whereDate('tgl_kunjungan', $today)
                ->where('status_antrean', 'Antri')
                ->count();

            $waitingList = Visit::with(['animal.pemilik', 'animal.jenisHewan'])
                ->whereDate('tgl_kunjungan', $today)
                ->where('status_antrean', 'Antri')
                ->orderBy('tgl_kunjungan', 'asc')
                ->take(6)
                ->get()
                ->map(fn ($v) => [
                    'id' => $v->id,
                    'no_rm' => $v->animal?->no_rm ?? '-',
                    'nama_hewan' => $v->animal?->nama_hewan ?? 'Hewan Pasien',
                    'jenis_hewan' => $v->animal?->jenisHewan?->nama_jenis ?? 'Hewan',
                    'pemilik' => $v->animal?->pemilik?->nama_lengkap ?? 'Umum',
                    'anamnesa' => $v->anamnesa ?? '-',
                    'jam_kunjungan' => $v->tgl_kunjungan ? $v->tgl_kunjungan->format('H:i').' WIB' : '-',
                    'waktu_relatif' => $v->tgl_kunjungan ? $v->tgl_kunjungan->diffForHumans() : '-',
                ])
                ->all();

            $queueSummary = [
                'count' => $queueCount,
                'waiting_list' => $waitingList,
            ];
        }

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $sharedUser,
            ],
            'queue_summary' => $queueSummary,
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'info' => fn () => $request->session()->get('info'),
            ],
        ];
    }
}
