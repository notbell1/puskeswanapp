<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>REKAPITULASI PELAPORAN PENGOBATAN PENYAKIT HEWAN - {{ strtoupper($namaBulan) }} {{ $tahun }}</title>
    <link rel="icon" type="image/png" href="/images/logo_puskeswan.webp">
    <link rel="shortcut icon" type="image/png" href="/images/logo_puskeswan.webp">
    <link rel="apple-touch-icon" href="/images/logo_puskeswan.webp">
    <style>
        @page {
            size: A4 landscape;
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
            font-size: 8pt;
            line-height: 1.15;
        }
        @media screen {
            html, body {
                background-color: #f3f4f6;
            }
        }
        .no-print {
            background-color: #1e1b4b;
            color: #ffffff;
            padding: 8px 18px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            box-shadow: 0 2px 4px rgba(0,0,0,0.15);
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 12px;
        }
        .no-print .btn {
            background-color: #7c3aed;
            color: #ffffff;
            border: none;
            padding: 5px 12px;
            border-radius: 5px;
            font-weight: 600;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 5px;
            text-decoration: none;
            font-size: 12px;
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
            width: 297mm;
            min-height: 210mm;
            margin: 10px auto;
            background: #ffffff;
            padding: 8mm 10mm 10mm 10mm;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            box-sizing: border-box;
        }
        @media print {
            @page {
                size: A4 landscape;
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
                padding: 8mm 10mm 8mm 10mm !important;
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
            font-size: 7.5pt;
            margin-top: 6px;
        }
        th, td {
            border: 1px solid #000000;
            padding: 2.5px 3.5px;
            vertical-align: top;
            word-break: break-word;
        }
        th {
            background-color: #ffffff;
            font-weight: bold;
            text-align: center;
            text-transform: uppercase;
            font-size: 7.5pt;
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
            <strong style="color: #a78bfa;">Laporan Rekapitulasi Pelaporan Pengobatan Hewan</strong>
            <span style="color: #cbd5e1;">|</span>
            <span>Bulan: <strong>{{ $namaBulan }} {{ $tahun }}</strong> ({{ $records->count() }} Data Rekam Medis)</span>
        </div>
        <div style="display: flex; gap: 8px;">
            <button class="btn" onclick="window.print()">
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Cetak / Simpan PDF
            </button>
            <button class="btn btn-close" onclick="window.close()">Tutup</button>
        </div>
    </div>

    <div class="sheet">
        <!-- Header Rekapitulasi Pelaporan Pengobatan Hewan -->
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; padding-bottom: 2px;">
            <div style="width: 60px; text-align: center; flex-shrink: 0; display: flex; align-items: center; justify-content: center;">
                <img src="/images/logo-pariaman.webp" alt="Logo Kota Pariaman" style="height: 48px; width: auto; max-width: 58px; object-fit: contain;" />
            </div>

            <div style="flex: 1; text-align: center;">
                <div style="font-size: 11pt; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px; line-height: 1.25;">
                    REKAPITULASI PELAPORAN PENGOBATAN PENYAKIT HEWAN
                </div>
                <div style="font-size: 10.5pt; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px; line-height: 1.25; margin-top: 1px;">
                    UPT PUSKESWAN DAN IB KOTA PARIAMAN
                </div>
                <div style="font-size: 9pt; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; line-height: 1.25; margin-top: 2px;">
                    BULAN : {{ strtoupper($namaBulan) }} {{ $tahun }}
                </div>
            </div>

            <div style="width: 60px; text-align: center; flex-shrink: 0; display: flex; align-items: center; justify-content: center;">
                <img src="/images/logo-pdhi.webp" alt="Logo PDHI" style="height: 48px; width: auto; max-width: 58px; object-fit: contain;" />
            </div>
        </div>

        <!-- Garis Ganda Pembatas Header -->
        <div style="border-bottom: 2px solid #000; margin-top: 2px; margin-bottom: 1px;"></div>
        <div style="border-bottom: 0.75px solid #000; margin-bottom: 6px;"></div>

        <!-- Tabel Rekapitulasi Format Landscape Padat & Rapi -->
        <table>
            <thead>
                <tr>
                    <th style="width: 3.5%;">NO</th>
                    <th style="width: 7.5%;">TANGGAL</th>
                    <th style="width: 6%;">JUMLAH HEWAN</th>
                    <th style="width: 11%;">SPESIES</th>
                    <th style="width: 23%;">TANDA/ANAMNESA</th>
                    <th style="width: 12%;">NAMA PEMILIK</th>
                    <th style="width: 12%;">ALAMAT</th>
                    <th style="width: 12.5%;">DIAGNOSA</th>
                    <th style="width: 12.5%;">TERAPI</th>
                </tr>
            </thead>
            <tbody>
                @forelse($records as $index => $record)
                    @php
                        // Alamat diambil mulai dari "Kec." saja
                        $rawAlamat = $record->animal?->pemilik?->alamat_lengkap ?? '-';
                        if (preg_match('/(kec(?:amatan)?\.\s*.*)$/i', $rawAlamat, $matches)) {
                            $alamatKec = trim($matches[1]);
                        } else {
                            $alamatKec = $rawAlamat;
                        }

                        // Spesies [norm]: misal Kucing (RM0001) tanpa nama hewan
                        $spesiesText = ($record->animal?->jenisHewan?->nama_jenis ?? 'Hewan') . ' (' . ($record->animal?->no_rm ?? '-') . ')';
                    @endphp
                    <tr>
                        <td style="text-align: center; font-weight: bold;">{{ $index + 1 }}</td>
                        <td style="text-align: center; white-space: nowrap;">
                            {{ $record->tgl_kunjungan ? \Carbon\Carbon::parse($record->tgl_kunjungan)->format('d/m/Y') : '-' }}
                        </td>
                        <td style="text-align: center; font-weight: 600;">1 Ekor</td>
                        <td style="font-weight: 600;">
                            {{ $spesiesText }}
                        </td>
                        <td style="line-height: 1.15;">
                            {{ $record->anamnesa ?: '-' }}
                        </td>
                        <td style="font-weight: 600;">
                            {{ $record->animal?->pemilik?->nama_lengkap ?? 'Umum' }}
                        </td>
                        <td style="line-height: 1.15;">
                            {{ $alamatKec }}
                        </td>
                        <td style="font-weight: 600; line-height: 1.15;">
                            {{ $record->examination?->diagnosa ?? '-' }}
                        </td>
                        <td style="white-space: pre-line; line-height: 1.15;">{{ trim($record->examination?->terapi_pengobatan ?? '-') }}</td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="9" style="text-align: center; padding: 20px; font-style: italic; color: #666;">
                            Tidak ada data rekapitulasi pelayanan pengobatan hewan yang selesai pada bulan {{ $namaBulan }} {{ $tahun }}.
                        </td>
                    </tr>
                @endforelse
            </tbody>
        </table>

        <!-- Ringkasan Singkat & Tanda Tangan Resmi (Padat & Rapi) -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-top: 10px; page-break-inside: avoid;">
            <div style="font-size: 7.5pt; color: #333;">
                <div>Total Pasien Terlayani: <strong>{{ $records->count() }} Ekor</strong></div>
                <div>Status Pelayanan: <strong>Selesai (Tuntas)</strong></div>
            </div>

            <div style="width: 250px; text-align: center; font-size: 8.5pt;">
                <div>Pariaman, {{ $signatureDate }}</div>
                <div style="font-weight: 600; line-height: 1.15;">A.n Kepala UPTD Puskeswan dan IB</div>
                <div style="font-weight: 600; line-height: 1.15;">Kota Pariaman</div>
                <div style="height: 38px;"></div>
                @php
                    $namaPimpinan = !empty($pimpinan?->nama_staf) ? $pimpinan->nama_staf : 'Penanggung Jawab';
                    $nipPimpinan = !empty($pimpinan?->nip_strv) ? $pimpinan->nip_strv : null;
                @endphp
                <div style="font-weight: bold; text-decoration: underline; font-size: 9pt;">{{ $namaPimpinan }}</div>
                @if($nipPimpinan)
                    <div style="font-size: 8pt; margin-top: 0.5px;">{{ $nipPimpinan }}</div>
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
