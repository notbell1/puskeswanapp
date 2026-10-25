<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Inertia\Inertia;
use Inertia\Response;

class PasswordResetLinkController extends Controller
{
    /**
     * Menampilkan form lupa kata sandi.
     */
    public function create(): Response
    {
        return Inertia::render('forgot-password');
    }

    /**
     * Memvalidasi email dan mengirim link reset password.
     * Mencegah User Enumeration dengan selalu memberikan respons status netral.
     */
    public function store(Request $request)
    {
        $request->validate([
            'email' => ['required', 'email'],
        ], [
            'email.required' => 'Alamat email wajib diisi.',
            'email.email' => 'Format alamat email tidak valid.',
        ]);

        Password::broker()->sendResetLink(
            $request->only('email')
        );

        return back()->with('status', 'Jika alamat email tersebut terdaftar di sistem kami, tautan pemulihan kata sandi telah dikirimkan ke kotak masuk email Anda.');
    }
}
