<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;

class AuthSecurityService
{
    /**
     * Waktu cooldown penonaktifan tombol login saat 5x salah (Tier 1).
     */
    public const LOCKOUT_SECONDS = 180;

    /**
     * Batas maksimal percobaan salah sebelum tombol login dinonaktifkan sementara.
     */
    public const MAX_ATTEMPTS = 5;

    /**
     * Ambang batas jumlah pengulangan rate limiting (strikes) sebelum IP diblokir total (Tier 2).
     */
    public const MAX_STRIKES = 3;

    /**
     * Durasi pemblokiran alamat IP di halaman /429 (Tier 2).
     */
    public const BLOCK_IP_SECONDS = 1800;

    /**
     * Memeriksa apakah alamat IP klien saat ini sedang dalam status diblokir (Tier 2).
     */
    public function isIpBlocked(string $ip): bool
    {
        $blockedUntil = Cache::get($this->getBlockKey($ip));

        if (! $blockedUntil) {
            return false;
        }

        return (int) $blockedUntil > now()->timestamp;
    }

    /**
     * Mendapatkan sisa detik pemblokiran IP (Tier 2).
     */
    public function getBlockRemainingSeconds(string $ip): int
    {
        $blockedUntil = Cache::get($this->getBlockKey($ip));

        if (! $blockedUntil) {
            return 0;
        }

        $remaining = (int) $blockedUntil - now()->timestamp;

        return max(0, $remaining);
    }

    /**
     * Memblokir IP selama BLOCK_IP_SECONDS (Tier 2).
     */
    public function blockIp(string $ip): void
    {
        $blockedUntil = now()->addSeconds(self::BLOCK_IP_SECONDS)->timestamp;

        Cache::put($this->getBlockKey($ip), $blockedUntil, self::BLOCK_IP_SECONDS);
    }

    /**
     * Membuka blokir IP secara manual atau otomatis setelah waktu habis.
     */
    public function unblockIp(string $ip): void
    {
        Cache::forget($this->getBlockKey($ip));
        Cache::forget($this->getStrikesKey($ip));
        Cache::forget($this->getLockoutKey($ip));
        Cache::forget($this->getAttemptsKey($ip));
    }

    /**
     * Mencatat kegagalan login untuk IP & Email tertentu.
     * Jika mencapai MAX_ATTEMPTS (5x): aktifkan Tier 1 Cooldown (3 Menit) dan tambah 1 Strike.
     * Jika Strikes mencapai MAX_STRIKES (3x): aktifkan Tier 2 Block IP (30 Menit).
     */
    public function recordFailedAttempt(string $email, string $ip): void
    {
        $attemptsKey = $this->getAttemptsKey($ip);
        $attempts = (int) Cache::get($attemptsKey, 0) + 1;
        Cache::put($attemptsKey, $attempts, 3600); // Disimpan 1 jam

        if ($attempts >= self::MAX_ATTEMPTS) {
            Cache::forget($attemptsKey);

            $strikesKey = $this->getStrikesKey($ip);
            $strikes = (int) Cache::get($strikesKey, 0) + 1;
            Cache::put($strikesKey, $strikes, 86400); // Strike berlaku 24 jam

            if ($strikes >= self::MAX_STRIKES) {
                $this->blockIp($ip);
            } else {
                $lockoutUntil = now()->addSeconds(self::LOCKOUT_SECONDS)->timestamp;
                Cache::put($this->getLockoutKey($ip), $lockoutUntil, self::LOCKOUT_SECONDS);
            }
        }
    }

    /**
     * Memeriksa apakah IP sedang dalam masa Tier 1 Lockout (tombol disable).
     */
    public function isLockoutActive(string $ip): bool
    {
        $lockoutUntil = Cache::get($this->getLockoutKey($ip));

        if (! $lockoutUntil) {
            return false;
        }

        return (int) $lockoutUntil > now()->timestamp;
    }

    /**
     * Mendapatkan sisa detik untuk Tier 1 Lockout (tombol disable).
     */
    public function getLockoutRemainingSeconds(string $ip): int
    {
        $lockoutUntil = Cache::get($this->getLockoutKey($ip));

        if (! $lockoutUntil) {
            return 0;
        }

        $remaining = (int) $lockoutUntil - now()->timestamp;

        return max(0, $remaining);
    }

    /**
     * Menghapus seluruh riwayat kegagalan jika user berhasil login.
     */
    public function clearAttemptsOnSuccess(string $email, string $ip): void
    {
        Cache::forget($this->getAttemptsKey($ip));
        Cache::forget($this->getLockoutKey($ip));
    }

    /**
     * Mendapatkan jumlah strike saat ini untuk IP.
     */
    public function getStrikes(string $ip): int
    {
        return (int) Cache::get($this->getStrikesKey($ip), 0);
    }

    protected function getBlockKey(string $ip): string
    {
        return 'auth_ip_blocked_'.md5($ip);
    }

    protected function getStrikesKey(string $ip): string
    {
        return 'auth_ip_strikes_'.md5($ip);
    }

    protected function getLockoutKey(string $ip): string
    {
        return 'auth_login_lockout_'.md5($ip);
    }

    protected function getAttemptsKey(string $ip): string
    {
        return 'auth_login_attempts_'.md5($ip);
    }
}
