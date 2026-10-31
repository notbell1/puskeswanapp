<p align="center">
  <img src="public/images/logo_puskeswan.webp" alt="Logo Puskeswan Kota Pariaman" width="110" />
</p>

<h1 align="center">PuskeswanApp V.2.6.0</h1>

<p align="center">
  <strong>Sistem Informasi Pelayanan Kesehatan Hewan, Rekam Medis Veteriner & Surveilans Zoonosis Terpadu</strong><br>
  <em>UPTD Pusat Kesehatan Hewan (Puskeswan) dan Inseminasi Buatan (IB) Kota Pariaman</em><br>
  Dinas Pertanian, Pangan dan Perikanan Kota Pariaman
</p>

<p align="center">
  <a href="#-spesifikasi-teknologi-rinci-tech-stack"><img src="https://img.shields.io/badge/PHP-8.4.27-777BB4?style=for-the-badge&logo=php&logoColor=white" alt="PHP 8.4.27" /></a>
  <a href="#-spesifikasi-teknologi-rinci-tech-stack"><img src="https://img.shields.io/badge/Laravel-13.39.0-FF2D20?style=for-the-badge&logo=laravel&logoColor=white" alt="Laravel 13.39.0" /></a>
  <a href="#-spesifikasi-teknologi-rinci-tech-stack"><img src="https://img.shields.io/badge/Laravel_Reverb-1.12.0_WebSockets-FF2D20?style=for-the-badge&logo=laravel&logoColor=white" alt="Laravel Reverb 1.12.0" /></a>
  <a href="#-spesifikasi-teknologi-rinci-tech-stack"><img src="https://img.shields.io/badge/Node.js-24.22.1_LTS-5FA04E?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js 24.22.1" /></a>
  <a href="#-spesifikasi-teknologi-rinci-tech-stack"><img src="https://img.shields.io/badge/React-19.3.1-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19.3.1" /></a>
  <a href="#-spesifikasi-teknologi-rinci-tech-stack"><img src="https://img.shields.io/badge/TypeScript-5.9.3-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript 5.9.3" /></a>
  <a href="#-spesifikasi-teknologi-rinci-tech-stack"><img src="https://img.shields.io/badge/Inertia.js-3.9.1-9553E9?style=for-the-badge&logo=inertia&logoColor=white" alt="Inertia.js 3.9.1" /></a>
  <a href="#-spesifikasi-teknologi-rinci-tech-stack"><img src="https://img.shields.io/badge/Tailwind_CSS-4.3.3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS 4.3.3" /></a>
  <a href="AUDIT.md"><img src="https://img.shields.io/badge/OWASP_Top_10-Passed_100%25-10B981?style=for-the-badge&logo=shield&logoColor=white" alt="OWASP Top 10 Passed" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-F59E0B?style=for-the-badge" alt="License MIT" /></a>
</p>

---

## 📑 Daftar Isi

- [🏛️ Tentang Instansi](#️-tentang-instansi)
- [📋 Tugas Pokok & Fungsi Puskeswan](#-tugas-pokok--fungsi-puskeswan)
- [🔄 Alur Pelayanan Poliklinik Terpadu](#-alur-pelayanan-poliklinik-terpadu)
- [📁 Direktori Pemodelan Sistem & 16 Diagram UML (docs/uml/)](#-direktori-pemodelan-sistem--16-diagram-uml)
- [✨ Fitur-Fitur Utama](#-fitur-fitur-utama)
- [🛠️ Spesifikasi Teknologi Rinci (Tech Stack)](#️-spesifikasi-teknologi-rinci-tech-stack)
- [👥 Matriks Hak Akses Peran Pengguna](#-matriks-hak-akses-peran-pengguna)
- [📸 Dokumentasi Visual Antarmuka (Screenshots)](#-dokumentasi-visual-antarmuka-screenshots)
- [🛡️ Audit Keamanan Siber & Pen-Testing (OWASP Top 10)](#️-audit-keamanan-siber--pen-testing-owasp-top-10)
- [🧪 Verifikasi Kualitas Kode & Pengujian Otomatis](#-verifikasi-kualitas-kode--pengujian-otomatis)
- [📄 Lisensi & Riwayat Pembaruan](#-lisensi--riwayat-pembaruan)

---

## 🏛️ Tentang Instansi

**Pusat Kesehatan Hewan (Puskeswan)** merupakan unit pelaksana teknis daerah di bidang kesehatan hewan yang menyelenggarakan pelayanan medik veteriner secara langsung kepada masyarakat dan peternak. Keberadaan Puskeswan berperan sebagai garda terdepan dalam menjaga kesehatan hewan kesayangan, meningkatkan produktivitas ternak rakyat, melindungi masyarakat dari ancaman penyakit menular asal hewan (_zoonosis_), serta menjamin keamanan pangan asal hewan.

Melalui integrasi unit **Inseminasi Buatan (IB)**, Puskeswan juga menjalankan fungsi strategis dalam peningkatan mutu genetik dan populasi ternak ruminansia (sapi potong dan kerbau) guna mendukung ketahanan pangan daerah Kota Pariaman.

---

## 📋 Tugas Pokok & Fungsi Puskeswan

1. **Pelayanan Medik Veteriner & Poliklinik Hewan:** Pemeriksaan fisik klinis, diagnosa patologis, pengobatan kuratif, pemberian multivitamin/antiparasit, sterilisasi (_ovariohisterektomi_ & _kastrasi_), hingga tindakan bedah minor bagi hewan kesayangan maupun ternak masyarakat.
2. **Pengendalian Penyakit Hewan Menular Strategis (PHMS) & Zoonosis:** Pelaksanaan program vaksinasi massal—khususnya **Vaksinasi Rabies** pada Hewan Penular Rabies (HPR: anjing, kucing, kera, musang), serta vaksinasi ternak (_Septicaemia Epizootica_, _Newcastle Disease_, _Avian Influenza_).
3. **Surveilans & Respons Cepat Kasus Gigitan Rabies (GHPR):** Pencatatan epidemiologi kasus gigitan, pemantauan masa observasi klinis hewan penggigit selama 14 hari, dan monitoring kepatuhan Vaksin Anti Rabies (VAR) bagi korban dengan pendekatan _One Health_.
4. **Pelayanan Inseminasi Buatan (IB) & Reproduksi Ternak:** Layanan kawin suntik semen beku bersertifikat, Pemeriksaan Kebuntingan (PKB), penanganan gangguan reproduksi (_repeat breeder_, _anestrus_, _distokia_), dan pendampingan kelahiran.
5. **Kesehatan Masyarakat Veteriner (Kesmavet):** Pengawasan higiene sanitasi, pemeriksaan _antemortem_ & _postmortem_ hewan kurban, jaminan pangan **ASUH** (_Aman, Sehat, Utuh, Halal_), dan penerbitan Surat Keterangan Kesehatan Hewan (SKKH).
6. **Pelayanan Kesehatan Hewan Keliling:** Pelayanan jemput bola ke kelompok tani ternak di nagari dan desa untuk pengobatan massal dan biosekuriti kandang.

---

## 🔄 Alur Pelayanan Poliklinik Terpadu

Diagram alir berikut mengilustrasikan siklus pelayanan pasien dari kedatangan pemilik hingga publikasi rekam medis mandiri:

```mermaid
flowchart TD
    A(["👤 Pemilik Hewan Datang"]):::user --> B["🏢 Meja Pendaftaran / Loket Admin"]:::admin
    B --> C{"Cek Pemilik (NIK)"}:::admin
    C -- "Pasien Baru" --> D["📝 Input Data Pemilik & Hewan<br/>Auto-generate No. RM"]:::admin
    C -- "Pasien Lama" --> E["🔍 Autofill Data Pemilik<br/>Pilih Pasien Terdaftar"]:::admin
    D --> F["🎫 Terbitkan Antrean Loket (A-XXX)"]:::admin
    E --> F
    F --> G(["🔔 Notifikasi Lonceng Realtime"]):::doctor
    G --> H["🩺 Ruang Periksa Dokter Hewan"]:::doctor
    H --> I["🔬 Pemeriksaan Fisik & Diagnosa"]:::doctor
    I --> J["💊 Resep Terapi Obat & Tindakan Medis"]:::doctor
    J --> K["✅ Status Antrean 'Selesai'"]:::doctor
    K --> L["🖨️ Cetak Lembar Rekam Medis Resmi"]:::admin
    K --> M(["🌐 Cek Mandiri Publik via NIK & Captcha"]):::public

    classDef user fill:#3b82f6,stroke:#1d4ed8,stroke-width:2px,color:#fff;
    classDef admin fill:#0284c7,stroke:#0369a1,stroke-width:2px,color:#fff;
    classDef doctor fill:#10b981,stroke:#047857,stroke-width:2px,color:#fff;
    classDef public fill:#8b5cf6,stroke:#6d28d9,stroke-width:2px,color:#fff;
```

---

## 📁 Direktori Pemodelan Sistem & 16 Diagram UML

> 📑 **Dokumentasi Lengkap Perancangan Sistem & Naskah Skripsi:**  
> Seluruh berkas pemodelan diagram UML (*PlantUML `.puml`*) dan narasi rekayasa perangkat lunak tersimpan secara terpusat pada direktori resmi [**`docs/uml/`**](docs/uml/README.md).
>
> Mencakup **16 diagram terpadu**: BPMN (Sistem Lama & Baru), Use Case (Sistem Lama & Baru), Activity Diagram Pelayanan, Activity Diagram Real-Time Chat, Flowchart SOP (Admin, Dokter, Super Admin), Class Diagram, ERD 14 Tabel Relasional, Sequence Diagram (3 Skenario Kunci), Component Diagram, State Machine Diagram, Package Diagram, dan Deployment Diagram.

---

## ✨ Fitur-Fitur Utama

<details open>
<summary><strong>💬 1. Modul Komunikasi Real-Time Antar-Staf (Laravel Reverb WebSockets)</strong></summary>

- **Pertukaran Pesan Instan (< 50 ms):** Menggunakan server WebSocket modern bawaan Laravel Reverb dan pustaka Laravel Echo / Pusher-JS tanpa delay polling berkala.
- **Saluran Ganda (1-to-1 & 1-to-All):** Mendukung obrolan langsung pribadi antar-rekan kerja (*Direct Message*) dan pengumuman forum bersama seluruh staf (*All Staff Group Channel*).
- **Single Source of Truth & Soft Delete Sync:** Riwayat percakapan sepenuhnya bersumber langsung dari tabel database MySQL `chat_messages` dengan dukungan `SoftDeletes` (`deleted_at`). Pesan yang dihapus Super Admin otomatis lenyap seketika di seluruh layar staf via event `MessageDeleted`.
- **Smart Audio Notification:** Suara denting Web Audio API marimba chime berbunyi tepat **1 kali per pesan baru** dengan pelacakan ID pesan masuk tertinggi (`latest_incoming_id`), tanpa berulang saat pesan belum dibaca.
- **Draggable Widget Berpembatas Fisik Sidebar:** Tombol mengambang dapat digeser bebas (*draggable*) dengan pembatas fisik dinamis (`getMinX`) yang terhubung ke `ResizeObserver` dan event `transitionend` sidebar agar tombol tidak pernah tenggelam di balik sidebar.
- **Performa & Anti-Flicker:** Komponen foto avatar pengguna di-memoize dengan `React.memo` dan dipertahankan dalam DOM (`display: none/flex`) sehingga tidak pernah me-reload ulang saat dialog ditutup-buka.
- **Sanitasi & Proteksi Keamanan:** Validasi panjang pesan 1–2000 karakter, sanitasi XSS otomatis via `strip_tags()`, proteksi berkirim pesan ke diri sendiri, dan pembatasan frekuensi (*rate limit*) 40 pesan per menit.
</details>

<details open>
<summary><strong>🔍 2. Portal Cek Rekam Medis Mandiri oleh Masyarakat</strong></summary>

- **Verifikasi Identitas Aman:** Pemilik cukup memasukkan 16 digit NIK dan Nama Lengkap yang dicocokkan dengan data registrasi poliklinik.
- **Captcha Anti-Bot Dinamis:** Perlindungan dari _scraping_ otomatis menggunakan generator kode acak berbasis SVG biner di sisi server.
- **Informasi Klinis Lengkap:** Menampilkan riwayat pemeriksaan, diagnosa dokter, berat badan, suhu tubuh, tindakan medis, serta rincian terapi obat.
- **Pratinjau & Cetak PDF:** Dilengkapi tombol cetak dokumen resmi rekam medis yang siap diunduh atau dicetak.
</details>

<details>
<summary><strong>📑 3. Format Cetak Rekapitulasi Bulanan Landscape & Dedicated Route Cetak RM</strong></summary>

- **Dedicated Route Cetak Kartu RM Pasien (`/admin/rekam-medis/{visit}/cetak`):** Rute cetak terisolasi format A4 Portrait bebas dari *layout SPA overflow*, memuat Kop Surat resmi dinas, identitas lengkap pemilik/hewan, tabel riwayat medis bergaris titik-titik rapi, dan tanda tangan dokter pemeriksa.
- **Rekapitulasi Pelaporan Pengobatan Bulanan A4 Landscape (`/admin/rekam-medis/rekap-bulanan`):** Cetak pelaporan rekapitulasi pengobatan penyakit hewan bulanan berorientasi landscape dengan modal filter bulan dan tahun pada menu Hasil Rekam Medis.
- **Format 9 Kolom Standar Dinas:** Tabel padat (*compact cell padding* & font 7.5pt–8pt) mencakup No, Tanggal, Jumlah Hewan (1 Ekor), Spesies (No. RM), Tanda/Anamnesa, Nama Pemilik, Alamat (Kecamatan), Diagnosa, dan Terapi Obat.
- **Sinkronisasi Antrean Multi-Role:** Keselarasan data dan metrik antrean pasien antara Dashboard Admin Loket, Ruang Antrean Dokter, dan Pemantauan Live Super Admin.
</details>

<details>
<summary><strong>📊 4. Modul Surveilans Epidemiologi Rabies (GHPR)</strong></summary>

- **Pencatatan Epidemiologi Rinci:** Mendokumentasikan identitas korban, lokasi luka gigitan, tanggal kejadian, serta kepemilikan hewan.
- **Status Hewan & Masa Observasi 14 Hari:** Pelacakan kondisi hewan penggigit (_Observasi Lapangan_, _Mati / Positif Rabies_, _Sehat_).
- **Monitoring Vaksin Anti Rabies (VAR):** Rekapitulasi status pemberian vaksin pada manusia (_Belum_, _Dosis 1_, _Lengkap_).
- **Format Cetak Laporan Resmi:** Template laporan investigasi epidemiologi untuk koordinasi lintas sektoral dengan Dinas Kesehatan.
</details>

<details>
<summary><strong>🛡️ 5. Arsitektur Keamanan Berlapis (Two-Tier Rate Limiting)</strong></summary>

- **Tier 1 (Cooldown 20 Detik):** Jika pengguna salah memasukkan kredensial 5 kali berturut-turut, tombol login dinonaktifkan sementara dengan timer hitung mundur.
- **Tier 2 (IP Block 30 Menit):** Jika penalti cooldown terulang hingga 3 kali (3 _strikes_), alamat IP penyerang diblokir total selama 30 menit ke halaman error `429 Too Many Requests`.
- **Zero-Trust Upload Validation:** Seluruh unggahan foto profil dan gambar artikel diperiksa biner _magic bytes_-nya menggunakan ekstensi PHP `finfo` dan `getimagesize()` untuk mencegah penyelundupan _web shell_.
</details>

<details>
<summary><strong>📦 6. Manajemen Logistik Obat & Inventaris Klinik</strong></summary>

- **Indikator Stok Cerdas:** Otomatisasi pengelompokan status obat (_Kritis: ≤ 10 unit_, _Menipis: 11–30 unit_, _Aman: > 30 unit_).
- **Inventaris Alat Medis:** Pengawasan kondisi peralatan medis dan operasional lapangan (_Baik_, _Rusak Ringan_, _Rusak Berat_) lengkap dengan riwayat pencatatan penanggung jawab.
</details>

<details>
<summary><strong>📊 7. Standarisasi Tampilan Tabel, Truncate Dinamis & Pencarian Real-Time</strong></summary>

- **Rigid Table-Fixed Architecture:** Seluruh tabel data pada modul Super Admin, Admin, dan Dokter menggunakan arsitektur `table-fixed` dengan lebar kolom rigid, tinggi baris konsisten `58px`, dan baris kosong penyeimbang (5 baris stabil per halaman) agar layout tidak melonjak antar halaman.
- **Dynamic Text Truncation with Tooltip:** Teks panjang fleksibel memenuhi 100% sisa lebar kolom yang tersedia sebelum memotong elipsis (`...`), lengkap dengan tooltip bawaan browser saat kursor di-hover untuk kenyamanan membaca.
- **Zero-Click Instant Search:** Pencarian otomatis menyaring data secara real-time saat pengguna mengetik (0ms pada master data, 300ms debounce pada data transaksional) tanpa memerlukan penekanan tombol manual "Cari" atau "Reset".
- **Harmonized 5-Number Pagination:** Navigasi pagination terstandarisasi yang secara konsisten selalu menyajikan tepat 5 nomor halaman aktif pada seluruh kondisi penjelajahan data.
</details>

---

## 🛠️ Spesifikasi Teknologi Rinci (Tech Stack)

Aplikasi dibangun menggunakan kombinasi pustaka dan kerangka kerja modern versi stabil terbaru:

| Komponen Arsitektur     | Teknologi / Pustaka           |   Versi Terpasang   | Peran & Deskripsi Kunci                                                       |
| :---------------------- | :---------------------------- | :-----------------: | :---------------------------------------------------------------------------- |
| **Backend Runtime**     | **PHP**                       | `v8.4.27 (NTS x64)` | Runtime modern dengan performa JIT engine dan konstruktor properti terpromosi |
| **Backend Framework**   | **Laravel Framework**         |     `v13.39.0`      | Framework inti MVC dengan arsitektur modular dan routing terpadu              |
| **WebSocket Engine**    | **Laravel Reverb**            |      `v1.12.0`      | Server WebSocket first-party lokal untuk komunikasi real-time instan (< 50ms) |
| **Real-Time Client**    | **Laravel Echo & Pusher-JS**  | `v2.6.3` / `v8.6.0` | Pustaka langganan channel WebSocket privat & publik di sisi browser           |
| **Frontend Runtime**    | **Node.js**                   |  `v24.22.1 (LTS)`   | Lingkungan eksekusi JavaScript modern dengan npm `v11.19.1`                   |
| **Frontend Framework**  | **React**                     |      `v19.3.1`      | Pustaka antarmuka pengguna berbasis komponen reaktif SPA                      |
| **Language Extension**  | **TypeScript**                |      `v5.9.3`       | Pengetikan statis ketat untuk mencegah _runtime type error_ di antarmuka      |
| **Full-Stack Adapter**  | **Inertia.js Core / React**   |      `v3.9.1`       | Jembatan komunikasi server-driven SPA tanpa pembuatan REST API redundan       |
| **CSS & Design Engine** | **Tailwind CSS**              |      `v4.3.3`       | Mesin CSS generasi baru berbasis _lightningcss_ untuk styling ultra cepat     |
| **Iconography**         | **Lucide Icons**              |      `v1.16.0`      | Pustaka ikon SVG modern yang ringan dan konsisten                             |
| **Type-Safe Routing**   | **Laravel Wayfinder**         |      `v0.1.23`      | Generator otomatis fungsi rute TypeScript langsung dari controller Laravel    |
| **Database Engine**     | **MySQL / MariaDB**           |  `v8.0+ / v10.5+`   | Basis data relasional dengan indeks komposit pada tabel frekuensi tinggi      |
| **Automated Testing**   | **Pest PHP**                  |      `v5.3.4`       | Kerangka pengujian fitur otomatis (99 Feature & Security Tests, 100% Passed)  |
| **Code Style Linter**   | **Laravel Pint**              |      `v1.32.1`      | Formatter kode otomatis berstandar PSR-12 dan panduan Laravel                 |
| **Build Tooling**       | **Vite-Plus (VoidZero)**      |      `v1.4.0`       | Bundler modul berkas frontend super cepat untuk lingkungan produksi           |

---

## 👥 Matriks Hak Akses Peran Pengguna

<details open>
<summary><strong>Klik untuk melihat rincian hak akses peran (*Role Access Matrix*)</strong></summary>

| Modul & Fitur                                  | Publik / Tamu | Petugas Loket (Admin) | Dokter Hewan | Super Administrator |
| :--------------------------------------------- | :-----------: | :-------------------: | :----------: | :-----------------: |
| **Landing Page & Edukasi**                     |   ✅ Akses    |       ✅ Akses        |   ✅ Akses   |      ✅ Akses       |
| **Cek Rekam Medis Mandiri (NIK)**              |   ✅ Akses    |       ✅ Akses        |   ✅ Akses   |      ✅ Akses       |
| **Obrolan Internal Staf (Reverb WebSockets)**   |  ❌ Ditolak   |       ✅ Penuh        |   ✅ Penuh   | ✅ Penuh (+ Hapus)  |
| **Dashboard Loket Pendaftaran**                |  ❌ Ditolak   |       ✅ Penuh        |  ❌ Ditolak  |    👁️ Monitoring    |
| **Registrasi Pemilik & Pasien (Autofill NIK)** |  ❌ Ditolak   |       ✅ Penuh        |  ❌ Ditolak  |    👁️ Monitoring    |
| **Manajemen Antrean Loket**                    |  ❌ Ditolak   |       ✅ Penuh        |  ❌ Ditolak  |    👁️ Monitoring    |
| **Dedicated Cetak Kartu RM Pasien**            |  ❌ Ditolak   |       ✅ Penuh        |   ✅ Cetak   |      ✅ Penuh       |
| **Rekapitulasi Pengobatan Bulanan Landscape**  |  ❌ Ditolak   |       ✅ Penuh        |  ❌ Ditolak  |      ✅ Penuh       |
| **Surveilans Rabies (GHPR) & Cetak Laporan**   |  ❌ Ditolak   |       ✅ Penuh        |  ❌ Ditolak  |    👁️ Monitoring    |
| **Dashboard Dokter Hewan**                     |  ❌ Ditolak   |      ❌ Ditolak       |   ✅ Penuh   |    👁️ Monitoring    |
| **Pemeriksaan & Diagnosa Medis**               |  ❌ Ditolak   |      ❌ Ditolak       |   ✅ Penuh   |    👁️ Monitoring    |
| **Riwayat Pelayanan Dokter**                   |  ❌ Ditolak   |      ❌ Ditolak       |   ✅ Penuh   |    👁️ Monitoring    |
| **Live Monitoring Antrean & Pelayanan**        |  ❌ Ditolak   |      ❌ Ditolak       |  ❌ Ditolak  |   👁️ Live Pantau   |
| **Dashboard Eksekutif Super Admin**            |  ❌ Ditolak   |      ❌ Ditolak       |  ❌ Ditolak  |      ✅ Penuh       |
| **Manajemen Akun Pengguna**                    |  ❌ Ditolak   |      ❌ Ditolak       |  ❌ Ditolak  |      ✅ Penuh       |
| **Manajemen Pegawai & Tenaga Staf**            |  ❌ Ditolak   |      ❌ Ditolak       |  ❌ Ditolak  |      ✅ Penuh       |
| **Logistik Obat, Vaksin & Inventaris**         |  ❌ Ditolak   |      ❌ Ditolak       |  ❌ Ditolak  |      ✅ Penuh       |
| **Laporan Terpadu & Ekspor PDF Multi-Filter**  |  ❌ Ditolak   |      ❌ Ditolak       |  ❌ Ditolak  |      ✅ Penuh       |

</details>

---

## 📸 Dokumentasi Visual Antarmuka (Screenshots)

Berikut adalah dokumentasi tampilan visual antarmuka sistem PuskeswanApp V.2.1.0:

---

### 🌐 1. Portal Publik & Edukasi Masyarakat (Landing Page)

|                                                                      1. Hero Section                                                                       |                                                               2. Profil UPTD Puskeswan                                                                |                                                            3. Cek Mandiri Rekam Medis                                                             |                                                                    4. Artikel Edukasi Kesehatan                                                                    |
| :--------------------------------------------------------------------------------------------------------------------------------------------------------: | :---------------------------------------------------------------------------------------------------------------------------------------------------: | :-----------------------------------------------------------------------------------------------------------------------------------------------: | :----------------------------------------------------------------------------------------------------------------------------------------------------------------: |
| <a href="screenshot/index/1_hero_section.png"><img src="screenshot/index/1_hero_section.png" width="185" alt="Hero Section Puskeswan Kota Pariaman" /></a> | <a href="screenshot/index/2_about_section.png"><img src="screenshot/index/2_about_section.png" width="185" alt="Tentang UPTD Puskeswan dan IB" /></a> | <a href="screenshot/index/3_cek_section.png"><img src="screenshot/index/3_cek_section.png" width="185" alt="Fitur Cek Mandiri Rekam Medis" /></a> | <a href="screenshot/index/4_article_section.png"><img src="screenshot/index/4_article_section.png" width="185" alt="Daftar Artikel Edukasi Kesehatan Hewan" /></a> |

|                                                                     5. Struktur Tenaga Staf                                                                      |                                                             6. Direktori Kategori Edukasi                                                              |                                                                   7. Arsip Berdasarkan Penulis                                                                    |                                                                 8. Lokasi Poliklinik & Kontak                                                                  |
| :--------------------------------------------------------------------------------------------------------------------------------------------------------------: | :----------------------------------------------------------------------------------------------------------------------------------------------------: | :---------------------------------------------------------------------------------------------------------------------------------------------------------------: | :------------------------------------------------------------------------------------------------------------------------------------------------------------: |
| <a href="screenshot/index/5_staff_section.png"><img src="screenshot/index/5_staff_section.png" width="185" alt="Struktur Staf dan Tenaga Medis Puskeswan" /></a> | <a href="screenshot/index/7_category_section.png"><img src="screenshot/index/7_category_section.png" width="185" alt="Kategori Artikel Edukasi" /></a> | <a href="screenshot/index/8_author_section.png"><img src="screenshot/index/8_author_section.png" width="185" alt="Arsip Artikel Berdasarkan Penulis Medis" /></a> | <a href="screenshot/index/6_contact_section.png"><img src="screenshot/index/6_contact_section.png" width="185" alt="Kontak dan Lokasi Klinik Puskeswan" /></a> |

---

### 🔐 2. Modul Autentikasi & Keamanan Berlapis

|                                                        1. Form Login Petugas                                                         |                                                                    2. Cooldown Tombol (Tier 1)                                                                    |                                                         3. Form Lupa Kata Sandi                                                          |                                                           4. Reset Kata Sandi Baru                                                           |
| :----------------------------------------------------------------------------------------------------------------------------------: | :---------------------------------------------------------------------------------------------------------------------------------------------------------------: | :--------------------------------------------------------------------------------------------------------------------------------------: | :------------------------------------------------------------------------------------------------------------------------------------------: |
| <a href="screenshot/auth/login_section.png"><img src="screenshot/auth/login_section.png" width="185" alt="Form Login Petugas" /></a> | <a href="screenshot/auth/rate_limiting_section.png"><img src="screenshot/auth/rate_limiting_section.png" width="185" alt="Indikator Cooldown Tombol Login" /></a> | <a href="screenshot/auth/forgot_section.png"><img src="screenshot/auth/forgot_section.png" width="185" alt="Form Lupa Kata Sandi" /></a> | <a href="screenshot/auth/reset_section.png"><img src="screenshot/auth/reset_section.png" width="185" alt="Form Reset Kata Sandi Baru" /></a> |

|                                                         5. Akses Ditolak (403 Forbidden)                                                          |                                                  6. Halaman Tidak Ditemukan (404)                                                   |                                                          7. IP Blocked Penalti 30 Menit (429)                                                          |
| :-----------------------------------------------------------------------------------------------------------------------------------------------: | :---------------------------------------------------------------------------------------------------------------------------------: | :----------------------------------------------------------------------------------------------------------------------------------------------------: |
| <a href="screenshot/auth/403_section.png"><img src="screenshot/auth/403_section.png" width="250" alt="Halaman 403 Forbidden Akses Ditolak" /></a> | <a href="screenshot/auth/404_section.png"><img src="screenshot/auth/404_section.png" width="250" alt="Halaman 404 Not Found" /></a> | <a href="screenshot/auth/429_section.png"><img src="screenshot/auth/429_section.png" width="250" alt="Halaman 429 Too Many Requests IP Blocked" /></a> |

---

### 🏥 3. Modul Petugas Administrasi & Loket Rekam Medis (Admin Role)

|                                                    1. Dashboard Operasional Loket                                                     |                                                      2. Formulir Registrasi (Autofill NIK)                                                       |                                                               3. Pemantauan Antrean Hari Ini                                                                |
| :-----------------------------------------------------------------------------------------------------------------------------------: | :----------------------------------------------------------------------------------------------------------------------------------------------: | :---------------------------------------------------------------------------------------------------------------------------------------------------------: |
| <a href="screenshot/admin/1_dashboard.png"><img src="screenshot/admin/1_dashboard.png" width="250" alt="Dashboard Loket Admin" /></a> | <a href="screenshot/admin/2_visit_add.png"><img src="screenshot/admin/2_visit_add.png" width="250" alt="Formulir Pendaftaran Pasien Baru" /></a> | <a href="screenshot/admin/3_visit_list.png"><img src="screenshot/admin/3_visit_list.png" width="250" alt="Daftar Antrean Pasien Poliklinik Hari Ini" /></a> |

|                                                                4. Riwayat Rekam Medis Selesai                                                                 |                                                          5. Input Kasus Gigitan Rabies (GHPR)                                                          |                                                                6. Monitoring Epidemiologi GHPR                                                                 |
| :-----------------------------------------------------------------------------------------------------------------------------------------------------------: | :----------------------------------------------------------------------------------------------------------------------------------------------------: | :------------------------------------------------------------------------------------------------------------------------------------------------------------: |
| <a href="screenshot/admin/4_visit_history.png"><img src="screenshot/admin/4_visit_history.png" width="250" alt="Riwayat Rekam Medis Selesai Diperiksa" /></a> | <a href="screenshot/admin/5_ghpr_add.png"><img src="screenshot/admin/5_ghpr_add.png" width="250" alt="Formulir Pencatatan Kasus Gigitan Rabies" /></a> | <a href="screenshot/admin/6_ghpr_history.png"><img src="screenshot/admin/6_ghpr_history.png" width="250" alt="Daftar Riwayat Kasus Gigitan Rabies GHPR" /></a> |

---

### 🩺 4. Modul Dokter Hewan / Medik Veteriner (Dokter Role)

|                                                     1. Dashboard Beban Kerja Dokter                                                      |                                                      2. Ruang Periksa & Antrean Pasien                                                       |                                                                 3. Riwayat Diagnosa & Rekam Medis                                                                 |
| :--------------------------------------------------------------------------------------------------------------------------------------: | :------------------------------------------------------------------------------------------------------------------------------------------: | :---------------------------------------------------------------------------------------------------------------------------------------------------------------: |
| <a href="screenshot/doctor/1_dashboard.png"><img src="screenshot/doctor/1_dashboard.png" width="250" alt="Dashboard Dokter Hewan" /></a> | <a href="screenshot/doctor/2_visit.png"><img src="screenshot/doctor/2_visit.png" width="250" alt="Daftar Antrean Pasien Dokter Hewan" /></a> | <a href="screenshot/doctor/3_visit_history.png"><img src="screenshot/doctor/3_visit_history.png" width="250" alt="Riwayat Pemeriksaan dan Diagnosa Dokter" /></a> |

---

### 👑 5. Modul Super Administrator (Eksekutif & Tata Kelola Data Master)

|                                                               1. Dashboard Analisis Eksekutif                                                               |                                                        2. Manajemen Akun Pengguna                                                         |                                                            3. Tata Kelola Data Tenaga Staf                                                            |
| :---------------------------------------------------------------------------------------------------------------------------------------------------------: | :---------------------------------------------------------------------------------------------------------------------------------------: | :---------------------------------------------------------------------------------------------------------------------------------------------------: |
| <a href="screenshot/super_admin/1_dashboard.png"><img src="screenshot/super_admin/1_dashboard.png" width="250" alt="Dashboard Eksekutif Super Admin" /></a> | <a href="screenshot/super_admin/2_user.png"><img src="screenshot/super_admin/2_user.png" width="250" alt="Manajemen Akun Pengguna" /></a> | <a href="screenshot/super_admin/3_staff.png"><img src="screenshot/super_admin/3_staff.png" width="250" alt="Manajemen Staf Pegawai dan Dokter" /></a> |

|                                                                   4. Master Data Jenis Hewan                                                                    |                                                                5. Manajemen Stok Obat & Vaksin                                                                 |                                                                6. Inventaris Peralatan Medis                                                                |
| :-------------------------------------------------------------------------------------------------------------------------------------------------------------: | :------------------------------------------------------------------------------------------------------------------------------------------------------------: | :---------------------------------------------------------------------------------------------------------------------------------------------------------: |
| <a href="screenshot/super_admin/4_animal_category.png"><img src="screenshot/super_admin/4_animal_category.png" width="250" alt="Master Data Jenis Hewan" /></a> | <a href="screenshot/super_admin/5_examination.png"><img src="screenshot/super_admin/5_examination.png" width="250" alt="Manajemen Stok Obat dan Vaksin" /></a> | <a href="screenshot/super_admin/6_inventory.png"><img src="screenshot/super_admin/6_inventory.png" width="250" alt="Manajemen Inventaris Alat Medis" /></a> |

|                                                                 7. Manajemen Konten Edukasi                                                                  |                                                                      8. Laporan Kunjungan Terpadu                                                                       |                                                                     9. Laporan Kasus Rabies (GHPR)                                                                     |                                                               10. Pengaturan Profil Akun                                                                |
| :----------------------------------------------------------------------------------------------------------------------------------------------------------: | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------: | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------: | :-----------------------------------------------------------------------------------------------------------------------------------------------------: |
| <a href="screenshot/super_admin/7_article.png"><img src="screenshot/super_admin/7_article.png" width="185" alt="Manajemen Artikel dan Berita Edukasi" /></a> | <a href="screenshot/super_admin/8_history_visit.png"><img src="screenshot/super_admin/8_history_visit.png" width="185" alt="Laporan Rekam Medis Periode Terpadu" /></a> | <a href="screenshot/super_admin/9_history_ghpr.png"><img src="screenshot/super_admin/9_history_ghpr.png" width="185" alt="Laporan Kasus Gigitan Rabies Terpadu" /></a> | <a href="screenshot/super_admin/10_profil.png"><img src="screenshot/super_admin/10_profil.png" width="185" alt="Pengaturan Profil Akun Pengguna" /></a> |

---

### 📄 6. Modul Ekspor & Format Cetak Dokumen Kedinasan

|                                                            1. Format Cetak Lembar Rekam Medis Resmi                                                            |                                                          2. Format Cetak Laporan Surveilans Rabies (GHPR)                                                          |
| :------------------------------------------------------------------------------------------------------------------------------------------------------------: | :----------------------------------------------------------------------------------------------------------------------------------------------------------------: |
| <a href="screenshot/export/2_visit_export.png"><img src="screenshot/export/2_visit_export.png" width="380" alt="Format Cetak Lembar Rekam Medis Pasien" /></a> | <a href="screenshot/export/3_ghpr_export.png"><img src="screenshot/export/3_ghpr_export.png" width="380" alt="Format Cetak Laporan Surveilans Kasus Rabies" /></a> |

---

## 🛡️ Audit Keamanan Siber & Pen-Testing (OWASP Top 10)

Sistem **PuskeswanApp** telah melalui pengujian penetrasi keamanan mendalam (*Full-Spectrum Penetration Testing*) berbasis standar internasional **OWASP Top 10:2021**, pengujian integritas arsitektur routing, serta hardening modul komunikasi real-time.

### Ringkasan Hasil Audit Keamanan:
- **Total Skenario Diuji:** 42 Skenario (Terbagi dalam 7 Batch Komprehensif)
- **Status Pertahanan:** **42 Defended (100% Kebal / Lolos)**
- **Kerentanan Berhasil Dieksploitasi:** **0 (Zero Vulnerability)**
- **Peringkat Keamanan:** **Grade A+ (Hardened - Production Ready)**

| Batch | Kategori OWASP Top 10 | Cakupan Vektor Pengujian & Pertahanan | Status |
| :---: | :--- | :--- | :---: |
| **Batch 1** | **A01: Broken Access Control & IDOR** | Proteksi eskalasi wewenang akun Super Admin/Admin/Dokter, isolasi IDOR rekam medis pasien, path traversal, dan kebijakan CORS ketat. | `[DEFENDED]` |
| **Batch 2** | **A02: Cryptographic Failures** | Enkripsi wajib HTTPS/TLS, hashing password standar industri BCrypt cost 12, cookie sesi terproteksi `HttpOnly`, `SameSite=Lax`, dan sanitasi props Inertia. | `[DEFENDED]` |
| **Batch 3** | **A03: Injection Attacks** | Perlindungan parameterized queries terhadap SQL Injection (pencarian & filter), time-based blind SQLi, pencegahan Stored/Reflected XSS via sanitasi HTML `strip_tags()` pada chat & input, serta mitigasi host header poisoning. | `[DEFENDED]` |
| **Batch 4** | **A04: Insecure Design & Anti-Bot** | Verifikasi 3 lapis pada cek rekam medis publik (NIK 16 digit, Nama Lengkap, Captcha SVG dinamis server-side), perangkap bot (*invisible honeypot*), dan mitigasi race-condition. | `[DEFENDED]` |
| **Batch 5** | **A05: Security Misconfiguration** | Pemblokiran akses langsung ke berkas sensitif (`.env`, `.git`), penonaktifan direktori browsing (`-Indexes`), security headers terstandarisasi, dan penanganan clean error `404 Not Found`. | `[DEFENDED]` |
| **Batch 6** | **A06 & A07: Authentication & Outdated Components** | Arsitektur rate limiting 2-Tier (Cooldown 20 detik & Karantina IP 30 menit ke `429`), pencabutan sesi zombie/stale, dependensi bebas CVE (`composer audit` bersih), dan kompatibilitas penuh PHP 8.4. | `[DEFENDED]` |
| **Batch 7** | **A08, A09, A10 & WebSocket Security** | Mass assignment guard Eloquent, proteksi token CSRF ganda, larangan eksekusi skrip di folder storage (*anti-webshell*), otorisasi ketat channel privat WebSockets (`routes/channels.php`), dan pembatasan wewenang hapus pesan khusus Super Admin. | `[DEFENDED]` |

> 📑 **Laporan Audit Forensik Lengkap:**  
> Rincian lengkap metodologi, analisis vektor serangan, dan mekanisme pertahanan teknis didokumentasikan secara formal pada berkas [**`AUDIT.md`**](AUDIT.md).
> 
> 📷 **Bukti Visual Tangkapan Layar:**  
> Seluruh checklist 42 skenario terangkum dalam [**`test/screenshot/MASTER_AUDIT_SUMMARY_REPORT.png`**](test/screenshot/MASTER_AUDIT_SUMMARY_REPORT.png) serta berkas individual di [**`test/screenshot/DEFENDED/`**](test/screenshot/DEFENDED/).

---

## 🧪 Verifikasi Kualitas Kode & Pengujian Otomatis

Aplikasi menerapkan pengujian regresi otomatis menyeluruh (*Automated Regression Testing*), pemeriksaan tipe data statis ketat, standardisasi kode PSR-12, dan kompilasi frontend teroptimasi:

### 1. 🧪 Automated Regression Testing (Pest PHP 5.3.4)
Menjalankan pengujian fitur operasional, transaksional medis, surveilans rabies, otentikasi, hingga modul obrolan real-time:

```bash
# Menjalankan seluruh pengujian otomatis (99 Feature & Security Tests)
php artisan test --compact
```

```text
   PASS  Tests\Feature\ChatTest (14 tests, 85 assertions)
   PASS  Tests\Feature\AdminModulesTest (18 tests, 142 assertions)
   PASS  Tests\Feature\DokterModulesTest (12 tests, 96 assertions)
   PASS  Tests\Feature\SuperAdminModulesTest (20 tests, 164 assertions)
   PASS  Tests\Feature\PublicMedicalRecordSearchTest (8 tests, 48 assertions)
   PASS  Tests\Feature\SecurityPenetrationTest (15 tests, 112 assertions)
   PASS  Tests\Feature\AuthRateLimitingTest (6 tests, 38 assertions)
   PASS  Tests\Feature\UserPhotoManagementTest (6 tests, 22 assertions)

  Tests:    99 passed (707 assertions)
  Duration: 6.44s (100% Passed)
```

### 2. 🔍 TypeScript Static Type Checking
Memastikan seluruh komponen React, props Inertia, hook, dan rute Laravel Wayfinder bebas dari kesalahan tipe:

```bash
# Verifikasi pengetikan statis seluruh berkas TypeScript/JSX
npm run types:check
# Output: tsc --noEmit (0 errors)
```

### 3. 🎨 Standarisasi Format Kode (Laravel Pint)
Menjaga kepatuhan gaya penulisan kode PHP dengan standar resmi Laravel dan PSR-12:

```bash
# Formatter kode otomatis
vendor/bin/pint --format agent
# Output: {"tool":"pint","result":"passed"}
```

### 4. ⚡ Kompilasi Frontend Produksi (Vite-Plus)
Membundel seluruh aset React 19, CSS Tailwind v4, dan kode klien secara ringkas:

```bash
# Build aset produksi teroptimasi
npm run build
# Output: ✓ 638 modules transformed in ~11.2s
```

### 5. 📡 Menjalankan Server WebSocket (Laravel Reverb)
Mengaktifkan server daemon WebSocket berkecepatan tinggi untuk modul obrolan instan:

```bash
# Memulai server WebSocket Reverb lokal
php artisan reverb:start
# Output: INFO Starting server on 0.0.0.0:8080 (localhost).
```

---

## 📄 Lisensi & Riwayat Pembaruan

- **Lisensi Perangkat Lunak:** Dilisensikan di bawah [MIT License](LICENSE).
- **Catatan Perubahan Versi:** Seluruh riwayat pembaruan, perbaikan bug, dan penambahan fitur dapat dilihat pada berkas [CHANGELOG.md](CHANGELOG.md).

---

<p align="center">
  <strong>UPTD Pusat Kesehatan Hewan & Inseminasi Buatan (IB) Kota Pariaman</strong><br>
  <em>Jl. Sentot Ali Basa, Jati Mudik, Kec. Pariaman Tengah, Kota Pariaman, Sumatera Barat 25519</em><br>
  © 2026 PuskeswanApp. All rights reserved.
</p>
