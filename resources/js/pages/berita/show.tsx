import React, { useState } from "react";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { ToastProvider, useToast } from "@/components/ui";
import { Navbar, Footer } from "@/components/landing";

interface ArticleDetail {
    id: string | number;
    judul: string;
    slug: string;
    author_name: string;
    author_slug?: string;
    author_foto?: string | null;
    author_jabatan?: string;
    category: string;
    category_slug?: string;
    ringkasan: string;
    isi_berita: string;
    gambar?: string | null;
    date: string;
    readTime: string;
}

interface RelatedArticle {
    id: string | number;
    judul: string;
    slug: string;
    author_name: string;
    author_slug?: string;
    author_foto?: string | null;
    category: string;
    category_slug?: string;
    ringkasan: string;
    gambar?: string | null;
    date: string;
    readTime: string;
}

interface BeritaShowProps {
    article: ArticleDetail;
    relatedArticles: RelatedArticle[];
}

const slugify = (text: string): string =>
    text
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");

function getInitials(name: string): string {
    const clean = name.replace(/^(drh\.|dr\.|bpk\.|ibu)\s*/i, "").trim();
    const parts = clean.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return (clean.slice(0, 2) || "PK").toUpperCase();
}

const CATEGORY_TEXT_COLORS = [
    "text-purple-700",
    "text-rose-700",
    "text-blue-700",
    "text-emerald-700",
    "text-amber-700",
    "text-indigo-700",
];

function getCategoryColor(categoryName: string): string {
    const normalized = (categoryName || "").toLowerCase();
    if (normalized.includes("vaksin") || normalized.includes("imunisasi")) {
        return CATEGORY_TEXT_COLORS[0];
    }
    if (normalized.includes("zoonosis") || normalized.includes("rabies")) {
        return CATEGORY_TEXT_COLORS[1];
    }
    if (normalized.includes("inseminasi") || normalized.includes("ib")) {
        return CATEGORY_TEXT_COLORS[2];
    }
    if (normalized.includes("ternak") || normalized.includes("pakan")) {
        return CATEGORY_TEXT_COLORS[3];
    }

    let hash = 0;
    for (let i = 0; i < normalized.length; i++) {
        hash = normalized.charCodeAt(i) + ((hash << 5) - hash);
    }
    return CATEGORY_TEXT_COLORS[Math.abs(hash) % CATEGORY_TEXT_COLORS.length];
}

function BeritaShowContent({ article, relatedArticles = [] }: BeritaShowProps) {
    const { success } = useToast();
    const page = usePage();
    const user = (page?.props as any)?.auth?.user;

    const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
    const [copied, setCopied] = useState<boolean>(false);

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

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            success("Tautan artikel berhasil disalin ke papan klip!");
            setTimeout(() => setCopied(false), 2500);
        } catch {
        }
    };

    const handleShareWhatsApp = () => {
        const text = encodeURIComponent(
            `${article.judul} - Sistem Informasi Puskeswan Kota Pariaman\n${window.location.href}`,
        );
        window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
    };

    const authorSlug = article.author_slug || slugify(article.author_name);
    const categorySlug = article.category_slug || slugify(article.category);

    const paragraphs = (article.isi_berita || "")
        .split(/\n\s*\n|\r\n\s*\r\n/)
        .map((p) => p.trim())
        .filter(Boolean);

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

            <main className="flex-1 pt-6 pb-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
                        <article className="lg:col-span-8 bg-white rounded-3xl border border-gray-200/80 shadow-xs overflow-hidden">
                            <div className="relative h-72 sm:h-96 lg:h-[460px] w-full bg-gradient-to-tr from-purple-950 via-purple-800 to-indigo-600 overflow-hidden">
                                {article.gambar ? (
                                    <img
                                        src={article.gambar}
                                        alt={article.judul}
                                        className="w-full h-full object-cover object-center"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center relative">
                                        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-white/5 blur-2xl pointer-events-none" />
                                        <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-indigo-400/10 blur-xl pointer-events-none" />
                                        <svg
                                            className="w-36 h-36 sm:w-48 sm:h-48 text-white/15 pointer-events-none"
                                            fill="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-4H7v-2h4V7h2v4h4v2h-4v4z" />
                                        </svg>
                                    </div>
                                )}
                            </div>

                            <div className="p-5 sm:p-8 lg:p-10 space-y-6">
                                <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-gray-900 tracking-tight leading-snug">
                                    {article.judul}
                                </h1>

                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
                                    <div className="flex items-center gap-4">
                                        <Link
                                            href={`/berita/author/${authorSlug}`}
                                            className="shrink-0 group focus:outline-none select-none"
                                            title={`Lihat semua berita oleh ${article.author_name}`}
                                            onContextMenu={(e) => e.preventDefault()}
                                            style={{ WebkitTouchCallout: "none" }}
                                        >
                                            {article.author_foto ? (
                                                <img
                                                    src={article.author_foto}
                                                    alt={article.author_name}
                                                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover object-center bg-purple-50 border-2 border-purple-100 shadow-sm group-hover:border-purple-400 group-hover:scale-105 transition-all duration-200 protected-photo pointer-events-none select-none"
                                                    draggable={false}
                                                    onContextMenu={(e) => e.preventDefault()}
                                                />
                                            ) : (
                                                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-purple-700 text-white font-extrabold text-lg sm:text-xl flex items-center justify-center shadow-sm shadow-purple-600/20 group-hover:bg-purple-600 group-hover:scale-105 transition-all duration-200">
                                                    {getInitials(article.author_name)}
                                                </div>
                                            )}
                                        </Link>

                                        <div className="space-y-1.5">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <Link
                                                    href={`/berita/author/${authorSlug}`}
                                                    className="text-sm sm:text-base font-extrabold text-gray-900 hover:text-purple-700 hover:underline transition-colors"
                                                >
                                                    {article.author_name}
                                                </Link>
                                                <span
                                                    title="Terverifikasi Tim Medis Puskeswan"
                                                    className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200"
                                                >
                                                    ✓ Terverifikasi
                                                </span>
                                            </div>

                                            {article.author_jabatan && (
                                                <p className="text-xs text-gray-500 font-medium">
                                                    {article.author_jabatan}
                                                </p>
                                            )}

                                            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 pt-0.5">
                                                <Link
                                                    href={`/berita/ketegori/${categorySlug}`}
                                                    className={`text-xs font-bold ${getCategoryColor(article.category)} hover:underline transition-colors`}
                                                    title={`Lihat semua berita kategori ${article.category}`}
                                                >
                                                    {article.category}
                                                </Link>
                                                <span className="text-gray-300">•</span>
                                                <span className="inline-flex items-center gap-1 font-medium text-gray-500">
                                                    <span>📅 {article.date}</span>
                                                </span>
                                                <span className="text-gray-300">•</span>
                                                <span className="text-gray-500 font-medium">
                                                    ⏱️ {article.readTime}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                                        <button
                                            type="button"
                                            onClick={handleCopyLink}
                                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-purple-50 hover:text-purple-700 transition-colors cursor-pointer"
                                        >
                                            <span>{copied ? "✓ Tersalin" : "🔗 Salin Tautan"}</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleShareWhatsApp}
                                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/60 transition-colors cursor-pointer"
                                        >
                                            <span>Bagikan WA</span>
                                        </button>
                                    </div>
                                </div>

                                {article.ringkasan && (
                                    <div className="p-4 sm:p-5 rounded-2xl bg-purple-50/70 border-l-4 border-purple-700">
                                        <span className="block text-[11px] font-extrabold uppercase tracking-wider text-purple-800 mb-1">
                                            Intisari Edukasi
                                        </span>
                                        <p className="text-xs sm:text-sm text-gray-800 font-medium leading-relaxed italic">
                                            &ldquo;{article.ringkasan}&rdquo;
                                        </p>
                                    </div>
                                )}

                                <div className="space-y-4 text-gray-700 text-sm sm:text-base leading-relaxed">
                                    {paragraphs.length > 0 ? (
                                        paragraphs.map((paragraph, idx) => (
                                            <p
                                                key={idx}
                                                className="text-justify leading-7 sm:leading-8 whitespace-pre-line"
                                            >
                                                {paragraph}
                                            </p>
                                        ))
                                    ) : (
                                        <p className="text-justify leading-7 sm:leading-8 whitespace-pre-line">
                                            {article.isi_berita}
                                        </p>
                                    )}
                                </div>

                                <div className="mt-8 pt-6 border-t border-gray-100">
                                    <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-gray-900 via-purple-950 to-indigo-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="space-y-1">
                                            <span className="inline-block text-[10px] font-bold uppercase tracking-widest text-purple-300">
                                                Layanan Terpadu Puskeswan
                                            </span>
                                            <h3 className="text-sm sm:text-base font-extrabold">
                                                Butuh Pemeriksaan Kesehatan Hewan atau Cek Rekam Medis?
                                            </h3>
                                            <p className="text-xs text-gray-300 max-w-xl">
                                                Pantau riwayat klinis hewan kesayangan &amp; ternak Anda secara daring atau konsultasikan langsung bersama dokter hewan kami.
                                            </p>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                                            <a
                                                href="/cek-rekam-medis"
                                                onClick={(e) =>
                                                    handleNavigate("/cek-rekam-medis", "cek-rekam-medis", e)
                                                }
                                                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white transition-colors shadow-sm"
                                            >
                                                Cek Rekam Medis
                                            </a>
                                            <a
                                                href="/kontak"
                                                onClick={(e) => handleNavigate("/kontak", "kontak", e)}
                                                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-colors"
                                            >
                                                Hubungi Dokter
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </article>

                        <aside className="lg:col-span-4 self-start">
                            <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs p-5 sm:p-6">
                                <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-gray-100">
                                    <h2 className="text-sm sm:text-base font-extrabold text-gray-900 tracking-tight">
                                        Berita &amp; Edukasi Lainnya
                                    </h2>
                                    <span className="w-2 h-2 rounded-full bg-purple-600" />
                                </div>

                                {relatedArticles.length > 0 ? (
                                    <div className="space-y-4">
                                        {relatedArticles.map((rel) => {
                                            const relCatSlug =
                                                rel.category_slug || slugify(rel.category);
                                            const relAuthSlug =
                                                rel.author_slug || slugify(rel.author_name);

                                            return (
                                                <div
                                                    key={rel.id}
                                                    className="group rounded-2xl border border-gray-100 hover:border-purple-200 hover:bg-purple-50/40 overflow-hidden transition-all duration-200"
                                                >
                                                    {rel.gambar && (
                                                        <Link
                                                            href={`/berita/${rel.slug}`}
                                                            className="block h-36 w-full overflow-hidden bg-gray-100"
                                                        >
                                                            <img
                                                                src={rel.gambar}
                                                                alt={rel.judul}
                                                                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                                                            />
                                                        </Link>
                                                    )}
                                                    <div className="p-3.5">
                                                        <div className="flex items-center justify-between gap-2 mb-1">
                                                            <Link
                                                                href={`/berita/ketegori/${relCatSlug}`}
                                                                className={`text-[11px] font-bold ${getCategoryColor(rel.category)} hover:underline transition-colors line-clamp-1`}
                                                            >
                                                                {rel.category}
                                                            </Link>
                                                            <span className="text-[11px] text-gray-400 shrink-0">
                                                                {rel.date}
                                                            </span>
                                                        </div>
                                                        <Link href={`/berita/${rel.slug}`}>
                                                            <h3 className="text-xs sm:text-sm font-bold text-gray-900 group-hover:text-purple-700 transition-colors line-clamp-2 leading-snug">
                                                                {rel.judul}
                                                            </h3>
                                                        </Link>
                                                        <p className="text-[11px] text-gray-500 line-clamp-2 mt-1 leading-relaxed">
                                                            {rel.ringkasan}
                                                        </p>
                                                        <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-gray-100">
                                                            <Link
                                                                href={`/berita/author/${relAuthSlug}`}
                                                                className="text-[11px] font-semibold text-gray-500 hover:text-purple-700 hover:underline truncate max-w-[140px]"
                                                            >
                                                                {rel.author_name}
                                                            </Link>
                                                            <Link
                                                                href={`/berita/${rel.slug}`}
                                                                className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-700 group-hover:translate-x-0.5 transition-transform"
                                                            >
                                                                <span>Baca Artikel</span>
                                                                <span>&rarr;</span>
                                                            </Link>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <p className="text-xs text-gray-500 py-4 text-center">
                                        Belum ada artikel edukasi terkait lainnya.
                                    </p>
                                )}

                                <div className="mt-5 pt-4 border-t border-gray-100">
                                    <a
                                        href="/berita"
                                        onClick={(e) => handleNavigate("/berita", "berita", e)}
                                        className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 transition-colors"
                                    >
                                        <span>Lihat Semua Berita di Beranda</span>
                                        <span>&rarr;</span>
                                    </a>
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>
            </main>

            <Footer onNavigate={handleNavigate} user={user} />
        </div>
    );
}

export default function BeritaShow(props: BeritaShowProps) {
    return (
        <ToastProvider>
            <Head title={props.article.judul} />
            <BeritaShowContent {...props} />
        </ToastProvider>
    );
}
