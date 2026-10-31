/**
 * Utilitas Pencetakan Kartu Rekam Medis Pasien Hewan (Standar Format A4 Dinas)
 * UPTD Puskeswan & Inseminasi Buatan Kota Pariaman
 */

export interface PrintableMedicalRecord {
    id?: number;
    no_rm: string;
    nama_hewan: string;
    jenis_hewan: string;
    jenis_kelamin: string;
    umur: string;
    warna_hewan: string;
    pemilik: string;
    nik_pemilik?: string;
    no_hp: string;
    alamat_pemilik: string;
    tgl_kunjungan?: string;
    raw_tgl_kunjungan?: string;
    berat_badan: number;
    suhu_tubuh: number;
    anamnesa: string;
    diagnosa: string;
    terapi_pengobatan: string;
    catatan?: string;
    dokter?: string;
    dokter_nama?: string;
    pimpinan_nama?: string;
    pimpinan_nip?: string;
    historical_records?: Array<{
        id: number;
        tgl_kunjungan: string;
        berat_badan: number;
        suhu_tubuh: number;
        anamnesa: string;
        diagnosa: string;
        terapi_pengobatan: string;
        catatan?: string;
        dokter: string;
    }>;
}

/**
 * Normalisasi gelar dokter agar tidak terjadi duplikasi seperti "drh. drh."
 */
export function formatDoctorName(rawName?: string | null): string {
    if (!rawName || rawName === "-" || !rawName.trim()) {
        return "drh. Tim Medis Puskeswan";
    }
    let clean = rawName.trim();
    clean = clean.replace(/^(drh\.\s*)+/gi, "");
    return `drh. ${clean}`;
}

/**
 * Mengambil format tanggal saja tanpa jam/waktu (contoh: 21/10/2026)
 */
export function formatDateOnly(val?: string | null): string {
    if (!val || val === "-") return "-";
    const firstPart = val.trim().split(" ")[0];
    if (firstPart.includes("/")) {
        return firstPart;
    }
    if (firstPart.includes("-")) {
        const parts = firstPart.split("-");
        if (parts.length === 3 && parts[0].length === 4) {
            return `${parts[2]}/${parts[1]}/${parts[0]}`;
        }
    }
    return firstPart;
}

/**
 * Format tanggal Indonesia lengkap untuk tanda tangan (contoh: 21 Oktober 2026)
 */
export function formatIndonesianDate(val?: string | Date | null): string {
    const months = [
        "Januari",
        "Februari",
        "Maret",
        "April",
        "Mei",
        "Juni",
        "Juli",
        "Agustus",
        "September",
        "Oktober",
        "November",
        "Desember",
    ];

    if (val instanceof Date) {
        return `${val.getDate()} ${months[val.getMonth()]} ${val.getFullYear()}`;
    }

    if (typeof val === "string" && val.trim() && val !== "-") {
        // Cek format dd/mm/yyyy
        if (val.includes("/")) {
            const parts = val.split(" ")[0].split("/");
            if (parts.length === 3) {
                const day = parseInt(parts[0], 10);
                const month = parseInt(parts[1], 10) - 1;
                const year = parseInt(parts[2], 10);
                if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
                    return `${day} ${months[month] || ""} ${year}`;
                }
            }
        }
        // Cek format yyyy-mm-dd
        if (val.includes("-")) {
            const parts = val.split(" ")[0].split("-");
            if (parts.length === 3 && parts[0].length === 4) {
                const year = parseInt(parts[0], 10);
                const month = parseInt(parts[1], 10) - 1;
                const day = parseInt(parts[2], 10);
                if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
                    return `${day} ${months[month] || ""} ${year}`;
                }
            }
        }
    }

    const now = new Date();
    return `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
}

/**
 * Menghasilkan markup HTML mandiri untuk dokumen cetak A4 resmi
 */
export function generateMedicalCardHtml(
    record: PrintableMedicalRecord,
): string {
    // 1. Kumpulkan seluruh kunjungan (kunjungan terdahulu + kunjungan saat ini)
    const pastVisits = (record.historical_records || []).map((h) => ({
        id: h.id,
        tgl_kunjungan: h.tgl_kunjungan,
        berat_badan: h.berat_badan,
        suhu_tubuh: h.suhu_tubuh,
        anamnesa: h.anamnesa,
        diagnosa: h.diagnosa,
        terapi_pengobatan: h.terapi_pengobatan,
    }));

    const currentVisit = {
        id: record.id || 999999,
        tgl_kunjungan: record.tgl_kunjungan || "-",
        berat_badan: record.berat_badan,
        suhu_tubuh: record.suhu_tubuh,
        anamnesa: record.anamnesa,
        diagnosa: record.diagnosa,
        terapi_pengobatan: record.terapi_pengobatan,
    };

    // Gabung dan urutkan kronologis dari kunjungan pertama s/d terakhir
    const allVisits = [
        ...pastVisits.filter((p) => p.id !== currentVisit.id),
        currentVisit,
    ];
    allVisits.sort((a, b) => (a.id || 0) - (b.id || 0));

    const signatureDate = formatIndonesianDate(new Date()); // Tanggal cetak adalah tanggal saat itu juga

    // Baris tabel kunjungan (NO, Tanggal, BB/Suhu, Anamnesa, Diagnosa, Terapi Pengobatan)
    const rowsHtml = allVisits
        .map(
            (item, idx) => `
        <tr style="vertical-align: top;">
            <td style="border: 1px solid #000; padding: 4px 3px; text-align: center; font-weight: bold; width: 5%;">${idx + 1}</td>
            <td style="border: 1px solid #000; padding: 4px 3px; text-align: center; white-space: nowrap; width: 13%;">${formatDateOnly(item.tgl_kunjungan)}</td>
            <td style="border: 1px solid #000; padding: 4px 3px; text-align: center; white-space: nowrap; width: 14%;">${item.berat_badan} kg<br>${item.suhu_tubuh}&deg;C</td>
            <td style="border: 1px solid #000; padding: 4px 5px; line-height: 1.25; width: 23%; word-break: break-word;">${(item.anamnesa || "-").trim()}</td>
            <td style="border: 1px solid #000; padding: 4px 5px; font-weight: 500; line-height: 1.25; width: 22%; word-break: break-word;">${(item.diagnosa || "-").trim()}</td>
            <td style="border: 1px solid #000; padding: 4px 5px; white-space: pre-line; line-height: 1.25; width: 23%; word-break: break-word;">${(item.terapi_pengobatan || "-").trim()}</td>
        </tr>
    `,
        )
        .join("");

    return `<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <title>Kartu Rekam Medis - ${record.no_rm}</title>
    <style>
        @page {
            size: A4 portrait;
            margin: 0 !important;
        }
        *, *::before, *::after {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
        }
        html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff;
            color: #000000;
            font-family: "Times New Roman", Times, serif;
            font-size: 10pt;
            line-height: 1.3;
        }
        .print-page {
            box-sizing: border-box;
            width: 100%;
            margin: 0 auto;
            background: #ffffff;
        }
        .content-wrapper {
            width: 100%;
        }
        .signature-section {
            margin-top: 18px !important;
            display: flex;
            justify-content: flex-end;
            break-inside: avoid !important;
            page-break-inside: avoid !important;
        }
        table {
            border-collapse: collapse;
            width: 100%;
            table-layout: fixed;
            page-break-inside: auto;
        }
        thead {
            display: table-header-group;
        }
        tr {
            page-break-inside: avoid;
            break-inside: avoid;
        }
        @media screen {
            body {
                background: #f3f4f6;
                padding: 16px 0;
            }
            .print-page {
                max-width: 210mm;
                padding: 10mm 15mm 15mm 15mm;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            }
        }
        @media print {
            @page {
                size: A4 portrait;
                margin: 0 !important;
            }
            html, body {
                background: #ffffff !important;
                background-color: #ffffff !important;
                padding: 0 !important;
                margin: 0 !important;
                width: 100% !important;
                height: 100% !important;
            }
            .print-page {
                background: #ffffff !important;
                background-color: #ffffff !important;
                width: 100% !important;
                min-height: 100% !important;
                padding: 10mm 15mm 12mm 15mm !important;
                margin: 0 !important;
                box-shadow: none !important;
            }
        }
    </style>
</head>
<body>
    <div class="print-page">
        <div class="content-wrapper">
            <!-- Kop Surat Puskeswan Resmi (Logo Pariaman & Logo PDHI Proporsional) -->
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; padding-bottom: 2px;">
            <div style="width: 80px; text-align: center; flex-shrink: 0; display: flex; align-items: center; justify-content: center;">
                <img src="/images/logo-pariaman.webp" alt="Logo Kota Pariaman" style="height: 64px; width: auto; max-width: 76px; object-fit: contain;" />
            </div>

            <div style="flex: 1; text-align: center;">
                <div style="font-size: 12pt; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; line-height: 1.15;">
                    DINAS PERTANIAN PANGAN DAN PERIKANAN
                </div>
                <div style="font-size: 13pt; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px; line-height: 1.15; margin-top: 2px;">
                    UPT. PUSKESWAN &amp; INSEMINASI BUATAN
                </div>
                <div style="font-size: 9pt; font-weight: 500; line-height: 1.15; margin-top: 2px;">
                    JL. SENTOT ALI BASA JATI MUDIK PARIAMAN TENGAH
                </div>
                <div style="font-size: 9.5pt; font-weight: 700; text-transform: uppercase; line-height: 1.15;">
                    KOTA PARIAMAN
                </div>
                <div style="font-size: 8pt; color: #222; margin-top: 1px;">
                    Email: puskeswanpariaman1@gmail.com | Kode Pos: 25516
                </div>
            </div>

            <div style="width: 80px; text-align: center; flex-shrink: 0; display: flex; align-items: center; justify-content: center;">
                <img src="/images/logo-pdhi.webp" alt="Logo PDHI" style="height: 64px; width: auto; max-width: 76px; object-fit: contain;" />
            </div>
        </div>

        <!-- Garis Ganda Pembatas Kop Surat -->
        <div style="border-bottom: 2.5px solid #000; margin-top: 2px; margin-bottom: 1.5px;"></div>
        <div style="border-bottom: 1px solid #000; margin-bottom: 8px;"></div>

        <!-- Judul Dokumen & No. Rekam Medis -->
        <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 8px;">
            <div style="font-size: 11.5pt; font-weight: bold; text-decoration: underline; text-transform: uppercase; letter-spacing: 0.5px;">
                KARTU REKAM MEDIS PASIEN
            </div>
            <div style="font-size: 11.5pt; font-weight: bold;">
                <span>NO : </span>
                <span style="font-size: 11.5pt; font-weight: 900;">${record.no_rm}</span>
            </div>
        </div>

        <!-- Identitas Pemilik & Pasien Hewan (2 Kolom Bergaris Titik-Titik) -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; column-gap: 24px; font-size: 9.5pt; margin-bottom: 10px;">
            <!-- Kolom Kiri: Pemilik -->
            <div style="display: flex; flex-direction: column; gap: 4px;">
                <div style="display: flex; align-items: baseline;">
                    <span style="width: 60px; font-weight: 600; flex-shrink: 0;">Pemilik</span>
                    <span style="margin-right: 6px;">:</span>
                    <span style="flex: 1; border-bottom: 1px dotted #555; font-weight: bold; padding: 0 4px;">
                        ${record.pemilik}
                    </span>
                </div>
                <!-- Alamat 1 baris memuat seluruh teks (wrap otomatis jika panjang) -->
                <div style="display: flex; align-items: flex-start;">
                    <span style="width: 60px; font-weight: 600; flex-shrink: 0; padding-top: 1px;">Alamat</span>
                    <span style="margin-right: 6px; padding-top: 1px;">:</span>
                    <div style="flex: 1; min-height: 16px; line-height: 1.25; border-bottom: 1px dotted #555; padding: 0 4px; word-break: break-word;">
                        ${record.alamat_pemilik || "-"}
                    </div>
                </div>
                <div style="display: flex; align-items: baseline;">
                    <span style="width: 60px; font-weight: 600; flex-shrink: 0;">No. HP</span>
                    <span style="margin-right: 6px;">:</span>
                    <span style="flex: 1; border-bottom: 1px dotted #555; font-family: monospace; padding: 0 4px;">
                        ${record.no_hp}
                    </span>
                </div>
            </div>

            <!-- Kolom Kanan: Pasien Hewan -->
            <div style="display: flex; flex-direction: column; gap: 4px;">
                <div style="display: flex; align-items: baseline;">
                    <span style="width: 90px; font-weight: 600; flex-shrink: 0;">Jenis Hewan</span>
                    <span style="margin-right: 6px;">:</span>
                    <span style="flex: 1; border-bottom: 1px dotted #555; font-weight: bold; padding: 0 4px;">
                        ${record.jenis_hewan}
                    </span>
                </div>
                <div style="display: flex; align-items: baseline;">
                    <span style="width: 90px; font-weight: 600; flex-shrink: 0;">Nama Hewan</span>
                    <span style="margin-right: 6px;">:</span>
                    <span style="flex: 1; border-bottom: 1px dotted #555; font-weight: bold; padding: 0 4px;">
                        ${record.nama_hewan}
                    </span>
                </div>
                <div style="display: flex; align-items: baseline;">
                    <span style="width: 90px; font-weight: 600; flex-shrink: 0;">Sex/Umur/Warna</span>
                    <span style="margin-right: 6px;">:</span>
                    <span style="flex: 1; border-bottom: 1px dotted #555; padding: 0 4px;">
                        ${record.jenis_kelamin} / ${record.umur} / ${record.warna_hewan}
                    </span>
                </div>
            </div>
        </div>

        <!-- Tabel Rekam Medis (Kolom Proporsional Sesuai Standar Pelayanan) -->
        <table style="width: 100%; border-collapse: collapse; font-size: 9pt; margin-bottom: 8px; table-layout: fixed;">
            <thead>
                <tr style="background-color: #ffffff; text-transform: uppercase; text-align: center; font-weight: bold;">
                    <th style="border: 1px solid #000; padding: 4px 3px; width: 5%;">NO</th>
                    <th style="border: 1px solid #000; padding: 4px 3px; width: 13%;">TANGGAL</th>
                    <th style="border: 1px solid #000; padding: 4px 3px; width: 14%;">BB/SUHU</th>
                    <th style="border: 1px solid #000; padding: 4px 4px; width: 23%;">ANAMNESA</th>
                    <th style="border: 1px solid #000; padding: 4px 4px; width: 22%;">DIAGNOSA</th>
                    <th style="border: 1px solid #000; padding: 4px 4px; width: 23%;">TERAPI PENGOBATAN</th>
                </tr>
            </thead>
            <tbody>
                ${rowsHtml}
            </tbody>
        </table>
        </div>

        <!-- Tanda Tangan Resmi Atas Nama Kepala UPTD Puskeswan dan IB Kota Pariaman (Anchored Konsisten di Bawah) -->
        <div class="signature-section" style="display: flex; justify-content: flex-end; font-size: 9.5pt;">
            <div style="width: 270px; text-align: center;">
                <div style="margin-bottom: 2px;">
                    Pariaman, ${signatureDate}
                </div>
                <div style="font-weight: 600; line-height: 1.2;">
                    A.n Kepala UPTD Puskeswan dan IB
                </div>
                <div style="font-weight: 600; line-height: 1.2;">
                    Kota Pariaman
                </div>

                <!-- Ruang Tanda Tangan & Cap -->
                <div style="height: 42px;"></div>

                <div style="font-weight: bold; text-decoration: underline; font-size: 10.5pt;">
                    ${(record.pimpinan_nama || "").trim() || "Penanggung Jawab"}
                </div>
                ${(record.pimpinan_nip || "").trim() ? `<div style="font-size: 9pt; margin-top: 1px;">${(record.pimpinan_nip || "").trim()}</div>` : ""}
            </div>
        </div>
    </div>
</body>
</html>`;
}

/**
 * Membuka jendela baru / tab baru yang bersih dan langsung memicu cetak
 * tanpa memunculkan toast serta tanpa mencetak footer URL & header browser.
 */
export function printMedicalRecordCard(record: PrintableMedicalRecord): void {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
        alert(
            "Gagal membuka jendela cetak. Pastikan izin pop-up browser aktif.",
        );
        return;
    }

    const html = generateMedicalCardHtml(record);

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.title = "";
    printWindow.document.close();

    const doPrint = () => {
        try {
            printWindow.document.title = "";
            printWindow.focus();
            printWindow.print();
        } catch {
            // Abaikan jika pop-up ditutup pengguna
        }
    };

    if (printWindow.document.readyState === "complete") {
        setTimeout(doPrint, 250);
    } else {
        printWindow.onload = () => {
            setTimeout(doPrint, 250);
        };
    }
}
