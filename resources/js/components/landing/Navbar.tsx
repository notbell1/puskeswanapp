import React from "react";
import { Link } from "@inertiajs/react";
import { NAV_ITEMS } from "./data";

interface NavbarProps {
    activeSection: string;
    onNavigate: (
        path: string,
        sectionId: string,
        event?: React.MouseEvent,
    ) => void;
    user?: any;
    isScrolled: boolean;
    mobileMenuOpen: boolean;
    setMobileMenuOpen: (open: boolean) => void;
}

export default function Navbar({
    activeSection,
    onNavigate,
    user,
    isScrolled,
    mobileMenuOpen,
    setMobileMenuOpen,
}: NavbarProps) {
    const getDashboardUrl = () => {
        if (!user) return "/login";
        const role = (user.role?.nama_role || user.role || "")
            .toString()
            .toUpperCase();
        if (role === "SUPER_ADMIN") return "/super/dashboard";
        if (role === "ADMIN") return "/admin/dashboard";
        if (role === "DOKTER") return "/dokter/dashboard";
        return "/dashboard";
    };

    return (
        <header
            className={`sticky top-0 z-40 bg-white/95 backdrop-blur-md transition-all duration-300 border-b ${
                isScrolled
                    ? "shadow-sm border-gray-200/80 py-2"
                    : "border-gray-100 py-3"
            }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-14">
                    <a
                        href="/"
                        onClick={(e) => onNavigate("/", "hero", e)}
                        className="flex items-center gap-2.5 group focus:outline-none focus:ring-0 [-webkit-tap-highlight-color:transparent]"
                    >
                        <img
                            src="/images/logo_puskeswan.png"
                            alt="Logo Puskeswan"
                            /* Tambahan bg-white dan p-0.5 jika logo butuh dasar putih agar tidak terlihat terlalu tembus pandang */
                            className="h-9 sm:h-10 w-auto object-contain transition-transform duration-200 group-hover:scale-105 bg-white rounded-lg"
                        />
                        <div className="flex items-baseline">
                            <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-gray-900 group-hover:text-purple-700 transition-colors">
                                Puskeswan
                            </span>
                            <span className="text-xl sm:text-2xl font-bold tracking-tight text-purple-700 group-hover:text-gray-900 transition-colors">
                                App
                            </span>
                        </div>
                    </a>

                    <nav className="hidden lg:flex items-center gap-3">
                        {NAV_ITEMS.map((item) => {
                            const isActive = activeSection === item.path;
                            return (
                                <a
                                    key={item.path}
                                    href={item.path}
                                    onClick={(e) =>
                                        onNavigate(item.path, item.id, e)
                                    }
                                    className={`px-3 py-2 text-sm transition-all duration-300 ease-out focus:outline-none focus:ring-0 [-webkit-tap-highlight-color:transparent] ${
                                        isActive
                                            ? "text-purple-700 font-bold underline decoration-2 underline-offset-[6px] decoration-purple-700"
                                            : "text-gray-500 font-medium hover:text-purple-700"
                                    }`}
                                >
                                    {item.label}
                                </a>
                            );
                        })}
                    </nav>

                    <div className="hidden lg:flex items-center gap-3">
                        {user ? (
                            <Link
                                href={getDashboardUrl()}
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-purple-700 text-white hover:bg-purple-600 active:bg-purple-800 shadow-sm shadow-purple-600/30 transition-all duration-150 active:scale-95 focus:outline-none focus:ring-0 [-webkit-tap-highlight-color:transparent]"
                            >
                                <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                                    />
                                </svg>
                                <span>Dashboard</span>
                            </Link>
                        ) : (
                            <Link
                                href="/login"
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-purple-700 text-white hover:bg-purple-600 active:bg-purple-800 shadow-sm shadow-purple-600/30 transition-all duration-150 active:scale-95 focus:outline-none focus:ring-0 [-webkit-tap-highlight-color:transparent]"
                            >
                                <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                                    />
                                </svg>
                                <span>Login</span>
                            </Link>
                        )}
                    </div>

                    <div className="flex lg:hidden items-center">
                        <button
                            type="button"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="p-2 rounded-xl text-gray-600 hover:text-purple-700 focus:outline-none focus:ring-0 [-webkit-tap-highlight-color:transparent] transition-colors"
                            aria-label="Buka menu navigasi"
                        >
                            {mobileMenuOpen ? (
                                <svg
                                    className="w-6 h-6"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            ) : (
                                <svg
                                    className="w-6 h-6"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {mobileMenuOpen && (
                <div className="lg:hidden border-b border-gray-100 bg-white px-4 pt-3 pb-6 shadow-xl animate-fadeIn">
                    <nav className="space-y-1">
                        {NAV_ITEMS.map((item) => {
                            const isActive = activeSection === item.path;
                            return (
                                <a
                                    key={item.path}
                                    href={item.path}
                                    onClick={(e) =>
                                        onNavigate(item.path, item.id, e)
                                    }
                                    className={`block px-4 py-3 text-sm transition-all duration-300 ease-out focus:outline-none focus:ring-0 [-webkit-tap-highlight-color:transparent] ${
                                        isActive
                                            ? "text-purple-700 font-bold underline decoration-2 underline-offset-[6px] decoration-purple-700"
                                            : "text-gray-600 font-medium hover:text-purple-700"
                                    }`}
                                >
                                    {item.label}
                                </a>
                            );
                        })}
                    </nav>

                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <Link
                            href={getDashboardUrl()}
                            className="flex w-full items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold bg-purple-700 text-white hover:bg-purple-600 active:bg-purple-800 shadow-sm shadow-purple-600/30 transition-all duration-150 active:scale-95 focus:outline-none focus:ring-0 [-webkit-tap-highlight-color:transparent]"
                        >
                            {user ? (
                                <>
                                    <svg
                                        className="w-4 h-4"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                                        />
                                    </svg>
                                    <span>Buka Dashboard</span>
                                </>
                            ) : (
                                <>
                                    <svg
                                        className="w-4 h-4"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                                        />
                                    </svg>
                                    <span>Masuk ke Akun</span>
                                </>
                            )}
                        </Link>
                    </div>
                </div>
            )}
        </header>
    );
}
