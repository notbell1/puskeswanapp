import React, { useState, useRef, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Button, Dropdown, Modal, Pagination } from '@/components/ui';

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
    diagnosa?: string | null;
    terapi?: string | null;
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
        total: number;
        antri: number;
        periksa: number;
        selesai: number;
        batal: number;
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

export default function SuperMonitoringAntrianLoket({
    visits,
    summary,
    filters,
}: PageProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const [dateFilter, setDateFilter] = useState(filters.tanggal || '');
    const isFirstSearchRender = useRef(true);

    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [selectedVisit, setSelectedVisit] = useState<VisitItem | null>(null);

    useEffect(() => {
        if (isFirstSearchRender.current) {
            isFirstSearchRender.current = false;
            return;
        }

        const timer = setTimeout(() => {
            router.get(
                '/super/monitoring/antrian-loket',
                {
                    search: search || undefined,
                    status: statusFilter || undefined,
                    tanggal: dateFilter || undefined,
                },
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                }
            );
        }, 300);

        return () => clearTimeout(timer);
    }, [search]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/super/monitoring/antrian-loket',
            {
                search: search || undefined,
                status: statusFilter || undefined,
                tanggal: dateFilter || undefined,
            },
            { preserveState: true, replace: true }
        );
    };

    const handleDateChange = (val: string) => {
        setDateFilter(val);
        router.get(
            '/super/monitoring/antrian-loket',
            {
                search: search || undefined,
                status: statusFilter || undefined,
                tanggal: val || undefined,
            },
            { preserveState: true, replace: true }
        );
    };

    const handleFilterStatus = (val: string) => {
        setStatusFilter(val);
        router.get(
            '/super/monitoring/antrian-loket',
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
        setDateFilter('');
        router.get('/super/monitoring/antrian-loket', {}, { preserveState: true, replace: true });
    };

    return (
        <DashboardLayout title="Pantau Antrean Loket">
            <Head title="Pantau Antrean Loket Pendaftaran - Super Admin" />

            <div className="space-y-4 max-w-[1600px] mx-auto">
                {/* Summary Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
                    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-xs flex items-center justify-between">
                        <div>
                            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
                                Total Terdaftar
                            </span>
                            <span className="text-2xl font-black text-gray-900 mt-1 block">
                                {summary.total}
                            </span>
                            <span className="text-[11px] text-purple-600 font-semibold mt-0.5 block">
                                {dateFilter ? 'Pasien pada tanggal terpilih' : 'Seluruh antrean terdaftar'}
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
                                {summary.antri}
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
                                {summary.periksa}
                            </span>
                            <span className="text-[11px] text-blue-600 font-semibold mt-0.5 block">
                                Ruang tindakan dokter
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
                                Pelayanan Selesai
                            </span>
                            <span className="text-2xl font-black text-emerald-600 mt-1 block">
                                {summary.selesai}
                            </span>
                            <span className="text-[11px] text-emerald-600 font-semibold mt-0.5 block">
                                Tindakan &amp; resep selesai
                            </span>
                        </div>
                        <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Filter and Table Container */}
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
                                        onChange={(e) => handleDateChange(e.target.value)}
                                        className="h-10 px-3 rounded-lg border border-gray-200 bg-white text-xs text-gray-700 transition-all focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                                        title="Filter tanggal kunjungan"
                                    />
                                    {dateFilter && (
                                        <button
                                            type="button"
                                            onClick={() => handleDateChange('')}
                                            className="h-10 px-2.5 rounded-lg border border-purple-200 bg-purple-50 text-xs font-semibold text-purple-700 hover:bg-purple-100 transition-colors shrink-0"
                                            title="Tampilkan seluruh data tanpa batasan tanggal"
                                        >
                                            Semua Tanggal
                                        </button>
                                    )}
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
                                            className="h-10 px-3 text-xs text-rose-600 border-rose-200 hover:bg-rose-50 shrink-0"
                                        >
                                            Reset
                                        </Button>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Table Antrean Loket */}
                    <div className="overflow-x-auto min-h-[335px]">
                        <table className="w-full text-left text-xs border-collapse border border-gray-200">
                            <thead>
                                <tr className="bg-gray-100/90 border-b border-gray-200 text-[11px] font-bold uppercase tracking-wider text-gray-700">
                                    <th className="py-3 px-3.5 border-r border-gray-200 text-center font-bold w-16 shrink-0">Antrean</th>
                                    <th className="py-3 px-3.5 border-r border-gray-200 text-center font-bold w-28 shrink-0">Waktu</th>
                                    <th className="py-3 px-3.5 border-r border-gray-200 text-center font-bold">No. RM &amp; Pasien Hewan</th>
                                    <th className="py-3 px-3.5 border-r border-gray-200 text-center font-bold">Pemilik &amp; Kontak</th>
                                    <th className="py-3 px-3.5 border-r border-gray-200 text-center font-bold">Triage Awal &amp; Keluhan</th>
                                    <th className="py-3 px-3.5 border-r border-gray-200 text-center font-bold">Dokter &amp; Status</th>
                                    <th className="py-3 px-3.5 text-center font-bold w-28 shrink-0">Aksi Pantau</th>
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
                                                Coba sesuaikan kata kunci pencarian, filter tanggal, atau status antrean.
                                            </p>
                                        </td>
                                    </tr>
                                ) : (
                                    visits.data.map((visit) => (
                                        <tr
                                            key={visit.id}
                                            className="odd:bg-white even:bg-gray-50/70 hover:bg-purple-50/40 transition-colors"
                                        >
                                            <td className="py-3 px-3.5 border-r border-gray-200 text-center font-mono font-bold text-gray-900">
                                                <div className="inline-flex items-center justify-center h-8 w-11 rounded-lg bg-purple-50 border border-purple-200 text-purple-700 text-sm">
                                                    {visit.no_antrean}
                                                </div>
                                            </td>
                                            <td className="py-3 px-3.5 border-r border-gray-200 text-gray-600">
                                                <div className="font-semibold text-gray-800">{visit.tgl_kunjungan.split(',')[1] || visit.tgl_kunjungan}</div>
                                                <div className="text-[10px] text-gray-400">{visit.tgl_kunjungan.split(',')[0]}</div>
                                                <div className="text-[10px] text-gray-500 mt-0.5">Petugas: {visit.admin_petugas}</div>
                                            </td>
                                            <td className="py-3 px-3.5 border-r border-gray-200">
                                                <div className="font-bold text-gray-900 flex items-center gap-1.5">
                                                    <span>{visit.nama_hewan}</span>
                                                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-gray-100 font-normal text-gray-600 border border-gray-200">
                                                        {visit.jenis_hewan}
                                                    </span>
                                                </div>
                                                <div className="text-[11px] font-mono text-purple-700 mt-0.5">
                                                    RM: {visit.no_rm}
                                                </div>
                                                <div className="text-[10px] text-gray-400 mt-0.5">
                                                    {visit.jenis_kelamin} • {visit.umur} • {visit.warna_hewan}
                                                </div>
                                            </td>
                                            <td className="py-3 px-3.5 border-r border-gray-200">
                                                <div className="font-semibold text-gray-900">{visit.pemilik}</div>
                                                <div className="text-[10px] text-gray-500 font-mono">NIK: {visit.nik_pemilik || '-'}</div>
                                                <div className="text-[10px] text-gray-600 mt-0.5">WA: {visit.no_hp || '-'}</div>
                                            </td>
                                            <td className="py-3 px-3.5 border-r border-gray-200 max-w-[260px]">
                                                <div className="line-clamp-2 text-gray-800 font-medium italic">
                                                    "{visit.anamnesa}"
                                                </div>
                                                <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-500">
                                                    <span>BB: {visit.berat_badan > 0 ? `${visit.berat_badan} kg` : '-'}</span>
                                                    <span>•</span>
                                                    <span>Suhu: {visit.suhu_tubuh > 0 ? `${visit.suhu_tubuh} °C` : '-'}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-3.5 border-r border-gray-200">
                                                <div className="font-semibold text-gray-800 flex items-center gap-1.5">
                                                    <svg className="w-3.5 h-3.5 text-purple-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                    <span className="truncate">{visit.dokter}</span>
                                                </div>
                                                <div className="mt-1.5">
                                                    <span
                                                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                                                            visit.status_antrean === 'Antri'
                                                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                                                : visit.status_antrean === 'Pemeriksaan'
                                                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                                                : visit.status_antrean === 'Selesai'
                                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                                : 'bg-rose-50 text-rose-700 border-rose-200'
                                                        }`}
                                                    >
                                                        <span
                                                            className={`h-1.5 w-1.5 rounded-full ${
                                                                visit.status_antrean === 'Antri'
                                                                    ? 'bg-amber-500 animate-pulse'
                                                                    : visit.status_antrean === 'Pemeriksaan'
                                                                    ? 'bg-blue-500 animate-pulse'
                                                                    : visit.status_antrean === 'Selesai'
                                                                    ? 'bg-emerald-500'
                                                                    : 'bg-rose-500'
                                                            }`}
                                                        />
                                                        {visit.status_antrean}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-3.5 text-center">
                                                <Button
                                                    type="button"
                                                    variant="secondary"
                                                    size="sm"
                                                    onClick={() => {
                                                        setSelectedVisit(visit);
                                                        setDetailModalOpen(true);
                                                    }}
                                                    className="h-7 px-2.5 text-[11px] font-semibold border-purple-200 text-purple-700 hover:bg-purple-50 inline-flex items-center gap-1"
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                    Detail
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {visits.links && visits.links.length > 3 && (
                        <div className="p-3 border-t border-gray-200 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
                            <span className="text-xs text-gray-500">
                                Menampilkan <span className="font-semibold text-gray-800">{visits.from || 0}</span> s/d{' '}
                                <span className="font-semibold text-gray-800">{visits.to || 0}</span> dari{' '}
                                <span className="font-semibold text-gray-800">{visits.total}</span> antrean
                            </span>
                            <Pagination links={visits.links} />
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Detail Pantauan Pasien */}
            <Modal
                isOpen={detailModalOpen}
                onClose={() => setDetailModalOpen(false)}
                title="Rincian Pantauan Antrean Loket"
                size="lg"
            >
                {selectedVisit && (
                    <div className="space-y-4 text-xs">
                        {/* Header Mini */}
                        <div className="p-3.5 rounded-xl bg-purple-50/60 border border-purple-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-12 rounded-lg bg-purple-700 text-white font-black font-mono text-base flex items-center justify-center">
                                    {selectedVisit.no_antrean}
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-gray-900">{selectedVisit.nama_hewan} ({selectedVisit.jenis_hewan})</div>
                                    <div className="font-mono text-purple-700 text-[11px]">No. RM: {selectedVisit.no_rm}</div>
                                </div>
                            </div>
                            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-white border border-gray-200 text-gray-800">
                                Status: {selectedVisit.status_antrean}
                            </span>
                        </div>

                        {/* Grid Identitas */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="p-3 rounded-lg border border-gray-200 bg-white space-y-1.5">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                                    Data Pemilik
                                </span>
                                <div><strong className="text-gray-600">Nama:</strong> {selectedVisit.pemilik}</div>
                                <div><strong className="text-gray-600">NIK:</strong> {selectedVisit.nik_pemilik || '-'}</div>
                                <div><strong className="text-gray-600">No. HP / WA:</strong> {selectedVisit.no_hp || '-'}</div>
                                <div><strong className="text-gray-600">Alamat:</strong> {selectedVisit.alamat_pemilik || '-'}</div>
                            </div>

                            <div className="p-3 rounded-lg border border-gray-200 bg-white space-y-1.5">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                                    Data Fisik Pasien
                                </span>
                                <div><strong className="text-gray-600">Kelamin / Umur:</strong> {selectedVisit.jenis_kelamin} / {selectedVisit.umur}</div>
                                <div><strong className="text-gray-600">Warna Hewan:</strong> {selectedVisit.warna_hewan}</div>
                                <div><strong className="text-gray-600">Berat Badan:</strong> {selectedVisit.berat_badan > 0 ? `${selectedVisit.berat_badan} kg` : '-'}</div>
                                <div><strong className="text-gray-600">Suhu Tubuh:</strong> {selectedVisit.suhu_tubuh > 0 ? `${selectedVisit.suhu_tubuh} °C` : '-'}</div>
                            </div>
                        </div>

                        {/* Keluhan & Pelayanan */}
                        <div className="p-3 rounded-lg border border-gray-200 bg-gray-50/50 space-y-2">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                                Anamnesa &amp; Keluhan Loket
                            </span>
                            <p className="text-xs text-gray-800 italic bg-white p-2.5 rounded border border-gray-200">
                                "{selectedVisit.anamnesa}"
                            </p>
                            <div className="flex flex-wrap items-center justify-between text-gray-500 text-[11px] pt-1">
                                <div>Petugas Loket: <strong className="text-gray-800">{selectedVisit.admin_petugas}</strong></div>
                                <div>Dokter Ditugaskan: <strong className="text-purple-700">{selectedVisit.dokter}</strong></div>
                            </div>
                        </div>

                        {/* Hasil Medis jika sudah periksa */}
                        {(selectedVisit.diagnosa || selectedVisit.terapi) && (
                            <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50/40 space-y-1.5">
                                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                                    Hasil Pemeriksaan Dokter
                                </span>
                                <div><strong className="text-emerald-950">Diagnosa Klinis:</strong> {selectedVisit.diagnosa || '-'}</div>
                                <div><strong className="text-emerald-950">Terapi / Obat:</strong> {selectedVisit.terapi || '-'}</div>
                            </div>
                        )}

                        <div className="pt-2 flex justify-end">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => setDetailModalOpen(false)}
                                className="px-4 text-xs font-semibold"
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
