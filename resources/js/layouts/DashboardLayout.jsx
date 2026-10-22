import React, { useState } from 'react';
import { usePage, router } from '@inertiajs/react';
import Sidebar from './Sidebar';
import { Dropdown, Modal, Button } from '@/components/ui';
import NotificationBell from '@/components/NotificationBell';
import { cn } from '@/lib/utils';

/**
 * Dashboard Layout Component (Admin / Auth)
 * Digunakan untuk seluruh halaman internal petugas: Super Admin, Admin, dan Dokter.
 * Fitur:
 * - Sidebar dinamis berdasarkan peran ('super', 'admin', 'dokter').
 * - Sidebar dapat di-minimize dan maximize dengan transisi animasi halus & persistensi local storage.
 * - Top navbar responsif dengan tombol toggle mobile & desktop.
 * - Profil Dropdown dengan avatar, nama pengguna, link Profil, dan Keluar.
 * - Modal Konfirmasi Keluar yang aman.
 * - Toast Provider terintegrasi untuk alert & flash messages.
 */
/**
 * @param {object} props
 * @param {React.ReactNode} props.children
 * @param {string} [props.title]
 * @param {string} [props.userRole]
 * @param {number} [props.notificationCount]
 */
export default function DashboardLayout({
    children,
    title = 'Dashboard',
    userRole: userRoleProp = undefined,
    notificationCount = 0,
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [logoutModalOpen, setLogoutModalOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const [isCollapsed, setIsCollapsed] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('puskeswan_sidebar_collapsed') === 'true';
        }
        return false;
    });

    const toggleCollapse = () => {
        setIsCollapsed((prev) => {
            const next = !prev;
            if (typeof window !== 'undefined') {
                localStorage.setItem('puskeswan_sidebar_collapsed', String(next));
            }
            return next;
        });
    };

    const page = usePage();
    const rawUser = page?.props?.auth?.user;
    const user = rawUser || {
        name: 'drh. Ahmad Fauzi',
        email: 'dokter@puskeswan.go.id',
        role: 'dokter', // 'super' | 'admin' | 'dokter'
    };

    const resolveRole = (r) => {
        if (!r) return 'admin';
        if (typeof r === 'object') {
            r = r.nama_role || r.name || '';
        }
        const str = String(r).toLowerCase().trim();
        if (str.includes('super')) return 'super';
        if (str.includes('dokter')) return 'dokter';
        return 'admin';
    };

    const userRole = resolveRole(userRoleProp || user.role || user.role_raw || user.role_display);

    const roleBadges = {
        super: {
            label: 'Super Admin',
            color: 'bg-purple-100 text-purple-700 border-purple-200',
        },
        admin: {
            label: 'Petugas Admin',
            color: 'bg-blue-100 text-blue-700 border-blue-200',
        },
        dokter: {
            label: 'Dokter Hewan',
            color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        },
    };

    const currentBadge = roleBadges[userRole] || roleBadges.admin;

    const getInitials = (name) => {
        if (!name) return 'PW';
        const parts = name.split(' ');
        if (parts.length >= 2) {
            return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    const getProfilePath = () => {
        if (userRole === 'super') return '/super/profil';
        if (userRole === 'dokter') return '/dokter/profil';
        return '/admin/profil';
    };

    const handleLogoutConfirm = () => {
        setIsLoggingOut(true);
        router.post('/logout', {}, {
            onFinish: () => {
                setIsLoggingOut(false);
                setLogoutModalOpen(false);
            },
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 flex font-sans antialiased text-gray-900 selection:bg-purple-100 selection:text-purple-900">
                <Sidebar
                    role={userRole}
                    isOpen={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                    isCollapsed={isCollapsed}
                    onToggleCollapse={toggleCollapse}
                />

                <div
                    className={cn(
                        "flex-1 flex flex-col min-w-0 transition-[padding] duration-300 ease-in-out",
                        isCollapsed ? "lg:pl-[72px]" : "lg:pl-[260px]"
                    )}
                >
                    <header className="sticky top-0 z-30 h-16 bg-white border-b border-gray-100 shadow-2xs px-4 sm:px-6 lg:px-8 flex items-center justify-between">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <button
                                type="button"
                                onClick={() => setSidebarOpen(true)}
                                className="p-2 rounded-xl text-gray-500 hover:text-purple-700 hover:bg-purple-50 lg:hidden focus:outline-none transition-colors"
                                aria-label="Buka menu navigasi"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>

                            <div className="flex items-center gap-2">
                                <h1 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight">
                                    {title}
                                </h1>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {userRole === 'dokter' && (
                                <>
                                    <NotificationBell userRole={userRole} />
                                    <div className="h-6 w-px bg-gray-200 hidden sm:block" />
                                </>
                            )}

                            <Dropdown>
                                <Dropdown.Trigger>
                                    <div className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group">
                                        {user.foto ? (
                                            <img
                                                src={user.foto}
                                                alt={user.name}
                                                className="h-9 w-9 rounded-xl object-cover border border-purple-100 shadow-xs"
                                            />
                                        ) : (
                                            <div className="h-9 w-9 rounded-xl bg-purple-700 text-white font-bold text-xs flex items-center justify-center shadow-xs group-hover:bg-purple-600 transition-colors">
                                                {getInitials(user.name)}
                                            </div>
                                        )}
                                        <div className="hidden md:flex flex-col text-left">
                                            <span className="text-xs font-semibold text-gray-800 leading-tight">
                                                {user.name}
                                            </span>
                                            <span className="text-[10px] text-gray-400 font-medium leading-tight">
                                                {user.email}
                                            </span>
                                        </div>
                                        <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </Dropdown.Trigger>

                                <Dropdown.Content align="right" width="w-60">
                                    <Dropdown.Header>
                                        <div className="flex flex-col gap-1">
                                            <span className="font-semibold text-gray-900 text-xs truncate">
                                                {user.name}
                                            </span>
                                            <span className="text-[11px] text-gray-500 truncate">
                                                {user.email}
                                            </span>
                                            <span className={`inline-block w-fit text-[10px] font-semibold px-2 py-0.5 rounded-md border mt-1 ${currentBadge.color}`}>
                                                {currentBadge.label}
                                            </span>
                                        </div>
                                    </Dropdown.Header>

                                    <Dropdown.Item
                                        href={getProfilePath()}
                                        icon={
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        }
                                    >
                                        Profil Saya
                                    </Dropdown.Item>

                                    <Dropdown.Item
                                        href={getProfilePath()}
                                        icon={
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        }
                                    >
                                        Pengaturan Akun
                                    </Dropdown.Item>

                                    <Dropdown.Divider />

                                    <Dropdown.Item
                                        onClick={() => setLogoutModalOpen(true)}
                                        danger
                                        icon={
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                            </svg>
                                        }
                                    >
                                        Keluar dari Sistem
                                    </Dropdown.Item>
                                </Dropdown.Content>
                            </Dropdown>
                        </div>
                    </header>

                    <main className="flex-1 p-4 sm:p-6 lg:p-8">
                        {children}
                    </main>
                </div>

                <Modal
                    isOpen={logoutModalOpen}
                    onClose={() => setLogoutModalOpen(false)}
                    title="Konfirmasi Keluar"
                    description="Sesi kerja Anda saat ini akan diakhiri secara aman."
                    type="danger"
                    size="sm"
                    footer={
                        <>
                            <Button
                                variant="secondary"
                                onClick={() => setLogoutModalOpen(false)}
                                disabled={isLoggingOut}
                            >
                                Batal
                            </Button>
                            <Button
                                variant="danger"
                                onClick={handleLogoutConfirm}
                                isLoading={isLoggingOut}
                            >
                                Ya, Keluar
                            </Button>
                        </>
                    }
                >
                    <p className="text-gray-600">
                        Apakah Anda yakin ingin keluar dari akun <strong className="text-gray-900">{user.name}</strong>? Pastikan seluruh data transaksi atau rekam medis telah tersimpan dengan benar sebelum meninggalkan sistem.
                    </p>
                </Modal>
            </div>
    );
}

