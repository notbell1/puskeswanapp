# PuskeswanApp Versi ke 2

**PuskeswanApp Versi ke 2** adalah platform transformasi digital pelayanan kesehatan hewan, manajemen rekam medis veteriner, surveilans zoonosis, dan pusat edukasi masyarakat yang dikembangkan untuk mendukung operasional **UPTD Pusat Kesehatan Hewan (Puskeswan) dan Inseminasi Buatan (IB) Kota Pariaman**, di bawah naungan Dinas Pertanian, Pangan dan Perikanan Kota Pariaman.

---

## Tentang Puskeswan & Inseminasi Buatan (IB)

**Pusat Kesehatan Hewan (Puskeswan)** merupakan unit pelaksana teknis daerah di bidang kesehatan hewan yang menyelenggarakan pelayanan medik veteriner secara langsung kepada masyarakat dan peternak. Keberadaan Puskeswan berperan sebagai garda terdepan dalam menjaga kesehatan hewan kesayangan, meningkatkan produktivitas ternak rakyat, melindungi masyarakat dari ancaman penyakit menular asal hewan (*zoonosis*), serta menjamin keamanan pangan asal hewan.

Melalui integrasi unit **Inseminasi Buatan (IB)**, Puskeswan juga menjalankan fungsi strategis dalam peningkatan mutu genetik dan populasi ternak ruminansia (sapi potong dan kerbau) guna mendukung ketahanan pangan daerah.

---

## Tugas Pokok & Fungsi Puskeswan

1. **Pelayanan Medik Veteriner & Poliklinik Hewan**
   Menyelenggarakan pemeriksaan fisik klinis, penegakan diagnosis, pengobatan kuratif, pemberian multivitamin dan antiparasit, sterilisasi (*ovariohisterektomi* & *kastrasi*), hingga tindakan bedah minor bagi hewan kesayangan maupun ternak masyarakat.

2. **Pencegahan & Pengendalian Penyakit Hewan Menular Strategis (PHMS) & Zoonosis**
   Melaksanakan program vaksinasi massal dan rutin—khususnya **Vaksinasi Rabies** pada Hewan Penular Rabies (HPR) seperti anjing, kucing, kera, dan musang, serta vaksinasi penyakit ternak dan unggas (*Septicaemia Epizootica*, *Newcastle Disease*, dan *Avian Influenza*).

3. **Surveilans & Respon Kasus Gigitan HPR (Rabies)**
   Melakukan pencatatan epidemiologi kasus gigitan hewan penular rabies, pengamanan hewan penggigit, serta pelaksanaan prosedur observasi klinis selama 14 hari secara terkoordinasi dengan pendekatan *One Health*.

4. **Pelayanan Inseminasi Buatan (IB) & Kesehatan Reproduksi Ternak**
   Memberikan layanan kawin suntik menggunakan semen beku pejantan unggul bersertifikat, Pemeriksaan Kebuntingan (PKB), penanganan gangguan reproduksi (*repeat breeder*, *anestrus*, *distokia*, dan *prolapsus*), serta pendampingan kelahiran pedet.

5. **Kesehatan Masyarakat Veteriner (Kesmavet)**
   Melaksanakan pengawasan higiene sanitasi dan pemeriksaan *antemortem* maupun *postmortem* pada hewan kurban serta produk pangan asal hewan agar memenuhi kriteria **ASUH** (*Aman, Sehat, Utuh, dan Halal*), termasuk pelayanan pemeriksaan klinis untuk penerbitan Surat Keterangan Kesehatan Hewan (SKKH).

6. **Pelayanan Kesehatan Hewan Keliling & Penyuluhan Lapangan**
   Menjangkau kelompok tani ternak di desa dan nagari melalui layanan pengobatan massal, biosekuriti penyemprotan desinfektan kandang, serta edukasi manajemen pakan ternak.

---

## Kegunaan & Manfaat PuskeswanApp Versi ke 2

Hadirnya **PuskeswanApp Versi ke 2** dirancang untuk memodernisasi tata kelola pelayanan veteriner yang sebelumnya bersifat manual menjadi terintegrasi, cepat, dan transparan:

- **Akses Cek Rekam Medis Secara Mandiri oleh Masyarakat**: Pemilik hewan kesayangan dan peternak dapat memeriksa riwayat kunjungan, hasil pemeriksaan fisik (suhu tubuh, berat badan, anamnesis), diagnosis dokter hewan, terapi obat yang diberikan, serta mencetak ringkasan rekam medis resmi menggunakan Nomor Rekam Medis (No. RM).
- **Portal Berita & Edukasi Kesehatan Hewan**: Menyajikan artikel edukasi terverifikasi yang ditulis oleh dokter hewan dan tenaga medis Puskeswan, dilengkapi pengelompokan kategori topik serta arsip publikasi per penulis.
- **Integrasi Alur Pelayanan Poliklinik (Loket Administrasi ke Dokter Hewan)**: Mempercepat proses pendaftaran pemilik dan pasien hewan, pengelolaan antrian kunjungan harian, hingga pencatatan pemeriksaan medis oleh dokter hewan secara *real-time*.
- **Pencatatan & Pemantauan Kasus Gigitan Rabies**: Memudahkan pemantauan masa observasi 14 hari pada hewan penggigit, status vaksinasi hewan, tingkat risiko luka gigitan, serta rekapitulasi kasus berbasis kecamatan.
- **Manajemen Logistik Obat, Vaksin, Straw IB & Inventaris Alat Medis**: Memantau ketersediaan stok obat-obatan, dosis vaksin, straw semen beku, serta kondisi peralatan medis dan lapangan dengan indikator status ketersediaan otomatis.
- **Pelaporan Eksekutif & Statistik Pelayanan**: Menyediakan visualisasi data tren kunjungan pasien, distribusi spesies hewan, kinerja pemeriksaan medis, dan laporan bulanan/tahunan yang siap dicetak.

---

## Teknologi yang Digunakan (Tech Stack)

**PuskeswanApp Versi ke 2** dibangun menggunakan arsitektur aplikasi web modern (*Single-Page Application* berbasis *Server-Driven UI*) dengan fokus pada kecepatan, keamanan, dan kenyamanan antarmuka pengguna:

- **Backend Framework**: Laravel 12 (PHP)
- **Full-Stack Adapter**: Inertia.js
- **Frontend Library**: React 19 & TypeScript
- **Styling & UI Design**: Tailwind CSS v4 dengan sistem desain responsif dan aksesibel
- **Database Management**: MySQL / MariaDB Relational Database
- **Keamanan & Autentikasi**:
  - Multi-Role Access Control (*Super Administrator*, *Dokter Hewan / Medik Veteriner*, dan *Petugas Administrasi & Rekam Medis*)
  - WebAuthn / Passkey Biometric Authentication (Login tanpa kata sandi menggunakan sidik jari/wajah perangkat)
  - Proteksi Rate-Limiting, Enkripsi Sesi, dan Validasi Keamanan Berlapis

---

## Informasi Instansi & Layanan

- **Instansi**: UPTD Puskeswan dan Inseminasi Buatan (IB) Kota Pariaman
- **Dinas Induk**: Dinas Pertanian, Pangan dan Perikanan Kota Pariaman
- **Lokasi Pelayanan**: Jl. Sidi Tukar Arif, Desa Rambai, Kec. Pariaman Selatan, Kota Pariaman, Sumatera Barat 25538
- **Jam Operasional Klinik**: Senin – Jumat | 08.00 – 15.30 WIB

---

© **PuskeswanApp Versi ke 2** — Sistem Informasi Pelayanan Kesehatan Hewan & Inseminasi Buatan Terpadu Kota Pariaman.
