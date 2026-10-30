import React, { useRef, useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Button, Dropdown, Modal, Pagination, Select, useToast } from '@/components/ui';

interface VisitHistoryItem {
    id: number;
    tgl: string;
    berat_badan: string;
    suhu_tubuh: string;
    anamnesa: string;
    status: string;
    dokter: string;
    diagnosa: string;
    terapi: string;
    catatan?: string;
}

interface PatientItem {
    id: number;
    no_rm: string;
    nama_hewan: string;
    jenis_hewan: string;
    id_jenis_hewan: number;
    jenis_kelamin: string;
    umur: string;
    warna_hewan: string;
    id_pemilik: number;
    nama_pemilik: string;
    nik_pemilik: string;
    no_hp_pemilik: string;
    alamat_pemilik: string;
    total_kunjungan: number;
    last_visit_date: string;
    created_at: string;
    riwayat_kunjungan: VisitHistoryItem[];
}

interface AnimalTypeItem {
    id: number;
    nama_jenis: string;
}

interface PatientsPageProps {
    patients: {
        data: PatientItem[];
        links: any[];
        current_page: number;
        last_page: number;
        from: number;
        to: number;
        total: number;
    };
    animalTypes: AnimalTypeItem[];
    nextNoRm: string;
    filters: {
        search?: string;
        jenis_hewan?: string;
    };
}

export default function PatientsIndex({
    patients,
    animalTypes,
    nextNoRm,
    filters,
}: PatientsPageProps) {
    const { success, error, warning } = useToast();

    const [search, setSearch] = useState(filters.search || '');
    const [speciesFilter, setSpeciesFilter] = useState(filters.jenis_hewan || '');
    const isFirstSearchRender = useRef(true);

    const [historyModalOpen, setHistoryModalOpen] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState<PatientItem | null>(null);

    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editingPatient, setEditingPatient] = useState<PatientItem | null>(null);
    const [saveConfirmModalOpen, setSaveConfirmModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isSubmittingRef = useRef(false);

    React.useEffect(() => {
        if (isFirstSearchRender.current) {
            isFirstSearchRender.current = false;
            return;
        }

        const timer = setTimeout(() => {
            router.get(
                '/admin/pasien',
                {
                    search: search || undefined,
                    jenis_hewan: speciesFilter || undefined,
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

    const { data, setData, errors, clearErrors } = useForm({
        id_jenis_hewan: '',
        nama_hewan: '',
        jenis_kelamin: 'Jantan' as 'Jantan' | 'Betina',
        umur: '',
        warna_hewan: '',
    });

    const handleFilterSpecies = (id: string) => {
        setSpeciesFilter(id);
        router.get(
            '/admin/pasien',
            {
                search: search || undefined,
                jenis_hewan: id || undefined,
            },
            { preserveState: true, replace: true }
        );
    };

    const handleResetFilter = () => {
        setSearch('');
        setSpeciesFilter('');
        router.get('/admin/pasien', {}, { preserveState: true, replace: true });
    };

    const openHistoryModal = (patient: PatientItem) => {
        setSelectedPatient(patient);
        setHistoryModalOpen(true);
    };

    const openEditModal = (patient: PatientItem) => {
        setEditingPatient(patient);
        clearErrors();
        setData({
            id_jenis_hewan: String(patient.id_jenis_hewan),
            nama_hewan: patient.nama_hewan,
            jenis_kelamin: patient.jenis_kelamin as 'Jantan' | 'Betina',
            umur: patient.umur,
            warna_hewan: patient.warna_hewan,
        });
        setSaveConfirmModalOpen(false);
        setIsSubmitting(false);
        isSubmittingRef.current = false;
        setEditModalOpen(true);
    };

    const handleValidateEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!data.nama_hewan.trim()) {
            warning('Nama pasien hewan wajib diisi!');
            return;
        }
        if (!data.umur.trim()) {
            warning('Umur hewan wajib diisi!');
            return;
        }
        if (!data.warna_hewan.trim()) {
            warning('Warna hewan wajib diisi!');
            return;
        }
        setSaveConfirmModalOpen(true);
    };

    const executeUpdatePatient = () => {
        if (!editingPatient || isSubmittingRef.current || isSubmitting) return;
        isSubmittingRef.current = true;
        setIsSubmitting(true);

        router.put(`/admin/pasien/${editingPatient.id}`, data, {
            preserveScroll: true,
            onSuccess: () => {
                setSaveConfirmModalOpen(false);
                setEditModalOpen(false);
                success(`Data pasien ${editingPatient.nama_hewan} (${editingPatient.no_rm}) berhasil diperbarui!`);
            },
            onError: (errs) => {
                setSaveConfirmModalOpen(false);
                const firstErr = Object.values(errs)[0];
                error(typeof firstErr === 'string' ? firstErr : 'Gagal memperbarui data pasien.');
            },
            onFinish: () => {
                isSubmittingRef.current = false;
                setIsSubmitting(false);
            },
        });
    };

    const activeSpeciesName = animalTypes.find((t) => String(t.id) === String(speciesFilter))?.nama_jenis;

    return (
        <DashboardLayout title="Master Pasien & Riwayat Rekam Medis">
            <Head title="Master Pasien & Pemilik" />

            <div className="space-y-4 max-w-[1600px] mx-auto">
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xs">
                    <div className="p-3 border-b border-gray-200 bg-white">
                        <div className="flex flex-col lg:flex-row gap-2.5 items-stretch lg:items-center justify-between">
                            <div className="flex flex-1 flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
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
                                        placeholder="Cari No. RM, nama hewan, nama pemilik, NIK, atau nomor WhatsApp..."
                                        className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50/50 pl-9 pr-8 text-sm text-gray-800 placeholder:text-gray-400 transition-all focus:border-purple-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                                    />
                                    {search && (
                                        <button
                                            type="button"
                                            onClick={() => setSearch('')}
                                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                                            title="Hapus pencarian"
                                        >
                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    )}
                                </div>

                                <div className="w-full sm:w-[220px] shrink-0">
                                    <Dropdown size="md" matchWidth>
                                        <Dropdown.Trigger>
                                            <button
                                                type="button"
                                                className="flex h-10 w-full items-center justify-between gap-2.5 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-1 focus:ring-purple-500"
                                            >
                                                <span className="truncate">
                                                    {activeSpeciesName ? `Jenis: ${activeSpeciesName}` : 'Semua Spesies Hewan'}
                                                </span>
                                                <svg className="h-4 w-4 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 9-7 7-7-7" />
                                                </svg>
                                            </button>
                                        </Dropdown.Trigger>
                                        <Dropdown.Content align="left" matchWidth className="py-2 max-h-64 overflow-y-auto">
                                            <Dropdown.Item
                                                onClick={() => handleFilterSpecies('')}
                                                className={`px-3 py-2 text-xs transition-colors ${
                                                    !speciesFilter ? 'bg-purple-50 font-semibold text-purple-700' : 'text-gray-700 hover:bg-gray-50'
                                                }`}
                                            >
                                                Semua Spesies Hewan
                                            </Dropdown.Item>
                                            {animalTypes.map((type) => (
                                                <Dropdown.Item
                                                    key={type.id}
                                                    onClick={() => handleFilterSpecies(String(type.id))}
                                                    className={`px-3 py-2 text-xs transition-colors ${
                                                        String(speciesFilter) === String(type.id)
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
                            </div>

                            <div className="shrink-0 pt-2 lg:pt-0 border-t border-gray-100 lg:border-t-0">
                                <Button
                                    type="button"
                                    variant="primary"
                                    size="md"
                                    onClick={() => router.get('/admin/pendaftaran')}
                                    className="h-10 px-4 text-xs font-semibold w-full sm:w-auto rounded-lg bg-purple-600 hover:bg-purple-700 text-white shadow-xs"
                                    leftIcon={
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                                        </svg>
                                    }
                                >
                                    Daftarkan Kunjungan / Pasien
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto min-h-[350px]">
                        <table className="w-full min-w-[1050px] table-fixed text-left text-xs border-collapse border border-gray-200">
                            <thead>
                                <tr className="bg-gray-100/90 border-b border-gray-200 text-[11px] font-bold uppercase tracking-wider text-gray-700">
                                    <th className="py-3 px-3.5 border-r border-gray-200 text-center font-bold w-14 shrink-0">No.</th>
                                    <th className="py-3 px-3.5 border-r border-gray-200 text-center font-bold w-36 shrink-0">No. Rekam Medis</th>
                                    <th className="py-3 px-3.5 border-r border-gray-200 text-center font-bold w-52 shrink-0">Pasien Hewan</th>
                                    <th className="py-3 px-3.5 border-r border-gray-200 text-center font-bold w-52 shrink-0">Pemilik &amp; NIK</th>
                                    <th className="py-3 px-3.5 border-r border-gray-200 text-center font-bold w-44 shrink-0">Ciri Fisik</th>
                                    <th className="py-3 px-3.5 border-r border-gray-200 text-center font-bold">Kunjungan Terakhir</th>
                                    <th className="py-3 px-3.5 text-center font-bold w-36 shrink-0">Aksi &amp; Riwayat</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {patients.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-16 text-center">
                                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-purple-50 text-purple-600 mb-3 border border-purple-100">
                                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                                </svg>
                                            </div>
                                            <h4 className="text-sm font-semibold text-gray-800">
                                                {search || speciesFilter ? 'Pencarian Tidak Ditemukan' : 'Belum Ada Data Pasien Hewan'}
                                            </h4>
                                            <p className="mt-1 text-xs text-gray-500 max-w-sm mx-auto">
                                                {search || speciesFilter ? (
                                                    <>
                                                        Tidak ada data pasien yang cocok dengan kata kunci{' '}
                                                        <span className="font-semibold text-purple-700">"{search}"</span>
                                                        {speciesFilter ? ` pada filter spesies ${activeSpeciesName || speciesFilter}` : ''}.
                                                    </>
                                                ) : (
                                                    'Belum ada pasien hewan yang terdaftar di dalam sistem.'
                                                )}
                                            </p>
                                            {(search || speciesFilter) && (
                                                <button
                                                    type="button"
                                                    onClick={handleResetFilter}
                                                    className="mt-3.5 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 transition-colors"
                                                >
                                                    Bersihkan Pencarian & Filter
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ) : (
                                    <>
                                        {patients.data.map((patient, index) => (
                                            <tr
                                                key={patient.id}
                                                className="odd:bg-white even:bg-gray-50/70 hover:bg-purple-50/40 transition-colors h-[58px]"
                                            >
                                                <td className="py-3 px-3.5 border-r border-gray-200 text-center font-medium text-gray-600">
                                                    {patients.from ? patients.from + index : index + 1}
                                                </td>

                                                <td className="py-3 px-3.5 border-r border-gray-200 text-center">
                                                    <span className="font-mono font-bold text-xs text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 inline-block">
                                                        {patient.no_rm}
                                                    </span>
                                                </td>

                                                <td className="py-3 px-3.5 border-r border-gray-200">
                                                    <span className="font-bold text-xs text-gray-900 block w-full truncate leading-tight" title={patient.nama_hewan}>
                                                        {patient.nama_hewan}
                                                    </span>
                                                    <span className="text-[11px] text-gray-500 block w-full truncate mt-0.5" title={`${patient.jenis_hewan} • ${patient.jenis_kelamin}`}>
                                                        {patient.jenis_hewan} &bull; {patient.jenis_kelamin}
                                                    </span>
                                                </td>

                                                <td className="py-3 px-3.5 border-r border-gray-200">
                                                    <span className="font-bold text-xs text-gray-900 block w-full truncate leading-tight" title={patient.nama_pemilik}>
                                                        {patient.nama_pemilik}
                                                    </span>
                                                    <span className="text-[11px] text-gray-500 font-mono block w-full truncate mt-0.5" title={`NIK: ${patient.nik_pemilik}`}>
                                                        NIK: {patient.nik_pemilik}
                                                    </span>
                                                </td>

                                                <td className="py-3 px-3.5 border-r border-gray-200">
                                                    <span className="text-xs text-gray-800 font-medium block w-full truncate" title={patient.warna_hewan}>
                                                        {patient.warna_hewan}
                                                    </span>
                                                    <span className="text-[11px] text-gray-500 block w-full truncate mt-0.5" title={`Umur: ${patient.umur}`}>
                                                        Umur: {patient.umur}
                                                    </span>
                                                </td>

                                                <td className="py-3 px-3.5 border-r border-gray-200">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-xs font-semibold text-gray-700">
                                                            {patient.last_visit_date}
                                                        </span>
                                                        <span className="text-xs text-purple-700 font-semibold">
                                                            ({patient.total_kunjungan}x)
                                                        </span>
                                                    </div>
                                                </td>

                                                <td className="py-3 px-3.5 text-center">
                                                    <div className="flex items-center justify-center gap-1.5">
                                                        <button
                                                            type="button"
                                                            onClick={() => openHistoryModal(patient)}
                                                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-purple-200 bg-purple-50/60 hover:bg-purple-100 text-purple-700 text-xs font-semibold transition-colors"
                                                            title="Lihat Riwayat Rekam Medis Lengkap"
                                                        >
                                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                            </svg>
                                                            <span>Riwayat RM</span>
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() => openEditModal(patient)}
                                                            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 border border-gray-200 hover:border-purple-300 hover:bg-purple-50 hover:text-purple-700 transition-all focus:outline-none"
                                                            title="Edit Identitas Hewan"
                                                        >
                                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {patients.data.length > 0 && patients.data.length < 5 &&
                                            Array.from({ length: 5 - patients.data.length }).map((_, idx) => (
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
                            <span className="font-bold text-gray-800">{patients.from || 0}</span>{' '}
                            hingga{' '}
                            <span className="font-bold text-gray-800">{patients.to || 0}</span>{' '}
                            dari total{' '}
                            <span className="font-bold text-gray-800">{patients.total}</span> data pasien terdaftar.
                        </p>
                        <Pagination
                            links={patients.links}
                            currentPage={patients.current_page}
                            totalPages={patients.last_page}
                        />
                    </div>
                </div>
            </div>

            <Modal
                isOpen={historyModalOpen}
                onClose={() => setHistoryModalOpen(false)}
                title={`Rekam Medis Pasien: ${selectedPatient?.nama_hewan || ''} (${selectedPatient?.no_rm || ''})`}
                size="xl"
            >
                {selectedPatient && (
                    <div className="space-y-4">
                        <div className="rounded-xl border border-purple-100 bg-purple-50/50 p-3.5 grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                            <div>
                                <span className="text-gray-500 block text-[11px]">No. RM Permanen:</span>
                                <strong className="font-mono text-purple-800 font-bold">{selectedPatient.no_rm}</strong>
                            </div>
                            <div>
                                <span className="text-gray-500 block text-[11px]">Spesies / JK:</span>
                                <strong className="text-gray-800">{selectedPatient.jenis_hewan} ({selectedPatient.jenis_kelamin})</strong>
                            </div>
                            <div>
                                <span className="text-gray-500 block text-[11px]">Nama Pemilik:</span>
                                <strong className="text-gray-800">{selectedPatient.nama_pemilik}</strong>
                            </div>
                            <div>
                                <span className="text-gray-500 block text-[11px]">Kontak WhatsApp:</span>
                                <strong className="text-gray-800 font-mono">{selectedPatient.no_hp_pemilik}</strong>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-3 flex items-center justify-between">
                                <span>Riwayat Kunjungan &amp; Diagnosis Dokter ({selectedPatient.riwayat_kunjungan.length})</span>
                                <span className="text-[10px] text-gray-500 font-normal">Urutan dari terbaru</span>
                            </h4>

                            {selectedPatient.riwayat_kunjungan.length === 0 ? (
                                <div className="p-6 text-center rounded-xl border border-dashed border-gray-200 text-gray-400 text-xs">
                                    Belum ada catatan riwayat rekam medis untuk pasien ini.
                                </div>
                            ) : (
                                <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                                    {selectedPatient.riwayat_kunjungan.map((item, idx) => (
                                        <div
                                            key={item.id}
                                            className="p-3.5 rounded-xl border border-gray-200 bg-white shadow-2xs space-y-2 hover:border-purple-200 transition-colors"
                                        >
                                            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-100 text-purple-700 font-bold text-[10px]">
                                                        #{selectedPatient.riwayat_kunjungan.length - idx}
                                                    </span>
                                                    <span className="font-bold text-xs text-gray-900">{item.tgl}</span>
                                                    <span className="text-[10.5px] text-gray-500">
                                                        (BB: {item.berat_badan} &bull; Suhu: {item.suhu_tubuh})
                                                    </span>
                                                </div>
                                                <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                    {item.status}
                                                </span>
                                            </div>

                                            <div className="text-xs space-y-1">
                                                <div>
                                                    <span className="text-gray-500 font-semibold block text-[11px]">Anamnesa / Keluhan:</span>
                                                    <p className="text-gray-700 italic">{item.anamnesa}</p>
                                                </div>
                                                <div className="pt-1">
                                                    <span className="text-purple-700 font-semibold block text-[11px]">Diagnosa Dokter ({item.dokter}):</span>
                                                    <p className="font-semibold text-gray-900">{item.diagnosa}</p>
                                                </div>
                                                <div className="pt-1">
                                                    <span className="text-emerald-700 font-semibold block text-[11px]">Terapi / Resep Pengobatan:</span>
                                                    <p className="text-gray-800">{item.terapi}</p>
                                                </div>
                                                {item.catatan && (
                                                    <div className="pt-1 text-[11px] text-gray-500">
                                                        <strong>Catatan:</strong> {item.catatan}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end pt-2 border-t border-gray-100">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => setHistoryModalOpen(false)}
                            >
                                Tutup
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>

            <Modal
                isOpen={editModalOpen}
                onClose={() => {
                    if (isSubmitting) return;
                    if (saveConfirmModalOpen) {
                        setSaveConfirmModalOpen(false);
                    } else {
                        setEditModalOpen(false);
                    }
                }}
                title={
                    saveConfirmModalOpen
                        ? 'Konfirmasi Simpan Perubahan Pasien'
                        : `Edit Identitas Pasien: ${editingPatient?.nama_hewan || ''} (${editingPatient?.no_rm || ''})`
                }
                size="md"
            >
                {saveConfirmModalOpen ? (
                    <div className="space-y-4 py-1">
                        <div className="rounded-xl border border-purple-100 bg-purple-50/60 p-3.5 text-xs space-y-1.5">
                            <div><strong>Nama Hewan:</strong> {data.nama_hewan}</div>
                            <div><strong>Spesies:</strong> {animalTypes.find((t) => String(t.id) === String(data.id_jenis_hewan))?.nama_jenis}</div>
                            <div><strong>Jenis Kelamin:</strong> {data.jenis_kelamin}</div>
                            <div><strong>Umur:</strong> {data.umur}</div>
                            <div><strong>Warna / Ciri Fisik:</strong> {data.warna_hewan}</div>
                        </div>
                        <p className="text-xs text-gray-500">
                            Apakah Anda yakin ingin memperbarui data identitas pasien ini?
                        </p>
                        <div className="flex justify-end gap-2.5 pt-2 border-t border-gray-100">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => setSaveConfirmModalOpen(false)}
                                disabled={isSubmitting}
                            >
                                Kembali
                            </Button>
                            <Button
                                type="button"
                                variant="primary"
                                onClick={executeUpdatePatient}
                                isLoading={isSubmitting}
                                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold"
                            >
                                Ya, Simpan Perubahan
                            </Button>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleValidateEdit} className="space-y-3.5">
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                                Nama Pasien Hewan <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={data.nama_hewan}
                                onChange={(e) => setData('nama_hewan', e.target.value)}
                                className="h-9 w-full rounded-lg border border-gray-300 bg-white px-3 text-xs text-gray-800 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
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

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
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
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Umur <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.umur}
                                    onChange={(e) => setData('umur', e.target.value)}
                                    className="h-9 w-full rounded-lg border border-gray-300 bg-white px-3 text-xs text-gray-800 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                                Warna / Ciri Fisik Hewan <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={data.warna_hewan}
                                onChange={(e) => setData('warna_hewan', e.target.value)}
                                className="h-9 w-full rounded-lg border border-gray-300 bg-white px-3 text-xs text-gray-800 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                            />
                        </div>

                        <div className="flex justify-end gap-2.5 pt-2 border-t border-gray-100">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => setEditModalOpen(false)}
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs"
                            >
                                Lanjut Simpan
                            </Button>
                        </div>
                    </form>
                )}
            </Modal>
        </DashboardLayout>
    );
}
