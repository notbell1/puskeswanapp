import React, { useRef, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Button, Modal, useToast } from '@/components/ui';

interface StaffData {
    id: number;
    nama_staf: string;
    jabatan: string;
    nip_strv: string;
    foto?: string | null;
}

interface RoleData {
    id?: number;
    name: string;
    label: string;
    badge_color: string;
    description: string;
}

interface UserProfileData {
    id: number;
    name: string;
    email: string;
    foto?: string | null;
    status_aktif: boolean;
    created_at: string;
    updated_at: string;
    email_verified: boolean;
    role: RoleData;
    staff?: StaffData | null;
}

interface ProfilePageProps {
    userProfile: UserProfileData;
}

export default function ProfileIndex({ userProfile }: ProfilePageProps) {
    const { success, error, warning } = useToast();

    const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'info'>('profile');

    const [name, setName] = useState(userProfile.name);
    const [email, setEmail] = useState(userProfile.email);
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(userProfile.foto || null);
    const [removePhoto, setRemovePhoto] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPw, setShowCurrentPw] = useState(false);
    const [showNewPw, setShowNewPw] = useState(false);
    const [showConfirmPw, setShowConfirmPw] = useState(false);

    const [confirmProfileModalOpen, setConfirmProfileModalOpen] = useState(false);
    const [confirmPasswordModalOpen, setConfirmPasswordModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isSubmittingRef = useRef(false);

    const getInitials = (n: string) => {
        if (!n) return 'PW';
        const parts = n.trim().split(' ');
        if (parts.length >= 2) {
            return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
        }
        return n.substring(0, 2).toUpperCase();
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            e.target.value = '';
            warning('Ukuran foto profil tidak boleh melebihi 5MB.');
            return;
        }

        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
        if (!allowedTypes.includes(file.type.toLowerCase())) {
            e.target.value = '';
            error('Format berkas tidak diizinkan. Gunakan format JPG, JPEG, PNG, atau WEBP.');
            return;
        }

        setPhotoFile(file);
        setRemovePhoto(false);
        setPhotoPreview(URL.createObjectURL(file));
    };

    const handleRemovePhoto = () => {
        setPhotoFile(null);
        setPhotoPreview(null);
        setRemovePhoto(true);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleProfileSubmitCheck = (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            warning('Nama lengkap wajib diisi.');
            return;
        }

        if (!email.trim()) {
            warning('Alamat email wajib diisi.');
            return;
        }

        if (!email.includes('@') || !email.includes('.')) {
            error('Format alamat email tidak valid (harus mengandung @ dan domain yang sah).');
            return;
        }

        setConfirmProfileModalOpen(true);
    };

    const executeProfileUpdate = () => {
        if (isSubmittingRef.current) return;
        isSubmittingRef.current = true;
        setIsSubmitting(true);

        const formData = new FormData();
        formData.append('name', name.trim());
        formData.append('email', email.trim().toLowerCase());
        if (photoFile) {
            formData.append('foto', photoFile);
        }
        if (removePhoto) {
            formData.append('hapus_foto', '1');
        }

        router.post('/profil', formData, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setConfirmProfileModalOpen(false);
                success('Profil akun Anda berhasil diperbarui!');
            },
            onError: (errs) => {
                setConfirmProfileModalOpen(false);
                const first = Object.values(errs)[0];
                error(typeof first === 'string' ? first : 'Gagal memperbarui profil.');
            },
            onFinish: () => {
                isSubmittingRef.current = false;
                setIsSubmitting(false);
            },
        });
    };

    const handlePasswordSubmitCheck = (e: React.FormEvent) => {
        e.preventDefault();

        if (!currentPassword) {
            warning('Kata sandi saat ini wajib diisi.');
            return;
        }

        if (!newPassword) {
            warning('Kata sandi baru wajib diisi.');
            return;
        }

        if (newPassword.length < 8) {
            error('Kata sandi baru minimal harus 8 karakter demi keamanan akun.');
            return;
        }

        if (newPassword !== confirmPassword) {
            error('Konfirmasi kata sandi baru tidak cocok. Mohon ketikkan ulang.');
            return;
        }

        if (newPassword === currentPassword) {
            warning('Kata sandi baru harus berbeda dari kata sandi saat ini.');
            return;
        }

        setConfirmPasswordModalOpen(true);
    };

    const executePasswordUpdate = () => {
        if (isSubmittingRef.current) return;
        isSubmittingRef.current = true;
        setIsSubmitting(true);

        router.put(
            '/profil/password',
            {
                current_password: currentPassword,
                password: newPassword,
                password_confirmation: confirmPassword,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setConfirmPasswordModalOpen(false);
                    setCurrentPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                    success('Kata sandi berhasil diperbarui! Gunakan kata sandi baru untuk login selanjutnya.');
                },
                onError: (errs) => {
                    setConfirmPasswordModalOpen(false);
                    const first = Object.values(errs)[0];
                    error(typeof first === 'string' ? first : 'Gagal memperbarui kata sandi.');
                },
                onFinish: () => {
                    isSubmittingRef.current = false;
                    setIsSubmitting(false);
                },
            }
        );
    };

    return (
        <DashboardLayout title="Profil & Pengaturan Akun">
            <Head title="Profil & Pengaturan Akun" />

            <div className="space-y-4 max-w-[1200px] mx-auto">
                <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5 shadow-xs">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5">
                        <div className="relative shrink-0">
                            {photoPreview ? (
                                <img
                                    src={photoPreview}
                                    alt={name}
                                    className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl object-cover object-center border-2 border-purple-200 shadow-sm"
                                />
                            ) : (
                                <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl bg-gradient-to-br from-purple-700 to-purple-900 text-white font-bold text-2xl flex items-center justify-center shadow-sm">
                                    {getInitials(name)}
                                </div>
                            )}
                            <span
                                className="absolute bottom-1 right-1 h-4 w-4 rounded-full bg-emerald-500 border-2 border-white shadow-xs"
                                title="Akun Aktif"
                            />
                        </div>

                        <div className="flex-1 text-center sm:text-left min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-between">
                                <div>
                                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight truncate">
                                        {userProfile.name}
                                    </h2>
                                    <p className="text-xs sm:text-sm text-gray-500 mt-0.5 truncate">
                                        {userProfile.email}
                                    </p>
                                </div>

                                <div>
                                    <span
                                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${userProfile.role.badge_color}`}
                                    >
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                        </svg>
                                        {userProfile.role.label}
                                    </span>
                                </div>
                            </div>

                            <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                                {userProfile.role.description}
                            </p>

                            {userProfile.staff && (
                                <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-600">
                                    <span className="font-semibold text-gray-800">
                                        Jabatan: {userProfile.staff.jabatan}
                                    </span>
                                    <span>&bull;</span>
                                    <span>NIP/STRV: <strong className="font-mono text-purple-700">{userProfile.staff.nip_strv}</strong></span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-gray-100 flex items-center gap-2 overflow-x-auto">
                        <button
                            type="button"
                            onClick={() => setActiveTab('profile')}
                            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                                activeTab === 'profile'
                                    ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-transparent'
                            }`}
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span>Data Diri &amp; Foto</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab('password')}
                            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                                activeTab === 'password'
                                    ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-transparent'
                            }`}
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            <span>Keamanan &amp; Kata Sandi</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab('info')}
                            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                                activeTab === 'info'
                                    ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-transparent'
                            }`}
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Informasi Akun &amp; Sistem</span>
                        </button>
                    </div>
                </div>

                {activeTab === 'profile' && (
                    <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-6 shadow-xs">
                        <div className="border-b border-gray-100 pb-3 mb-5">
                            <h3 className="text-sm font-bold text-gray-900">
                                Pengaturan Data Profil Pengguna
                            </h3>
                            <p className="text-xs text-gray-500 mt-0.5">
                                Ubah nama tampilan, alamat email, dan foto profil akun Anda.
                            </p>
                        </div>

                        <form onSubmit={handleProfileSubmitCheck} className="space-y-5">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-2">
                                    Foto Profil Akun
                                </label>
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                    <div className="relative shrink-0">
                                        {photoPreview ? (
                                            <img
                                                src={photoPreview}
                                                alt="Preview"
                                                className="h-20 w-20 rounded-2xl object-cover object-center border border-purple-200 shadow-xs"
                                            />
                                        ) : (
                                            <div className="h-20 w-20 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center font-bold text-lg border border-gray-200">
                                                {getInitials(name)}
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-1.5">
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/png,image/jpeg,image/jpg,image/webp"
                                            onChange={handlePhotoChange}
                                            className="hidden"
                                        />
                                        <div className="flex flex-wrap items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                className="h-9 px-3.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5"
                                            >
                                                <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                <span>Pilih Foto Baru</span>
                                            </button>

                                            {(photoPreview || photoFile) && (
                                                <button
                                                    type="button"
                                                    onClick={handleRemovePhoto}
                                                    className="h-9 px-3 rounded-lg border border-rose-200 bg-rose-50/50 hover:bg-rose-100 text-rose-700 text-xs font-semibold transition-colors flex items-center gap-1.5"
                                                >
                                                    <svg className="w-3.5 h-3.5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                    <span>Hapus Foto</span>
                                                </button>
                                            )}
                                        </div>
                                        <p className="text-[11px] text-gray-400">
                                            Format JPG, JPEG, PNG, atau WEBP. Maksimal 5MB. Rasio 1:1 direkomendasikan.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                        Nama Lengkap <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Masukkan nama lengkap Anda..."
                                        className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 placeholder:text-gray-400 transition-all focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                        Alamat Email <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="contoh: nama@puskeswan.go.id"
                                        className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 placeholder:text-gray-400 transition-all focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1">
                                        Hak Akses Peran Akun
                                    </label>
                                    <input
                                        type="text"
                                        value={userProfile.role.label}
                                        disabled
                                        className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 text-xs font-medium text-gray-600 cursor-not-allowed"
                                    />
                                    <p className="text-[10px] text-gray-400 mt-1">
                                        Peran akun dikelola langsung oleh Super Administrator sistem.
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1">
                                        Status Kepegawaian
                                    </label>
                                    <input
                                        type="text"
                                        value={userProfile.staff ? `${userProfile.staff.jabatan} (NIP: ${userProfile.staff.nip_strv})` : 'Akun Tidak Tertaut Tenaga Staf Khusus'}
                                        disabled
                                        className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 text-xs font-medium text-gray-600 cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            <div className="pt-3 border-t border-gray-100 flex justify-end">
                                <button
                                    type="submit"
                                    className="h-10 px-5 rounded-lg bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white font-semibold text-xs shadow-xs transition-colors flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>Simpan Perubahan Profil</span>
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {activeTab === 'password' && (
                    <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-6 shadow-xs">
                        <div className="border-b border-gray-100 pb-3 mb-5">
                            <h3 className="text-sm font-bold text-gray-900">
                                Perbarui Kata Sandi Akun
                            </h3>
                            <p className="text-xs text-gray-500 mt-0.5">
                                Pastikan kata sandi baru Anda unik, kuat, dan minimal terdiri dari 8 karakter.
                            </p>
                        </div>

                        <form onSubmit={handlePasswordSubmitCheck} className="space-y-4 max-w-xl">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                    Kata Sandi Saat Ini <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type={showCurrentPw ? 'text' : 'password'}
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        placeholder="Ketikkan kata sandi saat ini..."
                                        className="h-10 w-full rounded-lg border border-gray-200 bg-white pl-3 pr-10 text-sm text-gray-800 placeholder:text-gray-400 transition-all focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowCurrentPw(!showCurrentPw)}
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                                        tabIndex={-1}
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            {showCurrentPw ? (
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                                            ) : (
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            )}
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                    Kata Sandi Baru <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type={showNewPw ? 'text' : 'password'}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Ketikkan minimal 8 karakter kata sandi baru..."
                                        className="h-10 w-full rounded-lg border border-gray-200 bg-white pl-3 pr-10 text-sm text-gray-800 placeholder:text-gray-400 transition-all focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPw(!showNewPw)}
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                                        tabIndex={-1}
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            {showNewPw ? (
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                                            ) : (
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            )}
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                    Konfirmasi Kata Sandi Baru <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type={showConfirmPw ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Ketikkan ulang kata sandi baru..."
                                        className="h-10 w-full rounded-lg border border-gray-200 bg-white pl-3 pr-10 text-sm text-gray-800 placeholder:text-gray-400 transition-all focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPw(!showConfirmPw)}
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                                        tabIndex={-1}
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            {showConfirmPw ? (
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                                            ) : (
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            )}
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            <div className="pt-3 border-t border-gray-100 flex justify-end">
                                <button
                                    type="submit"
                                    className="h-10 px-5 rounded-lg bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white font-semibold text-xs shadow-xs transition-colors flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                    <span>Perbarui Kata Sandi</span>
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {activeTab === 'info' && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5 shadow-xs space-y-3">
                                <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wide border-b border-gray-100 pb-2 text-purple-700 flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                    </svg>
                                    Identitas Akun Sistem
                                </h4>
                                <div className="space-y-2 text-xs">
                                    <div className="flex items-center justify-between py-1 border-b border-gray-50">
                                        <span className="text-gray-400">ID Pengguna (Database):</span>
                                        <span className="font-mono font-bold text-gray-900">#{userProfile.id}</span>
                                    </div>
                                    <div className="flex items-center justify-between py-1 border-b border-gray-50">
                                        <span className="text-gray-400">Status Akun:</span>
                                        <span className="inline-block px-2 py-0.5 rounded-full font-bold text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200">
                                            {userProfile.status_aktif ? 'Aktif' : 'Non-Aktif'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between py-1 border-b border-gray-50">
                                        <span className="text-gray-400">Verifikasi Email:</span>
                                        <span className="inline-block px-2 py-0.5 rounded-full font-bold text-[10px] bg-blue-50 text-blue-700 border border-blue-200">
                                            {userProfile.email_verified ? 'Terverifikasi' : 'Belum Diverifikasi'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between py-1 border-b border-gray-50">
                                        <span className="text-gray-400">Terdaftar Sejak:</span>
                                        <span className="font-medium text-gray-800">{userProfile.created_at}</span>
                                    </div>
                                    <div className="flex items-center justify-between py-1">
                                        <span className="text-gray-400">Terakhir Diperbarui:</span>
                                        <span className="font-medium text-gray-800">{userProfile.updated_at}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5 shadow-xs space-y-3">
                                <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wide border-b border-gray-100 pb-2 text-emerald-700 flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                    Data Penugasan Puskeswan
                                </h4>
                                {userProfile.staff ? (
                                    <div className="space-y-2 text-xs">
                                        <div className="flex items-center justify-between py-1 border-b border-gray-50">
                                            <span className="text-gray-400">Nama Tenaga Staf:</span>
                                            <span className="font-bold text-gray-900">{userProfile.staff.nama_staf}</span>
                                        </div>
                                        <div className="flex items-center justify-between py-1 border-b border-gray-50">
                                            <span className="text-gray-400">Jabatan Fungsional:</span>
                                            <span className="font-medium text-gray-800">{userProfile.staff.jabatan}</span>
                                        </div>
                                        <div className="flex items-center justify-between py-1">
                                            <span className="text-gray-400">NIP / STRV:</span>
                                            <span className="font-mono font-bold text-purple-700">{userProfile.staff.nip_strv}</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 text-center text-xs text-gray-500">
                                        Akun ini dikonfigurasi sebagai pengguna sistem administratif langsung tanpa tertaut dengan data tenaga fungsional staf puskeswan.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <Modal
                isOpen={confirmProfileModalOpen}
                onClose={() => setConfirmProfileModalOpen(false)}
                title="Konfirmasi Perubahan Profil"
                size="sm"
                footer={
                    <>
                        <Button
                            variant="secondary"
                            onClick={() => setConfirmProfileModalOpen(false)}
                            disabled={isSubmitting}
                        >
                            Batal
                        </Button>
                        <Button
                            variant="primary"
                            onClick={executeProfileUpdate}
                            isLoading={isSubmitting}
                            className="bg-purple-600 hover:bg-purple-700 text-white"
                        >
                            Ya, Simpan Perubahan
                        </Button>
                    </>
                }
            >
                <div className="text-xs text-gray-600 space-y-2">
                    <p>Apakah Anda yakin ingin memperbarui data profil akun ini?</p>
                    <div className="p-3 rounded-lg bg-gray-50 border border-gray-200 space-y-1">
                        <div>
                            <span className="text-gray-400">Nama:</span> <strong className="text-gray-900">{name}</strong>
                        </div>
                        <div>
                            <span className="text-gray-400">Email:</span> <strong className="text-gray-900">{email}</strong>
                        </div>
                        {photoFile && (
                            <div className="text-purple-700 font-semibold">
                                &bull; Foto profil baru akan diunggah
                            </div>
                        )}
                        {removePhoto && (
                            <div className="text-rose-700 font-semibold">
                                &bull; Foto profil akan dihapus
                            </div>
                        )}
                    </div>
                </div>
            </Modal>

            <Modal
                isOpen={confirmPasswordModalOpen}
                onClose={() => setConfirmPasswordModalOpen(false)}
                title="Konfirmasi Perubahan Kata Sandi"
                type="warning"
                size="sm"
                footer={
                    <>
                        <Button
                            variant="secondary"
                            onClick={() => setConfirmPasswordModalOpen(false)}
                            disabled={isSubmitting}
                        >
                            Batal
                        </Button>
                        <Button
                            variant="primary"
                            onClick={executePasswordUpdate}
                            isLoading={isSubmitting}
                            className="bg-purple-600 hover:bg-purple-700 text-white"
                        >
                            Ya, Perbarui Kata Sandi
                        </Button>
                    </>
                }
            >
                <p className="text-xs text-gray-600">
                    Apakah Anda yakin ingin memperbarui kata sandi akun <strong className="text-gray-900">{userProfile.name}</strong>? Setelah berhasil, Anda wajib menggunakan kata sandi baru untuk login selanjutnya.
                </p>
            </Modal>
        </DashboardLayout>
    );
}

