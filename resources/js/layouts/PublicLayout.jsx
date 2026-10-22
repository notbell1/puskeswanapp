import React, { useState } from "react";
import { Link, usePage } from "@inertiajs/react";
import { cn } from "@/lib/utils";

export default function PublicLayout({ children, title = "" }) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const { url, props } = usePage();
    const user = props?.auth?.user;

    const navLinks = [
        { label: "Beranda", href: "/" },
        { label: "Tentang", href: "/tentang" },
        { label: "Cek Rekam Medis", href: "/cek-rekam-medis" },
        { label: "Berita", href: "/berita" },
        { label: "Staff", href: "/staff" },
        { label: "Kontak", href: "/kontak" },
    ];

    const isActive = (href) => {
        const currentPath = url.split("?")[0].replace(/\/+$/, "") || "/";

        const targetPath = href.replace(/\/+$/, "") || "/";

        if (targetPath === "/") {
            return currentPath === "/";
        }

        return (
            currentPath === targetPath ||
            currentPath.startsWith(`${targetPath}/`)
        );
    };

    const getDashboardUrl = (currentUser) => {
        if (!currentUser) {
            return "/login";
        }

        const role = String(
            currentUser.role?.name ??
                currentUser.role ??
                currentUser.user_role ??
                "",
        )
            .toLowerCase()
            .replace(/[\s-]+/g, "_");

        if (
            ["super_admin", "superadmin", "super_administrator"].includes(role)
        ) {
            return "/super-admin/dashboard";
        }

        if (["admin", "administrator"].includes(role)) {
            return "/admin/dashboard";
        }

        if (["dokter", "doctor", "veterinarian"].includes(role)) {
            return "/dokter/dashboard";
        }

        return "/dashboard";
    };

    const dashboardUrl = getDashboardUrl(user);

    const closeMobileMenu = () => {
        setMobileMenuOpen(false);
    };

    return (
        <div className="min-h-screen bg-white text-gray-900">
            <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur-xl">
                <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
                    <Link
                        href="/"
                        onClick={closeMobileMenu}
                        aria-label="Beranda"
                        className="flex shrink-0 items-center gap-3"
                    >
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-sm">
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                className="h-6 w-6"
                                aria-hidden="true"
                            >
                                <path
                                    d="M12 21s8-4 8-11V5l-8-3-8 3v5c0 7 8 11 8 11Z"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                                <path
                                    d="M12 8v8M8 12h8"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </div>

                        <div>
                            <div className="text-base font-extrabold tracking-tight text-gray-900 sm:text-lg">
                                Puskeswan
                            </div>
                            <div className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400 sm:text-[11px]">
                                Pelayanan Kesehatan Hewan
                            </div>
                        </div>
                    </Link>

                    <nav
                        aria-label="Navigasi utama"
                        className="hidden items-center gap-1.5 lg:flex"
                    >
                        {navLinks.map((link) => {
                            const active = isActive(link.href);

                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    aria-current={active ? "page" : undefined}
                                    className={cn(
                                        "px-3.5 py-2 rounded-xl text-sm font-medium transition-colors duration-150",
                                        active
                                            ? "text-purple-700 bg-purple-50"
                                            : "text-gray-600 hover:text-purple-700 hover:bg-gray-50",
                                    )}
                                >
                                    {link.label}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="hidden shrink-0 items-center lg:flex">
                        {user ? (
                            <Link
                                href={dashboardUrl}
                                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:from-purple-700 hover:to-indigo-700"
                            >
                                Dashboard
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    className="h-4 w-4"
                                    aria-hidden="true"
                                >
                                    <path
                                        d="M5 12h14m-6-6 6 6-6 6"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </Link>
                        ) : (
                            <Link
                                href="/login"
                                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:from-purple-700 hover:to-indigo-700"
                            >
                                Masuk
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    className="h-4 w-4"
                                    aria-hidden="true"
                                >
                                    <path
                                        d="M5 12h14m-6-6 6 6-6 6"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </Link>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            setMobileMenuOpen((previous) => !previous)
                        }
                        aria-label={
                            mobileMenuOpen
                                ? "Tutup menu navigasi"
                                : "Buka menu navigasi"
                        }
                        aria-expanded={mobileMenuOpen}
                        aria-controls="public-mobile-navigation"
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 text-gray-700 transition-colors hover:border-purple-200 hover:bg-purple-50 hover:text-purple-700 lg:hidden"
                    >
                        {mobileMenuOpen ? (
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                className="h-5 w-5"
                                aria-hidden="true"
                            >
                                <path
                                    d="m18 6-12 12M6 6l12 12"
                                    strokeLinecap="round"
                                />
                            </svg>
                        ) : (
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                className="h-5 w-5"
                                aria-hidden="true"
                            >
                                <path
                                    d="M4 7h16M4 12h16M4 17h16"
                                    strokeLinecap="round"
                                />
                            </svg>
                        )}
                    </button>
                </div>

                <div
                    id="public-mobile-navigation"
                    className={cn(
                        "grid lg:hidden transition-[grid-template-rows,opacity] duration-200 ease-out",
                        mobileMenuOpen
                            ? "grid-rows-[1fr] opacity-100"
                            : "pointer-events-none grid-rows-[0fr] opacity-0",
                    )}
                    aria-hidden={!mobileMenuOpen}
                >
                    <div className="overflow-hidden">
                        <div className="border-t border-gray-100 bg-white px-4 pb-5 pt-3 sm:px-6">
                            <nav
                                aria-label="Navigasi mobile"
                                className="space-y-1.5"
                            >
                                {navLinks.map((link) => {
                                    const active = isActive(link.href);

                                    return (
                                        <Link
                                            key={link.href}
                                            href={link.href}
                                            onClick={closeMobileMenu}
                                            aria-current={
                                                active ? "page" : undefined
                                            }
                                            tabIndex={mobileMenuOpen ? 0 : -1}
                                            className={cn(
                                                "block px-4 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150",
                                                active
                                                    ? "text-purple-700 bg-purple-50"
                                                    : "text-gray-700 hover:bg-gray-50 hover:text-purple-700",
                                            )}
                                        >
                                            {link.label}
                                        </Link>
                                    );
                                })}
                            </nav>

                            <div className="mt-4 border-t border-gray-100 pt-4">
                                {user ? (
                                    <Link
                                        href={dashboardUrl}
                                        onClick={closeMobileMenu}
                                        tabIndex={mobileMenuOpen ? 0 : -1}
                                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:from-purple-700 hover:to-indigo-700"
                                    >
                                        Buka Dashboard
                                        <svg
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            className="h-4 w-4"
                                            aria-hidden="true"
                                        >
                                            <path
                                                d="M5 12h14m-6-6 6 6-6 6"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                    </Link>
                                ) : (
                                    <Link
                                        href="/login"
                                        onClick={closeMobileMenu}
                                        tabIndex={mobileMenuOpen ? 0 : -1}
                                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:from-purple-700 hover:to-indigo-700"
                                    >
                                        Masuk ke Akun
                                        <svg
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            className="h-4 w-4"
                                            aria-hidden="true"
                                        >
                                            <path
                                                d="M5 12h14m-6-6 6 6-6 6"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {title && (
                <div className="sr-only">
                    <h1>{title}</h1>
                </div>
            )}

            <main className="min-h-[60vh]">{children}</main>

            <footer className="border-t border-gray-100 bg-gray-50/70">
                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
                    <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                        <Link
                            href="/"
                            className="flex items-center gap-3 self-start"
                        >
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white">
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    className="h-5 w-5"
                                    aria-hidden="true"
                                >
                                    <path
                                        d="M12 21s8-4 8-11V5l-8-3-8 3v5c0 7 8 11 8 11Z"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                    <path
                                        d="M12 8v8M8 12h8"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </div>

                            <div>
                                <p className="text-sm font-bold text-gray-900">
                                    Puskeswan
                                </p>
                                <p className="mt-0.5 text-xs text-gray-500">
                                    Pelayanan Kesehatan Hewan
                                </p>
                            </div>
                        </Link>

                        <nav
                            aria-label="Navigasi footer"
                            className="flex flex-wrap gap-x-5 gap-y-3"
                        >
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    aria-current={
                                        isActive(link.href) ? "page" : undefined
                                    }
                                    className={cn(
                                        "text-xs font-medium transition-colors duration-150",
                                        isActive(link.href)
                                            ? "text-purple-700"
                                            : "text-gray-500 hover:text-purple-700",
                                    )}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    <div className="mt-7 border-t border-gray-200 pt-5">
                        <p className="text-center text-xs leading-relaxed text-gray-500 sm:text-left">
                            © {new Date().getFullYear()} Puskeswan. Seluruh hak
                            cipta dilindungi.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
