import React, { useMemo, useState } from "react";

export interface DatabaseStaff {
    id: number;
    nama_staf: string;
    jabatan: string;
    nip_strv: string;
    foto: string | null;
}

interface StaffSectionProps {
    staffMembers?: DatabaseStaff[];
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
    if (!name) return "PW";
    const cleanName = name
        .replace(/drh\./gi, "")
        .replace(/,\s*[A-Za-z\.]+/g, "")
        .trim();
    const parts = cleanName.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return (cleanName.slice(0, 2) || "PW").toUpperCase();
}

interface RoleTheme {
    text: string;
    gradient: string;
}

const ROLE_THEMES: RoleTheme[] = [
    {
        text: "text-purple-700",
        gradient: "from-purple-900 via-purple-700 to-indigo-600",
    },
    {
        text: "text-emerald-700",
        gradient: "from-emerald-900 via-emerald-700 to-teal-600",
    },
    {
        text: "text-blue-700",
        gradient: "from-blue-900 via-blue-700 to-cyan-600",
    },
    {
        text: "text-rose-700",
        gradient: "from-rose-900 via-rose-700 to-pink-600",
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

function getRoleTheme(role: string, idx: number): RoleTheme {
    const normalized = (role || "").toLowerCase();
    if (normalized.includes("kepala") || normalized.includes("pimpinan")) {
        return ROLE_THEMES[0];
    }
    if (normalized.includes("dokter") || normalized.includes("medik")) {
        return ROLE_THEMES[1];
    }
    if (normalized.includes("admin") || normalized.includes("rekam medis")) {
        return ROLE_THEMES[2];
    }
    if (normalized.includes("paramedis") || normalized.includes("inseminator")) {
        return ROLE_THEMES[4];
    }
    return ROLE_THEMES[idx % ROLE_THEMES.length];
}

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

export default function StaffSection({ staffMembers }: StaffSectionProps) {
    const displayList = useMemo(() => {
        if (!Array.isArray(staffMembers) || staffMembers.length === 0) {
            return [];
        }

        return staffMembers.map((item, idx) => ({
            id: item.id,
            name: item.nama_staf,
            slug: slugify(item.nama_staf),
            role: item.jabatan,
            sip: item.nip_strv || "Aparatur Resmi Puskeswan",
            specialty:
                item.jabatan.toLowerCase().includes("dokter") ||
                item.jabatan.toLowerCase().includes("medik")
                    ? "Pemeriksaan Medis, Vaksinasi, Bedah Minor & IB"
                    : item.jabatan.toLowerCase().includes("admin")
                      ? "Pelayanan Rekam Medis & Pendaftaran Pasien"
                      : "Pelayanan Kesehatan Hewan & Kesmavet Terpadu",
            experience: "Aparatur Bersertifikasi Kompetensi",
            schedule: "Senin - Jumat | 08.00 - 15.30 WIB",
            initials: getInitials(item.nama_staf),
            foto: item.foto,
            theme: getRoleTheme(item.jabatan, idx),
        }));
    }, [staffMembers]);

    const [currentPage, setCurrentPage] = useState<number>(1);
    const totalPages = Math.max(1, Math.ceil(displayList.length / ITEMS_PER_PAGE));
    const safePage = Math.min(currentPage, totalPages);

    const paginatedStaff = useMemo(() => {
        const start = (safePage - 1) * ITEMS_PER_PAGE;
        return displayList.slice(start, start + ITEMS_PER_PAGE);
    }, [displayList, safePage]);

    const paginationItems = useMemo(
        () => getPaginationItems(safePage, totalPages),
        [safePage, totalPages]
    );

    return (
        <section
            id="staff"
            className="relative isolate flex min-h-[calc(100svh-4rem)] lg:min-h-[calc(100vh-4rem)] items-center overflow-hidden bg-white border-t border-gray-100 py-6 sm:py-8"
        >
            <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-4 sm:mb-5 gap-3">
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                            Tim Dokter &amp; <span className="text-purple-700">Tenaga Medis Puskeswan</span>
                        </h2>
                        <p className="mt-1 text-xs sm:text-sm text-gray-600 max-w-2xl">
                            Dilayani oleh dokter hewan berlisensi resmi, paramedis veteriner, dan petugas administrasi
                            yang berdedikasi menjaga kesehatan hewan kesayangan maupun ternak produktif masyarakat.
                        </p>
                    </div>

                    {displayList.length > 0 && (
                        <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 shrink-0">
                            <span className="px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-200 shadow-2xs">
                                Menampilkan{" "}
                                <strong className="text-purple-700">
                                    {(safePage - 1) * ITEMS_PER_PAGE + 1}–
                                    {Math.min(safePage * ITEMS_PER_PAGE, displayList.length)}
                                </strong>{" "}
                                dari <strong className="text-gray-900">{displayList.length}</strong> tenaga staf
                            </span>
                        </div>
                    )}
                </div>

                {paginatedStaff.length === 0 ? (
                    <div className="rounded-2xl bg-gray-50/70 border border-gray-200/80 p-10 text-center shadow-xs">
                        <p className="text-sm font-bold text-gray-700">
                            Belum ada data tenaga dokter atau staf medis yang terdaftar.
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            Daftar personel resmi Puskeswan akan ditampilkan di halaman ini.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
                        {paginatedStaff.map((staff) => {
                            const authorUrl = `/berita/author/${staff.slug}`;
                            const photoSrc = staff.foto
                                ? staff.foto.startsWith("http") || staff.foto.startsWith("/")
                                    ? staff.foto
                                    : `/storage/${staff.foto}`
                                : null;

                            return (
                                <article
                                    key={staff.id}
                                    className="rounded-2xl bg-white border border-gray-200/80 overflow-hidden shadow-xs hover:shadow-md hover:border-purple-200 transition-all duration-200 flex flex-col group"
                                >
                                    <a
                                        href={authorUrl}
                                        className={`w-full aspect-4/3 bg-gradient-to-tr ${staff.theme.gradient} relative overflow-hidden block shrink-0`}
                                        title={`Lihat publikasi oleh ${staff.name}`}
                                    >
                                        {photoSrc ? (
                                            <img
                                                src={photoSrc}
                                                alt={staff.name}
                                                className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center relative">
                                                <span className="text-3xl sm:text-4xl font-black text-white/90 tracking-wider select-none">
                                                    {staff.initials}
                                                </span>
                                            </div>
                                        )}
                                    </a>

                                    <div className="p-3 flex-1 flex flex-col justify-between gap-2">
                                        <div className="space-y-1">
                                            <p className={`text-[11px] font-bold ${staff.theme.text} line-clamp-1`}>
                                                {staff.role}
                                            </p>

                                            <div className="space-y-0.5">
                                                <a href={authorUrl} className="block">
                                                    <h3 className="text-xs sm:text-[13px] font-extrabold text-gray-900 group-hover:text-purple-700 transition-colors line-clamp-1 leading-snug">
                                                        {staff.name}
                                                    </h3>
                                                </a>
                                                <p className="text-[10px] font-mono font-medium text-gray-500 truncate">
                                                    {staff.sip}
                                                </p>
                                            </div>

                                            <p className="text-[10.5px] text-gray-500 line-clamp-2 leading-snug pt-0.5">
                                                {staff.specialty}
                                            </p>
                                        </div>

                                        <div className="pt-2 border-t border-gray-100 space-y-1.5">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <div className="w-6 h-6 aspect-square rounded-md bg-purple-50 text-purple-700 border border-purple-200 font-bold text-[10px] flex items-center justify-center shrink-0">
                                                    🗓
                                                </div>
                                                <div className="min-w-0 flex-1 leading-tight">
                                                    <span className="block text-[8.5px] font-semibold uppercase tracking-wider text-gray-400">
                                                        Jadwal Praktik
                                                    </span>
                                                    <span className="block font-bold text-gray-700 truncate text-[10px]">
                                                        {staff.schedule}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex justify-end">
                                                <a
                                                    href={authorUrl}
                                                    className="font-bold text-purple-700 hover:text-purple-900 hover:underline inline-flex items-center gap-1 text-[10.5px]"
                                                >
                                                    <span>Lihat Publikasi</span>
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

                {displayList.length > 0 && (
                    <div className="mt-4 sm:mt-5 flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-3 border-t border-gray-200/70">
                        <p className="text-xs text-gray-500 font-medium">
                            Halaman <span className="font-bold text-gray-900">{safePage}</span> dari{" "}
                            <span className="font-bold text-gray-900">{totalPages}</span>
                        </p>

                        <div
                            className="inline-flex items-center gap-1 bg-gray-50 p-1 rounded-2xl border border-gray-200/90 shadow-xs"
                            role="tablist"
                            aria-label="Navigasi Halaman Tenaga Staf"
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
