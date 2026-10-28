import React, { useMemo, useRef, useState } from "react";
import { Head, router, useForm } from "@inertiajs/react";
import DashboardLayout from "@/layouts/DashboardLayout";
import {
    Button,
    Dropdown,
    Modal,
    Pagination,
    Select,
    useToast,
} from "@/components/ui";

interface StaffItem {
    id: number;
    nama_staf: string;
    jabatan: string;
    nip_strv: string | null;
    tampil_publik: boolean;
    urutan: number | null;
    foto: string | null;
    users_count: number;
    linked_role?: string | null;
    created_at: string;
}

interface StaffPageProps {
    staff: {
        data: StaffItem[];
        links: any[];
        current_page: number;
        last_page: number;
        from: number;
        to: number;
        total: number;
    };
    filters: {
        search?: string;
        jabatan?: string;
    };
    availableJabatans?: string[];
    pimpinanJabatan?: string;
    pimpinanStaffId?: number | null;
    pimpinanStaffName?: string | null;
    nextOrder?: number;
}

const DEFAULT_PIMPINAN_JABATAN = "Kepala UPTD Puskeswan dan IB Kota Pariaman";

export default function StaffIndex({
    staff,
    filters,
    availableJabatans = [],
    pimpinanJabatan = DEFAULT_PIMPINAN_JABATAN,
    pimpinanStaffId = null,
    pimpinanStaffName = null,
    nextOrder = 1,
}: StaffPageProps) {
    const { success, error, warning } = useToast();

    const [search, setSearch] = useState(filters.search || "");
    const [selectedJabatanFilter, setSelectedJabatanFilter] = useState(
        filters.jabatan || "",
    );

    const [formModalOpen, setFormModalOpen] = useState(false);
    const [editingStaff, setEditingStaff] = useState<StaffItem | null>(null);

    const [saveConfirmModalOpen, setSaveConfirmModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isSubmittingRef = useRef(false);

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [staffToDelete, setStaffToDelete] = useState<StaffItem | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const [positionModalOpen, setPositionModalOpen] = useState(false);
    const [newPositionName, setNewPositionName] = useState("");
    const [isCreatingPosition, setIsCreatingPosition] = useState(false);
    const [inlinePositionOpen, setInlinePositionOpen] = useState(false);
    const [inlinePositionName, setInlinePositionName] = useState("");

    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data, setData, errors, reset, clearErrors } = useForm({
        nama_staf: "",
        jabatan: "",
        nip_strv: "",
        tampil_publik: true,
        urutan: String(nextOrder || 1),
        foto: null as File | null,
        hapus_foto: false,
    });

    const isPimpinanTakenByOther = useMemo(() => {
        if (!pimpinanStaffId) return false;
        if (!editingStaff) return true;
        return pimpinanStaffId !== editingStaff.id;
    }, [pimpinanStaffId, editingStaff]);

    const jabatanSelectOptions = useMemo(() => {
        const list =
            availableJabatans.length > 0
                ? availableJabatans
                : [pimpinanJabatan];

        return list.map((jab) => {
            const isPimpinan =
                jab.toLowerCase() === pimpinanJabatan.toLowerCase();

            if (isPimpinan) {
                return {
                    value: pimpinanJabatan,
                    label: pimpinanJabatan,
                    sublabel: isPimpinanTakenByOther
                        ? `Sudah terisi oleh ${pimpinanStaffName || "Pimpinan"}`
                        : "Pimpinan Utama",
                    disabled: isPimpinanTakenByOther,
                };
            }

            return {
                value: jab,
                label: jab,
            };
        });
    }, [
        availableJabatans,
        pimpinanJabatan,
        isPimpinanTakenByOther,
        pimpinanStaffName,
    ]);

    const handleCreatePosition = (
        rawName: string,
        fromInline: boolean = false,
    ) => {
        const trimmed = rawName.trim();
        if (!trimmed) {
            warning("Nama jabatan / posisi wajib diisi!", "Validasi Jabatan");
            return;
        }
        if (isCreatingPosition) return;

        setIsCreatingPosition(true);
        router.post(
            "/super/staf/jabatan",
            { nama_jabatan: trimmed },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    success(`Jabatan '${trimmed}' berhasil ditambahkan!`);
                    setData("jabatan", trimmed);
                    if (fromInline) {
                        setInlinePositionName("");
                        setInlinePositionOpen(false);
                    } else {
                        setNewPositionName("");
                        setPositionModalOpen(false);
                    }
                },
                onError: (errs) => {
                    const firstErr = Object.values(errs)[0];
                    error(
                        typeof firstErr === "string"
                            ? firstErr
                            : "Gagal menambahkan jabatan baru.",
                    );
                },
                onFinish: () => {
                    setIsCreatingPosition(false);
                },
            },
        );
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const MAX_SIZE = 5 * 1024 * 1024;
        if (file.size > MAX_SIZE) {
            e.target.value = "";
            setPhotoFile(null);
            setData("foto", null);
            setPhotoPreview(editingStaff?.foto || null);
            error(
                "Ukuran file foto melebihi batas maksimal 5MB! Silakan pilih gambar yang lebih kecil.",
            );
            return;
        }

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/jpg",
        ];
        if (!allowedTypes.includes(file.type.toLowerCase())) {
            e.target.value = "";
            setPhotoFile(null);
            setData("foto", null);
            setPhotoPreview(editingStaff?.foto || null);
            error(
                "Format berkas tidak diizinkan! Hanya berkas gambar (JPG, JPEG, PNG, WEBP) yang dapat diunggah.",
            );
            return;
        }

        setPhotoFile(file);
        setData("foto", file);
        setData("hapus_foto", false);
        setPhotoPreview(URL.createObjectURL(file));
    };

    const handleRemovePhoto = () => {
        setPhotoFile(null);
        setPhotoPreview(null);
        setData("foto", null);
        setData("hapus_foto", true);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            "/super/staf",
            {
                search: search || undefined,
                jabatan: selectedJabatanFilter || undefined,
            },
            { preserveState: true, replace: true },
        );
    };

    const handleJabatanFilter = (jabatanValue: string) => {
        setSelectedJabatanFilter(jabatanValue);
        router.get(
            "/super/staf",
            {
                search: search || undefined,
                jabatan: jabatanValue || undefined,
            },
            { preserveState: true, replace: true },
        );
    };

    const openCreateModal = () => {
        setEditingStaff(null);
        setPhotoFile(null);
        setPhotoPreview(null);
        setInlinePositionOpen(false);
        setInlinePositionName("");
        setSaveConfirmModalOpen(false);
        setDeleteModalOpen(false);
        isSubmittingRef.current = false;
        setIsSubmitting(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
        reset();
        clearErrors();
        setData({
            nama_staf: "",
            jabatan: "",
            nip_strv: "",
            tampil_publik: true,
            urutan: String(nextOrder || 1),
            foto: null,
            hapus_foto: false,
        });
        setFormModalOpen(true);
    };

    const openEditModal = (item: StaffItem) => {
        setEditingStaff(item);
        setPhotoFile(null);
        setPhotoPreview(item.foto || null);
        setInlinePositionOpen(false);
        setInlinePositionName("");
        setSaveConfirmModalOpen(false);
        setDeleteModalOpen(false);
        isSubmittingRef.current = false;
        setIsSubmitting(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
        clearErrors();

        setData({
            nama_staf: item.nama_staf,
            jabatan: item.jabatan,
            nip_strv: item.nip_strv || "",
            tampil_publik: Boolean(item.tampil_publik),
            urutan: String(item.urutan || nextOrder || 1),
            foto: null,
            hapus_foto: false,
        });
        setFormModalOpen(true);
    };

    const closeFormModal = () => {
        if (isSubmittingRef.current || isSubmitting) return;
        setFormModalOpen(false);
        setSaveConfirmModalOpen(false);
        setInlinePositionOpen(false);
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
        if (!data.nama_staf || !data.nama_staf.trim()) {
            notifyValidation("Nama lengkap dan gelar pegawai wajib diisi!");
            return false;
        }

        if (!data.jabatan || !data.jabatan.trim()) {
            notifyValidation(
                "Jabatan / posisi pegawai wajib dipilih atau ditambahkan!",
            );
            return false;
        }

        if (
            data.jabatan.trim().toLowerCase() ===
                pimpinanJabatan.toLowerCase() &&
            isPimpinanTakenByOther
        ) {
            notifyValidation(
                `Jabatan ${pimpinanJabatan} sudah terisi dan hanya diperbolehkan untuk 1 orang pimpinan!`,
            );
            return false;
        }

        if (data.tampil_publik) {
            const parsedOrder = parseInt(String(data.urutan), 10);
            if (isNaN(parsedOrder) || parsedOrder < 1) {
                notifyValidation(
                    "Urutan tampil (Order By) wajib berupa angka minimal 1!",
                );
                return false;
            }
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

        const parsedOrder = data.tampil_publik
            ? Math.max(1, parseInt(String(data.urutan), 10) || 1)
            : null;

        if (editingStaff) {
            router.post(
                `/super/staf/${editingStaff.id}`,
                {
                    _method: "put",
                    nama_staf: data.nama_staf.trim(),
                    jabatan: data.jabatan.trim(),
                    nip_strv: data.nip_strv.trim(),
                    tampil_publik: data.tampil_publik ? 1 : 0,
                    urutan: parsedOrder,
                    foto: photoFile,
                    hapus_foto: data.hapus_foto ? 1 : 0,
                },
                {
                    forceFormData: true,
                    preserveScroll: true,
                    onSuccess: () => {
                        setSaveConfirmModalOpen(false);
                        setFormModalOpen(false);
                        success(
                            `Data pegawai ${data.nama_staf} berhasil diperbarui!`,
                        );
                    },
                    onError: (errs) => {
                        setSaveConfirmModalOpen(false);
                        const firstErr = Object.values(errs)[0];
                        error(
                            typeof firstErr === "string"
                                ? firstErr
                                : "Gagal memperbarui data pegawai. Mohon periksa isian.",
                        );
                    },
                    onFinish: () => {
                        isSubmittingRef.current = false;
                        setIsSubmitting(false);
                    },
                },
            );
        } else {
            router.post(
                "/super/staf",
                {
                    nama_staf: data.nama_staf.trim(),
                    jabatan: data.jabatan.trim(),
                    nip_strv: data.nip_strv.trim(),
                    tampil_publik: data.tampil_publik ? 1 : 0,
                    urutan: parsedOrder,
                    foto: photoFile,
                },
                {
                    forceFormData: true,
                    preserveScroll: true,
                    onSuccess: () => {
                        setSaveConfirmModalOpen(false);
                        setFormModalOpen(false);
                        success(
                            `Pegawai baru ${data.nama_staf} berhasil didaftarkan!`,
                        );
                    },
                    onError: (errs) => {
                        setSaveConfirmModalOpen(false);
                        const firstErr = Object.values(errs)[0];
                        error(
                            typeof firstErr === "string"
                                ? firstErr
                                : "Gagal mendaftarkan pegawai baru. Mohon periksa isian.",
                        );
                    },
                    onFinish: () => {
                        isSubmittingRef.current = false;
                        setIsSubmitting(false);
                    },
                },
            );
        }
    };

    const confirmDelete = (item: StaffItem) => {
        setStaffToDelete(item);
        setDeleteModalOpen(true);
    };

    const handleDelete = () => {
        if (!staffToDelete) return;
        setIsDeleting(true);
        router.delete(`/super/staf/${staffToDelete.id}`, {
            onSuccess: () => {
                setIsDeleting(false);
                setDeleteModalOpen(false);
                success(
                    `Data pegawai ${staffToDelete.nama_staf} berhasil dihapus.`,
                );
            },
            onError: () => {
                setIsDeleting(false);
                error("Gagal menghapus data pegawai.");
            },
        });
    };

    return (
        <DashboardLayout title="Data Tenaga Staf">
            <Head title="Data Tenaga Staf" />

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
                                        onChange={(e) =>
                                            setSearch(e.target.value)
                                        }
                                        placeholder="Cari berdasarkan nama pegawai, jabatan, atau NIP/STRV..."
                                        className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50/50 pl-9 pr-3 text-sm text-gray-800 placeholder:text-gray-400 transition-all focus:border-purple-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                                    />
                                </div>

                                <div className="w-full sm:w-70 lg:w-[320px] shrink-0">
                                    <Dropdown size="md" matchWidth>
                                        <Dropdown.Trigger>
                                            <button
                                                type="button"
                                                className="flex h-10 w-full items-center justify-between gap-2.5 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-1 focus:ring-purple-500"
                                            >
                                                <div className="flex items-center gap-2 truncate">
                                                    <svg
                                                        className="h-4.5 w-4.5 text-gray-400 shrink-0"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth="2"
                                                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                                        />
                                                    </svg>
                                                    <span className="truncate">
                                                        {selectedJabatanFilter
                                                            ? `Jabatan: ${selectedJabatanFilter}`
                                                            : "Semua Jabatan"}
                                                    </span>
                                                </div>
                                                <svg
                                                    className="h-4 w-4 shrink-0 text-gray-400"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="m19 9-7 7-7-7"
                                                    />
                                                </svg>
                                            </button>
                                        </Dropdown.Trigger>
                                        <Dropdown.Content
                                            align="left"
                                            matchWidth
                                            className="max-h-80 overflow-y-auto py-2"
                                        >
                                            <Dropdown.Item
                                                onClick={() =>
                                                    handleJabatanFilter("")
                                                }
                                                className={`px-3 py-3 text-sm transition-colors ${
                                                    !selectedJabatanFilter
                                                        ? "bg-purple-50 font-semibold text-purple-700"
                                                        : "text-gray-700 hover:bg-gray-50"
                                                }`}
                                            >
                                                Semua Jabatan
                                            </Dropdown.Item>
                                            {availableJabatans.map((jab) => (
                                                <Dropdown.Item
                                                    key={jab}
                                                    onClick={() =>
                                                        handleJabatanFilter(jab)
                                                    }
                                                    className={`px-3 py-3 text-sm transition-colors ${
                                                        selectedJabatanFilter ===
                                                        jab
                                                            ? "bg-purple-50 font-semibold text-purple-700"
                                                            : "text-gray-700 hover:bg-gray-50"
                                                    }`}
                                                >
                                                    {jab}
                                                </Dropdown.Item>
                                            ))}
                                        </Dropdown.Content>
                                    </Dropdown>
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

                            <div className="shrink-0 pt-2 lg:pt-0 border-t border-gray-100 lg:border-t-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="md"
                                    onClick={() => {
                                        setNewPositionName("");
                                        setPositionModalOpen(true);
                                    }}
                                    className="h-10 px-3.5 text-xs font-semibold w-full sm:w-auto rounded-lg border-purple-200 text-purple-700 bg-purple-50/70 hover:bg-purple-100/80"
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
                                                strokeWidth="2.2"
                                                d="M12 4v16m8-8H4"
                                            />
                                        </svg>
                                    }
                                >
                                    Tambah Jabatan/Posisi
                                </Button>

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
                                    Tambah Staff
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto min-h-83.75">
                        <table className="w-full text-left text-xs border-collapse border border-gray-200">
                            <thead>
                                <tr className="bg-gray-100/90 border-b border-gray-200 text-[11px] font-bold uppercase tracking-wider text-gray-700">
                                    <th className="py-3 px-3.5 border-r border-gray-200 text-center w-12 shrink-0">
                                        No.
                                    </th>
                                    <th className="py-3 px-3.5 border-r border-gray-200 text-center w-36 shrink-0">
                                        Section Staff (Order)
                                    </th>
                                    <th className="py-3 px-3.5 border-r border-gray-200">
                                        Nama Pegawai
                                    </th>
                                    <th className="py-3 px-3.5 border-r border-gray-200">
                                        Jabatan / Posisi
                                    </th>
                                    <th className="py-3 px-3.5 border-r border-gray-200">
                                        NIP / STRV
                                    </th>
                                    <th className="py-3 px-3.5 border-r border-gray-200">
                                        Asal / Akun Sistem
                                    </th>
                                    <th className="py-3 px-3.5 border-r border-gray-200">
                                        Terdaftar
                                    </th>
                                    <th className="py-3 px-3.5 text-center w-28 shrink-0">
                                        Kelola
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {staff.data.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={8}
                                            className="px-4 py-12 text-center"
                                        >
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
                                                    Data pegawai tidak ditemukan
                                                </p>
                                                <p className="mt-0.5 text-xs text-gray-500">
                                                    Tambahkan pegawai baru atau
                                                    sesuaikan filter pencarian.
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    <>
                                        {staff.data.map((item, index) => {
                                            const isPimpinanRow =
                                                item.jabatan.toLowerCase() ===
                                                pimpinanJabatan.toLowerCase();

                                            return (
                                                <tr
                                                    key={item.id}
                                                    className="odd:bg-white even:bg-gray-50/70 hover:bg-purple-50/40 transition-colors h-14.5"
                                                >
                                                    <td className="py-3 px-3.5 border-r border-gray-200 text-center font-medium text-gray-600">
                                                        {staff.from
                                                            ? staff.from + index
                                                            : index + 1}
                                                    </td>

                                                    <td className="py-3 px-3.5 border-r border-gray-200 text-center">
                                                        {item.tampil_publik ? (
                                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[11px] font-extrabold bg-purple-50 text-purple-700 border border-purple-200">
                                                                <span className="h-1.5 w-1.5 rounded-full bg-purple-600" />
                                                                Tampil • #
                                                                {item.urutan ||
                                                                    1}
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10.5px] font-semibold bg-gray-100 text-gray-500 border border-gray-200">
                                                                Disembunyikan
                                                            </span>
                                                        )}
                                                    </td>

                                                    <td className="py-3 px-3.5 border-r border-gray-200">
                                                        <div className="flex items-center gap-2.5">
                                                            {item.foto ? (
                                                                <img
                                                                    src={
                                                                        item.foto
                                                                    }
                                                                    alt={
                                                                        item.nama_staf
                                                                    }
                                                                    className="h-8.5 w-8.5 rounded-xl object-cover object-center shrink-0 ring-1 ring-purple-100 shadow-2xs"
                                                                />
                                                            ) : (
                                                                <div className="h-8.5 w-8.5 rounded-xl bg-purple-100 text-purple-700 font-extrabold text-[11px] flex items-center justify-center shrink-0 border border-dashed border-purple-250">
                                                                    {item.nama_staf
                                                                        .slice(
                                                                            0,
                                                                            2,
                                                                        )
                                                                        .toUpperCase()}
                                                                </div>
                                                            )}
                                                            <div>
                                                                <span className="font-bold text-gray-900 block leading-tight wrap-break-words">
                                                                    {
                                                                        item.nama_staf
                                                                    }
                                                                </span>
                                                                <span className="text-[10px] text-gray-400 font-medium">
                                                                    {isPimpinanRow
                                                                        ? "Pimpinan Utama UPTD"
                                                                        : "Puskeswan Aparatur"}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className="py-3 px-3.5 border-r border-gray-200">
                                                        <span
                                                            className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                                                                isPimpinanRow
                                                                    ? "bg-purple-50 text-purple-700 border-purple-200"
                                                                    : "bg-gray-100 text-gray-800 border-gray-200"
                                                            }`}
                                                        >
                                                            {item.jabatan}
                                                        </span>
                                                    </td>

                                                    <td className="py-3 px-3.5 border-r border-gray-200 font-mono text-xs text-gray-650 font-medium">
                                                        {item.nip_strv || "-"}
                                                    </td>

                                                    <td className="py-3 px-3.5 border-r border-gray-200">
                                                        {item.users_count >
                                                        0 ? (
                                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md font-semibold text-[10.5px] bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                                Akun{" "}
                                                                {item.linked_role
                                                                    ? item.linked_role.replace(
                                                                          "_",
                                                                          " ",
                                                                      )
                                                                    : "Pengguna"}
                                                            </span>
                                                        ) : (
                                                            <span className="inline-block px-2 py-0.5 rounded-md font-medium text-[10.5px] bg-gray-50 text-gray-500 border border-gray-200">
                                                                Staf Non-Akun
                                                            </span>
                                                        )}
                                                    </td>

                                                    <td className="py-3 px-3.5 border-r border-gray-200 whitespace-nowrap text-xs text-gray-600 font-medium">
                                                        {item.created_at || "-"}
                                                    </td>

                                                    <td className="py-3 px-3.5 text-center">
                                                        <div className="flex items-center justify-center gap-1.5">
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    openEditModal(
                                                                        item,
                                                                    )
                                                                }
                                                                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 border border-gray-200 hover:border-purple-300 hover:bg-purple-50 hover:text-purple-700 transition-all focus:outline-none"
                                                                title="Edit Data Pegawai"
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
                                                                        strokeWidth="2.0"
                                                                        d="m16.862 4.487 2.651 2.651M5 19l4.5-1 10-10a1.875 1.875 0 0 0-2.65-2.65l-10 10L5 19Z"
                                                                    />
                                                                </svg>
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    confirmDelete(
                                                                        item,
                                                                    )
                                                                }
                                                                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 border border-gray-200 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 transition-all focus:outline-none"
                                                                title="Hapus Pegawai"
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
                                            );
                                        })}
                                        {staff.data.length > 0 &&
                                            staff.data.length < 5 &&
                                            Array.from({
                                                length: 5 - staff.data.length,
                                            }).map((_, idx) => (
                                                <tr
                                                    key={`empty-${idx}`}
                                                    aria-hidden="true"
                                                    className="odd:bg-white even:bg-gray-50/70 h-14.5"
                                                >
                                                    <td className="py-3 px-3.5 border-r border-gray-200 text-center">
                                                        &nbsp;
                                                    </td>
                                                    <td className="py-3 px-3.5 border-r border-gray-200 text-center">
                                                        &nbsp;
                                                    </td>
                                                    <td className="py-3 px-3.5 border-r border-gray-200">
                                                        &nbsp;
                                                    </td>
                                                    <td className="py-3 px-3.5 border-r border-gray-200">
                                                        &nbsp;
                                                    </td>
                                                    <td className="py-3 px-3.5 border-r border-gray-200">
                                                        &nbsp;
                                                    </td>
                                                    <td className="py-3 px-3.5 border-r border-gray-200">
                                                        &nbsp;
                                                    </td>
                                                    <td className="py-3 px-3.5 border-r border-gray-200">
                                                        &nbsp;
                                                    </td>
                                                    <td className="py-3 px-3.5 text-center">
                                                        &nbsp;
                                                    </td>
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
                                {staff.from || 0}
                            </span>{" "}
                            hingga{" "}
                            <span className="font-bold text-gray-800">
                                {staff.to || 0}
                            </span>{" "}
                            dari total{" "}
                            <span className="font-bold text-gray-800">
                                {staff.total}
                            </span>{" "}
                            data pegawai.
                        </p>
                        <Pagination
                            links={staff.links}
                            currentPage={staff.current_page}
                            totalPages={staff.last_page}
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
                        ? editingStaff
                            ? "Konfirmasi Simpan Perubahan"
                            : "Konfirmasi Daftarkan Pegawai"
                        : editingStaff
                          ? "Edit Data Pegawai"
                          : "Tambah Pegawai Baru"
                }
                description={
                    saveConfirmModalOpen
                        ? undefined
                        : editingStaff
                          ? `Perbarui rincian identitas, jabatan, dan visibilitas Section Staff milik ${editingStaff.nama_staf}.`
                          : "Pegawai baru hanya ditambahkan ke Data Staf (tidak membuat akun login pengguna baru)."
                }
                size={saveConfirmModalOpen ? "sm" : "lg"}
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
                                {editingStaff
                                    ? "Ya, Simpan Perubahan"
                                    : "Ya, Daftarkan Pegawai"}
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
                                {editingStaff
                                    ? "Simpan Perubahan"
                                    : "Daftarkan Pegawai"}
                            </Button>
                        </div>
                    )
                }
            >
                {saveConfirmModalOpen ? (
                    <div className="p-1 space-y-3">
                        <div className="flex gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
                                <svg
                                    className="h-5 w-5"
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
                                <p className="text-xs leading-relaxed text-gray-650 font-medium">
                                    {editingStaff
                                        ? "Pastikan data perubahan pegawai sudah benar sebelum disimpan ke sistem:"
                                        : "Pastikan data pegawai baru berikut sudah lengkap dan benar:"}
                                </p>
                                <div className="mt-2.5 rounded-lg border border-gray-100 bg-gray-50/70 p-2.5 space-y-1.5 text-xs">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500 font-medium">
                                            Nama:
                                        </span>
                                        <span className="font-bold text-gray-900 truncate max-w-45">
                                            {data.nama_staf}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500 font-medium">
                                            Jabatan:
                                        </span>
                                        <span className="font-semibold text-purple-700 truncate max-w-45">
                                            {data.jabatan}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500 font-medium">
                                            NIP / STRV:
                                        </span>
                                        <span className="font-mono text-gray-700 truncate max-w-45">
                                            {data.nip_strv || "-"}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500 font-medium">
                                            Section Staff:
                                        </span>
                                        <span className="font-extrabold text-purple-700">
                                            {data.tampil_publik
                                                ? `Ditampilkan (Urutan #${data.urutan})`
                                                : "Disembunyikan"}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500 font-medium">
                                            Foto Profil:
                                        </span>
                                        <span className="font-medium text-emerald-600">
                                            {photoFile
                                                ? "Berkas Foto Baru Terpilih"
                                                : photoPreview
                                                  ? "Menggunakan Foto Saat Ini"
                                                  : "Tanpa Foto Profil"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <form
                        noValidate
                        onSubmit={handleRequestSave}
                        className="space-y-3 sm:space-y-4"
                    >
                        <div className="flex flex-row items-center justify-between gap-2 p-2.5 sm:p-3 rounded-xl bg-gray-50/70 border border-gray-200/80">
                            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                                <div className="relative shrink-0">
                                    {photoPreview ? (
                                        <img
                                            src={photoPreview}
                                            alt="Foto Profil"
                                            className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl object-cover object-center ring-2 ring-purple-100 shadow-2xs"
                                        />
                                    ) : (
                                        <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-purple-100 text-purple-700 font-extrabold text-xs sm:text-sm flex items-center justify-center border border-dashed border-purple-250">
                                            {data.nama_staf
                                                ? data.nama_staf
                                                      .slice(0, 2)
                                                      .toUpperCase()
                                                : "ST"}
                                        </div>
                                    )}
                                </div>

                                <div className="min-w-0 space-y-0.5 sm:space-y-1">
                                    <div className="flex items-center gap-1.5 sm:gap-2">
                                        <span className="text-[11px] sm:text-xs font-bold text-gray-800 leading-none">
                                            Foto Profil Pegawai
                                        </span>
                                        <span className="text-[9.5px] sm:text-[10px] text-gray-400 font-medium hidden xs:inline sm:inline">
                                            Maks. 5MB
                                        </span>
                                    </div>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp,image/jpg"
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                    <div className="flex items-center gap-1.5 pt-0.5">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                fileInputRef.current?.click()
                                            }
                                            className="inline-flex h-6 items-center px-2.5 rounded-md border border-gray-300 bg-white text-[10px] sm:text-[11px] font-semibold text-gray-700 hover:bg-gray-50 hover:border-purple-400 transition-colors shadow-2xs"
                                        >
                                            {photoPreview
                                                ? "Ganti"
                                                : "Pilih Foto"}
                                        </button>
                                        {photoPreview && (
                                            <button
                                                type="button"
                                                onClick={handleRemovePhoto}
                                                className="inline-flex h-6 items-center px-2 rounded-md border border-rose-200 bg-rose-50 text-[10px] sm:text-[11px] font-semibold text-rose-700 hover:bg-rose-100 transition-colors"
                                            >
                                                Hapus
                                            </button>
                                        )}
                                    </div>
                                    {errors.foto && (
                                        <p className="text-[10px] sm:text-[11px] font-medium text-rose-600 leading-tight">
                                            {errors.foto}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="text-[10px] sm:text-[11px] text-gray-500 bg-white px-2.5 py-1.5 rounded-lg border border-gray-200 shadow-2xs shrink-0">
                                <span className="font-semibold text-gray-750">
                                    Status:
                                </span>{" "}
                                {data.tampil_publik
                                    ? `Tampil (#${data.urutan || 1})`
                                    : "Disembunyikan"}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            <div className="space-y-3">
                                <div className="space-y-1">
                                    <label className="text-[10px] sm:text-xs font-bold text-gray-750 block truncate">
                                        Nama Lengkap &amp; Gelar{" "}
                                        <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.nama_staf}
                                        onChange={(e) =>
                                            setData("nama_staf", e.target.value)
                                        }
                                        placeholder="drh. Reni Gusnita"
                                        className="h-9 sm:h-10 w-full rounded-lg sm:rounded-xl border border-gray-300 bg-white px-2.5 sm:px-3 text-[11px] sm:text-xs text-gray-800 placeholder:text-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
                                    />
                                    {errors.nama_staf && (
                                        <p className="text-[10px] sm:text-[11px] font-medium text-rose-600 leading-tight">
                                            {errors.nama_staf}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] sm:text-xs font-bold text-gray-750 block truncate">
                                        NIP / Nomor STRV{" "}
                                        <span className="text-gray-400 font-normal">
                                            (Opsional)
                                        </span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.nip_strv}
                                        onChange={(e) =>
                                            setData("nip_strv", e.target.value)
                                        }
                                        placeholder="NIP. 1986... / STRV. 1986..."
                                        className="h-9 sm:h-10 w-full rounded-lg sm:rounded-xl border border-gray-300 bg-white px-2.5 sm:px-3 font-mono text-[11px] sm:text-xs text-gray-800 placeholder:text-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
                                    />
                                    {errors.nip_strv && (
                                        <p className="text-[10px] sm:text-[11px] font-medium text-rose-600 leading-tight">
                                            {errors.nip_strv}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="space-y-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                        <label className="text-[10px] sm:text-xs font-bold text-gray-750 block truncate">
                                            Jabatan / Posisi{" "}
                                            <span className="text-rose-500">
                                                *
                                            </span>
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setInlinePositionOpen(
                                                    (prev) => !prev,
                                                )
                                            }
                                            className="text-[10.5px] font-bold text-purple-600 hover:text-purple-800 transition-colors cursor-pointer shrink-0"
                                        >
                                            {inlinePositionOpen
                                                ? "Tutup Input"
                                                : "+ Tambah Jabatan/Posisi"}
                                        </button>
                                    </div>

                                    {inlinePositionOpen && (
                                        <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-purple-50/70 border border-purple-200 mb-1.5">
                                            <input
                                                type="text"
                                                value={inlinePositionName}
                                                onChange={(e) =>
                                                    setInlinePositionName(
                                                        e.target.value,
                                                    )
                                                }
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") {
                                                        e.preventDefault();
                                                        handleCreatePosition(
                                                            inlinePositionName,
                                                            true,
                                                        );
                                                    }
                                                }}
                                                placeholder="Ketik nama jabatan/posisi baru..."
                                                className="h-8 flex-1 rounded-md border border-purple-200 bg-white px-2.5 text-xs text-gray-800 placeholder:text-gray-400 focus:border-purple-500 focus:outline-none"
                                            />
                                            <button
                                                type="button"
                                                disabled={isCreatingPosition}
                                                onClick={() =>
                                                    handleCreatePosition(
                                                        inlinePositionName,
                                                        true,
                                                    )
                                                }
                                                className="h-8 px-2.5 rounded-md bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-bold transition-colors disabled:opacity-50 shrink-0 cursor-pointer"
                                            >
                                                {isCreatingPosition
                                                    ? "..."
                                                    : "Simpan"}
                                            </button>
                                        </div>
                                    )}

                                    <Select
                                        size="md"
                                        value={data.jabatan}
                                        onChange={(val) => {
                                            const stringVal = String(val);
                                            setData("jabatan", stringVal);
                                            if (
                                                stringVal.toLowerCase() ===
                                                    pimpinanJabatan.toLowerCase() &&
                                                !editingStaff
                                            ) {
                                                setData("tampil_publik", true);
                                                setData("urutan", "1");
                                            }
                                        }}
                                        error={!!errors.jabatan}
                                        placeholder="Pilih jabatan / posisi..."
                                        showCheckmark={false}
                                        options={jabatanSelectOptions}
                                    />
                                    {errors.jabatan && (
                                        <p className="text-[10px] sm:text-[11px] font-medium text-rose-600 leading-tight">
                                            {errors.jabatan}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] sm:text-xs font-bold text-gray-750 block truncate">
                                        Visibilitas pada Section Staff{" "}
                                        <span className="text-rose-500">*</span>
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setData("tampil_publik", true)
                                            }
                                            className={`h-9 sm:h-10 px-2.5 rounded-lg sm:rounded-xl border text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
                                                data.tampil_publik
                                                    ? "bg-purple-600 text-white border-purple-600 shadow-xs"
                                                    : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                                            }`}
                                        >
                                            Tampilkan
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setData("tampil_publik", false)
                                            }
                                            className={`h-9 sm:h-10 px-2.5 rounded-lg sm:rounded-xl border text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
                                                !data.tampil_publik
                                                    ? "bg-gray-800 text-white border-gray-800 shadow-xs"
                                                    : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                                            }`}
                                        >
                                            Sembunyikan
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {data.tampil_publik ? (
                            <div className="rounded-xl bg-purple-50/50 border border-purple-100 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                                <div className="space-y-0.5">
                                    <label className="text-[11px] sm:text-xs font-bold text-gray-800 block">
                                        Order By (Urutan Tampil di Section
                                        Staff){" "}
                                        <span className="text-rose-500">*</span>
                                    </label>
                                    <p className="text-[10.5px] text-gray-500">
                                        Angka lebih kecil (misal{" "}
                                        <strong className="text-purple-700">
                                            1
                                        </strong>
                                        ) akan ditampilkan paling awal pada
                                        halaman depan.
                                    </p>
                                </div>
                                <div className="w-full sm:w-32 shrink-0">
                                    <input
                                        type="number"
                                        min={1}
                                        max={9999}
                                        value={data.urutan}
                                        onChange={(e) =>
                                            setData("urutan", e.target.value)
                                        }
                                        placeholder="1"
                                        className="h-9 sm:h-10 w-full rounded-lg sm:rounded-xl border border-purple-300 bg-white px-3 text-center font-extrabold text-xs text-purple-800 focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="rounded-xl bg-gray-50 border border-gray-200 p-2.5 text-[11px] text-gray-600">
                                Pegawai ini <strong>disembunyikan</strong> dari
                                halaman depan (Section Staff), namun tetap
                                tersimpan di dalam daftar tenaga staf internal.
                            </div>
                        )}

                        <button type="submit" className="hidden" />
                    </form>
                )}
            </Modal>

            <Modal
                isOpen={positionModalOpen}
                onClose={() =>
                    !isCreatingPosition && setPositionModalOpen(false)
                }
                title="Tambah Jabatan / Posisi Baru"
                description="Jabatan baru akan langsung tersinkronisasi ke pilihan Jabatan / Posisi * pada form Tenaga Staf."
                size="sm"
                footer={
                    <div className="flex w-full justify-end gap-2">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setPositionModalOpen(false)}
                            disabled={isCreatingPosition}
                            className="h-9 px-4 text-xs font-semibold rounded-lg"
                        >
                            Batal
                        </Button>
                        <Button
                            type="button"
                            variant="primary"
                            onClick={() =>
                                handleCreatePosition(newPositionName, false)
                            }
                            isLoading={isCreatingPosition}
                            disabled={isCreatingPosition}
                            className="h-9 px-4 text-xs font-semibold rounded-lg bg-purple-600 hover:bg-purple-700 text-white"
                        >
                            Simpan Jabatan
                        </Button>
                    </div>
                }
            >
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleCreatePosition(newPositionName, false);
                    }}
                    className="space-y-3"
                >
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-800 block">
                            Nama Jabatan / Posisi{" "}
                            <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={newPositionName}
                            onChange={(e) => setNewPositionName(e.target.value)}
                            placeholder="Contoh: Medik Veteriner / Dokter Hewan"
                            autoFocus
                            className="h-10 w-full rounded-xl border border-gray-300 bg-white px-3 text-xs text-gray-800 placeholder:text-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                        />
                    </div>
                    <div className="rounded-lg bg-purple-50/70 border border-purple-100 p-2.5 text-[11px] text-purple-800 leading-relaxed">
                        Jabatan pimpinan <strong>{pimpinanJabatan}</strong>{" "}
                        sudah tersedia otomatis untuk 1 orang pimpinan. Gunakan
                        form ini untuk menambahkan jabatan dokter, paramedis,
                        inseminator, atau staf lainnya.
                    </div>
                </form>
            </Modal>

            <Modal
                isOpen={deleteModalOpen}
                onClose={() => !isDeleting && setDeleteModalOpen(false)}
                title="Hapus Data Pegawai"
                type="danger"
                size="sm"
                footer={
                    <div className="flex w-full justify-end gap-2 border-t border-gray-100 pt-3">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setDeleteModalOpen(false)}
                            disabled={isDeleting}
                            className="h-9 px-4 text-xs font-semibold rounded-md"
                        >
                            Kembali
                        </Button>
                        <Button
                            type="button"
                            variant="danger"
                            onClick={handleDelete}
                            isLoading={isDeleting}
                            disabled={isDeleting}
                            className="h-9 px-4 text-xs font-semibold rounded-md"
                        >
                            Hapus Pegawai
                        </Button>
                    </div>
                }
            >
                <div className="p-1 space-y-3">
                    <div className="flex gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-600 border border-rose-200/50">
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
                                    d="M12 9v4m0 4h.01M10.3 3.9 2.8 17a2 2 0 0 0 1.7 3h15a2 2 0 0 0 1.7-3l-7.5-13.1a2 2 0 0 0-3.4 0Z"
                                />
                            </svg>
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs leading-relaxed text-gray-650 font-medium">
                                Anda akan menghapus data aparatur/tenaga medis:
                            </p>
                            <div className="mt-2.5">
                                <p className="text-sm font-bold text-gray-900 break-all">
                                    {staffToDelete?.nama_staf}
                                </p>
                                <p className="text-xs text-gray-500 font-mono mt-0.5 break-all">
                                    {staffToDelete?.jabatan} &bull;{" "}
                                    {staffToDelete?.nip_strv || "Tanpa NIP"}
                                </p>
                            </div>
                            {staffToDelete && staffToDelete.users_count > 0 && (
                                <p className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2 mt-3">
                                    Peringatan: Pegawai ini memiliki{" "}
                                    {staffToDelete.users_count} akun pengguna
                                    yang terhubung.
                                </p>
                            )}
                            <p className="text-[10.5px] font-bold text-rose-700 tracking-wide uppercase mt-4">
                                TINDAKAN INI TIDAK BISA DIBATALKAN
                            </p>
                        </div>
                    </div>
                </div>
            </Modal>
        </DashboardLayout>
    );
}
