import React, { useState, useRef } from "react";
import { Head, Link, router } from "@inertiajs/react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Button, Dropdown, Modal, Pagination } from "@/components/ui";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";

interface RabiesCaseItem {
    id: number;
    no_surat: string;
    lampiran: string;
    perihal: string;
    nik_pasien: string;
    nama_pasien: string;
    jenis_kelamin_pasien: string;
    umur_pasien: string;
    tgl_lahir_pasien: string;
    alamat_pasien: string;
    no_hp_pasien: string;
    lokasi_gigitan: string;
    status_var: string;
    id_jenis_hewan: number;
    jenis_hewan: string;
    ras_hewan: string;
    jenis_kelamin_hewan: string;
    umur_hewan: string;
    nama_pemilik_hewan: string;
    status_hewan: string;
    tgl_kejadian: string;
    raw_tgl_kejadian: string;
    alamat_kejadian: string;
    kronologi: string;
    petugas: string;
}

interface PageProps {
    cases: {
        data: RabiesCaseItem[];
        links: any[];
        current_page: number;
        last_page: number;
        from: number;
        to: number;
        total: number;
        per_page?: number;
    };
    summary: {
        total_kasus: number;
        total_var: number;
        total_observasi: number;
        total_mati: number;
    };
    filters: {
        search?: string;
        status_var?: string;
        status_hewan?: string;
    };
}

const STATUS_VAR_OPTIONS: Record<string, string> = {
    "": "Semua Status VAR",
    "Sudah Diberikan VAR": "Sudah Diberikan VAR",
    "Diberikan VAR Dosis 1": "Diberikan VAR Dosis 1",
    "Belum Diberikan VAR": "Belum Diberikan VAR",
};

const STATUS_HEWAN_OPTIONS: Record<string, string> = {
    "": "Semua Status Hewan",
    Observasi: "Observasi 14 Hari",
    Mati: "Mati / Positif Rabies",
    Sehat: "Sehat Bebas Rabies",
    Liar: "Liar / Tidak Diketahui",
};

/**
 * Format string tanggal ke format formal Indonesia (contoh: "29 Januari 2026")
 */
const formatIndonesianDate = (dateStr?: string): string => {
    if (!dateStr || dateStr === "-") return "-";
    const months = [
        "Januari",
        "Februari",
        "Maret",
        "April",
        "Mei",
        "Juni",
        "Juli",
        "Agustus",
        "September",
        "Oktober",
        "November",
        "Desember",
    ];
    let d: Date;
    if (dateStr.includes("/")) {
        const parts = dateStr.split("/");
        d = new Date(
            parseInt(parts[2]),
            parseInt(parts[1]) - 1,
            parseInt(parts[0]),
        );
    } else {
        d = new Date(dateStr);
    }
    if (isNaN(d.getTime())) return dateStr;
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
};

/**
 * Hitung rentang observasi 14 hari sejak tanggal kejadian gigitan
 */
const getObservationRange = (dateStr?: string) => {
    const months = [
        "Januari",
        "Februari",
        "Maret",
        "April",
        "Mei",
        "Juni",
        "Juli",
        "Agustus",
        "September",
        "Oktober",
        "November",
        "Desember",
    ];
    let d1: Date;
    if (!dateStr || dateStr === "-") {
        d1 = new Date();
    } else if (dateStr.includes("/")) {
        const parts = dateStr.split("/");
        d1 = new Date(
            parseInt(parts[2]),
            parseInt(parts[1]) - 1,
            parseInt(parts[0]),
        );
    } else {
        d1 = new Date(dateStr);
    }

    if (isNaN(d1.getTime())) {
        return { start: dateStr || "-", end: "-" };
    }

    const d2 = new Date(d1);
    d2.setDate(d2.getDate() + 14);

    return {
        start: `${d1.getDate()} ${months[d1.getMonth()]} ${d1.getFullYear()}`,
        end: `${d2.getDate()} ${months[d2.getMonth()]} ${d2.getFullYear()}`,
    };
};

/**
 * Ekstrak nama desa target untuk tembusan surat dinas
 */
const getDesaTarget = (item?: RabiesCaseItem | null): string => {
    if (!item) return "Setempat";
    const raw = item.alamat_kejadian || item.alamat_pasien || "Setempat";
    const cleaned = raw
        .replace(/^(desa|kelurahan|nagari|komp\.|komplek|dusun)\s+/i, "")
        .trim();
    return cleaned || raw;
};

export default function AdminRabiesIndex({
    cases,
    summary = {
        total_kasus: 0,
        total_var: 0,
        total_observasi: 0,
        total_mati: 0,
    },
    filters = { search: "", status_var: "", status_hewan: "" },
}: PageProps) {
    const { success, error } = useToast();

    const [search, setSearch] = useState(filters.search || "");
    const [statusVarFilter, setStatusVarFilter] = useState(
        filters.status_var || "",
    );
    const [statusHewanFilter, setStatusHewanFilter] = useState(
        filters.status_hewan || "",
    );
    const isFirstSearchRender = useRef(true);

    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [selectedCase, setSelectedCase] = useState<RabiesCaseItem | null>(
        null,
    );

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deletingCase, setDeletingCase] = useState<RabiesCaseItem | null>(
        null,
    );
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isSubmittingRef = useRef(false);

    React.useEffect(() => {
        if (isFirstSearchRender.current) {
            isFirstSearchRender.current = false;
            return;
        }

        const timer = setTimeout(() => {
            router.get(
                "/admin/rabies",
                {
                    search: search || undefined,
                    status_var: statusVarFilter || undefined,
                    status_hewan: statusHewanFilter || undefined,
                },
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                },
            );
        }, 300);

        return () => clearTimeout(timer);
    }, [search]);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            "/admin/rabies",
            {
                search: search || undefined,
                status_var: statusVarFilter || undefined,
                status_hewan: statusHewanFilter || undefined,
            },
            { preserveState: true, replace: true },
        );
    };

    const handleFilterStatusVar = (val: string) => {
        setStatusVarFilter(val);
        router.get(
            "/admin/rabies",
            {
                search: search || undefined,
                status_var: val || undefined,
                status_hewan: statusHewanFilter || undefined,
            },
            { preserveState: true, replace: true },
        );
    };

    const handleFilterStatusHewan = (val: string) => {
        setStatusHewanFilter(val);
        router.get(
            "/admin/rabies",
            {
                search: search || undefined,
                status_var: statusVarFilter || undefined,
                status_hewan: val || undefined,
            },
            { preserveState: true, replace: true },
        );
    };

    const handleResetFilter = () => {
        setSearch("");
        setStatusVarFilter("");
        setStatusHewanFilter("");
        router.get("/admin/rabies", {}, { preserveState: true, replace: true });
    };

    const openDetailModal = (item: RabiesCaseItem) => {
        setSelectedCase(item);
        setDetailModalOpen(true);
    };

    const openDeleteModal = (item: RabiesCaseItem) => {
        setDeletingCase(item);
        setDeleteModalOpen(true);
    };

    const executeDelete = () => {
        if (!deletingCase || isSubmittingRef.current) return;
        isSubmittingRef.current = true;
        setIsSubmitting(true);

        router.delete(`/admin/rabies/${deletingCase.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setDeleteModalOpen(false);
                setDeletingCase(null);
                success("Data laporan kasus rabies berhasil dihapus.");
            },
            onError: () => {
                setDeleteModalOpen(false);
                error("Gagal menghapus data laporan kasus.");
            },
            onFinish: () => {
                isSubmittingRef.current = false;
                setIsSubmitting(false);
            },
        });
    };

    const handlePrintCase = (item: RabiesCaseItem) => {
        setSelectedCase(item);
        const originalTitle = document.title;
        document.title = "";
        setTimeout(() => {
            window.print();
            setTimeout(() => {
                document.title = originalTitle;
            }, 800);
        }, 150);
    };

    const emptyRowsCount = Math.max(0, 5 - cases.data.length);

    return (
        <DashboardLayout>
            <Head title="Riwayat Kasus Gigitan Rabies" />

            <style>{`
                @media print {
                    @page {
                        size: A4 portrait;
                        margin: 0 !important;
                    }
                    html, body {
                        width: 100% !important;
                        height: 100% !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        background: transparent !important;
                        background-color: #ffffff !important;
                        color: #000000 !important;
                        font-family: 'Times New Roman', Times, serif !important;
                        overflow: hidden !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    nav, header, aside, .no-print, button, form, footer {
                        display: none !important;
                    }
                    .print-case-only {
                        display: flex !important;
                        flex-direction: column !important;
                        justify-content: space-between !important;
                        width: 210mm !important;
                        max-width: 210mm !important;
                        min-height: 297mm !important;
                        max-height: 297mm !important;
                        height: 297mm !important;
                        padding: 12mm 18mm 10mm 18mm !important;
                        margin: 0 auto !important;
                        box-sizing: border-box !important;
                        background: transparent !important;
                        background-color: #ffffff !important;
                        page-break-after: avoid !important;
                        page-break-before: avoid !important;
                        page-break-inside: avoid !important;
                        overflow: hidden !important;
                    }
                }
                .print-case-only {
                    display: none;
                }
            `}</style>

            {selectedCase && (
                <div className="print-case-only font-serif text-black leading-snug">
                    <div>
                        <div className="relative pb-1 mb-4">
                            <div className="flex items-center">
                                <img
                                    src="/images/logo-pariaman.webp"
                                    alt="Logo Kota Pariaman"
                                    className="absolute left-0 top-0.5 h-[76px] w-auto object-contain"
                                />
                                <div className="text-center font-serif text-black leading-snug w-full pl-20 pr-4">
                                    <div className="text-[12pt] tracking-wider uppercase font-normal">
                                        PEMERINTAH KOTA PARIAMAN
                                    </div>
                                    <div className="text-[13pt] tracking-wide uppercase font-bold">
                                        DINAS PERTANIAN PANGAN DAN PERIKANAN
                                    </div>
                                    <div className="text-[14.5pt] tracking-wider uppercase font-black">
                                        UPT PUSKESWAN DAN IB
                                    </div>
                                    <div className="text-[10.5pt] font-semibold">
                                        (Pusat Kesehatan Hewan dan Inseminasi
                                        Buatan)
                                    </div>
                                    <div className="text-[9.5pt]">
                                        Jl. Sentot Ali Basa Jati Telp. (0751)
                                        93898
                                    </div>
                                    <div className="text-[9pt] flex items-center justify-center gap-6">
                                        <span>
                                            E-Mail :{" "}
                                            <span className="underline">
                                                puskeswanpariaman1@gmail.com
                                            </span>
                                        </span>
                                        <span>Kode Pos : 25516</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-2 border-b-[2.5px] border-black pb-[1.5px]">
                                <div className="border-b border-black" />
                            </div>
                        </div>

                        <div className="grid grid-cols-12 text-[10.5pt] leading-snug mb-3">
                            <div className="col-span-6">
                                <table className="w-full">
                                    <tbody>
                                        <tr>
                                            <td className="w-14 py-0.5">No</td>
                                            <td className="w-4 py-0.5 text-center">
                                                :
                                            </td>
                                            <td className="py-0.5">
                                                {selectedCase.no_surat ||
                                                    "524.3/026/Puskeswan-2026"}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="py-0.5">Lamp</td>
                                            <td className="py-0.5 text-center">
                                                :
                                            </td>
                                            <td className="py-0.5">
                                                {selectedCase.lampiran || "-"}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="py-0.5 align-top">
                                                Hal
                                            </td>
                                            <td className="py-0.5 align-top text-center">
                                                :
                                            </td>
                                            <td className="py-0.5 align-top font-semibold underline">
                                                Kasus Gigitan HPR
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <div className="col-span-6 pl-10">
                                <div>
                                    Pariaman,{" "}
                                    {formatIndonesianDate(
                                        selectedCase.raw_tgl_kejadian ||
                                            selectedCase.tgl_kejadian,
                                    )}
                                </div>
                                <div className="mt-2.5">
                                    <div>Kepada Yth.</div>
                                    <div>Pimpinan Puskesmas Sikapak</div>
                                    <div>di</div>
                                    <div className="pl-6 underline">Tempat</div>
                                </div>
                            </div>
                        </div>

                        <p className="text-[10.5pt] text-justify indent-10 mb-2 leading-relaxed">
                            Bersama ini disampaikan bahwa terjadi kasus Gigitan
                            oleh{" "}
                            {(
                                selectedCase.jenis_hewan || "hewan"
                            ).toLowerCase()}{" "}
                            terhadap korban sebagai berikut:
                        </p>

                        <div className="mb-3 text-[10.5pt]">
                            <table className="w-full leading-snug">
                                <tbody>
                                    <tr>
                                        <td className="w-36 py-0.5">Nama</td>
                                        <td className="w-4 py-0.5 text-center">
                                            :
                                        </td>
                                        <td className="py-0.5 font-bold uppercase">
                                            {selectedCase.nama_pasien}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="py-0.5">Umur</td>
                                        <td className="py-0.5 text-center">
                                            :
                                        </td>
                                        <td className="py-0.5">
                                            {selectedCase.umur_pasien}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="py-0.5">
                                            Jenis kelamin
                                        </td>
                                        <td className="py-0.5 text-center">
                                            :
                                        </td>
                                        <td className="py-0.5">
                                            {selectedCase.jenis_kelamin_pasien}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="py-0.5 align-top">
                                            Alamat
                                        </td>
                                        <td className="py-0.5 align-top text-center">
                                            :
                                        </td>
                                        <td className="py-0.5 align-top">
                                            {selectedCase.alamat_pasien}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="py-0.5">
                                            Tanggal digigit
                                        </td>
                                        <td className="py-0.5 text-center">
                                            :
                                        </td>
                                        <td className="py-0.5">
                                            {formatIndonesianDate(
                                                selectedCase.raw_tgl_kejadian ||
                                                    selectedCase.tgl_kejadian,
                                            )}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="py-0.5">
                                            Lokasi Gigitan
                                        </td>
                                        <td className="py-0.5 text-center">
                                            :
                                        </td>
                                        <td className="py-0.5">
                                            {selectedCase.lokasi_gigitan}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div className="mb-3 text-[10.5pt]">
                            <div className="font-semibold underline mb-1">
                                Signalement
                            </div>
                            <div>
                                <table className="w-full leading-snug">
                                    <tbody>
                                        <tr>
                                            <td className="w-36 py-0.5">
                                                Jenis hewan
                                            </td>
                                            <td className="w-4 py-0.5 text-center">
                                                :
                                            </td>
                                            <td className="py-0.5">
                                                {selectedCase.jenis_hewan}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="py-0.5">Ras</td>
                                            <td className="py-0.5 text-center">
                                                :
                                            </td>
                                            <td className="py-0.5">
                                                {selectedCase.ras_hewan || "-"}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="py-0.5">
                                                Jenis kelamin
                                            </td>
                                            <td className="py-0.5 text-center">
                                                :
                                            </td>
                                            <td className="py-0.5">
                                                {
                                                    selectedCase.jenis_kelamin_hewan
                                                }
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="py-0.5">Umur</td>
                                            <td className="py-0.5 text-center">
                                                :
                                            </td>
                                            <td className="py-0.5">
                                                {selectedCase.umur_hewan || "-"}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="py-0.5">
                                                Nama Pemilik
                                            </td>
                                            <td className="py-0.5 text-center">
                                                :
                                            </td>
                                            <td className="py-0.5">
                                                {selectedCase.nama_pemilik_hewan ||
                                                    "-"}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="py-0.5 align-top">
                                                Alamat Kejadian
                                            </td>
                                            <td className="py-0.5 align-top text-center">
                                                :
                                            </td>
                                            <td className="py-0.5 align-top">
                                                {selectedCase.alamat_kejadian}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="mb-2 text-[10.5pt]">
                            <div className="font-semibold underline mb-1">
                                Anamnese :
                            </div>
                            <p className="text-justify leading-relaxed whitespace-pre-wrap">
                                {selectedCase.kronologi || "-"}
                            </p>
                        </div>
                    </div>

                    <div className="mt-auto pt-4">
                        <div className="flex justify-end mb-4">
                            <div className="text-center text-[10.5pt] leading-tight min-w-[270px]">
                                <p>A.n Kepala UPTD. Puskeswan dan IB</p>
                                <p>Kota Pariaman</p>
                                <div className="h-20" />
                                <p className="font-bold underline">
                                    drh. Reni Gusnita
                                </p>
                                <p>NIP. 19860826 201903 2 002</p>
                            </div>
                        </div>

                        <div className="text-[9pt] leading-snug">
                            <p>Tembusan disampaikan kepada Yth.</p>
                            <p>1. Kepala Dinas Kesehatan Kota Pariaman</p>
                            <p>2. Kepala Desa {getDesaTarget(selectedCase)}</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="no-print">
                <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
                    <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-gray-200 border-b border-gray-200 bg-white">
                        <div className="p-3 sm:px-4 sm:py-3 flex items-center justify-between">
                            <div>
                                <span className="text-[10px] sm:text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                                    Total Laporan GHPR
                                </span>
                                <div className="flex items-baseline gap-1 mt-0.5">
                                    <span className="text-lg sm:text-xl font-black text-rose-700">
                                        {summary.total_kasus}
                                    </span>
                                    <span className="text-[11px] font-semibold text-gray-500">
                                        Kasus
                                    </span>
                                </div>
                            </div>
                            <span className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center text-sm shrink-0">
                                ⚠️
                            </span>
                        </div>

                        <div className="p-3 sm:px-4 sm:py-3 flex items-center justify-between">
                            <div>
                                <span className="text-[10px] sm:text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                                    Diberikan VAR
                                </span>
                                <div className="flex items-baseline gap-1 mt-0.5">
                                    <span className="text-lg sm:text-xl font-black text-emerald-600">
                                        {summary.total_var}
                                    </span>
                                    <span className="text-[11px] font-semibold text-gray-500">
                                        Korban
                                    </span>
                                </div>
                            </div>
                            <span className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm shrink-0">
                                💉
                            </span>
                        </div>

                        <div className="p-3 sm:px-4 sm:py-3 flex items-center justify-between">
                            <div>
                                <span className="text-[10px] sm:text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                                    Hewan Observasi
                                </span>
                                <div className="flex items-baseline gap-1 mt-0.5">
                                    <span className="text-lg sm:text-xl font-black text-amber-600">
                                        {summary.total_observasi}
                                    </span>
                                    <span className="text-[11px] font-semibold text-gray-500">
                                        Ekor
                                    </span>
                                </div>
                            </div>
                            <span className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-sm shrink-0">
                                🐕
                            </span>
                        </div>

                        <div className="p-3 sm:px-4 sm:py-3 flex items-center justify-between">
                            <div>
                                <span className="text-[10px] sm:text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                                    Positif / Mati
                                </span>
                                <div className="flex items-baseline gap-1 mt-0.5">
                                    <span className="text-lg sm:text-xl font-black text-rose-600">
                                        {summary.total_mati}
                                    </span>
                                    <span className="text-[11px] font-semibold text-gray-500">
                                        Ekor
                                    </span>
                                </div>
                            </div>
                            <span className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center text-sm shrink-0">
                                🧪
                            </span>
                        </div>
                    </div>

                    <div className="p-4 sm:p-5 border-b border-gray-200 bg-gray-50/60">
                        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
                            <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-3">
                                <div className="relative flex-1">
                                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                                        <svg
                                            className="w-4 h-4"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
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
                                        placeholder="Cari No. Surat, korban, NIK, lokasi gigitan, kronologi..."
                                        className="w-full pl-10 pr-9 py-2 border border-gray-200 rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all placeholder:text-gray-400"
                                    />
                                    {search && (
                                        <button
                                            type="button"
                                            onClick={() => setSearch("")}
                                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                                            title="Hapus pencarian"
                                        >
                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    )}
                                </div>

                                <div className="w-full sm:w-48 shrink-0">
                                    <Dropdown size="md" matchWidth>
                                        <Dropdown.Trigger>
                                            <button
                                                type="button"
                                                className="w-full flex items-center justify-between px-3 py-2 border border-gray-200 rounded-xl text-xs bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all cursor-pointer"
                                            >
                                                <span className="truncate">
                                                    {STATUS_VAR_OPTIONS[
                                                        statusVarFilter
                                                    ] || "Semua Status VAR"}
                                                </span>
                                                <svg
                                                    className="w-4 h-4 text-gray-400 shrink-0 ml-1.5"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M19 9l-7 7-7-7"
                                                    />
                                                </svg>
                                            </button>
                                        </Dropdown.Trigger>
                                        <Dropdown.Content
                                            align="left"
                                            matchWidth
                                            className="py-1"
                                        >
                                            {Object.entries(
                                                STATUS_VAR_OPTIONS,
                                            ).map(([val, label]) => (
                                                <Dropdown.Item
                                                    key={val}
                                                    onClick={() =>
                                                        handleFilterStatusVar(
                                                            val,
                                                        )
                                                    }
                                                    className={cn(
                                                        "text-xs py-2 px-3",
                                                        statusVarFilter ===
                                                            val &&
                                                            "bg-rose-50 font-bold text-rose-800",
                                                    )}
                                                >
                                                    {label}
                                                </Dropdown.Item>
                                            ))}
                                        </Dropdown.Content>
                                    </Dropdown>
                                </div>

                                <div className="w-full sm:w-48 shrink-0">
                                    <Dropdown size="md" matchWidth>
                                        <Dropdown.Trigger>
                                            <button
                                                type="button"
                                                className="w-full flex items-center justify-between px-3 py-2 border border-gray-200 rounded-xl text-xs bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all cursor-pointer"
                                            >
                                                <span className="truncate">
                                                    {STATUS_HEWAN_OPTIONS[
                                                        statusHewanFilter
                                                    ] || "Semua Status Hewan"}
                                                </span>
                                                <svg
                                                    className="w-4 h-4 text-gray-400 shrink-0 ml-1.5"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M19 9l-7 7-7-7"
                                                    />
                                                </svg>
                                            </button>
                                        </Dropdown.Trigger>
                                        <Dropdown.Content
                                            align="left"
                                            matchWidth
                                            className="py-1"
                                        >
                                            {Object.entries(
                                                STATUS_HEWAN_OPTIONS,
                                            ).map(([val, label]) => (
                                                <Dropdown.Item
                                                    key={val}
                                                    onClick={() =>
                                                        handleFilterStatusHewan(
                                                            val,
                                                        )
                                                    }
                                                    className={cn(
                                                        "text-xs py-2 px-3",
                                                        statusHewanFilter ===
                                                            val &&
                                                            "bg-rose-50 font-bold text-rose-800",
                                                    )}
                                                >
                                                    {label}
                                                </Dropdown.Item>
                                            ))}
                                        </Dropdown.Content>
                                    </Dropdown>
                                </div>
                            </div>

                            <div className="shrink-0 pt-2 lg:pt-0 border-t border-gray-100 lg:border-t-0">
                                <Link
                                    href="/admin/rabies/create"
                                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-rose-700 hover:bg-rose-800 active:bg-rose-900 text-white shadow-xs transition-colors cursor-pointer"
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
                                            strokeWidth={2.5}
                                            d="M12 4v16m8-8H4"
                                        />
                                    </svg>
                                    Catat Kasus GHPR
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto min-h-[350px]">
                        <table className="w-full min-w-[1050px] table-fixed text-left text-xs border-collapse border border-gray-200">
                            <thead>
                                <tr className="bg-gray-100/90 border-b border-gray-200 text-[11px] font-bold text-gray-700 uppercase tracking-wider text-center">
                                    <th className="py-3 px-3.5 border-r border-gray-200 w-14 text-center font-bold shrink-0">
                                        No.
                                    </th>
                                    <th className="py-3 px-3.5 border-r border-gray-200 w-44 text-center font-bold shrink-0">
                                        No. Surat &amp; Tanggal
                                    </th>
                                    <th className="py-3 px-3.5 border-r border-gray-200 w-44 text-center font-bold shrink-0">
                                        Data Korban
                                    </th>
                                    <th className="py-3 px-3.5 border-r border-gray-200 w-40 text-center font-bold shrink-0">
                                        Luka &amp; Status VAR
                                    </th>
                                    <th className="py-3 px-3.5 border-r border-gray-200 w-44 text-center font-bold shrink-0">
                                        Hewan Penular (HPR)
                                    </th>
                                    <th className="py-3 px-3.5 border-r border-gray-200 text-center font-bold">
                                        Status &amp; Kronologi
                                    </th>
                                    <th className="py-3 px-3.5 border-r border-gray-200 w-32 text-center font-bold shrink-0">
                                        Petugas
                                    </th>
                                    <th className="py-3 px-2 w-32 text-center font-bold shrink-0">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {cases.data.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={8}
                                            className="px-4 py-16 text-center"
                                        >
                                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-600 mb-3 border border-rose-100">
                                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                                </svg>
                                            </div>
                                            <h4 className="text-sm font-semibold text-gray-800">
                                                {search || statusVarFilter || statusHewanFilter ? 'Pencarian Tidak Ditemukan' : 'Belum Ada Data Kasus GHPR'}
                                            </h4>
                                            <p className="mt-1 text-xs text-gray-500 max-w-sm mx-auto">
                                                {search || statusVarFilter || statusHewanFilter ? (
                                                    <>
                                                        Tidak ada data kasus gigitan hewan yang cocok dengan kriteria pencarian Anda.
                                                    </>
                                                ) : (
                                                    'Belum ada data kasus gigitan hewan penular rabies terdaftar di sistem.'
                                                )}
                                            </p>
                                            {(search || statusVarFilter || statusHewanFilter) && (
                                                <button
                                                    type="button"
                                                    onClick={handleResetFilter}
                                                    className="mt-3.5 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors"
                                                >
                                                    Bersihkan Pencarian & Filter
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ) : (
                                    cases.data.map((item, index) => (
                                        <tr
                                            key={item.id}
                                            className="odd:bg-white even:bg-gray-50/70 hover:bg-rose-50/30 transition-colors h-[58px]"
                                        >
                                            <td className="py-3 px-3.5 border-r border-gray-200 text-center whitespace-nowrap font-medium text-gray-600 text-xs">
                                                {(cases.current_page - 1) * 5 +
                                                    index +
                                                    1}
                                            </td>

                                            <td className="py-3 px-3.5 border-r border-gray-200 text-center">
                                                <span className="font-mono font-bold text-xs text-rose-700 block leading-tight">
                                                    {item.no_surat}
                                                </span>
                                                <span className="text-[10.5px] text-gray-500 mt-0.5 block">
                                                    📅 {item.tgl_kejadian}
                                                </span>
                                            </td>

                                            <td className="py-3 px-3.5 border-r border-gray-200">
                                                <div className="flex items-center gap-1.5 min-w-0">
                                                    <span
                                                        className="font-bold text-xs text-gray-900 block truncate"
                                                        title={item.nama_pasien}
                                                    >
                                                        {item.nama_pasien}
                                                    </span>
                                                    <span className="text-[9.5px] px-1 py-0.2 rounded font-semibold bg-gray-100 text-gray-600 shrink-0">
                                                        {item.jenis_kelamin_pasien ===
                                                        "Laki-Laki"
                                                            ? "L"
                                                            : "P"}{" "}
                                                        • {item.umur_pasien}
                                                    </span>
                                                </div>
                                                <span className="text-[10px] text-gray-400 font-mono block w-full truncate mt-0.5">
                                                    NIK: {item.nik_pasien}
                                                </span>
                                            </td>

                                            <td className="py-3 px-3.5 border-r border-gray-200">
                                                <span
                                                    className="font-semibold text-xs text-gray-800 block w-full truncate"
                                                    title={item.lokasi_gigitan}
                                                >
                                                    {item.lokasi_gigitan}
                                                </span>
                                                <span
                                                    className={cn(
                                                        "text-[11px] font-semibold block w-full truncate mt-0.5",
                                                        item.status_var.includes(
                                                            "Belum",
                                                        )
                                                            ? "text-rose-600"
                                                            : "text-emerald-600",
                                                    )}
                                                >
                                                    {item.status_var}
                                                </span>
                                            </td>

                                            <td className="py-3 px-3.5 border-r border-gray-200">
                                                <span className="font-bold text-xs text-gray-900 block w-full truncate">
                                                    {item.jenis_hewan} (
                                                    {item.ras_hewan})
                                                </span>
                                                <span
                                                    className="text-[10.5px] text-gray-500 block w-full truncate mt-0.5"
                                                    title={
                                                        item.nama_pemilik_hewan
                                                    }
                                                >
                                                    Pemilik:{" "}
                                                    {item.nama_pemilik_hewan}
                                                </span>
                                            </td>

                                            <td className="py-3 px-3.5 border-r border-gray-200">
                                                <span
                                                    className={cn(
                                                        "text-[11px] font-semibold block w-full truncate mb-0.5",
                                                        item.status_hewan.includes(
                                                            "Mati",
                                                        )
                                                            ? "text-rose-600"
                                                            : item.status_hewan.includes(
                                                                    "Observasi",
                                                                )
                                                              ? "text-amber-600"
                                                              : "text-gray-700",
                                                    )}
                                                >
                                                    {item.status_hewan}
                                                </span>
                                                <p
                                                    className="text-[11px] text-gray-600 block w-full truncate leading-snug"
                                                    title={item.kronologi}
                                                >
                                                    {item.kronologi}
                                                </p>
                                            </td>

                                            <td className="py-3 px-3.5 border-r border-gray-200 text-center">
                                                <span
                                                    className="text-xs text-gray-700 font-medium block w-full truncate"
                                                    title={item.petugas}
                                                >
                                                    {item.petugas}
                                                </span>
                                                <span className="text-[10px] text-gray-400 block">
                                                    Petugas Loket
                                                </span>
                                            </td>

                                            <td className="py-2 px-2 text-center whitespace-nowrap">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            openDetailModal(
                                                                item,
                                                            )
                                                        }
                                                        className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 shadow-2xs transition-colors shrink-0 cursor-pointer"
                                                        title="Lihat Detail Rincian Kasus"
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
                                                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                            />
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth="2"
                                                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                                            />
                                                        </svg>
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handlePrintCase(
                                                                item,
                                                            )
                                                        }
                                                        className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 shadow-2xs transition-colors shrink-0 cursor-pointer"
                                                        title="Cetak Surat Penyelidikan GHPR (PDF)"
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
                                                                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                                                            />
                                                        </svg>
                                                    </button>

                                                    <Link
                                                        href={`/admin/rabies/${item.id}/edit`}
                                                        className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 shadow-2xs transition-colors shrink-0 cursor-pointer"
                                                        title="Ubah Laporan Kasus"
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
                                                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                                            />
                                                        </svg>
                                                    </Link>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            openDeleteModal(
                                                                item,
                                                            )
                                                        }
                                                        className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 shadow-2xs transition-colors shrink-0 cursor-pointer"
                                                        title="Hapus Laporan Kasus"
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
                                                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                            />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}

                                {emptyRowsCount > 0 &&
                                    Array.from({ length: emptyRowsCount }).map(
                                        (_, idx) => (
                                            <tr
                                                key={`filler-${idx}`}
                                                className="h-11 even:bg-gray-50/50"
                                            >
                                                <td className="py-2 px-3 border-r border-gray-200 text-transparent select-none">
                                                    -
                                                </td>
                                                <td className="py-2 px-3 border-r border-gray-200 text-transparent select-none">
                                                    -
                                                </td>
                                                <td className="py-2 px-3 border-r border-gray-200 text-transparent select-none">
                                                    -
                                                </td>
                                                <td className="py-2 px-3 border-r border-gray-200 text-transparent select-none">
                                                    -
                                                </td>
                                                <td className="py-2 px-3 border-r border-gray-200 text-transparent select-none">
                                                    -
                                                </td>
                                                <td className="py-2 px-3 border-r border-gray-200 text-transparent select-none">
                                                    -
                                                </td>
                                                <td className="py-2 px-3 border-r border-gray-200 text-transparent select-none">
                                                    -
                                                </td>
                                                <td className="py-2 px-2 text-transparent select-none">
                                                    -
                                                </td>
                                            </tr>
                                        ),
                                    )}
                            </tbody>
                        </table>
                    </div>

                    <div className="p-4 border-t border-gray-200 bg-gray-50/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-600">
                        <div>
                            Menampilkan{" "}
                            <span className="font-bold text-gray-900">
                                {cases.data.length}
                            </span>{" "}
                            dari{" "}
                            <span className="font-bold text-gray-900">
                                {cases.total}
                            </span>{" "}
                            total kasus GHPR (Maksimal 5 data per halaman)
                        </div>
                        {cases.last_page > 1 && (
                            <div>
                                <Pagination links={cases.links} />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Modal
                isOpen={detailModalOpen}
                onClose={() => setDetailModalOpen(false)}
                title={`Detail Kasus GHPR: ${selectedCase?.nama_pasien ?? ""} (${selectedCase?.no_surat ?? ""})`}
                size="full"
                className="max-w-7xl w-full"
            >
                {selectedCase && (
                    <div className="text-xs">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-3.5 items-stretch">
                            <div className="lg:col-span-4 p-3 rounded-xl border border-gray-200 bg-gray-50/70 flex flex-col justify-between space-y-2">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between border-b border-gray-200 pb-1.5 shrink-0">
                                        <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wider block">
                                            Kejadian &amp; Kronologi GHPR
                                        </span>
                                        <span className="font-mono font-bold text-rose-800 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded text-xs">
                                            {selectedCase.tgl_kejadian}
                                        </span>
                                    </div>

                                    <div>
                                        <span className="text-gray-400 text-[10px] block">
                                            Tempat Kejadian:
                                        </span>
                                        <span className="font-medium text-gray-800 block text-xs mt-0.5">
                                            📍 {selectedCase.alamat_kejadian}
                                        </span>
                                    </div>

                                    <div>
                                        <span className="text-gray-400 text-[10px] block mb-0.5">
                                            Kronologi Gigitan:
                                        </span>
                                        <div className="p-2.5 bg-white rounded-lg border border-gray-200 text-xs text-gray-800 leading-relaxed italic max-h-48 overflow-y-auto whitespace-pre-wrap">
                                            &quot;{selectedCase.kronologi}&quot;
                                        </div>
                                    </div>
                                </div>

                                <div className="p-2 bg-rose-50/70 border border-rose-200/80 rounded-lg text-[10.5px] text-rose-800 shrink-0">
                                    ⚠️ <strong>SOP Surveilans:</strong> Korban
                                    wajib memperoleh VAR lanjutan dan hewan
                                    penggigit diobservasi selama 14 hari penuh.
                                </div>
                            </div>

                            <div className="lg:col-span-4 flex flex-col justify-between space-y-2">
                                <div className="p-3 rounded-xl border border-gray-200 bg-gray-50/70 space-y-2">
                                    <div className="flex items-center justify-between border-b border-gray-200 pb-1.5 shrink-0">
                                        <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wider block">
                                            Identitas Korban Gigitan
                                        </span>
                                        <span className="font-mono font-bold text-rose-800 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded text-xs">
                                            {selectedCase.no_surat}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div>
                                            <span className="text-gray-400 text-[10px] block">
                                                Nama Korban:
                                            </span>
                                            <span className="font-bold text-gray-900 block truncate">
                                                {selectedCase.nama_pasien}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-gray-400 text-[10px] block">
                                                NIK Korban:
                                            </span>
                                            <span className="font-mono text-gray-800 block truncate">
                                                {selectedCase.nik_pasien}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-gray-400 text-[10px] block">
                                                Jenis Kelamin / Usia:
                                            </span>
                                            <span className="text-gray-700 block truncate">
                                                {
                                                    selectedCase.jenis_kelamin_pasien
                                                }{" "}
                                                • {selectedCase.umur_pasien}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-gray-400 text-[10px] block">
                                                Kontak WhatsApp:
                                            </span>
                                            <span className="font-mono text-gray-800 block truncate">
                                                {selectedCase.no_hp_pasien}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="pt-2 border-t border-gray-200 text-xs">
                                        <span className="text-gray-400 text-[10px] block">
                                            Alamat Domisili Korban:
                                        </span>
                                        <span
                                            className="text-[10.5px] text-gray-600 block mt-0.5"
                                            title={selectedCase.alamat_pasien}
                                        >
                                            📍 {selectedCase.alamat_pasien}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-3 rounded-xl border border-gray-200 bg-gray-50/70 space-y-2 flex-1 flex flex-col justify-between">
                                    <div className="flex items-center justify-between border-b border-gray-200 pb-1.5 shrink-0">
                                        <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wider">
                                            Luka &amp; Status Vaksinasi VAR
                                        </span>
                                        <span
                                            className={cn(
                                                "px-2 py-0.5 rounded-full text-[10.5px] font-bold",
                                                selectedCase.status_var.includes(
                                                    "Belum",
                                                )
                                                    ? "bg-rose-100 text-rose-800 border border-rose-300"
                                                    : "bg-emerald-100 text-emerald-800 border border-emerald-300",
                                            )}
                                        >
                                            {selectedCase.status_var}
                                        </span>
                                    </div>

                                    <div className="p-2.5 bg-white rounded-lg border border-gray-200 space-y-1">
                                        <span className="text-[10px] text-gray-400 block">
                                            Bagian Tubuh Tergigit:
                                        </span>
                                        <span className="font-extrabold text-gray-900 text-sm block">
                                            {selectedCase.lokasi_gigitan}
                                        </span>
                                    </div>

                                    <div className="text-[10.5px] text-gray-400 pt-0.5 shrink-0">
                                        Petugas Pelapor:{" "}
                                        <strong className="text-gray-700">
                                            {selectedCase.petugas}
                                        </strong>
                                    </div>
                                </div>
                            </div>

                            <div className="lg:col-span-4 flex flex-col justify-between space-y-2">
                                <div className="space-y-2 flex-1">
                                    <div className="p-2.5 rounded-xl border border-gray-200 bg-gray-50/70">
                                        <span className="text-[10.5px] font-bold text-gray-700 uppercase tracking-wider block mb-1">
                                            Identifikasi Hewan Penular (HPR)
                                        </span>
                                        <div className="p-2 bg-white rounded-lg border border-gray-200 text-xs space-y-1">
                                            <div>
                                                <span className="text-gray-400 text-[10px] block">
                                                    Jenis &amp; Ras:
                                                </span>
                                                <span className="font-bold text-gray-900">
                                                    {selectedCase.jenis_hewan} (
                                                    {selectedCase.ras_hewan})
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-1 pt-1 border-t border-gray-100">
                                                <div>
                                                    <span className="text-gray-400 text-[10px] block">
                                                        Kelamin / Usia:
                                                    </span>
                                                    <span className="text-gray-700">
                                                        {
                                                            selectedCase.jenis_kelamin_hewan
                                                        }{" "}
                                                        •{" "}
                                                        {
                                                            selectedCase.umur_hewan
                                                        }
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-400 text-[10px] block">
                                                        Status Pemilik:
                                                    </span>
                                                    <span className="text-gray-700 font-medium truncate block">
                                                        {
                                                            selectedCase.nama_pemilik_hewan
                                                        }
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-2.5 rounded-xl border border-gray-200 bg-gray-50/70">
                                        <span className="text-[10.5px] font-bold text-gray-700 uppercase tracking-wider block mb-1">
                                            Status Klinis &amp; Observasi Hewan
                                        </span>
                                        <div className="p-2 bg-white rounded-lg border border-gray-200 text-xs">
                                            <span
                                                className={cn(
                                                    "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold",
                                                    selectedCase.status_hewan.includes(
                                                        "Mati",
                                                    )
                                                        ? "bg-rose-100 text-rose-800 border border-rose-300"
                                                        : selectedCase.status_hewan.includes(
                                                                "Observasi",
                                                            )
                                                          ? "bg-amber-100 text-amber-800 border border-amber-300"
                                                          : "bg-emerald-100 text-emerald-800 border border-emerald-300",
                                                )}
                                            >
                                                <span
                                                    className={cn(
                                                        "w-1.5 h-1.5 rounded-full",
                                                        selectedCase.status_hewan.includes(
                                                            "Mati",
                                                        )
                                                            ? "bg-rose-600"
                                                            : selectedCase.status_hewan.includes(
                                                                    "Observasi",
                                                                )
                                                              ? "bg-amber-600"
                                                              : "bg-emerald-600",
                                                    )}
                                                />
                                                {selectedCase.status_hewan}
                                            </span>
                                            <p className="text-[10.5px] text-gray-500 mt-1 italic leading-snug">
                                                Hewan dipantau ketat selama 14
                                                hari sejak gigitan terjadi untuk
                                                mendeteksi gejala klinis
                                                patognomonik rabies.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-200 shrink-0">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            setDetailModalOpen(false)
                                        }
                                        className="px-3 py-1.5 text-xs cursor-pointer"
                                    >
                                        Tutup
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            handlePrintCase(selectedCase)
                                        }
                                        className="px-3 py-1.5 text-xs border-blue-300 text-blue-700 hover:bg-blue-50 cursor-pointer"
                                    >
                                        🖨️ Cetak Surat GHPR
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            <Modal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                title="Hapus Laporan Kasus GHPR"
                size="md"
            >
                {deletingCase && (
                    <div className="space-y-4">
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-900">
                            <div className="text-rose-600 shrink-0 mt-0.5">
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                    />
                                </svg>
                            </div>
                            <p className="leading-relaxed">
                                Apakah Anda yakin ingin menghapus data laporan
                                kasus rabies korban{" "}
                                <strong>{deletingCase.nama_pasien}</strong> (No.
                                Surat: {deletingCase.no_surat})? Tindakan ini
                                tidak dapat dibatalkan.
                            </p>
                        </div>

                        <div className="flex items-center justify-end gap-2.5 pt-2">
                            <Button
                                type="button"
                                variant="secondary"
                                size="md"
                                disabled={isSubmitting}
                                onClick={() => setDeleteModalOpen(false)}
                                className="h-9 px-4 text-xs font-semibold cursor-pointer"
                            >
                                Batal
                            </Button>
                            <Button
                                type="button"
                                variant="primary"
                                size="md"
                                disabled={isSubmitting}
                                onClick={executeDelete}
                                className="h-9 px-4 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-700 text-white cursor-pointer"
                            >
                                {isSubmitting
                                    ? "Menghapus..."
                                    : "Ya, Hapus Data"}
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </DashboardLayout>
    );
}
