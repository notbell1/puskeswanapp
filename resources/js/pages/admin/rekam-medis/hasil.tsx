import React, { useState } from "react";
import { Head, router } from "@inertiajs/react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Button, Dropdown, Modal, Pagination } from "@/components/ui";
import { cn } from "@/lib/utils";
import {
    formatIndonesianDate,
    formatDoctorName,
} from "@/lib/printMedicalRecord";

interface HistoricalRecord {
    id: number;
    tgl_kunjungan: string;
    berat_badan: number;
    suhu_tubuh: number;
    anamnesa: string;
    diagnosa: string;
    terapi_pengobatan: string;
    catatan?: string;
    dokter: string;
    dokter_foto?: string | null;
}

interface MedicalRecordResultItem {
    id: number;
    id_examination?: number;
    no_rm: string;
    nama_hewan: string;
    id_jenis_hewan?: number;
    jenis_hewan: string;
    jenis_kelamin: string;
    umur: string;
    warna_hewan: string;
    pemilik: string;
    nik_pemilik: string;
    no_hp: string;
    alamat_pemilik: string;
    tgl_kunjungan: string;
    jam_kunjungan?: string;
    raw_tgl_kunjungan: string;
    berat_badan: number;
    suhu_tubuh: number;
    anamnesa: string;
    status_antrean: string;
    waktu_selesai: string;
    diagnosa: string;
    terapi_pengobatan: string;
    catatan: string;
    dokter: string;
    dokter_foto?: string | null;
    dokter_nip?: string;
    dokter_jabatan?: string;
    dokter_email?: string;
    admin_petugas: string;
    historical_records?: HistoricalRecord[];
}

interface AnimalTypeOption {
    id: number;
    nama_jenis: string;
}

interface PageProps {
    results: {
        data: MedicalRecordResultItem[];
        links: any[];
        current_page: number;
        last_page: number;
        from: number;
        to: number;
        total: number;
        per_page?: number;
    };
    animalTypes: AnimalTypeOption[];
    summary: {
        total_selesai: number;
        selesai_hari_ini: number;
        total_hewan_unik: number;
        total_hewan_besar: number;
    };
    filters: {
        search?: string;
        id_jenis_hewan?: string;
        tanggal?: string;
    };
}

/**
 * Komponen Track Record Kunjungan Pasien
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
                <div className="p-2 bg-emerald-50/60 rounded-lg border border-emerald-100 text-[10.5px] text-emerald-800 shrink-0 text-center">
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
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
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
                                        ? "bg-emerald-700 text-white shadow-xs ring-2 ring-emerald-600/30"
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
                                        className="w-6 h-6 rounded-full object-cover border border-emerald-300 shadow-xs shrink-0"
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
                                    <div className="fallback-doctor-avatar hidden w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold items-center justify-center text-[10px] shrink-0 border border-emerald-200">
                                        🩺
                                    </div>
                                </>
                            ) : (
                                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-[10px] shrink-0 border border-emerald-200">
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
                        <p className="text-[11px] text-gray-800 bg-gray-50/70 p-1.5 rounded-lg border border-gray-100 leading-snug italic line-clamp-2">
                            &quot;{selectedRec.anamnesa}&quot;
                        </p>
                    </div>

                    <div>
                        <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block mb-0.5">
                            Diagnosa Klinis:
                        </span>
                        <p className="text-[11.5px] font-bold text-emerald-950 bg-emerald-50/70 p-1.5 rounded-lg border border-emerald-200/80 leading-snug">
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
                            <p className="text-[10.5px] text-gray-600 bg-amber-50/50 p-1.5 rounded-lg border border-amber-200/60 italic leading-snug line-clamp-2">
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

export default function RekamMedisHasil({
    results,
    animalTypes = [],
    summary = {
        total_selesai: 0,
        selesai_hari_ini: 0,
        total_hewan_unik: 0,
        total_hewan_besar: 0,
    },
    filters = { search: "", id_jenis_hewan: "", tanggal: "" },
}: PageProps) {
    const [search, setSearch] = useState(filters.search || "");
    const [typeFilter, setTypeFilter] = useState(
        filters.id_jenis_hewan ? String(filters.id_jenis_hewan) : "",
    );
    const [dateFilter, setDateFilter] = useState(filters.tanggal || "");

    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] =
        useState<MedicalRecordResultItem | null>(null);
    const [activeDetailHistoryIndex, setActiveDetailHistoryIndex] = useState(0);

    const calculateVisitNumber = (
        record: MedicalRecordResultItem | null,
    ): number => {
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

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            "/admin/rekam-medis/hasil",
            {
                search: search || undefined,
                id_jenis_hewan: typeFilter || undefined,
                tanggal: dateFilter || undefined,
            },
            { preserveState: true, replace: true },
        );
    };

    const handleFilterType = (val: string) => {
        setTypeFilter(val);
        router.get(
            "/admin/rekam-medis/hasil",
            {
                search: search || undefined,
                id_jenis_hewan: val || undefined,
                tanggal: dateFilter || undefined,
            },
            { preserveState: true, replace: true },
        );
    };

    const handleResetFilter = () => {
        setSearch("");
        setTypeFilter("");
        setDateFilter("");
        router.get(
            "/admin/rekam-medis/hasil",
            {},
            { preserveState: true, replace: true },
        );
    };

    const openDetailModal = (item: MedicalRecordResultItem) => {
        setSelectedRecord(item);
        setActiveDetailHistoryIndex(0);
        setDetailModalOpen(true);
    };

    const handlePrintRecord = (item: MedicalRecordResultItem) => {
        setSelectedRecord(item);
        setTimeout(() => {
            window.print();
        }, 150);
    };

    const emptyRowsCount = Math.max(0, 5 - results.data.length);

    return (
        <DashboardLayout>
            <Head title="Hasil Rekam Medis" />

            <style>{`
                @media print {
                    @page {
                        size: A4 portrait;
                        margin: 0mm !important;
                    }
                    nav, header, aside, .no-print, button, form, footer {
                        display: none !important;
                    }
                    body {
                        background: white !important;
                        color: black !important;
                        font-family: 'Times New Roman', Times, serif !important;
                        margin: 0 !important;
                        padding: 0 !important;
                    }
                    .print-record-only {
                        display: block !important;
                        width: 210mm !important;
                        min-height: 297mm !important;
                        margin: 0 auto !important;
                        box-sizing: border-box !important;
                        padding: 12mm 15mm !important;
                        position: relative !important;
                    }
                    .content-wrapper {
                        margin-bottom: 25mm !important;
                    }
                    .signature-section {
                        position: absolute !important;
                        bottom: 12mm !important;
                        right: 15mm !important;
                    }
                }
                .print-record-only {
                    display: none;
                }
            `}</style>

            {selectedRecord &&
                (() => {
                    const pastVisits = (
                        selectedRecord.historical_records || []
                    ).map((h) => ({
                        id: h.id,
                        tgl_kunjungan: h.tgl_kunjungan,
                        berat_badan: h.berat_badan,
                        suhu_tubuh: h.suhu_tubuh,
                        anamnesa: h.anamnesa,
                        diagnosa: h.diagnosa,
                        terapi_pengobatan: h.terapi_pengobatan,
                    }));

                    const currentVisit = {
                        id: selectedRecord.id,
                        tgl_kunjungan: selectedRecord.tgl_kunjungan,
                        berat_badan: selectedRecord.berat_badan,
                        suhu_tubuh: selectedRecord.suhu_tubuh,
                        anamnesa: selectedRecord.anamnesa,
                        diagnosa: selectedRecord.diagnosa,
                        terapi_pengobatan: selectedRecord.terapi_pengobatan,
                    };

                    const allVisits = [
                        ...pastVisits.filter((p) => p.id !== currentVisit.id),
                        currentVisit,
                    ];
                    allVisits.sort((a, b) => (a.id || 0) - (b.id || 0));

                    const signatureDate = formatIndonesianDate(new Date());

                    return (
                        <div className="print-record-only max-w-4xl mx-auto bg-white font-serif text-black leading-relaxed">
                            <div className="content-wrapper">
                                <div className="flex items-center justify-between gap-3 pb-1">
                                    <div className="w-[80px] shrink-0 flex items-center justify-center">
                                        <img
                                            src="/images/logo-pariaman.png"
                                            alt="Logo Kota Pariaman"
                                            style={{
                                                height: "64px",
                                                width: "auto",
                                                maxWidth: "76px",
                                                objectFit: "contain",
                                            }}
                                        />
                                    </div>

                                    <div className="flex-1 text-center px-1">
                                        <h3 className="text-sm sm:text-base font-extrabold uppercase tracking-wide leading-tight text-black font-serif">
                                            DINAS PERTANIAN PANGAN DAN PERIKANAN
                                        </h3>
                                        <h2 className="text-base sm:text-lg font-black uppercase tracking-wide leading-tight text-black font-serif mt-0.5">
                                            UPT. PUSKESWAN &amp; INSEMINASI
                                            BUATAN
                                        </h2>
                                        <p className="text-[10px] font-medium leading-tight text-black font-serif mt-0.5">
                                            JL. SENTOT ALI BASA JATI MUDIK
                                            PARIAMAN TENGAH
                                        </p>
                                    </div>

                                    <div className="w-[80px] shrink-0 flex items-center justify-center">
                                        <img
                                            src="/images/logo-puskeswan.png"
                                            alt="Logo Puskeswan"
                                            style={{
                                                height: "64px",
                                                width: "auto",
                                                maxWidth: "76px",
                                                objectFit: "contain",
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="border-b-[3px] border-black mt-1 mb-0.5" />
                                <div className="border-b-[1px] border-black mb-3" />

                                <div className="flex items-center justify-between font-serif mb-2">
                                    <h1 className="text-sm font-bold uppercase tracking-wider underline">
                                        KARTU REKAM MEDIS PASIEN
                                    </h1>
                                    <div className="text-sm font-bold">
                                        <span>NO : </span>
                                        <span className="font-mono text-sm font-black">
                                            {selectedRecord.no_rm}
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs font-serif mb-2.5">
                                    <div className="space-y-1">
                                        <div className="flex items-baseline">
                                            <span className="w-16 shrink-0 font-semibold">
                                                Pemilik
                                            </span>
                                            <span className="mr-1.5">:</span>
                                            <span className="flex-1 border-b border-dotted border-gray-500 font-bold px-1">
                                                {selectedRecord.pemilik}
                                            </span>
                                        </div>
                                        <div className="flex items-start">
                                            <span className="w-16 shrink-0 font-semibold pt-0.5">
                                                Alamat
                                            </span>
                                            <span className="mr-1.5 pt-0.5">
                                                :
                                            </span>
                                            <div className="flex-1 border-b border-dotted border-gray-500 px-1 min-h-[16px] leading-snug break-words">
                                                {selectedRecord.alamat_pemilik ||
                                                    "-"}
                                            </div>
                                        </div>
                                        <div className="flex items-baseline">
                                            <span className="w-16 shrink-0 font-semibold">
                                                No. HP
                                            </span>
                                            <span className="mr-1.5">:</span>
                                            <span className="flex-1 border-b border-dotted border-gray-500 font-mono px-1">
                                                {selectedRecord.no_hp}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <div className="flex items-baseline">
                                            <span className="w-20 shrink-0 font-semibold">
                                                Nama Pasien
                                            </span>
                                            <span className="mr-1.5">:</span>
                                            <span className="flex-1 border-b border-dotted border-gray-500 font-bold px-1">
                                                {selectedRecord.nama_hewan}
                                            </span>
                                        </div>
                                        <div className="flex items-baseline">
                                            <span className="w-20 shrink-0 font-semibold">
                                                Spesies / Ras
                                            </span>
                                            <span className="mr-1.5">:</span>
                                            <span className="flex-1 border-b border-dotted border-gray-500 px-1">
                                                {selectedRecord.jenis_hewan}
                                            </span>
                                        </div>
                                        <div className="flex items-baseline">
                                            <span className="w-20 shrink-0 font-semibold">
                                                Kelamin / Umur
                                            </span>
                                            <span className="mr-1.5">:</span>
                                            <span className="flex-1 border-b border-dotted border-gray-500 px-1">
                                                {selectedRecord.jenis_kelamin} /{" "}
                                                {selectedRecord.umur}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <table className="w-full border-collapse border border-black font-serif text-[9.5pt]">
                                        <thead>
                                            <tr className="bg-gray-100/60 font-bold text-center">
                                                <th className="border border-black py-1 px-1.5 w-7 text-center">
                                                    NO
                                                </th>
                                                <th className="border border-black py-1 px-1.5 w-20 text-center">
                                                    TANGGAL
                                                </th>
                                                <th className="border border-black py-1 px-1.5 w-16 text-center">
                                                    BB/SUHU
                                                </th>
                                                <th className="border border-black py-1 px-1.5 text-center">
                                                    ANAMNESA
                                                </th>
                                                <th className="border border-black py-1 px-1.5 w-44 text-center">
                                                    DIAGNOSA
                                                </th>
                                                <th className="border border-black py-1 px-1.5 w-48 text-center">
                                                    TERAPI PENGOBATAN
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {allVisits.map((item, idx) => (
                                                <tr
                                                    key={idx}
                                                    className="align-top"
                                                >
                                                    <td className="border border-black py-1 px-1.5 text-center font-bold">
                                                        {idx + 1}
                                                    </td>
                                                    <td className="border border-black py-1 px-1.5 text-center whitespace-nowrap">
                                                        {item.tgl_kunjungan?.split(
                                                            " ",
                                                        )[0] ||
                                                            item.tgl_kunjungan}
                                                    </td>
                                                    <td className="border border-black py-1 px-1.5 text-center whitespace-nowrap">
                                                        <div>
                                                            {item.berat_badan ||
                                                                "-"}{" "}
                                                            kg
                                                        </div>
                                                        <div>
                                                            {item.suhu_tubuh ||
                                                                "-"}{" "}
                                                            °C
                                                        </div>
                                                    </td>
                                                    <td className="border border-black py-1 px-1.5 break-words leading-tight">
                                                        {(
                                                            item.anamnesa || "-"
                                                        ).trim()}
                                                    </td>
                                                    <td className="border border-black py-1 px-1.5 font-medium break-words leading-tight">
                                                        {(
                                                            item.diagnosa || "-"
                                                        ).trim()}
                                                    </td>
                                                    <td className="border border-black py-1 px-1.5 whitespace-pre-line break-words leading-tight">
                                                        {(
                                                            item.terapi_pengobatan ||
                                                            "-"
                                                        ).trim()}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="signature-section flex justify-end font-serif text-[9.5pt]">
                                <div className="text-center w-68">
                                    <p className="mb-0.5">
                                        Pariaman, {signatureDate}
                                    </p>
                                    <p className="font-semibold leading-tight">
                                        A.n Kepala UPTD Puskeswan dan IB
                                    </p>
                                    <p className="font-semibold leading-tight">
                                        Kota Pariaman
                                    </p>
                                    <div className="h-10" />
                                    <p className="font-bold underline text-sm">
                                        drh. Reni Gusnita
                                    </p>
                                    <p className="text-[9pt] mt-0.5">
                                        NIP. 19860826 201903 2 002
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })()}

            <div className="no-print">
                <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
                    <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-gray-200 border-b border-gray-200 bg-white">
                        <div className="p-3 sm:px-4 sm:py-3 flex items-center justify-between">
                            <div>
                                <span className="text-[10px] sm:text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                                    Total Selesai
                                </span>
                                <div className="flex items-baseline gap-1 mt-0.5">
                                    <span className="text-lg sm:text-xl font-black text-emerald-700">
                                        {summary.total_selesai}
                                    </span>
                                    <span className="text-[11px] font-semibold text-gray-500">
                                        Pasien
                                    </span>
                                </div>
                            </div>
                            <span className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm shrink-0">
                                📋
                            </span>
                        </div>

                        <div className="p-3 sm:px-4 sm:py-3 flex items-center justify-between">
                            <div>
                                <span className="text-[10px] sm:text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                                    Selesai Hari Ini
                                </span>
                                <div className="flex items-baseline gap-1 mt-0.5">
                                    <span className="text-lg sm:text-xl font-black text-blue-600">
                                        {summary.selesai_hari_ini}
                                    </span>
                                    <span className="text-[11px] font-semibold text-gray-500">
                                        Pasien
                                    </span>
                                </div>
                            </div>
                            <span className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-sm shrink-0">
                                🩺
                            </span>
                        </div>

                        <div className="p-3 sm:px-4 sm:py-3 flex items-center justify-between">
                            <div>
                                <span className="text-[10px] sm:text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                                    Hewan Unik
                                </span>
                                <div className="flex items-baseline gap-1 mt-0.5">
                                    <span className="text-lg sm:text-xl font-black text-purple-600">
                                        {summary.total_hewan_unik}
                                    </span>
                                    <span className="text-[11px] font-semibold text-gray-500">
                                        Ekor
                                    </span>
                                </div>
                            </div>
                            <span className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-sm shrink-0">
                                🐾
                            </span>
                        </div>

                        <div className="p-3 sm:px-4 sm:py-3 flex items-center justify-between">
                            <div>
                                <span className="text-[10px] sm:text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                                    Ternak / Ruminansia
                                </span>
                                <div className="flex items-baseline gap-1 mt-0.5">
                                    <span className="text-lg sm:text-xl font-black text-amber-600">
                                        {summary.total_hewan_besar}
                                    </span>
                                    <span className="text-[11px] font-semibold text-gray-500">
                                        Ekor
                                    </span>
                                </div>
                            </div>
                            <span className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-sm shrink-0">
                                🐄
                            </span>
                        </div>
                    </div>

                    <div className="p-4 sm:p-5 border-b border-gray-200 bg-gray-50/60">
                        <form
                            onSubmit={handleSearchSubmit}
                            className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3"
                        >
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
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Cari No. RM, pasien, pemilik, diagnosa, terapi, atau dokter..."
                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-gray-400"
                                />
                            </div>

                            <div className="w-full sm:w-44 shrink-0">
                                <input
                                    type="date"
                                    value={dateFilter}
                                    onChange={(e) => {
                                        setDateFilter(e.target.value);
                                        router.get(
                                            "/admin/rekam-medis/hasil",
                                            {
                                                search: search || undefined,
                                                id_jenis_hewan:
                                                    typeFilter || undefined,
                                                tanggal:
                                                    e.target.value || undefined,
                                            },
                                            {
                                                preserveState: true,
                                                replace: true,
                                            },
                                        );
                                    }}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                                />
                            </div>

                            <div className="w-full sm:w-52 shrink-0">
                                <Dropdown size="md" matchWidth>
                                    <Dropdown.Trigger>
                                        <button
                                            type="button"
                                            className="w-full flex items-center justify-between px-3 py-2 border border-gray-200 rounded-xl text-xs bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer"
                                        >
                                            <span className="truncate">
                                                {typeFilter
                                                    ? animalTypes.find(
                                                          (t) =>
                                                              String(t.id) ===
                                                              String(
                                                                  typeFilter,
                                                              ),
                                                      )?.nama_jenis ||
                                                      "Semua Spesies"
                                                    : "Semua Spesies Hewan"}
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
                                        <Dropdown.Item
                                            onClick={() => handleFilterType("")}
                                            className={cn(
                                                "text-xs py-2 px-3",
                                                typeFilter === "" &&
                                                    "bg-emerald-50 font-bold text-emerald-800",
                                            )}
                                        >
                                            Semua Spesies Hewan
                                        </Dropdown.Item>
                                        {animalTypes.map((t) => (
                                            <Dropdown.Item
                                                key={t.id}
                                                onClick={() =>
                                                    handleFilterType(
                                                        String(t.id),
                                                    )
                                                }
                                                className={cn(
                                                    "text-xs py-2 px-3",
                                                    String(typeFilter) ===
                                                        String(t.id) &&
                                                        "bg-emerald-50 font-bold text-emerald-800",
                                                )}
                                            >
                                                {t.nama_jenis}
                                            </Dropdown.Item>
                                        ))}
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                                <Button
                                    type="submit"
                                    variant="secondary"
                                    size="sm"
                                    className="px-4 py-2 text-xs font-semibold cursor-pointer border-gray-200"
                                >
                                    Cari
                                </Button>
                                {(search || typeFilter || dateFilter) && (
                                    <button
                                        type="button"
                                        onClick={handleResetFilter}
                                        className="px-3 py-2 text-xs text-gray-500 hover:text-gray-800 bg-white border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                                    >
                                        Reset
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[940px]">
                            <thead>
                                <tr className="bg-gray-100/80 border-b border-gray-200 text-[11px] font-bold text-gray-700 uppercase tracking-wider">
                                    <th className="py-2.5 px-3 border-r border-gray-200 w-12 text-center whitespace-nowrap">
                                        No.
                                    </th>
                                    <th className="py-2.5 px-3 border-r border-gray-200 w-28 whitespace-nowrap">
                                        No. RM
                                    </th>
                                    <th className="py-2.5 px-3 border-r border-gray-200 w-44 whitespace-nowrap">
                                        Tanggal
                                    </th>
                                    <th className="py-2.5 px-3 border-r border-gray-200 w-36 whitespace-nowrap">
                                        Pasien Hewan
                                    </th>
                                    <th className="py-2.5 px-3 border-r border-gray-200 w-36 whitespace-nowrap">
                                        Pemilik
                                    </th>
                                    <th className="py-2.5 px-3 border-r border-gray-200 whitespace-nowrap">
                                        Diagnosa Klinis
                                    </th>
                                    <th className="py-2.5 px-2 border-r border-gray-200 w-28 text-center whitespace-nowrap">
                                        Status
                                    </th>
                                    <th className="py-2.5 px-3 border-r border-gray-200 w-40 whitespace-nowrap">
                                        Dokter
                                    </th>
                                    <th className="py-2.5 px-2 w-24 text-center whitespace-nowrap">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {results.data.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={9}
                                            className="py-12 text-center text-xs text-gray-500"
                                        >
                                            <div className="flex flex-col items-center justify-center">
                                                <span className="text-3xl mb-2 text-gray-400">
                                                    🔍
                                                </span>
                                                <p className="font-semibold text-gray-700">
                                                    Tidak ada riwayat rekam
                                                    medis ditemukan
                                                </p>
                                                <p className="text-[11px] text-gray-400 mt-1">
                                                    Coba sesuaikan kata kunci
                                                    pencarian atau filter
                                                    tanggal Anda.
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    results.data.map((item, index) => (
                                        <tr
                                            key={item.id}
                                            className="h-11 even:bg-gray-50/50 hover:bg-emerald-50/30 transition-colors"
                                        >
                                            <td className="py-2 px-3 border-r border-gray-200 text-center whitespace-nowrap font-medium text-gray-500 text-xs">
                                                {(results.current_page - 1) *
                                                    5 +
                                                    index +
                                                    1}
                                            </td>

                                            <td className="py-2 px-3 border-r border-gray-200 whitespace-nowrap">
                                                <span className="font-mono font-bold text-gray-900 text-xs">
                                                    {item.no_rm}
                                                </span>
                                            </td>

                                            <td className="py-2 px-3 border-r border-gray-200 whitespace-nowrap text-xs text-gray-700">
                                                <span className="font-semibold text-gray-900">
                                                    {item.tgl_kunjungan?.split(
                                                        " ",
                                                    )[0] || item.tgl_kunjungan}
                                                </span>
                                                <span className="font-mono text-gray-500 text-[11px]">
                                                    {item.jam_kunjungan}
                                                </span>
                                            </td>

                                            <td className="py-2 px-3 border-r border-gray-200 whitespace-nowrap">
                                                <span
                                                    className="font-bold text-gray-900 text-xs truncate max-w-[130px] block"
                                                    title={item.nama_hewan}
                                                >
                                                    {item.nama_hewan}
                                                </span>
                                                <span className="text-[10.5px] text-gray-500 block">
                                                    {item.jenis_hewan}
                                                </span>
                                            </td>

                                            <td className="py-2 px-3 border-r border-gray-200 whitespace-nowrap">
                                                <span
                                                    className="font-medium text-gray-800 text-xs truncate max-w-[130px] block"
                                                    title={item.pemilik}
                                                >
                                                    {item.pemilik}
                                                </span>
                                                <span className="text-[10px] text-gray-400 font-mono block">
                                                    {item.no_hp}
                                                </span>
                                            </td>

                                            <td className="py-2 px-3 border-r border-gray-200">
                                                <span
                                                    className="text-gray-700 text-xs truncate block max-w-sm"
                                                    title={item.diagnosa}
                                                >
                                                    {item.diagnosa}
                                                </span>
                                                <span
                                                    className="text-[10.5px] text-gray-500 truncate block max-w-sm italic mt-0.5"
                                                    title={
                                                        item.terapi_pengobatan
                                                    }
                                                >
                                                    {item.terapi_pengobatan}
                                                </span>
                                            </td>

                                            <td className="py-2 px-2 border-r border-gray-200 text-center whitespace-nowrap">
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                                                    Selesai
                                                </span>
                                            </td>

                                            <td className="py-2 px-3 border-r border-gray-200 whitespace-nowrap">
                                                <div className="flex items-center gap-1.5 min-w-0">
                                                    {item.dokter_foto ? (
                                                        <img
                                                            src={
                                                                item.dokter_foto
                                                            }
                                                            alt={item.dokter}
                                                            className="w-5 h-5 rounded-full object-cover border border-emerald-300 shadow-2xs shrink-0"
                                                            onError={(e) => {
                                                                (
                                                                    e.currentTarget as HTMLElement
                                                                ).style.display =
                                                                    "none";
                                                            }}
                                                        />
                                                    ) : (
                                                        <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center justify-center shrink-0">
                                                            🩺
                                                        </span>
                                                    )}
                                                    <span
                                                        className="text-xs text-gray-800 font-medium truncate block max-w-[120px]"
                                                        title={formatDoctorName(
                                                            item.dokter,
                                                        )}
                                                    >
                                                        {formatDoctorName(
                                                            item.dokter,
                                                        )}
                                                    </span>
                                                </div>
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
                                                        title="Lihat Detail Pasien & Hasil Rekam Medis"
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
                                                            handlePrintRecord(
                                                                item,
                                                            )
                                                        }
                                                        className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 shadow-2xs transition-colors shrink-0 cursor-pointer"
                                                        title="Cetak Lembar Rekam Medis Pasien (PDF)"
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
                                                <td className="py-2 px-2 border-r border-gray-200 text-transparent select-none">
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
                                {results.data.length}
                            </span>{" "}
                            dari{" "}
                            <span className="font-bold text-gray-900">
                                {results.total}
                            </span>{" "}
                            total rekam medis (Maksimal 5 data per halaman)
                        </div>
                        {results.last_page > 1 && (
                            <div>
                                <Pagination links={results.links} />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Modal
                isOpen={detailModalOpen}
                onClose={() => setDetailModalOpen(false)}
                title={`Detail Pasien: ${selectedRecord?.nama_hewan ?? ""} (${selectedRecord?.no_rm ?? ""})`}
                size="full"
                className="max-w-7xl w-full"
            >
                {selectedRecord && (
                    <div className="text-xs">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-3.5 items-stretch">
                            <div className="lg:col-span-4 p-3 rounded-xl border border-gray-200 bg-gray-50/70 flex flex-col justify-between">
                                <PatientHistoryPagination
                                    records={selectedRecord.historical_records}
                                    activeIndex={activeDetailHistoryIndex}
                                    onSelectIndex={setActiveDetailHistoryIndex}
                                    title="Riwayat Rekam Medis"
                                />
                            </div>

                            <div className="lg:col-span-4 flex flex-col justify-between space-y-2">
                                <div className="p-3 rounded-xl border border-gray-200 bg-gray-50/70 space-y-2">
                                    <div className="flex items-center justify-between border-b border-gray-200 pb-1.5 shrink-0">
                                        <div>
                                            <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wider block">
                                                Data Pasien &amp; Pemilik
                                            </span>
                                            <span className="text-[10px] font-semibold text-emerald-700 block mt-0.5">
                                                📅 Tanggal:{" "}
                                                {selectedRecord.tgl_kunjungan?.split(
                                                    " ",
                                                )[0] ||
                                                    selectedRecord.tgl_kunjungan}{" "}
                                                • Rekam Medis ke-
                                                {calculateVisitNumber(
                                                    selectedRecord,
                                                )}
                                            </span>
                                        </div>
                                        <span className="font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-xs">
                                            {selectedRecord.no_rm}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div>
                                            <span className="text-gray-400 text-[10px] block">
                                                Nama Pasien:
                                            </span>
                                            <span className="font-bold text-gray-900 block truncate">
                                                {selectedRecord.nama_hewan}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-gray-400 text-[10px] block">
                                                Spesies / Kelamin:
                                            </span>
                                            <span className="text-gray-700 block truncate">
                                                {selectedRecord.jenis_hewan} (
                                                {selectedRecord.jenis_kelamin})
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
                                                {selectedRecord.warna_hewan}
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
                                                    {selectedRecord.pemilik}
                                                </span>
                                                <span className="text-gray-400 text-[9px] shrink-0">
                                                    (
                                                    {selectedRecord.nik_pemilik}
                                                    )
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-2 border-t border-gray-200 text-xs space-y-1 shrink-0">
                                        <div className="flex items-center justify-between text-[11px] text-gray-600">
                                            <span className="text-[10px] text-gray-400">
                                                Kontak WA:
                                            </span>
                                            <span className="font-mono">
                                                {selectedRecord.no_hp}
                                            </span>
                                        </div>
                                        <div
                                            className="text-[10.5px] text-gray-500 truncate"
                                            title={
                                                selectedRecord.alamat_pemilik
                                            }
                                        >
                                            📍 {selectedRecord.alamat_pemilik}
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
                                                {selectedRecord.berat_badan}{" "}
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
                                                {selectedRecord.suhu_tubuh}{" "}
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
                                            &quot;{selectedRecord.anamnesa}
                                            &quot;
                                        </p>
                                    </div>

                                    <div className="text-[10.5px] text-gray-400 pt-0.5 shrink-0">
                                        Petugas Loket:{" "}
                                        <strong className="text-gray-700">
                                            {selectedRecord.admin_petugas}
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
                                                    Belum ada diagnosa klinis
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="p-2.5 rounded-xl border border-gray-200 bg-gray-50/70">
                                        <span className="text-[10.5px] font-bold text-gray-700 uppercase tracking-wider block mb-1">
                                            Terapi Pengobatan &amp; Tindakan
                                            Medis
                                        </span>
                                        <div className="p-2 bg-white rounded-lg border border-gray-200 text-xs font-mono text-gray-800 leading-relaxed whitespace-pre-wrap">
                                            {selectedRecord.terapi_pengobatan || (
                                                <span className="text-gray-400 italic font-sans">
                                                    Belum ada terapi tindakan
                                                    medis
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="p-2.5 rounded-xl border border-gray-200 bg-gray-50/70">
                                        <span className="text-[10.5px] font-bold text-gray-700 uppercase tracking-wider block mb-0.5">
                                            Catatan / Anjuran Khusus Pemilik
                                        </span>
                                        <div className="p-2 bg-white rounded-lg border border-gray-200 text-xs text-gray-800 min-h-[32px]">
                                            {selectedRecord.catatan &&
                                            selectedRecord.catatan !== "-" ? (
                                                selectedRecord.catatan
                                            ) : (
                                                <span className="text-gray-400 italic">
                                                    Tidak ada catatan anjuran
                                                    khusus
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
                                                                    selectedRecord.dokter
                                                                }
                                                                className="w-7 h-7 rounded-full object-cover border border-emerald-300 shadow-xs shrink-0"
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
                                                            <div className="fallback-doctor-avatar hidden w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 font-bold items-center justify-center text-xs shrink-0 border border-emerald-200">
                                                                🩺
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs shrink-0 border border-emerald-200">
                                                            🩺
                                                        </div>
                                                    )}
                                                    <div className="min-w-0">
                                                        <span className="font-bold text-gray-900 text-[11px] block truncate">
                                                            {formatDoctorName(
                                                                selectedRecord.dokter,
                                                            )}
                                                        </span>
                                                        <span className="text-[9.5px] text-emerald-700 font-semibold block truncate">
                                                            {selectedRecord.dokter_jabatan ||
                                                                "Medik Veteriner"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                <span className="text-[10px] text-gray-400 block mb-1">
                                                    Status Pelayanan:
                                                </span>
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
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
                                            handlePrintRecord(selectedRecord)
                                        }
                                        className="px-3 py-1.5 text-xs border-blue-300 text-blue-700 hover:bg-blue-50 cursor-pointer"
                                    >
                                        🖨️ Cetak Dokumen
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </DashboardLayout>
    );
}
