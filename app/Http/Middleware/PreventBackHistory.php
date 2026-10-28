<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\Response;

class PreventBackHistory
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Jangan timpa header cache untuk berkas binary/gambar
        if ($response instanceof BinaryFileResponse) {
            return $response;
        }

        if (method_exists($response, 'header')) {
            return $response->header('Cache-Control', 'nocache, no-store, max-age=0, must-revalidate')
                ->header('Pragma', 'no-cache')
                ->header('Expires', 'Sun, 02 Jan 1990 00:00:00 GMT');
        }

        $response->headers->set('Cache-Control', 'nocache, no-store, max-age=0, must-revalidate');
        $response->headers->set('Pragma', 'no-cache');
        $response->headers->set('Expires', 'Sun, 02 Jan 1990 00:00:00 GMT');

        return $response;
    }
}
