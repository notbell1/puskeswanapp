# Changelog

Semua perubahan penting pada proyek **PuskeswanApp** dicatat dalam berkas ini.

Format berkas ini mengacu pada [Keep a Changelog](https://keepachangelog.com/id/1.1.0/),
dan proyek ini menganut standar [Semantic Versioning](https://semver.org/lang/id/).

---

## [2.0.0] - 2026-10-24

### 🚀 Ditambahkan (Added)

- **Portal Publik Mandiri Cek Rekam Medis**: Fitur pencarian riwayat medis pasien hewan oleh pemilik menggunakan NIK, Nama Lengkap, dan captcha anti-bot SVG dinamis.
- **Modul Surveilans Epidemiologi Rabies (GHPR)**: Pencatatan lengkap kasus gigitan hewan penular rabies, pemantauan masa observasi 14 hari, dan monitoring status pemberian Vaksin Anti Rabies (VAR).
- **Two-Tier Rate Limiting & Keamanan Brute-Force**:
    - _Tier 1_: Cooldown penonaktifan tombol login 20 detik setelah 5 kali gagal.
    - _Tier 2_: Pemblokiran total IP penyerang selama 30 menit ke halaman error 429 khusus setelah 3 kali penalti berulang.
- **Autentikasi Modern Multi-Metode**: Dukungan masuk menggunakan kata sandi terenkripsi Bcrypt dan WebAuthn / Passkeys biometrik.
- **Format Cetak Dokumen Kedinasan**:
    - Lembar cetak Rekam Medis Pasien Hewan resmi dengan spesifikasi identitas pemilik, nomor RM, diagnosa, dan terapi obat.
    - Lembar cetak Laporan Kasus Gigitan HPR terstandarisasi untuk koordinasi lintas dinas.
- **Manajemen Logistik & Inventaris**:
    - Pemantauan stok obat dengan indikator visual otomatis (_Kritis_, _Menipis_, _Aman_).
    - Manajemen peralatan medis klinik dengan status kondisi (_Baik_, _Rusak Ringan_, _Rusak Berat_).
- **Dokumentasi Visual Antarmuka**: Penambahan 36 tangkapan layar antarmuka sistem di direktori `screenshot/` yang diklasifikasikan per alur pengguna dalam tata letak horizontal kompak (1 baris per kelompok fitur) dengan tautan perbesaran resolusi penuh.
- **Pemodelan UML**: Integrasi diagram fungsional baku (UML Use Case, State Machine antrean kunjungan, dan Deployment topologi jaringan) berbasis Mermaid interaktif di README.

### ⚡ Dioptimalkan (Optimized)

- **Kueri SQL & Kinerja Basis Data (Laravel Debugbar Audit)**:
    - Mengurangi beban query Dashboard Admin dari **~160 kueri** menjadi **5–6 kueri (-96%)** melalui penggabungan agregasi `GROUP BY` dan eliminasi looping harian.
    - Menyelesaikan masalah **N+1 Query** pada pencarian pemilik hewan di loket pendaftaran menggunakan relasi `hasOne(Visit::class)->latestOfMany('tgl_kunjungan')`.
    - Mengeliminasi duplikasi query 100% pada Dashboard Dokter dan Form Login.
    - Menambahkan indeks komposit basis data pada `visits(tgl_kunjungan, status_antrean)` serta indeks performa pada `examinations(id_dokter, waktu_selesai)`.
    - Menerapkan _column scoping_ pada eager loading seluruh relasi untuk menurunkan konsumsi memori RAM server.
- **Kecepatan Pengujian Otomatis**: Seluruh 60 feature tests Pest PHP tuntas dieksekusi dalam **~4.2 detik**.

### 🔒 Keamanan (Security)

- **Pembaruan Kernel & Engine Runtime**:
    - Penyesuaian PHP ke versi **8.4.27** (NTS x64) `CVE-2026-109618` dan Node.js ke versi **24.22.1 (LTS)** `CVE-2026-105482` dengan npm **11.19.1**.
    - Peningkatan Laravel Framework ke versi **13.37.0** yang sepenuhnya kebal terhadap kerentanan kritis `CVE-2026-114509`.
- **Penebalan .gitignore**:
    - Isolasi total seluruh berkas dump debugger (`storage/debugbar`), devtools (`storage/inertia-devtools`), berkas `.env`, kredensial, kunci SSL, dan riwayat log.
    - Penegasan blokir seluruh seeder, factory, dan migrasi tabel lokal agar tidak terpublikasi ke repositori publik.
- **Zero-Trust File Upload Validation**: Verifikasi ganda _magic bytes_ MIME type dan integritas struktur gambar biner menggunakan `finfo` dan `getimagesize()` sebelum berkas disimpan.

### 🔄 Diubah (Changed)

- Peningkatan stack antarmuka ke **React 19.2.0**, **Inertia.js 3.5.1**, **Tailwind CSS 4.0.0**, dan **TypeScript 5.7.2**.
- Integrasi generator tipe rute otomatis dengan **Laravel Wayfinder 0.1.23**.
- Standardisasi penulisan kode sesuai standar PSR-12 menggunakan **Laravel Pint 1.32.1**.

---

## [1.0.0] - 2026-10-19

### 🚀 Rilis Awal (Initial Release)

- Arsitektur dasar aplikasi berbasis Laravel dan Inertia.js.
- Skema basis data awal untuk pengguna, peran (_Super Admin_, _Admin_, _Dokter_), staf, hewan, pemilik, dan kunjungan.
- Halaman beranda poliklinik dan autentikasi dasar.
