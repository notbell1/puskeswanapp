import React, { useMemo, useState } from "react";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { ToastProvider } from "@/components/ui";
import { Navbar, Footer } from "@/components/landing";

interface ArchiveArticle {
    id: string | number;
    judul: string;
    slug: string;
    author_name: string;
    author_slug: string;
    author_foto?: string | null;
    author_jabatan?: string;
    category: string;
    category_slug: string;
    ringkasan: string;
    isi_berita: string;
    gambar?: string | null;
    date: string;
    readTime: string;
}

interface AuthorProfile {
    name: string;
    slug: string;
    foto?: string | null;
    jabatan?: string;
    nip?: string | null;
}

interface CategoryOption {
    name: string;
    slug: string;
}

interface BeritaArchiveProps {
    filterType: "author" | "category";
    filterTitle: string;
    filterSlug: string;
    authorProfile?: AuthorProfile | null;
    articles: ArchiveArticle[];
    categories: CategoryOption[];
}

const ITEMS_PER_PAGE = 5;

function getInitials(name: string): string {
    const clean = (name || "PK")
        .replace(/^(drh\.|dr\.|bpk\.|ibu)\s*/i, "")
        .replace(/,\s*[A-Za-z\.]+/g, "")
        .trim();
    const parts = clean.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return (clean.slice(0, 2) || "PK").toUpperCase();
}

interface CategoryTheme {
    text: string;
    badge: string;
    hoverBadge: string;
    gradient: string;
}

const CATEGORY_THEMES: CategoryTheme[] = [
    {
        text: "text-purple-700",
        badge: "bg-purple-50 text-purple-700 border-purple-200",
        hoverBadge: "hover:bg-purple-600 hover:text-white hover:border-purple-600",
        gradient: "from-purple-900 via-purple-700 to-indigo-600",
    },
    {
        text: "text-rose-700",
        badge: "bg-rose-50 text-rose-700 border-rose-200",
        hoverBadge: "hover:bg-rose-600 hover:text-white hover:border-rose-600",
        gradient: "from-rose-900 via-rose-700 to-pink-600",
    },
    {
        text: "text-blue-700",
        badge: "bg-blue-50 text-blue-700 border-blue-200",
        hoverBadge: "hover:bg-blue-600 hover:text-white hover:border-blue-600",
        gradient: "from-blue-900 via-blue-700 to-cyan-600",
    },
    {
        text: "text-emerald-700",
        badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
        hoverBadge: "hover:bg-emerald-600 hover:text-white hover:border-emerald-600",
        gradient: "from-emerald-900 via-emerald-700 to-teal-600",
    },
    {
        text: "text-amber-700",
        badge: "bg-amber-50 text-amber-700 border-amber-200",
        hoverBadge: "hover:bg-amber-600 hover:text-white hover:border-amber-600",
        gradient: "from-amber-900 via-amber-700 to-orange-600",
    },
    {
        text: "text-indigo-700",
        badge: "bg-indigo-50 text-indigo-700 border-indigo-200",
        hoverBadge: "hover:bg-indigo-600 hover:text-white hover:border-indigo-600",
        gradient: "from-indigo-900 via-indigo-700 to-violet-600",
    },
];

function getPaginationItems(currentPage: number, totalPages: number): (number | "ellipsis")[] {
    if (totalPages <= 6) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 3) {
        return [1, 2, 3, 4, "ellipsis", totalPages];
    }
    if (currentPage >= totalPages - 2) {
        return [1, "ellipsis", totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, "ellipsis", currentPage - 1, currentPage, currentPage + 1, "ellipsis", totalPages];
}

function getCategoryTheme(categoryName: string): CategoryTheme {
    const normalized = (categoryName || "").toLowerCase();
    if (normalized.includes("vaksin") || normalized.includes("imunisasi")) {
        return CATEGORY_THEMES[0];
    }
    if (normalized.includes("zoonosis") || normalized.includes("rabies")) {
        return CATEGORY_THEMES[1];
    }
    if (normalized.includes("inseminasi") || normalized.includes("ib")) {
        return CATEGORY_THEMES[2];
    }
    if (normalized.includes("ternak") || normalized.includes("pakan")) {
        return CATEGORY_THEMES[3];
    }

    let hash = 0;
    for (let i = 0; i < normalized.length; i++) {
        hash = normalized.charCodeAt(i) + ((hash << 5) - hash);
    }
    return CATEGORY_THEMES[Math.abs(hash) % CATEGORY_THEMES.length];
}

function BeritaArchiveContent({
    filterType,
    filterTitle,
    filterSlug,
    authorProfile,
    articles = [],
    categories = [],
}: BeritaArchiveProps) {
    const page = usePage();
    const user = (page?.props as any)?.auth?.user;
    const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

    const [currentPage, setCurrentPage] = useState<number>(1);
    const totalPages = Math.max(1, Math.ceil(articles.length / ITEMS_PER_PAGE));
    const safePage = Math.min(currentPage, totalPages);

    const paginatedArticles = useMemo(() => {
        const start = (safePage - 1) * ITEMS_PER_PAGE;
        return articles.slice(start, start + ITEMS_PER_PAGE);
    }, [articles, safePage]);

    const paginationItems = useMemo(
        () => getPaginationItems(safePage, totalPages),
        [safePage, totalPages]
    );

    const handleNavigate = (
        path: string,
        _sectionId: string,
        event?: React.MouseEvent,
    ) => {
        if (event) {
            event.preventDefault();
        }
        setMobileMenuOpen(false);
        router.visit(path);
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50/50 text-gray-900 font-sans selection:bg-purple-100 selection:text-purple-900">
            <Navbar
                activeSection="/berita"
                onNavigate={handleNavigate}
                user={user}
                isScrolled={true}
                mobileMenuOpen={mobileMenuOpen}
                setMobileMenuOpen={setMobileMenuOpen}
            />

            <main className="flex-1 py-3.5 sm:py-4 flex items-center min-h-[calc(100vh-4rem)]">
                <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
                    <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs px-4 py-2.5 sm:px-5 sm:py-3">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                                {filterType === "author" ? (
                                    <div className="shrink-0">
                                        {authorProfile?.foto ? (
                                            <img
                                                src={authorProfile.foto}
                                                alt={authorProfile.name}
                                                className="w-10 h-10 sm:w-11 sm:h-11 aspect-square rounded-xl object-cover object-top bg-purple-50 border border-purple-200 shadow-2xs"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 sm:w-11 sm:h-11 aspect-square rounded-xl bg-purple-700 text-white font-extrabold text-sm sm:text-base flex items-center justify-center shadow-2xs">
                                                {getInitials(filterTitle)}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="w-10 h-10 sm:w-11 sm:h-11 aspect-square rounded-xl bg-purple-50 border border-purple-200 text-purple-700 flex items-center justify-center shrink-0 shadow-2xs">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                                            />
                                        </svg>
                                    </div>
                                )}

                                <div className="min-w-0 flex-1 space-y-0.5">
                                    <div className="flex flex-wrap items-center gap-1.5">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[9.5px] font-bold uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200/70">
                                            {filterType === "author"
                                                ? "Arsip Penulis / Tenaga Medis"
                                                : "Kategori Berita & Edukasi"}
                                        </span>
                                        {filterType === "author" && (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[9.5px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                ✓ Terverifikasi
                                            </span>
                                        )}
                                    </div>

                                    <h1 className="text-sm sm:text-base lg:text-lg font-extrabold text-gray-900 tracking-tight truncate">
                                        {filterTitle}
                                    </h1>

                                    {filterType === "author" ? (
                                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-gray-500">
                                            {authorProfile?.jabatan && (
                                                <span className="font-semibold text-purple-700">
                                                    {authorProfile.jabatan}
                                                </span>
                                            )}
                                            {authorProfile?.nip && (
                                                <>
                                                    <span className="text-gray-300">&bull;</span>
                                                    <span className="font-mono text-[10.5px] text-gray-500">
                                                        {authorProfile.nip}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-[11px] text-gray-500 truncate">
                                            Daftar publikasi &amp; informasi edukasi veteriner pada kategori{" "}
                                            <strong className="text-gray-700">{filterTitle}</strong>.
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center justify-between md:justify-end gap-2 border-t md:border-t-0 pt-2 md:pt-0 border-gray-100 shrink-0">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-purple-50/80 text-purple-800 text-[10.5px] font-bold border border-purple-200/60">
                                    <span>
                                        {filterType === "author" ? "📚" : "📂"} {articles.length}{" "}
                                        {filterType === "author" ? "Berita Dipublikasikan" : "Artikel Tersedia"}
                                    </span>
                                </span>
                                <a
                                    href="/berita"
                                    onClick={(e) => handleNavigate("/berita", "berita", e)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl border border-gray-200 bg-gray-50/70 hover:bg-purple-50 hover:border-purple-200 text-[10.5px] font-bold text-gray-600 hover:text-purple-700 transition-colors"
                                >
                                    <span>&larr; Kembali ke Semua Berita</span>
                                </a>
                            </div>
                        </div>

                        {categories.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-gray-100 flex items-center flex-wrap gap-1">
                                <span className="text-[10.5px] font-bold text-gray-400 mr-1">
                                    Kategori:
                                </span>
                                {categories.map((cat) => {
                                    const isCurrent = filterType === "category" && cat.slug === filterSlug;
                                    const catTheme = getCategoryTheme(cat.name);
                                    return (
                                        <Link
                                            key={cat.slug}
                                            href={`/berita/ketegori/${cat.slug}`}
                                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition-all ${
                                                isCurrent
                                                    ? "bg-purple-700 text-white border-purple-700 shadow-2xs"
                                                    : `${catTheme.badge} ${catTheme.hoverBadge}`
                                            }`}
                                        >
                                            {cat.name}
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {paginatedArticles.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                                {paginatedArticles.map((item) => {
                                    const theme = getCategoryTheme(item.category);
                                    return (
                                        <article
                                            key={item.id}
                                            className="rounded-2xl bg-white border border-gray-200/80 overflow-hidden shadow-xs hover:shadow-md hover:border-purple-200 transition-all duration-200 flex flex-col group"
                                        >
                                            <Link
                                                href={`/berita/${item.slug}`}
                                                className={`w-full aspect-16/10 bg-gradient-to-tr ${theme.gradient} relative overflow-hidden block shrink-0`}
                                            >
                                                {item.gambar ? (
                                                    <img
                                                        src={item.gambar}
                                                        alt={item.judul}
                                                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center relative">
                                                        <svg
                                                            className="w-14 h-14 text-white/15 pointer-events-none"
                                                            fill="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-4H7v-2h4V7h2v4h4v2h-4v4z" />
                                                        </svg>
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-80 pointer-events-none" />
                                                <div className="absolute bottom-1.5 left-2.5 right-2.5 flex items-center justify-between text-[9.5px] font-semibold text-white/95 z-10 pointer-events-none">
                                                    <span>📅 {item.date}</span>
                                                    <span>{item.readTime}</span>
                                                </div>
                                            </Link>

                                            <div className="p-2.5 sm:p-3 flex-1 flex flex-col justify-between gap-1.5">
                                                <div className="space-y-0.5">
                                                    <div>
                                                        <Link
                                                            href={`/berita/ketegori/${item.category_slug}`}
                                                            className={`block text-[10.5px] font-bold ${theme.text} hover:underline line-clamp-1`}
                                                        >
                                                            {item.category}
                                                        </Link>
                                                    </div>

                                                    <Link href={`/berita/${item.slug}`} className="block">
                                                        <h2 className="text-xs font-extrabold text-gray-900 group-hover:text-purple-700 transition-colors line-clamp-2 leading-snug">
                                                            {item.judul}
                                                        </h2>
                                                    </Link>

                                                    <p className="text-[10px] text-gray-500 line-clamp-2 leading-snug pt-0.5">
                                                        {item.ringkasan}
                                                    </p>
                                                </div>

                                                <div className="pt-1.5 border-t border-gray-100 space-y-1">
                                                    <Link
                                                        href={`/berita/author/${item.author_slug}`}
                                                        className="flex items-center gap-2 group/author min-w-0"
                                                    >
                                                        {item.author_foto ? (
                                                            <img
                                                                src={item.author_foto}
                                                                alt={item.author_name}
                                                                className="w-6 h-6 aspect-square rounded-md object-cover object-top bg-purple-50 border border-purple-200 shrink-0 shadow-2xs"
                                                            />
                                                        ) : (
                                                            <div className="w-6 h-6 aspect-square rounded-md bg-purple-700 text-white font-bold text-[9.5px] flex items-center justify-center shrink-0 shadow-2xs">
                                                                {getInitials(item.author_name)}
                                                            </div>
                                                        )}
                                                        <div className="min-w-0 flex-1 leading-tight">
                                                            <span className="block text-[8px] font-semibold uppercase tracking-wider text-gray-400">
                                                                Author / Penulis
                                                            </span>
                                                            <span className="block font-bold text-gray-700 group-hover/author:text-purple-700 group-hover/author:underline truncate text-[10px]">
                                                                {item.author_name}
                                                            </span>
                                                        </div>
                                                    </Link>

                                                    <div className="flex justify-end">
                                                        <Link
                                                            href={`/berita/${item.slug}`}
                                                            className="font-bold text-purple-700 hover:underline inline-flex items-center gap-1 text-[10px]"
                                                        >
                                                            <span>Baca Selengkapnya</span>
                                                            <span>&rarr;</span>
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>

                            {articles.length > 0 && (
                                <div className="mt-3 flex flex-col sm:flex-row items-center justify-between gap-2 pt-2.5 border-t border-gray-200/70">
                                    <p className="text-xs text-gray-500 font-medium">
                                        Halaman <span className="font-bold text-gray-900">{safePage}</span> dari{" "}
                                        <span className="font-bold text-gray-900">{totalPages}</span>
                                    </p>

                                    <div
                                        className="inline-flex items-center gap-1 bg-white p-1 rounded-2xl border border-gray-200/90 shadow-xs"
                                        role="tablist"
                                    >
                                        <button
                                            type="button"
                                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                            disabled={safePage === 1}
                                            aria-label="Halaman Sebelumnya"
                                            className="h-7.5 min-w-[30px] px-2.5 rounded-xl text-xs font-extrabold text-gray-600 hover:bg-purple-50 hover:text-purple-700 disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer"
                                        >
                                            &lt;
                                        </button>

                                        {paginationItems.map((item, idx) => {
                                            if (item === "ellipsis") {
                                                return (
                                                    <span
                                                        key={`ellipsis-${idx}`}
                                                        className="h-7.5 min-w-[24px] px-1 flex items-center justify-center text-xs font-bold text-gray-400 select-none"
                                                    >
                                                        ...
                                                    </span>
                                                );
                                            }
                                            const isActive = item === safePage;
                                            return (
                                                <button
                                                    key={item}
                                                    type="button"
                                                    role="tab"
                                                    aria-selected={isActive}
                                                    onClick={() => setCurrentPage(item)}
                                                    className={`h-7.5 min-w-[30px] px-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                                                        isActive
                                                            ? "bg-purple-700 text-white shadow-xs shadow-purple-700/25"
                                                            : "text-gray-600 hover:bg-purple-50 hover:text-purple-700"
                                                    }`}
                                                >
                                                    {item}
                                                </button>
                                            );
                                        })}

                                        <button
                                            type="button"
                                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                            disabled={safePage === totalPages}
                                            aria-label="Halaman Berikutnya"
                                            className="h-7.5 min-w-[30px] px-2.5 rounded-xl text-xs font-extrabold text-gray-600 hover:bg-purple-50 hover:text-purple-700 disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer"
                                        >
                                            &gt;
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="bg-white rounded-3xl border border-gray-200/80 p-10 text-center space-y-3">
                            <p className="text-sm font-bold text-gray-700">
                                Belum ada berita yang dipublikasikan untuk kriteria ini.
                            </p>
                            <a
                                href="/berita"
                                onClick={(e) => handleNavigate("/berita", "berita", e)}
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-purple-700 text-white hover:bg-purple-600 transition-colors"
                            >
                                <span>&larr; Kembali ke Beranda Berita</span>
                            </a>
                        </div>
                    )}
                </div>
            </main>

            <Footer onNavigate={handleNavigate} user={user} />
        </div>
    );
}

export default function BeritaArchive(props: BeritaArchiveProps) {
    const pageTitle =
        props.filterType === "author"
            ? `Author: ${props.filterTitle}`
            : `Kategori: ${props.filterTitle}`;

    return (
        <ToastProvider>
            <Head title={pageTitle} />
            <BeritaArchiveContent {...props} />
        </ToastProvider>
    );
}
