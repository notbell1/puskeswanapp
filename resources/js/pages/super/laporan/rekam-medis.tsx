import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Button, Dropdown, Modal, Pagination } from '@/components/ui';

interface RecordItem {
    id: number;
    tgl: string;
    raw_tgl: string;
    no_rm: string;
    nama_hewan: string;
    jenis_hewan: string;
    id_jenis_hewan: number | null;
    jenis_kelamin: string;
    umur: string;
    pemilik: string;
    no_hp_pemilik: string;
    alamat_pemilik: string;
    berat_badan: number;
    suhu_tubuh: number;
    anamnesa: string;
    diagnosa: string;
    terapi: string;
    catatan_dokter: string;
    dokter: string;
    admin_loket: string;
    status: string;
}

interface AnimalTypeItem {
    id: number;
    nama_jenis: string;
}

interface RekamMedisPageProps {
    records: {
        data: RecordItem[];
        links: any[];
        current_page: number;
        last_page: number;
        from: number;
        to: number;
        total: number;
    };
    startDate: string;
    endDate: string;
    animalTypes: AnimalTypeItem[];
    summary: {
        total_records: number;
        total_selesai: number;
        total_antri: number;
        completion_rate: number;
    };
    filters: {
        search?: string;
        tgl_mulai?: string;
        tgl_selesai?: string;
        status?: string;
        jenis_hewan?: string;
    };
}

const STATUS_OPTIONS: Record<string, string> = {
    '': 'Semua Status',
    Selesai: 'Selesai',
    'Dalam Antrean': 'Dalam Antrean',
    Pemeriksaan: 'Sedang Diperiksa',
    Batal: 'Dibatalkan',
};

export default function RekamMedisIndex({
    records,
    startDate,
    endDate,
    animalTypes,
    summary,
    filters,
}: RekamMedisPageProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [tglMulai, setTglMulai] = useState(filters.tgl_mulai || startDate);
    const [tglSelesai, setTglSelesai] = useState(filters.tgl_selesai || endDate);
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const [jenisHewanFilter, setJenisHewanFilter] = useState(filters.jenis_hewan || '');

    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<RecordItem | null>(null);

    const handleApplyFilter = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        router.get(
            '/super/laporan/rekam-medis',
            {
                search: search || undefined,
                tgl_mulai: tglMulai || undefined,
                tgl_selesai: tglSelesai || undefined,
                status: statusFilter || undefined,
                jenis_hewan: jenisHewanFilter || undefined,
            },
            { preserveState: true, replace: true }
        );
    };

    const handleResetFilter = () => {
        setSearch('');
        setStatusFilter('');
        setJenisHewanFilter('');
        router.get(
            '/super/laporan/rekam-medis',
            {
                tgl_mulai: startDate,
                tgl_selesai: endDate,
            },
            { preserveState: true, replace: true }
        );
    };

    const handleViewDetail = (item: RecordItem) => {
        setSelectedRecord(item);
        setDetailModalOpen(true);
    };

    const handlePrint = () => {
        window.print();
    };

    const getSelectedJenisName = () => {
        if (!jenisHewanFilter) return 'Semua Jenis Hewan';
        const found = animalTypes.find((t) => String(t.id) === String(jenisHewanFilter));
        return found ? found.nama_jenis : 'Semua Jenis Hewan';
    };

    return (
        <DashboardLayout title="Laporan Rekam Medis Pasien">
            <Head title="Laporan Rekam Medis" />

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
                        LAPORAN REKAPITULASI PELAYANAN &amp; REKAM MEDIS PASIEN
                    </h4>
                    <p className="text-xs text-gray-600">
                        Periode Pelayanan: {startDate} s/d {endDate}
                    </p>
                </div>
            </div>

            <div className="space-y-4 max-w-[1600px] mx-auto">
                <div className="no-print grid grid-cols-2 lg:grid-cols-4 gap-3.5">
                    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-xs flex items-center justify-between">
                        <div>
                            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
                                Total Kunjungan
                            </span>
                            <span className="text-2xl font-black text-gray-900 mt-1 block">
                                {summary.total_records}
                            </span>
                            <span className="text-[11px] text-purple-600 font-semibold mt-0.5 block">
                                Rekam medis periode ini
                            </span>
                        </div>
                        <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-xs flex items-center justify-between">
                        <div>
                            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
                                Pelayanan Selesai
                            </span>
                            <span className="text-2xl font-black text-emerald-600 mt-1 block">
                                {summary.total_selesai}
                            </span>
                            <span className="text-[11px] text-emerald-600 font-semibold mt-0.5 block">
                                Selesai ditangani dokter
                            </span>
                        </div>
                        <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-xs flex items-center justify-between">
                        <div>
                            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
                                Dalam Antrean
                            </span>
                            <span className="text-2xl font-black text-amber-600 mt-1 block">
                                {summary.total_antri}
                            </span>
                            <span className="text-[11px] text-amber-600 font-semibold mt-0.5 block">
                                Menunggu / Diperiksa
                            </span>
                        </div>
                        <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-xs flex items-center justify-between">
                        <div>
                            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
                                Tingkat Selesai
                            </span>
                            <span className="text-2xl font-black text-blue-600 mt-1 block">
                                {summary.completion_rate}%
                            </span>
                            <span className="text-[11px] text-blue-600 font-semibold mt-0.5 block">
                                Rasio efisiensi loket
                            </span>
                        </div>
                        <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
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
                                        placeholder="Cari No. RM, nama hewan, nama pemilik, dokter, atau diagnosa..."
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

                                <div className="w-full sm:w-[180px]">
                                    <Dropdown size="md" matchWidth>
                                        <Dropdown.Trigger>
                                            <button
                                                type="button"
                                                className="flex h-10 w-full items-center justify-between gap-2 rounded-lg border border-gray-200 bg-white px-3 text-xs font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-1 focus:ring-purple-500"
                                            >
                                                <span className="truncate">
                                                    {STATUS_OPTIONS[statusFilter] || 'Semua Status'}
                                                </span>
                                                <svg className="h-4 w-4 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 9-7 7-7-7" />
                                                </svg>
                                            </button>
                                        </Dropdown.Trigger>
                                        <Dropdown.Content align="left" matchWidth className="py-1">
                                            {Object.entries(STATUS_OPTIONS).map(([val, label]) => (
                                                <Dropdown.Item
                                                    key={val}
                                                    onClick={() => {
                                                        setStatusFilter(val);
                                                        router.get(
                                                            '/super/laporan/rekam-medis',
                                                            {
                                                                search: search || undefined,
                                                                tgl_mulai: tglMulai || undefined,
                                                                tgl_selesai: tglSelesai || undefined,
                                                                status: val || undefined,
                                                                jenis_hewan: jenisHewanFilter || undefined,
                                                            },
                                                            { preserveState: true, replace: true }
                                                        );
                                                    }}
                                                    className={`px-3 py-2 text-xs transition-colors ${
                                                        statusFilter === val
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

                                <div className="w-full sm:w-[200px]">
                                    <Dropdown size="md" matchWidth>
                                        <Dropdown.Trigger>
                                            <button
                                                type="button"
                                                className="flex h-10 w-full items-center justify-between gap-2 rounded-lg border border-gray-200 bg-white px-3 text-xs font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-1 focus:ring-purple-500"
                                            >
                                                <span className="truncate">{getSelectedJenisName()}</span>
                                                <svg className="h-4 w-4 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 9-7 7-7-7" />
                                                </svg>
                                            </button>
                                        </Dropdown.Trigger>
                                        <Dropdown.Content align="left" matchWidth className="max-h-60 overflow-y-auto py-1">
                                            <Dropdown.Item
                                                onClick={() => {
                                                    setJenisHewanFilter('');
                                                    router.get(
                                                        '/super/laporan/rekam-medis',
                                                        {
                                                            search: search || undefined,
                                                            tgl_mulai: tglMulai || undefined,
                                                            tgl_selesai: tglSelesai || undefined,
                                                            status: statusFilter || undefined,
                                                            jenis_hewan: undefined,
                                                        },
                                                        { preserveState: true, replace: true }
                                                    );
                                                }}
                                                className={`px-3 py-2 text-xs transition-colors ${
                                                    !jenisHewanFilter
                                                        ? 'bg-purple-50 font-semibold text-purple-700'
                                                        : 'text-gray-700 hover:bg-gray-50'
                                                }`}
                                            >
                                                Semua Jenis Hewan
                                            </Dropdown.Item>
                                            {animalTypes.map((type) => (
                                                <Dropdown.Item
                                                    key={type.id}
                                                    onClick={() => {
                                                        setJenisHewanFilter(String(type.id));
                                                        router.get(
                                                            '/super/laporan/rekam-medis',
                                                            {
                                                                search: search || undefined,
                                                                tgl_mulai: tglMulai || undefined,
                                                                tgl_selesai: tglSelesai || undefined,
                                                                status: statusFilter || undefined,
                                                                jenis_hewan: String(type.id),
                                                            },
                                                            { preserveState: true, replace: true }
                                                        );
                                                    }}
                                                    className={`px-3 py-2 text-xs transition-colors ${
                                                        String(jenisHewanFilter) === String(type.id)
                                                            ? 'bg-purple-50 font-semibold text-purple-700'
                                                            : 'text-gray-700 hover:bg-gray-50'
                                                    }`}
                                                >
                                                    {type.nama_jenis}
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
                                    {(search || statusFilter || jenisHewanFilter || tglMulai !== startDate || tglSelesai !== endDate) && (
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
                                    <th className="py-3 px-3.5 border-r border-gray-200">Waktu &amp; No. RM</th>
                                    <th className="py-3 px-3.5 border-r border-gray-200">Pasien Hewan</th>
                                    <th className="py-3 px-3.5 border-r border-gray-200">Pemilik</th>
                                    <th className="py-3 px-3.5 border-r border-gray-200">Dokter &amp; Status</th>
                                    <th className="py-3 px-3.5 border-r border-gray-200">Diagnosa Klinis &amp; Terapi</th>
                                    <th className="py-3 px-3.5 text-center w-28 shrink-0 no-print">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {records.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="text-center py-16 text-gray-500">
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-2">
                                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                </div>
                                                <p className="font-semibold text-gray-700 text-sm">
                                                    Tidak ada data rekam medis ditemukan
                                                </p>
                                                <p className="text-xs text-gray-400 mt-0.5">
                                                    Coba sesuaikan kata kunci pencarian atau rentang tanggal.
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    <>
                                        {records.data.map((record, index) => (
                                            <tr
                                                key={record.id}
                                                className="odd:bg-white even:bg-gray-50/70 hover:bg-purple-50/40 transition-colors h-[58px]"
                                            >
                                                <td className="py-3 px-3.5 border-r border-gray-200 text-center font-medium text-gray-600">
                                                    {records.from ? records.from + index : index + 1}
                                                </td>

                                                <td className="py-3 px-3.5 border-r border-gray-200">
                                                    <div className="font-mono font-bold text-purple-700">
                                                        {record.no_rm}
                                                    </div>
                                                    <div className="text-[11px] text-gray-500 mt-0.5">
                                                        {record.tgl}
                                                    </div>
                                                </td>

                                                <td className="py-3 px-3.5 border-r border-gray-200">
                                                    <div className="font-semibold text-gray-900 text-sm break-words">
                                                        {record.nama_hewan}
                                                    </div>
                                                    <div className="text-[11px] text-gray-500 mt-0.5 flex flex-wrap items-center gap-1.5">
                                                        <span className="font-medium text-gray-700">{record.jenis_hewan}</span>
                                                        <span>&bull;</span>
                                                        <span>{record.jenis_kelamin}</span>
                                                        {record.umur && <span>({record.umur})</span>}
                                                    </div>
                                                </td>

                                                <td className="py-3 px-3.5 border-r border-gray-200">
                                                    <div className="font-semibold text-gray-900 break-words">
                                                        {record.pemilik}
                                                    </div>
                                                    <div className="text-[11px] text-gray-500 mt-0.5">
                                                        {record.no_hp_pemilik}
                                                    </div>
                                                </td>

                                                <td className="py-3 px-3.5 border-r border-gray-200">
                                                    <div className="text-gray-800 font-medium break-words">
                                                        {record.dokter}
                                                    </div>
                                                    <div className="mt-1">
                                                        {record.status === 'Selesai' ? (
                                                            <span className="inline-block px-2 py-0.5 rounded-full font-bold text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                                Selesai
                                                            </span>
                                                        ) : (
                                                            <span className="inline-block px-2 py-0.5 rounded-full font-bold text-[10px] bg-amber-50 text-amber-700 border border-amber-200">
                                                                {record.status}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>

                                                <td className="py-3 px-3.5 border-r border-gray-200 max-w-xs">
                                                    <div className="font-semibold text-gray-900 break-words leading-snug">
                                                        {record.diagnosa}
                                                    </div>
                                                    <div className="text-[11px] text-gray-500 break-words leading-relaxed mt-1">
                                                        {record.terapi || 'Belum ada resep obat'}
                                                    </div>
                                                </td>

                                                <td className="py-3 px-3.5 text-center no-print">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleViewDetail(record)}
                                                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-purple-200 bg-purple-50/50 hover:bg-purple-100 text-purple-700 font-medium text-xs transition-colors"
                                                        title="Lihat Rincian Rekam Medis"
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
                                        {records.data.length > 0 && records.data.length < 5 &&
                                            Array.from({ length: 5 - records.data.length }).map((_, idx) => (
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
                            <span className="font-bold text-gray-800">{records.from || 0}</span>{' '}
                            hingga{' '}
                            <span className="font-bold text-gray-800">{records.to || 0}</span>{' '}
                            dari total{' '}
                            <span className="font-bold text-gray-800">{records.total}</span> data rekam medis.
                        </p>
                        <Pagination
                            links={records.links}
                            currentPage={records.current_page}
                            totalPages={records.last_page}
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
                    selectedRecord
                        ? `Rincian Rekam Medis: ${selectedRecord.nama_hewan} (${selectedRecord.no_rm})`
                        : 'Rincian Rekam Medis'
                }
                size="xl"
            >
                {selectedRecord && (
                    <div className="space-y-4 text-xs">
                        <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-purple-50/70 border border-purple-100">
                            <div>
                                <span className="text-gray-500 block text-[11px]">Waktu Pemeriksaan:</span>
                                <span className="font-bold text-gray-900 text-sm">{selectedRecord.tgl}</span>
                            </div>
                            <div className="text-right">
                                <span className="text-gray-500 block text-[11px]">Status Kunjungan:</span>
                                <span className="inline-block px-2.5 py-0.5 rounded-full font-bold text-[11px] bg-emerald-100 text-emerald-800">
                                    {selectedRecord.status}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                            <div className="rounded-xl border border-gray-200 bg-white p-3.5 space-y-2">
                                <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wide border-b border-gray-100 pb-1.5 flex items-center gap-1.5 text-purple-700">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                                    </svg>
                                    Identitas Pasien Hewan
                                </h4>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <span className="text-gray-400 block text-[10px]">No. RM</span>
                                        <span className="font-mono font-bold text-gray-900">{selectedRecord.no_rm}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-400 block text-[10px]">Nama Hewan</span>
                                        <span className="font-bold text-gray-900">{selectedRecord.nama_hewan}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-400 block text-[10px]">Jenis &amp; Ras</span>
                                        <span className="font-medium text-gray-800">{selectedRecord.jenis_hewan}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-400 block text-[10px]">Jenis Kelamin / Umur</span>
                                        <span className="font-medium text-gray-800">
                                            {selectedRecord.jenis_kelamin} / {selectedRecord.umur}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-xl border border-gray-200 bg-white p-3.5 space-y-2">
                                <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wide border-b border-gray-100 pb-1.5 flex items-center gap-1.5 text-blue-700">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    Data Pemilik
                                </h4>
                                <div className="space-y-1.5">
                                    <div>
                                        <span className="text-gray-400 block text-[10px]">Nama Pemilik</span>
                                        <span className="font-bold text-gray-900">{selectedRecord.pemilik}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-400 block text-[10px]">No. Telepon / WhatsApp</span>
                                        <span className="font-medium text-gray-800">{selectedRecord.no_hp_pemilik}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-400 block text-[10px]">Alamat Domisili</span>
                                        <span className="font-medium text-gray-800">{selectedRecord.alamat_pemilik}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-3.5 space-y-2">
                            <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wide border-b border-gray-200 pb-1.5 flex items-center gap-1.5 text-amber-700">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                                Tanda Vital &amp; Keluhan Pasien (Anamnesa)
                            </h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                <div className="p-2 rounded-lg bg-white border border-gray-200">
                                    <span className="text-gray-400 block text-[10px]">Berat Badan</span>
                                    <span className="font-bold text-sm text-gray-900">{selectedRecord.berat_badan} kg</span>
                                </div>
                                <div className="p-2 rounded-lg bg-white border border-gray-200">
                                    <span className="text-gray-400 block text-[10px]">Suhu Tubuh</span>
                                    <span className="font-bold text-sm text-gray-900">{selectedRecord.suhu_tubuh} &deg;C</span>
                                </div>
                                <div className="p-2 rounded-lg bg-white border border-gray-200 col-span-2 sm:col-span-1">
                                    <span className="text-gray-400 block text-[10px]">Petugas Loket</span>
                                    <span className="font-medium text-xs text-gray-800">{selectedRecord.admin_loket}</span>
                                </div>
                            </div>
                            <div className="p-2.5 rounded-lg bg-white border border-gray-200">
                                <span className="text-gray-400 block text-[10px] font-semibold mb-0.5">Keluhan Utama / Anamnesa</span>
                                <p className="text-gray-800 leading-relaxed">{selectedRecord.anamnesa}</p>
                            </div>
                        </div>

                        <div className="rounded-xl border border-gray-200 bg-white p-3.5 space-y-3">
                            <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wide border-b border-gray-100 pb-1.5 flex items-center gap-1.5 text-emerald-700">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                                Hasil Pemeriksaan Dokter &amp; Terapi Obat
                            </h4>
                            <div className="space-y-2">
                                <div>
                                    <span className="text-gray-400 block text-[10px]">Dokter Pemeriksa</span>
                                    <span className="font-bold text-gray-900">{selectedRecord.dokter}</span>
                                </div>
                                <div className="p-2.5 rounded-lg bg-emerald-50/50 border border-emerald-100">
                                    <span className="text-emerald-800 block text-[10px] font-bold uppercase tracking-wider">
                                        Diagnosa Klinis
                                    </span>
                                    <p className="text-gray-900 font-semibold mt-0.5">{selectedRecord.diagnosa}</p>
                                </div>
                                <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-200">
                                    <span className="text-gray-600 block text-[10px] font-bold uppercase tracking-wider">
                                        Terapi Pengobatan / Resep Obat
                                    </span>
                                    <p className="text-gray-800 mt-0.5 whitespace-pre-line">{selectedRecord.terapi}</p>
                                </div>
                                {selectedRecord.catatan_dokter && (
                                    <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-200">
                                        <span className="text-gray-600 block text-[10px] font-bold uppercase tracking-wider">
                                            Catatan Khusus Dokter
                                        </span>
                                        <p className="text-gray-700 mt-0.5 italic">{selectedRecord.catatan_dokter}</p>
                                    </div>
                                )}
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

