import React, { useMemo, useState } from "react";
import { NewsItem } from "./types";

interface NewsSectionProps {
    onSelectNews?: (item: NewsItem) => void;
    articles?: any[];
}

const ITEMS_PER_PAGE = 5;

const slugify = (text: string): string =>
    text
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");

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
    gradient: string;
}

const CATEGORY_THEMES: CategoryTheme[] = [
    {
        text: "text-purple-700",
        gradient: "from-purple-900 via-purple-700 to-indigo-600",
    },
    {
        text: "text-rose-700",
        gradient: "from-rose-900 via-rose-700 to-pink-600",
    },
    {
        text: "text-blue-700",
        gradient: "from-blue-900 via-blue-700 to-cyan-600",
    },
    {
        text: "text-emerald-700",
        gradient: "from-emerald-900 via-emerald-700 to-teal-600",
    },
    {
        text: "text-amber-700",
        gradient: "from-amber-900 via-amber-700 to-orange-600",
    },
    {
        text: "text-indigo-700",
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

export default function NewsSection({ articles }: NewsSectionProps) {
    const displayNews: NewsItem[] = useMemo(() => {
        if (!Array.isArray(articles) || articles.length === 0) {
            return [];
        }

        return articles.map((a: any) => ({
            id: a.id,
            title: a.judul,
            slug: slugify(a.judul) || a.slug,
            category: a.category || "Edukasi",
            categorySlug: a.category_slug || slugify(a.category || "edukasi"),
            date: a.date || "Terbaru",
            readTime: a.readTime || "3 mnt baca",
            excerpt: a.ringkasan,
            content: a.isi_berita,
            author: a.author_name || "Tim Puskeswan",
            authorSlug: a.author_slug || slugify(a.author_name || "tim-puskeswan"),
            authorFoto: a.author_foto || null,
            gambar: a.gambar || null,
        }));
    }, [articles]);

    const [currentPage, setCurrentPage] = useState<number>(1);
    const totalPages = Math.max(1, Math.ceil(displayNews.length / ITEMS_PER_PAGE));
    const safePage = Math.min(currentPage, totalPages);

    const paginatedNews = useMemo(() => {
        const start = (safePage - 1) * ITEMS_PER_PAGE;
        return displayNews.slice(start, start + ITEMS_PER_PAGE);
    }, [displayNews, safePage]);

    const paginationItems = useMemo(
        () => getPaginationItems(safePage, totalPages),
        [safePage, totalPages]
    );

    return (
        <section
            id="berita"
            className="relative isolate flex min-h-[calc(100svh-4rem)] lg:min-h-[calc(100vh-4rem)] items-center overflow-hidden bg-gray-50/70 border-t border-gray-100 py-6 sm:py-8"
        >
            <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-4 sm:mb-5 gap-3">
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                            Berita &amp; Edukasi <span className="text-purple-700">Kesehatan Hewan</span>
                        </h2>
                        <p className="mt-1 text-xs sm:text-sm text-gray-600 max-w-2xl">
                            Ikuti jadwal vaksinasi massal, kebijakan pengendalian zoonosis
                            daerah, serta panduan praktis veteriner terpercaya.
                        </p>
                    </div>

                    {displayNews.length > 0 && (
                        <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 shrink-0">
                            <span className="px-3 py-1.5 rounded-xl bg-white border border-gray-200 shadow-2xs">
                                Menampilkan{" "}
                                <strong className="text-purple-700">
                                    {(safePage - 1) * ITEMS_PER_PAGE + 1}–
                                    {Math.min(safePage * ITEMS_PER_PAGE, displayNews.length)}
                                </strong>{" "}
                                dari <strong className="text-gray-900">{displayNews.length}</strong> berita terbaru
                            </span>
                        </div>
                    )}
                </div>

                {paginatedNews.length === 0 ? (
                    <div className="rounded-2xl bg-white border border-gray-200/80 p-10 text-center shadow-xs">
                        <p className="text-sm font-bold text-gray-700">
                            Belum ada berita atau artikel edukasi yang diterbitkan.
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            Publikasi terbaru dari Puskeswan akan ditampilkan di halaman ini.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
                        {paginatedNews.map((item) => {
                            const articleSlug = item.slug || slugify(item.title);
                            const articleUrl = `/berita/${articleSlug}`;
                            const categorySlug = item.categorySlug || slugify(item.category);
                            const categoryUrl = `/berita/ketegori/${categorySlug}`;
                            const authorSlug = item.authorSlug || slugify(item.author);
                            const authorUrl = `/berita/author/${authorSlug}`;
                            const theme = getCategoryTheme(item.category);

                            return (
                                <article
                                    key={item.id}
                                    className="rounded-2xl bg-white border border-gray-200/80 overflow-hidden shadow-xs hover:shadow-md hover:border-purple-200 transition-all duration-200 flex flex-col group"
                                >
                                    <a
                                        href={articleUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`w-full aspect-4/3 bg-gradient-to-tr ${theme.gradient} relative overflow-hidden block shrink-0`}
                                    >
                                        {item.gambar ? (
                                            <img
                                                src={item.gambar}
                                                alt={item.title}
                                                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center relative">
                                                <svg
                                                    className="w-16 h-16 text-white/15 pointer-events-none"
                                                    fill="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-4H7v-2h4V7h2v4h4v2h-4v4z" />
                                                </svg>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-80 pointer-events-none" />
                                        <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[10px] font-semibold text-white/95 z-10 pointer-events-none">
                                            <span>📅 {item.date}</span>
                                            <span>{item.readTime}</span>
                                        </div>
                                    </a>

                                    <div className="p-3 flex-1 flex flex-col justify-between gap-2">
                                        <div className="space-y-1">
                                            <div>
                                                <a
                                                    href={categoryUrl}
                                                    className={`block text-[11px] font-bold ${theme.text} hover:underline line-clamp-1`}
                                                    title={`Lihat semua berita kategori ${item.category}`}
                                                >
                                                    {item.category}
                                                </a>
                                            </div>

                                            <a
                                                href={articleUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="block"
                                            >
                                                <h3 className="text-xs sm:text-[13px] font-extrabold text-gray-900 group-hover:text-purple-700 transition-colors line-clamp-2 leading-snug">
                                                    {item.title}
                                                </h3>
                                            </a>

                                            <p className="text-[10.5px] text-gray-500 line-clamp-2 leading-snug pt-0.5">
                                                {item.excerpt}
                                            </p>
                                        </div>

                                        <div className="pt-2 border-t border-gray-100 space-y-1.5">
                                            <a
                                                href={authorUrl}
                                                className="flex items-center gap-2 group/author min-w-0 select-none"
                                                title={`Lihat semua berita oleh ${item.author}`}
                                                onContextMenu={(e) => e.preventDefault()}
                                                style={{ WebkitTouchCallout: "none" }}
                                            >
                                                {item.authorFoto ? (
                                                    <img
                                                        src={item.authorFoto}
                                                        alt={item.author}
                                                        className="w-6 h-6 aspect-square rounded-md object-cover object-center bg-purple-50 border border-purple-200 shrink-0 shadow-2xs protected-photo pointer-events-none select-none"
                                                        draggable={false}
                                                        onContextMenu={(e) => e.preventDefault()}
                                                    />
                                                ) : (
                                                    <div className="w-6 h-6 aspect-square rounded-md bg-purple-700 text-white font-bold text-[9.5px] flex items-center justify-center shrink-0 shadow-2xs">
                                                        {getInitials(item.author)}
                                                    </div>
                                                )}
                                                <div className="min-w-0 flex-1 leading-tight">
                                                    <span className="block text-[8.5px] font-semibold uppercase tracking-wider text-gray-400">
                                                        Author / Penulis
                                                    </span>
                                                    <span className="block font-bold text-gray-700 group-hover/author:text-purple-700 group-hover/author:underline truncate text-[10px]">
                                                        {item.author}
                                                    </span>
                                                </div>
                                            </a>

                                            <div className="flex justify-end">
                                                <a
                                                    href={articleUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="font-bold text-purple-700 hover:text-purple-900 hover:underline inline-flex items-center gap-1 text-[10.5px]"
                                                >
                                                    <span>Baca Selengkapnya</span>
                                                    <span>&rarr;</span>
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}

                {displayNews.length > 0 && (
                    <div className="mt-4 sm:mt-5 flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-3 border-t border-gray-200/70">
                        <p className="text-xs text-gray-500 font-medium">
                            Halaman <span className="font-bold text-gray-900">{safePage}</span> dari{" "}
                            <span className="font-bold text-gray-900">{totalPages}</span>
                        </p>

                        <div
                            className="inline-flex items-center gap-1 bg-white p-1 rounded-2xl border border-gray-200/90 shadow-xs"
                            role="tablist"
                            aria-label="Navigasi Halaman Berita"
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
            </div>
        </section>
    );
}
