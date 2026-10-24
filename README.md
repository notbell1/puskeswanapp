<p align="center">
  <img src="public/images/logo_puskeswan.webp" alt="Logo Puskeswan Kota Pariaman" width="110" />
</p>

<h1 align="center">PuskeswanApp V.2.0.0</h1>

<p align="center">
  <strong>Sistem Informasi Pelayanan Kesehatan Hewan, Rekam Medis Veteriner & Surveilans Zoonosis Terpadu</strong><br>
  <em>UPTD Pusat Kesehatan Hewan (Puskeswan) dan Inseminasi Buatan (IB) Kota Pariaman</em><br>
  Dinas Pertanian, Pangan dan Perikanan Kota Pariaman
</p>

<p align="center">
  <a href="#-teknologi-yang-digunakan-tech-stack"><img src="https://img.shields.io/badge/PHP-8.4.27-777BB4?style=for-the-badge&logo=php&logoColor=white" alt="PHP 8.4.27" /></a>
  <a href="#-teknologi-yang-digunakan-tech-stack"><img src="https://img.shields.io/badge/Laravel-13.37.0-FF2D20?style=for-the-badge&logo=laravel&logoColor=white" alt="Laravel 13.37.0" /></a>
  <a href="#-teknologi-yang-digunakan-tech-stack"><img src="https://img.shields.io/badge/Node.js-24.22.1_LTS-5FA04E?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js 24.22.1" /></a>
  <a href="#-teknologi-yang-digunakan-tech-stack"><img src="https://img.shields.io/badge/React-19.2.0-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19.2.0" /></a>
  <a href="#-teknologi-yang-digunakan-tech-stack"><img src="https://img.shields.io/badge/TypeScript-5.7.2-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript 5.7.2" /></a>
  <a href="#-teknologi-yang-digunakan-tech-stack"><img src="https://img.shields.io/badge/Inertia.js-3.5.1-9553E9?style=for-the-badge&logo=inertia&logoColor=white" alt="Inertia.js 3.5.1" /></a>
  <a href="#-teknologi-yang-digunakan-tech-stack"><img src="https://img.shields.io/badge/Tailwind_CSS-4.0.0-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS 4.0.0" /></a>
  <a href="#-verifikasi-kualitas-kode--pengujian-otomatis"><img src="https://img.shields.io/badge/Pest_Tests-60%2F60_Passed-22C55E?style=for-the-badge&logo=pest&logoColor=white" alt="Tests 60 Passed" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-F59E0B?style=for-the-badge" alt="License MIT" /></a>
</p>

---

## 📑 Daftar Isi

- [🏛️ Tentang Instansi](#️-tentang-instansi)
- [📋 Tugas Pokok & Fungsi Puskeswan](#-tugas-pokok--fungsi-puskeswan)
- [🔄 Alur Pelayanan Poliklinik Terpadu](#-alur-pelayanan-poliklinik-terpadu)
- [📐 Pemodelan Sistem & Diagram UML (Non-Sensitif)](#-pemodelan-sistem--diagram-uml-non-sensitif)
- [✨ Fitur-Fitur Utama](#-fitur-fitur-utama)
- [🛠️ Spesifikasi Teknologi Rinci (Tech Stack)](#️-spesifikasi-teknologi-rinci-tech-stack)
- [⚡ Optimasi Kinerja Basis Data (Laravel Debugbar)](#-optimasi-kinerja-basis-data-laravel-debugbar)
- [👥 Matriks Hak Akses Peran Pengguna](#-matriks-hak-akses-peran-pengguna)
- [📸 Dokumentasi Visual Antarmuka (Screenshots)](#-dokumentasi-visual-antarmuka-screenshots)
- [🧪 Verifikasi Kualitas Kode & Pengujian Otomatis](#-verifikasi-kualitas-kode--pengujian-otomatis)
- [📄 Lisensi & Riwayat Pembaruan](#-lisensi--riwayat-pembaruan)

---

## 🏛️ Tentang Instansi

**Pusat Kesehatan Hewan (Puskeswan)** merupakan unit pelaksana teknis daerah di bidang kesehatan hewan yang menyelenggarakan pelayanan medik veteriner secara langsung kepada masyarakat dan peternak. Keberadaan Puskeswan berperan sebagai garda terdepan dalam menjaga kesehatan hewan kesayangan, meningkatkan produktivitas ternak rakyat, melindungi masyarakat dari ancaman penyakit menular asal hewan (*zoonosis*), serta menjamin keamanan pangan asal hewan.

Melalui integrasi unit **Inseminasi Buatan (IB)**, Puskeswan juga menjalankan fungsi strategis dalam peningkatan mutu genetik dan populasi ternak ruminansia (sapi potong dan kerbau) guna mendukung ketahanan pangan daerah Kota Pariaman.

---

## 📋 Tugas Pokok & Fungsi Puskeswan

1. **Pelayanan Medik Veteriner & Poliklinik Hewan:** Pemeriksaan fisik klinis, diagnosa patologis, pengobatan kuratif, pemberian multivitamin/antiparasit, sterilisasi (*ovariohisterektomi* & *kastrasi*), hingga tindakan bedah minor bagi hewan kesayangan maupun ternak masyarakat.
2. **Pengendalian Penyakit Hewan Menular Strategis (PHMS) & Zoonosis:** Pelaksanaan program vaksinasi massal—khususnya **Vaksinasi Rabies** pada Hewan Penular Rabies (HPR: anjing, kucing, kera, musang), serta vaksinasi ternak (*Septicaemia Epizootica*, *Newcastle Disease*, *Avian Influenza*).
3. **Surveilans & Respons Cepat Kasus Gigitan Rabies (GHPR):** Pencatatan epidemiologi kasus gigitan, pemantauan masa observasi klinis hewan penggigit selama 14 hari, dan monitoring kepatuhan Vaksin Anti Rabies (VAR) bagi korban dengan pendekatan *One Health*.
4. **Pelayanan Inseminasi Buatan (IB) & Reproduksi Ternak:** Layanan kawin suntik semen beku bersertifikat, Pemeriksaan Kebuntingan (PKB), penanganan gangguan reproduksi (*repeat breeder*, *anestrus*, *distokia*), dan pendampingan kelahiran.
5. **Kesehatan Masyarakat Veteriner (Kesmavet):** Pengawasan higiene sanitasi, pemeriksaan *antemortem* & *postmortem* hewan kurban, jaminan pangan **ASUH** (*Aman, Sehat, Utuh, Halal*), dan penerbitan Surat Keterangan Kesehatan Hewan (SKKH).
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

## 📐 Pemodelan Sistem & Diagram UML (Non-Sensitif)

> [!NOTE]
> Guna mematuhi standar integritas keamanan data dan melindungi struktur sistem internal, diagram tingkat implementasi yang bersifat rahasia—seperti *Entity Relationship Diagram (ERD)*, *Activity Diagram* rincian kueri logika, dan struktur relasi basis data internal—**sengaja tidak dipublikasikan secara terbuka**.
> 
> Bagian ini menampilkan pemodelan arsitektur fungsional tingkat tinggi (*high-level functional UML*) yang aman, baku, dan merefleksikan alur kerja sistem informasi terpadu PuskeswanApp:

### 1. 🎯 UML Use Case Diagram (Sistem Baru)

Memetakan hubungan antara 4 peran pengguna (*Super Admin*, *Admin Loket*, *Dokter Hewan*, dan *Masyarakat / Pemilik Pasien*) terhadap batasan fungsionalitas sistem informasi:

```mermaid
flowchart LR
    %% Actors
    subgraph Actors ["👥 Aktor Pengguna"]
        direction TB
        PUB["🌐 Masyarakat / Pemilik"]:::actor
        ADM["📋 Admin Loket"]:::actor
        DOK["🩺 Dokter Hewan"]:::actor
        SA["👑 Super Admin"]:::actor
    end

    %% System Boundary
    subgraph System ["💻 Sistem Informasi Puskeswan Kota Pariaman"]
        direction TB
        subgraph ModulPublik ["Portal Publik & Mandiri"]
            UC_CekRM(["🔍 Cek Rekam Medis Mandiri (NIK)"]):::uc
            UC_Edukasi(["📰 Baca Berita & Edukasi Hewan"]):::uc
            UC_ProfilStaf(["👨‍⚕️ Lihat Profil Tenaga Staf"]):::uc
        end

        subgraph ModulLoket ["Pelayanan Loket & Registrasi"]
            UC_Daftar(["📝 Pendaftaran Pasien & Autofill NIK"]):::uc
            UC_Antrean(["🎫 Penerbitan Nomor Antrean"]):::uc
            UC_Rabies(["🐕 Surveilans Kasus Gigitan Rabies"]):::uc
            UC_CetakRM(["🖨️ Cetak Lembar Rekam Medis"]):::uc
        end

        subgraph ModulKlinis ["Pelayanan Medis Veteriner"]
            UC_AntreanDokter(["📋 Monitoring Antrean Realtime"]):::uc
            UC_Periksa(["🩺 Pemeriksaan Fisik & Diagnosa"]):::uc
            UC_Terapi(["💊 Terapi Obat & Tindakan Medis"]):::uc
            UC_RiwayatMedis(["📜 Telusur Riwayat Medis Pasien"]):::uc
        end

        subgraph ModulManajerial ["Tata Kelola & Keamanan"]
            UC_UserRole(["🔐 Manajemen Akun & Hak Akses"]):::uc
            UC_Inventaris(["📦 Inventaris Obat & Alat Medis"]):::uc
            UC_Laporan(["📊 Laporan Multi-Filter & Ekspor PDF"]):::uc
            UC_AuditLog(["🛡️ Audit Log & Two-Tier Security"]):::uc
        end
    end

    %% Use Case Connections
    PUB --> UC_CekRM
    PUB --> UC_Edukasi
    PUB --> UC_ProfilStaf

    ADM --> UC_Daftar
    ADM --> UC_Antrean
    ADM --> UC_Rabies
    ADM --> UC_CetakRM

    DOK --> UC_AntreanDokter
    DOK --> UC_Periksa
    DOK --> UC_Terapi
    DOK --> UC_RiwayatMedis

    SA --> UC_UserRole
    SA --> UC_Inventaris
    SA --> UC_Laporan
    SA --> UC_AuditLog

    classDef actor fill:#f1f5f9,stroke:#475569,stroke-width:2px,font-weight:bold;
    classDef uc fill:#ffffff,stroke:#0284c7,stroke-width:1.5px;
```

---

### 2. 🔄 UML State Machine Diagram (Siklus Status Kunjungan Pasien)

Menggambarkan transisi status antrean pasien secara otomatis sejak didaftarkan di loket pendaftaran, dipanggil ke ruang pemeriksaan dokter, hingga penerbitan lembar rekam medis resmi:

```mermaid
stateDiagram-v2
    [*] --> Terdaftar: Admin loket daftarkan pasien & keluhan awal
    
    state Terdaftar {
        [*] --> Antri
        Antri: Menunggu Panggilan di Ruang Tunggu Pasien
    }
    
    Terdaftar --> SedangDiperiksa: Dokter memilih pasien pada dashboard antrean
    
    state SedangDiperiksa {
        [*] --> PemeriksaanFisik
        PemeriksaanFisik --> PenegakanDiagnosa
        PenegakanDiagnosa --> ResepTerapiDanTindakan
    }
    
    SedangDiperiksa --> Selesai: Dokter menyimpan hasil pemeriksaan rekam medis
    
    state Selesai {
        [*] --> RekamMedisTercatat
        RekamMedisTercatat: Status antrean ditutup & lembar rekam medis siap dicetak
    }
    
    Selesai --> [*]
```

---

### 3. 🌐 UML Deployment Diagram (Topologi Fisik & Infrastruktur)

Menjelaskan arsitektur perangkat keras, jaringan, dan lingkungan eksekusi aplikasi secara aman:

```mermaid
flowchart LR
    subgraph ClientTier ["💻 Client Tier (Perangkat Pengguna)"]
        direction TB
        Browser["🌐 Web Browser Modern<br/>(Chrome / Firefox / Edge / Safari)"]
    end

    subgraph AppTier ["🖥️ Application Tier (Server Puskeswan)"]
        direction TB
        WebServer["⚡ Web Server (Nginx / Apache)<br/>Reverse Proxy & TLS Termination"]
        LaravelApp["⚙️ Backend Runtime (PHP 8.4.27)<br/>Laravel 13.37.0 & Inertia.js 3.5.1"]
        WebServer --- LaravelApp
    end

    subgraph DataTier ["🗄️ Storage Tier (Penyimpanan Terpadu)"]
        direction TB
        Database[("🗄️ Relational Database (MySQL 8.0+)<br/>Composite Indexed Performance Tables")]
        CacheStore[("⚡ High-Speed Cache<br/>(Session & Rate Limiter Security)")]
    end

    Browser -- "HTTPS / TLS Encrypted (Port 443)" --> WebServer
    LaravelApp -- "PDO / MySQL Socket Connection" --> Database
    LaravelApp -- "Key-Value State Store" --> CacheStore
```

---

## ✨ Fitur-Fitur Utama

<details open>
<summary><strong>🔍 1. Portal Cek Rekam Medis Mandiri oleh Masyarakat</strong></summary>

* **Verifikasi Identitas Aman:** Pemilik cukup memasukkan 16 digit NIK dan Nama Lengkap yang dicocokkan dengan data registrasi poliklinik.
* **Captcha Anti-Bot Dinamis:** Perlindungan dari *scraping* otomatis menggunakan generator kode acak berbasis SVG biner di sisi server.
* **Informasi Klinis Lengkap:** Menampilkan riwayat pemeriksaan, diagnosa dokter, berat badan, suhu tubuh, tindakan medis, serta rincian terapi obat.
* **Pratinjau & Cetak PDF:** Dilengkapi tombol cetak dokumen resmi rekam medis yang siap diunduh atau dicetak.
</details>

<details>
<summary><strong>📊 2. Modul Surveilans Epidemiologi Rabies (GHPR)</strong></summary>

* **Pencatatan Epidemiologi Rinci:** Mendokumentasikan identitas korban, lokasi luka gigitan, tanggal kejadian, serta kepemilikan hewan.
* **Status Hewan & Masa Observasi 14 Hari:** Pelacakan kondisi hewan penggigit (*Observasi Lapangan*, *Mati / Positif Rabies*, *Sehat*).
* **Monitoring Vaksin Anti Rabies (VAR):** Rekapitulasi status pemberian vaksin pada manusia (*Belum*, *Dosis 1*, *Lengkap*).
* **Format Cetak Laporan Resmi:** Template laporan investigasi epidemiologi untuk koordinasi lintas sektoral dengan Dinas Kesehatan.
</details>

<details>
<summary><strong>🛡️ 3. Arsitektur Keamanan Berlapis (Two-Tier Rate Limiting)</strong></summary>

* **Tier 1 (Cooldown 20 Detik):** Jika pengguna salah memasukkan kredensial 5 kali berturut-turut, tombol login dinonaktifkan sementara dengan timer hitung mundur.
* **Tier 2 (IP Block 30 Menit):** Jika penalti cooldown terulang hingga 3 kali (3 *strikes*), alamat IP penyerang diblokir total selama 30 menit ke halaman error `429 Too Many Requests`.
* **Zero-Trust Upload Validation:** Seluruh unggahan foto profil dan gambar artikel diperiksa biner *magic bytes*-nya menggunakan ekstensi PHP `finfo` dan `getimagesize()` untuk mencegah penyelundupan *web shell*.
</details>

<details>
<summary><strong>📦 4. Manajemen Logistik Obat & Inventaris Klinik</strong></summary>

* **Indikator Stok Cerdas:** Otomatisasi pengelompokan status obat (*Kritis: ≤ 10 unit*, *Menipis: 11–30 unit*, *Aman: > 30 unit*).
* **Inventaris Alat Medis:** Pengawasan kondisi peralatan medis dan operasional lapangan (*Baik*, *Rusak Ringan*, *Rusak Berat*) lengkap dengan riwayat pencatatan penanggung jawab.
</details>

---

## 🛠️ Spesifikasi Teknologi Rinci (Tech Stack)

Aplikasi dibangun menggunakan kombinasi pustaka dan kerangka kerja modern versi stabil terbaru:

| Komponen Arsitektur | Teknologi / Pustaka | Versi Terpasang | Peran & Deskripsi Kunci |
| :--- | :--- | :---: | :--- |
| **Backend Runtime** | **PHP** | `v8.4.27 (NTS x64)` | Runtime modern dengan performa JIT engine dan konstruktor properti terpromosi |
| **Backend Framework** | **Laravel Framework** | `v13.37.0` | Framework inti MVC (Patched terhadap celah `CVE-2026-114509`) |
| **Frontend Runtime** | **Node.js** | `v24.22.1 (LTS)` | Lingkungan eksekusi JavaScript modern dengan npm `v11.19.1` |
| **Frontend Framework** | **React** | `v19.2.0` | Pustaka antarmuka pengguna berbasis komponen reaktif SPA |
| **Language Extension** | **TypeScript** | `v5.7.2` | Pengetikan statis ketat untuk mencegah *runtime type error* di antarmuka |
| **Full-Stack Adapter** | **Inertia.js Core / Laravel** | `v3.5.1` | Jembatan komunikasi server-driven SPA tanpa pembuatan REST API redundan |
| **CSS & Design Engine**| **Tailwind CSS** | `v4.0.0` | Mesin CSS generasi baru berbasis *lightningcss* untuk styling ultra cepat |
| **Iconography** | **Lucide Icons** | `v1.16.0` | Pustaka ikon SVG modern yang ringan dan konsisten |
| **Type-Safe Routing** | **Laravel Wayfinder** | `v0.1.23` | Generator otomatis fungsi rute TypeScript langsung dari controller Laravel |
| **Database Engine** | **MySQL / MariaDB** | `v8.0+ / v10.5+` | Basis data relasional dengan indeks komposit pada tabel frekuensi tinggi |
| **Automated Testing** | **Pest PHP** | `v5.3.3` | Kerangka pengujian fitur otomatis (60 Feature Tests, 100% Passed) |
| **Code Style Linter** | **Laravel Pint** | `v1.32.1` | Formatter kode otomatis berstandar PSR-12 dan panduan Laravel |
| **Build Tooling** | **Vite-Plus (VoidZero)** | `v1.4.0` | Bundler modul berkas frontend super cepat untuk lingkungan produksi |

---

## ⚡ Optimasi Kinerja Basis Data (Laravel Debugbar)

Audit menyeluruh menggunakan metrik Laravel Debugbar telah mengeliminasi inefisiensi kueri di seluruh modul:

```
[SEBELUM OPTIMASI]
Admin Dashboard  : 160+ Kueri SQL (Looping harian 30 hari x 5 kueri count)  -> Latensi: 350-600 ms
Pencarian Pasien : 1 + N Kueri SQL (Looping query kunjungan terakhir hewan)  -> N+1 Problem
Dokter Dashboard : Duplikasi 100% kueri antrean aktif & rekap grafik         -> Kueri ganda

[SETELAH OPTIMASI]
Admin Dashboard  : 5–6 Kueri SQL (Single Query GROUP BY agregasi)            -> Latensi: < 50 ms (-96%)
Pencarian Pasien : 2 Kueri SQL (Eager Loading via latestOfMany 'latestVisit')-> N+1 Terselesaikan
Dokter Dashboard : 0 Kueri Duplikat (Reuse hasil kueri agregasi 30 hari)     -> Beban berkurang 50%
```

* **Indeks Komposit yang Ditambahkan:**
  * `visits(tgl_kunjungan, status_antrean)`: Mempercepat filter antrean harian dan dashboard.
  * `examinations(id_dokter, waktu_selesai)`: Mempercepat kalkulasi grafik analitik dokter.
  * `examinations(waktu_selesai)`: Mempercepat filter laporan rekam medis berkala.

---

## 👥 Matriks Hak Akses Peran Pengguna

<details>
<summary><strong>Klik untuk melihat rincian hak akses peran (*Role Access Matrix*)</strong></summary>

| Modul & Fitur | Publik / Tamu | Petugas Loket (Admin) | Dokter Hewan | Super Administrator |
| :--- | :---: | :---: | :---: | :---: |
| **Landing Page & Edukasi** | ✅ Akses | ✅ Akses | ✅ Akses | ✅ Akses |
| **Cek Rekam Medis Mandiri** | ✅ Akses | ✅ Akses | ✅ Akses | ✅ Akses |
| **Dashboard Loket Pendaftaran** | ❌ Ditolak | ✅ Penuh | ❌ Ditolak | ❌ Ditolak |
| **Registrasi Pemilik & Pasien** | ❌ Ditolak | ✅ Penuh | ❌ Ditolak | ❌ Ditolak |
| **Manajemen Antrean Loket** | ❌ Ditolak | ✅ Penuh | ❌ Ditolak | ❌ Ditolak |
| **Surveilans Rabies (GHPR)** | ❌ Ditolak | ✅ Penuh | ❌ Ditolak | 👁️ Monitoring |
| **Dashboard Dokter Hewan** | ❌ Ditolak | ❌ Ditolak | ✅ Penuh | ❌ Ditolak |
| **Pemeriksaan & Diagnosa Medis**| ❌ Ditolak | ❌ Ditolak | ✅ Penuh | ❌ Ditolak |
| **Riwayat Pelayanan Dokter** | ❌ Ditolak | ❌ Ditolak | ✅ Penuh | ❌ Ditolak |
| **Dashboard Eksekutif** | ❌ Ditolak | ❌ Ditolak | ❌ Ditolak | ✅ Penuh |
| **Manajemen Akun Pengguna** | ❌ Ditolak | ❌ Ditolak | ❌ Ditolak | ✅ Penuh |
| **Manajemen Pegawai & Staf** | ❌ Ditolak | ❌ Ditolak | ❌ Ditolak | ✅ Penuh |
| **Logistik Obat & Inventaris** | ❌ Ditolak | ❌ Ditolak | ❌ Ditolak | ✅ Penuh |
| **Laporan & Ekspor Terpadu** | ❌ Ditolak | ❌ Ditolak | ❌ Ditolak | ✅ Penuh |
</details>

---

## 📸 Dokumentasi Visual Antarmuka (Screenshots)

Berikut adalah dokumentasi tampilan visual antarmuka sistem PuskeswanApp V.2.0.0:

---

### 🌐 1. Portal Publik & Edukasi Masyarakat (Landing Page)

#### A. Hero Section & Profil Instansi
Tampilan beranda utama dengan navigasi layanan, sambutan resmi, serta ringkasan profil UPTD Puskeswan dan IB Kota Pariaman.

<p align="center">
  <img src="screenshot/index/1_hero_section.png" alt="Hero Section Puskeswan Kota Pariaman" width="700" style="border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);" />
</p>

<p align="center">
  <img src="screenshot/index/2_about_section.png" alt="Tentang UPTD Puskeswan dan IB" width="700" style="border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);" />
</p>

#### B. Fitur Cek Mandiri Rekam Medis Pasien
Pencarian riwayat medis mandiri oleh pemilik hewan menggunakan 16 digit NIK dan Nama Lengkap yang dilindungi verifikasi kode captcha anti-bot.

<p align="center">
  <img src="screenshot/index/3_cek_section.png" alt="Fitur Cek Mandiri Rekam Medis" width="700" style="border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);" />
</p>

#### C. Portal Artikel Edukasi Kesehatan Hewan & Publikasi Staf Medis
Pusat edukasi kesehatan hewan dan vaksinasi rabies terbitan tim medis serta struktur pegawai UPTD Puskeswan Kota Pariaman.

<p align="center">
  <img src="screenshot/index/4_article_section.png" alt="Daftar Artikel Edukasi Kesehatan Hewan" width="700" style="border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);" />
</p>

<p align="center">
  <img src="screenshot/index/5_staff_section.png" alt="Struktur Staf dan Tenaga Medis Puskeswan" width="700" style="border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);" />
</p>

#### D. Pengelompokan Kategori Edukasi, Arsip Penulis & Informasi Kontak
Arsip artikel yang dikelompokkan berdasarkan kategori topik dan profil dokter hewan penulis, serta informasi kontak poliklinik.

<p align="center">
  <img src="screenshot/index/7_category_section.png" alt="Kategori Artikel Edukasi" width="700" style="border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);" />
</p>

<p align="center">
  <img src="screenshot/index/8_author_section.png" alt="Arsip Artikel Berdasarkan Penulis Medis" width="700" style="border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);" />
</p>

<p align="center">
  <img src="screenshot/index/6_contact_section.png" alt="Kontak dan Lokasi Klinik Puskeswan" width="700" style="border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);" />
</p>

---

### 🔐 2. Modul Autentikasi & Keamanan Berlapis

#### A. Form Login & Proteksi Rate Limiting (Tier 1 Cooldown)
Halaman login petugas terpadu dilengkapi indikator penonaktifan tombol sementara (*cooldown*) saat terdeteksi kegagalan login berulang.

<p align="center">
  <img src="screenshot/auth/login_section.png" alt="Form Login Petugas" width="700" style="border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);" />
</p>

<p align="center">
  <img src="screenshot/auth/rate_limiting_section.png" alt="Indikator Cooldown Tombol Login" width="700" style="border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);" />
</p>

#### B. Pemulihan Kata Sandi (Forgot & Reset Password)
Alur pemulihan kata sandi petugas menggunakan token verifikasi aman via email terdaftar.

<p align="center">
  <img src="screenshot/auth/forgot_section.png" alt="Form Lupa Kata Sandi" width="700" style="border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);" />
</p>

<p align="center">
  <img src="screenshot/auth/reset_section.png" alt="Form Reset Kata Sandi Baru" width="700" style="border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);" />
</p>

#### C. Halaman Kesalahan & Proteksi Akses (403, 404, 429 IP Blocked)
Antarmuka status respon HTTP khusus, termasuk halaman 429 saat alamat IP penyerang diblokir total (Tier 2).

<p align="center">
  <img src="screenshot/auth/403_section.png" alt="Halaman 403 Forbidden Akses Ditolak" width="700" style="border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);" />
</p>

<p align="center">
  <img src="screenshot/auth/404_section.png" alt="Halaman 404 Not Found" width="700" style="border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);" />
</p>

<p align="center">
  <img src="screenshot/auth/429_section.png" alt="Halaman 429 Too Many Requests IP Blocked" width="700" style="border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);" />
</p>

---

### 🏥 3. Modul Petugas Administrasi & Loket Rekam Medis (Admin Role)

#### A. Dashboard Operasional Loket Admin
Kartu metrik antrean harian, grafik pelayanan rekam medis, grafik surveilans kasus gigitan rabies, serta antrean terkini.

<p align="center">
  <img src="screenshot/admin/1_dashboard.png" alt="Dashboard Loket Admin" width="700" style="border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);" />
</p>

#### B. Pendaftaran Pasien & Manajemen Antrean Poliklinik
Pendaftaran pasien hewan baru/lama dengan autofill NIK, nomor RM otomatis, serta pemantauan antrean loket harian.

<p align="center">
  <img src="screenshot/admin/2_visit_add.png" alt="Formulir Pendaftaran Pasien Baru" width="700" style="border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);" />
</p>

<p align="center">
  <img src="screenshot/admin/3_visit_list.png" alt="Daftar Antrean Pasien Poliklinik Hari Ini" width="700" style="border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);" />
</p>

#### C. Riwayat Rekam Medis Selesai & Surveilans Kasus Gigitan Rabies (GHPR)
Pencatatan kasus gigitan rabies secara rinci (data korban, luka gigitan, status VAR, observasi hewan) serta rekapitulasi riwayat medis selesai.

<p align="center">
  <img src="screenshot/admin/4_visit_history.png" alt="Riwayat Rekam Medis Selesai Diperiksa" width="700" style="border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);" />
</p>

<p align="center">
  <img src="screenshot/admin/5_ghpr_add.png" alt="Formulir Pencatatan Kasus Gigitan Rabies" width="700" style="border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);" />
</p>

<p align="center">
  <img src="screenshot/admin/6_ghpr_history.png" alt="Daftar Riwayat Kasus Gigitan Rabies GHPR" width="700" style="border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);" />
</p>

---

### 🩺 4. Modul Dokter Hewan / Medik Veteriner (Dokter Role)

#### A. Dashboard Utama Dokter Hewan
Statistik beban kerja dokter, antrean prioritas yang menunggu diperiksa, serta pasien yang baru selesai ditangani.

<p align="center">
  <img src="screenshot/doctor/1_dashboard.png" alt="Dashboard Dokter Hewan" width="700" style="border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);" />
</p>

#### B. Ruang Periksa Antrean & Riwayat Pelayanan Medik Dokter
Tabel antrean pasien dokter dengan pemantauan riwayat medis lampau dan formulir penegakan diagnosa klinis & terapi obat.

<p align="center">
  <img src="screenshot/doctor/2_visit.png" alt="Daftar Antrean Pasien Dokter Hewan" width="700" style="border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);" />
</p>

<p align="center">
  <img src="screenshot/doctor/3_visit_history.png" alt="Riwayat Pemeriksaan dan Diagnosa Dokter" width="700" style="border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);" />
</p>

---

### 👑 5. Modul Super Administrator (Eksekutif & Tata Kelola Data Master)

#### A. Dashboard Eksekutif Super Administrator
Analisis terpadu 6 bulan terakhir yang mencakup tren kunjungan, persentase kepatuhan vaksinasi VAR, dan sebaran spesies pasien.

<p align="center">
  <img src="screenshot/super_admin/1_dashboard.png" alt="Dashboard Eksekutif Super Admin" width="700" style="border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);" />
</p>

#### B. Manajemen Akun Pengguna, Staf Medis & Master Jenis Hewan
Manajemen peran pengguna (*User & Role Management*), data staf medis, serta master data jenis hewan kesayangan dan ternak.

<p align="center">
  <img src="screenshot/super_admin/2_user.png" alt="Manajemen Akun Pengguna" width="700" style="border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);" />
</p>

<p align="center">
  <img src="screenshot/super_admin/3_staff.png" alt="Manajemen Staf Pegawai dan Dokter" width="700" style="border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);" />
</p>

<p align="center">
  <img src="screenshot/super_admin/4_animal_category.png" alt="Master Data Jenis Hewan" width="700" style="border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);" />
</p>

#### C. Manajemen Logistik Obat, Inventaris Alat & Publikasi Edukasi
Monitoring stok obat otomatis (*Aman*, *Menipis*, *Kritis*), pencatatan inventaris alat medis, serta kurasi artikel edukasi.

<p align="center">
  <img src="screenshot/super_admin/5_examination.png" alt="Manajemen Stok Obat dan Vaksin" width="700" style="border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);" />
</p>

<p align="center">
  <img src="screenshot/super_admin/6_inventory.png" alt="Manajemen Inventaris Alat Medis" width="700" style="border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);" />
</p>

<p align="center">
  <img src="screenshot/super_admin/7_article.png" alt="Manajemen Artikel dan Berita Edukasi" width="700" style="border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);" />
</p>

#### D. Pusat Laporan Terpadu & Profil Akun
Rekapitulasi data rekam medis dan kasus rabies periode dinamis yang siap difilter, serta pengaturan profil administrator.

<p align="center">
  <img src="screenshot/super_admin/8_history_visit.png" alt="Laporan Rekam Medis Periode Terpadu" width="700" style="border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);" />
</p>

<p align="center">
  <img src="screenshot/super_admin/9_history_ghpr.png" alt="Laporan Kasus Gigitan Rabies Terpadu" width="700" style="border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);" />
</p>

<p align="center">
  <img src="screenshot/super_admin/10_profil.png" alt="Pengaturan Profil Akun Pengguna" width="700" style="border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);" />
</p>

---

### 📄 6. Modul Ekspor & Cetak Dokumen Resmi

#### A. Dokumen Cetak Rekam Medis Pasien Hewan
Dokumen cetak rekam medis resmi dengan identitas pemilik, nomor RM, riwayat anamnesa, hasil diagnosa, dan terapi obat bertanda tangan dokter hewan.

<p align="center">
  <img src="screenshot/export/2_visit_export.png" alt="Format Cetak Lembar Rekam Medis Pasien" width="700" style="border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);" />
</p>

#### B. Dokumen Cetak Laporan Surveilans Kasus Gigitan Rabies (GHPR)
Format laporan epidemiologi penanganan kasus gigitan HPR yang memuat data korban, lokasi gigitan, status VAR, observasi hewan penggigit, dan legalitas kedinasan.

<p align="center">
  <img src="screenshot/export/3_ghpr_export.png" alt="Format Cetak Laporan Surveilans Kasus Rabies" width="700" style="border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);" />
</p>

---

## 🧪 Verifikasi Kualitas Kode & Pengujian Otomatis

Aplikasi dilengkapi *automated regression testing* menggunakan Pest PHP dan standardisasi gaya kode Laravel Pint:

```bash
# Menjalankan seluruh pengujian otomatis fitur (60 Tests)
php artisan test --compact

# Hasil Pengujian:
# PASS  Tests\Feature\Admin\AdminDashboardTest
# PASS  Tests\Feature\Admin\RegistrationTest
# PASS  Tests\Feature\Admin\RabiesCaseTest
# PASS  Tests\Feature\Dokter\DokterDashboardTest
# PASS  Tests\Feature\Dokter\DokterExaminationTest
# PASS  Tests\Feature\PublicMedicalRecordSearchTest
# PASS  Tests\Feature\AuthRateLimitingTest
# ... (60 test suites)
# Tests:    60 passed (447 assertions)
# Duration: 4.24s (100% Passed)
```

```bash
# Menjalankan code formatter standar PSR-12
vendor/bin/pint --dirty --format agent

# Kompilasi aset frontend produksi
npm run build
```

---

## 📄 Lisensi & Riwayat Pembaruan

* **Lisensi Perangkat Lunak:** Dilisensikan di bawah [MIT License](LICENSE).
* **Catatan Perubahan Versi:** Seluruh riwayat pembaruan, perbaikan bug, dan penambahan fitur dapat dilihat pada berkas [CHANGELOG.md](CHANGELOG.md).

---

<p align="center">
  <strong>UPTD Pusat Kesehatan Hewan & Inseminasi Buatan (IB) Kota Pariaman</strong><br>
  <em>Jl. Sidi Tukar Arif, Desa Rambai, Kec. Pariaman Selatan, Kota Pariaman, Sumatera Barat 25538</em><br>
  © 2026 PuskeswanApp. All rights reserved.
</p>
