# Changelog

Semua perubahan dan pembaruan penting pada proyek **PuskeswanApp** dicatat dalam berkas ini.

---

## [2.6.0] - 2026-10-31

### 💬 Modul Komunikasi Real-Time Antar-Staf (WebSockets via Laravel Reverb), Single Source of Truth Database & UI Resilient

- **Mesin WebSocket Real-Time Tanpa Polling (Laravel Reverb & Echo)**:
  - Mengintegrasikan server WebSocket lokal berkecepatan tinggi via Laravel Reverb (`php artisan reverb:start`) pada port 8080.
  - Memanfaatkan Laravel Echo (`resources/js/echo.ts`) dengan private channel otorisasi (`chat.user.{id}`) dan presence/group channel (`chat.group`).
  - Mengeliminasi delay berkala HTTP polling (sebelumnya 5–15 detik) menjadi latensi instan (< 50ms) menggunakan event broadcast `MessageSent` dan `MessageDeleted` (`ShouldBroadcastNow`).

- **Arsitektur Basis Data Tunggal & Sinkronisasi Soft Deletes**:
  - Menghilangkan ketergantungan pada `sessionStorage` pesan yang rentan basi/desinkronisasi; MySQL `chat_messages` ditetapkan sebagai *Single Source of Truth*.
  - Menambahkan migrasi database `deleted_at` (`SoftDeletes`) pada tabel `chat_messages`.
  - Sinkronisasi penghapusan pesan instan: Ketika Super Admin menghapus pesan pelanggaran, pesan terhapus di seluruh layar pengguna seketika via event WebSocket broadcast `MessageDeleted`.

- **Proteksi Boundary Fisik Sidebar & Anti-Tenggelam (Draggable Widget)**:
  - Mengimplementasikan kalkulasi pembatas koordinat dinamis (`getMinX`) yang mengukur sisi kanan elemen sidebar `<aside>` (`rect.right + 16px`).
  - Mengunci pergerakan tombol melayang agar tidak dapat diseret masuk ke area menu sidebar pada semua resolusi layar (desktop maupun split-screen).
  - Menghubungkan listener `ResizeObserver` dan `transitionend` sehingga saat sidebar di-minimize (72px) atau di-maximize (260px), posisi tombol otomatis terdorong secara responsif tanpa tertinggal.
  - Menyelaraskan layer rendering `z-index` menjadi `z-50` agar widget tidak tertimpa background sidebar.

- **Notifikasi Suara Cerdas 1x Per Pesan Masuk**:
  - Merombak logika audio chime dari pembanding jumlah total unread menjadi pelacakan ketat ID pesan tertinggi (`latest_incoming_id`).
  - Suara notifikasi Web Audio API marimba chime hanya berbunyi tepat 1 kali ketika ada pesan baru (`msgId > lastNotifiedId`), dan tidak akan berulang secara periodik saat pesan dibiarkan belum dibaca.
  - Baseline ID diinisialisasi otomatis saat pertama kali halaman dimuat tanpa membunyikan riwayat unread lawas.

- **Optimasi Performa Rendering & Anti-Flicker Foto Profil**:
  - Memindahkan dan me-memoize komponen `UserAvatar` ke luar komponen utama menggunakan `React.memo` dengan atribut `loading="eager"` dan `decoding="async"`.
  - Mempertahankan mount DOM widget obrolan via `display: isOpen ? 'flex' : 'none'` untuk menjaga status GPU cache foto pengguna saat widget ditutup-buka.
  - Menerapkan *referential equality check* pada pembaruan state daftar kontak dan balon pesan untuk mencegah siklus *layout thrashing*.

- **Validasi Keamanan & Sanitasi Input Ketat**:
  - Validasi pesan 1–2000 karakter di sisi backend dan frontend (dilengkapi indikator counter peringatan).
  - Sanitasi XSS otomatis menggunakan `strip_tags()`.
  - Proteksi pengiriman pesan ke diri sendiri (`Rule::notIn([$currentUserId])`).
  - Rate limiter keamanan 40 pesan per menit per akun (HTTP 429).

- **Dokumentasi Lengkap 16 Diagram Rekayasa Sistem di `docs/uml/`**:
  - Memindahkan seluruh diagram PlantUML (`.puml`) dan README arsitektur sistem ke direktori resmi `docs/uml/`.

---

## [2.5.0] - 2026-10-31

### 📑 Fitur Cetak Rekapitulasi Bulanan Landscape, Dedicated Route Cetak Rekam Medis & Sinkronisasi Antrean Multi-Role

- **Dedicated Route Cetak Kartu Rekam Medis Pasien Tunggal (`/admin/rekam-medis/{visit}/cetak`)**:
  - Menyediakan rute cetak mandiri format A4 Portrait (`/admin/rekam-medis/{visit}/cetak?autoprint=1`).
  - Mengatasi kendala cetak sebelumnya (preview terdorong ke lembar 2 dan tanda tangan menimpa tabel) dengan merender halaman Blade cetak mandiri (`kartu-rekam-medis.blade.php`) bebas dari pembungkus *overflow* SPA.
  - Memuat Kop Surat resmi UPTD Puskeswan & IB Kota Pariaman, identitas pemilik dan hewan bergaris titik-titik rapi, riwayat kunjungan tabel lengkap, serta tanda tangan resmi dinas drh. Reni Gusnita.

- **Fitur Rekapitulasi Pelaporan Pengobatan Bulanan Format Landscape (`/admin/rekam-medis/rekap-bulanan`)**:
  - Menghadirkan cetak laporan bulanan berorientasi **A4 Landscape** dengan filter bulan dan tahun melalui modal dialog di menu Hasil Rekam Medis.
  - Header standar dinas: `REKAPITULASI PELAPORAN PENGOBATAN PENYAKIT HEWAN UPT PUSKESWAN DAN IB KOTA PARIAMAN [TAHUN]`.
  - Format 9 kolom tabel yang padat dan terstruktur:
    1. **NO**: Nomor urut.
    2. **TANGGAL**: Tanggal kunjungan berformat `DD/MM/YYYY`.
    3. **JUMLAH HEWAN**: Standar `1 Ekor`.
    4. **SPESIES**: Format ringkas `Spesies (No. RM)`, contoh: `Kucing (RM0001)` (tanpa nama hewan).
    5. **TANDA/ANAMNESA**: Keluhan/anamnesa murni (tanpa atribut klinis BB & Suhu).
    6. **NAMA PEMILIK**: Nama pemilik hewan terdaftar.
    7. **ALAMAT**: Ekstraksi alamat ringkas yang dimulai langsung dari `Kec.` (misal: `Kec. Pariaman Tengah`).
    8. **DIAGNOSA**: Diagnosa dokter pemeriksa.
    9. **TERAPI**: Terapi dan pengobatan yang diberikan.
  - Desain tabel padat (*compact cell padding* 2.5px 3.5px & font 7.5pt–8pt) guna memaksimalkan kapasitas baris data pada tiap lembar kertas A4 Landscape.

- **Penyelarasan & Sinkronisasi Antrean Pasien Lintas Role**:
  - **Admin Dashboard**: Mengubah kartu *"Antrean Pasien Hari Ini"* menjadi *"Antrean Pasien"* yang menghitung seluruh antrean aktif menunggu penanganan medis.
  - **Penghapusan Kartu 'Sedang Diperiksa'**: Menghilangkan kartu status "Sedang Diperiksa" pada Admin Dashboard dan modul Antrean Rekam Medis karena siklus antrean berpindah langsung dari Menunggu ke Selesai setelah diperiksa dokter. Grid metrik disesuaikan menjadi 3 kolom seimbang.
  - **Modul Antrian Rekam Medis Admin**: Menampilkan seluruh riwayat dan data antrean menunggu secara menyeluruh, tidak dibatasi hari ini saja.
  - **Super Admin (Monitoring & Dashboard)**: Menyelaraskan data statistik dan tabel pemantauan pada *Pantau Antrean Loket* dan *Pantau Pelayanan Dokter* dengan database terkini serta menambahkan kartu metrik antrean pasien pada Dashboard Super Admin.

---

## [2.4.0] - 2026-10-30


### 🎨 Standarisasi Layout Tabel, Truncate Dinamis & Pagination Konsisten 5 Nomor

- **Format Standar Pagination 5 Nomor Halaman (`Pagination.jsx`)**:
  - Merombak algoritma navigasi halaman agar konsisten selalu menampilkan tepat 5 nomor halaman di seluruh status navigasi:
    - Halaman awal: `< 1 2 3 4 .. [halaman terakhir] >`
    - Halaman tengah (contoh: halaman 4): `< 1 .. 3 4 5 .. [halaman terakhir] >`
    - Halaman akhir: `< 1 .. [akhir-3] [akhir-2] [akhir-1] [akhir] >`
  - Mendukung penanganan pagination instan di sisi klien (*client-side*) maupun tautan server (*Inertia pagination links*).

- **Konsistensi Layout Tabel Kaku (`table-fixed`) & Tinggi Baris Rigid**:
  - Mengubah layout seluruh tabel data dari `table-auto` menjadi `table-fixed w-full min-w-[...] border-collapse border border-gray-200`.
  - Mengunci lebar kolom non-konten (No, Kode/No. RM, Tanggal, Status, Aksi) dengan ukuran piksel rigid (`w-14`, `w-20`, `w-28`, `w-32`, `w-36`, `w-40`, `w-44`, `w-52`, `w-56`).
  - Mengunci tinggi baris data persis `h-[58px]` dan menambahkan baris kosong penyeimbang (*placeholder padding rows*) sehingga tinggi tabel tidak melonjak antar halaman.
  - Khusus modul CMS Artikel: Kolom kategori dikunci rapi menjadi 1 baris (`block w-full truncate`) untuk mencegah teks turun menjadi 2–3 baris.

- **Truncate Teks Panjang Dinamis (`block w-full truncate`)**:
  - Menghapus pembatasan lebar statis kaku (`max-w-[...]`) dan menggantinya dengan `block w-full truncate`. Teks kini memenuhi 100% sisa lebar kolom yang tersedia sebelum memotong elipsis (`...`).
  - Menyematkan atribut `title={...}` bawaan peramban pada semua kolom konten penting (nama hewan, pemilik, diagnosa, terapi, kronologi, keterangan) agar teks utuh tetap dapat dibaca saat kursor di-hover.

- **Pencarian Real-Time (Instant Search 0ms / 300ms Debounce)**:
  - Menghapus tombol manual "Cari", "Filter", dan "Reset" yang berlebihan di seluruh toolbar filter.
  - Menyediakan tombol pembersih cepat `✕` di dalam kolom input pencarian.
  - Menampilkan tampilan pesan informatif (*Empty State*) saat data pencarian tidak ditemukan, lengkap dengan tombol *"Bersihkan Pencarian & Filter"*.

- **Arsitektur Hybrid Data Retrieval (Query Safety)**:
  - **Master Data Super Admin** (Obat, Inventaris, Jenis Hewan, Staf, Pengguna, Artikel): Mengirim full dataset ke klien untuk penyaringan dan pagination instan 0ms tanpa beban lalu lintas server berulang.
  - **Data Transaksional Admin & Dokter** (Pasien, Antrean Loket, Hasil Rekam Medis, Kasus Rabies, Antrean Dokter, Riwayat Dokter): Tetap menggunakan server-side pagination terindeks (`paginate(5)->withQueryString()`) dengan eager loading lengkap guna menjamin keamanan memori dan performa database pada data berskala besar.

- **Cakupan 12 Modul yang Dimutakhirkan**:
  - **Super Admin**: Master Data Obat & Vaksin, Inventaris Peralatan, Master Data Jenis Hewan, Data Tenaga Staf, Manajemen Pengguna, Artikel & Edukasi CMS.
  - **Admin**: Master Pasien & Pemilik, Antrian Loket Rekam Medis, Hasil Rekam Medis, Kasus GHPR / Rabies.
  - **Dokter**: Antrean Pasien Dokter, Riwayat Pemeriksaan Dokter.

---

## [2.3.0] - 2026-10-29

### 🛡️ Integritas Sistem, Proteksi Akun & Surveilans Rabies

- **Proteksi Integritas Akun Super Admin**: Pencegahan penonaktifan dan penghapusan akun berstatus Super Admin.
- **Pencegahan Duplikasi Kategori Hewan (Smart Normalization)**: Integrasi deteksi manipulasi leetspeak.
- **Standarisasi Template Cetak PDF Laporan Rabies Super Admin**: Penyeragaman format cetak dokumen surat resmi kasus gigitan rabies (HPR).
- **Fix layout modul**: Standardisasi table header.

### 🛡️ Integritas Sistem, Proteksi Akun & Surveilans Rabies

- **Pusat Monitoring Layanan Real-Time Super Admin**: Penambahan grup menu navigasi baru "MONITORING LAYANAN" pada Sidebar Super Admin yang mencakup menu pantauan "Pantau Antrean Loket" dan "Pantau Pelayanan Dokter" secara live read-only oversight lengkap dengan indikator status, kartu ringkasan, dan audit modal.
- **Proteksi Integritas Akun Super Admin**: Pencegahan penonaktifan dan penghapusan akun berstatus Super Admin guna menjamin kelangsungan akses administrator tertinggi sistem.
- **Pencegahan Duplikasi Kategori Hewan (Smart Normalization)**: Integrasi deteksi manipulasi leetspeak dan perbandingan case-insensitive pada penambahan dan pengubahan kategori/jenis hewan untuk mencegah data ganda.
- **Standarisasi Template Cetak PDF Laporan Rabies Super Admin**: Penyeragaman format cetak dokumen surat resmi kasus gigitan rabies (HPR) pada modul Super Admin agar identik dengan format resmi UPTD Puskeswan dan IB Kota Pariaman pada modul Admin.
- **Fix layout modul**: Standardisasi table header rata tengah dan tebal pada seluruh modul (Super Admin, Admin, Dokter) serta penyederhanaan tampilan status, hak akses, dan tata letak data staf.

### 🛡️ Audit Penetrasi Keamanan Menyeluruh (OWASP Top 10) & Pembaruan Testing Engine

- **Audit Penetrasi Keamanan 7 Batch (42 Skenario)**: Pelaksanaan audit forensik penetrasi penuh mencakup seluruh spektrum OWASP Top 10:2021 (Broken Access Control, Cryptographic Failures, Injection SQLi/XSS, Insecure Design & Anti-Bot, Security Misconfiguration, Identification & Auth, Software & Data Integrity, SSRF & File Upload) serta Routing Integrity dengan tingkat keberhasilan penangkalan 100% (Grade A+ Hardened).
- **Publikasi Laporan Audit Resmi (`AUDIT.md`)**: Penyusunan dokumen formal hasil audit keamanan sistem yang disanitasi dari kebocoran data sensitif lengkap dengan analisis forensik per skenario.
- **Master Audit Inspector Dashboard & Bukti Visual**: Pembangunan toolkit pengujian visual berbasis Burp Suite Repeater UI (menampilkan Address Bar URL asli, raw HTTP request attacker input, dan raw HTTP response server) serta generasi 1 lembar berkas tangkapan layar master (`test/screenshot/MASTER_AUDIT_SUMMARY_REPORT.png`).
- **Pembaruan Dependensi PHPUnit (Patch GHSA-9vw2-f4vp-x7gf)**: Pembaruan paket pengujian `phpunit/phpunit` ke versi `13.4.5` dan `pestphp/pest` ke versi `5.3.4` untuk mengeliminasi celah keamanan eksekusi kode lokal pada direktori temporary bersama.
- **Zero Vulnerability Advisories (`composer audit`)**: Verifikasi menyeluruh memastikan repositori bersih 100% dari celah keamanan pihak ketiga.

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
