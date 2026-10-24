<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Models\User;
use App\Services\AuthSecurityService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    public function __construct(
        protected AuthSecurityService $securityService
    ) {}

    /**
     * Menampilkan halaman login Puskeswan.
     * Jika pengguna sudah terautentikasi, langsung arahkan ke dashboard peran masing-masing.
     * Mengirimkan sisa detik penonaktifan tombol login jika terkena cooldown (Tier 1).
     */
    public function create(Request $request): Response|RedirectResponse
    {
        if (Auth::check()) {
            /** @var User $user */
            $user = Auth::user();

            return $this->redirectBasedOnRole($user);
        }

        $ip = $request->ip() ?? '127.0.0.1';
        $lockoutSeconds = $this->securityService->getLockoutRemainingSeconds($ip);

        return Inertia::render('login', [
            'lockout_seconds' => $lockoutSeconds,
        ]);
    }

    /**
     * Menampilkan halaman 429 Too Many Requests saat IP diblokir (Tier 2).
     */
    public function blockedIp(Request $request): \Symfony\Component\HttpFoundation\Response|RedirectResponse
    {
        $ip = $request->ip() ?? '127.0.0.1';

        if (! $this->securityService->isIpBlocked($ip)) {
            return redirect()->route('home');
        }

        $remainingSeconds = $this->securityService->getBlockRemainingSeconds($ip);

        return Inertia::render('errors/429', [
            'ip' => $ip,
            'remaining_seconds' => $remainingSeconds,
        ])->toResponse($request)->setStatusCode(429);
    }

    /**
     * Memproses autentikasi login pengguna dengan validasi ketat, sanitasi,
     * rate limiting, regenerasi session ID, dan pengalihan rute sesuai peran.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $request->session()->regenerate();

        /** @var User $user */
        $user = Auth::user();
        $user->loadMissing(['role', 'staf']);

        return $this->redirectBasedOnRole($user);
    }

    /**
     * Menghancurkan session, menghapus data autentikasi, dan memperbarui token CSRF.
     */
    public function destroy(Request $request): \Symfony\Component\HttpFoundation\Response
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        $request->session()->flash('info', 'Anda telah berhasil keluar dari sistem Puskeswan secara aman.');

        return Inertia::location(route('login'));
    }

    /**
     * Mengarahkan pengguna ke rute dashboard sesuai dengan peran.
     */
    protected function redirectBasedOnRole(User $user): RedirectResponse
    {
        $user->loadMissing('role');
        $role = strtoupper((string) ($user->role?->nama_role ?? ''));

        return match ($role) {
            'SUPER_ADMIN' => redirect()->route('super.dashboard')->with('success', "Selamat datang kembali, {$user->name}!"),
            'ADMIN' => redirect()->route('admin.dashboard')->with('success', "Selamat datang kembali, {$user->name}!"),
            'DOKTER' => redirect()->route('dokter.dashboard')->with('success', "Selamat datang kembali, {$user->name}!"),
            default => abort(403, 'Akses Ditolak: Peran akun Anda belum terkonfigurasi dengan benar.'),
        };
    }
}
