import React, { useRef, useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Button, Dropdown, Modal, Pagination, Select, useToast } from '@/components/ui';

interface MedicineItem {
    id: number;
    kode_obat: string;
    nama_obat: string;
    stok: number;
    satuan: string;
    status_stok: 'Kritis' | 'Menipis' | 'Aman';
    created_at: string;
}

interface MedicinesPageProps {
    medicines: {
        data: MedicineItem[];
        links: any[];
        current_page: number;
        last_page: number;
        from: number;
        to: number;
        total: number;
    };
    filters: {
        search?: string;
        status?: string;
    };
}

const SATUAN_OPTIONS = [
    { value: 'Vial', label: 'Vial (Injeksi / Vaksin)' },
    { value: 'Botol', label: 'Botol (Cair / Sirup / Suspensi)' },
    { value: 'Ampul', label: 'Ampul (Dosis Tunggal)' },
    { value: 'Tablet', label: 'Tablet (Oral)' },
    { value: 'Strip', label: 'Strip (Kemasan Blister)' },
    { value: 'Box', label: 'Box / Dus Besar' },
    { value: 'Dosis', label: 'Dosis (Vaksinasi Lapangan)' },
    { value: 'Straw', label: 'Straw (Semen Beku IB)' },
    { value: 'Kaleng', label: 'Kaleng / Aerosol Spray' },
];

const STATUS_FILTER_OPTIONS: Record<string, string> = {
    '': 'Semua Status Stok',
    kritis: 'Stok Kritis (≤ 10)',
    menipis: 'Stok Menipis (11 - 30)',
    aman: 'Stok Aman (> 30)',
};

export default function MedicinesIndex({ medicines, filters }: MedicinesPageProps) {
    const { success, error, warning } = useToast();

    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');

    const [formModalOpen, setFormModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<MedicineItem | null>(null);

    const [saveConfirmModalOpen, setSaveConfirmModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isSubmittingRef = useRef(false);

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<MedicineItem | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const { data, setData, errors, reset, clearErrors } = useForm({
        kode_obat: '',
        nama_obat: '',
        stok: 10 as number | string,
        satuan: 'Vial',
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/super/obat',
            {
                search: search || undefined,
                status: statusFilter || undefined,
            },
            { preserveState: true, replace: true }
        );
    };

    const handleFilterStatus = (status: string) => {
        setStatusFilter(status);
        router.get(
            '/super/obat',
            {
                search: search || undefined,
                status: status || undefined,
            },
            { preserveState: true, replace: true }
        );
    };

    const handleResetFilter = () => {
        setSearch('');
        setStatusFilter('');
        router.get('/super/obat', {}, { preserveState: true, replace: true });
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
            kode_obat: '',
            nama_obat: '',
            stok: 10,
            satuan: 'Vial',
        });
        setFormModalOpen(true);
    };

    const openEditModal = (item: MedicineItem) => {
        setEditingItem(item);
        setSaveConfirmModalOpen(false);
        setDeleteModalOpen(false);
        isSubmittingRef.current = false;
        setIsSubmitting(false);
        clearErrors();
        setData({
            kode_obat: item.kode_obat,
            nama_obat: item.nama_obat,
            stok: item.stok,
            satuan: item.satuan,
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
        if (!data.kode_obat || !data.kode_obat.trim()) {
            notifyValidation('Kode obat wajib diisi! (Contoh: MED-010)');
            return false;
        }

        if (!data.nama_obat || !data.nama_obat.trim()) {
            notifyValidation('Nama obat / merek vaksin wajib diisi!');
            return false;
        }

        if (!data.satuan || !data.satuan.trim()) {
            notifyValidation('Satuan kemasan wajib dipilih!');
            return false;
        }

        if (
            data.stok === '' ||
            data.stok === null ||
            data.stok === undefined ||
            isNaN(Number(data.stok)) ||
            Number(data.stok) < 0
        ) {
            notifyValidation('Jumlah stok harus berupa angka valid (minimal 0)!');
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
            kode_obat: data.kode_obat.trim().toUpperCase(),
            nama_obat: data.nama_obat.trim(),
            stok: Number(data.stok),
            satuan: data.satuan.trim(),
        };

        if (editingItem) {
            router.put(`/super/obat/${editingItem.id}`, payload, {
                preserveScroll: true,
                onSuccess: () => {
                    setSaveConfirmModalOpen(false);
                    setFormModalOpen(false);
                    success(`Data persediaan obat ${data.nama_obat} berhasil diperbarui!`);
                },
                onError: (errs) => {
                    setSaveConfirmModalOpen(false);
                    const firstErr = Object.values(errs)[0];
                    error(
                        typeof firstErr === 'string'
                            ? firstErr
                            : 'Gagal memperbarui persediaan obat. Mohon periksa isian formulir.'
                    );
                },
                onFinish: () => {
                    isSubmittingRef.current = false;
                    setIsSubmitting(false);
                },
            });
        } else {
            router.post('/super/obat', payload, {
                preserveScroll: true,
                onSuccess: () => {
                    setSaveConfirmModalOpen(false);
                    setFormModalOpen(false);
                    success(`Obat baru ${data.nama_obat} berhasil ditambahkan ke inventori!`);
                },
                onError: (errs) => {
                    setSaveConfirmModalOpen(false);
                    const firstErr = Object.values(errs)[0];
                    error(
                        typeof firstErr === 'string'
                            ? firstErr
                            : 'Gagal menambahkan obat baru. Pastikan kode obat unik dan belum terdaftar.'
                    );
                },
                onFinish: () => {
                    isSubmittingRef.current = false;
                    setIsSubmitting(false);
                },
            });
        }
    };

    const confirmDelete = (item: MedicineItem) => {
        setItemToDelete(item);
        setDeleteModalOpen(true);
    };

    const handleDelete = () => {
        if (!itemToDelete) return;
        setIsDeleting(true);
        router.delete(`/super/obat/${itemToDelete.id}`, {
            preserveScroll: true,
            onSuccess: (page) => {
                setIsDeleting(false);
                setDeleteModalOpen(false);
                const flashError = (page.props as any)?.flash?.error;
                if (flashError) {
                    error(flashError);
                } else {
                    success(`Obat ${itemToDelete.nama_obat} (${itemToDelete.kode_obat}) berhasil dihapus.`);
                }
            },
            onError: () => {
                setIsDeleting(false);
                error('Gagal menghapus data obat.');
            },
        });
    };

    return (
        <DashboardLayout title="Master Data Obat & Vaksin">
            <Head title="Obat & Vaksin" />

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
                                        placeholder="Cari kode obat atau nama farmasi (contoh: Rabivet, Amoxicillin)..."
                                        className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50/50 pl-9 pr-3 text-sm text-gray-800 placeholder:text-gray-400 transition-all focus:border-purple-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                                    />
                                </div>

                                <div className="w-full sm:w-[240px] shrink-0">
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
                                                            d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                                                        />
                                                    </svg>
                                                    <span className="truncate">
                                                        {STATUS_FILTER_OPTIONS[statusFilter] || 'Semua Status Stok'}
                                                    </span>
                                                </div>
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
                                    {(search || statusFilter) && (
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
                                    Tambah Obat
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto min-h-[335px]">
                        <table className="w-full text-left text-xs border-collapse border border-gray-200">
                            <thead>
                                <tr className="bg-gray-100/90 border-b border-gray-200 text-[11px] font-bold uppercase tracking-wider text-gray-700">
                                    <th className="py-3 px-3.5 border-r border-gray-200 text-center w-12 shrink-0">No.</th>
                                    <th className="py-3 px-3.5 border-r border-gray-200">Kode Obat</th>
                                    <th className="py-3 px-3.5 border-r border-gray-200">Nama Farmasi / Vaksin</th>
                                    <th className="py-3 px-3.5 border-r border-gray-200">Kuantitas Stok</th>
                                    <th className="py-3 px-3.5 border-r border-gray-200">Satuan Kemasan</th>
                                    <th className="py-3 px-3.5 border-r border-gray-200">Kondisi Stok</th>
                                    <th className="py-3 px-3.5 border-r border-gray-200">Terdaftar</th>
                                    <th className="py-3 px-3.5 text-center w-28 shrink-0">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {medicines.data.length === 0 ? (
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
                                            <h4 className="text-sm font-semibold text-gray-700">Tidak ada data obat atau vaksin</h4>
                                            <p className="mt-1 text-xs text-gray-400">
                                                {search || statusFilter
                                                    ? 'Coba sesuaikan kata kunci pencarian atau ubah filter status stok Anda.'
                                                    : 'Belum ada item farmasi yang terdaftar di dalam inventori.'}
                                            </p>
                                        </td>
                                    </tr>
                                ) : (
                                    <>
                                        {medicines.data.map((item, index) => (
                                            <tr
                                                key={item.id}
                                                className="odd:bg-white even:bg-gray-50/70 hover:bg-purple-50/40 transition-colors h-[58px]"
                                            >
                                                <td className="py-3 px-3.5 border-r border-gray-200 text-center font-medium text-gray-600">
                                                    {medicines.from ? medicines.from + index : index + 1}
                                                </td>

                                                <td className="py-3 px-3.5 border-r border-gray-200 font-mono text-xs font-bold text-purple-700">
                                                    {item.kode_obat}
                                                </td>

                                                <td className="py-3 px-3.5 border-r border-gray-200">
                                                    <span className="font-bold text-xs text-gray-900 block leading-snug break-words">
                                                        {item.nama_obat}
                                                    </span>
                                                </td>

                                                <td className="py-3 px-3.5 border-r border-gray-200 text-xs font-bold text-gray-900">
                                                    {item.stok}
                                                </td>

                                                <td className="py-3 px-3.5 border-r border-gray-200">
                                                    <span className="inline-block px-2 py-0.5 rounded-md font-medium text-[11px] bg-gray-100 text-gray-700">
                                                        {item.satuan}
                                                    </span>
                                                </td>

                                                <td className="py-3 px-3.5 border-r border-gray-200">
                                                    {item.status_stok === 'Kritis' && (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-bold text-[10.5px] bg-rose-50 text-rose-700 border border-rose-200">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                                                            Kritis (≤ 10)
                                                        </span>
                                                    )}
                                                    {item.status_stok === 'Menipis' && (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-bold text-[10.5px] bg-amber-50 text-amber-700 border border-amber-200">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                                            Menipis (11-30)
                                                        </span>
                                                    )}
                                                    {item.status_stok === 'Aman' && (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-bold text-[10.5px] bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                                            Aman (&gt; 30)
                                                        </span>
                                                    )}
                                                </td>

                                                <td className="py-3 px-3.5 border-r border-gray-200 text-xs text-gray-600 font-medium whitespace-nowrap">
                                                    {item.created_at || '-'}
                                                </td>

                                                <td className="py-3 px-3.5 text-center">
                                                    <div className="flex items-center justify-center gap-1.5">
                                                        <button
                                                            type="button"
                                                            onClick={() => openEditModal(item)}
                                                            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 border border-gray-200 hover:border-purple-300 hover:bg-purple-50 hover:text-purple-700 transition-all focus:outline-none"
                                                            title="Edit Data Obat"
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
                                                            title="Hapus Obat"
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
                                        {medicines.data.length > 0 && medicines.data.length < 5 &&
                                            Array.from({ length: 5 - medicines.data.length }).map((_, idx) => (
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
                            <span className="font-bold text-gray-800">{medicines.from || 0}</span>{' '}
                            hingga{' '}
                            <span className="font-bold text-gray-800">{medicines.to || 0}</span>{' '}
                            dari total{' '}
                            <span className="font-bold text-gray-800">{medicines.total}</span> item farmasi.
                        </p>
                        <Pagination
                            links={medicines.links}
                            currentPage={medicines.current_page}
                            totalPages={medicines.last_page}
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
                            : 'Konfirmasi Tambah Obat & Vaksin'
                        : editingItem
                          ? 'Edit Data Obat & Vaksin'
                          : 'Tambah Obat & Vaksin Baru'
                }
                description={
                    saveConfirmModalOpen
                        ? undefined
                        : editingItem
                          ? `Perbarui informasi kode obat, nama zat aktif/merek, kuantitas stok, dan satuan.`
                          : 'Lengkapi formulir untuk mendaftarkan item farmasi atau vaksin baru ke inventori.'
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
                                {editingItem ? 'Simpan Perubahan' : 'Simpan Obat'}
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
                                        ? 'Pastikan rincian perubahan obat/vaksin berikut sudah benar sebelum disimpan ke sistem:'
                                        : 'Pastikan data persediaan farmasi baru berikut sudah benar sebelum ditambahkan:'}
                                </p>
                                <div className="mt-2 rounded-lg border border-gray-100 bg-gray-50/70 p-2.5 space-y-1.5 text-[11px] sm:text-xs">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500 font-medium">Kode Obat:</span>
                                        <span className="font-mono font-bold text-purple-700">
                                            {data.kode_obat.toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500 font-medium">Nama Farmasi:</span>
                                        <span className="font-bold text-gray-900 truncate max-w-[200px]">
                                            {data.nama_obat}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500 font-medium">Jumlah Stok:</span>
                                        <span className="font-bold text-gray-900">
                                            {data.stok} {data.satuan}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500 font-medium">Satuan Kemasan:</span>
                                        <span className="font-medium text-gray-700">{data.satuan}</span>
                                    </div>
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
                                    Kode Obat <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.kode_obat}
                                    onChange={(e) => setData('kode_obat', e.target.value.toUpperCase())}
                                    placeholder="Contoh: MED-010"
                                    className="h-9 sm:h-10 w-full rounded-lg sm:rounded-xl border border-gray-300 bg-white px-2.5 sm:px-3 text-[11px] sm:text-xs font-mono uppercase text-gray-800 placeholder:text-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
                                />
                                {errors.kode_obat && (
                                    <p className="text-[10px] sm:text-[11px] font-medium text-rose-600 leading-tight">
                                        {errors.kode_obat}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] sm:text-xs font-bold text-gray-750 block">
                                    Satuan Kemasan <span className="text-rose-500">*</span>
                                </label>
                                <Select
                                    size="md"
                                    value={data.satuan}
                                    onChange={(val) => setData('satuan', val)}
                                    error={!!errors.satuan}
                                    showCheckmark={false}
                                    options={SATUAN_OPTIONS}
                                />
                                {errors.satuan && (
                                    <p className="text-[10px] sm:text-[11px] font-medium text-rose-600 leading-tight">
                                        {errors.satuan}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] sm:text-xs font-bold text-gray-750 block">
                                Nama Obat / Merek Vaksin <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={data.nama_obat}
                                onChange={(e) => setData('nama_obat', e.target.value)}
                                placeholder="Contoh: Rabisin Vaksin Rabies Inaktif / Amoxicillin 500mg"
                                className="h-9 sm:h-10 w-full rounded-lg sm:rounded-xl border border-gray-300 bg-white px-2.5 sm:px-3 text-[11px] sm:text-xs text-gray-800 placeholder:text-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
                            />
                            {errors.nama_obat && (
                                <p className="text-[10px] sm:text-[11px] font-medium text-rose-600 leading-tight">
                                    {errors.nama_obat}
                                </p>
                            )}
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] sm:text-xs font-bold text-gray-750 block">
                                Jumlah Stok Tersedia <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={data.stok}
                                onChange={(e) => setData('stok', e.target.value)}
                                placeholder="0"
                                className="h-9 sm:h-10 w-full rounded-lg sm:rounded-xl border border-gray-300 bg-white px-2.5 sm:px-3 text-[11px] sm:text-xs font-bold text-gray-800 placeholder:text-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
                            />
                            {errors.stok && (
                                <p className="text-[10px] sm:text-[11px] font-medium text-rose-600 leading-tight">
                                    {errors.stok}
                                </p>
                            )}
                            <p className="text-[10px] text-gray-400">
                                Indikator otomatis: Stok ≤ 10 (Kritis), 11-30 (Menipis), &gt; 30 (Aman).
                            </p>
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
                title="Hapus Data Obat & Vaksin"
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
                            Ya, Hapus Obat
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
                                Apakah Anda yakin ingin menghapus data farmasi berikut dari sistem Puskeswan?
                            </p>
                            <div className="mt-2 rounded-lg border border-rose-100 bg-rose-50/40 p-2.5 space-y-1 text-[11px] sm:text-xs">
                                <div className="font-bold text-gray-900">
                                    {itemToDelete?.nama_obat}
                                </div>
                                <div className="text-gray-500 font-mono text-[10.5px]">
                                    Kode: {itemToDelete?.kode_obat} &bull; Stok:{' '}
                                    <span className="font-semibold text-gray-700">
                                        {itemToDelete?.stok} {itemToDelete?.satuan}
                                    </span>
                                </div>
                            </div>
                            <p className="mt-2 text-[10px] text-gray-400 leading-tight">
                                Tindakan ini bersifat permanen dan data obat tidak dapat dipulihkan kembali.
                            </p>
                        </div>
                    </div>
                </div>
            </Modal>
        </DashboardLayout>
    );
}
