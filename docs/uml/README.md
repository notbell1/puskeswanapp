# Dokumentasi Analisis dan Perancangan Sistem Informasi Puskeswan

> Dokumentasi Teknis dan Rekayasa Perangkat Lunak untuk Naskah Skripsi

Sistem Informasi Pusat Kesehatan Hewan (Puskeswan) dirancang untuk mendigitalisasi dan mengoptimalkan layanan operasional klinik hewan—mulai dari pendaftaran pasien, manajemen rekam medis dengan nomor rekam medis permanen, pencatatan klinis harian, hingga pengelolaan pelaporan manajerial oleh Super Admin.

---

## 📋 Daftar Isi

1. [Arsitektur & Aturan Bisnis Utama](#-aturan-bisnis-utama)
2. [Struktur Aktor Sistem](#-struktur-aktor-sistem)
3. [Struktur Basis Data Konseptual (ERD)](#-struktur-basis-data-konseptual-erd)
4. [Daftar Lengkap 15 Diagram UML / Proses Bisnis](#-daftar-lengkap-15-diagram-uml--proses-bisnis)
5. [Struktur Direktori Proyek](#-struktur-direktori-proyek)

---

## 📌 Aturan Bisnis Utama

- **Nomor Rekam Medis (RM) Permanen:**
  Setiap hewan yang terdaftar mendapatkan satu nomor rekam medis unik berformat **`RM0001`** (tanpa komponen tanggal) yang berlaku seumur hidup hewan tersebut.
- **Autofill Berkelanjutan:**
  Pada kunjungan ulang, Admin tidak perlu menginput ulang data pemilik maupun identitas hewan. Cukup mencari berdasarkan **NIK Pemilik** atau **No. RM**, dan sistem secara otomatis melakukan _autofill_ pada data statis tersebut. Admin hanya fokus menginput perubahan data klinis harian.
- **Pemisahan Tugas (Segregation of Duties):**
    - **Admin:** Menginput data identitas (jika baru), melakukan pencarian/autofill, serta mencatat data klinis awal (**Berat Badan**, **Suhu Tubuh**, **Warna**, dan **Anamnesa/Keluhan**).
    - **Dokter:** Memilih kunjungan dari antrean, meninjau riwayat medis, memeriksa hewan secara langsung, serta menginput hasil pemeriksaan medis (**Diagnosa**, **Terapi/Pengobatan**, dan **Notes** opsional) yang otomatis mengubah status kunjungan menjadi **Selesai** di kedua belah pihak.
- **Master Data & Modul Pendukung:**
    - Master Data dibatasi pada **Jenis Hewan** (untuk dropdown pendaftaran) dan **Obat/Bahan Medis**.
    - Dilengkapi modul pendukung untuk Super Admin: _Inventaris_, _Artikel/Berita_ & _Staf_ (untuk halaman publik/guest site), serta _Cetak Laporan PDF Multi-Filter_.

---

## 👥 Struktur Aktor Sistem

1. **Super Admin:** Mengelola akun pengguna (Admin & Dokter), hak akses, master data, inventaris, artikel, data staf, pemantauan sistem, dan cetak laporan PDF multi-filter.
2. **Admin:** Mengelola loket pendaftaran, pencarian data, autofill berkelanjutan, pencatatan klinis awal, dan antrean administrasi.
3. **Dokter:** Mengakses daftar antrean, meninjau riwayat rekam medis, melakukan pemeriksaan klinis, serta mencatat diagnosa dan terapi.
4. **Pasien (Pemilik Hewan):** Aktor eksternal tanpa akses login mandiri; berinteraksi secara langsung melalui petugas Admin dan Dokter di klinik.

---

## 🗄️ Struktur Basis Data Konseptual (ERD)

Sistem dirancang dengan **14 entitas relasional terpadu** sesuai naskah `10-erd.puml`:

1. `roles` (Manajemen level hak akses otorisasi role)
2. `staff` (Data kepegawaian internal dan tenaga staf klinik)
3. `users` (Akun kredensial login Super Admin, Admin, dan Dokter)
4. `passkeys` (Kredensial autentikasi biometrik WebAuthn / FIDO2)
5. `owners` (Data pemilik dengan NIK unik sebagai acuan kunci *autofill*)
6. `animal_types` (Master data jenis hewan untuk seleksi *dropdown*)
7. `animals` (Profil hewan pemegang nomor RM permanen berformat `RM0001`)
8. `visits` (Pencatatan kunjungan harian & klinis awal oleh Admin)
9. `examinations` (Pencatatan diagnosa medis, terapi, dan catatan oleh Dokter)
10. `medicines` (Master katalog farmasi, obat, dan vaksin klinik)
11. `inventories` (Pencatatan logistik dan peralatan aset klinik)
12. `categories` (Kategori pengelompokan artikel dan berita edukasi)
13. `articles` (Publikasi berita dan artikel edukasi pada portal publik/guest site)
14. `rabies_cases` (Surveilans investigasi kasus gigitan hewan penular rabies/GHPR & surat rujukan oleh Admin)

---

## 📊 Daftar Lengkap 15 Diagram UML & Proses Bisnis

Seluruh diagram disimpan dalam format `.puml` (PlantUML) yang disusun secara sistematis dari tingkat makro organisasi hingga infrastruktur fisik server:

### **Bagian 1: Analisis Proses Bisnis (Macro Level)**

- `01-bpmn-sistem-lama.puml` — Alur proses pelayanan manual (sistem lama).
- `02-bpmn-sistem-baru.puml` — Alur proses bisnis setelah aplikasi diterapkan (berbasis sistem).

### **Bagian 2: Analisis Kebutuhan Fungsional (User & Boundary Level)**

- `03-use-case-sistem-lama.puml` — Batas sistem manual.
- `04-use-case-sistem-baru.puml` — Batas sistem dan fungsionalitas aplikasi (_Super Admin, Admin, Dokter, Pasien_).

### **Bagian 3: Pemodelan Proses & Alur Kerja (Process Level)**

- `05-activity-diagram.puml` — Alur aktivitas terpadu (pendaftaran, autofill berkelanjutan, pemeriksaan).
- `06-flowchart-admin.puml` — Prosedur operasional harian khusus **Admin** (Pencarian NIK/RM, Autofill, Klinis Awal, & Kasus Gigitan Rabies GHPR).
- `07-flowchart-dokter.puml` — Prosedur operasional harian khusus **Dokter** (Antrean, Tinjau Riwayat, Diagnosa, Terapi).
- `08-flowchart-super-admin.puml` — Prosedur operasional manajerial khusus **Super Admin** (Akun, Master Data, Inventaris, Laporan Rekam Medis & Rabies).

### **Bagian 4: Perancangan Struktur Data & Objek (Data & Object Level)**

- `09-class-diagram.puml` — Struktur kelas konseptual, atribut, operasi, multiplicity (`RM0001`, _Autofill_, relasi ke Obat & Rabies).
- `10-erd.puml` — Perancangan skema konseptual basis data relasional (14 tabel entitas relasional terpadu beserta PK, FK, & Constraints).

### **Bagian 5: Interaksi Dinamis & Komponen Sistem (Behavioral & Modular Level)**

- `11-sequence-diagram.puml` — Skenario interaksi waktu nyata (Skenario A: Pendaftaran & Autofill; Skenario B: Pemeriksaan & Penyelesaian; Skenario C: Pencatatan Kasus Rabies & Cetak Dokumen).
- `12-component-diagram.puml` — Dekomposisi modul-modul sistem informasi (Pelayanan, Antrean, Pemeriksaan Medis, Surveilans Rabies, Master Data, & Manajerial terhadap 14 tabel database).

### **Bagian 6: Arsitektur Perangkat Lunak & Siklus Transaksi (Software Architecture)**

- `13-state-machine-diagram.puml` — Siklus hidup perubahan status kunjungan/antrean (_Antri_ $\rightarrow$ _Sedang Diperiksa_ $\rightarrow$ _Selesai_).
- `14-package-diagram.puml` — Hierarki struktur paket arsitektur Laravel (Controllers, Inertia.js Vue Pages, Models, & Middleware Auth).

### **Bagian 7: Infrastruktur Fisik Perangkat Keras (Physical Infrastructure Level)**

- `15-deployment-diagram.puml` — Topologi perangkat keras fisik (_Client Browser_, _App Server_, _Database Server_).

---

## 📁 Struktur Direktori Proyek

```text
docs/diagrams/
│
├── README.md
├── 01-bpmn-sistem-lama.puml
├── 02-bpmn-sistem-baru.puml
├── 03-use-case-sistem-lama.puml
├── 04-use-case-sistem-baru.puml
├── 05-activity-diagram.puml
├── 06-flowchart-admin.puml
├── 07-flowchart-dokter.puml
├── 08-flowchart-super-admin.puml
├── 09-class-diagram.puml
├── 10-erd.puml
├── 11-sequence-diagram.puml
├── 12-component-diagram.puml
├── 13-state-machine-diagram.puml
├── 14-package-diagram.puml
└── 15-deployment-diagram.puml
```
