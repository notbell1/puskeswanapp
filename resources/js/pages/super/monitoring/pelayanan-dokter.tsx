import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Button, Dropdown, Modal, Pagination } from '@/components/ui';

interface HistoricalRecord {
    id: number;
    tgl_kunjungan: string;
    berat_badan: number;
    suhu_tubuh: number;
    anamnesa: string;
    diagnosa: string;
    terapi_pengobatan: string;
    catatan: string;
    dokter: string;
    dokter_foto?: string | null;
    dokter_nip?: string;
}

interface VisitItem {
    id: number;
    no_rm: string;
    nama_hewan: string;
    jenis_hewan: string;
    jenis_kelamin: string;
    umur: string;
    warna_hewan: string;
    pemilik: string;
    nik_pemilik: string;
    no_hp: string;
    alamat_pemilik: string;
    tgl_kunjungan: string;
    berat_badan: number;
    suhu_tubuh: number;
    anamnesa: string;
    status_antrean: string;
    diagnosa: string;
    terapi_pengobatan: string;
    catatan: string;
    dokter_nama: string;
    petugas_loket: string;
    riwayat_sebelumnya: HistoricalRecord[];
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
    };
    filters: {
        search?: string;
        status?: string;
        tanggal?: string;
    };
}

const STATUS_FILTER_OPTIONS: Record<string, string> = {
    Semua: 'Semua Status Layanan',
    Antri: 'Menunggu Pemeriksaan',
    Pemeriksaan: 'Sedang Berlangsung',
    Selesai: 'Pemeriksaan Selesai',
};

export default function SuperMonitoringPelayananDokter({
    visits,
    summary,
    filters,
}: PageProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'Antri');
    const [dateFilter, setDateFilter] = useState(filters.tanggal || new Date().toISOString().split('T')[0]);

    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [historyModalOpen, setHistoryModalOpen] = useState(false);
    const [selectedVisit, setSelectedVisit] = useState<VisitItem | null>(null);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/super/monitoring/pelayanan-dokter',
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
            '/super/monitoring/pelayanan-dokter',
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
        setStatusFilter('Semua');
        const today = new Date().toISOString().split('T')[0];
        setDateFilter(today);
        router.get('/super/monitoring/pelayanan-dokter', { tanggal: today, status: 'Semua' }, { preserveState: true, replace: true });
    };

    return (
        <DashboardLayout title="Pantau Pelayanan Dokter">
            <Head title="Pantau Pelayanan Dokter Hewan - Super Admin" />

            <div className="space-y-4 max-w-[1600px] mx-auto">
                {/* Summary Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
                    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-xs flex items-center justify-between">
                        <div>
                            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
                                Total Pasien Masuk
                            </span>
                            <span className="text-2xl font-black text-gray-900 mt-1 block">
                                {summary.total}
                            </span>
                            <span className="text-[11px] text-teal-600 font-semibold mt-0.5 block">
                                Pada tanggal terpilih
                            </span>
                        </div>
                        <div className="h-10 w-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-xs flex items-center justify-between">
                        <div>
                            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
                                Menunggu Giliran
                            </span>
                            <span className="text-2xl font-black text-amber-600 mt-1 block">
                                {summary.antri}
                            </span>
                            <span className="text-[11px] text-amber-600 font-semibold mt-0.5 block">
                                Siap dipanggil dokter
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
                                Di meja dokter saat ini
                            </span>
                        </div>
                        <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-xs flex items-center justify-between">
                        <div>
                            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
                                Selesai Diperiksa
                            </span>
                            <span className="text-2xl font-black text-emerald-600 mt-1 block">
                                {summary.selesai}
                            </span>
                            <span className="text-[11px] text-emerald-600 font-semibold mt-0.5 block">
                                Rekam medis terbit
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
                                        placeholder="Cari No. RM, nama pasien hewan, atau pemilik..."
                                        className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50/50 pl-9 pr-3 text-sm text-gray-800 placeholder:text-gray-400 transition-all focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                                    />
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0">
                                    <input
                                        type="date"
                                        value={dateFilter}
                                        onChange={(e) => setDateFilter(e.target.value)}
                                        className="h-10 px-3 rounded-lg border border-gray-200 bg-white text-xs text-gray-700 transition-all focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                                    />
                                </div>

                                <div className="w-full sm:w-[220px] shrink-0">
                                    <Dropdown size="md" matchWidth>
                                        <Dropdown.Trigger>
                                            <button
                                                type="button"
                                                className="flex h-10 w-full items-center justify-between gap-2.5 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-1 focus:ring-teal-500"
                                            >
                                                <span className="truncate">
                                                    {STATUS_FILTER_OPTIONS[statusFilter] || 'Semua Status Layanan'}
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
                                                            ? 'bg-teal-50 font-semibold text-teal-700'
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
                                    {(search || statusFilter !== 'Semua' || dateFilter !== new Date().toISOString().split('T')[0]) && (
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

                    {/* Table Pelayanan Dokter */}
                    <div className="overflow-x-auto min-h-[335px]">
                        <table className="w-full text-left text-xs border-collapse border border-gray-200">
                            <thead>
                                <tr className="bg-gray-100/90 border-b border-gray-200 text-[11px] font-bold uppercase tracking-wider text-gray-700">
                                    <th className="py-3 px-3.5 border-r border-gray-200 text-center font-bold w-12 shrink-0">No</th>
                                    <th className="py-3 px-3.5 border-r border-gray-200 text-center font-bold w-28 shrink-0">No. RM</th>
                                    <th className="py-3 px-3.5 border-r border-gray-200 text-center font-bold">Pasien Hewan</th>
                                    <th className="py-3 px-3.5 border-r border-gray-200 text-center font-bold">Pemilik</th>
                                    <th className="py-3 px-3.5 border-r border-gray-200 text-center font-bold">Keluhan / Diagnosa Dokter</th>
                                    <th className="py-3 px-3.5 border-r border-gray-200 text-center font-bold">Dokter &amp; Status</th>
                                    <th className="py-3 px-3.5 text-center font-bold w-36 shrink-0">Aksi Pantau</th>
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
                                            <h4 className="text-sm font-semibold text-gray-700">Tidak ada data pelayanan ditemukan</h4>
                                            <p className="mt-1 text-xs text-gray-400">
                                                Coba ubah tanggal pantauan atau filter status pelayanan dokter.
                                            </p>
                                        </td>
                                    </tr>
                                ) : (
                                    visits.data.map((visit, idx) => (
                                        <tr
                                            key={visit.id}
                                            className="odd:bg-white even:bg-gray-50/70 hover:bg-teal-50/40 transition-colors"
                                        >
                                            <td className="py-3 px-3.5 border-r border-gray-200 text-center font-semibold text-gray-600">
                                                {visits.from ? visits.from + idx : idx + 1}
                                            </td>
                                            <td className="py-3 px-3.5 border-r border-gray-200 font-mono font-bold text-teal-800">
                                                {visit.no_rm}
                                            </td>
                                            <td className="py-3 px-3.5 border-r border-gray-200">
                                                <div className="font-bold text-gray-900 flex items-center gap-1.5">
                                                    <span>{visit.nama_hewan}</span>
                                                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-gray-100 font-normal text-gray-600 border border-gray-200">
                                                        {visit.jenis_hewan}
                                                    </span>
                                                </div>
                                                <div className="text-[10px] text-gray-400 mt-0.5">
                                                    {visit.jenis_kelamin} • {visit.umur} • {visit.warna_hewan}
                                                </div>
                                            </td>
                                            <td className="py-3 px-3.5 border-r border-gray-200">
                                                <div className="font-semibold text-gray-900">{visit.pemilik}</div>
                                                <div className="text-[10px] text-gray-500 font-mono">NIK: {visit.nik_pemilik || '-'}</div>
                                            </td>
                                            <td className="py-3 px-3.5 border-r border-gray-200 max-w-[280px]">
                                                {visit.diagnosa ? (
                                                    <div>
                                                        <div className="font-bold text-emerald-800">
                                                            {visit.diagnosa}
                                                        </div>
                                                        <div className="text-[10px] text-gray-500 line-clamp-1 mt-0.5">
                                                            Terapi: {visit.terapi_pengobatan || '-'}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <div className="italic text-gray-600 line-clamp-1">
                                                            "{visit.anamnesa}"
                                                        </div>
                                                        <div className="text-[10px] text-gray-400 mt-0.5">
                                                            BB: {visit.berat_badan > 0 ? `${visit.berat_badan} kg` : '-'} • Suhu: {visit.suhu_tubuh > 0 ? `${visit.suhu_tubuh} °C` : '-'}
                                                        </div>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="py-3 px-3.5 border-r border-gray-200">
                                                <div className="font-semibold text-gray-800 flex items-center gap-1.5">
                                                    <svg className="w-3.5 h-3.5 text-teal-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                    <span className="truncate">{visit.dokter_nama}</span>
                                                </div>
                                                <div className="mt-1.5">
                                                    <span
                                                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                                                            visit.status_antrean === 'Antri'
                                                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                                                : visit.status_antrean === 'Pemeriksaan'
                                                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                                                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                        }`}
                                                    >
                                                        <span
                                                            className={`h-1.5 w-1.5 rounded-full ${
                                                                visit.status_antrean === 'Antri'
                                                                    ? 'bg-amber-500 animate-pulse'
                                                                    : visit.status_antrean === 'Pemeriksaan'
                                                                    ? 'bg-blue-500 animate-pulse'
                                                                    : 'bg-emerald-500'
                                                            }`}
                                                        />
                                                        {visit.status_antrean}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-3.5 text-center">
                                                <div className="inline-flex items-center gap-1.5">
                                                    <Button
                                                        type="button"
                                                        variant="secondary"
                                                        size="sm"
                                                        onClick={() => {
                                                            setSelectedVisit(visit);
                                                            setDetailModalOpen(true);
                                                        }}
                                                        className="h-7 px-2 text-[11px] font-semibold border-teal-200 text-teal-700 hover:bg-teal-50"
                                                    >
                                                        Detail
                                                    </Button>
                                                    {visit.riwayat_sebelumnya.length > 0 && (
                                                        <Button
                                                            type="button"
                                                            variant="secondary"
                                                            size="sm"
                                                            onClick={() => {
                                                                setSelectedVisit(visit);
                                                                setHistoryModalOpen(true);
                                                            }}
                                                            className="h-7 px-2 text-[11px] font-semibold border-gray-200 text-gray-700 hover:bg-gray-50"
                                                        >
                                                            Riwayat ({visit.riwayat_sebelumnya.length})
                                                        </Button>
                                                    )}
                                                </div>
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
                                <span className="font-semibold text-gray-800">{visits.total}</span> data
                            </span>
                            <Pagination links={visits.links} />
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Detail Pemeriksaan */}
            <Modal
                isOpen={detailModalOpen}
                onClose={() => setDetailModalOpen(false)}
                title="Rincian Pelayanan Medis Veteriner"
                size="lg"
            >
                {selectedVisit && (
                    <div className="space-y-4 text-xs">
                        <div className="p-3.5 rounded-xl bg-teal-50/60 border border-teal-100 flex items-center justify-between">
                            <div>
                                <div className="text-sm font-bold text-gray-900">{selectedVisit.nama_hewan} ({selectedVisit.jenis_hewan})</div>
                                <div className="font-mono text-teal-800 text-[11px]">No. RM: {selectedVisit.no_rm}</div>
                            </div>
                            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-white border border-gray-200 text-gray-800">
                                Status: {selectedVisit.status_antrean}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="p-3 rounded-lg border border-gray-200 bg-white space-y-1.5">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                                    Identitas Pemilik &amp; Kontak
                                </span>
                                <div><strong className="text-gray-600">Nama Pemilik:</strong> {selectedVisit.pemilik}</div>
                                <div><strong className="text-gray-600">NIK:</strong> {selectedVisit.nik_pemilik || '-'}</div>
                                <div><strong className="text-gray-600">No. HP / WA:</strong> {selectedVisit.no_hp || '-'}</div>
                                <div><strong className="text-gray-600">Alamat:</strong> {selectedVisit.alamat_pemilik || '-'}</div>
                            </div>

                            <div className="p-3 rounded-lg border border-gray-200 bg-white space-y-1.5">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                                    Kondisi Fisik Pasien
                                </span>
                                <div><strong className="text-gray-600">Jenis / Warna:</strong> {selectedVisit.jenis_kelamin} / {selectedVisit.warna_hewan}</div>
                                <div><strong className="text-gray-600">Perkiraan Umur:</strong> {selectedVisit.umur}</div>
                                <div><strong className="text-gray-600">Berat Badan:</strong> {selectedVisit.berat_badan > 0 ? `${selectedVisit.berat_badan} kg` : '-'}</div>
                                <div><strong className="text-gray-600">Suhu Tubuh:</strong> {selectedVisit.suhu_tubuh > 0 ? `${selectedVisit.suhu_tubuh} °C` : '-'}</div>
                            </div>
                        </div>

                        <div className="p-3 rounded-lg border border-gray-200 bg-gray-50/50 space-y-2">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                                Anamnesa &amp; Keluhan Awal
                            </span>
                            <p className="text-xs text-gray-800 italic bg-white p-2.5 rounded border border-gray-200">
                                "{selectedVisit.anamnesa}"
                            </p>
                        </div>

                        <div className="p-3 rounded-lg border border-teal-200 bg-teal-50/40 space-y-2">
                            <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider block">
                                Hasil Pemeriksaan Dokter Hewan
                            </span>
                            <div>
                                <span className="text-gray-500 font-semibold block text-[10px]">Diagnosa Klinis:</span>
                                <div className="text-xs font-bold text-gray-900 mt-0.5">{selectedVisit.diagnosa || '(Belum diisi)'}</div>
                            </div>
                            <div>
                                <span className="text-gray-500 font-semibold block text-[10px]">Terapi &amp; Resep Pengobatan:</span>
                                <div className="text-xs text-gray-800 mt-0.5">{selectedVisit.terapi_pengobatan || '(Belum diisi)'}</div>
                            </div>
                            {selectedVisit.catatan && (
                                <div>
                                    <span className="text-gray-500 font-semibold block text-[10px]">Catatan Dokter:</span>
                                    <div className="text-xs text-gray-600 mt-0.5">{selectedVisit.catatan}</div>
                                </div>
                            )}
                            <div className="pt-1.5 border-t border-teal-200/60 flex items-center justify-between text-[11px] text-teal-900">
                                <div>Dokter Pemeriksa: <strong>{selectedVisit.dokter_nama}</strong></div>
                                <div>Petugas Loket: <strong>{selectedVisit.petugas_loket}</strong></div>
                            </div>
                        </div>

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

            {/* Modal Riwayat Rekam Medis Pasien */}
            <Modal
                isOpen={historyModalOpen}
                onClose={() => setHistoryModalOpen(false)}
                title={`Riwayat Rekam Medis: ${selectedVisit?.nama_hewan || ''} (${selectedVisit?.no_rm || ''})`}
                size="xl"
            >
                {selectedVisit && (
                    <div className="space-y-3 text-xs max-h-[70vh] overflow-y-auto pr-1">
                        {selectedVisit.riwayat_sebelumnya.map((hist, i) => (
                            <div key={hist.id || i} className="p-3.5 rounded-xl border border-gray-200 bg-white space-y-2">
                                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                                    <div className="font-bold text-gray-900 flex items-center gap-2">
                                        <span className="h-2 w-2 rounded-full bg-teal-500" />
                                        <span>Tanggal Kunjungan: {hist.tgl_kunjungan}</span>
                                    </div>
                                    <div className="text-gray-500 font-medium">
                                        Dokter: <strong className="text-gray-800">{hist.dokter}</strong>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-gray-600">
                                    <div><strong>BB / Suhu:</strong> {hist.berat_badan} kg / {hist.suhu_tubuh} °C</div>
                                    <div><strong>Keluhan:</strong> {hist.anamnesa}</div>
                                </div>
                                <div className="p-2.5 rounded-lg bg-teal-50/50 border border-teal-100">
                                    <div className="font-bold text-teal-900">Diagnosa: {hist.diagnosa}</div>
                                    <div className="text-teal-800 text-[11px] mt-0.5">Terapi: {hist.terapi_pengobatan}</div>
                                </div>
                            </div>
                        ))}
                        <div className="pt-2 flex justify-end">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => setHistoryModalOpen(false)}
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
