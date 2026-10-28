import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Button, Dropdown, Modal, Pagination } from '@/components/ui';

interface RabiesCaseItem {
    id: number;
    no_surat: string;
    perihal: string;
    nama_pasien: string;
    nik_pasien: string;
    jenis_kelamin_pasien: string;
    umur_pasien: string | number;
    alamat_pasien: string;
    no_hp_pasien: string;
    lokasi_gigitan: string;
    status_var: string;
    jenis_hewan: string;
    ras_hewan: string;
    status_hewan: string;
    nama_pemilik_hewan: string;
    tgl_kejadian: string;
    raw_tgl_kejadian: string;
    alamat_kejadian: string;
    kronologi: string;
    petugas: string;
}

interface RabiesPageProps {
    cases: {
        data: RabiesCaseItem[];
        links: any[];
        current_page: number;
        last_page: number;
        from: number;
        to: number;
        total: number;
    };
    startDate: string;
    endDate: string;
    summary: {
        total_kasus: number;
        total_var: number;
        total_observasi: number;
        total_mati: number;
        var_coverage_rate: number;
    };
    filters: {
        search?: string;
        tgl_mulai?: string;
        tgl_selesai?: string;
        status_var?: string;
        status_hewan?: string;
    };
}

const STATUS_VAR_OPTIONS: Record<string, string> = {
    '': 'Semua Status VAR',
    'Sudah Diberikan VAR': 'Sudah Diberikan VAR',
    'Belum Diberikan VAR': 'Belum Diberikan VAR',
};

const STATUS_HEWAN_OPTIONS: Record<string, string> = {
    '': 'Semua Kondisi Hewan',
    Observasi: 'Masa Observasi 14 Hari',
    Mati: 'Mati / Positif Rabies',
    Sehat: 'Sehat Bebas Rabies',
    Liar: 'Liar / Tidak Diketahui',
};

/**
 * Format string tanggal ke format formal Indonesia (contoh: "29 Januari 2026")
 */
const formatIndonesianDate = (dateStr?: string): string => {
    if (!dateStr || dateStr === "-") return "-";
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
    let d: Date;
    if (dateStr.includes("/")) {
        const parts = dateStr.split("/");
        d = new Date(
            parseInt(parts[2]),
            parseInt(parts[1]) - 1,
            parseInt(parts[0]),
        );
    } else {
        d = new Date(dateStr);
    }
    if (isNaN(d.getTime())) return dateStr;
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
};

export default function RabiesIndex({
    cases,
    startDate,
    endDate,
    summary,
    filters,
}: RabiesPageProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [tglMulai, setTglMulai] = useState(filters.tgl_mulai || startDate);
    const [tglSelesai, setTglSelesai] = useState(filters.tgl_selesai || endDate);
    const [statusVarFilter, setStatusVarFilter] = useState(filters.status_var || '');
    const [statusHewanFilter, setStatusHewanFilter] = useState(filters.status_hewan || '');

    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [selectedCase, setSelectedCase] = useState<RabiesCaseItem | null>(null);

    const handleApplyFilter = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        router.get(
            '/super/laporan/rabies',
            {
                search: search || undefined,
                tgl_mulai: tglMulai || undefined,
                tgl_selesai: tglSelesai || undefined,
                status_var: statusVarFilter || undefined,
                status_hewan: statusHewanFilter || undefined,
            },
            { preserveState: true, replace: true }
        );
    };

    const handleResetFilter = () => {
        setSearch('');
        setStatusVarFilter('');
        setStatusHewanFilter('');
        router.get(
            '/super/laporan/rabies',
            {
                tgl_mulai: startDate,
                tgl_selesai: endDate,
            },
            { preserveState: true, replace: true }
        );
    };

    const [caseForLetterPrint, setCaseForLetterPrint] = useState<RabiesCaseItem | null>(null);

    const handleViewDetail = (item: RabiesCaseItem) => {
        setSelectedCase(item);
        setDetailModalOpen(true);
    };

    const handlePrintCase = (item: RabiesCaseItem) => {
        setCaseForLetterPrint(item);
        const originalTitle = document.title;
        document.title = "";
        setTimeout(() => {
            window.print();
            setTimeout(() => {
                document.title = originalTitle;
                setCaseForLetterPrint(null);
            }, 800);
        }, 150);
    };

    const handlePrint = () => {
        setCaseForLetterPrint(null);
        window.print();
    };

    return (
        <DashboardLayout title="Laporan Kasus Rabies (GHPR)">
            <Head title="Laporan Kasus Rabies" />

            <style>{`
                @media print {
                    @page {
                        size: A4 portrait;
                        margin: 0 !important;
                    }
                    nav, header, aside, .no-print, button, form, footer {
                        display: none !important;
                    }
                    ${
                        caseForLetterPrint
                            ? `
                        html, body {
                            width: 100% !important;
                            height: 100% !important;
                            margin: 0 !important;
                            padding: 0 !important;
                            background: transparent !important;
                            background-color: #ffffff !important;
                            color: #000000 !important;
                            font-family: 'Times New Roman', Times, serif !important;
                            overflow: hidden !important;
                            -webkit-print-color-adjust: exact !important;
                            print-color-adjust: exact !important;
                        }
                        .print-only, .space-y-4 {
                            display: none !important;
                        }
                        .print-case-only {
                            display: flex !important;
                            flex-direction: column !important;
                            justify-content: space-between !important;
                            width: 210mm !important;
                            max-width: 210mm !important;
                            min-height: 297mm !important;
                            max-height: 297mm !important;
                            height: 297mm !important;
                            padding: 12mm 18mm 10mm 18mm !important;
                            margin: 0 auto !important;
                            box-sizing: border-box !important;
                            background: transparent !important;
                            background-color: #ffffff !important;
                            page-break-after: avoid !important;
                            page-break-before: avoid !important;
                            page-break-inside: avoid !important;
                            overflow: hidden !important;
                        }
                    `
                            : `
                        body {
                            background: white !important;
                            color: black !important;
                            font-size: 9.5pt;
                            padding: 10mm !important;
                        }
                        .print-case-only {
                            display: none !important;
                        }
                        .print-only {
                            display: block !important;
                        }
                        .print-card {
                            box-shadow: none !important;
                            border: none !important;
                            padding: 0 !important;
                        }
                        table {
                            width: 100% !important;
                            border-collapse: collapse !important;
                        }
                        th, td {
                            border: 1px solid #333 !important;
                            padding: 5px 6px !important;
                        }
                    `
                    }
                }
                .print-only, .print-case-only {
                    display: none;
                }
            `}</style>

            {caseForLetterPrint && (
                <div className="print-case-only font-serif text-black leading-snug">
                    <div>
                        <div className="relative pb-1 mb-4">
                            <div className="flex items-center">
                                <img
                                    src="/images/logo-pariaman.webp"
                                    alt="Logo Kota Pariaman"
                                    className="absolute left-0 top-0.5 h-[76px] w-auto object-contain"
                                />
                                <div className="text-center font-serif text-black leading-snug w-full pl-20 pr-4">
                                    <div className="text-[12pt] tracking-wider uppercase font-normal">
                                        PEMERINTAH KOTA PARIAMAN
                                    </div>
                                    <div className="text-[13pt] tracking-wide uppercase font-bold">
                                        DINAS PERTANIAN PANGAN DAN PERIKANAN
                                    </div>
                                    <div className="text-[14.5pt] tracking-wider uppercase font-black">
                                        UPT PUSKESWAN DAN IB
                                    </div>
                                    <div className="text-[10.5pt] font-semibold">
                                        (Pusat Kesehatan Hewan dan Inseminasi Buatan)
                                    </div>
                                    <div className="text-[9.5pt]">
                                        Jl. Sentot Ali Basa Jati Telp. (0751) 93898
                                    </div>
                                    <div className="text-[9pt] flex items-center justify-center gap-6">
                                        <span>
                                            E-Mail :{" "}
                                            <span className="underline">
                                                puskeswanpariaman1@gmail.com
                                            </span>
                                        </span>
                                        <span>Kode Pos : 25516</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-2 border-b-[2.5px] border-black pb-[1.5px]">
                                <div className="border-b border-black" />
                            </div>
                        </div>

                        <div className="grid grid-cols-12 text-[10.5pt] leading-snug mb-3">
                            <div className="col-span-6">
                                <table className="w-full">
                                    <tbody>
                                        <tr>
                                            <td className="w-14 py-0.5">No</td>
                                            <td className="w-4 py-0.5 text-center">:</td>
                                            <td className="py-0.5">
                                                {caseForLetterPrint.no_surat || "524.3/026/Puskeswan-2026"}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="py-0.5">Lamp</td>
                                            <td className="w-4 py-0.5 text-center">:</td>
                                            <td className="py-0.5">
                                                {caseForLetterPrint.perihal || "-"}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="py-0.5 align-top">Hal</td>
                                            <td className="w-4 py-0.5 align-top text-center">:</td>
                                            <td className="py-0.5 align-top font-semibold underline">
                                                Kasus Gigitan HPR
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <div className="col-span-6 pl-10">
                                <div>
                                    Pariaman,{" "}
                                    {formatIndonesianDate(
                                        caseForLetterPrint.raw_tgl_kejadian || caseForLetterPrint.tgl_kejadian,
                                    )}
                                </div>
                                <div className="mt-2.5">
                                    <div>Kepada Yth.</div>
                                    <div>Pimpinan Puskesmas Sikapak</div>
                                    <div>di</div>
                                    <div className="pl-6 underline">Tempat</div>
                                </div>
                            </div>
                        </div>

                        <p className="text-[10.5pt] text-justify indent-10 mb-2 leading-relaxed">
                            Bersama ini disampaikan bahwa terjadi kasus Gigitan oleh{" "}
                            {(caseForLetterPrint.jenis_hewan || "hewan").toLowerCase()}{" "}
                            terhadap korban sebagai berikut:
                        </p>

                        <div className="mb-3 text-[10.5pt]">
                            <table className="w-full leading-snug">
                                <tbody>
                                    <tr>
                                        <td className="w-36 py-0.5">Nama</td>
                                        <td className="w-4 py-0.5 text-center">:</td>
                                        <td className="py-0.5 font-bold uppercase">{caseForLetterPrint.nama_pasien}</td>
                                    </tr>
                                    <tr>
                                        <td className="py-0.5">Umur</td>
                                        <td className="w-4 py-0.5 text-center">:</td>
                                        <td className="py-0.5">{caseForLetterPrint.umur_pasien}</td>
                                    </tr>
                                    <tr>
                                        <td className="py-0.5">Jenis kelamin</td>
                                        <td className="w-4 py-0.5 text-center">:</td>
                                        <td className="py-0.5">{caseForLetterPrint.jenis_kelamin_pasien}</td>
                                    </tr>
                                    <tr>
                                        <td className="py-0.5 align-top">Alamat</td>
                                        <td className="w-4 py-0.5 align-top text-center">:</td>
                                        <td className="py-0.5 align-top">{caseForLetterPrint.alamat_pasien}</td>
                                    </tr>
                                    <tr>
                                        <td className="py-0.5">Tanggal digigit</td>
                                        <td className="w-4 py-0.5 text-center">:</td>
                                        <td className="py-0.5">
                                            {formatIndonesianDate(
                                                caseForLetterPrint.raw_tgl_kejadian || caseForLetterPrint.tgl_kejadian,
                                            )}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="py-0.5">Lokasi Gigitan</td>
                                        <td className="w-4 py-0.5 text-center">:</td>
                                        <td className="py-0.5">{caseForLetterPrint.lokasi_gigitan}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div className="mb-3 text-[10.5pt]">
                            <div className="font-semibold underline mb-1">Signalement</div>
                            <div>
                                <table className="w-full leading-snug">
                                    <tbody>
                                        <tr>
                                            <td className="w-36 py-0.5">Jenis hewan</td>
                                            <td className="w-4 py-0.5 text-center">:</td>
                                            <td className="py-0.5">{caseForLetterPrint.jenis_hewan}</td>
                                        </tr>
                                        <tr>
                                            <td className="py-0.5">Ras</td>
                                            <td className="w-4 py-0.5 text-center">:</td>
                                            <td className="py-0.5">{caseForLetterPrint.ras_hewan || "-"}</td>
                                        </tr>
                                        <tr>
                                            <td className="py-0.5">Jenis kelamin</td>
                                            <td className="w-4 py-0.5 text-center">:</td>
                                            <td className="py-0.5">{caseForLetterPrint.jenis_kelamin_pasien || "-"}</td>
                                        </tr>
                                        <tr>
                                            <td className="py-0.5">Umur</td>
                                            <td className="w-4 py-0.5 text-center">:</td>
                                            <td className="py-0.5">{caseForLetterPrint.umur_pasien || "-"}</td>
                                        </tr>
                                        <tr>
                                            <td className="py-0.5">Nama Pemilik</td>
                                            <td className="w-4 py-0.5 text-center">:</td>
                                            <td className="py-0.5">{caseForLetterPrint.nama_pemilik_hewan || "-"}</td>
                                        </tr>
                                        <tr>
                                            <td className="py-0.5 align-top">Alamat Kejadian</td>
                                            <td className="w-4 py-0.5 align-top text-center">:</td>
                                            <td className="py-0.5 align-top">{caseForLetterPrint.alamat_kejadian}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="mb-2 text-[10.5pt]">
                            <div className="font-semibold underline mb-1">Anamnese :</div>
                            <p className="text-justify leading-relaxed whitespace-pre-wrap">
                                {caseForLetterPrint.kronologi || "-"}
                            </p>
                        </div>
                    </div>

                    <div className="mt-auto pt-4">
                        <div className="flex justify-end mb-4">
                            <div className="text-center text-[10.5pt] leading-tight min-w-[270px]">
                                <p>A.n Kepala UPTD. Puskeswan dan IB</p>
                                <p>Kota Pariaman</p>
                                <div className="h-20" />
                                <p className="font-bold underline">drh. Reni Gusnita</p>
                                <p>NIP. 19860826 201903 2 002</p>
                            </div>
                        </div>

                        <div className="text-[9pt] leading-snug">
                            <p>Tembusan disampaikan kepada Yth.</p>
                            <p>1. Kepala Dinas Kesehatan Kota Pariaman</p>
                            <p>2. Arsip</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="print-only mb-6 pb-2">
                <div className="relative flex items-center border-b-[2.5px] border-black pb-2">
                    <img
                        src="/images/logo-pariaman.webp"
                        alt="Logo Kota Pariaman"
                        className="absolute left-0 top-1 h-16 w-auto object-contain"
                    />
                    <div className="text-center font-serif text-black leading-tight w-full pl-16 pr-4">
                        <div className="text-xs uppercase tracking-wider font-normal">
                            PEMERINTAH KOTA PARIAMAN
                        </div>
                        <div className="text-sm uppercase tracking-wide font-bold">
                            DINAS PERTANIAN PANGAN DAN PERIKANAN
                        </div>
                        <div className="text-base uppercase tracking-wider font-black">
                            UPT PUSKESWAN DAN IB
                        </div>
                        <div className="text-[10px] font-semibold">
                            (Pusat Kesehatan Hewan dan Inseminasi Buatan)
                        </div>
                        <div className="text-[9px] mt-0.5">
                            Jl. Sentot Ali Basa Jati Telp. (0751) 93898 | E-Mail: puskeswanpariaman1@gmail.com | Kode Pos: 25516
                        </div>
                    </div>
                </div>
                <div className="mt-3 text-center">
                    <h4 className="text-sm font-bold uppercase text-gray-900 tracking-wide underline">
                        LAPORAN SURVEILANS EPIDEMIOLOGI KASUS GIGITAN HEWAN PENULAR RABIES (GHPR)
                    </h4>
                    <p className="text-xs text-gray-600 mt-0.5">
                        Periode Kejadian: {startDate} s/d {endDate}
                    </p>
                </div>
            </div>

            <div className="space-y-4 max-w-[1600px] mx-auto">
                <div className="no-print grid grid-cols-2 lg:grid-cols-4 gap-3.5">
                    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-xs flex items-center justify-between">
                        <div>
                            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
                                Total Kasus GHPR
                            </span>
                            <span className="text-2xl font-black text-rose-600 mt-1 block">
                                {summary.total_kasus}
                            </span>
                            <span className="text-[11px] text-rose-600 font-semibold mt-0.5 block">
                                Gigitan terlaporkan periode ini
                            </span>
                        </div>
                        <div className="h-10 w-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-xs flex items-center justify-between">
                        <div>
                            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
                                Pasien Diberi VAR
                            </span>
                            <span className="text-2xl font-black text-emerald-600 mt-1 block">
                                {summary.total_var}
                            </span>
                            <span className="text-[11px] text-emerald-600 font-semibold mt-0.5 block">
                                {summary.var_coverage_rate}% Cakupan Vaksin Anti-Rabies
                            </span>
                        </div>
                        <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-xs flex items-center justify-between">
                        <div>
                            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
                                Dalam Observasi
                            </span>
                            <span className="text-2xl font-black text-amber-600 mt-1 block">
                                {summary.total_observasi}
                            </span>
                            <span className="text-[11px] text-amber-600 font-semibold mt-0.5 block">
                                Karantina pengamatan 14 hari
                            </span>
                        </div>
                        <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        </div>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-xs flex items-center justify-between">
                        <div>
                            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
                                Hewan Mati / Positif
                            </span>
                            <span className="text-2xl font-black text-rose-700 mt-1 block">
                                {summary.total_mati}
                            </span>
                            <span className="text-[11px] text-rose-700 font-semibold mt-0.5 block">
                                Tindakan eliminasi / nekropsi
                            </span>
                        </div>
                        <div className="h-10 w-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white shadow-xs overflow-hidden">
                    <div className="no-print p-3 border-b border-gray-200 bg-white">
                        <form onSubmit={handleApplyFilter} className="flex flex-col gap-3">
                            <div className="flex flex-col lg:flex-row gap-2.5 items-stretch lg:items-center justify-between">
                                <div className="relative flex-1">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                            />
                                        </svg>
                                    </span>
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Cari No. Surat, nama korban/pasien, NIK, alamat kejadian, atau kronologi..."
                                        className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50/50 pl-9 pr-3 text-sm text-gray-800 placeholder:text-gray-400 transition-all focus:border-purple-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                                    />
                                </div>

                                <button
                                    type="button"
                                    onClick={handlePrint}
                                    className="h-10 px-4 rounded-lg bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-xs transition-colors shrink-0"
                                >
                                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                                        />
                                    </svg>
                                    <span>Cetak Laporan / PDF</span>
                                </button>
                            </div>

                            <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2.5 pt-2 border-t border-gray-100">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-semibold text-gray-500 whitespace-nowrap">Periode:</span>
                                    <input
                                        type="date"
                                        value={tglMulai}
                                        onChange={(e) => setTglMulai(e.target.value)}
                                        className="h-10 px-3 rounded-lg border border-gray-200 bg-white text-xs text-gray-700 transition-all focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                                    />
                                    <span className="text-xs text-gray-400">s/d</span>
                                    <input
                                        type="date"
                                        value={tglSelesai}
                                        onChange={(e) => setTglSelesai(e.target.value)}
                                        className="h-10 px-3 rounded-lg border border-gray-200 bg-white text-xs text-gray-700 transition-all focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                                    />
                                </div>

                                <div className="w-full sm:w-[200px]">
                                    <Dropdown size="md" matchWidth>
                                        <Dropdown.Trigger>
                                            <button
                                                type="button"
                                                className="flex h-10 w-full items-center justify-between gap-2 rounded-lg border border-gray-200 bg-white px-3 text-xs font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-1 focus:ring-purple-500"
                                            >
                                                <span className="truncate">
                                                    {STATUS_VAR_OPTIONS[statusVarFilter] || 'Semua Status VAR'}
                                                </span>
                                                <svg className="h-4 w-4 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 9-7 7-7-7" />
                                                </svg>
                                            </button>
                                        </Dropdown.Trigger>
                                        <Dropdown.Content align="left" matchWidth className="py-1">
                                            {Object.entries(STATUS_VAR_OPTIONS).map(([val, label]) => (
                                                <Dropdown.Item
                                                    key={val}
                                                    onClick={() => {
                                                        setStatusVarFilter(val);
                                                        router.get(
                                                            '/super/laporan/rabies',
                                                            {
                                                                search: search || undefined,
                                                                tgl_mulai: tglMulai || undefined,
                                                                tgl_selesai: tglSelesai || undefined,
                                                                status_var: val || undefined,
                                                                status_hewan: statusHewanFilter || undefined,
                                                            },
                                                            { preserveState: true, replace: true }
                                                        );
                                                    }}
                                                    className={`px-3 py-2 text-xs transition-colors ${
                                                        statusVarFilter === val
                                                            ? 'bg-purple-50 font-semibold text-purple-700'
                                                            : 'text-gray-700 hover:bg-gray-50'
                                                    }`}
                                                >
                                                    {label}
                                                </Dropdown.Item>
                                            ))}
                                        </Dropdown.Content>
                                    </Dropdown>
                                </div>

                                <div className="w-full sm:w-[220px]">
                                    <Dropdown size="md" matchWidth>
                                        <Dropdown.Trigger>
                                            <button
                                                type="button"
                                                className="flex h-10 w-full items-center justify-between gap-2 rounded-lg border border-gray-200 bg-white px-3 text-xs font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-1 focus:ring-purple-500"
                                            >
                                                <span className="truncate">
                                                    {STATUS_HEWAN_OPTIONS[statusHewanFilter] || 'Semua Kondisi Hewan'}
                                                </span>
                                                <svg className="h-4 w-4 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 9-7 7-7-7" />
                                                </svg>
                                            </button>
                                        </Dropdown.Trigger>
                                        <Dropdown.Content align="left" matchWidth className="py-1">
                                            {Object.entries(STATUS_HEWAN_OPTIONS).map(([val, label]) => (
                                                <Dropdown.Item
                                                    key={val}
                                                    onClick={() => {
                                                        setStatusHewanFilter(val);
                                                        router.get(
                                                            '/super/laporan/rabies',
                                                            {
                                                                search: search || undefined,
                                                                tgl_mulai: tglMulai || undefined,
                                                                tgl_selesai: tglSelesai || undefined,
                                                                status_var: statusVarFilter || undefined,
                                                                status_hewan: val || undefined,
                                                            },
                                                            { preserveState: true, replace: true }
                                                        );
                                                    }}
                                                    className={`px-3 py-2 text-xs transition-colors ${
                                                        statusHewanFilter === val
                                                            ? 'bg-purple-50 font-semibold text-purple-700'
                                                            : 'text-gray-700 hover:bg-gray-50'
                                                    }`}
                                                >
                                                    {label}
                                                </Dropdown.Item>
                                            ))}
                                        </Dropdown.Content>
                                    </Dropdown>
                                </div>

                                <div className="flex items-center gap-2 ml-auto">
                                    <button
                                        type="submit"
                                        className="h-10 px-4 rounded-lg bg-gray-900 hover:bg-gray-800 text-white font-medium text-xs shadow-xs transition-colors"
                                    >
                                        Cari
                                    </button>
                                    {(search || statusVarFilter || statusHewanFilter || tglMulai !== startDate || tglSelesai !== endDate) && (
                                        <button
                                            type="button"
                                            onClick={handleResetFilter}
                                            className="h-10 px-3 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 font-medium text-xs transition-colors"
                                        >
                                            Reset Filter
                                        </button>
                                    )}
                                </div>
                            </div>
                        </form>
                    </div>

                    <div className="overflow-x-auto min-h-[335px]">
                        <table className="w-full text-left text-xs border-collapse border border-gray-200">
                            <thead>
                                <tr className="bg-gray-100/90 border-b border-gray-200 text-[11px] font-bold uppercase tracking-wider text-gray-700">
                                    <th className="py-3 px-3.5 border-r border-gray-200 text-center font-bold w-12 shrink-0">No</th>
                                    <th className="py-3 px-3.5 border-r border-gray-200 text-center font-bold">No. Surat</th>
                                    <th className="py-3 px-3.5 border-r border-gray-200 text-center font-bold">Nama Korban</th>
                                    <th className="py-3 px-3.5 border-r border-gray-200 text-center font-bold">Lokasi &amp; Kejadian</th>
                                    <th className="py-3 px-3.5 border-r border-gray-200 text-center font-bold">Hewan Penular</th>
                                    <th className="py-3 px-3.5 border-r border-gray-200 text-center font-bold">Status Hewan</th>
                                    <th className="py-3 px-3.5 border-r border-gray-200 text-center font-bold">Status VAR</th>
                                    <th className="py-3 px-3.5 text-center font-bold w-36 shrink-0 no-print">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {cases.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="text-center py-16 text-gray-500">
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="h-12 w-12 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 mb-2">
                                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                    </svg>
                                                </div>
                                                <p className="font-semibold text-gray-700 text-sm">
                                                    Tidak ada data surveilans kasus rabies ditemukan
                                                </p>
                                                <p className="text-xs text-gray-400 mt-0.5">
                                                    Coba sesuaikan kata kunci pencarian atau rentang tanggal.
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    <>
                                        {cases.data.map((c, index) => (
                                            <tr
                                                key={c.id}
                                                className="odd:bg-white even:bg-gray-50/70 hover:bg-purple-50/40 transition-colors h-[58px]"
                                            >
                                                <td className="py-3 px-3.5 border-r border-gray-200 text-center font-medium text-gray-600">
                                                    {cases.from ? cases.from + index : index + 1}
                                                </td>

                                                <td className="py-3 px-3.5 border-r border-gray-200">
                                                    <div className="font-mono font-bold text-purple-700">
                                                        {c.no_surat}
                                                    </div>

                                                </td>

                                                <td className="py-3 px-3.5 border-r border-gray-200">
                                                    <div className="font-semibold text-gray-900 text-sm break-words">
                                                        {c.nama_pasien}
                                                    </div>

                                                </td>

                                                <td className="py-3 px-3.5 border-r border-gray-200 max-w-xs">
                                                    <div className="font-semibold text-gray-900 break-words leading-snug">
                                                        {c.lokasi_gigitan}
                                                    </div>
                                                </td>

                                                <td className="py-3 px-3.5 border-r border-gray-200">
                                                    <div className="font-semibold text-gray-800 break-words">
                                                        {c.jenis_hewan}
                                                    </div>
                                                </td>

                                                <td className="py-3 px-3.5 border-r border-gray-200">
                                                    {c.status_hewan.toLowerCase().includes('observasi') ? (
                                                        <span className="text-xs font-semibold text-amber-600">
                                                            Observasi
                                                        </span>
                                                    ) : c.status_hewan.toLowerCase().includes('mati') ? (
                                                        <span className="text-xs font-semibold text-rose-600">
                                                            Mati / Positif
                                                        </span>
                                                    ) : c.status_hewan.toLowerCase().includes('sehat') ? (
                                                        <span className="text-xs font-semibold text-emerald-600">
                                                            Sehat Bebas
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs font-medium text-gray-700">
                                                            {c.status_hewan}
                                                        </span>
                                                    )}
                                                </td>

                                                <td className="py-3 px-3.5 border-r border-gray-200">
                                                    {c.status_var.toLowerCase().includes('diberikan') ||
                                                    c.status_var.toLowerCase().includes('sudah') ||
                                                    c.status_var.toLowerCase().includes('lengkap') ? (
                                                        <span className="text-xs font-semibold text-emerald-600">
                                                            Diberikan VAR
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs font-semibold text-rose-600">
                                                            Belum VAR
                                                        </span>
                                                    )}
                                                </td>

                                                <td className="py-3 px-3.5 text-center no-print">
                                                    <div className="flex items-center justify-center gap-1.5">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleViewDetail(c)}
                                                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-purple-200 bg-purple-50/50 hover:bg-purple-100 text-purple-700 font-medium text-xs transition-colors"
                                                            title="Lihat Rincian Investigasi"
                                                        >
                                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                            </svg>
                                                            <span>Rincian</span>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handlePrintCase(c)}
                                                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-rose-200 bg-rose-50/60 hover:bg-rose-100 text-rose-700 font-medium text-xs transition-colors"
                                                            title="Cetak Surat Kasus Gigitan Rabies (PDF)"
                                                        >
                                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                                            </svg>
                                                            <span>Surat</span>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {cases.data.length > 0 && cases.data.length < 5 &&
                                            Array.from({ length: 5 - cases.data.length }).map((_, idx) => (
                                                <tr
                                                    key={`empty-${idx}`}
                                                    aria-hidden="true"
                                                    className="odd:bg-white even:bg-gray-50/70 h-[58px]"
                                                >
                                                    <td className="py-3 px-3.5 border-r border-gray-200 text-center">&nbsp;</td>
                                                    <td className="py-3 px-3.5 border-r border-gray-200">&nbsp;</td>
                                                    <td className="py-3 px-3.5 border-r border-gray-200">&nbsp;</td>
                                                    <td className="py-3 px-3.5 border-r border-gray-200">&nbsp;</td>
                                                    <td className="py-3 px-3.5 border-r border-gray-200">&nbsp;</td>
                                                    <td className="py-3 px-3.5 border-r border-gray-200">&nbsp;</td>
                                                    <td className="py-3 px-3.5 border-r border-gray-200">&nbsp;</td>
                                                    <td className="py-3 px-3.5 text-center no-print">&nbsp;</td>
                                                </tr>
                                            ))}
                                    </>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex flex-col gap-3 border-t border-gray-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between bg-gray-50/30 no-print">
                        <p className="text-xs text-gray-500 font-medium">
                            Menampilkan{' '}
                            <span className="font-bold text-gray-800">{cases.from || 0}</span>{' '}
                            hingga{' '}
                            <span className="font-bold text-gray-800">{cases.to || 0}</span>{' '}
                            dari total{' '}
                            <span className="font-bold text-gray-800">{cases.total}</span> kasus gigitan.
                        </p>
                        <Pagination
                            links={cases.links}
                            currentPage={cases.current_page}
                            totalPages={cases.last_page}
                        />
                    </div>
                </div>

                <div className="print-only mt-10 pt-4 flex justify-end">
                    <div className="text-center w-64">
                        <p className="text-xs text-gray-700">Dikeluarkan di: Pariaman</p>
                        <p className="text-xs text-gray-700 mt-0.5">
                            Tanggal: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                        <p className="text-xs font-bold text-gray-900 mt-3">A.n Kepala UPTD. Puskeswan dan IB</p>
                        <p className="text-xs text-gray-700">Kota Pariaman</p>
                        <div className="h-16" />
                        <p className="text-xs font-bold text-gray-900 underline">drh. Reni Gusnita</p>
                        <p className="text-[10px] text-gray-600">NIP. 19860826 201903 2 002</p>
                    </div>
                </div>
            </div>

            <Modal
                isOpen={detailModalOpen}
                onClose={() => setDetailModalOpen(false)}
                title={
                    selectedCase
                        ? `Rincian Investigasi Kasus: ${selectedCase.no_surat}`
                        : 'Rincian Kasus Rabies'
                }
                size="xl"
            >
                {selectedCase && (
                    <div className="space-y-4 text-xs">
                        <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-rose-50/70 border border-rose-100">
                            <div>
                                <span className="text-gray-500 block text-[11px]">No. Surat &amp; Tanggal Kejadian:</span>
                                <span className="font-bold text-gray-900 text-sm">
                                    {selectedCase.no_surat} &bull; {selectedCase.tgl_kejadian}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="inline-block px-2.5 py-0.5 rounded-full font-bold text-[11px] bg-rose-100 text-rose-800">
                                    {selectedCase.status_hewan}
                                </span>
                                <span className="inline-block px-2.5 py-0.5 rounded-full font-bold text-[11px] bg-emerald-100 text-emerald-800">
                                    {selectedCase.status_var}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                            <div className="rounded-xl border border-gray-200 bg-white p-3.5 space-y-2">
                                <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wide border-b border-gray-100 pb-1.5 flex items-center gap-1.5 text-purple-700">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    Identitas Korban / Pasien
                                </h4>
                                <div className="space-y-1.5">
                                    <div>
                                        <span className="text-gray-400 block text-[10px]">Nama Lengkap Pasien</span>
                                        <span className="font-bold text-gray-900 text-sm">{selectedCase.nama_pasien}</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <span className="text-gray-400 block text-[10px]">NIK Pasien</span>
                                            <span className="font-mono font-medium text-gray-800">{selectedCase.nik_pasien}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-400 block text-[10px]">Umur / Jenis Kelamin</span>
                                            <span className="font-medium text-gray-800">
                                                {selectedCase.umur_pasien} Thn / {selectedCase.jenis_kelamin_pasien}
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-gray-400 block text-[10px]">No. Telepon / WhatsApp</span>
                                        <span className="font-medium text-gray-800">{selectedCase.no_hp_pasien}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-400 block text-[10px]">Alamat Domisili Pasien</span>
                                        <span className="font-medium text-gray-800">{selectedCase.alamat_pasien}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-xl border border-gray-200 bg-white p-3.5 space-y-2">
                                <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wide border-b border-gray-100 pb-1.5 flex items-center gap-1.5 text-amber-700">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                                    </svg>
                                    Hewan Penular Rabies (HPR)
                                </h4>
                                <div className="space-y-1.5">
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <span className="text-gray-400 block text-[10px]">Spesies Hewan</span>
                                            <span className="font-bold text-gray-900">{selectedCase.jenis_hewan}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-400 block text-[10px]">Ras Hewan</span>
                                            <span className="font-medium text-gray-800">{selectedCase.ras_hewan}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-gray-400 block text-[10px]">Nama Pemilik Hewan</span>
                                        <span className="font-medium text-gray-800">{selectedCase.nama_pemilik_hewan}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-400 block text-[10px]">Status Observasi Hewan</span>
                                        <span className="font-semibold text-rose-700">{selectedCase.status_hewan}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-3.5 space-y-2">
                            <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wide border-b border-gray-200 pb-1.5 flex items-center gap-1.5 text-rose-700">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                Kronologi &amp; Luka Gigitan
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="p-2.5 rounded-lg bg-white border border-gray-200">
                                    <span className="text-gray-400 block text-[10px] font-semibold">Lokasi Gigitan pada Tubuh</span>
                                    <span className="font-bold text-sm text-gray-900 mt-0.5 block">{selectedCase.lokasi_gigitan}</span>
                                </div>
                                <div className="p-2.5 rounded-lg bg-white border border-gray-200">
                                    <span className="text-gray-400 block text-[10px] font-semibold">Tempat / Alamat Kejadian</span>
                                    <span className="font-medium text-xs text-gray-800 mt-0.5 block">{selectedCase.alamat_kejadian}</span>
                                </div>
                            </div>
                            <div className="p-2.5 rounded-lg bg-white border border-gray-200">
                                <span className="text-gray-400 block text-[10px] font-semibold mb-0.5">Kronologi Lengkap Kejadian Gigitan</span>
                                <p className="text-gray-800 leading-relaxed whitespace-pre-line">{selectedCase.kronologi}</p>
                            </div>
                        </div>

                        <div className="rounded-xl border border-gray-200 bg-white p-3.5 space-y-2">
                            <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wide border-b border-gray-100 pb-1.5 flex items-center gap-1.5 text-emerald-700">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Tindakan Medis &amp; Petugas Investigasi
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="p-2.5 rounded-lg bg-emerald-50/50 border border-emerald-100">
                                    <span className="text-emerald-800 block text-[10px] font-bold uppercase tracking-wider">
                                        Pemberian Vaksin Anti-Rabies (VAR)
                                    </span>
                                    <p className="text-gray-900 font-semibold mt-0.5">{selectedCase.status_var}</p>
                                </div>
                                <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-200">
                                    <span className="text-gray-600 block text-[10px] font-bold uppercase tracking-wider">
                                        Petugas Surveilans / Pelapor
                                    </span>
                                    <p className="text-gray-900 font-medium mt-0.5">{selectedCase.petugas}</p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-2 flex justify-end gap-2 border-t border-gray-100">
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => setDetailModalOpen(false)}
                            >
                                Tutup
                            </Button>
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={() => handlePrintCase(selectedCase)}
                                className="bg-rose-600 hover:bg-rose-700 text-white"
                                leftIcon={
                                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                    </svg>
                                }
                            >
                                Cetak Surat Kasus (PDF)
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </DashboardLayout>
    );
}

