<?php

namespace App\Http\Requests\Auth;

use App\Models\User;
use App\Services\AuthSecurityService;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class LoginRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Sanitasi inputan sebelum divalidasi untuk mencegah XSS, Null Byte Injection,
     * dan muatan script berbahaya (JavaScript, Python, shell payload).
     */
    protected function prepareForValidation(): void
    {
        $rawEmail = (string) $this->input('email', '');
        $rawPassword = (string) $this->input('password', '');

        $cleanEmail = strip_tags(str_replace("\0", '', $rawEmail));
        $cleanEmail = preg_replace('/[\x00-\x1F\x7F]/', '', $cleanEmail);

        $cleanPassword = str_replace("\0", '', $rawPassword);

        $this->merge([
            'email' => Str::lower(trim((string) $cleanEmail)),
            'password' => $cleanPassword,
        ]);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'email' => ['required', 'string', 'email', 'max:255'],
            'password' => ['required', 'string', 'min:8', 'max:128'],
            'remember' => ['sometimes', 'boolean'],
        ];
    }

    /**
     * Pesan validasi kustom dalam Bahasa Indonesia.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'email.required' => 'Alamat email wajib diisi.',
            'email.email' => 'Format alamat email tidak valid.',
            'email.max' => 'Alamat email tidak boleh melebihi 255 karakter.',
            'password.required' => 'Kata sandi wajib diisi.',
            'password.min' => 'Kata sandi minimal 8 karakter.',
            'password.max' => 'Kata sandi tidak boleh melebihi 128 karakter.',
        ];
    }

    /**
     * Autentikasi kredensial pengguna dengan perlindungan Anti-Brute Force (Rate Limiting)
     * dan pengecekan status akun aktif.
     *
     * @throws ValidationException
     */
    public function authenticate(): void
    {
        $this->ensureIsNotRateLimited();

        $credentials = [
            'email' => $this->input('email'),
            'password' => $this->input('password'),
        ];

        $security = app(AuthSecurityService::class);
        $ip = $this->ip() ?? '127.0.0.1';
        $email = (string) $this->input('email');

        if (! Auth::attempt($credentials, $this->boolean('remember'))) {
            $security->recordFailedAttempt($email, $ip);

            if ($security->isIpBlocked($ip)) {
                throw ValidationException::withMessages([
                    'ip_blocked' => true,
                    'email' => 'Alamat IP Anda telah diblokir selama 30 menit karena terdeteksi aktivitas login mencurigakan berulang kali.',
                ]);
            }

            if ($security->isLockoutActive($ip)) {
                $seconds = $security->getLockoutRemainingSeconds($ip);
                $minutes = ceil($seconds / 60);

                throw ValidationException::withMessages([
                    'lockout_seconds' => $seconds,
                    'email' => "Percobaan login gagal telah mencapai batas maksimum (5x). Tombol masuk dinonaktifkan sementara selama {$seconds} detik ({$minutes} menit).",
                ]);
            }

            $attemptsKey = 'auth_login_attempts_'.md5($ip);
            $currentAttempts = (int) Cache::get($attemptsKey, 0);
            $remainingAttempts = max(0, AuthSecurityService::MAX_ATTEMPTS - $currentAttempts);

            throw ValidationException::withMessages([
                'email' => "Email atau kata sandi yang Anda masukkan tidak valid. (Sisa percobaan: {$remainingAttempts}x)",
            ]);
        }

        /** @var User $user */
        $user = Auth::user();

        if (! $user->status_aktif) {
            Auth::logout();
            $security->recordFailedAttempt($email, $ip);

            throw ValidationException::withMessages([
                'email' => 'Akun Anda dinonaktifkan oleh Administrator. Silakan hubungi pihak Puskeswan.',
            ]);
        }

        $security->clearAttemptsOnSuccess($email, $ip);
    }

    /**
     * Memastikan request tidak melampaui batas percobaan login (Anti-Brute Force).
     *
     * @throws ValidationException
     */
    public function ensureIsNotRateLimited(): void
    {
        $security = app(AuthSecurityService::class);
        $ip = $this->ip() ?? '127.0.0.1';

        if ($security->isIpBlocked($ip)) {
            throw ValidationException::withMessages([
                'ip_blocked' => true,
                'email' => 'Alamat IP Anda sedang diblokir selama 30 menit demi keamanan sistem.',
            ]);
        }

        if ($security->isLockoutActive($ip)) {
            $seconds = $security->getLockoutRemainingSeconds($ip);
            $minutes = ceil($seconds / 60);

            throw ValidationException::withMessages([
                'lockout_seconds' => $seconds,
                'email' => "Terlalu banyak percobaan masuk yang salah. Tombol masuk dinonaktifkan sementara. Silakan tunggu {$seconds} detik ({$minutes} menit).",
            ]);
        }
    }
}
