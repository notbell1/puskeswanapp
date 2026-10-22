import React, { useRef, useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Button, Dropdown, Modal, Pagination, Select, useToast } from '@/components/ui';

interface VisitItem {
    id: number;
    no_antrean: string;
    no_rm: string;
    nama_hewan: string;
    jenis_hewan: string;
    id_jenis_hewan: number;
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
    diagnosa: string | null;
    terapi: string | null;
    admin_petugas: string;
}

interface AnimalTypeItem {
    id: number;
    nama_jenis: string;
}

interface ExistingAnimal {
    id: number;
    no_rm: string;
    nama_hewan: string;
    id_jenis_hewan: number;
    nama_jenis: string;
    jenis_kelamin: string;
    umur: string;
    warna_hewan: string;
    last_visit: string;
    last_anamnesa?: string;
    last_bb?: number;
    last_suhu?: number;
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
    animalTypes: AnimalTypeItem[];
    nextNoRm: string;
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
    Antri: 'Antri (Menunggu)',
    Pemeriksaan: 'Sedang Diperiksa',
    Selesai: 'Pelayanan Selesai',
    Batal: 'Dibatalkan',
};

export default function PendaftaranIndex({
    visits,
    animalTypes,
    nextNoRm,
    summary,
    filters,
}: PageProps) {
    const { success, error, warning } = useToast();

    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const [dateFilter, setDateFilter] = useState(filters.tanggal || new Date().toISOString().split('T')[0]);

    const [registerModalOpen, setRegisterModalOpen] = useState(false);
    const [saveConfirmModalOpen, setSaveConfirmModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isSubmittingRef = useRef(false);

    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [selectedVisit, setSelectedVisit] = useState<VisitItem | null>(null);

    const [isSearchingNik, setIsSearchingNik] = useState(false);
    const [nikSearchStatus, setNikSearchStatus] = useState<'idle' | 'found' | 'not_found'>('idle');
    const [existingAnimals, setExistingAnimals] = useState<ExistingAnimal[]>([]);

    const { data, setData, errors, reset, clearErrors } = useForm({
        tipe_pemilik: 'lama' as 'lama' | 'baru',
        id_pemilik: '' as number | string,
        nik: '',
        nama_lengkap: '',
        no_hp_wa: '',
        alamat_lengkap: '',

        tipe_hewan: 'lama' as 'lama' | 'baru',
        id_hewan: '' as number | string,
        nama_hewan: '',
        id_jenis_hewan: animalTypes[0]?.id ? String(animalTypes[0].id) : '',
        jenis_kelamin: 'Jantan' as 'Jantan' | 'Betina',
        umur: '1 Tahun',
        warna_hewan: '',

        berat_badan: '' as number | string,
        suhu_tubuh: '' as number | string,
        anamnesa: '',
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/admin/pendaftaran',
            {
                search: search || undefined,
                status: statusFilter || undefined,
                tanggal: dateFilter || undefined,
            },
            { preserveState: true, replace: true }
        );
    };

    const handleFilterStatus = (status: string) => {
        setStatusFilter(status);
        router.get(
            '/admin/pendaftaran',
            {
                search: search || undefined,
                status: status || undefined,
                tanggal: dateFilter || undefined,
            },
            { preserveState: true, replace: true }
        );
    };

    const handleResetFilter = () => {
        setSearch('');
        setStatusFilter('');
        const todayStr = new Date().toISOString().split('T')[0];
        setDateFilter(todayStr);
        router.get('/admin/pendaftaran', { tanggal: todayStr }, { preserveState: true, replace: true });
    };

    const openRegisterModal = () => {
        reset();
        clearErrors();
        setNikSearchStatus('idle');
        setExistingAnimals([]);
        setIsSubmitting(false);
        isSubmittingRef.current = false;
        setSaveConfirmModalOpen(false);
        setRegisterModalOpen(true);
    };

    const handleCheckNik = async () => {
        const cleanNik = data.nik.trim();
        if (!cleanNik || cleanNik.length < 16) {
            warning('Masukkan 16 digit NIK pemilik yang valid untuk melakukan pengecekan.');
            return;
        }

        setIsSearchingNik(true);
        try {
            const res = await fetch(`/admin/pendaftaran/search-owner?nik=${encodeURIComponent(cleanNik)}`, {
                headers: { Accept: 'application/json' },
            });
            const json = await res.json();

            if (json.found && json.owner) {
                setNikSearchStatus('found');
                setData((prev) => ({
                    ...prev,
                    tipe_pemilik: 'lama',
                    id_pemilik: json.owner.id,
                    nik: json.owner.nik,
                    nama_lengkap: json.owner.nama_lengkap,
                    no_hp_wa: json.owner.no_hp_wa,
                    alamat_lengkap: json.owner.alamat_lengkap,
                    tipe_hewan: json.animals && json.animals.length > 0 ? 'lama' : 'baru',
                    id_hewan: json.animals && json.animals.length > 0 ? json.animals[0].id : '',
                }));
                setExistingAnimals(json.animals || []);
                success(`Pemilik terdaftar ditemukan: ${json.owner.nama_lengkap}.`);
            } else {
                setNikSearchStatus('not_found');
                setData((prev) => ({
                    ...prev,
                    tipe_pemilik: 'baru',
                    id_pemilik: '',
                    nama_lengkap: '',
                    no_hp_wa: '',
                    alamat_lengkap: '',
                    tipe_hewan: 'baru',
                    id_hewan: '',
                }));
                setExistingAnimals([]);
                warning('NIK belum terdaftar. Silakan lengkapi formulir pendaftaran pemilik baru.');
            }
        } catch (err) {
            error('Gagal melakukan pencarian NIK pemilik.');
        } finally {
            setIsSearchingNik(false);
        }
    };

    const handleValidateAndConfirm = (e: React.FormEvent) => {
        e.preventDefault();

        if (data.tipe_pemilik === 'baru') {
            if (!data.nik || data.nik.trim().length !== 16) {
                warning('NIK pemilik wajib 16 digit angka!');
                return;
            }
            if (!data.nama_lengkap.trim()) {
                warning('Nama lengkap pemilik hewan wajib diisi!');
                return;
            }
            if (!data.no_hp_wa.trim()) {
                warning('Nomor HP / WhatsApp pemilik wajib diisi!');
                return;
            }
            if (!data.alamat_lengkap.trim()) {
                warning('Alamat lengkap domisili pemilik wajib diisi!');
                return;
            }
        } else if (!data.id_pemilik) {
            warning('Silakan lakukan pengecekan NIK terlebih dahulu.');
            return;
        }

        if (data.tipe_hewan === 'baru') {
            if (!data.nama_hewan.trim()) {
                warning('Nama pasien hewan wajib diisi!');
                return;
            }
            if (!data.id_jenis_hewan) {
                warning('Pilih jenis / spesies hewan!');
                return;
            }
            if (!data.warna_hewan.trim()) {
                warning('Warna / tanda fisik hewan wajib diisi!');
                return;
            }
        } else if (!data.id_hewan) {
            warning('Pilih salah satu hewan yang dibawa berobat hari ini!');
            return;
        }

        if (!data.berat_badan || Number(data.berat_badan) <= 0) {
            warning('Berat badan hewan wajib diisi hasil timbang fisik!');
            return;
        }
        if (!data.suhu_tubuh || Number(data.suhu_tubuh) < 30 || Number(data.suhu_tubuh) > 45) {
            warning('Suhu tubuh hewan wajib diisi dalam rentang normal (30 - 45 °C)!');
            return;
        }
        if (!data.anamnesa.trim()) {
            warning('Keluhan utama / anamnesa awal wajib diisi!');
            return;
        }

        setSaveConfirmModalOpen(true);
    };

    const executeSubmitRegistration = () => {
        if (isSubmittingRef.current || isSubmitting) return;
        isSubmittingRef.current = true;
        setIsSubmitting(true);

        router.post('/admin/pendaftaran', data, {
            preserveScroll: true,
            onSuccess: () => {
                setSaveConfirmModalOpen(false);
                setRegisterModalOpen(false);
                success('Pendaftaran pasien berhasil! Nomor antrean telah diterbitkan.');
            },
            onError: (errs) => {
                setSaveConfirmModalOpen(false);
                const firstErr = Object.values(errs)[0];
                error(typeof firstErr === 'string' ? firstErr : 'Gagal memproses pendaftaran. Periksa isian formulir.');
            },
            onFinish: () => {
                isSubmittingRef.current = false;
                setIsSubmitting(false);
            },
        });
    };

    const handleUpdateStatus = (visit: VisitItem, newStatus: string) => {
        router.patch(
            `/admin/pendaftaran/${visit.id}/status`,
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
        }, 150);
    };

    return (
        <DashboardLayout title="Pendaftaran Pasien & Antrean Loket">
            <Head title="Pendaftaran & Antrean Loket" />

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
                    <p className="text-[10px]">Pelayanan Kesehatan Hewan &amp; IB</p>
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
                        Harap menunggu di ruang tunggu hingga nomor Anda dipanggil oleh dokter.
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
                                Pelayanan Selesai
                            </span>
                            <span className="text-2xl font-black text-emerald-600 mt-1 block">
                                {summary.selesai_today}
                            </span>
                            <span className="text-[11px] text-emerald-600 font-semibold mt-0.5 block">
                                Resep &amp; tindakan tuntas
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
                                <Button
                                    type="button"
                                    variant="primary"
                                    size="md"
                                    onClick={openRegisterModal}
                                    className="h-10 px-4 text-xs font-semibold w-full sm:w-auto rounded-lg bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white shadow-xs transition-colors"
                                    leftIcon={
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                                        </svg>
                                    }
                                >
                                    Pendaftaran Pasien Baru
                                </Button>
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
                                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-amber-50 text-amber-700 border border-amber-200">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                                                Antri
                                                            </span>
                                                        )}
                                                        {visit.status_antrean === 'Selesai' && (
                                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                                Selesai
                                                            </span>
                                                        )}
                                                        {visit.status_antrean === 'Batal' && (
                                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-rose-50 text-rose-700 border border-rose-200">
                                                                Batal
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className="text-[10.5px] text-gray-500 block truncate">
                                                        {visit.dokter}
                                                    </span>
                                                </td>

                                                <td className="py-3 px-3.5 text-center">
                                                    <div className="flex items-center justify-center gap-1.5">
                                                        <button
                                                            type="button"
                                                            onClick={() => handlePrintTicket(visit)}
                                                            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 border border-gray-200 hover:border-purple-300 hover:bg-purple-50 hover:text-purple-700 transition-all focus:outline-none"
                                                            title="Cetak Tiket Antrean"
                                                        >
                                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                                            </svg>
                                                        </button>

                                                        <Dropdown size="sm">
                                                            <Dropdown.Trigger>
                                                                <button
                                                                    type="button"
                                                                    className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700 transition-all focus:outline-none"
                                                                    title="Ubah Status Antrean"
                                                                >
                                                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

                    <div className="flex flex-col gap-3 border-t border-gray-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between bg-gray-50/30">
                        <p className="text-xs text-gray-500 font-medium">
                            Menampilkan{' '}
                            <span className="font-bold text-gray-800">{visits.from || 0}</span>{' '}
                            hingga{' '}
                            <span className="font-bold text-gray-800">{visits.to || 0}</span>{' '}
                            dari total{' '}
                            <span className="font-bold text-gray-800">{visits.total}</span> data antrean pasien.
                        </p>
                        <Pagination
                            links={visits.links}
                            currentPage={visits.current_page}
                            totalPages={visits.last_page}
                        />
                    </div>
                </div>
            </div>

            <Modal
                isOpen={registerModalOpen}
                onClose={() => {
                    if (isSubmitting) return;
                    if (saveConfirmModalOpen) {
                        setSaveConfirmModalOpen(false);
                    } else {
                        setRegisterModalOpen(false);
                    }
                }}
                title={
                    saveConfirmModalOpen
                        ? 'Konfirmasi Pendaftaran Pasien'
                        : 'Form Pendaftaran Kunjungan Pasien'
                }
                size="xl"
            >
                {saveConfirmModalOpen ? (
                    /* VIEW KONFIRMASI SIMPAN (ANTI-OVERLAP) */
                    <div className="space-y-4 py-1">
                        <div className="rounded-xl border border-purple-100 bg-purple-50/50 p-4">
                            <h4 className="text-sm font-bold text-purple-900 mb-2 flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-purple-600 animate-pulse" />
                                Ringkasan Tiket Antrean &amp; Pendaftaran
                            </h4>
                            <div className="grid grid-cols-2 gap-3 text-xs">
                                <div>
                                    <span className="text-gray-500 block">Pemilik:</span>
                                    <strong className="text-gray-800">{data.nama_lengkap} (NIK: {data.nik})</strong>
                                </div>
                                <div>
                                    <span className="text-gray-500 block">Pasien Hewan:</span>
                                    <strong className="text-gray-800">
                                        {data.tipe_hewan === 'lama'
                                            ? existingAnimals.find((a) => String(a.id) === String(data.id_hewan))?.nama_hewan +
                                              ' (' +
                                              existingAnimals.find((a) => String(a.id) === String(data.id_hewan))?.no_rm +
                                              ')'
                                            : data.nama_hewan + ` (No. RM Baru: ${nextNoRm})`}
                                    </strong>
                                </div>
                                <div>
                                    <span className="text-gray-500 block">Triage Fisik:</span>
                                    <strong className="text-gray-800">BB {data.berat_badan} kg &bull; Suhu {data.suhu_tubuh} °C</strong>
                                </div>
                                <div>
                                    <span className="text-gray-500 block">Status Antrean:</span>
                                    <span className="font-bold text-amber-700">Antri (Menunggu Dokter)</span>
                                </div>
                            </div>
                            <div className="mt-3 pt-2.5 border-t border-purple-100 text-xs">
                                <span className="text-gray-500 block">Keluhan Awal (Anamnesa):</span>
                                <p className="text-gray-800 italic mt-0.5">{data.anamnesa}</p>
                            </div>
                        </div>

                        <p className="text-xs text-gray-500">
                            Pastikan data pasien dan pemilik telah sesuai. Setelah disimpan, nomor antrean akan otomatis terbit dan masuk ke antrean ruang periksa dokter.
                        </p>

                        <div className="flex justify-end gap-2.5 pt-3 border-t border-gray-100">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => setSaveConfirmModalOpen(false)}
                                disabled={isSubmitting}
                            >
                                Kembali Edit
                            </Button>
                            <Button
                                type="button"
                                variant="primary"
                                onClick={executeSubmitRegistration}
                                isLoading={isSubmitting}
                                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold"
                            >
                                Ya, Terbitkan Antrean
                            </Button>
                        </div>
                    </div>
                ) : (
                    /* VIEW FORM PENDAFTARAN LENGKAP */
                    <form onSubmit={handleValidateAndConfirm} className="space-y-4">
                        <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-3.5 space-y-3">
                            <div className="flex items-center justify-between">
                                <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                                    <span className="h-5 w-5 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-[11px] font-bold">
                                        1
                                    </span>
                                    Pencarian NIK &amp; Data Pemilik
                                </h4>
                                {nikSearchStatus === 'found' && (
                                    <span className="text-[10.5px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                                        ✓ Pemilik Terdaftar (Autofill)
                                    </span>
                                )}
                                {nikSearchStatus === 'not_found' && (
                                    <span className="text-[10.5px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                                        ★ Registrasi Pemilik Baru
                                    </span>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Nomor Induk Kependudukan (NIK Pemilik 16 Digit) <span className="text-rose-500">*</span>
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        maxLength={16}
                                        value={data.nik}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, '');
                                            setData('nik', val);
                                            if (nikSearchStatus !== 'idle') setNikSearchStatus('idle');
                                        }}
                                        placeholder="Ketik 16 digit NIK KTP..."
                                        className="h-10 flex-1 rounded-lg border border-gray-300 bg-white px-3 font-mono text-sm text-gray-800 placeholder:text-gray-400 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                                    />
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={handleCheckNik}
                                        isLoading={isSearchingNik}
                                        className="h-10 px-4 text-xs font-semibold shrink-0 bg-white border-gray-300 hover:bg-gray-100 text-gray-800"
                                    >
                                        Cek NIK
                                    </Button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                                <div>
                                    <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                                        Nama Lengkap Pemilik <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.nama_lengkap}
                                        onChange={(e) => setData('nama_lengkap', e.target.value)}
                                        placeholder="Nama sesuai KTP..."
                                        className="h-9 w-full rounded-lg border border-gray-300 bg-white px-3 text-xs text-gray-800 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                                        Nomor HP / WhatsApp <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.no_hp_wa}
                                        onChange={(e) => setData('no_hp_wa', e.target.value)}
                                        placeholder="Contoh: 081234567890"
                                        className="h-9 w-full rounded-lg border border-gray-300 bg-white px-3 text-xs text-gray-800 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                                    />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                                        Alamat Lengkap Domisili <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.alamat_lengkap}
                                        onChange={(e) => setData('alamat_lengkap', e.target.value)}
                                        placeholder="Jalan, RT/RW, Kelurahan, Kecamatan..."
                                        className="h-9 w-full rounded-lg border border-gray-300 bg-white px-3 text-xs text-gray-800 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-3.5 space-y-3">
                            <div className="flex items-center justify-between">
                                <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                                    <span className="h-5 w-5 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-[11px] font-bold">
                                        2
                                    </span>
                                    Identitas Pasien Hewan (1 Hewan = 1 No. RM)
                                </h4>

                                {existingAnimals.length > 0 && (
                                    <div className="flex items-center gap-1.5 bg-white p-0.5 rounded-lg border border-gray-200 text-xs">
                                        <button
                                            type="button"
                                            onClick={() => setData('tipe_hewan', 'lama')}
                                            className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                                                data.tipe_hewan === 'lama'
                                                    ? 'bg-purple-600 text-white shadow-2xs'
                                                    : 'text-gray-600 hover:text-gray-900'
                                            }`}
                                        >
                                            Pasien Terdaftar ({existingAnimals.length})
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setData('tipe_hewan', 'baru');
                                                setData('id_hewan', '');
                                            }}
                                            className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                                                data.tipe_hewan === 'baru'
                                                    ? 'bg-purple-600 text-white shadow-2xs'
                                                    : 'text-gray-600 hover:text-gray-900'
                                            }`}
                                        >
                                            + Hewan Baru
                                        </button>
                                    </div>
                                )}
                            </div>

                            {data.tipe_hewan === 'lama' && existingAnimals.length > 0 ? (
                                <div className="space-y-2">
                                    <label className="block text-[11px] font-semibold text-gray-700">
                                        Pilih Hewan Milik Pemilik Ini yang Sedang Berkunjung Hari Ini:
                                    </label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                        {existingAnimals.map((animal) => {
                                            const isSelected = String(data.id_hewan) === String(animal.id);
                                            return (
                                                <button
                                                    key={animal.id}
                                                    type="button"
                                                    onClick={() => setData('id_hewan', animal.id)}
                                                    className={`p-3 rounded-lg border text-left transition-all ${
                                                        isSelected
                                                            ? 'border-purple-600 bg-purple-50/70 ring-1 ring-purple-600'
                                                            : 'border-gray-200 bg-white hover:border-gray-300'
                                                    }`}
                                                >
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="font-mono font-bold text-xs text-purple-700 bg-white px-2 py-0.5 rounded border border-purple-200">
                                                            {animal.no_rm}
                                                        </span>
                                                        <span className="text-[10px] font-semibold text-gray-500">
                                                            {animal.jenis_kelamin}
                                                        </span>
                                                    </div>
                                                    <h5 className="font-bold text-xs text-gray-900">{animal.nama_hewan}</h5>
                                                    <p className="text-[11px] text-gray-500 mt-0.5">
                                                        {animal.nama_jenis} &bull; {animal.umur} &bull; {animal.warna_hewan}
                                                    </p>
                                                    <div className="mt-1.5 pt-1.5 border-t border-gray-100 text-[10px] text-gray-400">
                                                        Kunjungan Terakhir: {animal.last_visit}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ) : (
                                /* Mode B: Mendaftarkan Hewan Baru (Generate No. RM Baru e.g. RM0003) */
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between bg-purple-50/70 p-2.5 rounded-lg border border-purple-100">
                                        <div className="flex items-center gap-2">
                                            <span className="h-6 w-6 rounded-md bg-purple-600 text-white flex items-center justify-center text-xs font-bold">
                                                RM
                                            </span>
                                            <div>
                                                <span className="text-[11px] text-purple-800 font-semibold block leading-tight">
                                                    Nomor Rekam Medis Baru Otomatis:
                                                </span>
                                                <strong className="font-mono text-sm font-black text-purple-900">
                                                    {nextNoRm}
                                                </strong>
                                            </div>
                                        </div>
                                        <span className="text-[10px] text-purple-700 font-medium">
                                            1 Hewan = 1 No. RM Permanen
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                                                Nama Pasien Hewan <span className="text-rose-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={data.nama_hewan}
                                                onChange={(e) => setData('nama_hewan', e.target.value)}
                                                placeholder="Contoh: Milo, Si Belang, Banteng..."
                                                className="h-9 w-full rounded-lg border border-gray-300 bg-white px-3 text-xs text-gray-800 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                                                Jenis / Spesies Hewan <span className="text-rose-500">*</span>
                                            </label>
                                            <select
                                                value={data.id_jenis_hewan}
                                                onChange={(e) => setData('id_jenis_hewan', e.target.value)}
                                                className="h-9 w-full rounded-lg border border-gray-300 bg-white px-2.5 text-xs text-gray-800 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                                            >
                                                {animalTypes.map((type) => (
                                                    <option key={type.id} value={type.id}>
                                                        {type.nama_jenis}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                                                Jenis Kelamin <span className="text-rose-500">*</span>
                                            </label>
                                            <select
                                                value={data.jenis_kelamin}
                                                onChange={(e) => setData('jenis_kelamin', e.target.value as any)}
                                                className="h-9 w-full rounded-lg border border-gray-300 bg-white px-2.5 text-xs text-gray-800 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                                            >
                                                <option value="Jantan">Jantan</option>
                                                <option value="Betina">Betina</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                                                Perkiraan Umur <span className="text-rose-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={data.umur}
                                                onChange={(e) => setData('umur', e.target.value)}
                                                placeholder="Contoh: 1 Tahun 4 Bulan"
                                                className="h-9 w-full rounded-lg border border-gray-300 bg-white px-3 text-xs text-gray-800 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                                            />
                                        </div>

                                        <div className="sm:col-span-2">
                                            <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                                                Warna / Tanda Khusus Hewan <span className="text-rose-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={data.warna_hewan}
                                                onChange={(e) => setData('warna_hewan', e.target.value)}
                                                placeholder="Contoh: Oranye Putih Calico, Cokelat Kemerahan..."
                                                className="h-9 w-full rounded-lg border border-gray-300 bg-white px-3 text-xs text-gray-800 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-3.5 space-y-3">
                            <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                                <span className="h-5 w-5 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-[11px] font-bold">
                                    3
                                </span>
                                Pemeriksaan Awal Loket (Triage &amp; Anamnesa Hari Ini)
                            </h4>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                                        Berat Badan (kg) <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={data.berat_badan}
                                        onChange={(e) => setData('berat_badan', e.target.value)}
                                        placeholder="Contoh: 4.25 (kg)"
                                        className="h-9 w-full rounded-lg border border-gray-300 bg-white px-3 font-mono text-xs text-gray-800 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                                        Suhu Tubuh (°C) <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={data.suhu_tubuh}
                                        onChange={(e) => setData('suhu_tubuh', e.target.value)}
                                        placeholder="Contoh: 38.6 (°C)"
                                        className="h-9 w-full rounded-lg border border-gray-300 bg-white px-3 font-mono text-xs text-gray-800 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                                        Keluhan Utama / Anamnesa Pemilik Hari Ini <span className="text-rose-500">*</span>
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={data.anamnesa}
                                        onChange={(e) => setData('anamnesa', e.target.value)}
                                        placeholder="Deskripsikan gejala awal, berapa lama sakit, nafsu makan, muntah, atau tujuan vaksinasi/IB..."
                                        className="w-full rounded-lg border border-gray-300 bg-white p-2.5 text-xs text-gray-800 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2.5 pt-2 border-t border-gray-100">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => setRegisterModalOpen(false)}
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs"
                                leftIcon={
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                }
                            >
                                Lanjut &amp; Terbitkan Antrean
                            </Button>
                        </div>
                    </form>
                )}
            </Modal>
        </DashboardLayout>
    );
}
