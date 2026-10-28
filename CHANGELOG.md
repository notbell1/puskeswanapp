# Changelog

Semua perubahan dan pembaruan penting pada proyek **PuskeswanApp** dicatat dalam berkas ini.

---

## [2.2.0] - 2026-10-28

### 🔒 Penguatan Keamanan Media Berkas & Hardening Server (Storage Hardening & Anti-Execution)

- **Controller-Brokered Storage Serving**: Seluruh akses berkas publik `/storage/{path}` dialihkan melalui `StorageFileController` terdedikasi untuk memverifikasi batasan direktori (*path traversal* check), validasi MIME biner via `finfo`, dan mencegah pemanggilan langsung berkas dari webroot.
- **Pencegahan Eksekusi Skrip Berbahaya (Anti-Execution)**: Penambahan konfigurasi `.htaccess` pada `storage/app/public/` dan `public/` dengan penonaktifan engine PHP (`php_flag engine off`, `RemoveHandler`), pelarangan eksekusi CGI/Shell/ekstensi berbahaya (`.php`, `.sh`, `.exe`, dll), serta pencegahan *directory listing*.
- **Pemeriksaan Binary MIME Ketat pada Seluruh Modul Unggah**: Penyeragaman verifikasi tipe MIME menggunakan `finfo(FILEINFO_MIME_TYPE)` langsung pada berkas biner (bukan sekadar ekstensi atau header klien) pada seluruh controller (`ProfileController`, `StaffController`, `UserController`, `ArticleController`).
- **Nama Acak Kriptografis Server-Side**: Penamaan berkas foto hasil unggah dienkripsi menggunakan string acak kriptografis (`random_bytes(16)` / `Str::random(40)`) tanpa mempertahankan nama asli dari pengguna.
- **Throttling Pembaruan Profil**: Penambahan rate limit `throttle:15,1` untuk pembaruan profil dan `throttle:10,1` untuk pembaruan kata sandi.
- **Penonaktifan Sourcemap Produksi**: Pengaturan `build.sourcemap = false` pada `vite.config.ts` untuk mencegah kebocoran struktur kode sumber frontend di lingkungan produksi.
- **Blokir Berkas Sensitif pada Web Server**: Penambahan aturan `.htaccess` di `public/` untuk menolak akses langsung ke berkas konfigurasi, log, dump SQL, skrip build, dan repositori (`.env*`, `.git*`, `composer.*`, `package*.json`, `*.sql`, `*.log`, `*.bak`).

---

## [2.1.0] - 2026-10-26

### 🔒 Penguatan Keamanan Sistem & Audit Pre-Deployment (Security Hardening & Audit)

- **Verifikasi 3 Lapis Cek Rekam Medis Publik**: Penambahan validasi lapis ketiga (4 digit terakhir nomor WhatsApp/HP terdaftar) di samping 16 digit NIK dan Nama Lengkap pemilik untuk mencegah pembobolan identitas pasien.
- **Honeypot Anti-Bot Trap**: Integrasi field tersembunyi (*invisible honeypot*) pada formulir cek rekam medis publik untuk menangkal bot scraper, spider, dan skrip otomatis tanpa membebani kueri basis data.
- **Validasi Whitelist Ketat (Zero-Trust Input)**: Penolakan karakter khusus, kutip/petik SQL, dan tag skrip berbahaya pada seluruh parameter input pencarian publik.
- **Pembersihan Logika Cetak PDF Publik**: Penghapusan total tombol cetak salinan rekam medis dan fungsi cetak kartu pada modul publik guna mencegah penyalahgunaan dokumen rekam medis resmi di luar loket klinik.
- **HTTP Security Headers Middleware**: Penambahan `SecurityHeadersMiddleware` secara global untuk mengaktifkan proteksi `X-Frame-Options: SAMEORIGIN` (Clickjacking), `X-Content-Type-Options: nosniff` (MIME sniffing), `Referrer-Policy: strict-origin-when-cross-origin`, dan `Permissions-Policy`.
- **Throttling & Anti-Brute Force**: Pemasangan rate limiting `throttle:10,1` pada pencarian rekam medis publik serta `throttle:5,1` pada rute reset dan lupa kata sandi.
- **Mitigasi User Enumeration**: Penyamaran pesan respon pada form lupa kata sandi agar tidak membocorkan keberadaan email pengguna terdaftar kepada penyerang.

---

## [2.0.0] - 2026-10-24

### 🔒 Pembaruan Keamanan & Runtime (Security & Runtime Updates)

- **PHP**: Pembaruan versi PHP dari `8.4.7` ke `8.4.27` untuk mengatasi kerentanan keamanan `CVE-2026-109618`.
- **Node.js**: Pembaruan versi Node.js ke `24.22.1 (LTS)` (npm `v11.19.1`) untuk memitigasi celah keamanan `CVE-2026-105482`.
- **Laravel Framework**: Pembaruan versi Laravel ke `13.37.0` untuk memitigasi kerentanan keamanan kritis `CVE-2026-114509`.

### 🛠️ Pembaruan Tech Stack & Ekosistem (Tech Stack Updates)

- **React**: Peningkatan ke versi `19.2.0`.
- **Inertia.js**: Integrasi Inertia Core / Laravel ke versi `3.5.1`.
- **Tailwind CSS**: Peningkatan ke versi `4.0.0` (Lightning CSS engine).
- **TypeScript**: Peningkatan ke versi `5.7.2`.
- **Laravel Wayfinder**: Integrasi typed routing generator versi `0.1.23`.
- **Pest PHP**: Peningkatan test runner ke versi `5.3.3` (60 Feature Tests, 100% Passed).
- **Laravel Pint**: Standardisasi linter kode PSR-12 ke versi `1.32.1`.

### ⚡ Optimasi & Perbaikan (Optimizations & Fixes)

- Optimasi kueri SQL basis data (mengeliminasi N+1 query, duplikasi query, dan penambahan indeks komposit).
- Perbaikan minor bugs dan pengetatan proteksi `.gitignore`.

---

## [1.0.0] - 2026-10-19

### 🚀 Rilis Awal (Initial Release)

- Arsitektur awal sistem informasi puskeswan berbasis Laravel, Inertia.js, dan React.
- Manajemen pengguna, peran (*Super Admin*, *Admin*, *Dokter*), pendaftaran pasien, dan rekam medis klinis.
