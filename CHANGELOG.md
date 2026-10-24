# Changelog

Semua perubahan dan pembaruan penting pada proyek **PuskeswanApp** dicatat dalam berkas ini.

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
