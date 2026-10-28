import React, { useRef, useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Button, Dropdown, Modal, Pagination, Select, useToast } from '@/components/ui';

interface InventoryItem {
    id: number;
    kode_barang: string;
    nama_barang: string;
    kategori: string;
    jumlah: number;
    kondisi: 'Baik' | 'Rusak Ringan' | 'Rusak Berat';
    keterangan: string | null;
    pengelola: string;
    created_at: string;
}

interface InventoriesPageProps {
    inventories: {
        data: InventoryItem[];
        links: any[];
        current_page: number;
        last_page: number;
        from: number;
        to: number;
        total: number;
    };
    filters: {
        search?: string;
        kondisi?: string;
    };
}

const KATEGORI_OPTIONS = [
    { value: 'Alat Medis', label: 'Alat Medis & Diagnostik' },
    { value: 'Instrumen Operasi', label: 'Instrumen Bedah & Operasi Minor' },
    { value: 'Peralatan Sterilisasi', label: 'Peralatan Sterilisasi & Sanitasi' },
    { value: 'Peralatan Diagnostik', label: 'Peralatan Diagnostik & Lab Lapangan' },
    { value: 'Perlengkapan Lapangan', label: 'Perlengkapan Lapangan & Penangkapan HPR' },
    { value: 'Mobilitas & Transportasi', label: 'Mobilitas, Kendaraan & Logistik' },
    { value: 'Teknologi Informasi & Kantor', label: 'Teknologi Informasi & Kantor' },
];

const KONDISI_OPTIONS = [
    { value: 'Baik', label: 'Baik (Siap Pakai & Berfungsi Normal)' },
    { value: 'Rusak Ringan', label: 'Rusak Ringan (Perlu Kalibrasi / Servis)' },
    { value: 'Rusak Berat', label: 'Rusak Berat (Tidak Berfungsi / Perlu Afkir)' },
];

const KONDISI_FILTER_OPTIONS: Record<string, string> = {
    '': 'Semua Kondisi Fisik',
    'Baik': 'Kondisi: Baik (Siap Pakai)',
    'Rusak Ringan': 'Kondisi: Rusak Ringan',
    'Rusak Berat': 'Kondisi: Rusak Berat',
};

export default function InventoriesIndex({ inventories, filters }: InventoriesPageProps) {
    const { success, error, warning } = useToast();

    const [search, setSearch] = useState(filters.search || '');
    const [conditionFilter, setConditionFilter] = useState(filters.kondisi || '');

    const [formModalOpen, setFormModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

    const [saveConfirmModalOpen, setSaveConfirmModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isSubmittingRef = useRef(false);

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<InventoryItem | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const { data, setData, errors, reset, clearErrors } = useForm({
        kode_barang: '',
        nama_barang: '',
        kategori: 'Alat Medis',
        jumlah: 1 as number | string,
        kondisi: 'Baik',
        keterangan: '',
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/super/inventaris',
            {
                search: search || undefined,
                kondisi: conditionFilter || undefined,
            },
            { preserveState: true, replace: true }
        );
    };

    const handleFilterCondition = (cond: string) => {
        setConditionFilter(cond);
        router.get(
            '/super/inventaris',
            {
                search: search || undefined,
                kondisi: cond || undefined,
            },
            { preserveState: true, replace: true }
        );
    };

    const handleResetFilter = () => {
        setSearch('');
        setConditionFilter('');
        router.get('/super/inventaris', {}, { preserveState: true, replace: true });
    };

    const openCreateModal = () => {
        setEditingItem(null);
        setSaveConfirmModalOpen(false);
        setDeleteModalOpen(false);
        isSubmittingRef.current = false;
        setIsSubmitting(false);
        reset();
        clearErrors();
        setData({
            kode_barang: '',
            nama_barang: '',
            kategori: 'Alat Medis',
            jumlah: 1,
            kondisi: 'Baik',
            keterangan: '',
        });
        setFormModalOpen(true);
    };

    const openEditModal = (item: InventoryItem) => {
        setEditingItem(item);
        setSaveConfirmModalOpen(false);
        setDeleteModalOpen(false);
        isSubmittingRef.current = false;
        setIsSubmitting(false);
        clearErrors();
        setData({
            kode_barang: item.kode_barang,
            nama_barang: item.nama_barang,
            kategori: item.kategori,
            jumlah: item.jumlah,
            kondisi: item.kondisi,
            keterangan: item.keterangan || '',
        });
        setFormModalOpen(true);
    };

    const closeFormModal = () => {
        if (isSubmittingRef.current || isSubmitting) return;
        setFormModalOpen(false);
        setSaveConfirmModalOpen(false);
        clearErrors();
    };

    const notifyValidation = (message: string) => {
        if (typeof warning === 'function') {
            warning(message, 'Validasi Formulir');
        } else if (typeof error === 'function') {
            error(message, 'Validasi Formulir');
        }
    };

    const validateForm = () => {
        if (!data.kode_barang || !data.kode_barang.trim()) {
            notifyValidation('Kode barang / inventaris wajib diisi! (Contoh: INV-MED-008)');
            return false;
        }

        if (!data.nama_barang || !data.nama_barang.trim()) {
            notifyValidation('Nama sarana / peralatan wajib diisi!');
            return false;
        }

        if (!data.kategori || !data.kategori.trim()) {
            notifyValidation('Kategori sarana wajib dipilih!');
            return false;
        }

        if (
            data.jumlah === '' ||
            data.jumlah === null ||
            data.jumlah === undefined ||
            isNaN(Number(data.jumlah)) ||
            Number(data.jumlah) < 1
        ) {
            notifyValidation('Jumlah unit harus berupa angka minimal 1 unit!');
            return false;
        }

        if (!data.kondisi || !data.kondisi.trim()) {
            notifyValidation('Kondisi fisik peralatan wajib dipilih!');
            return false;
        }

        return true;
    };

    const handleRequestSave = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (isSubmittingRef.current || isSubmitting) return;

        if (!validateForm()) {
            return;
        }

        setSaveConfirmModalOpen(true);
    };

    const executeSubmitForm = () => {
        if (isSubmittingRef.current || isSubmitting) return;
        isSubmittingRef.current = true;
        setIsSubmitting(true);

        const payload = {
            kode_barang: data.kode_barang.trim().toUpperCase(),
            nama_barang: data.nama_barang.trim(),
            kategori: data.kategori.trim(),
            jumlah: Number(data.jumlah),
            kondisi: data.kondisi,
            keterangan: data.keterangan ? data.keterangan.trim() : '',
        };

        if (editingItem) {
            router.put(`/super/inventaris/${editingItem.id}`, payload, {
                preserveScroll: true,
                onSuccess: () => {
                    setSaveConfirmModalOpen(false);
                    setFormModalOpen(false);
                    success(`Data inventaris ${data.nama_barang} berhasil diperbarui!`);
                },
                onError: (errs) => {
                    setSaveConfirmModalOpen(false);
                    const firstErr = Object.values(errs)[0];
                    error(
                        typeof firstErr === 'string'
                            ? firstErr
                            : 'Gagal memperbarui inventaris. Mohon periksa isian formulir.'
                    );
                },
                onFinish: () => {
                    isSubmittingRef.current = false;
                    setIsSubmitting(false);
                },
            });
        } else {
            router.post('/super/inventaris', payload, {
                preserveScroll: true,
                onSuccess: () => {
                    setSaveConfirmModalOpen(false);
                    setFormModalOpen(false);
                    success(`Peralatan baru ${data.nama_barang} berhasil didaftarkan!`);
                },
                onError: (errs) => {
                    setSaveConfirmModalOpen(false);
                    const firstErr = Object.values(errs)[0];
                    error(
                        typeof firstErr === 'string'
                            ? firstErr
                            : 'Gagal mendaftarkan peralatan. Pastikan kode barang unik dan belum terdaftar.'
                    );
                },
                onFinish: () => {
                    isSubmittingRef.current = false;
                    setIsSubmitting(false);
                },
            });
        }
    };

    const confirmDelete = (item: InventoryItem) => {
        setItemToDelete(item);
        setDeleteModalOpen(true);
    };

    const handleDelete = () => {
        if (!itemToDelete) return;
        setIsDeleting(true);
        router.delete(`/super/inventaris/${itemToDelete.id}`, {
            preserveScroll: true,
            onSuccess: (page) => {
                setIsDeleting(false);
                setDeleteModalOpen(false);
                const flashError = (page.props as any)?.flash?.error;
                if (flashError) {
                    error(flashError);
                } else {
                    success(`Barang inventaris ${itemToDelete.nama_barang} (${itemToDelete.kode_barang}) berhasil dihapus.`);
                }
            },
            onError: () => {
                setIsDeleting(false);
                error('Gagal menghapus barang inventaris.');
            },
        });
    };

    return (
        <DashboardLayout title="Inventaris Peralatan Puskeswan">
            <Head title="Inventaris Peralatan" />

            <div className="space-y-4 max-w-[1600px] mx-auto">
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
                                        placeholder="Cari kode barang, nama peralatan, atau kategori..."
                                        className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50/50 pl-9 pr-3 text-sm text-gray-800 placeholder:text-gray-400 transition-all focus:border-purple-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                                    />
                                </div>

                                <div className="w-full sm:w-[260px] shrink-0">
                                    <Dropdown size="md" matchWidth>
                                        <Dropdown.Trigger>
                                            <button
                                                type="button"
                                                className="flex h-10 w-full items-center justify-between gap-2.5 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-1 focus:ring-purple-500"
                                            >
                                                <div className="flex items-center gap-2 truncate">
                                                    <svg className="h-4.5 w-4.5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth="2"
                                                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                                        />
                                                    </svg>
                                                    <span className="truncate">
                                                        {KONDISI_FILTER_OPTIONS[conditionFilter] || 'Semua Kondisi Fisik'}
                                                    </span>
                                                </div>
                                                <svg className="h-4 w-4 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 9-7 7-7-7" />
                                                </svg>
                                            </button>
                                        </Dropdown.Trigger>
                                        <Dropdown.Content align="left" matchWidth className="py-2">
                                            {Object.entries(KONDISI_FILTER_OPTIONS).map(([val, label]) => (
                                                <Dropdown.Item
                                                    key={val}
                                                    onClick={() => handleFilterCondition(val)}
                                                    className={`px-3 py-2.5 text-xs transition-colors ${
                                                        conditionFilter === val
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
                                    {(search || conditionFilter) && (
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
                                    onClick={openCreateModal}
                                    className="h-10 px-4 text-xs font-semibold w-full sm:w-auto rounded-lg bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white shadow-xs transition-colors"
                                    leftIcon={
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                                        </svg>
                                    }
                                >
                                    Tambah Alat
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto min-h-[335px]">
                        <table className="w-full text-left text-xs border-collapse border border-gray-200">
                            <thead>
                                <tr className="bg-gray-100/90 border-b border-gray-200 text-[11px] font-bold uppercase tracking-wider text-gray-700">
                                    <th className="py-3 px-3.5 border-r border-gray-200 text-center font-bold w-12 shrink-0">No</th>
                                    <th className="py-3 px-3.5 border-r border-gray-200 text-center font-bold">Kode</th>
                                    <th className="py-3 px-3.5 border-r border-gray-200 text-center font-bold">Nama Peralatan</th>
                                    <th className="py-3 px-3.5 border-r border-gray-200 text-center font-bold">Kategori</th>
                                    <th className="py-3 px-3.5 border-r border-gray-200 text-center font-bold">Jumlah</th>
                                    <th className="py-3 px-3.5 border-r border-gray-200 text-center font-bold">Kondisi Fisik</th>
                                    <th className="py-3 px-3.5 border-r border-gray-200 text-center font-bold">Pengelola</th>
                                    <th className="py-3 px-3.5 text-center font-bold w-28 shrink-0">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {inventories.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-4 py-16 text-center">
                                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400 mb-3">
                                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                                                    />
                                                </svg>
                                            </div>
                                            <h4 className="text-sm font-semibold text-gray-700">Tidak ada data sarana inventaris</h4>
                                            <p className="mt-1 text-xs text-gray-400">
                                                {search || conditionFilter
                                                    ? 'Coba sesuaikan kata kunci pencarian atau ubah filter kondisi Anda.'
                                                    : 'Belum ada aset peralatan yang terdaftar di dalam inventaris.'}
                                            </p>
                                        </td>
                                    </tr>
                                ) : (
                                    <>
                                        {inventories.data.map((item, index) => (
                                            <tr
                                                key={item.id}
                                                className="odd:bg-white even:bg-gray-50/70 hover:bg-purple-50/40 transition-colors h-[58px]"
                                            >
                                                <td className="py-3 px-3.5 border-r border-gray-200 text-center font-medium text-gray-600">
                                                    {inventories.from ? inventories.from + index : index + 1}
                                                </td>

                                                <td className="py-3 px-3.5 border-r border-gray-200 font-mono text-xs font-bold text-purple-700 text-center">
                                                    {item.kode_barang}
                                                </td>

                                                <td className="py-3 px-3.5 border-r border-gray-200">
                                                    <span className="font-bold text-xs text-gray-900 block leading-snug break-words">
                                                        {item.nama_barang}
                                                    </span>
                                                    {item.keterangan && (
                                                        <span className="text-[11px] text-gray-500 block break-words mt-0.5 leading-relaxed">
                                                            {item.keterangan}
                                                        </span>
                                                    )}
                                                </td>

                                                <td className="py-3 px-3.5 border-r border-gray-200">
                                                    <span className="text-xs font-medium text-gray-800">
                                                        {item.kategori}
                                                    </span>
                                                </td>

                                                <td className="py-3 px-3.5 border-r border-gray-200 text-xs font-bold text-gray-900 text-center">
                                                    {item.jumlah} Unit
                                                </td>

                                                <td className="py-3 px-3.5 border-r border-gray-200 text-center">
                                                    {item.kondisi === 'Baik' && (
                                                        <span className="text-xs font-semibold text-emerald-600">
                                                            Siap Pakai
                                                        </span>
                                                    )}
                                                    {item.kondisi === 'Rusak Ringan' && (
                                                        <span className="text-xs font-semibold text-amber-600">
                                                            Rusak Ringan
                                                        </span>
                                                    )}
                                                    {item.kondisi === 'Rusak Berat' && (
                                                        <span className="text-xs font-semibold text-rose-600">
                                                            Rusak Berat
                                                        </span>
                                                    )}
                                                </td>

                                                <td className="py-3 px-3.5 border-r border-gray-200 text-xs text-gray-600 font-medium text-center">
                                                    {item.pengelola || '-'}
                                                </td>

                                                <td className="py-3 px-3.5 text-center">
                                                    <div className="flex items-center justify-center gap-1.5">
                                                        <button
                                                            type="button"
                                                            onClick={() => openEditModal(item)}
                                                            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 border border-gray-200 hover:border-purple-300 hover:bg-purple-50 hover:text-purple-700 transition-all focus:outline-none"
                                                            title="Edit Data Inventaris"
                                                        >
                                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth="2"
                                                                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                                                                />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => confirmDelete(item)}
                                                            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 border border-gray-200 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 transition-all focus:outline-none"
                                                            title="Hapus Inventaris"
                                                        >
                                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth="2"
                                                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                                />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {inventories.data.length > 0 && inventories.data.length < 5 &&
                                            Array.from({ length: 5 - inventories.data.length }).map((_, idx) => (
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
                            <span className="font-bold text-gray-800">{inventories.from || 0}</span>{' '}
                            hingga{' '}
                            <span className="font-bold text-gray-800">{inventories.to || 0}</span>{' '}
                            dari total{' '}
                            <span className="font-bold text-gray-800">{inventories.total}</span> unit peralatan.
                        </p>
                        <Pagination
                            links={inventories.links}
                            currentPage={inventories.current_page}
                            totalPages={inventories.last_page}
                        />
                    </div>
                </div>
            </div>

            <Modal
                isOpen={formModalOpen && !deleteModalOpen}
                onClose={() => {
                    if (isSubmitting) return;
                    if (saveConfirmModalOpen) {
                        setSaveConfirmModalOpen(false);
                    } else {
                        closeFormModal();
                    }
                }}
                title={
                    saveConfirmModalOpen
                        ? editingItem
                            ? 'Konfirmasi Simpan Perubahan'
                            : 'Konfirmasi Tambah Inventaris'
                        : editingItem
                          ? 'Edit Barang Inventaris'
                          : 'Tambah Inventaris Baru'
                }
                description={
                    saveConfirmModalOpen
                        ? undefined
                        : editingItem
                          ? `Perbarui rincian aset, kuantitas unit, dan status kelayakan fisik barang.`
                          : 'Catat aset sarana prasarana atau alat operasional baru Puskeswan.'
                }
                size={saveConfirmModalOpen ? 'sm' : 'lg'}
                footer={
                    saveConfirmModalOpen ? (
                        <div className="flex w-full justify-end gap-2">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => setSaveConfirmModalOpen(false)}
                                disabled={isSubmitting}
                                className="h-8 sm:h-9 px-3 sm:px-4 text-[11px] sm:text-xs font-semibold rounded-lg"
                            >
                                Periksa Kembali
                            </Button>
                            <Button
                                type="button"
                                variant="primary"
                                onClick={executeSubmitForm}
                                isLoading={isSubmitting}
                                disabled={isSubmitting}
                                className="h-8 sm:h-9 px-3 sm:px-4 text-[11px] sm:text-xs font-semibold rounded-lg bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {editingItem ? 'Ya, Simpan Perubahan' : 'Ya, Simpan Data'}
                            </Button>
                        </div>
                    ) : (
                        <div className="flex w-full justify-end gap-2">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={closeFormModal}
                                disabled={isSubmitting}
                                className="px-3 sm:px-4 h-8 sm:h-9 text-[11px] sm:text-xs font-semibold rounded-lg"
                            >
                                Batalkan
                            </Button>
                            <Button
                                type="button"
                                variant="primary"
                                onClick={() => handleRequestSave()}
                                isLoading={isSubmitting}
                                disabled={isSubmitting}
                                className="px-4 sm:px-5 h-8 sm:h-9 text-[11px] sm:text-xs font-semibold rounded-lg bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white transition-colors shadow-xs"
                            >
                                {editingItem ? 'Simpan Perubahan' : 'Simpan Barang'}
                            </Button>
                        </div>
                    )
                }
            >
                {saveConfirmModalOpen ? (
                    /* TAMPILAN VIEW-SWAP KONFIRMASI SIMPAN */
                    <div className="p-1 space-y-2.5 sm:space-y-3">
                        <div className="flex gap-2.5 sm:gap-3">
                            <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
                                <svg className="h-4.5 w-4.5 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-[11px] sm:text-xs leading-relaxed text-gray-650 font-medium">
                                    {editingItem
                                        ? 'Pastikan rincian perubahan inventaris berikut sudah benar sebelum disimpan ke sistem:'
                                        : 'Pastikan data sarana / inventaris baru berikut sudah benar sebelum didaftarkan:'}
                                </p>
                                <div className="mt-2 rounded-lg border border-gray-100 bg-gray-50/70 p-2.5 space-y-1.5 text-[11px] sm:text-xs">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500 font-medium">Kode</span>
                                        <span className="font-mono font-bold text-purple-700">
                                            {data.kode_barang.toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500 font-medium">Nama Peralatan:</span>
                                        <span className="font-bold text-gray-900 truncate max-w-[200px]">
                                            {data.nama_barang}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500 font-medium">Kategori:</span>
                                        <span className="font-medium text-gray-800">{data.kategori}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500 font-medium">Jumlah Unit:</span>
                                        <span className="font-bold text-gray-900">{data.jumlah} Unit</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500 font-medium">Kondisi Fisik:</span>
                                        <span className="font-semibold text-gray-800">{data.kondisi}</span>
                                    </div>
                                    {data.keterangan && (
                                        <div className="flex justify-between items-start pt-1 border-t border-gray-200/50">
                                            <span className="text-gray-500 font-medium shrink-0 mr-2">Catatan:</span>
                                            <span className="text-gray-700 text-right line-clamp-2">{data.keterangan}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* TAMPILAN FORMULIR ISIAN */
                    <form noValidate onSubmit={handleRequestSave} className="space-y-3 max-h-[75vh] sm:max-h-[80vh] overflow-y-auto px-0.5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-[10px] sm:text-xs font-bold text-gray-750 block">
                                    Kode <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.kode_barang}
                                    onChange={(e) => setData('kode_barang', e.target.value.toUpperCase())}
                                    placeholder="Contoh: INV-MED-008"
                                    className="h-9 sm:h-10 w-full rounded-lg sm:rounded-xl border border-gray-300 bg-white px-2.5 sm:px-3 text-[11px] sm:text-xs font-mono uppercase text-gray-800 placeholder:text-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
                                />
                                {errors.kode_barang && (
                                    <p className="text-[10px] sm:text-[11px] font-medium text-rose-600 leading-tight">
                                        {errors.kode_barang}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] sm:text-xs font-bold text-gray-750 block">
                                    Kategori Sarana <span className="text-rose-500">*</span>
                                </label>
                                <Select
                                    size="md"
                                    value={data.kategori}
                                    onChange={(val) => setData('kategori', val)}
                                    error={!!errors.kategori}
                                    showCheckmark={false}
                                    options={KATEGORI_OPTIONS}
                                />
                                {errors.kategori && (
                                    <p className="text-[10px] sm:text-[11px] font-medium text-rose-600 leading-tight">
                                        {errors.kategori}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] sm:text-xs font-bold text-gray-750 block">
                                Nama Sarana / Peralatan <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={data.nama_barang}
                                onChange={(e) => setData('nama_barang', e.target.value)}
                                placeholder="Contoh: Autoclave Digital Sterilizer 18 Liter"
                                className="h-9 sm:h-10 w-full rounded-lg sm:rounded-xl border border-gray-300 bg-white px-2.5 sm:px-3 text-[11px] sm:text-xs text-gray-800 placeholder:text-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
                            />
                            {errors.nama_barang && (
                                <p className="text-[10px] sm:text-[11px] font-medium text-rose-600 leading-tight">
                                    {errors.nama_barang}
                                </p>
                            )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-[10px] sm:text-xs font-bold text-gray-750 block">
                                    Jumlah Unit <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={data.jumlah}
                                    onChange={(e) => setData('jumlah', e.target.value)}
                                    placeholder="1"
                                    className="h-9 sm:h-10 w-full rounded-lg sm:rounded-xl border border-gray-300 bg-white px-2.5 sm:px-3 text-[11px] sm:text-xs font-bold text-gray-800 placeholder:text-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
                                />
                                {errors.jumlah && (
                                    <p className="text-[10px] sm:text-[11px] font-medium text-rose-600 leading-tight">
                                        {errors.jumlah}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] sm:text-xs font-bold text-gray-750 block">
                                    Kondisi Fisik <span className="text-rose-500">*</span>
                                </label>
                                <Select
                                    size="md"
                                    value={data.kondisi}
                                    onChange={(val) => setData('kondisi', val)}
                                    error={!!errors.kondisi}
                                    showCheckmark={false}
                                    options={KONDISI_OPTIONS}
                                />
                                {errors.kondisi && (
                                    <p className="text-[10px] sm:text-[11px] font-medium text-rose-600 leading-tight">
                                        {errors.kondisi}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] sm:text-xs font-bold text-gray-750 block">
                                Keterangan / Lokasi Penempatan <span className="text-gray-400 font-normal">(Opsional)</span>
                            </label>
                            <textarea
                                rows={3}
                                value={data.keterangan}
                                onChange={(e) => setData('keterangan', e.target.value)}
                                placeholder="Contoh: Ditempatkan di Ruang Tindakan Bedah Minor, kalibrasi berkala tiap 6 bulan..."
                                className="w-full rounded-lg sm:rounded-xl border border-gray-300 bg-white p-2.5 sm:p-3 text-[11px] sm:text-xs text-gray-800 placeholder:text-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
                            />
                            {errors.keterangan && (
                                <p className="text-[10px] sm:text-[11px] font-medium text-rose-600 leading-tight">
                                    {errors.keterangan}
                                </p>
                            )}
                        </div>
                    </form>
                )}
            </Modal>

            <Modal
                isOpen={deleteModalOpen}
                onClose={() => {
                    if (isDeleting) return;
                    setDeleteModalOpen(false);
                }}
                title="Hapus Barang Inventaris"
                size="sm"
                footer={
                    <div className="flex w-full justify-end gap-2">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setDeleteModalOpen(false)}
                            disabled={isDeleting}
                            className="h-8 sm:h-9 px-3 sm:px-4 text-[11px] sm:text-xs font-semibold rounded-lg"
                        >
                            Batalkan
                        </Button>
                        <Button
                            type="button"
                            variant="danger"
                            onClick={handleDelete}
                            isLoading={isDeleting}
                            disabled={isDeleting}
                            className="h-8 sm:h-9 px-3 sm:px-4 text-[11px] sm:text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-700 text-white disabled:opacity-50"
                        >
                            Ya, Hapus Barang
                        </Button>
                    </div>
                }
            >
                <div className="p-1 space-y-2.5">
                    <div className="flex gap-2.5 sm:gap-3">
                        <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600 border border-rose-100">
                            <svg className="h-4.5 w-4.5 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                />
                            </svg>
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-[11px] sm:text-xs leading-relaxed text-gray-650 font-medium">
                                Apakah Anda yakin ingin menghapus data inventaris berikut dari sistem Puskeswan?
                            </p>
                            <div className="mt-2 rounded-lg border border-rose-100 bg-rose-50/40 p-2.5 space-y-1 text-[11px] sm:text-xs">
                                <div className="font-bold text-gray-900">
                                    {itemToDelete?.nama_barang}
                                </div>
                                <div className="text-gray-500 font-mono text-[10.5px]">
                                    Kode: {itemToDelete?.kode_barang} &bull; Jumlah:{' '}
                                    <span className="font-semibold text-gray-700">
                                        {itemToDelete?.jumlah} Unit
                                    </span> &bull; Kondisi: {itemToDelete?.kondisi}
                                </div>
                            </div>
                            <p className="mt-2 text-[10px] text-gray-400 leading-tight">
                                Tindakan ini bersifat permanen dan data inventaris tidak dapat dipulihkan kembali.
                            </p>
                        </div>
                    </div>
                </div>
            </Modal>
        </DashboardLayout>
    );
}
