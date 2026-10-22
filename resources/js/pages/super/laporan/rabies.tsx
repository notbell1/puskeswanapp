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

    const handleViewDetail = (item: RabiesCaseItem) => {
        setSelectedCase(item);
        setDetailModalOpen(true);
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <DashboardLayout title="Laporan Kasus Rabies (GHPR)">
            <Head title="Laporan Kasus Rabies" />

            <style>{`
                @media print {
                    nav, header, aside, .no-print, button, form {
                        display: none !important;
                    }
                    body {
                        background: white !important;
                        color: black !important;
                        font-size: 9.5pt;
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
                }
                .print-only {
                    display: none;
                }
            `}</style>

            <div className="print-only mb-6 border-b-2 border-gray-900 pb-3 text-center">
                <h3 className="text-base font-bold uppercase tracking-wider text-gray-900">
                    Pemerintah Kabupaten / Kota
                </h3>
                <h2 className="text-lg font-black uppercase text-gray-900 tracking-wide">
                    Pusat Kesehatan Hewan (PUSKESWAN) Inseminasi Buatan
                </h2>
                <p className="text-xs text-gray-600 mt-1">
                    Jl. Raya Peternakan No. 12, Wilayah Pelayanan Terpadu Keswan &amp; Kesmavet | Telp: (021) 8899-7711
                </p>
                <div className="mt-4 pt-2 border-t border-gray-400">
                    <h4 className="text-sm font-bold uppercase text-gray-800">
                        LAPORAN SURVEILANS EPIDEMIOLOGI KASUS GIGITAN HEWAN PENULAR RABIES (GHPR)
                    </h4>
                    <p className="text-xs text-gray-600">
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
                                    <th className="py-3 px-3.5 border-r border-gray-200 text-center w-12 shrink-0">No.</th>
                                    <th className="py-3 px-3.5 border-r border-gray-200">No. Surat &amp; Tanggal</th>
                                    <th className="py-3 px-3.5 border-r border-gray-200">Data Korban / Pasien</th>
                                    <th className="py-3 px-3.5 border-r border-gray-200">Lokasi &amp; Kejadian</th>
                                    <th className="py-3 px-3.5 border-r border-gray-200">Hewan Penular</th>
                                    <th className="py-3 px-3.5 border-r border-gray-200">Status Hewan</th>
                                    <th className="py-3 px-3.5 border-r border-gray-200">Status VAR</th>
                                    <th className="py-3 px-3.5 text-center w-28 shrink-0 no-print">Aksi</th>
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
                                                    <div className="text-[11px] text-gray-500 mt-0.5">
                                                        {c.tgl_kejadian}
                                                    </div>
                                                </td>

                                                <td className="py-3 px-3.5 border-r border-gray-200">
                                                    <div className="font-semibold text-gray-900 text-sm break-words">
                                                        {c.nama_pasien}
                                                    </div>
                                                    <div className="text-[11px] text-gray-500 mt-0.5 flex flex-wrap items-center gap-1.5">
                                                        <span>{c.jenis_kelamin_pasien}</span>
                                                        <span>&bull;</span>
                                                        <span>{c.umur_pasien} Thn</span>
                                                        <span>&bull;</span>
                                                        <span className="font-mono text-gray-600">{c.nik_pasien}</span>
                                                    </div>
                                                </td>

                                                <td className="py-3 px-3.5 border-r border-gray-200 max-w-xs">
                                                    <div className="font-semibold text-gray-900 break-words leading-snug">
                                                        {c.lokasi_gigitan}
                                                    </div>
                                                    <div className="text-[11px] text-gray-500 break-words leading-relaxed mt-1">
                                                        {c.alamat_kejadian}
                                                    </div>
                                                </td>

                                                <td className="py-3 px-3.5 border-r border-gray-200">
                                                    <div className="font-semibold text-gray-800 break-words">
                                                        {c.jenis_hewan}
                                                    </div>
                                                    <div className="text-[11px] text-gray-500 mt-0.5">
                                                        Pemilik: {c.nama_pemilik_hewan}
                                                    </div>
                                                </td>

                                                <td className="py-3 px-3.5 border-r border-gray-200">
                                                    {c.status_hewan.toLowerCase().includes('observasi') ? (
                                                        <span className="inline-block px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-amber-50 text-amber-700 border border-amber-200">
                                                            Observasi
                                                        </span>
                                                    ) : c.status_hewan.toLowerCase().includes('mati') ? (
                                                        <span className="inline-block px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-rose-50 text-rose-700 border border-rose-200">
                                                            Mati / Positif
                                                        </span>
                                                    ) : c.status_hewan.toLowerCase().includes('sehat') ? (
                                                        <span className="inline-block px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                            Sehat Bebas
                                                        </span>
                                                    ) : (
                                                        <span className="inline-block px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-gray-100 text-gray-700 border border-gray-200">
                                                            {c.status_hewan}
                                                        </span>
                                                    )}
                                                </td>

                                                <td className="py-3 px-3.5 border-r border-gray-200">
                                                    {c.status_var.toLowerCase().includes('diberikan') ||
                                                    c.status_var.toLowerCase().includes('sudah') ||
                                                    c.status_var.toLowerCase().includes('lengkap') ? (
                                                        <span className="inline-block px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                            Diberikan VAR
                                                        </span>
                                                    ) : (
                                                        <span className="inline-block px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-rose-50 text-rose-700 border border-rose-200">
                                                            Belum VAR
                                                        </span>
                                                    )}
                                                </td>

                                                <td className="py-3 px-3.5 text-center no-print">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleViewDetail(c)}
                                                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-purple-200 bg-purple-50/50 hover:bg-purple-100 text-purple-700 font-medium text-xs transition-colors"
                                                        title="Lihat Rincian Investigasi"
                                                    >
                                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                        <span>Rincian</span>
                                                    </button>
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
                        <p className="text-xs text-gray-700">Dikeluarkan di: Puskeswan Terpadu</p>
                        <p className="text-xs text-gray-700 mt-0.5">
                            Tanggal: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                        <p className="text-xs font-bold text-gray-900 mt-3">Mengetahui,</p>
                        <p className="text-xs text-gray-700">Kepala UPTD Puskeswan</p>
                        <div className="h-16" />
                        <p className="text-xs font-bold text-gray-900 underline">( .................................................... )</p>
                        <p className="text-[10px] text-gray-600">NIP. ....................................................</p>
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
                        </div>
                    </div>
                )}
            </Modal>
        </DashboardLayout>
    );
}

