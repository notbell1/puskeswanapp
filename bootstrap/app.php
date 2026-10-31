<?php

use App\Http\Middleware\CheckBlockedIp;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\PreventBackHistory;
use App\Http\Middleware\RoleMiddleware;
use App\Http\Middleware\SecurityHeadersMiddleware;
use App\Services\AuthSecurityService;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        channels: __DIR__.'/../routes/channels.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->trustProxies(at: '*');

        $middleware->web(append: [
            SecurityHeadersMiddleware::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
            PreventBackHistory::class,
            CheckBlockedIp::class,
        ]);

        $middleware->alias([
            'role' => RoleMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );

        // Render Halaman Error 403, 404, dan 429 (IP Blocked)
        $exceptions->respond(function (Response $response, Throwable $exception, Request $request) {
            $status = $response->getStatusCode();

            if (in_array($status, [403, 404, 429], true)) {
                if ($status === 429) {
                    $securityService = app(AuthSecurityService::class);
                    $ip = $request->ip() ?? '127.0.0.1';
                    $remaining = $securityService->getBlockRemainingSeconds($ip);

                    return Inertia::render('errors/429', [
                        'ip' => $ip,
                        'remaining_seconds' => $remaining,
                    ])->toResponse($request)->setStatusCode(429);
                }

                $component = $status === 403 ? 'errors/403' : 'errors/404';

                return Inertia::render($component, [
                    'status' => $status,
                    'message' => $exception->getMessage() ?: ($status === 403
                        ? 'Akses Ditolak: Anda tidak memiliki wewenang untuk membuka halaman ini.'
                        : 'Halaman Tidak Ditemukan: Halaman yang Anda cari tidak tersedia atau telah dipindahkan.'),
                ])->toResponse($request)->setStatusCode($status);
            }

            return $response;
        });
    })->create();
