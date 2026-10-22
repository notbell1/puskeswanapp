<?php

namespace App\Http\Middleware;

use App\Services\AuthSecurityService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckBlockedIp
{
    public function __construct(
        protected AuthSecurityService $securityService
    ) {}

    /**
     * Memeriksa apakah alamat IP klien saat ini berada dalam daftar blokir (Tier 2).
     * Jika diblokir: seluruh akses dialihkan paksa ke halaman /429.
     * Jika tidak diblokir: akses ke halaman /429 dialihkan kembali ke beranda.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $ip = $request->ip() ?? '127.0.0.1';
        $isBlocked = $this->securityService->isIpBlocked($ip);
        $isBlockedRoute = $request->routeIs('ip.blocked') || $request->is('429');

        if ($isBlocked) {
            if ($isBlockedRoute) {
                return $next($request);
            }

            return redirect()->route('ip.blocked');
        }

        if ($isBlockedRoute) {
            return redirect()->route('home');
        }

        return $next($request);
    }
}
