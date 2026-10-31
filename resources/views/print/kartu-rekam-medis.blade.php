<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>KARTU REKAM MEDIS - {{ $visit->animal?->no_rm ?? '-' }}</title>
    <link rel="icon" type="image/png" href="/images/logo_puskeswan.webp">
    <link rel="shortcut icon" type="image/png" href="/images/logo_puskeswan.webp">
    <link rel="apple-touch-icon" href="/images/logo_puskeswan.webp">
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
            margin: 0;
            padding: 0;
            background-color: #ffffff;
            color: #000000;
            font-family: 'Times New Roman', Times, serif;
            font-size: 9.5pt;
            line-height: 1.3;
        }
        @media screen {
            html, body {
                background-color: #f3f4f6;
            }
        }
        .no-print {
            background-color: #1e1b4b;
            color: #ffffff;
            padding: 10px 20px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            box-shadow: 0 2px 4px rgba(0,0,0,0.15);
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 13px;
        }
        .no-print .btn {
            background-color: #7c3aed;
            color: #ffffff;
            border: none;
            padding: 6px 14px;
            border-radius: 6px;
            font-weight: 600;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 6px;
            text-decoration: none;
            font-size: 13px;
        }
        .no-print .btn:hover {
            background-color: #6d28d9;
        }
        .no-print .btn-close {
            background-color: #4b5563;
        }
        .no-print .btn-close:hover {
            background-color: #374151;
        }
        .sheet {
            width: 210mm;
            min-height: 297mm;
            margin: 15px auto;
            background: #ffffff;
            padding: 12mm 15mm 15mm 15mm;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            box-sizing: border-box;
        }
        @media print {
            @page {
                size: A4 portrait;
                margin: 0 !important;
            }
            .no-print {
                display: none !important;
            }
            html, body {
                background: #ffffff !important;
                background-color: #ffffff !important;
                padding: 0 !important;
                margin: 0 !important;
                width: 100% !important;
                height: 100% !important;
            }
            .sheet {
                background: #ffffff !important;
                background-color: #ffffff !important;
                width: 100% !important;
                min-height: 100% !important;
                padding: 10mm 15mm 12mm 15mm !important;
                margin: 0 !important;
                box-shadow: none !important;
            }
            th {
                background-color: #ffffff !important;
            }
        }
        table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
            font-size: 9pt;
            margin-top: 8px;
            margin-bottom: 8px;
        }
        th, td {
            border: 1px solid #000000;
            padding: 4px 4px;
            vertical-align: top;
            word-break: break-word;
        }
        th {
            background-color: #ffffff;
            font-weight: bold;
            text-align: center;
            text-transform: uppercase;
        }
        tr {
            page-break-inside: avoid;
            break-inside: avoid;
        }
        thead {
            display: table-header-group;
        }
    </style>
</head>
<body>
    <div class="no-print">
        <div style="display: flex; align-items: center; gap: 15px;">
            <strong style="color: #a78bfa;">Kartu Rekam Medis Pasien</strong>
            <span style="color: #cbd5e1;">|</span>
            <span>Pasien: <strong>{{ $visit->animal?->nama_hewan ?? '-' }}</strong> (No. RM: <strong>{{ $visit->animal?->no_rm ?? '-' }}</strong>)</span>
        </div>
        <div style="display: flex; gap: 10px;">
            <button class="btn" onclick="window.print()">
                <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Cetak / Simpan PDF
            </button>
            <button class="btn btn-close" onclick="window.close()">Tutup</button>
        </div>
    </div>

    <div class="sheet">
        <!-- Kop Surat Resmi Puskeswan dan IB -->
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
                <span style="font-size: 11.5pt; font-weight: 900; font-family: monospace;">{{ $visit->animal?->no_rm ?? '-' }}</span>
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
                        {{ $visit->animal?->pemilik?->nama_lengkap ?? 'Umum' }}
                    </span>
                </div>
                <div style="display: flex; align-items: flex-start;">
                    <span style="width: 60px; font-weight: 600; flex-shrink: 0; padding-top: 1px;">Alamat</span>
                    <span style="margin-right: 6px; padding-top: 1px;">:</span>
                    <div style="flex: 1; min-height: 16px; line-height: 1.25; border-bottom: 1px dotted #555; padding: 0 4px; word-break: break-word;">
                        {{ $visit->animal?->pemilik?->alamat_lengkap ?? '-' }}
                    </div>
                </div>
                <div style="display: flex; align-items: baseline;">
                    <span style="width: 60px; font-weight: 600; flex-shrink: 0;">No. HP</span>
                    <span style="margin-right: 6px;">:</span>
                    <span style="flex: 1; border-bottom: 1px dotted #555; font-family: monospace; padding: 0 4px;">
                        {{ $visit->animal?->pemilik?->no_hp_wa ?? '-' }}
                    </span>
                </div>
            </div>

            <!-- Kolom Kanan: Pasien Hewan -->
            <div style="display: flex; flex-direction: column; gap: 4px;">
                <div style="display: flex; align-items: baseline;">
                    <span style="width: 90px; font-weight: 600; flex-shrink: 0;">Jenis Hewan</span>
                    <span style="margin-right: 6px;">:</span>
                    <span style="flex: 1; border-bottom: 1px dotted #555; font-weight: bold; padding: 0 4px;">
                        {{ $visit->animal?->jenisHewan?->nama_jenis ?? '-' }}
                    </span>
                </div>
                <div style="display: flex; align-items: baseline;">
                    <span style="width: 90px; font-weight: 600; flex-shrink: 0;">Nama Hewan</span>
                    <span style="margin-right: 6px;">:</span>
                    <span style="flex: 1; border-bottom: 1px dotted #555; font-weight: bold; padding: 0 4px;">
                        {{ $visit->animal?->nama_hewan ?? 'Hewan Pasien' }}
                    </span>
                </div>
                <div style="display: flex; align-items: baseline;">
                    <span style="width: 90px; font-weight: 600; flex-shrink: 0;">Sex/Umur/Warna</span>
                    <span style="margin-right: 6px;">:</span>
                    <span style="flex: 1; border-bottom: 1px dotted #555; padding: 0 4px;">
                        {{ $visit->animal?->jenis_kelamin ?? '-' }} / {{ $visit->animal?->umur ?? '-' }} / {{ $visit->animal?->warna_hewan ?? '-' }}
                    </span>
                </div>
            </div>
        </div>

        <!-- Tabel Rekam Medis Pasien -->
        <table>
            <thead>
                <tr>
                    <th style="width: 5%;">NO</th>
                    <th style="width: 13%;">TANGGAL</th>
                    <th style="width: 14%;">BB/SUHU</th>
                    <th style="width: 23%;">ANAMNESA</th>
                    <th style="width: 22%;">DIAGNOSA</th>
                    <th style="width: 23%;">TERAPI PENGOBATAN</th>
                </tr>
            </thead>
            <tbody>
                @foreach($allVisits as $index => $item)
                    <tr>
                        <td style="text-align: center; font-weight: bold;">{{ $index + 1 }}</td>
                        <td style="text-align: center; white-space: nowrap;">
                            {{ $item->tgl_kunjungan ? \Carbon\Carbon::parse($item->tgl_kunjungan)->format('d/m/Y') : '-' }}
                        </td>
                        <td style="text-align: center; white-space: nowrap;">
                            {{ $item->berat_badan ? $item->berat_badan.' kg' : '-' }}<br>
                            {{ $item->suhu_tubuh ? $item->suhu_tubuh.' °C' : '-' }}
                        </td>
                        <td style="line-height: 1.25;">{{ $item->anamnesa ?: '-' }}</td>
                        <td style="font-weight: 500; line-height: 1.25;">{{ $item->examination?->diagnosa ?? '-' }}</td>
                        <td style="white-space: pre-line; line-height: 1.25;">{{ trim($item->examination?->terapi_pengobatan ?? '-') }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>

        <!-- Tanda Tangan Resmi Atas Nama Kepala UPTD Puskeswan dan IB Kota Pariaman -->
        <div style="margin-top: 18px; display: flex; justify-content: flex-end; page-break-inside: avoid;">
            <div style="width: 270px; text-align: center; font-size: 9.5pt;">
                <div style="margin-bottom: 2px;">
                    Pariaman, {{ $signatureDate }}
                </div>
                <div style="font-weight: 600; line-height: 1.2;">
                    A.n Kepala UPTD Puskeswan dan IB
                </div>
                <div style="font-weight: 600; line-height: 1.2;">
                    Kota Pariaman
                </div>

                <!-- Ruang Tanda Tangan & Cap -->
                <div style="height: 48px;"></div>

                @php
                    $namaPimpinan = !empty($pimpinan?->nama_staf) ? $pimpinan->nama_staf : 'Penanggung Jawab';
                    $nipPimpinan = !empty($pimpinan?->nip_strv) ? $pimpinan->nip_strv : null;
                @endphp

                <div style="font-weight: bold; text-decoration: underline; font-size: 10pt;">
                    {{ $namaPimpinan }}
                </div>
                @if($nipPimpinan)
                    <div style="font-size: 9pt; margin-top: 1px;">
                        {{ $nipPimpinan }}
                    </div>
                @endif
            </div>
        </div>
    </div>

    <script>
        window.onbeforeprint = function() {
            window._savedTitle = document.title;
            document.title = "";
        };
        window.onafterprint = function() {
            if (window._savedTitle) {
                document.title = window._savedTitle;
            }
        };

        if (new URLSearchParams(window.location.search).get('autoprint') === '1') {
            window.onload = function() {
                setTimeout(function() {
                    window.print();
                }, 300);
            };
        }
    </script>
</body>
</html>

