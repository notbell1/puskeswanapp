# PuskeswanApp V.2.0.0

**PuskeswanApp V.2.0.0** adalah platform transformasi digital pelayanan kesehatan hewan, manajemen rekam medis veteriner, surveilans zoonosis, dan pusat edukasi masyarakat yang dikembangkan untuk mendukung operasional **UPTD Pusat Kesehatan Hewan (Puskeswan) dan Inseminasi Buatan (IB) Kota Pariaman**, di bawah naungan Dinas Pertanian, Pangan dan Perikanan Kota Pariaman.

---

## 🏛️ Tentang Puskeswan & Inseminasi Buatan (IB)

**Pusat Kesehatan Hewan (Puskeswan)** merupakan unit pelaksana teknis daerah di bidang kesehatan hewan yang menyelenggarakan pelayanan medik veteriner secara langsung kepada masyarakat dan peternak. Keberadaan Puskeswan berperan sebagai garda terdepan dalam menjaga kesehatan hewan kesayangan, meningkatkan produktivitas ternak rakyat, melindungi masyarakat dari ancaman penyakit menular asal hewan (*zoonosis*), serta menjamin keamanan pangan asal hewan.

Melalui integrasi unit **Inseminasi Buatan (IB)**, Puskeswan juga menjalankan fungsi strategis dalam peningkatan mutu genetik dan populasi ternak ruminansia (sapi potong dan kerbau) guna mendukung ketahanan pangan daerah.

---

## 📋 Tugas Pokok & Fungsi Puskeswan

1. **Pelayanan Medik Veteriner & Poliklinik Hewan**  
   Menyelenggarakan pemeriksaan fisik klinis, penegakan diagnosis, pengobatan kuratif, pemberian multivitamin dan antiparasit, sterilisasi (*ovariohisterektomi* & *kastrasi*), hingga tindakan bedah minor bagi hewan kesayangan maupun ternak masyarakat.

2. **Pencegahan & Pengendalian Penyakit Hewan Menular Strategis (PHMS) & Zoonosis**  
   Melaksanakan program vaksinasi massal dan rutin—khususnya **Vaksinasi Rabies** pada Hewan Penular Rabies (HPR) seperti anjing, kucing, kera, dan musang, serta vaksinasi ternak dan unggas (*Septicaemia Epizootica*, *Newcastle Disease*, dan *Avian Influenza*).

3. **Surveilans & Respon Kasus Gigitan HPR (Rabies)**  
   Melakukan pencatatan epidemiologi kasus gigitan hewan penular rabies, pengamanan hewan penggigit, serta pelaksanaan prosedur observasi klinis selama 14 hari secara terkoordinasi dengan pendekatan *One Health*.

4. **Pelayanan Inseminasi Buatan (IB) & Kesehatan Reproduksi Ternak**  
   Memberikan layanan kawin suntik menggunakan semen beku pejantan unggul bersertifikat, Pemeriksaan Kebuntingan (PKB), penanganan gangguan reproduksi (*repeat breeder*, *anestrus*, *distokia*, dan *prolapsus*), serta pendampingan kelahiran pedet.

5. **Kesehatan Masyarakat Veteriner (Kesmavet)**  
   Melaksanakan pengawasan higiene sanitasi dan pemeriksaan *antemortem* maupun *postmortem* pada hewan kurban serta produk pangan asal hewan agar memenuhi kriteria **ASUH** (*Aman, Sehat, Utuh, dan Halal*), termasuk pelayanan pemeriksaan klinis untuk penerbitan Surat Keterangan Kesehatan Hewan (SKKH).

6. **Pelayanan Kesehatan Hewan Keliling & Penyuluhan Lapangan**  
   Menjangkau kelompok tani ternak di desa dan nagari melalui layanan pengobatan massal, biosekuriti penyemprotan desinfektan kandang, serta edukasi manajemen pakan ternak.

---

## 🚀 Fitur Unggulan PuskeswanApp V.2.0.0

- **Cek Rekam Medis Mandiri Publik**: Pemilik hewan dapat memantau riwayat pemeriksaan klinis, diagnosa dokter, terapi pengobatan, dan mencetak dokumen rekam medis resmi secara mandiri cukup dengan verifikasi NIK dan Nama Lengkap yang dilindungi captcha anti-bot.
- **Alur Pelayanan Loket ke Dokter Hewan Real-Time**: Antrean loket pendaftaran terintegrasi langsung dengan antrean ruang periksa dokter hewan dilengkapi lonceng notifikasi *real-time*.
- **Surveilans Epidemiologi Kasus Gigitan Rabies (GHPR)**: Pencatatan kronologi kasus gigitan, lokasi luka, pemantauan masa observasi hewan 14 hari, serta status pemberian Vaksin Anti Rabies (VAR) bagi korban.
- **Portal Edukasi & Publikasi Kesehatan Hewan**: Ruang publikasi artikel dan berita edukasi terverifikasi yang ditulis langsung oleh dokter hewan dan tim medis Puskeswan.
- **Manajemen Logistik Obat, Vaksin & Inventaris Medis**: Pengawasan stok obat kritis, persediaan vaksin, serta pencatatan kondisi barang inventaris klinik (Baik, Rusak Ringan, Rusak Berat).
- **Laporan Eksekutif & Statistik Interaktif**: Visualisasi grafik tren kunjungan pasien, distribusi spesies, kepatuhan vaksinasi VAR, serta ekspor dokumen cetak resmi berstandar UPTD Puskeswan.
- **Keamanan Berlapis (Two-Tier Rate Limiting & Zero-Trust File Security)**: Proteksi brute-force bertingkat dengan Tier 1 Cooldown 20 detik dan Tier 2 IP Block 30 menit ke halaman 429, serta validasi magic bytes pada seluruh unggahan berkas.

---

## 🛠️ Teknologi yang Digunakan (Tech Stack)

* **Backend Framework:** Laravel 13 (PHP 8.4)
* **Frontend Library:** React 19 & TypeScript
* **Full-Stack Adapter:** Inertia.js v3 (Server-Driven SPA Architecture)
* **Styling & Design System:** Tailwind CSS v4 & Lucide Icons
* **Type-Safe Routing:** Laravel Wayfinder
* **Database Management:** MySQL Relational Database dengan Composite Performance Indexing
* **Testing & Code Quality:** Pest PHP (60 Automated Feature Tests) & Laravel Pint

---

## 📸 Dokumentasi Antarmuka Aplikasi (Screenshots)

Berikut adalah galeri antarmuka sistem PuskeswanApp V.2.0.0 yang disusun berdasarkan alur operasional dan peran pengguna:

---

### 🌐 1. Portal Publik & Edukasi Masyarakat (Landing Page)

Halaman utama yang dapat diakses oleh masyarakat umum untuk melihat profil instansi, mengakses layanan cek rekam medis mandiri, membaca artikel edukasi kesehatan hewan, dan mengetahui jadwal operasional poliklinik.

#### A. Hero Section & Profil Instansi
Tampilan beranda utama dengan sambutan resmi, navigasi utama, serta ringkasan profil UPTD Puskeswan dan IB Kota Pariaman.

<p align="center">
  <img src="screenshot/index/1_hero_section.png" alt="Hero Section Puskeswan Kota Pariaman" width="700" style="border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);" />
</p>

<p align="center">
  <img src="screenshot/index/2_about_section.png" alt="Tentang UPTD Puskeswan dan IB" width="700" style="border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);" />
</p>

#### B. Fitur Cek Mandiri Rekam Medis Pasien
Fitur pencarian mandiri oleh pemilik hewan menggunakan 16 digit NIK dan Nama Lengkap yang dilengkapi kode captcha anti-bot. Menampilkan seluruh riwayat pemeriksaan fisik, diagnosa dokter, dan resep obat yang telah selesai.

<p align="center">
  <img src="screenshot/index/3_cek_section.png" alt="Fitur Cek Mandiri Rekam Medis" width="700" style="border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);" />
</p>

#### C. Portal Artikel Edukasi Kesehatan Hewan & Publikasi Staf Medis
Pusat literasi kesehatan hewan, informasi vaksinasi rabies, serta arsip profil dokter hewan dan tenaga medis penulis artikel.

<p align="center">
  <img src="screenshot/index/4_article_section.png" alt="Daftar Artikel Edukasi Kesehatan Hewan" width="700" style="border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);" />
</p>

<p align="center">
  <img src="screenshot/index/5_staff_section.png" alt="Struktur Staf dan Tenaga Medis Puskeswan" width="700" style="border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);" />
</p>

#### D. Pengelompokan Kategori Edukasi, Arsip Penulis & Informasi Kontak
Arsip artikel yang dikelompokkan berdasarkan kategori topik dan penulis dokter hewan, serta footer informasi alamat dan jam operasional poliklinik.

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

Sistem gerbang masuk petugas yang menerapkan *Two-Tier Rate Limiting*, enkripsi sesi, dan penanganan status HTTP khusus untuk mencegah serangan *brute-force*.

#### A. Form Login & Proteksi Rate Limiting (Tier 1 Cooldown)
Halaman login petugas terpadu dilengkapi indikator penonaktifan tombol sementara (*cooldown*) saat terdeteksi kegagalan login berturut-turut.

<p align="center">
  <img src="screenshot/auth/login_section.png" alt="Form Login Petugas" width="700" style="border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);" />
</p>

<p align="center">
  <img src="screenshot/auth/rate_limiting_section.png" alt="Indikator Cooldown Tombol Login" width="700" style="border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);" />
</p>

#### B. Pemulihan Kata Sandi (Forgot & Reset Password)
Alur pemulihan kata sandi petugas menggunakan pengiriman tautan token verifikasi yang aman ke email terdaftar.

<p align="center">
  <img src="screenshot/auth/forgot_section.png" alt="Form Lupa Kata Sandi" width="700" style="border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);" />
</p>

<p align="center">
  <img src="screenshot/auth/reset_section.png" alt="Form Reset Kata Sandi Baru" width="700" style="border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);" />
</p>

#### C. Halaman Kesalahan & Proteksi Akses (403, 404, 429 IP Blocked)
Desain halaman error responsif yang ramah pengguna, termasuk halaman 429 saat alamat IP penyerang diblokir total (Tier 2).

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

Modul operasional loket pendaftaran pasien, penerbitan nomor antrean, pencatatan surveilans gigitan rabies, dan manajemen riwayat pelayanan klinik.

#### A. Dashboard Operasional Loket Admin
Menampilkan kartu metrik antrean harian, grafik pelayanan rekam medis, grafik tren kasus gigitan rabies, serta daftar kunjungan terkini.

<p align="center">
  <img src="screenshot/admin/1_dashboard.png" alt="Dashboard Loket Admin" width="700" style="border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);" />
</p>

#### B. Pendaftaran Pasien & Manajemen Antrean Poliklinik
Formulir pendaftaran pemilik dan hewan dengan fitur autofill otomatis via NIK, penerbitan nomor RM otomatis, serta tabel antrean pasien hari ini.

<p align="center">
  <img src="screenshot/admin/2_visit_add.png" alt="Formulir Pendaftaran Pasien Baru" width="700" style="border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);" />
</p>

<p align="center">
  <img src="screenshot/admin/3_visit_list.png" alt="Daftar Antrean Pasien Poliklinik Hari Ini" width="700" style="border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);" />
</p>

#### C. Riwayat Rekam Medis Selesai & Surveilans Kasus Gigitan Rabies (GHPR)
Pencatatan kasus gigitan rabies secara rinci (data korban, lokasi gigitan, status VAR, dan status hewan penggigit) serta riwayat rekam medis pasien yang telah selesai diperiksa dokter.

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

Modul khusus dokter pemeriksa untuk memantau antrean pasien yang menunggu, mencatat diagnosa klinis, tindakan medis, dan terapi obat.

#### A. Dashboard Utama Dokter Hewan
Memvisualisasikan tren beban kerja dokter, status antrean prioritas, serta riwayat pasien yang baru saja ditangani.

<p align="center">
  <img src="screenshot/doctor/1_dashboard.png" alt="Dashboard Dokter Hewan" width="700" style="border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);" />
</p>

#### B. Ruang Periksa Antrean & Riwayat Pelayanan Medik Dokter
Tabel antrean pasien yang siap diperiksa dokter dengan pemantauan riwayat medis lampau pasien dan formulir penegakan diagnosa klinis.

<p align="center">
  <img src="screenshot/doctor/2_visit.png" alt="Daftar Antrean Pasien Dokter Hewan" width="700" style="border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);" />
</p>

<p align="center">
  <img src="screenshot/doctor/3_visit_history.png" alt="Riwayat Pemeriksaan dan Diagnosa Dokter" width="700" style="border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);" />
</p>

---

### 👑 5. Modul Super Administrator (Eksekutif & Tata Kelola Data Master)

Modul manajerial tertinggi untuk memantau indikator kinerja klinik secara komprehensif, mengelola akun pengguna, logistik obat, inventaris alat, serta laporan berkala.

#### A. Dashboard Eksekutif Super Administrator
Analisis terpadu 6 bulan terakhir yang mencakup tren kunjungan, persentase penyelesaian pelayanan, distribusi pasien berdasarkan spesies, dan surveilans rabies.

<p align="center">
  <img src="screenshot/super_admin/1_dashboard.png" alt="Dashboard Eksekutif Super Admin" width="700" style="border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);" />
</p>

#### B. Manajemen Akun Pengguna, Staf Medis & Master Jenis Hewan
Pengelolaan hak akses pengguna (Role Management), sinkronisasi profil pegawai/tenaga medis, serta master data jenis hewan ternak dan hewan kesayangan.

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
Monitoring stok obat-obatan dengan status ketersediaan otomatis (Aman, Menipis, Kritis), pencatatan aset inventaris klinik, serta kurasi artikel edukasi masyarakat.

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
Modul rekapitulasi data rekam medis dan kasus rabies periode dinamis yang siap difilter dan diekspor, serta pengaturan profil administrator.

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

Format dokumen resmi siap cetak berstandar kedinasan pemerintah untuk rekam medis pasien hewan dan koordinasi epidemiologi lintas instansi (Dinas Pertanian dan Dinas Kesehatan).

#### A. Dokumen Cetak Rekam Medis Pasien Hewan
Dokumen resmi yang mencantumkan identitas pemilik, spesifikasi pasien hewan, riwayat anamnesa, hasil diagnosa klinis dokter, dan resep terapi obat lengkap dengan tanda tangan dokter hewan pemeriksa.

<p align="center">
  <img src="screenshot/export/2_visit_export.png" alt="Format Cetak Lembar Rekam Medis Pasien" width="700" style="border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);" />
</p>

#### B. Dokumen Cetak Laporan Surveilans Kasus Gigitan Rabies (GHPR)
Format laporan epidemiologi resmi penanganan kasus gigitan HPR yang memuat data korban, lokasi luka gigitan, status vaksinasi VAR, riwayat observasi 14 hari hewan penggigit, serta legalitas pejabat berwenang.

<p align="center">
  <img src="screenshot/export/3_ghpr_export.png" alt="Format Cetak Laporan Surveilans Kasus Rabies" width="700" style="border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);" />
</p>

---

## 🏛️ Informasi Instansi & Layanan

- **Instansi**: UPTD Pusat Kesehatan Hewan (Puskeswan) dan Inseminasi Buatan (IB) Kota Pariaman
- **Dinas Induk**: Dinas Pertanian, Pangan dan Perikanan Kota Pariaman
- **Alamat Kantor**: Jl. Sidi Tukar Arif, Desa Rambai, Kec. Pariaman Selatan, Kota Pariaman, Sumatera Barat 25538
- **Jam Pelayanan Poliklinik**: Senin – Jumat | 08.00 – 15.30 WIB

---

© **PuskeswanApp V.2.0.0** — Sistem Informasi Pelayanan Kesehatan Hewan & Inseminasi Buatan Terpadu Kota Pariaman.
