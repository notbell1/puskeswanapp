<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     * Mencegah IDOR (Insecure Direct Object Reference) dan Broken Access Control
     * dengan memverifikasi secara ketat bahwa peran pengguna berhak mengakses rute ini.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        if (! Auth::check()) {
            return redirect()->guest(route('login'));
        }

        /** @var User $user */
        $user = Auth::user();

        if (! $user->status_aktif) {
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return redirect()->route('login')->withErrors([
                'email' => 'Sesi kerja diakhiri: Akun Anda tidak aktif. Silakan hubungi pihak Puskeswan.',
            ]);
        }

        $user->loadMissing('role');
        $userRole = strtoupper((string) ($user->role?->nama_role ?? ''));

        $allowedRoles = array_map('strtoupper', $roles);

        if (! in_array($userRole, $allowedRoles, true)) {
            Log::warning('PERINGATAN KEAMANAN: Percobaan Akses Lintas Peran Ditolak', [
                'user_id' => $user->id,
                'email' => $user->email,
                'user_role' => $userRole,
                'required_roles' => $allowedRoles,
                'requested_url' => $request->fullUrl(),
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            abort(403, 'Anda tidak memiliki izin untuk mengakses halaman ini, silakan hubungi Administrator');
        }

        return $next($request);
    }
}
