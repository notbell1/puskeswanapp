import React, { useRef, useState } from "react";
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

interface UserItem {
    id: number;
    name: string;
    email: string;
    status_aktif: boolean;
    id_role: number;
    role_name: string;
    id_staf: number | null;
    staf_name: string | null;
    foto: string | null;
    created_at: string;
}

interface RoleItem {
    id: number;
    nama_role: string;
    deskripsi: string;
}

interface StaffItem {
    id: number;
    nama_staf: string;
    jabatan: string;
}

interface UsersPageProps {
    users: {
        data: UserItem[];
        links: any[];
        current_page: number;
        last_page: number;
        from: number;
        to: number;
        total: number;
    };
    filters: {
        search?: string;
        role?: string;
    };
    roles: RoleItem[];
    staffList: StaffItem[];
}

export default function UsersIndex({
    users,
    filters,
    roles,
    staffList,
}: UsersPageProps) {
    const { success, error, warning } = useToast();

    const [search, setSearch] = useState(filters.search || "");
    const [selectedRole, setSelectedRole] = useState(filters.role || "");

    const [formModalOpen, setFormModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<UserItem | null>(null);

    const [saveConfirmModalOpen, setSaveConfirmModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isSubmittingRef = useRef(false);

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<UserItem | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

    const { data, setData, errors, reset, clearErrors } = useForm({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
        id_role: "" as string | number,
        id_staf: "" as string | number,
        status_aktif: true,
        foto: null as File | null,
        hapus_foto: false,
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const MAX_SIZE = 5 * 1024 * 1024;
        if (file.size > MAX_SIZE) {
            e.target.value = "";
            setPhotoFile(null);
            setData("foto", null);
            setPhotoPreview(editingUser?.foto || null);
            error("Ukuran file foto melebihi batas maksimal 5MB!");
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
            setPhotoPreview(editingUser?.foto || null);
            error(
                "Format berkas tidak diizinkan! Gunakan JPG, JPEG, PNG, atau WEBP.",
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
            "/super/pengguna",
            { search, role: selectedRole },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const handleRoleFilter = (roleName: string) => {
        setSelectedRole(roleName);
        router.get(
            "/super/pengguna",
            { search, role: roleName },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const openCreateModal = () => {
        setEditingUser(null);
        setPhotoFile(null);
        setPhotoPreview(null);
        setShowPassword(false);
        setShowPasswordConfirm(false);
        setDeleteModalOpen(false);
        setSaveConfirmModalOpen(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
        isSubmittingRef.current = false;
        setIsSubmitting(false);
        reset();
        clearErrors();
        setData({
            name: "",
            email: "",
            password: "",
            password_confirmation: "",
            id_role: "",
            id_staf: "",
            status_aktif: true,
            foto: null,
            hapus_foto: false,
        });
        setFormModalOpen(true);
    };

    const openEditModal = (user: UserItem) => {
        setEditingUser(user);
        setPhotoFile(null);
        setPhotoPreview(user.foto || null);
        setShowPassword(false);
        setShowPasswordConfirm(false);
        setDeleteModalOpen(false);
        setSaveConfirmModalOpen(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
        isSubmittingRef.current = false;
        setIsSubmitting(false);
        clearErrors();
        setData({
            name: user.name,
            email: user.email,
            password: "",
            password_confirmation: "",
            id_role: user.id_role,
            id_staf: user.id_staf || "",
            status_aktif: user.status_aktif,
            foto: null,
            hapus_foto: false,
        });
        setFormModalOpen(true);
    };

    const closeFormModal = () => {
        if (isSubmittingRef.current || isSubmitting) return;
        setFormModalOpen(false);
        setSaveConfirmModalOpen(false);
        setDeleteModalOpen(false);
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
        if (!data.name || !data.name.trim()) {
            notifyValidation("Nama Lengkap wajib diisi!");
            return false;
        }

        if (!data.email || !data.email.trim()) {
            notifyValidation("Alamat Email wajib diisi!");
            return false;
        }

        if (!data.email.includes("@")) {
            notifyValidation(
                "Format email tidak valid! Alamat email harus menyertakan tanda '@'.",
            );
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email.trim())) {
            notifyValidation(
                "Format Alamat Email tidak valid! Contoh format yang benar: dokter@puskeswan.com",
            );
            return false;
        }

        if (!data.id_role) {
            notifyValidation("Hak Akses peran wajib dipilih!");
            return false;
        }

        if (!editingUser) {
            if (!data.password) {
                notifyValidation("Password akun wajib diisi!");
                return false;
            }
            if (data.password.length < 8) {
                notifyValidation("Password minimal harus 8 karakter!");
                return false;
            }
            if (!data.password_confirmation) {
                notifyValidation("Ulangi Password wajib diisi!");
                return false;
            }
            if (data.password !== data.password_confirmation) {
                notifyValidation(
                    "Password dan Ulangi Password tidak cocok / belum sama!",
                );
                return false;
            }
        } else {
            if (data.password || data.password_confirmation) {
                if (!data.password) {
                    notifyValidation(
                        "Password baru wajib diisi jika ingin mengubah password!",
                    );
                    return false;
                }
                if (data.password.length < 8) {
                    notifyValidation("Password baru minimal harus 8 karakter!");
                    return false;
                }
                if (!data.password_confirmation) {
                    notifyValidation(
                        "Ulangi Password wajib diisi untuk konfirmasi password baru!",
                    );
                    return false;
                }
                if (data.password !== data.password_confirmation) {
                    notifyValidation(
                        "Password baru dan Ulangi Password tidak cocok / belum sama!",
                    );
                    return false;
                }
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

        if (editingUser) {
            router.post(
                `/super/pengguna/${editingUser.id}`,
                {
                    _method: "put",
                    name: data.name.trim(),
                    email: data.email.trim(),
                    password: data.password,
                    password_confirmation: data.password_confirmation,
                    id_role: Number(data.id_role),
                    id_staf: data.id_staf || "",
                    status_aktif: data.status_aktif ? 1 : 0,
                    foto: photoFile,
                    hapus_foto: data.hapus_foto ? 1 : 0,
                },
                {
                    forceFormData: true,
                    preserveScroll: true,
                    onSuccess: () => {
                        setSaveConfirmModalOpen(false);
                        setFormModalOpen(false);
                        success(`Data akun ${data.name} berhasil diperbarui!`);
                    },
                    onError: (errs) => {
                        setSaveConfirmModalOpen(false);
                        const firstErr = Object.values(errs)[0];
                        error(
                            typeof firstErr === "string"
                                ? firstErr
                                : "Gagal memperbarui data.",
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
                "/super/pengguna",
                {
                    name: data.name.trim(),
                    email: data.email.trim(),
                    password: data.password,
                    password_confirmation: data.password_confirmation,
                    id_role: Number(data.id_role),
                    id_staf: data.id_staf || "",
                    status_aktif: data.status_aktif ? 1 : 0,
                    foto: photoFile,
                },
                {
                    forceFormData: true,
                    preserveScroll: true,
                    onSuccess: () => {
                        setSaveConfirmModalOpen(false);
                        setFormModalOpen(false);
                        success(`Akun baru ${data.name} berhasil dibuat!`);
                    },
                    onError: (errs) => {
                        setSaveConfirmModalOpen(false);
                        const firstErr = Object.values(errs)[0];
                        error(
                            typeof firstErr === "string"
                                ? firstErr
                                : "Gagal membuat akun.",
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

    const handleToggleStatus = (user: UserItem) => {
        router.patch(
            `/super/pengguna/${user.id}/toggle-status`,
            {},
            {
                preserveScroll: true,
                onSuccess: () =>
                    success(`Status akun ${user.name} berhasil diubah!`),
                onError: () => error("Gagal mengubah status akun pengguna."),
            },
        );
    };

    const confirmDelete = (user: UserItem) => {
        setFormModalOpen(false);
        setSaveConfirmModalOpen(false);
        setUserToDelete(user);
        setDeleteModalOpen(true);
    };

    const handleDelete = () => {
        if (!userToDelete || isDeleting) return;
        setIsDeleting(true);
        router.delete(`/super/pengguna/${userToDelete.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                success(`Akun ${userToDelete.name} berhasil dihapus.`);
                setDeleteModalOpen(false);
                setUserToDelete(null);
            },
            onError: () => error("Gagal menghapus akun pengguna."),
            onFinish: () => setIsDeleting(false),
        });
    };

    const getRoleBadgeClass = (roleName: string) => {
        switch (roleName) {
            case "SUPER_ADMIN":
                return "bg-purple-50 text-purple-700 ring-purple-200";
            case "DOKTER":
                return "bg-emerald-50 text-emerald-700 ring-emerald-200";
            default:
                return "bg-blue-50 text-blue-700 ring-blue-200";
        }
    };

    return (
        <DashboardLayout title="Manajemen Pengguna">
            <Head title="Manajemen Pengguna" />

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
                                        placeholder="Cari berdasarkan nama atau email petugas..."
                                        className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50/50 pl-9 pr-3 text-sm text-gray-800 placeholder:text-gray-400 transition-all focus:border-purple-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                                    />
                                </div>

                                <div className="w-full sm:w-[280px] lg:w-[320px] shrink-0">
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
                                                            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                                                        />
                                                    </svg>
                                                    <span className="truncate">
                                                        {selectedRole
                                                            ? `Peran: ${selectedRole.replace(/_/g, " ")}`
                                                            : "Semua Peran"}
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
                                                    handleRoleFilter("")
                                                }
                                                className={`px-3 py-3 text-sm transition-colors ${
                                                    !selectedRole
                                                        ? "bg-purple-50 font-semibold text-purple-700"
                                                        : "text-gray-700 hover:bg-gray-50"
                                                }`}
                                            >
                                                Semua Peran
                                            </Dropdown.Item>
                                            {roles.map((role) => (
                                                <Dropdown.Item
                                                    key={role.id}
                                                    onClick={() =>
                                                        handleRoleFilter(
                                                            role.nama_role,
                                                        )
                                                    }
                                                    className={`px-3 py-3 text-sm transition-colors ${
                                                        selectedRole ===
                                                        role.nama_role
                                                            ? "bg-purple-50 font-semibold text-purple-700"
                                                            : "text-gray-700 hover:bg-gray-50"
                                                    }`}
                                                >
                                                    {role.nama_role.replace(
                                                        /_/g,
                                                        " ",
                                                    )}
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

                            <div className="shrink-0 pt-2 lg:pt-0 border-t border-gray-100 lg:border-t-0">
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
                                    Tambah Akun
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto min-h-[335px]">
                        <table className="w-full min-w-[950px] text-left text-xs border-collapse border border-gray-200">
                            <thead>
                                <tr className="bg-gray-100/90 border-b border-gray-200 text-[11px] font-bold uppercase tracking-wider text-gray-700">
                                    <th className="py-3 px-3.5 border-r border-gray-200 text-center w-12 shrink-0">
                                        No.
                                    </th>
                                    <th className="py-3 px-3.5 border-r border-gray-200">
                                        Pengguna
                                    </th>
                                    <th className="py-3 px-3.5 border-r border-gray-200">
                                        Hak Akses / Peran
                                    </th>
                                    <th className="py-3 px-3.5 border-r border-gray-200">
                                        Staf Terhubung
                                    </th>
                                    <th className="py-3 px-3.5 border-r border-gray-200">
                                        Status Akses
                                    </th>
                                    <th className="py-3 px-3.5 border-r border-gray-200">
                                        Tanggal Registrasi
                                    </th>
                                    <th className="py-3 px-3.5 text-center w-28 shrink-0">
                                        Kelola
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {users.data.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={7}
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
                                                    Data pengguna tidak
                                                    ditemukan
                                                </p>
                                                <p className="mt-0.5 text-xs text-gray-500">
                                                    Coba gunakan kata kunci lain
                                                    atau setel ulang filter
                                                    peran.
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    <>
                                        {users.data.map((user, index) => (
                                            <tr
                                                key={user.id}
                                                className="odd:bg-white even:bg-gray-50/70 hover:bg-purple-50/40 transition-colors h-[58px]"
                                            >
                                                <td className="py-3 px-3.5 border-r border-gray-200 text-center font-medium text-gray-600">
                                                    {users.from
                                                        ? users.from + index
                                                        : index + 1}
                                                </td>

                                                <td className="py-3 px-3.5 border-r border-gray-200">
                                                    <div className="flex items-center gap-2.5">
                                                        {user.foto ? (
                                                            <img
                                                                src={user.foto}
                                                                alt={user.name}
                                                                className="h-8.5 w-8.5 shrink-0 rounded-lg object-cover ring-1 ring-purple-100 shadow-2xs"
                                                            />
                                                        ) : (
                                                            <div className="flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-[10.5px] font-bold text-purple-700 ring-1 ring-purple-100">
                                                                {user.name
                                                                    .slice(0, 2)
                                                                    .toUpperCase()}
                                                            </div>
                                                        )}
                                                        <div className="min-w-0">
                                                            <p className="break-words text-xs font-bold text-gray-900 leading-snug">
                                                                {user.name}
                                                            </p>
                                                            <p className="mt-0.5 break-all text-[11px] text-gray-500 font-medium">
                                                                {user.email}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="py-3 px-3.5 border-r border-gray-200">
                                                    <span
                                                        className={`inline-flex items-center whitespace-nowrap rounded px-1.5 py-0.5 text-[9.5px] font-bold ring-1 ring-inset ${getRoleBadgeClass(user.role_name)}`}
                                                    >
                                                        {user.role_name.replace(
                                                            /_/g,
                                                            " ",
                                                        )}
                                                    </span>
                                                </td>

                                                <td className="py-3 px-3.5 border-r border-gray-200">
                                                    {user.staf_name ? (
                                                        <div className="text-xs">
                                                            <p className="font-semibold text-gray-800 leading-snug">
                                                                {user.staf_name}
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <span className="inline-flex text-[10px] font-semibold text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
                                                            Belum Terhubung
                                                        </span>
                                                    )}
                                                </td>

                                                <td className="py-3 px-3.5 border-r border-gray-200">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleToggleStatus(
                                                                user,
                                                            )
                                                        }
                                                        className={`inline-flex h-6.5 items-center gap-1 rounded-full px-2.5 text-[10.5px] font-bold transition-all focus:outline-none active:scale-95 ${
                                                            user.status_aktif
                                                                ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-100"
                                                                : "bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-100"
                                                        }`}
                                                        title="Klik untuk ubah status aktif akun"
                                                    >
                                                        <span
                                                            className={`h-1 w-1 rounded-full ${user.status_aktif ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`}
                                                        />
                                                        {user.status_aktif
                                                            ? "Aktif"
                                                            : "Nonaktif"}
                                                    </button>
                                                </td>

                                                <td className="py-3 px-3.5 border-r border-gray-200 whitespace-nowrap text-xs text-gray-600 font-medium">
                                                    {user.created_at}
                                                </td>

                                                <td className="py-3 px-3.5 text-center">
                                                    <div className="flex items-center justify-center gap-1.5">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                openEditModal(
                                                                    user,
                                                                )
                                                            }
                                                            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 border border-gray-200 hover:border-purple-300 hover:bg-purple-50 hover:text-purple-700 transition-all focus:outline-none"
                                                            title="Edit Akun"
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
                                                                    user,
                                                                )
                                                            }
                                                            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 border border-gray-200 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 transition-all focus:outline-none"
                                                            title="Hapus Akun"
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
                                        {users.data.length > 0 &&
                                            users.data.length < 5 &&
                                            Array.from({
                                                length: 5 - users.data.length,
                                            }).map((_, idx) => (
                                                <tr
                                                    key={`empty-${idx}`}
                                                    aria-hidden="true"
                                                    className="odd:bg-white even:bg-gray-50/70 h-[58px]"
                                                >
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
                                {users.from || 0}
                            </span>{" "}
                            hingga{" "}
                            <span className="font-bold text-gray-800">
                                {users.to || 0}
                            </span>{" "}
                            dari total{" "}
                            <span className="font-bold text-gray-800">
                                {users.total}
                            </span>{" "}
                            pengguna.
                        </p>
                        <Pagination
                            links={users.links}
                            currentPage={users.current_page}
                            totalPages={users.last_page}
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
                        ? editingUser
                            ? "Konfirmasi Simpan Perubahan"
                            : "Konfirmasi Buat Akun"
                        : editingUser
                          ? "Edit Akun Pengguna"
                          : "Tambah Pengguna Baru"
                }
                description={
                    saveConfirmModalOpen
                        ? undefined
                        : editingUser
                          ? `Sesuaikan akses dan data akun milik ${editingUser.name}.`
                          : "Lengkapi formulir berikut untuk mendaftarkan akun pengguna baru."
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
                                {editingUser
                                    ? "Ya, Simpan Perubahan"
                                    : "Ya, Daftarkan Akun"}
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
                                {editingUser
                                    ? "Simpan Perubahan"
                                    : "Buat Akun Petugas"}
                            </Button>
                        </div>
                    )
                }
            >
                {saveConfirmModalOpen ? (
                    /* TAMPILAN KONFIRMASI SIMPAN */
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
                                    {editingUser
                                        ? "Pastikan data perubahan akun sudah benar sebelum disimpan ke sistem:"
                                        : "Pastikan data akun petugas baru berikut sudah lengkap dan benar:"}
                                </p>
                                <div className="mt-2.5 rounded-lg border border-gray-100 bg-gray-50/70 p-2.5 space-y-1.5 text-xs">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500 font-medium">
                                            Nama:
                                        </span>
                                        <span className="font-bold text-gray-900 truncate max-w-[170px]">
                                            {data.name}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500 font-medium">
                                            Email:
                                        </span>
                                        <span className="font-mono text-gray-700 truncate max-w-[170px]">
                                            {data.email}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500 font-medium">
                                            Peran:
                                        </span>
                                        <span className="font-semibold text-purple-700">
                                            {roles
                                                .find(
                                                    (r) =>
                                                        Number(r.id) ===
                                                        Number(data.id_role),
                                                )
                                                ?.nama_role.replace(
                                                    /_/g,
                                                    " ",
                                                ) || "-"}
                                        </span>
                                    </div>
                                    {data.id_staf && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-500 font-medium">
                                                Staf:
                                            </span>
                                            <span className="font-semibold text-gray-800 truncate max-w-[170px]">
                                                {staffList.find(
                                                    (s) =>
                                                        String(s.id) ===
                                                        String(data.id_staf),
                                                )?.nama_staf || "-"}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* TAMPILAN FORMULIR ISIAN */
                    <form
                        noValidate
                        onSubmit={handleRequestSave}
                        className="space-y-2.5 sm:space-y-3.5"
                    >
                        <div className="flex flex-row items-center justify-between gap-2 p-2 sm:p-3 rounded-xl bg-gray-50/70 border border-gray-200/80">
                            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                                <div className="relative shrink-0">
                                    {photoPreview ? (
                                        <img
                                            src={photoPreview}
                                            alt="Foto Profil"
                                            className="h-9 w-9 sm:h-12 sm:w-12 rounded-lg sm:rounded-xl object-cover ring-2 ring-purple-100 shadow-2xs"
                                        />
                                    ) : (
                                        <div className="h-9 w-9 sm:h-12 sm:w-12 rounded-lg sm:rounded-xl bg-purple-100 text-purple-700 font-extrabold text-xs sm:text-sm flex items-center justify-center border border-dashed border-purple-250">
                                            {data.name
                                                ? data.name
                                                      .slice(0, 2)
                                                      .toUpperCase()
                                                : "PW"}
                                        </div>
                                    )}
                                </div>

                                <div className="min-w-0 space-y-0.5 sm:space-y-1">
                                    <div className="flex items-center gap-1.5 sm:gap-2">
                                        <span className="text-[11px] sm:text-xs font-bold text-gray-800 leading-none">
                                            Foto Profil
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
                                            className="inline-flex h-5.5 sm:h-6 items-center px-2 sm:px-2.5 rounded-md border border-gray-300 bg-white text-[10px] sm:text-[11px] font-semibold text-gray-700 hover:bg-gray-50 hover:border-purple-400 transition-colors shadow-2xs"
                                        >
                                            {photoPreview
                                                ? "Ganti"
                                                : "Pilih Foto"}
                                        </button>
                                        {photoPreview && (
                                            <button
                                                type="button"
                                                onClick={handleRemovePhoto}
                                                className="inline-flex h-5.5 sm:h-6 items-center px-1.5 sm:px-2 rounded-md border border-rose-200 bg-rose-50 text-[10px] sm:text-[11px] font-semibold text-rose-700 hover:bg-rose-100 transition-colors"
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

                            <label className="flex items-center gap-2 cursor-pointer select-none bg-white py-1 px-2.5 sm:py-1.5 sm:px-3 rounded-lg border border-gray-200 hover:border-purple-300 transition-colors shrink-0 shadow-2xs">
                                <div className="text-right">
                                    <span className="block text-[10px] sm:text-[11px] font-bold text-gray-800 leading-tight">
                                        Status
                                    </span>
                                    <span
                                        className={`block text-[9.5px] sm:text-[10px] font-semibold leading-tight ${
                                            data.status_aktif
                                                ? "text-emerald-600"
                                                : "text-gray-400"
                                        }`}
                                    >
                                        {data.status_aktif
                                            ? "Aktif"
                                            : "Nonaktif"}
                                    </span>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={data.status_aktif}
                                    onChange={(e) =>
                                        setData(
                                            "status_aktif",
                                            e.target.checked,
                                        )
                                    }
                                    className="h-3.5 w-3.5 sm:h-4 sm:w-4 rounded border-gray-300 text-purple-650 focus:ring-purple-500 cursor-pointer"
                                />
                            </label>
                        </div>

                        <div className="grid grid-cols-2 gap-2 sm:gap-4">
                            <div className="space-y-2 sm:space-y-3">
                                <div className="space-y-1 min-w-0">
                                    <label
                                        className="text-[10px] sm:text-xs font-bold text-gray-750 block truncate"
                                        title="Hubungkan Profil Staf (Opsional)"
                                    >
                                        Hubungkan Profil Staf{" "}
                                        <span className="text-gray-400 font-normal hidden sm:inline">
                                            (Opsional)
                                        </span>
                                    </label>
                                    <Select
                                        size="md"
                                        value={data.id_staf}
                                        onChange={(value) =>
                                            setData("id_staf", value)
                                        }
                                        error={!!errors.id_staf}
                                        placeholder="Pilih biodata staf..."
                                        showCheckmark={false}
                                        options={[
                                            {
                                                value: "",
                                                label: "Tanpa ikatan staf (Akun Umum)",
                                            },
                                            ...staffList.map((staff) => ({
                                                value: staff.id,
                                                label: staff.nama_staf,
                                            })),
                                        ]}
                                    />
                                    {errors.id_staf && (
                                        <p className="text-[10px] sm:text-[11px] font-medium text-rose-600 leading-tight">
                                            {errors.id_staf}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] sm:text-xs font-bold text-gray-750 block truncate">
                                        Nama Lengkap{" "}
                                        <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        autoComplete="name"
                                        value={data.name}
                                        onChange={(e) =>
                                            setData("name", e.target.value)
                                        }
                                        placeholder="drh. Annisa Putri"
                                        className="h-9 sm:h-10 w-full rounded-lg sm:rounded-xl border border-gray-300 bg-white px-2.5 sm:px-3 text-[11px] sm:text-xs text-gray-800 placeholder:text-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
                                    />
                                    {errors.name && (
                                        <p className="text-[10px] sm:text-[11px] font-medium text-rose-600 leading-tight">
                                            {errors.name}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] sm:text-xs font-bold text-gray-750 block truncate">
                                        Alamat Email{" "}
                                        <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        autoComplete="email"
                                        value={data.email}
                                        onChange={(e) =>
                                            setData("email", e.target.value)
                                        }
                                        placeholder="dokter@puskeswan.com"
                                        className="h-9 sm:h-10 w-full rounded-lg sm:rounded-xl border border-gray-300 bg-white px-2.5 sm:px-3 text-[11px] sm:text-xs text-gray-800 placeholder:text-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
                                    />
                                    {errors.email && (
                                        <p className="text-[10px] sm:text-[11px] font-medium text-rose-600 leading-tight">
                                            {errors.email}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2 sm:space-y-3">
                                <div className="space-y-1 min-w-0">
                                    <label className="text-[10px] sm:text-xs font-bold text-gray-750 block truncate">
                                        Hak Akses{" "}
                                        <span className="text-rose-500">*</span>
                                    </label>
                                    <Select
                                        size="md"
                                        value={data.id_role}
                                        onChange={(value) =>
                                            setData(
                                                "id_role",
                                                value ? Number(value) : "",
                                            )
                                        }
                                        error={!!errors.id_role}
                                        placeholder="Pilih hak akses..."
                                        showCheckmark={false}
                                        options={roles.map((role) => ({
                                            value: role.id,
                                            label: role.nama_role.replace(
                                                /_/g,
                                                " ",
                                            ),
                                        }))}
                                    />
                                    {errors.id_role && (
                                        <p className="text-[10px] sm:text-[11px] font-medium text-rose-600 leading-tight">
                                            {errors.id_role}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] sm:text-xs font-bold text-gray-750 block truncate">
                                        {editingUser
                                            ? "Password Baru"
                                            : "Password"}{" "}
                                        {!editingUser && (
                                            <span className="text-rose-500">
                                                *
                                            </span>
                                        )}
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={
                                                showPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            autoComplete="new-password"
                                            value={data.password}
                                            onChange={(e) =>
                                                setData(
                                                    "password",
                                                    e.target.value,
                                                )
                                            }
                                            placeholder={
                                                editingUser
                                                    ? "Kosongkan jika tetap"
                                                    : "Min. 8 karakter"
                                            }
                                            className="h-9 sm:h-10 w-full rounded-lg sm:rounded-xl border border-gray-300 bg-white pl-2.5 sm:pl-3 pr-7 sm:pr-9 text-[11px] sm:text-xs text-gray-800 placeholder:text-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
                                        />
                                        <button
                                            type="button"
                                            tabIndex={-1}
                                            onClick={() =>
                                                setShowPassword(!showPassword)
                                            }
                                            className="absolute right-2 sm:right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                                            title={
                                                showPassword
                                                    ? "Sembunyikan password"
                                                    : "Lihat password"
                                            }
                                        >
                                            {showPassword ? (
                                                <svg
                                                    className="h-3.5 w-3.5 sm:h-4 sm:w-4"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
                                                    />
                                                </svg>
                                            ) : (
                                                <svg
                                                    className="h-3.5 w-3.5 sm:h-4 sm:w-4"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                    />
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                                    />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                    {errors.password && (
                                        <p className="text-[10px] sm:text-[11px] font-medium text-rose-600 leading-tight">
                                            {errors.password}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] sm:text-xs font-bold text-gray-750 block truncate">
                                        Ulangi Password{" "}
                                        {!editingUser && (
                                            <span className="text-rose-500">
                                                *
                                            </span>
                                        )}
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={
                                                showPasswordConfirm
                                                    ? "text"
                                                    : "password"
                                            }
                                            autoComplete="new-password"
                                            value={data.password_confirmation}
                                            onChange={(e) =>
                                                setData(
                                                    "password_confirmation",
                                                    e.target.value,
                                                )
                                            }
                                            placeholder={
                                                editingUser
                                                    ? "Ulangi password baru"
                                                    : "Ulangi password"
                                            }
                                            className="h-9 sm:h-10 w-full rounded-lg sm:rounded-xl border border-gray-300 bg-white pl-2.5 sm:pl-3 pr-7 sm:pr-9 text-[11px] sm:text-xs text-gray-800 placeholder:text-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
                                        />
                                        <button
                                            type="button"
                                            tabIndex={-1}
                                            onClick={() =>
                                                setShowPasswordConfirm(
                                                    !showPasswordConfirm,
                                                )
                                            }
                                            className="absolute right-2 sm:right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                                            title={
                                                showPasswordConfirm
                                                    ? "Sembunyikan password"
                                                    : "Lihat password"
                                            }
                                        >
                                            {showPasswordConfirm ? (
                                                <svg
                                                    className="h-3.5 w-3.5 sm:h-4 sm:w-4"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
                                                    />
                                                </svg>
                                            ) : (
                                                <svg
                                                    className="h-3.5 w-3.5 sm:h-4 sm:w-4"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                    />
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                                    />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                    {errors.password_confirmation && (
                                        <p className="text-[10px] sm:text-[11px] font-medium text-rose-600 leading-tight">
                                            {errors.password_confirmation}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <button type="submit" className="hidden" />
                    </form>
                )}
            </Modal>

            <Modal
                isOpen={deleteModalOpen}
                onClose={() => !isDeleting && setDeleteModalOpen(false)}
                title="Hapus Akun"
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
                            Hapus Akun
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
                                Anda akan menghapus secara permanen akun
                                petugas:
                            </p>
                            <div className="mt-2.5">
                                <p className="text-sm font-bold text-gray-900 break-all">
                                    {userToDelete?.name}
                                </p>
                                <p className="text-xs text-gray-500 font-mono mt-0.5 break-all">
                                    {userToDelete?.email}
                                </p>
                            </div>
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
