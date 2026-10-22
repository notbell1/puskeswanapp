import React, { useState, useEffect } from "react";
import { Link, usePage } from "@inertiajs/react";
import { cn } from "@/lib/utils";

const menusByRole = {
    super: [
        {
            group: "MENU UTAMA",
            items: [
                {
                    label: "Dashboard",
                    href: "/super/dashboard",
                    icon: "dashboard",
                },
            ],
        },
        {
            group: "PENGGUNA & STAF",
            items: [
                {
                    label: "Manajemen Pengguna",
                    href: "/super/pengguna",
                    icon: "users",
                },
                {
                    label: "Data Tenaga Staf",
                    href: "/super/staf",
                    icon: "clipboard",
                },
            ],
        },
        {
            group: "MASTER DATA & LOGISTIK",
            items: [
                {
                    label: "Master Jenis Hewan",
                    href: "/super/jenis-hewan",
                    icon: "heart",
                },
                {
                    label: "Apotek & Stok Obat",
                    href: "/super/obat",
                    icon: "medicine",
                },
                {
                    label: "Inventaris Peralatan",
                    href: "/super/inventaris",
                    icon: "tag",
                },
            ],
        },
        {
            group: "KONTEN & EDUKASI",
            items: [
                {
                    label: "Artikel & Berita CMS",
                    href: "/super/artikel",
                    icon: "medical",
                },
            ],
        },
        {
            group: "PUSAT LAPORAN",
            items: [
                {
                    label: "Rekam Medis Pasien",
                    href: "/super/laporan/rekam-medis",
                    icon: "clipboard",
                },
                {
                    label: "Laporan Kasus Rabies",
                    href: "/super/laporan/rabies",
                    icon: "chart",
                },
            ],
        },
        {
            group: "PENGATURAN",
            items: [
                {
                    label: "Profil & Akun",
                    href: "/super/profil",
                    icon: "settings",
                },
            ],
        },
    ],
    admin: [
        {
            group: "MENU UTAMA",
            items: [
                {
                    label: "Dashboard",
                    href: "/admin/dashboard",
                    icon: "dashboard",
                },
            ],
        },
        {
            group: "KELOMPOK REKAM MEDIS",
            items: [
                {
                    label: "Rekam Medis",
                    href: "/admin/rekam-medis/create",
                    icon: "plus",
                },
                {
                    label: "Antrian Rekam Medis",
                    href: "/admin/rekam-medis/antrian",
                    icon: "clipboard",
                },
                {
                    label: "Hasil Rekam Medis",
                    href: "/admin/rekam-medis/hasil",
                    icon: "medical",
                },
            ],
        },
        {
            group: "KELOMPOK CATATAN KASUS GIGITAN RABIES",
            items: [
                {
                    label: "Catat Kasus Gigitan",
                    href: "/admin/rabies/create",
                    icon: "plus",
                },
                {
                    label: "Riwayat Kasus Gigitan",
                    href: "/admin/rabies",
                    icon: "chart",
                },
            ],
        },
        {
            group: "PENGATURAN",
            items: [
                {
                    label: "Profil & Akun",
                    href: "/admin/profil",
                    icon: "settings",
                },
            ],
        },
    ],
    dokter: [
        {
            group: "MENU UTAMA",
            items: [
                {
                    label: "Dashboard",
                    href: "/dokter/dashboard",
                    icon: "dashboard",
                },
            ],
        },
        {
            group: "PELAYANAN MEDIS DOKTER",
            items: [
                {
                    label: "Antrean Pasien",
                    href: "/dokter/antrian",
                    icon: "users",
                },
                {
                    label: "Riwayat Pemeriksaan",
                    href: "/dokter/riwayat",
                    icon: "history",
                },
            ],
        },
        {
            group: "PENGATURAN",
            items: [
                {
                    label: "Profil & Akun",
                    href: "/dokter/profil",
                    icon: "settings",
                },
            ],
        },
    ],
};

const roleLabels = {
    super: "Super Administrator",
    admin: "Petugas Administrasi",
    dokter: "Dokter Hewan",
};

function MenuIcon({ name, className }) {
    const common = {
        className: cn("h-4 w-4 shrink-0 transition-colors", className),
        fill: "none",
        viewBox: "0 0 24 24",
        stroke: "currentColor",
        strokeWidth: 1.8,
        strokeLinecap: "round",
        strokeLinejoin: "round",
        "aria-hidden": true,
    };

    const paths = {
        dashboard: (
            <>
                <path d="M3 10.5 12 3l9 7.5" />
                <path d="M5 9.5V21h14V9.5M9 21v-7h6v7" />
            </>
        ),
        clipboard: (
            <>
                <rect x="5" y="4" width="14" height="17" rx="2" />
                <path d="M9 4.5V3h6v1.5M8 10h8M8 14h8M8 18h5" />
            </>
        ),
        medical: (
            <>
                <rect x="4" y="4" width="16" height="17" rx="2" />
                <path d="M9 4V3h6v1M12 8v7M8.5 11.5h7" />
            </>
        ),
        users: (
            <>
                <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="10" cy="7" r="4" />
                <path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </>
        ),
        heart: (
            <>
                <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" />
            </>
        ),
        medicine: (
            <>
                <path d="m10 3 4 0 0 5 5 5a4 4 0 0 1-3 7H8a4 4 0 0 1-3-7l5-5V3Z" />
                <path d="M8 3h8M8 15h8" />
            </>
        ),
        tag: (
            <>
                <path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8Z" />
                <circle cx="7.5" cy="7.5" r="1" />
            </>
        ),
        chart: (
            <>
                <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
            </>
        ),
        settings: (
            <>
                <circle cx="12" cy="12" r="3" />
                <path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.6a8 8 0 0 1-1.8 1l-.3 1.8h-2.8l-.3-1.8a8 8 0 0 1-1.8-1l-1.7.6-1.4-2.4 1.4-1.1a7 7 0 0 1 0-2l-1.4-1.1 1.4-2.4 1.7.6a8 8 0 0 1 1.8-1l.3-1.8h2.8l.3 1.8a8 8 0 0 1 1.8 1l1.7-.6 1.4 2.4-1.4 1.1a7 7 0 0 1 0 2Z" />
            </>
        ),
        calendar: (
            <>
                <rect x="3" y="5" width="18" height="16" rx="2" />
                <path d="M16 3v4M8 3v4M3 10h18" />
            </>
        ),
        wallet: (
            <>
                <rect x="3" y="5" width="18" height="15" rx="2" />
                <path d="M3 9h18M16 14h2" />
            </>
        ),
        history: (
            <>
                <path d="M3 12a9 9 0 1 0 2.6-6.4L3 8" />
                <path d="M3 3v5h5M12 7v5l3 2" />
            </>
        ),
        plus: (
            <>
                <circle cx="12" cy="12" r="9" />
                <path d="M12 8v8M8 12h8" />
            </>
        ),
    };

    return <svg {...common}>{paths[name] ?? paths.dashboard}</svg>;
}

export default function Sidebar({
    role = "admin",
    isOpen = false,
    onClose = () => {},
    isCollapsed: controlledIsCollapsed,
    onToggleCollapse,
    className = "",
}) {
    const { url } = usePage();

    const [internalCollapsed, setInternalCollapsed] = useState(() => {
        if (typeof window !== "undefined") {
            return (
                localStorage.getItem("puskeswan_sidebar_collapsed") === "true"
            );
        }
        return false;
    });

    const isCollapsed =
        controlledIsCollapsed !== undefined
            ? controlledIsCollapsed
            : internalCollapsed;

    const handleToggleCollapse = () => {
        if (onToggleCollapse) {
            onToggleCollapse();
        } else {
            setInternalCollapsed((prev) => {
                const next = !prev;
                if (typeof window !== "undefined") {
                    localStorage.setItem(
                        "puskeswan_sidebar_collapsed",
                        String(next),
                    );
                }
                return next;
            });
        }
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape" && isOpen) {
                onClose();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);

    const normalizeRole = (r) => {
        if (!r) return "admin";
        if (typeof r === "object") r = r.nama_role || r.name || "";
        const str = String(r).toLowerCase().trim();
        if (str.includes("super")) return "super";
        if (str.includes("dokter")) return "dokter";
        return "admin";
    };

    const currentRole = normalizeRole(role);
    const menuGroups = menusByRole[currentRole] || menusByRole.admin;

    const isLinkActive = (href) => {
        if (href === "/super/dashboard") return url === "/super/dashboard";
        if (href === "/admin/dashboard") return url === "/admin/dashboard";
        if (href === "/dokter/dashboard") return url === "/dokter/dashboard";
        if (href === "/dokter/antrian") {
            return (
                url === "/dokter/antrian" ||
                url.startsWith("/dokter/antrian?") ||
                url.startsWith("/dokter/pemeriksaan")
            );
        }
        if (href === "/dokter/riwayat") {
            return (
                url === "/dokter/riwayat" || url.startsWith("/dokter/riwayat?")
            );
        }
        if (href.endsWith("/profil")) {
            return (
                url.endsWith("/profil") ||
                url === "/profil" ||
                url === "/pengaturan-akun"
            );
        }
        if (href === "/dashboard") return url === "/dashboard";
        if (href === "/admin/rabies") {
            return url === "/admin/rabies" || url.startsWith("/admin/rabies?");
        }
        if (href === "/admin/rekam-medis/antrian") {
            return (
                url === "/admin/rekam-medis/antrian" ||
                url.startsWith("/admin/rekam-medis/antrian?") ||
                url === "/admin/pendaftaran"
            );
        }
        if (href === "/admin/rekam-medis/create") {
            return (
                url === "/admin/rekam-medis/create" ||
                url === "/admin/rekam-medis"
            );
        }
        return url === href || url.startsWith(`${href}/`);
    };

    const getDashboardPath = () => {
        if (currentRole === "super") return "/super/dashboard";
        if (currentRole === "dokter") return "/dokter/dashboard";
        return "/admin/dashboard";
    };

    return (
        <>
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-xs lg:hidden transition-opacity"
                    onClick={onClose}
                    aria-label="Tutup menu sidebar"
                />
            )}

            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-gray-100 bg-white transition-[width,transform] duration-300 ease-in-out shadow-xs lg:shadow-none",
                    "w-[260px]",
                    isCollapsed ? "lg:w-[72px]" : "lg:w-[260px]",
                    isOpen
                        ? "translate-x-0"
                        : "-translate-x-full lg:translate-x-0",
                    className,
                )}
            >
                <div
                    className={cn(
                        "flex h-16 shrink-0 items-center border-b border-gray-100 transition-all relative",
                        isCollapsed
                            ? "justify-center px-2"
                            : "justify-between px-3.5 sm:px-4",
                    )}
                >
                    <Link
                        href={getDashboardPath()}
                        className={cn(
                            "group flex min-w-0 items-center focus:outline-none",
                            isCollapsed ? "justify-center" : "gap-2.5",
                        )}
                        title="Puskeswan - Sistem Informasi"
                    >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-700 text-white shadow-xs transition-all duration-200 group-hover:bg-purple-600 group-hover:scale-105">
                            <svg
                                className="h-4.5 w-4.5"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                aria-hidden="true"
                            >
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-4H7v-2h4V7h2v4h4v2h-4v4z" />
                            </svg>
                        </div>
                        {!isCollapsed && (
                            <div className="flex min-w-0 flex-col">
                                <span className="text-sm font-bold leading-tight tracking-tight text-gray-900 group-hover:text-purple-700 transition-colors">
                                    Puskeswan
                                </span>
                                <span className="text-[9px] font-semibold uppercase tracking-wider text-purple-700">
                                    Sistem Informasi
                                </span>
                            </div>
                        )}
                    </Link>

                    <button
                        type="button"
                        onClick={handleToggleCollapse}
                        className={cn(
                            "hidden lg:flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-600/30 cursor-pointer",
                            isCollapsed
                                ? "absolute -right-3 top-5 z-20 h-6 w-6 rounded-full border border-gray-200 bg-white text-gray-500 shadow-xs hover:border-purple-300 hover:bg-purple-50 hover:text-purple-700 hover:scale-110 active:scale-95"
                                : "h-7 w-7 rounded-lg text-gray-400 hover:bg-purple-50 hover:text-purple-700",
                        )}
                        aria-label={
                            isCollapsed
                                ? "Perbesar sidebar (Maximize)"
                                : "Perkecil sidebar (Minimize)"
                        }
                        title={
                            isCollapsed
                                ? "Perbesar sidebar (Maximize)"
                                : "Perkecil sidebar (Minimize)"
                        }
                    >
                        <svg
                            className={cn(
                                "h-3.5 w-3.5 transition-transform duration-300",
                                isCollapsed && "rotate-180",
                            )}
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                        >
                            <path d="m15 18-6-6 6-6" />
                        </svg>
                    </button>

                    <button
                        type="button"
                        onClick={onClose}
                        className="lg:hidden h-7 w-7 inline-flex items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 focus:outline-none"
                        aria-label="Tutup menu sidebar"
                    >
                        <svg
                            className="h-4.5 w-4.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2"
                            aria-hidden="true"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M6 18 18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>

                <nav className="flex-1 space-y-2 overflow-y-auto px-2 py-1.5 scrollbar-none">
                    {menuGroups.map((group, index) => (
                        <div key={group.group} className="space-y-0.5">
                            {!isCollapsed ? (
                                <h4 className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-gray-400">
                                    {group.group}
                                </h4>
                            ) : (
                                index > 0 && (
                                    <div className="mx-auto my-1.5 h-px w-6 bg-gray-100" />
                                )
                            )}

                            <div className="space-y-0.5">
                                {group.items.map((item) => {
                                    const active = isLinkActive(item.href);
                                    return (
                                        <div
                                            key={item.href}
                                            className="relative group"
                                        >
                                            <Link
                                                href={item.href}
                                                onClick={onClose}
                                                aria-current={
                                                    active ? "page" : undefined
                                                }
                                                className={cn(
                                                    "flex min-h-[34px] items-center rounded-lg py-1 px-2 text-xs font-medium transition-all duration-150",
                                                    isCollapsed
                                                        ? "justify-center px-0 w-full"
                                                        : "justify-between",
                                                    active
                                                        ? "bg-purple-700 font-semibold text-white shadow-xs shadow-purple-600/25"
                                                        : "text-gray-600 hover:bg-purple-50 hover:text-purple-700",
                                                )}
                                            >
                                                <span
                                                    className={cn(
                                                        "flex min-w-0 items-center",
                                                        isCollapsed
                                                            ? "justify-center"
                                                            : "gap-2.5",
                                                    )}
                                                >
                                                    <MenuIcon
                                                        name={item.icon}
                                                        className={cn(
                                                            "h-4 w-4 shrink-0",
                                                            active
                                                                ? "text-white"
                                                                : "text-gray-400 group-hover:text-purple-700",
                                                        )}
                                                    />
                                                    {!isCollapsed && (
                                                        <span className="truncate">
                                                            {item.label}
                                                        </span>
                                                    )}
                                                </span>

                                                {!isCollapsed && item.badge && (
                                                    <span
                                                        className={cn(
                                                            "ml-1.5 shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold flex items-center gap-1",
                                                            active
                                                                ? "bg-purple-800 text-purple-100"
                                                                : item.badge ===
                                                                    "Live"
                                                                  ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                                                  : item.badge ===
                                                                      "Prioritas"
                                                                    ? "bg-rose-100 text-rose-800 border border-rose-200"
                                                                    : "bg-purple-100 text-purple-700 border border-purple-200",
                                                        )}
                                                    >
                                                        {(item.badge ===
                                                            "Live" ||
                                                            item.badge ===
                                                                "Prioritas") && (
                                                            <span className="w-1 h-1 rounded-full bg-current animate-ping" />
                                                        )}
                                                        <span>
                                                            {item.badge}
                                                        </span>
                                                    </span>
                                                )}

                                                {isCollapsed && item.badge && (
                                                    <span
                                                        className={cn(
                                                            "absolute right-2 top-2 h-1.5 w-1.5 rounded-full ring-2 ring-white",
                                                            item.badge ===
                                                                "Live"
                                                                ? "bg-emerald-500 animate-pulse"
                                                                : item.badge ===
                                                                    "Prioritas"
                                                                  ? "bg-rose-500 animate-pulse"
                                                                  : "bg-purple-500",
                                                        )}
                                                    />
                                                )}
                                            </Link>

                                            {isCollapsed && (
                                                <div className="absolute left-full ml-2.5 top-1/2 -translate-y-1/2 hidden lg:group-hover:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-900 text-white text-xs font-semibold whitespace-nowrap shadow-xl z-50 pointer-events-none animate-fadeIn">
                                                    <span>{item.label}</span>
                                                    {item.badge && (
                                                        <span className="ml-1 px-1 py-0.5 rounded text-[9px] font-bold bg-purple-600 text-white">
                                                            {item.badge}
                                                        </span>
                                                    )}
                                                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </nav>

                <div
                    className={cn(
                        "shrink-0 border-t border-gray-100 bg-gray-50/60 transition-all",
                        isCollapsed ? "p-1.5" : "p-2",
                    )}
                >
                    <div className="relative group">
                        <div
                            className={cn(
                                "rounded-lg border border-gray-100 bg-white shadow-2xs transition-all",
                                isCollapsed
                                    ? "flex justify-center p-1.5"
                                    : "flex items-center gap-2 p-1.5",
                            )}
                        >
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-purple-100 text-purple-700 font-bold text-xs select-none">
                                ©
                            </div>
                            {!isCollapsed && (
                                <div className="flex min-w-0 flex-col">
                                    <span className="text-[10px] font-bold text-gray-800 leading-tight">
                                        Copyright 2026
                                    </span>
                                    <span className="truncate text-[9px] text-gray-400 leading-tight">
                                        Puskeswan Integrated
                                    </span>
                                </div>
                            )}
                        </div>

                        {isCollapsed && (
                            <div className="absolute left-full ml-2.5 top-1/2 -translate-y-1/2 hidden lg:group-hover:flex flex-col px-2.5 py-1 rounded-lg bg-gray-900 text-white text-xs whitespace-nowrap shadow-xl z-50 pointer-events-none animate-fadeIn">
                                <span className="font-bold">
                                    Copyright 2026
                                </span>
                                <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
                            </div>
                        )}
                    </div>
                </div>
            </aside>
        </>
    );
}
