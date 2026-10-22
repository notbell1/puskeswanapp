import React, { useRef, useState } from "react";
import { Head, router, useForm } from "@inertiajs/react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Button, Modal, Pagination, useToast } from "@/components/ui";

interface AnimalTypeItem {
    id: number;
    nama_jenis: string;
    keterangan: string | null;
    animals_count: number;
    created_at: string;
}

interface AnimalTypesPageProps {
    animalTypes: {
        data: AnimalTypeItem[];
        links: any[];
        current_page: number;
        last_page: number;
        from: number;
        to: number;
        total: number;
    };
    filters: {
        search?: string;
    };
}

export default function AnimalTypesIndex({
    animalTypes,
    filters,
}: AnimalTypesPageProps) {
    const { success, error, warning } = useToast();

    const [search, setSearch] = useState(filters.search || "");

    const [formModalOpen, setFormModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<AnimalTypeItem | null>(null);

    const [saveConfirmModalOpen, setSaveConfirmModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isSubmittingRef = useRef(false);

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<AnimalTypeItem | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const { data, setData, errors, reset, clearErrors } = useForm({
        nama_jenis: "",
        keterangan: "",
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            "/super/jenis-hewan",
            { search: search || undefined },
            { preserveState: true, replace: true }
        );
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
            nama_jenis: "",
            keterangan: "",
        });
        setFormModalOpen(true);
    };

    const openEditModal = (item: AnimalTypeItem) => {
        setEditingItem(item);
        setSaveConfirmModalOpen(false);
        setDeleteModalOpen(false);
        isSubmittingRef.current = false;
        setIsSubmitting(false);
        clearErrors();
        setData({
            nama_jenis: item.nama_jenis,
            keterangan: item.keterangan || "",
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
        if (typeof warning === "function") {
            warning(message, "Validasi Formulir");
        } else if (typeof error === "function") {
            error(message, "Validasi Formulir");
        }
    };

    const validateForm = () => {
        if (!data.nama_jenis || !data.nama_jenis.trim()) {
            notifyValidation("Nama spesies / jenis hewan wajib diisi!");
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

        if (editingItem) {
            router.put(
                `/super/jenis-hewan/${editingItem.id}`,
                {
                    nama_jenis: data.nama_jenis.trim(),
                    keterangan: data.keterangan ? data.keterangan.trim() : "",
                },
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        setSaveConfirmModalOpen(false);
                        setFormModalOpen(false);
                        success(`Jenis hewan ${data.nama_jenis} berhasil diperbarui!`);
                    },
                    onError: (errs) => {
                        setSaveConfirmModalOpen(false);
                        const firstErr = Object.values(errs)[0];
                        error(
                            typeof firstErr === "string"
                                ? firstErr
                                : "Gagal memperbarui data jenis hewan. Mohon periksa isian."
                        );
                    },
                    onFinish: () => {
                        isSubmittingRef.current = false;
                        setIsSubmitting(false);
                    },
                }
            );
        } else {
            router.post(
                "/super/jenis-hewan",
                {
                    nama_jenis: data.nama_jenis.trim(),
                    keterangan: data.keterangan ? data.keterangan.trim() : "",
                },
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        setSaveConfirmModalOpen(false);
                        setFormModalOpen(false);
                        success(`Jenis hewan baru ${data.nama_jenis} berhasil ditambahkan!`);
                    },
                    onError: (errs) => {
                        setSaveConfirmModalOpen(false);
                        const firstErr = Object.values(errs)[0];
                        error(
                            typeof firstErr === "string"
                                ? firstErr
                                : "Gagal menambahkan jenis hewan baru. Pastikan nama belum pernah terdaftar."
                        );
                    },
                    onFinish: () => {
                        isSubmittingRef.current = false;
                        setIsSubmitting(false);
                    },
                }
            );
        }
    };

    const confirmDelete = (item: AnimalTypeItem) => {
        setItemToDelete(item);
        setDeleteModalOpen(true);
    };

    const handleDelete = () => {
        if (!itemToDelete) return;
        setIsDeleting(true);
        router.delete(`/super/jenis-hewan/${itemToDelete.id}`, {
            preserveScroll: true,
            onSuccess: (page) => {
                setIsDeleting(false);
                setDeleteModalOpen(false);
                const flashError = (page.props as any)?.flash?.error;
                if (flashError) {
                    error(flashError);
                } else {
                    success(`Jenis hewan ${itemToDelete.nama_jenis} berhasil dihapus.`);
                }
            },
            onError: () => {
                setIsDeleting(false);
                error("Gagal menghapus jenis hewan.");
            },
        });
    };

    return (
        <DashboardLayout title="Master Data Jenis Hewan">
            <Head title="Jenis Hewan" />

            <div className="space-y-4 max-w-[1600px] mx-auto">
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xs">
                    <div className="p-3 border-b border-gray-200 bg-white">
                        <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
                        <form
                            onSubmit={handleSearch}
                            className="flex flex-1 flex-row gap-2.5 items-center"
                        >
                            <div className="relative flex-1">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                    <svg
                                        className="h-4 w-4"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
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
                                    placeholder="Cari berdasarkan nama jenis atau keterangan taksonomi..."
                                    className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50/50 pl-9 pr-3 text-sm text-gray-800 placeholder:text-gray-400 transition-all focus:border-purple-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                                />
                            </div>

                            <Button
                                type="submit"
                                variant="secondary"
                                size="md"
                                className="h-10 px-5 text-sm font-semibold border-gray-200 hover:bg-gray-50 shrink-0"
                            >
                                Cari
                            </Button>
                        </form>

                        <div className="shrink-0 pt-2 sm:pt-0 border-t border-gray-100 sm:border-t-0">
                            <Button
                                type="button"
                                variant="primary"
                                size="md"
                                onClick={openCreateModal}
                                className="h-10 px-4 text-xs font-semibold w-full sm:w-auto rounded-lg shadow-xs"
                                leftIcon={
                                    <svg
                                        className="h-4 w-4"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2.5"
                                            d="M12 4v16m8-8H4"
                                        />
                                    </svg>
                                }
                            >
                                Tambah Jenis
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto min-h-[335px]">
                    <table className="w-full min-w-[760px] text-left text-xs border-collapse border border-gray-200">
                            <thead>
                                <tr className="bg-gray-100/90 border-b border-gray-200 text-[11px] font-bold uppercase tracking-wider text-gray-700">
                                    <th className="py-3 px-3.5 border-r border-gray-200 text-center w-12 shrink-0">No.</th>
                                    <th className="py-3 px-3.5 border-r border-gray-200">Nama Jenis / Spesies</th>
                                    <th className="py-3 px-3.5 border-r border-gray-200">Deskripsi / Keterangan</th>
                                    <th className="py-3 px-3.5 border-r border-gray-200">Total Pasien Terdaftar</th>
                                    <th className="py-3 px-3.5 border-r border-gray-200">Terdaftar</th>
                                    <th className="py-3 px-3.5 text-center w-28 shrink-0">Kelola</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {animalTypes.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-12 text-center">
                                            <div className="mx-auto flex max-w-xs flex-col items-center">
                                                <div className="mb-2.5 flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 border border-gray-150 text-gray-400">
                                                    <svg
                                                        className="h-5 w-5"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth="1.8"
                                                            d="M21 21l-4.3-4.3M10.8 18a7.2 7.2 0 1 1 0-14.4 7.2 7.2 0 0 1 0 14.4Z"
                                                        />
                                                    </svg>
                                                </div>
                                                <p className="text-xs font-bold text-gray-800">
                                                    Data jenis hewan tidak ditemukan
                                                </p>
                                                <p className="mt-0.5 text-xs text-gray-500">
                                                    Coba gunakan kata kunci pencarian yang lain.
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    <>
                                        {animalTypes.data.map((item, index) => (
                                            <tr
                                                key={item.id}
                                                className="odd:bg-white even:bg-gray-50/70 hover:bg-purple-50/40 transition-colors h-[58px]"
                                            >
                                            <td className="py-3 px-3.5 border-r border-gray-200 text-center font-medium text-gray-600">
                                                {animalTypes.from ? animalTypes.from + index : index + 1}
                                            </td>

                                            <td className="py-3 px-3.5 border-r border-gray-200">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-sm font-bold text-purple-700 ring-1 ring-purple-100 shadow-2xs">
                                                        🐾
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="break-words text-xs font-bold text-gray-900 leading-snug">
                                                            {item.nama_jenis}
                                                        </p>
                                                        <p className="mt-0.5 text-[10.5px] font-medium text-purple-700">
                                                            Spesies Pasien
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="py-3 px-3.5 border-r border-gray-200 text-xs text-gray-600">
                                                {item.keterangan ? (
                                                    <span className="break-words leading-relaxed">{item.keterangan}</span>
                                                ) : (
                                                    <span className="text-gray-400 italic">
                                                        Tidak ada catatan tambahan
                                                    </span>
                                                )}
                                            </td>

                                            <td className="py-3 px-3.5 border-r border-gray-200">
                                                {item.animals_count > 0 ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-bold text-[10.5px] bg-purple-50 text-purple-700 border border-purple-200">
                                                        {item.animals_count} Ekor Terdata
                                                    </span>
                                                ) : (
                                                    <span className="inline-block px-2 py-0.5 rounded-md font-medium text-[10.5px] bg-gray-100 text-gray-500">
                                                        0 Pasien
                                                    </span>
                                                )}
                                            </td>

                                            <td className="py-3 px-3.5 border-r border-gray-200 text-xs text-gray-600 font-medium whitespace-nowrap">
                                                {item.created_at || "-"}
                                            </td>

                                            <td className="py-3 px-3.5 text-center">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => openEditModal(item)}
                                                        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 border border-gray-200 hover:border-purple-300 hover:bg-purple-50 hover:text-purple-700 transition-all focus:outline-none"
                                                        title="Edit Jenis Hewan"
                                                    >
                                                        <svg
                                                            className="h-4 w-4"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            stroke="currentColor"
                                                        >
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
                                                        title="Hapus Jenis Hewan"
                                                    >
                                                        <svg
                                                            className="h-4 w-4"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            stroke="currentColor"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth="2"
                                                                d="M4 7h16M10 11v6m4-6v6M5.5 7l.8 13h11.4l.8-13M9 7V4h6v3"
                                                            />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {animalTypes.data.length > 0 &&
                                        animalTypes.data.length < 5 &&
                                        Array.from({
                                            length: 5 - animalTypes.data.length,
                                        }).map((_, idx) => (
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
                            Menampilkan{" "}
                            <span className="font-bold text-gray-800">
                                {animalTypes.from || 0}
                            </span>{" "}
                            hingga{" "}
                            <span className="font-bold text-gray-800">
                                {animalTypes.to || 0}
                            </span>{" "}
                            dari total{" "}
                            <span className="font-bold text-gray-800">
                                {animalTypes.total}
                            </span>{" "}
                            jenis hewan.
                        </p>
                        <Pagination
                            links={animalTypes.links}
                            currentPage={animalTypes.current_page}
                            totalPages={animalTypes.last_page}
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
                            ? "Konfirmasi Simpan Perubahan"
                            : "Konfirmasi Tambah Jenis Hewan"
                        : editingItem
                          ? "Edit Jenis Hewan"
                          : "Tambah Jenis Hewan Baru"
                }
                description={
                    saveConfirmModalOpen
                        ? undefined
                        : editingItem
                          ? `Perbarui data jenis hewan ${editingItem.nama_jenis}.`
                          : "Lengkapi formulir untuk mendaftarkan jenis hewan baru ke dalam katalog."
                }
                size={saveConfirmModalOpen ? "sm" : "md"}
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
                                {editingItem
                                    ? "Ya, Simpan Perubahan"
                                    : "Ya, Simpan Data"}
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
                                {editingItem
                                    ? "Simpan Perubahan"
                                    : "Simpan Jenis Hewan"}
                            </Button>
                        </div>
                    )
                }
            >
                {saveConfirmModalOpen ? (
                    /* TAMPILAN KONFIRMASI SIMPAN */
                    <div className="p-1 space-y-2.5 sm:space-y-3">
                        <div className="flex gap-2.5 sm:gap-3">
                            <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
                                <svg
                                    className="h-4.5 w-4.5 sm:h-5 sm:w-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-[11px] sm:text-xs leading-relaxed text-gray-650 font-medium">
                                    {editingItem
                                        ? "Pastikan data perubahan jenis hewan berikut sudah benar sebelum disimpan ke sistem:"
                                        : "Pastikan data jenis hewan baru berikut sudah benar sebelum ditambahkan:"}
                                </p>
                                <div className="mt-2 rounded-lg border border-gray-100 bg-gray-50/70 p-2.5 space-y-1.5 text-[11px] sm:text-xs">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500 font-medium">
                                            Nama Spesies:
                                        </span>
                                        <span className="font-bold text-gray-900 truncate max-w-[200px]">
                                            {data.nama_jenis}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-start">
                                        <span className="text-gray-500 font-medium shrink-0 mr-2">
                                            Keterangan:
                                        </span>
                                        <span className="text-gray-700 text-right line-clamp-2">
                                            {data.keterangan || "Tidak ada catatan"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* TAMPILAN FORMULIR ISIAN */
                    <form
                        noValidate
                        onSubmit={handleRequestSave}
                        className="space-y-3"
                    >
                        <div className="space-y-1">
                            <label className="text-[10px] sm:text-xs font-bold text-gray-750 block">
                                Nama Spesies / Jenis Hewan{" "}
                                <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={data.nama_jenis}
                                onChange={(e) =>
                                    setData("nama_jenis", e.target.value)
                                }
                                placeholder="Contoh: Kucing Domestik / Sapi Bali / Anjing"
                                className="h-9 sm:h-10 w-full rounded-lg sm:rounded-xl border border-gray-300 bg-white px-2.5 sm:px-3 text-[11px] sm:text-xs text-gray-800 placeholder:text-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
                            />
                            {errors.nama_jenis && (
                                <p className="text-[10px] sm:text-[11px] font-medium text-rose-600 leading-tight">
                                    {errors.nama_jenis}
                                </p>
                            )}
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] sm:text-xs font-bold text-gray-750 block">
                                Keterangan / Kategori Klinis{" "}
                                <span className="text-gray-400 font-normal">
                                    (Opsional)
                                </span>
                            </label>
                            <textarea
                                rows={3}
                                value={data.keterangan}
                                onChange={(e) =>
                                    setData("keterangan", e.target.value)
                                }
                                placeholder="Contoh: Hewan Penular Rabies (HPR), hewan kecil domestik, atau ternak ruminansia..."
                                className="w-full rounded-lg sm:rounded-xl border border-gray-300 bg-white p-2.5 sm:p-3 text-[11px] sm:text-xs text-gray-800 placeholder:text-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all resize-none"
                            />
                            {errors.keterangan && (
                                <p className="text-[10px] sm:text-[11px] font-medium text-rose-600 leading-tight">
                                    {errors.keterangan}
                                </p>
                            )}
                        </div>

                        <button type="submit" className="hidden" />
                    </form>
                )}
            </Modal>

            <Modal
                isOpen={deleteModalOpen}
                onClose={() => !isDeleting && setDeleteModalOpen(false)}
                title="Hapus Jenis Hewan"
                type="danger"
                size="sm"
                footer={
                    <div className="flex w-full justify-end gap-2 border-t border-gray-100 pt-3">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setDeleteModalOpen(false)}
                            disabled={isDeleting}
                            className="h-8 sm:h-9 px-3 sm:px-4 text-[11px] sm:text-xs font-semibold rounded-lg"
                        >
                            Kembali
                        </Button>
                        <Button
                            type="button"
                            variant="danger"
                            onClick={handleDelete}
                            isLoading={isDeleting}
                            disabled={isDeleting}
                            className="h-8 sm:h-9 px-3 sm:px-4 text-[11px] sm:text-xs font-semibold rounded-lg"
                        >
                            {itemToDelete?.animals_count && itemToDelete.animals_count > 0
                                ? "Tetap Coba Hapus"
                                : "Ya, Hapus Data"}
                        </Button>
                    </div>
                }
            >
                <div className="p-1">
                    <p className="text-xs text-gray-600 leading-relaxed">
                        {itemToDelete?.animals_count && itemToDelete.animals_count > 0 ? (
                            <span className="font-medium text-rose-700">
                                PERINGATAN: Spesies &quot;{itemToDelete?.nama_jenis}&quot; masih memiliki {itemToDelete.animals_count} pasien hewan terdaftar. Sistem akan menolak penghapusan untuk menjaga integritas data rekam medis.
                            </span>
                        ) : (
                            <>
                                Apakah Anda yakin ingin menghapus master jenis hewan &quot;
                                <span className="font-bold text-gray-900">
                                    {itemToDelete?.nama_jenis}
                                </span>
                                &quot;? Tindakan ini tidak dapat dibatalkan.
                            </>
                        )}
                    </p>
                </div>
            </Modal>
        </DashboardLayout>
    );
}
