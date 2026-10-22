import React, { useState, useEffect } from "react";
import { Button, Modal, useToast } from "@/components/ui";
import { cn } from "@/lib/utils";
import {
    printMedicalRecordCard,
    formatDateOnly,
    formatDoctorName,
} from "@/lib/printMedicalRecord";
import { HistoricalRecord, MedicalRecord } from "./types";

interface MedicalRecordSectionProps {
    initialCaptcha?: string;
}

/**
 * Komponen Pagination Riwayat Rekam Medis (Nomor Murni 1, 2, 3...)
 * Identik 100% dengan modul Riwayat Pasien Dokter
 */
function PatientHistoryPagination({
    records,
    activeIndex,
    onSelectIndex,
    title = "Riwayat Rekam Medis",
}: {
    records?: HistoricalRecord[];
    activeIndex: number;
    onSelectIndex: (idx: number) => void;
    title?: string;
}) {
    if (!records || records.length === 0) {
        return (
            <div className="h-full flex-1 flex flex-col justify-between">
                <div className="flex items-center justify-between border-b border-gray-200 pb-1.5 shrink-0">
                    <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wider">
                        {title}
                    </span>
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-500 border border-gray-200">
                        0 Kunjungan
                    </span>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-dashed border-gray-200 text-center my-2">
                    <span className="text-3xl mb-2">🐾</span>
                    <span className="font-bold text-gray-800 block text-xs">
                        Pasien Baru (Kunjungan Pertama)
                    </span>
                    <span className="text-[11px] text-gray-400 block mt-1 leading-relaxed max-w-[200px]">
                        Belum ada riwayat rekam medis terdahulu di sistem.
                    </span>
                </div>
                <div className="p-2 bg-purple-50/60 rounded-lg border border-purple-100 text-[10.5px] text-purple-800 shrink-0 text-center font-medium">
                    ℹ️ Pemeriksaan ini tercatat sebagai Kunjungan ke-1 pasien.
                </div>
            </div>
        );
    }

    const sortedRecords = [...records].reverse();
    const safeIndex = Math.min(
        Math.max(0, activeIndex),
        sortedRecords.length - 1,
    );
    const selectedRec = sortedRecords[safeIndex];

    return (
        <div className="h-full flex-1 flex flex-col">
            <div className="flex items-center justify-between gap-1.5 border-b border-gray-200 pb-2 shrink-0">
                <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wider truncate">
                        {title}
                    </span>
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-purple-100 text-purple-800 border border-purple-200 shrink-0">
                        {sortedRecords.length}x
                    </span>
                </div>

                <div className="flex items-center gap-1 shrink-0 overflow-x-auto scrollbar-none py-0.5">
                    <button
                        type="button"
                        disabled={safeIndex <= 0}
                        onClick={() => onSelectIndex(safeIndex - 1)}
                        className="w-6 h-6 rounded-md border border-gray-200 bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-25 disabled:cursor-not-allowed flex items-center justify-center text-xs font-bold cursor-pointer select-none transition-all"
                        title="Kunjungan Sebelumnya"
                    >
                        ‹
                    </button>

                    {sortedRecords.map((_, idx) => {
                        const isActive = safeIndex === idx;
                        return (
                            <button
                                key={idx}
                                type="button"
                                onClick={() => onSelectIndex(idx)}
                                className={cn(
                                    "w-6 h-6 text-xs font-bold rounded-md transition-all shrink-0 flex items-center justify-center cursor-pointer select-none",
                                    isActive
                                        ? "bg-purple-700 text-white shadow-xs ring-2 ring-purple-600/30"
                                        : "bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-900 border border-gray-200",
                                )}
                                title={`Kunjungan ${idx + 1}`}
                            >
                                {idx + 1}
                            </button>
                        );
                    })}

                    <button
                        type="button"
                        disabled={safeIndex >= sortedRecords.length - 1}
                        onClick={() => onSelectIndex(safeIndex + 1)}
                        className="w-6 h-6 rounded-md border border-gray-200 bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-25 disabled:cursor-not-allowed flex items-center justify-center text-xs font-bold cursor-pointer select-none transition-all"
                        title="Kunjungan Berikutnya"
                    >
                        ›
                    </button>
                </div>
            </div>

            {selectedRec && (
                <div className="flex-1 mt-2 p-2.5 bg-white rounded-xl border border-gray-200 shadow-xs space-y-2 text-xs">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-1.5 gap-2 shrink-0">
                        <div>
                            <span className="text-[10px] text-gray-400 block font-medium">
                                Kunjungan {safeIndex + 1}
                            </span>
                            <span className="font-bold text-gray-900 flex items-center gap-1 text-[11.5px]">
                                📅 {selectedRec.tgl_kunjungan}
                            </span>
                        </div>

                        <div className="flex items-center gap-1.5 pl-1.5 bg-gray-50 pr-2 py-0.5 rounded-lg border border-gray-100 shrink-0">
                            {selectedRec.dokter_foto ? (
                                <>
                                    <img
                                        src={selectedRec.dokter_foto}
                                        alt={selectedRec.dokter}
                                        className="w-6 h-6 rounded-full object-cover border border-purple-300 shadow-xs shrink-0"
                                        onError={(e) => {
                                            (
                                                e.currentTarget as HTMLElement
                                            ).style.display = "none";
                                            const fallback =
                                                e.currentTarget.parentElement?.querySelector(
                                                    ".fallback-doctor-avatar",
                                                ) as HTMLElement;
                                            if (fallback)
                                                fallback.style.display = "flex";
                                        }}
                                    />
                                    <div className="fallback-doctor-avatar hidden w-6 h-6 rounded-full bg-purple-100 text-purple-800 font-bold items-center justify-center text-[10px] shrink-0 border border-purple-200">
                                        🩺
                                    </div>
                                </>
                            ) : (
                                <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-800 font-bold flex items-center justify-center text-[10px] shrink-0 border border-purple-200">
                                    🩺
                                </div>
                            )}
                            <div className="text-right leading-tight max-w-[120px]">
                                <span className="font-bold text-gray-900 text-[10.5px] block truncate">
                                    {formatDoctorName(selectedRec.dokter)}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5 text-[10.5px] bg-gray-50 px-2 py-1 rounded-lg border border-gray-100 text-gray-700 shrink-0">
                        <span>
                            ⚖️ <strong>BB:</strong> {selectedRec.berat_badan} kg
                        </span>
                        <span className="text-gray-300">•</span>
                        <span>
                            🌡️ <strong>Suhu:</strong> {selectedRec.suhu_tubuh}{" "}
                            °C
                        </span>
                    </div>

                    <div>
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-0.5">
                            Keluhan Anamnesa:
                        </span>
                        <p className="text-[11px] text-gray-800 bg-gray-50/70 p-1.5 rounded-lg border border-gray-100 leading-snug italic line-clamp-3">
                            &quot;{selectedRec.anamnesa}&quot;
                        </p>
                    </div>

                    <div>
                        <span className="text-[10px] font-bold text-purple-800 uppercase tracking-wider block mb-0.5">
                            Diagnosa Klinis:
                        </span>
                        <p className="text-[11.5px] font-bold text-purple-950 bg-purple-50/70 p-1.5 rounded-lg border border-purple-200/80 leading-snug">
                            {selectedRec.diagnosa}
                        </p>
                    </div>

                    <div>
                        <span className="text-[10px] font-bold text-gray-700 uppercase tracking-wider block mb-0.5">
                            Terapi Tindakan &amp; Resep:
                        </span>
                        <div className="text-[11px] text-gray-800 bg-gray-50/70 p-1.5 rounded-lg border border-gray-100 leading-relaxed whitespace-pre-line font-medium line-clamp-2">
                            {selectedRec.terapi_pengobatan}
                        </div>
                    </div>

                    {selectedRec.catatan && selectedRec.catatan !== "-" && (
                        <div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">
                                Catatan Khusus:
                            </span>
                            <p className="text-[10.5px] text-gray-600 bg-amber-50/50 p-1.5 rounded-lg border border-amber-200/60 italic leading-snug">
                                {selectedRec.catatan}
                            </p>
                        </div>
                    )}

                    {sortedRecords.length > 1 && (
                        <div className="flex items-center justify-between pt-1 border-t border-gray-100 text-[10.5px] shrink-0">
                            <button
                                type="button"
                                disabled={safeIndex <= 0}
                                onClick={() => onSelectIndex(safeIndex - 1)}
                                className="px-2 py-0.5 rounded-md border border-gray-200 font-semibold text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
                            >
                                ‹ Kunjungan {safeIndex}
                            </button>
                            <span className="text-[10px] text-gray-400">
                                Kunjungan {safeIndex + 1} dari{" "}
                                {sortedRecords.length}
                            </span>
                            <button
                                type="button"
                                disabled={safeIndex >= sortedRecords.length - 1}
                                onClick={() => onSelectIndex(safeIndex + 1)}
                                className="px-2 py-0.5 rounded-md border border-gray-200 font-semibold text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
                            >
                                Kunjungan {safeIndex + 2} ›
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default function MedicalRecordSection({
    initialCaptcha,
}: MedicalRecordSectionProps) {
    const { success, error, info, warning } = useToast();

    const [nik, setNik] = useState<string>("");
    const [fullName, setFullName] = useState<string>("");
    const [captcha, setCaptcha] = useState<string>("");
    const [captchaSvg, setCaptchaSvg] = useState<string>(initialCaptcha || "");
    const [isRefreshingCaptcha, setIsRefreshingCaptcha] =
        useState<boolean>(false);
    const [isSearching, setIsSearching] = useState<boolean>(false);

    const [searchState, setSearchState] = useState<
        "idle" | "success" | "mismatch" | "empty" | "captcha_error"
    >("idle");
    const [feedbackMessage, setFeedbackMessage] = useState<string>("");
    const [matchedOwner, setMatchedOwner] = useState<{
        name: string;
        nik: string;
    } | null>(null);
    const [records, setRecords] = useState<MedicalRecord[]>([]);

    const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(
        null,
    );
    const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);
    const [activeDetailHistoryIndex, setActiveDetailHistoryIndex] =
        useState<number>(0);

    useEffect(() => {
        if (!captchaSvg) {
            refreshCaptcha();
        }
    }, []);

    const refreshCaptcha = async () => {
        setIsRefreshingCaptcha(true);
        try {
            const res = await fetch("/captcha/generate", {
                headers: {
                    Accept: "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                },
            });
            const data = await res.json();
            if (data.svg) {
                setCaptchaSvg(data.svg);
                setCaptcha("");
            }
        } catch (err) {
            console.error("Gagal memuat captcha:", err);
        } finally {
            setIsRefreshingCaptcha(false);
        }
    };

    const openDetailModal = (item: MedicalRecord) => {
        setSelectedRecord(item);
        setActiveDetailHistoryIndex(0);
        setIsDetailOpen(true);
    };

    const handleResetSearch = () => {
        setSearchState("idle");
        setRecords([]);
        setNik("");
        setFullName("");
        setCaptcha("");
        setFeedbackMessage("");
        setMatchedOwner(null);
        refreshCaptcha();
    };

    const handlePrint = (item: MedicalRecord) => {
        printMedicalRecordCard({
            id: item.id,
            no_rm: item.no_rm || "-",
            nama_hewan: item.nama_hewan || "-",
            jenis_hewan: item.jenis_hewan || "-",
            jenis_kelamin: item.jenis_kelamin || "-",
            umur: item.umur || "-",
            warna_hewan: item.warna_hewan || "-",
            pemilik: item.pemilik || "-",
            nik_pemilik: item.nik_pemilik || matchedOwner?.nik || "-",
            no_hp: item.no_hp || "-",
            alamat_pemilik: item.alamat_pemilik || "-",
            tgl_kunjungan: item.tgl_kunjungan || "-",
            berat_badan: item.berat_badan || 0,
            suhu_tubuh: item.suhu_tubuh || 0,
            anamnesa: item.anamnesa || "-",
            diagnosa: item.diagnosa || "-",
            terapi_pengobatan: item.terapi_pengobatan || "-",
            catatan: item.catatan || "-",
            dokter: item.dokter || "drh. Tim Medis Puskeswan",
            historical_records: item.historical_records || [],
        });
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();

        const cleanNik = nik.replace(/[^0-9]/g, "").trim();
        const cleanName = fullName.replace(/[^a-zA-Z\s]/g, "").trim();
        const cleanCaptcha = captcha
            .replace(/[^a-zA-Z0-9]/g, "")
            .trim()
            .toUpperCase();

        if (!cleanNik || cleanNik.length !== 16) {
            warning(
                "Nomor NIK harus berupa tepat 16 digit angka sesuai KTP!",
                "NIK Tidak Valid",
            );
            return;
        }

        if (!cleanName || cleanName.length < 2) {
            warning(
                "Nama Lengkap hanya boleh berupa huruf alfabet dan minimal 2 karakter!",
                "Nama Tidak Valid",
            );
            return;
        }

        if (!cleanCaptcha || cleanCaptcha.length !== 5) {
            warning(
                "Kode captcha anti-bot harus berupa 5 digit alfanumerik!",
                "Captcha Wajib 5 Digit",
            );
            return;
        }

        setIsSearching(true);
        setFeedbackMessage("");

        try {
            const csrfToken =
                document
                    .querySelector('meta[name="csrf-token"]')
                    ?.getAttribute("content") || "";

            const response = await fetch("/cek-rekam-medis/cari", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                    "X-CSRF-TOKEN": csrfToken,
                },
                body: JSON.stringify({
                    nik: cleanNik,
                    nama_lengkap: cleanName,
                    captcha: cleanCaptcha,
                }),
            });

            const result = await response.json();

            if (result.new_captcha) {
                setCaptchaSvg(result.new_captcha);
                setCaptcha("");
            }

            if (result.status === "captcha_error") {
                setSearchState("captcha_error");
                setFeedbackMessage(result.message);
                error(result.message, "Verifikasi Captcha Gagal");
                return;
            }

            if (result.status === "mismatch") {
                setSearchState("mismatch");
                setMatchedOwner(null);
                setRecords([]);
                setFeedbackMessage(result.message);
                error(result.message, "Data Tidak Ditemukan");
                return;
            }

            if (result.status === "empty") {
                setSearchState("empty");
                setMatchedOwner({
                    name: result.owner_name,
                    nik: result.nik,
                });
                setRecords([]);
                setFeedbackMessage(result.message);
                info(result.message, "Belum Ada Riwayat Selesai");
                return;
            }

            if (result.status === "success") {
                setSearchState("success");
                setMatchedOwner({
                    name: result.owner_name,
                    nik: result.nik,
                });
                setRecords(result.data || []);
                setFeedbackMessage(result.message);
                success(
                    `Berhasil menemukan ${result.total} rekam medis selesai untuk ${result.owner_name}.`,
                    "Data Ditemukan",
                );
            }
        } catch (err) {
            console.error("Kesalahan jaringan:", err);
            error(
                "Terjadi kesalahan saat menghubungi server. Silakan coba beberapa saat lagi.",
                "Gagal Menghubungi Server",
            );
        } finally {
            setIsSearching(false);
        }
    };

    const calculateVisitNumber = (record: MedicalRecord | null): number => {
        if (!record) return 1;
        const past = (record.historical_records || []).map((h) => ({
            id: h.id,
            tgl_kunjungan: h.tgl_kunjungan,
        }));
        const curr = {
            id: record.id || 0,
            tgl_kunjungan: record.tgl_kunjungan || "",
        };
        const all = [...past.filter((p) => p.id !== curr.id), curr];
        all.sort((a, b) => (a.id || 0) - (b.id || 0));
        const idx = all.findIndex((v) => v.id === curr.id);
        return idx >= 0 ? idx + 1 : 1;
    };

    return (
        <section
            id="cek-rekam-medis"
            className="relative flex min-h-[calc(100svh-4rem)] lg:min-h-[calc(100vh-4rem)] items-start pt-16 lg:pt-20 bg-white border-t border-gray-100 pb-16"
        >
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight">
                        Cek Riwayat{" "}
                        <span className="text-purple-700">Rekam Medis</span>{" "}
                        Pasien
                    </h2>
                    <p className="mt-3 text-xs sm:text-sm text-gray-600 leading-relaxed max-w-2xl mx-auto">
                        Masukkan 16 Digit NIK dan Nama Lengkap Pemilik yang
                        terdaftar untuk mengakses seluruh data rekam medis
                        pemeriksaan veteriner yang telah selesai diperiksa
                        secara transparan dan akurat.
                    </p>
                </div>

                <div className="max-w-4xl mx-auto mb-10">
                    <div className="bg-white rounded-2xl border border-purple-200/90 p-5 sm:p-7 shadow-lg shadow-purple-900/5">
                        <form onSubmit={handleSearch} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                                        Nomor Induk Kependudukan (NIK)
                                        <span className="text-rose-500 ml-1">
                                            *
                                        </span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            pattern="[0-9]*"
                                            maxLength={16}
                                            value={nik}
                                            onChange={(e) =>
                                                setNik(
                                                    e.target.value
                                                        .replace(/[^0-9]/g, "")
                                                        .slice(0, 16),
                                                )
                                            }
                                            placeholder="16 Digit NIK"
                                            required
                                            className="w-full h-11 sm:h-12 pl-10 pr-4 text-xs sm:text-sm rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent font-medium transition-all shadow-2xs"
                                        />
                                        <svg
                                            className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5 sm:top-4"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
                                            />
                                        </svg>
                                    </div>
                                    <span className="text-[10.5px] text-gray-400 mt-1 block">
                                        {nik.length}/16 digit angka murni
                                    </span>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                                        Nama Lengkap Pemilik
                                        <span className="text-rose-500 ml-1">
                                            *
                                        </span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={fullName}
                                            onChange={(e) =>
                                                setFullName(
                                                    e.target.value.replace(
                                                        /[^a-zA-Z\s]/g,
                                                        "",
                                                    ),
                                                )
                                            }
                                            placeholder="Nama Lengkap Sesuai KTP"
                                            required
                                            className="w-full h-11 sm:h-12 pl-10 pr-4 text-xs sm:text-sm rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent font-medium transition-all shadow-2xs"
                                        />
                                        <svg
                                            className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5 sm:top-4"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                            />
                                        </svg>
                                    </div>
                                    <span className="text-[10.5px] text-gray-400 mt-1 block">
                                        Hanya huruf alfabet dan spasi
                                    </span>
                                </div>
                            </div>

                            <div className="pt-2 border-t border-gray-100 flex flex-col md:flex-row items-stretch md:items-end justify-between gap-4">
                                <div className="flex-1 max-w-lg">
                                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                                        Captcha
                                        <span className="text-rose-500 ml-1">
                                            *
                                        </span>
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <div className="h-11 sm:h-12 bg-purple-50 rounded-xl border border-purple-200 overflow-hidden flex items-center justify-center shrink-0 shadow-2xs">
                                            {captchaSvg ? (
                                                <img
                                                    src={captchaSvg}
                                                    alt="Captcha Anti-Bot"
                                                    className="h-full w-auto select-none pointer-events-none"
                                                />
                                            ) : (
                                                <div className="px-4 text-xs text-gray-400 animate-pulse">
                                                    Memuat captcha...
                                                </div>
                                            )}
                                        </div>

                                        <button
                                            type="button"
                                            onClick={refreshCaptcha}
                                            disabled={isRefreshingCaptcha}
                                            className="h-11 sm:h-12 w-11 sm:w-12 rounded-xl border border-gray-200 bg-white hover:bg-gray-100 active:bg-gray-200 text-gray-600 flex items-center justify-center shrink-0 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
                                            title="Ganti Kode Captcha"
                                        >
                                            <svg
                                                className={`w-4 h-4 ${isRefreshingCaptcha ? "animate-spin text-purple-600" : ""}`}
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                                />
                                            </svg>
                                        </button>

                                        <div className="relative flex-1">
                                            <input
                                                type="text"
                                                maxLength={5}
                                                value={captcha}
                                                onChange={(e) =>
                                                    setCaptcha(
                                                        e.target.value
                                                            .replace(
                                                                /[^a-zA-Z0-9]/g,
                                                                "",
                                                            )
                                                            .toUpperCase()
                                                            .slice(0, 5),
                                                    )
                                                }
                                                placeholder="Masukkan Captcha"
                                                required
                                                className="w-full h-11 sm:h-12 px-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all shadow-2xs"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    size="md"
                                    variant="primary"
                                    isLoading={isSearching}
                                    className="h-11 sm:h-12 px-8 shadow-md shadow-purple-600/20 text-xs sm:text-sm font-bold whitespace-nowrap cursor-pointer md:w-auto w-full shrink-0"
                                >
                                    🔍 Cari Riwayat Rekam Medis
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>

                {searchState === "mismatch" && !isSearching && (
                    <div className="max-w-4xl mx-auto mb-10 animate-fadeIn">
                        <div className="rounded-2xl bg-rose-50/80 border border-rose-200 p-6 sm:p-7 text-rose-900 shadow-sm flex flex-col sm:flex-row items-start gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 text-2xl border border-rose-200 shadow-2xs">
                                ⚠️
                            </div>
                            <div className="space-y-2 flex-1">
                                <h3 className="text-base sm:text-lg font-bold text-rose-900 leading-tight">
                                    Kombinasi NIK dan Nama Lengkap Tidak Cocok
                                </h3>
                                <p className="text-xs sm:text-sm text-rose-800 leading-relaxed">
                                    {feedbackMessage ||
                                        "Kombinasi NIK dan Nama Lengkap tidak cocok atau tidak terdaftar dalam pangkalan data Puskeswan."}
                                </p>
                                <div className="mt-3 p-3 bg-white/80 rounded-xl border border-rose-200/80 text-xs text-rose-700 space-y-1">
                                    <span className="font-bold block text-rose-900">
                                        💡 Petunjuk Pengecekan:
                                    </span>
                                    <ul className="list-disc list-inside space-y-0.5 text-[11.5px] text-rose-800">
                                        <li>
                                            Pastikan nomor NIK terdiri dari
                                            tepat 16 digit angka sesuai KTP.
                                        </li>
                                        <li>
                                            Pastikan penulisan ejaan Nama
                                            Lengkap hanya berupa huruf sesuai
                                            data saat pendaftaran hewan pertama
                                            kali di Puskeswan.
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {searchState === "empty" && !isSearching && (
                    <div className="max-w-4xl mx-auto mb-10 animate-fadeIn">
                        <div className="rounded-2xl bg-blue-50/80 border border-blue-200 p-6 sm:p-7 text-blue-900 shadow-sm flex flex-col sm:flex-row items-start gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 text-2xl border border-blue-200 shadow-2xs">
                                📋
                            </div>
                            <div className="space-y-2 flex-1">
                                <h3 className="text-base sm:text-lg font-bold text-blue-900 leading-tight">
                                    Belum Ada Riwayat Rekam Medis yang Selesai
                                </h3>
                                <p className="text-xs sm:text-sm text-blue-800 leading-relaxed">
                                    {feedbackMessage ||
                                        "Data pemilik ditemukan, namun belum memiliki catatan rekam medis yang telah selesai diperiksa."}
                                </p>
                                <div className="mt-2 p-3 bg-white/80 rounded-xl border border-blue-200/80 text-xs text-blue-700">
                                    <p className="text-[11.5px] leading-relaxed">
                                        📌 <strong>Catatan:</strong> Jika hewan
                                        Anda baru saja didaftarkan, data rekam
                                        medis akan otomatis muncul di sini
                                        setelah dokter hewan menyelesaikan
                                        pemeriksaan klinis.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {searchState === "success" &&
                    records.length > 0 &&
                    !isSearching && (
                        <div className="max-w-7xl mx-auto space-y-4 animate-fadeIn">
                            <div className="bg-white rounded-2xl border border-gray-200/90 shadow-sm overflow-hidden">
                                <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-200 border-b border-gray-200 bg-white">
                                    <div className="p-3.5 sm:px-5 sm:py-3.5 flex items-center justify-between">
                                        <div>
                                            <span className="text-[10px] sm:text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                                                Pemilik Terverifikasi
                                            </span>
                                            <div className="flex items-baseline gap-1 mt-0.5">
                                                <span className="text-base sm:text-lg font-black text-purple-900 truncate max-w-[200px]">
                                                    {matchedOwner?.name}
                                                </span>
                                            </div>
                                        </div>
                                        <span className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center text-sm shrink-0 font-bold">
                                            👤
                                        </span>
                                    </div>

                                    <div className="p-3.5 sm:px-5 sm:py-3.5 flex items-center justify-between">
                                        <div>
                                            <span className="text-[10px] sm:text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                                                Nomor Induk Kependudukan (NIK)
                                            </span>
                                            <div className="flex items-baseline gap-1 mt-0.5">
                                                <span className="text-base sm:text-lg font-mono font-bold text-gray-800">
                                                    {matchedOwner?.nik}
                                                </span>
                                            </div>
                                        </div>
                                        <span className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-sm shrink-0">
                                            🛡️
                                        </span>
                                    </div>

                                    <div className="p-3.5 sm:px-5 sm:py-3.5 flex items-center justify-between">
                                        <div>
                                            <span className="text-[10px] sm:text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                                                Total Rekam Medis Selesai
                                            </span>
                                            <div className="flex items-baseline gap-1 mt-0.5">
                                                <span className="text-lg sm:text-xl font-black text-emerald-700">
                                                    {records.length}
                                                </span>
                                                <span className="text-[11px] font-semibold text-gray-500">
                                                    Pemeriksaan
                                                </span>
                                            </div>
                                        </div>
                                        <span className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm shrink-0">
                                            📋
                                        </span>
                                    </div>
                                </div>

                                <div className="px-5 py-3 bg-purple-50/60 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div className="flex items-center gap-2 text-xs font-semibold text-purple-900">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                                        <span>
                                            Menampilkan seluruh riwayat rekam
                                            medis selesai untuk pemilik{" "}
                                            <strong className="text-purple-950 font-bold">
                                                {matchedOwner?.name}
                                            </strong>
                                            .
                                        </span>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleResetSearch}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 bg-white hover:bg-rose-50 hover:border-rose-200 text-gray-600 hover:text-rose-600 font-semibold text-xs transition-all shadow-2xs cursor-pointer self-start sm:self-auto shrink-0"
                                        title="Bersihkan Hasil Pencarian"
                                    >
                                        <svg
                                            className="w-3.5 h-3.5 text-gray-400 hover:text-rose-500"
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
                                        <span>Bersihkan Hasil</span>
                                    </button>
                                </div>

                                <div className="w-full">
                                    <table className="w-full text-left border-collapse table-fixed">
                                        <thead>
                                            <tr className="bg-gray-100/80 border-b border-gray-200 text-[11px] font-bold text-gray-700 uppercase tracking-wider">
                                                <th className="py-2.5 px-2 border-r border-gray-200 w-10 text-center whitespace-nowrap">
                                                    No.
                                                </th>
                                                <th className="py-2.5 px-3 border-r border-gray-200 w-24 text-center whitespace-nowrap">
                                                    No. RM
                                                </th>
                                                <th className="py-2.5 px-3 border-r border-gray-200 w-28 text-center whitespace-nowrap">
                                                    Tanggal
                                                </th>
                                                <th className="py-2.5 px-3 border-r border-gray-200 w-44 whitespace-nowrap">
                                                    Pasien Hewan
                                                </th>
                                                <th className="py-2.5 px-3 border-r border-gray-200">
                                                    Diagnosa Klinis
                                                </th>
                                                <th className="py-2.5 px-3 border-r border-gray-200 w-48 whitespace-nowrap">
                                                    Dokter Pemeriksa
                                                </th>
                                                <th className="py-2.5 px-2 border-r border-gray-200 w-16 text-center whitespace-nowrap">
                                                    Status
                                                </th>
                                                <th className="py-2.5 px-2 w-24 text-center whitespace-nowrap">
                                                    Aksi Salinan
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 text-xs text-gray-800">
                                            {records.map((item, index) => (
                                                <tr
                                                    key={item.id || index}
                                                    className="h-12 even:bg-gray-50/50 hover:bg-purple-50/30 transition-colors"
                                                >
                                                    <td className="py-2 px-2 border-r border-gray-200 text-center whitespace-nowrap font-medium text-gray-500 text-xs">
                                                        {index + 1}
                                                    </td>

                                                    <td className="py-2 px-3 border-r border-gray-200 text-center whitespace-nowrap">
                                                        <span className="font-mono font-bold text-gray-900 text-xs">
                                                            {item.no_rm}
                                                        </span>
                                                    </td>

                                                    <td className="py-2 px-3 border-r border-gray-200 text-center whitespace-nowrap text-xs text-gray-800 font-semibold">
                                                        {formatDateOnly(
                                                            item.tgl_kunjungan,
                                                        )}
                                                    </td>

                                                    <td className="py-2 px-3 border-r border-gray-200 whitespace-nowrap">
                                                        <div className="font-bold text-gray-900 text-xs truncate max-w-[150px]">
                                                            {item.nama_hewan}
                                                        </div>
                                                        <span className="text-[11px] text-gray-500 block truncate max-w-[150px]">
                                                            {item.jenis_hewan}
                                                        </span>
                                                    </td>

                                                    <td className="py-2 px-3 border-r border-gray-200">
                                                        <span
                                                            className="text-gray-800 font-medium text-xs truncate block"
                                                            title={
                                                                item.diagnosa
                                                            }
                                                        >
                                                            {item.diagnosa}
                                                        </span>
                                                        {item.terapi_pengobatan && (
                                                            <span
                                                                className="text-gray-500 text-[11px] truncate block mt-0.5"
                                                                title={`Terapi: ${item.terapi_pengobatan}`}
                                                            >
                                                                Rx:{" "}
                                                                {
                                                                    item.terapi_pengobatan
                                                                }
                                                            </span>
                                                        )}
                                                    </td>

                                                    <td className="py-2 px-3 border-r border-gray-200 whitespace-nowrap">
                                                        <div className="flex items-center gap-2">
                                                            {item.dokter_foto ? (
                                                                <img
                                                                    src={
                                                                        item.dokter_foto
                                                                    }
                                                                    alt={
                                                                        item.dokter
                                                                    }
                                                                    className="w-6 h-6 rounded-full object-cover border border-purple-200 shrink-0"
                                                                />
                                                            ) : (
                                                                <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-[10px] shrink-0 border border-purple-200">
                                                                    🩺
                                                                </span>
                                                            )}
                                                            <span
                                                                className="font-semibold text-gray-800 text-xs truncate max-w-[130px]"
                                                                title={
                                                                    item.dokter
                                                                }
                                                            >
                                                                {formatDoctorName(
                                                                    item.dokter,
                                                                )}
                                                            </span>
                                                        </div>
                                                    </td>

                                                    <td className="py-2 px-2 border-r border-gray-200 text-center whitespace-nowrap">
                                                        <div className="flex items-center justify-center">
                                                            <span
                                                                className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-2xs"
                                                                title="Status: Selesai Diperiksa"
                                                            >
                                                                <svg
                                                                    className="w-3.5 h-3.5"
                                                                    fill="none"
                                                                    viewBox="0 0 24 24"
                                                                    stroke="currentColor"
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        strokeWidth="2.5"
                                                                        d="M5 13l4 4L19 7"
                                                                    />
                                                                </svg>
                                                            </span>
                                                        </div>
                                                    </td>

                                                    <td className="py-2 px-2 align-middle text-center whitespace-nowrap">
                                                        <div className="flex items-center justify-center gap-1.5">
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    openDetailModal(
                                                                        item,
                                                                    )
                                                                }
                                                                className="p-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 shadow-2xs transition-colors shrink-0 cursor-pointer"
                                                                title="Lihat Detail Lengkap Pasien"
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
                                                                    handlePrint(
                                                                        item,
                                                                    )
                                                                }
                                                                className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 shadow-2xs transition-colors shrink-0 cursor-pointer"
                                                                title="Cetak Salinan Kartu Rekam Medis (Format A4 Resmi)"
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
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
            </div>

            <Modal
                isOpen={isDetailOpen}
                onClose={() => setIsDetailOpen(false)}
                title={`Detail Pasien: ${selectedRecord?.nama_hewan ?? ""} (${selectedRecord?.no_rm ?? ""})`}
                size="full"
                className="max-w-7xl w-full"
            >
                {selectedRecord &&
                    (() => {
                        const visitNumber =
                            calculateVisitNumber(selectedRecord);

                        return (
                            <div className="text-xs">
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-3.5 items-stretch">
                                    <div className="lg:col-span-4 p-3 rounded-xl border border-gray-200 bg-gray-50/70 flex flex-col justify-between">
                                        <PatientHistoryPagination
                                            records={
                                                selectedRecord.historical_records
                                            }
                                            activeIndex={
                                                activeDetailHistoryIndex
                                            }
                                            onSelectIndex={
                                                setActiveDetailHistoryIndex
                                            }
                                            title="Riwayat Rekam Medis"
                                        />
                                    </div>

                                    <div className="lg:col-span-4 flex flex-col justify-between space-y-2">
                                        <div className="p-3 rounded-xl border border-gray-200 bg-gray-50/70 space-y-2">
                                            <div className="flex items-center justify-between border-b border-gray-200 pb-1.5 shrink-0">
                                                <div>
                                                    <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wider block">
                                                        Data Pasien &amp;
                                                        Pemilik
                                                    </span>
                                                    <span className="text-[10px] font-semibold text-purple-700 block mt-0.5">
                                                        📅 Tanggal:{" "}
                                                        {
                                                            selectedRecord.tgl_kunjungan
                                                        }{" "}
                                                        • Rekam Medis ke-
                                                        {visitNumber}
                                                    </span>
                                                </div>
                                                <span className="font-mono font-bold text-purple-800 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded text-xs">
                                                    {selectedRecord.no_rm}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-2 gap-x-2 gap-y-2.5 text-xs">
                                                <div className="min-w-0">
                                                    <span className="text-gray-400 text-[10px] block leading-tight">
                                                        Nama Pasien:
                                                    </span>
                                                    <span
                                                        className="font-bold text-gray-900 block truncate cursor-help hover:text-purple-700 transition-colors"
                                                        title={
                                                            selectedRecord.nama_hewan
                                                        }
                                                    >
                                                        {
                                                            selectedRecord.nama_hewan
                                                        }
                                                    </span>
                                                </div>

                                                <div className="min-w-0">
                                                    <span className="text-gray-400 text-[10px] block leading-tight">
                                                        Spesies / Kelamin:
                                                    </span>
                                                    <span
                                                        className="text-gray-700 block truncate cursor-help"
                                                        title={`${selectedRecord.jenis_hewan} (${selectedRecord.jenis_kelamin})`}
                                                    >
                                                        {
                                                            selectedRecord.jenis_hewan
                                                        }{" "}
                                                        (
                                                        {
                                                            selectedRecord.jenis_kelamin
                                                        }
                                                        )
                                                    </span>
                                                </div>

                                                <div className="min-w-0">
                                                    <span className="text-gray-400 text-[10px] block leading-tight">
                                                        Umur & Warna:
                                                    </span>
                                                    <span
                                                        className="text-gray-700 block truncate cursor-help"
                                                        title={`${selectedRecord.umur} • ${selectedRecord.warna_hewan}`}
                                                    >
                                                        {selectedRecord.umur} •{" "}
                                                        {
                                                            selectedRecord.warna_hewan
                                                        }
                                                    </span>
                                                </div>

                                                <div className="min-w-0">
                                                    <span className="text-gray-400 text-[10px] block leading-tight">
                                                        Nama Pemilik:
                                                    </span>
                                                    <div className="flex items-baseline gap-1 overflow-hidden">
                                                        <span
                                                            className="font-semibold text-gray-900 truncate cursor-help hover:text-purple-700 transition-colors"
                                                            title={
                                                                selectedRecord.pemilik
                                                            }
                                                        >
                                                            {
                                                                selectedRecord.pemilik
                                                            }
                                                        </span>
                                                        <span className="text-gray-400 text-[9px] shrink-0">
                                                            (
                                                            {
                                                                selectedRecord.nik_pemilik
                                                            }
                                                            )
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="col-span-2 flex items-center justify-between border-t border-gray-100 pt-2 mt-0.5 min-w-0 gap-2">
                                                    <div className="flex items-center gap-1.5 shrink-0">
                                                        <span className="text-[10px] text-gray-400">
                                                            WA:
                                                        </span>
                                                        <span className="font-mono text-gray-700">
                                                            {
                                                                selectedRecord.no_hp
                                                            }
                                                        </span>
                                                    </div>
                                                    <div
                                                        className="text-[10.5px] text-gray-500 truncate text-right cursor-help"
                                                        title={
                                                            selectedRecord.alamat_pemilik
                                                        }
                                                    >
                                                        📍{" "}
                                                        {
                                                            selectedRecord.alamat_pemilik
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-3 rounded-xl border border-gray-200 bg-gray-50/70 space-y-2 flex-1 flex flex-col justify-between">
                                            <div className="flex items-center justify-between border-b border-gray-200 pb-1.5 shrink-0">
                                                <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wider">
                                                    Triase &amp; Anamnesa Loket
                                                </span>
                                                <span className="text-[10.5px] text-gray-400">
                                                    {selectedRecord.jam_kunjungan ||
                                                        selectedRecord.waktu_selesai}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2 text-xs shrink-0">
                                                <div className="p-2 bg-white rounded-lg border border-gray-200 text-center">
                                                    <span className="text-[10px] text-gray-400 block">
                                                        Berat Badan:
                                                    </span>
                                                    <span className="font-extrabold text-gray-900 text-sm">
                                                        {
                                                            selectedRecord.berat_badan
                                                        }{" "}
                                                        <span className="text-[10px] font-normal">
                                                            kg
                                                        </span>
                                                    </span>
                                                </div>
                                                <div className="p-2 bg-white rounded-lg border border-gray-200 text-center">
                                                    <span className="text-[10px] text-gray-400 block">
                                                        Suhu Tubuh:
                                                    </span>
                                                    <span className="font-extrabold text-gray-900 text-sm">
                                                        {
                                                            selectedRecord.suhu_tubuh
                                                        }{" "}
                                                        <span className="text-[10px] font-normal">
                                                            °C
                                                        </span>
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex-1 my-1">
                                                <span className="text-gray-400 text-[10px] block mb-0.5">
                                                    Keluhan Awal (Anamnesa):
                                                </span>
                                                <p className="text-xs text-gray-800 bg-white p-2 rounded-lg border border-gray-200 leading-relaxed italic line-clamp-3">
                                                    &quot;
                                                    {selectedRecord.anamnesa}
                                                    &quot;
                                                </p>
                                            </div>

                                            <div className="text-[10.5px] text-gray-400 pt-0.5 shrink-0">
                                                Petugas Loket:{" "}
                                                <strong className="text-gray-700">
                                                    {selectedRecord.admin_petugas ||
                                                        "Admin Loket"}
                                                </strong>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="lg:col-span-4 flex flex-col justify-between space-y-2">
                                        <div className="space-y-2 flex-1">
                                            <div className="p-2.5 rounded-xl border border-gray-200 bg-gray-50/70">
                                                <span className="text-[10.5px] font-bold text-gray-700 uppercase tracking-wider block mb-1">
                                                    Diagnosa Klinis Dokter
                                                </span>
                                                <div className="p-2 bg-white rounded-lg border border-gray-200 text-xs text-gray-900 min-h-[38px]">
                                                    {selectedRecord.diagnosa || (
                                                        <span className="text-gray-400 italic">
                                                            Belum ada diagnosa
                                                            klinis
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="p-2.5 rounded-xl border border-gray-200 bg-gray-50/70">
                                                <span className="text-[10.5px] font-bold text-gray-700 uppercase tracking-wider block mb-1">
                                                    Terapi Pengobatan &amp;
                                                    Tindakan Medis
                                                </span>
                                                <div className="p-2 bg-white rounded-lg border border-gray-200 text-xs font-mono text-gray-800 leading-relaxed whitespace-pre-wrap">
                                                    {selectedRecord.terapi_pengobatan || (
                                                        <span className="text-gray-400 italic font-sans">
                                                            Belum ada terapi
                                                            tindakan medis
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="p-2.5 rounded-xl border border-gray-200 bg-gray-50/70">
                                                <span className="text-[10.5px] font-bold text-gray-700 uppercase tracking-wider block mb-0.5">
                                                    Catatan / Anjuran Khusus
                                                    Pemilik
                                                </span>
                                                <div className="p-2 bg-white rounded-lg border border-gray-200 text-xs text-gray-800 min-h-[32px]">
                                                    {selectedRecord.catatan &&
                                                    selectedRecord.catatan !==
                                                        "-" ? (
                                                        selectedRecord.catatan
                                                    ) : (
                                                        <span className="text-gray-400 italic">
                                                            Tidak ada catatan
                                                            anjuran khusus
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="p-2.5 rounded-xl border border-gray-200 bg-gray-50/70">
                                                <div className="grid grid-cols-2 gap-2 text-xs items-center">
                                                    <div>
                                                        <span className="text-[10px] text-gray-400 block mb-1">
                                                            Dokter Pemeriksa:
                                                        </span>
                                                        <div className="flex items-center gap-1.5 min-w-0">
                                                            {selectedRecord.dokter_foto ? (
                                                                <>
                                                                    <img
                                                                        src={
                                                                            selectedRecord.dokter_foto
                                                                        }
                                                                        alt={
                                                                            selectedRecord.dokter_nama ||
                                                                            selectedRecord.dokter
                                                                        }
                                                                        className="w-7 h-7 rounded-full object-cover border border-purple-300 shadow-xs shrink-0"
                                                                        onError={(
                                                                            e,
                                                                        ) => {
                                                                            (
                                                                                e.currentTarget as HTMLElement
                                                                            ).style.display =
                                                                                "none";
                                                                            const fallback =
                                                                                e.currentTarget.parentElement?.querySelector(
                                                                                    ".fallback-doctor-avatar",
                                                                                ) as HTMLElement;
                                                                            if (
                                                                                fallback
                                                                            )
                                                                                fallback.style.display =
                                                                                    "flex";
                                                                        }}
                                                                    />
                                                                    <div className="fallback-doctor-avatar hidden w-7 h-7 rounded-full bg-purple-100 text-purple-800 font-bold items-center justify-center text-xs shrink-0 border border-purple-200">
                                                                        🩺
                                                                    </div>
                                                                </>
                                                            ) : (
                                                                <div className="w-7 h-7 rounded-full bg-purple-100 text-purple-800 font-bold flex items-center justify-center text-xs shrink-0 border border-purple-200">
                                                                    🩺
                                                                </div>
                                                            )}
                                                            <div className="min-w-0">
                                                                <span className="font-bold text-gray-900 text-[11px] block truncate">
                                                                    {formatDoctorName(
                                                                        selectedRecord.dokter_nama ||
                                                                            selectedRecord.dokter,
                                                                    )}
                                                                </span>
                                                                <span className="text-[9.5px] text-purple-700 font-semibold block truncate">
                                                                    Medik
                                                                    Veteriner
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <span className="text-[10px] text-gray-400 block mb-1">
                                                            Status Pelayanan:
                                                        </span>
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                                                            Selesai Diperiksa
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-200 shrink-0">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    setIsDetailOpen(false)
                                                }
                                                className="px-3 py-1.5 text-xs cursor-pointer"
                                            >
                                                Tutup
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="primary"
                                                size="sm"
                                                onClick={() =>
                                                    handlePrint(selectedRecord)
                                                }
                                                className="px-3 py-1.5 text-xs bg-purple-700 hover:bg-purple-800 font-bold text-white cursor-pointer"
                                            >
                                                🖨️ Cetak Dokumen
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })()}
            </Modal>
        </section>
    );
}
