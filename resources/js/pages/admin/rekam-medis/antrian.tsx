import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Button, Dropdown, Modal, Pagination } from '@/components/ui';
import { useToast } from '@/components/ui/Toast';

interface VisitItem {
    id: number;
    no_antrean: string;
    no_rm: string;
    nama_hewan: string;
    jenis_hewan: string;
    id_jenis_hewan?: number;
    jenis_kelamin: string;
    umur: string;
    warna_hewan: string;
    pemilik: string;
    nik_pemilik: string;
    no_hp: string;
    alamat_pemilik: string;
    tgl_kunjungan: string;
    raw_tgl: string;
    berat_badan: number;
    suhu_tubuh: number;
    anamnesa: string;
    status_antrean: string;
    dokter: string;
    dokter_foto?: string | null;
    dokter_nip?: string;
    dokter_jabatan?: string;
    diagnosa?: string;
    terapi?: string;
    admin_petugas: string;
}

interface PageProps {
    visits: {
        data: VisitItem[];
        links: any[];
        current_page: number;
        last_page: number;
        from: number;
        to: number;
        total: number;
    };
    summary: {
        total_today: number;
        antri_today: number;
        periksa_today: number;
        selesai_today: number;
    };
    filters: {
        search?: string;
        status?: string;
        tanggal?: string;
    };
}

const STATUS_FILTER_OPTIONS: Record<string, string> = {
    '': 'Semua Status Antrean',
    Antri: 'Menunggu (Antri)',
    Pemeriksaan: 'Sedang Diperiksa',
    Selesai: 'Pelayanan Selesai',
    Batal: 'Dibatalkan',
};

export default function RekamMedisAntrian({
    visits,
    summary,
    filters,
}: PageProps) {
    const { success, error } = useToast();

    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const [dateFilter, setDateFilter] = useState(filters.tanggal || new Date().toISOString().split('T')[0]);

    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [selectedVisit, setSelectedVisit] = useState<VisitItem | null>(null);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/admin/rekam-medis/antrian',
            {
                search: search || undefined,
                status: statusFilter || undefined,
                tanggal: dateFilter || undefined,
            },
            { preserveState: true, replace: true }
        );
    };

    const handleFilterStatus = (val: string) => {
        setStatusFilter(val);
        router.get(
            '/admin/rekam-medis/antrian',
            {
                search: search || undefined,
                status: val || undefined,
                tanggal: dateFilter || undefined,
            },
            { preserveState: true, replace: true }
        );
    };

    const handleResetFilter = () => {
        setSearch('');
        setStatusFilter('');
        const today = new Date().toISOString().split('T')[0];
        setDateFilter(today);
        router.get('/admin/rekam-medis/antrian', { tanggal: today }, { preserveState: true, replace: true });
    };

    const handleUpdateStatus = (visit: VisitItem, newStatus: string) => {
        router.patch(
            `/admin/rekam-medis/antrian/${visit.id}/status`,
            { status_antrean: newStatus },
            {
                preserveScroll: true,
                onSuccess: () => {
                    success(`Status antrean ${visit.no_antrean} (${visit.nama_hewan}) diubah menjadi '${newStatus}'.`);
                },
                onError: () => {
                    error('Gagal memperbarui status antrean.');
                },
            }
        );
    };

    const handlePrintTicket = (visit: VisitItem) => {
        setSelectedVisit(visit);
        setTimeout(() => {
            window.print();
        }, 300);
    };

    return (
        <DashboardLayout>
            <Head title="Antrian Rekam Medis" />

            <style>{`
                @media print {
                    nav, header, aside, .no-print, button, form {
                        display: none !important;
                    }
                    body {
                        background: white !important;
                        color: black !important;
                    }
                    .print-ticket-only {
                        display: block !important;
                    }
                }
                .print-ticket-only {
                    display: none;
                }
            `}</style>

            {selectedVisit && (
                <div className="print-ticket-only p-6 max-w-xs mx-auto text-center font-mono border border-black">
                    <h3 className="text-base font-bold uppercase">PUSKESWAN KAB/KOTA</h3>
                    <p className="text-[10px]">Pelayanan Kesehatan Hewan &amp; Inseminasi Buatan</p>
                    <div className="my-3 py-2 border-y border-dashed border-black">
                        <span className="text-[11px] block">NOMOR ANTREAN</span>
                        <span className="text-4xl font-black block my-1">{selectedVisit.no_antrean}</span>
                        <span className="text-xs font-bold block">{selectedVisit.status_antrean}</span>
                    </div>
                    <div className="text-left text-xs space-y-1">
                        <div><strong>No. RM:</strong> {selectedVisit.no_rm}</div>
                        <div><strong>Pasien:</strong> {selectedVisit.nama_hewan} ({selectedVisit.jenis_hewan})</div>
                        <div><strong>Pemilik:</strong> {selectedVisit.pemilik}</div>
                        <div><strong>Waktu:</strong> {selectedVisit.tgl_kunjungan}</div>
                    </div>
                    <p className="mt-4 text-[10px] text-gray-600">
                        Harap menunggu di ruang tunggu hingga nomor Anda dipanggil oleh dokter hewan.
                    </p>
                </div>
            )}

            <div className="space-y-4 max-w-[1600px] mx-auto no-print">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
                    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-xs flex items-center justify-between">
                        <div>
                            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
                                Total Pasien Hari Ini
                            </span>
                            <span className="text-2xl font-black text-gray-900 mt-1 block">
                                {summary.total_today}
                            </span>
                            <span className="text-[11px] text-purple-600 font-semibold mt-0.5 block">
                                Terdaftar di loket
                            </span>
                        </div>
                        <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-xs flex items-center justify-between">
                        <div>
                            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
                                Antre Menunggu
                            </span>
                            <span className="text-2xl font-black text-amber-600 mt-1 block">
                                {summary.antri_today}
                            </span>
                            <span className="text-[11px] text-amber-600 font-semibold mt-0.5 block">
                                Di ruang tunggu
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
                                Sedang Diperiksa
                            </span>
                            <span className="text-2xl font-black text-blue-600 mt-1 block">
                                {summary.periksa_today}
                            </span>
                            <span className="text-[11px] text-blue-600 font-semibold mt-0.5 block">
                                Di ruang tindakan dokter
                            </span>
                        </div>
                        <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-xs flex items-center justify-between">
                        <div>
                            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
                                Selesai Hari Ini
                            </span>
                            <span className="text-2xl font-black text-emerald-600 mt-1 block">
                                {summary.selesai_today}
                            </span>
                            <span className="text-[11px] text-emerald-600 font-semibold mt-0.5 block">
                                Telah diperiksa &amp; berobat
                            </span>
                        </div>
                        <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xs">
                    <div className="p-3 border-b border-gray-200 bg-white">
                        <div className="flex flex-col lg:flex-row gap-2.5 items-stretch lg:items-center justify-between">
                            <form
                                onSubmit={handleSearch}
                                className="flex flex-1 flex-col sm:flex-row gap-2.5 items-stretch sm:items-center"
                            >
                                <div className="relative flex-1">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </span>
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Cari No. RM, nama hewan, pemilik, NIK, atau keluhan..."
                                        className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50/50 pl-9 pr-3 text-sm text-gray-800 placeholder:text-gray-400 transition-all focus:border-purple-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                                    />
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0">
                                    <input
                                        type="date"
                                        value={dateFilter}
                                        onChange={(e) => setDateFilter(e.target.value)}
                                        className="h-10 px-3 rounded-lg border border-gray-200 bg-white text-xs text-gray-700 transition-all focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                                    />
                                </div>

                                <div className="w-full sm:w-[200px] shrink-0">
                                    <Dropdown size="md" matchWidth>
                                        <Dropdown.Trigger>
                                            <button
                                                type="button"
                                                className="flex h-10 w-full items-center justify-between gap-2.5 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-1 focus:ring-purple-500"
                                            >
                                                <span className="truncate">
                                                    {STATUS_FILTER_OPTIONS[statusFilter] || 'Semua Status Antrean'}
                                                </span>
                                                <svg className="h-4 w-4 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 9-7 7-7-7" />
                                                </svg>
                                            </button>
                                        </Dropdown.Trigger>
                                        <Dropdown.Content align="left" matchWidth className="py-2">
                                            {Object.entries(STATUS_FILTER_OPTIONS).map(([val, label]) => (
                                                <Dropdown.Item
                                                    key={val}
                                                    onClick={() => handleFilterStatus(val)}
                                                    className={`px-3 py-2.5 text-xs transition-colors ${
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

                                <div className="flex items-center gap-2">
                                    <Button
                                        type="submit"
                                        variant="secondary"
                                        size="md"
                                        className="h-10 px-4 text-xs font-semibold border-gray-200 hover:bg-gray-50 shrink-0"
                                    >
                                        Cari
                                    </Button>
                                    {(search || statusFilter || dateFilter !== new Date().toISOString().split('T')[0]) && (
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            size="md"
                                            onClick={handleResetFilter}
                                            className="h-10 px-3 text-xs font-semibold text-gray-500 hover:text-gray-700 border-gray-200 hover:bg-gray-50 shrink-0"
                                            title="Reset Filter"
                                        >
                                            Reset
                                        </Button>
                                    )}
                                </div>
                            </form>

                            <div className="shrink-0 pt-2 lg:pt-0 border-t border-gray-100 lg:border-t-0">
                                <Link
                                    href="/admin/rekam-medis/create"
                                    className="inline-flex h-10 items-center justify-center gap-2 px-4 text-xs font-semibold rounded-lg bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white shadow-xs transition-colors"
                                >
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                                    </svg>
                                    Pendaftaran Pasien Baru
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto min-h-[335px]">
                        <table className="w-full text-left text-xs border-collapse border border-gray-200">
                            <thead>
                                <tr className="bg-gray-100/90 border-b border-gray-200 text-[11px] font-bold uppercase tracking-wider text-gray-700">
                                    <th className="py-3 px-3.5 border-r border-gray-200 text-center w-16 shrink-0">Antrean</th>
                                    <th className="py-3 px-3.5 border-r border-gray-200 w-28 shrink-0">Waktu</th>
                                    <th className="py-3 px-3.5 border-r border-gray-200">No. RM &amp; Pasien Hewan</th>
                                    <th className="py-3 px-3.5 border-r border-gray-200">Pemilik &amp; Kontak</th>
                                    <th className="py-3 px-3.5 border-r border-gray-200">Triage Awal &amp; Keluhan</th>
                                    <th className="py-3 px-3.5 border-r border-gray-200">Dokter &amp; Status</th>
                                    <th className="py-3 px-3.5 text-center w-28 shrink-0">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {visits.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-16 text-center">
                                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400 mb-3">
                                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                            </div>
                                            <h4 className="text-sm font-semibold text-gray-700">Tidak ada antrean pasien ditemukan</h4>
                                            <p className="mt-1 text-xs text-gray-400">
                                                {search || statusFilter
                                                    ? 'Coba sesuaikan kata kunci pencarian atau ubah filter status antrean.'
                                                    : 'Belum ada antrean pendaftaran pada tanggal terpilih.'}
                                            </p>
                                        </td>
                                    </tr>
                                ) : (
                                    <>
                                        {visits.data.map((visit) => (
                                            <tr
                                                key={visit.id}
                                                className="odd:bg-white even:bg-gray-50/70 hover:bg-purple-50/40 transition-colors h-[58px]"
                                            >
                                                <td className="py-3 px-3.5 border-r border-gray-200 text-center font-black font-mono text-sm text-purple-700">
                                                    {visit.no_antrean}
                                                </td>

                                                <td className="py-3 px-3.5 border-r border-gray-200 text-gray-600 font-mono text-xs whitespace-nowrap">
                                                    {visit.tgl_kunjungan}
                                                </td>

                                                <td className="py-3 px-3.5 border-r border-gray-200">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-mono font-bold text-xs text-purple-800 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">
                                                            {visit.no_rm}
                                                        </span>
                                                        <span className="font-bold text-xs text-gray-900">
                                                            {visit.nama_hewan}
                                                        </span>
                                                    </div>
                                                    <div className="text-[11px] text-gray-500 mt-0.5 flex items-center gap-1.5">
                                                        <span>{visit.jenis_hewan}</span>
                                                        <span>&bull;</span>
                                                        <span>{visit.jenis_kelamin}</span>
                                                        {visit.umur && <span>({visit.umur})</span>}
                                                    </div>
                                                </td>

                                                <td className="py-3 px-3.5 border-r border-gray-200">
                                                    <span className="font-bold text-xs text-gray-900 block leading-tight">
                                                        {visit.pemilik}
                                                    </span>
                                                    <span className="text-[11px] text-gray-500 font-mono block mt-0.5">
                                                        WA: {visit.no_hp}
                                                    </span>
                                                </td>

                                                <td className="py-3 px-3.5 border-r border-gray-200 max-w-xs">
                                                    <div className="flex items-center gap-2 text-[11px] font-semibold text-gray-700 mb-0.5">
                                                        <span>BB: {visit.berat_badan} kg</span>
                                                        <span>&bull;</span>
                                                        <span>Suhu: {visit.suhu_tubuh} °C</span>
                                                    </div>
                                                    <p className="text-[11px] text-gray-500 line-clamp-1 leading-snug">
                                                        {visit.anamnesa}
                                                    </p>
                                                </td>

                                                <td className="py-3 px-3.5 border-r border-gray-200">
                                                    <div className="mb-1">
                                                        {visit.status_antrean === 'Pemeriksaan' && (
                                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-blue-50 text-blue-700 border border-blue-200">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                                                                Pemeriksaan
                                                            </span>
                                                        )}
                                                        {visit.status_antrean === 'Antri' && (
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-amber-50 text-amber-700 border border-amber-200">
                                                                Antri
                                                            </span>
                                                        )}
                                                        {visit.status_antrean === 'Selesai' && (
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                                Selesai
                                                            </span>
                                                        )}
                                                        {visit.status_antrean === 'Batal' && (
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-rose-50 text-rose-700 border border-rose-200">
                                                                Batal
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className="text-[10px] text-gray-500 block truncate max-w-[120px]">
                                                        {visit.dokter}
                                                    </span>
                                                </td>

                                                <td className="py-3 px-3.5 text-center">
                                                    <div className="flex items-center justify-center gap-1.5">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setSelectedVisit(visit);
                                                                setDetailModalOpen(true);
                                                            }}
                                                            className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-500 border border-gray-200 hover:border-purple-300 hover:bg-purple-50 hover:text-purple-700 transition-all focus:outline-none"
                                                            title="Rincian Antrean"
                                                        >
                                                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                            </svg>
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() => handlePrintTicket(visit)}
                                                            className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-500 border border-gray-200 hover:border-purple-300 hover:bg-purple-50 hover:text-purple-700 transition-all focus:outline-none"
                                                            title="Cetak Slip Antrean"
                                                        >
                                                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                                            </svg>
                                                        </button>

                                                        <Dropdown size="sm">
                                                            <Dropdown.Trigger>
                                                                <button
                                                                    type="button"
                                                                    className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700 transition-all focus:outline-none"
                                                                    title="Ubah Status Antrean"
                                                                >
                                                                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                                                    </svg>
                                                                </button>
                                                            </Dropdown.Trigger>
                                                            <Dropdown.Content align="right" className="py-1 w-36">
                                                                <Dropdown.Item
                                                                    onClick={() => handleUpdateStatus(visit, 'Antri')}
                                                                    className="text-xs text-amber-700 hover:bg-amber-50"
                                                                >
                                                                    Set ke 'Antri'
                                                                </Dropdown.Item>
                                                                <Dropdown.Item
                                                                    onClick={() => handleUpdateStatus(visit, 'Pemeriksaan')}
                                                                    className="text-xs text-blue-700 hover:bg-blue-50"
                                                                >
                                                                    Set 'Pemeriksaan'
                                                                </Dropdown.Item>
                                                                <Dropdown.Item
                                                                    onClick={() => handleUpdateStatus(visit, 'Selesai')}
                                                                    className="text-xs text-emerald-700 hover:bg-emerald-50"
                                                                >
                                                                    Set 'Selesai'
                                                                </Dropdown.Item>
                                                                <Dropdown.Item
                                                                    onClick={() => handleUpdateStatus(visit, 'Batal')}
                                                                    className="text-xs text-rose-700 hover:bg-rose-50"
                                                                >
                                                                    Batalkan Antrean
                                                                </Dropdown.Item>
                                                            </Dropdown.Content>
                                                        </Dropdown>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {visits.data.length > 0 && visits.data.length < 5 &&
                                            Array.from({ length: 5 - visits.data.length }).map((_, idx) => (
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
                                                    <td className="py-3 px-3.5 text-center">&nbsp;</td>
                                                </tr>
                                            ))}
                                    </>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {visits.links && visits.links.length > 3 && (
                        <div className="p-3 border-t border-gray-200 bg-white">
                            <Pagination
                                links={visits.links}
                                from={visits.from}
                                to={visits.to}
                                total={visits.total}
                            />
                        </div>
                    )}
                </div>
            </div>

            <Modal
                isOpen={detailModalOpen}
                onClose={() => setDetailModalOpen(false)}
                title="Rincian Tiket Antrean & Data Triage"
                size="md"
            >
                {selectedVisit && (
                    <div className="space-y-4 py-1">
                        <div className="rounded-xl border border-purple-100 bg-purple-50/50 p-4 text-center">
                            <span className="text-xs font-semibold text-purple-600 uppercase tracking-wider block">
                                Nomor Antrean Pelayanan
                            </span>
                            <span className="text-4xl font-black text-purple-900 block my-1">
                                {selectedVisit.no_antrean}
                            </span>
                            <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-white text-purple-700 border border-purple-200 shadow-2xs">
                                Status: {selectedVisit.status_antrean}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-xs">
                            <div className="rounded-lg border border-gray-100 p-2.5 bg-gray-50/50">
                                <span className="text-gray-400 block text-[11px]">Pasien Hewan:</span>
                                <strong className="text-gray-900 text-sm block">{selectedVisit.nama_hewan}</strong>
                                <span className="text-gray-600">{selectedVisit.jenis_hewan} &bull; {selectedVisit.jenis_kelamin}</span>
                                <span className="block mt-1 font-mono text-purple-700 font-semibold">{selectedVisit.no_rm}</span>
                            </div>

                            <div className="rounded-lg border border-gray-100 p-2.5 bg-gray-50/50">
                                <span className="text-gray-400 block text-[11px]">Pemilik Hewan:</span>
                                <strong className="text-gray-900 text-sm block">{selectedVisit.pemilik}</strong>
                                <span className="text-gray-600 font-mono text-[11px] block">NIK: {selectedVisit.nik_pemilik}</span>
                                <span className="text-gray-600 block mt-0.5">WhatsApp: {selectedVisit.no_hp}</span>
                            </div>
                        </div>

                        <div className="rounded-lg border border-gray-100 p-3 bg-gray-50/50 text-xs space-y-1.5">
                            <div className="flex items-center justify-between border-b pb-1">
                                <span className="text-gray-500">Timbangan Berat Badan:</span>
                                <strong className="text-gray-900">{selectedVisit.berat_badan} kg</strong>
                            </div>
                            <div className="flex items-center justify-between border-b pb-1">
                                <span className="text-gray-500">Suhu Tubuh Pasien:</span>
                                <strong className="text-gray-900">{selectedVisit.suhu_tubuh} °C</strong>
                            </div>
                            <div>
                                <span className="text-gray-500 block mb-0.5">Keluhan Awal / Anamnesa:</span>
                                <p className="text-gray-800 bg-white p-2 rounded border border-gray-200 text-xs">
                                    {selectedVisit.anamnesa}
                                </p>
                            </div>
                        </div>

                        {selectedVisit.dokter && selectedVisit.dokter !== 'Menunggu Dokter' && (
                            <div className="p-3 rounded-xl border border-blue-200 bg-blue-50/50 flex items-center gap-3 no-print">
                                <div className="relative shrink-0">
                                    {selectedVisit.dokter_foto ? (
                                        <img
                                            src={selectedVisit.dokter_foto.startsWith('http') || selectedVisit.dokter_foto.startsWith('/') ? selectedVisit.dokter_foto : `/storage/${selectedVisit.dokter_foto}`}
                                            alt={selectedVisit.dokter}
                                            className="w-11 h-11 rounded-full object-cover object-center border-2 border-white shadow-xs"
                                        />
                                    ) : (
                                        <div className="w-11 h-11 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                                            {selectedVisit.dokter.slice(0, 2).toUpperCase()}
                                        </div>
                                    )}
                                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-white" />
                                </div>
                                <div className="flex-1 min-w-0 text-xs">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-100/70 px-1.5 py-0.5 rounded">
                                        Dokter Penanggung Jawab
                                    </span>
                                    <h4 className="font-bold text-gray-900 mt-0.5 truncate text-xs">
                                        {selectedVisit.dokter}
                                    </h4>
                                    <p className="text-[11px] text-gray-500">
                                        {selectedVisit.dokter_nip && selectedVisit.dokter_nip !== '-' ? `NIP: ${selectedVisit.dokter_nip}` : (selectedVisit.dokter_jabatan || 'Dokter Hewan')}
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="flex items-center justify-end gap-2.5 pt-2">
                            <Button
                                type="button"
                                variant="secondary"
                                size="md"
                                onClick={() => handlePrintTicket(selectedVisit)}
                                className="h-9 px-4 text-xs font-semibold gap-1.5"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                </svg>
                                Cetak Slip
                            </Button>
                            <Button
                                type="button"
                                variant="secondary"
                                size="md"
                                onClick={() => setDetailModalOpen(false)}
                                className="h-9 px-4 text-xs font-semibold"
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

