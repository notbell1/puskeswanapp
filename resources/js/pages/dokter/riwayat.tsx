import React, { useState } from "react";
import { Head, router } from "@inertiajs/react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Button, Modal, Pagination, Select, useToast } from "@/components/ui";
import { cn } from "@/lib/utils";
import {
    printMedicalRecordCard,
    formatDateOnly,
    formatIndonesianDate,
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

interface MedicineItem {
    id: number;
    kode_obat: string;
    nama_obat: string;
    stok: number;
    satuan: string;
}

interface MedicalRecordItem {
    id: number;
    id_examination?: number;
    no_rm: string;
    nama_hewan: string;
    id_hewan?: number;
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
    waktu_lengkap?: string;
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
    dokter_nama?: string;
    dokter_foto: string | null;
    dokter_nip: string;
    dokter_jabatan: string;
    dokter_email: string;
    admin_petugas: string;
    has_examination?: boolean;
    historical_records?: HistoricalRecord[];
}

interface RiwayatProps {
    results: {
        data: MedicalRecordItem[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        links: any[];
    };
    medicines?: MedicineItem[];
    animalTypes: { id: number; nama_jenis: string }[];
    metrics: {
        total_selesai: number;
        selesai_hari_ini: number;
        total_hewan_unik: number;
    };
    filters: {
        search: string;
        id_jenis_hewan: string | number;
        tanggal: string;
    };
}

/**
 * Normalisasi gelar dokter agar tidak terjadi duplikasi seperti "drh. drh."
 */
function formatDoctorName(rawName?: string | null): string {
    if (!rawName) return "drh. Tim Medis Puskeswan";
    let clean = rawName.trim();
    clean = clean.replace(/^(drh\.\s*)+/gi, "");
    return `drh. ${clean}`;
}

const DOSIS_OPTIONS = [
    { value: "1x1 hari", label: "1x1 hari (1 kali sehari)" },
    { value: "2x1 hari", label: "2x1 hari (2 kali sehari)" },
    { value: "3x1 hari", label: "3x1 hari (3 kali sehari)" },
    { value: "1x2 hari", label: "1x2 hari (1 kali tiap 2 hari)" },
    { value: "1x3 hari", label: "1x3 hari (1 kali tiap 3 hari)" },
    { value: "2x2 hari", label: "2x2 hari (2 kali tiap 2 hari)" },
    { value: "Sesuai kebutuhan", label: "Sesuai kebutuhan (PRN)" },
    { value: "Oles 2x1 hari", label: "Oles 2x1 hari (Obat luar)" },
    { value: "Tetes 2x1 hari", label: "Tetes 2x1 hari (Tetes mata/telinga)" },
];

/**
 * Komponen Pagination Riwayat Rekam Medis (Nomor Murni 1, 2, 3...)
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
        <div className="h-full flex-1 flex flex-col overflow-hidden">
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
                <div className="flex-1 mt-2 p-2.5 bg-white rounded-xl border border-gray-200 shadow-xs space-y-2 text-xs overflow-y-auto">
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
                                        className="w-6 h-6 rounded-full object-cover object-center border border-emerald-300 shadow-xs shrink-0"
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
                        <p className="text-[11px] text-gray-800 bg-gray-50/70 p-1.5 rounded-lg border border-gray-100 leading-snug italic line-clamp-3">
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
                        <div className="text-[11px] text-gray-800 bg-gray-50/70 p-1.5 rounded-lg border border-gray-100 leading-relaxed whitespace-pre-line font-medium max-h-24 overflow-y-auto">
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

export default function DokterRiwayatPage({
    results,
    medicines = [],
    animalTypes = [],
    metrics = { total_selesai: 0, selesai_hari_ini: 0, total_hewan_unik: 0 },
    filters = { search: "", id_jenis_hewan: "", tanggal: "" },
}: RiwayatProps) {
    const { success, error, warning, info, blue, deleted } = useToast();

    const [search, setSearch] = useState(filters.search || "");
    const [idJenisHewan, setIdJenisHewan] = useState(
        filters.id_jenis_hewan ? String(filters.id_jenis_hewan) : "",
    );
    const [tanggal, setTanggal] = useState(filters.tanggal || "");

    const [selectedRecord, setSelectedRecord] =
        useState<MedicalRecordItem | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [activeDetailHistoryIndex, setActiveDetailHistoryIndex] = useState(0);

    const [isExamModalOpen, setIsExamModalOpen] = useState(false);
    const [examRecord, setExamRecord] = useState<MedicalRecordItem | null>(
        null,
    );
    const [activeExamHistoryIndex, setActiveExamHistoryIndex] = useState(0);

    const calculateVisitNumber = (record: MedicalRecordItem | null): number => {
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
    const [examDiagnosa, setExamDiagnosa] = useState("");
    const [examTerapi, setExamTerapi] = useState("");
    const [examCatatan, setExamCatatan] = useState("");
    const [examErrors, setExamErrors] = useState<{
        diagnosa?: string;
        terapi_pengobatan?: string;
    }>({});
    const [isSavingExam, setIsSavingExam] = useState(false);
    const [isConfirmSaveModalOpen, setIsConfirmSaveModalOpen] = useState(false);

    const [selectedMedId, setSelectedMedId] = useState("");
    const [medJumlah, setMedJumlah] = useState("1");
    const [medDosis, setMedDosis] = useState("1x1 hari");

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deletingRecord, setDeletingRecord] =
        useState<MedicalRecordItem | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleFilterChange = (newFilters: {
        search?: string;
        id_jenis_hewan?: string;
        tanggal?: string;
    }) => {
        router.get(
            "/dokter/riwayat",
            {
                search:
                    newFilters.search !== undefined
                        ? newFilters.search
                        : search,
                id_jenis_hewan:
                    newFilters.id_jenis_hewan !== undefined
                        ? newFilters.id_jenis_hewan
                        : idJenisHewan,
                tanggal:
                    newFilters.tanggal !== undefined
                        ? newFilters.tanggal
                        : tanggal,
            },
            { preserveState: true, preserveScroll: true },
        );
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleFilterChange({ search });
    };

    const handleTypeSelect = (val: string) => {
        setIdJenisHewan(val);
        handleFilterChange({ id_jenis_hewan: val });
    };

    const handleTanggalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setTanggal(val);
        handleFilterChange({ tanggal: val });
    };

    const handleResetFilter = () => {
        setSearch("");
        setIdJenisHewan("");
        setTanggal("");
        router.get(
            "/dokter/riwayat",
            {},
            { preserveState: true, preserveScroll: true },
        );
    };

    const openDetailModal = (item: MedicalRecordItem) => {
        setSelectedRecord(item);
        setActiveDetailHistoryIndex(0);
        setIsDetailOpen(true);
    };

    const openEditModal = (item: MedicalRecordItem) => {
        setExamRecord(item);
        setActiveExamHistoryIndex(0);
        setExamDiagnosa(item.diagnosa || "");
        setExamTerapi(item.terapi_pengobatan || "");
        setExamCatatan(item.catatan || "");
        setExamErrors({});
        setSelectedMedId("");
        setMedJumlah("1");
        setMedDosis("1x1 hari");
        setIsExamModalOpen(true);
    };

    const handlePrint = (item: MedicalRecordItem) => {
        setSelectedRecord(item);
        printMedicalRecordCard(item);
    };

    const handleAppendMedicine = () => {
        if (!selectedMedId) {
            warning(
                "Silakan pilih obat dari apotek Puskeswan terlebih dahulu.",
                "Pilih Obat",
            );
            return;
        }

        const med = medicines.find((m) => String(m.id) === selectedMedId);
        if (!med) return;

        if ((med.stok ?? 0) <= 0) {
            error(
                `Stok obat ${med.nama_obat} sedang habis di apotek Puskeswan.`,
                "Stok Habis",
            );
            return;
        }

        const snippet = `${med.nama_obat} (${medJumlah} ${med.satuan}, aturan: ${medDosis})`;
        const currentTerapi = examTerapi.trim();
        const updated = currentTerapi
            ? `${currentTerapi}\n• ${snippet}`
            : `• ${snippet}`;

        setExamTerapi(updated);
        success(
            `${med.nama_obat} berhasil ditambahkan ke terapi pengobatan.`,
            "Resep Ditambahkan",
        );

        setSelectedMedId("");
        setMedJumlah("1");
        setMedDosis("1x1 hari");
    };

    const handleRequestSaveExamination = (e: React.FormEvent) => {
        e.preventDefault();
        if (!examRecord) return;

        const newErrors: { diagnosa?: string; terapi_pengobatan?: string } = {};
        if (!examDiagnosa.trim()) {
            newErrors.diagnosa = "Diagnosa klinis dokter wajib diisi.";
        }
        if (!examTerapi.trim()) {
            newErrors.terapi_pengobatan =
                "Terapi pengobatan dan tindakan medis wajib diisi.";
        }

        if (Object.keys(newErrors).length > 0) {
            setExamErrors(newErrors);
            error(
                "Mohon lengkapi diagnosa klinis dan terapi pengobatan terlebih dahulu.",
                "Validasi Gagal",
            );
            return;
        }

        setIsConfirmSaveModalOpen(true);
    };

    const executeSubmitExamination = () => {
        if (!examRecord || isSavingExam) return;

        setIsSavingExam(true);
        const targetNama = examRecord.nama_hewan;
        const targetNoRm = examRecord.no_rm;

        router.post(
            `/dokter/pemeriksaan/${examRecord.id}`,
            {
                diagnosa: examDiagnosa,
                terapi_pengobatan: examTerapi,
                catatan: examCatatan,
                redirect_to: "riwayat",
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setIsConfirmSaveModalOpen(false);
                    setIsExamModalOpen(false);
                    setExamRecord(null);
                    setIsSavingExam(false);
                    blue(
                        `Perubahan rekam medis untuk ${targetNama} (${targetNoRm}) berhasil disimpan.`,
                        "Data Berhasil Diperbarui",
                    );
                },
                onError: (errs) => {
                    setIsConfirmSaveModalOpen(false);
                    setIsSavingExam(false);
                    error(
                        "Terjadi kendala saat menyimpan rekam medis. Periksa isian formulir.",
                        "Gagal Menyimpan",
                    );
                    setExamErrors(errs as any);
                },
            },
        );
    };

    const openDeleteModal = (item: MedicalRecordItem) => {
        setDeletingRecord(item);
        setDeleteModalOpen(true);
    };

    const executeDeleteRecord = () => {
        if (!deletingRecord || isDeleting) return;
        setIsDeleting(true);

        router.delete(`/dokter/antrian/${deletingRecord.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                const nama = deletingRecord.nama_hewan;
                const noRm = deletingRecord.no_rm;
                setDeleteModalOpen(false);
                setDeletingRecord(null);
                setIsDeleting(false);
                deleted(
                    `Data rekam medis pasien ${nama} (${noRm}) berhasil dihapus dari sistem.`,
                    "Data Dihapus",
                );
            },
            onError: () => {
                setIsDeleting(false);
                error(
                    "Terjadi kesalahan saat menghapus data rekam medis.",
                    "Gagal",
                );
            },
        });
    };

    const dataCount = results.data.length;
    const emptyRowsCount = Math.max(0, 5 - dataCount);

    const animalTypeOptions = [
        { value: "", label: "Semua Jenis Hewan" },
        ...animalTypes.map((t) => ({
            value: String(t.id),
            label: t.nama_jenis,
        })),
    ];

    const medicineOptions = [
        { value: "", label: "-- Pilih Obat Apotek Puskeswan --" },
        ...medicines.map((m) => {
            const isOutOfStock = (m.stok ?? 0) <= 0;
            return {
                value: String(m.id),
                label: isOutOfStock
                    ? `${m.nama_obat} (Stok Habis)`
                    : m.nama_obat,
                disabled: isOutOfStock,
                className: isOutOfStock
                    ? "text-rose-600 bg-rose-50/70 hover:bg-rose-50/70 cursor-not-allowed font-semibold"
                    : "",
                labelClassName: isOutOfStock
                    ? "text-rose-600 font-semibold"
                    : "",
            };
        }),
    ];

    return (
        <DashboardLayout title="Riwayat Pemeriksaan Dokter">
            <Head title="Riwayat Pemeriksaan" />

            <style>{`
                @media print {
                    @page {
                        size: A4 portrait;
                        margin: 0mm !important; /* Wajib 0 agar TIDAK ADA teks header seperti about:blank atau waktu di atas kertas */
                    }
                    nav, header, aside, .no-print, button, form {
                        display: none !important;
                    }
                    body {
                        background: white !important;
                        color: black !important;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                        margin: 0 !important;
                        padding: 0 !important;
                    }
                    .print-record-only {
                        display: flex !important;
                        flex-direction: column !important;
                        justify-content: space-between !important;
                        box-sizing: border-box !important;
                        width: 100% !important;
                        max-width: 210mm !important;
                        min-height: 270mm !important;
                        margin: 0 auto !important;
                        padding: 10mm 15mm 15mm 15mm !important; /* Margin fisik resmi pada kertas A4 */
                    }
                    .content-wrapper {
                        flex: 1 0 auto;
                        width: 100%;
                    }
                    .signature-section {
                        flex-shrink: 0;
                        margin-top: auto !important;
                        padding-top: 14px !important;
                        break-inside: avoid !important;
                        page-break-inside: avoid !important;
                    }
                    table {
                        page-break-inside: auto;
                    }
                    thead {
                        display: table-header-group;
                    }
                    tr {
                        page-break-inside: avoid;
                        break-inside: avoid;
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

                    const signatureDate = formatIndonesianDate(new Date()); // Tanggal cetak adalah tanggal saat ini

                    return (
                        <div className="print-record-only max-w-4xl mx-auto bg-white font-serif text-black leading-relaxed">
                            <div className="content-wrapper">
                                <div className="flex items-center justify-between gap-3 pb-1">
                                    <div className="w-[80px] shrink-0 flex items-center justify-center">
                                        <img
                                            src="/images/logo-pariaman.webp"
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
                                        <p className="text-[10px] font-semibold uppercase leading-tight text-black font-serif">
                                            KOTA PARIAMAN
                                        </p>
                                        <p className="text-[9px] text-gray-800 font-serif mt-0.5">
                                            Email: puskeswanpariaman1@gmail.com
                                            | Kode Pos: 25516
                                        </p>
                                    </div>

                                    <div className="w-[80px] shrink-0 flex items-center justify-center">
                                        <img
                                            src="/images/logo-pdhi.webp"
                                            alt="Logo PDHI"
                                            style={{
                                                height: "64px",
                                                width: "auto",
                                                maxWidth: "76px",
                                                objectFit: "contain",
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="border-b-[2.5px] border-black mt-1 mb-0.5" />
                                <div className="border-b border-black mb-2" />

                                <div className="flex items-end justify-between mb-2 font-serif">
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
                                            <span className="w-24 shrink-0 font-semibold">
                                                Jenis Hewan
                                            </span>
                                            <span className="mr-1.5">:</span>
                                            <span className="flex-1 border-b border-dotted border-gray-500 font-bold px-1">
                                                {selectedRecord.jenis_hewan}
                                            </span>
                                        </div>
                                        <div className="flex items-baseline">
                                            <span className="w-24 shrink-0 font-semibold">
                                                Nama Hewan
                                            </span>
                                            <span className="mr-1.5">:</span>
                                            <span className="flex-1 border-b border-dotted border-gray-500 font-bold px-1">
                                                {selectedRecord.nama_hewan}
                                            </span>
                                        </div>
                                        <div className="flex items-baseline">
                                            <span className="w-24 shrink-0 font-semibold">
                                                Sex/Umur/Warna
                                            </span>
                                            <span className="mr-1.5">:</span>
                                            <span className="flex-1 border-b border-dotted border-gray-500 px-1">
                                                {selectedRecord.jenis_kelamin} /{" "}
                                                {selectedRecord.umur} /{" "}
                                                {selectedRecord.warna_hewan}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-2">
                                    <table className="w-full text-[9pt] font-serif border-collapse border border-black table-fixed">
                                        <thead>
                                            <tr className="bg-gray-100 font-bold uppercase text-center border-b border-black">
                                                <th className="border border-black py-1 px-1 w-[14%]">
                                                    TANGGAL
                                                </th>
                                                <th className="border border-black py-1 px-1 w-[14%]">
                                                    BB/SUHU
                                                </th>
                                                <th className="border border-black py-1 px-1.5 w-[24%]">
                                                    ANAMNESA
                                                </th>
                                                <th className="border border-black py-1 px-1.5 w-[24%]">
                                                    DIAGNOSA
                                                </th>
                                                <th className="border border-black py-1 px-1.5 w-[24%]">
                                                    TERAPI
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {allVisits.map((item, idx) => (
                                                <tr
                                                    key={item.id || idx}
                                                    className="align-top"
                                                >
                                                    <td className="border border-black py-1 px-1 text-center whitespace-nowrap">
                                                        {formatDateOnly(
                                                            item.tgl_kunjungan,
                                                        )}
                                                    </td>
                                                    <td className="border border-black py-1 px-1 text-center whitespace-nowrap">
                                                        {item.berat_badan} kg /{" "}
                                                        {item.suhu_tubuh}&deg;C
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
                    <div className="grid grid-cols-3 divide-x divide-gray-200 border-b border-gray-200 bg-white">
                        <div className="p-3 sm:px-4 sm:py-3 flex items-center justify-between">
                            <div>
                                <span className="text-[10px] sm:text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                                    Total Pasien Selesai
                                </span>
                                <div className="flex items-baseline gap-1 mt-0.5">
                                    <span className="text-lg sm:text-xl font-black text-emerald-700">
                                        {metrics.total_selesai}
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
                                        {metrics.selesai_hari_ini}
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
                                    Pasien Hewan Unik
                                </span>
                                <div className="flex items-baseline gap-1 mt-0.5">
                                    <span className="text-lg sm:text-xl font-black text-purple-600">
                                        {metrics.total_hewan_unik}
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
                                    placeholder="Cari No. RM, nama pasien, pemilik, diagnosa klinis, atau terapi..."
                                    className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 transition-all placeholder:text-gray-400"
                                />
                            </div>

                            <div className="w-full sm:w-56 shrink-0">
                                <Select
                                    value={idJenisHewan}
                                    onChange={handleTypeSelect}
                                    options={animalTypeOptions}
                                    placeholder="Pilih Jenis Hewan"
                                />
                            </div>

                            <div className="w-full sm:w-44 shrink-0">
                                <input
                                    type="date"
                                    value={tanggal}
                                    onChange={handleTanggalChange}
                                    className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 transition-all text-gray-700"
                                />
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                                <Button
                                    type="submit"
                                    variant="primary"
                                    className="text-xs sm:text-sm px-4 py-2"
                                >
                                    Filter
                                </Button>
                                {(search || idJenisHewan || tanggal) && (
                                    <button
                                        type="button"
                                        onClick={handleResetFilter}
                                        className="px-3 py-2 text-xs text-gray-500 hover:text-gray-800 bg-white border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors"
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
                                    <th className="py-2.5 px-2 border-r border-gray-200 w-16 text-center whitespace-nowrap">
                                        Status
                                    </th>
                                    <th className="py-2.5 px-2 w-32 text-center whitespace-nowrap">
                                        Aksi Pelayanan
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 text-xs text-gray-800">
                                {dataCount === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={8}
                                            className="py-12 text-center text-gray-400"
                                        >
                                            <div className="flex flex-col items-center justify-center">
                                                <span className="text-3xl mb-2">
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
                                                    results.per_page +
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
                                                    {item.tgl_kunjungan}
                                                </span>
                                            </td>

                                            <td className="py-2 px-3 border-r border-gray-200 whitespace-nowrap">
                                                <span
                                                    className="font-bold text-gray-900 text-xs truncate max-w-[130px] block"
                                                    title={item.nama_hewan}
                                                >
                                                    {item.nama_hewan}
                                                </span>
                                            </td>

                                            <td className="py-2 px-3 border-r border-gray-200 whitespace-nowrap">
                                                <span
                                                    className="font-medium text-gray-800 text-xs truncate max-w-[130px] block"
                                                    title={item.pemilik}
                                                >
                                                    {item.pemilik}
                                                </span>
                                            </td>

                                            <td className="py-2 px-3 border-r border-gray-200">
                                                <span
                                                    className="text-gray-700 text-xs truncate block w-full"
                                                    title={item.diagnosa}
                                                >
                                                    {item.diagnosa}
                                                </span>
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
                                                        className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 shadow-2xs transition-colors shrink-0"
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
                                                            handlePrint(item)
                                                        }
                                                        className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 shadow-2xs transition-colors shrink-0"
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

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            openEditModal(item)
                                                        }
                                                        className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 shadow-2xs transition-colors shrink-0"
                                                        title="Edit Rekam Medis Pasien"
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
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            openDeleteModal(
                                                                item,
                                                            )
                                                        }
                                                        className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 shadow-2xs transition-colors shrink-0"
                                                        title="Hapus Rekam Medis"
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
                                                <td className="py-2 px-2 border-r border-gray-200 text-transparent select-none">
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
                isOpen={isDetailOpen}
                onClose={() => setIsDetailOpen(false)}
                title={`Detail Pasien: ${selectedRecord?.nama_hewan ?? ""} (${selectedRecord?.no_rm ?? ""})`}
                size="full"
                className="max-w-7xl w-full"
            >
                {selectedRecord && (
                    <div className="text-xs">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-3.5 items-stretch">
                            <div className="lg:col-span-4 lg:h-[490px] p-3 rounded-xl border border-gray-200 bg-gray-50/70 flex flex-col">
                                <PatientHistoryPagination
                                    records={selectedRecord.historical_records}
                                    activeIndex={activeDetailHistoryIndex}
                                    onSelectIndex={setActiveDetailHistoryIndex}
                                    title="Riwayat Rekam Medis"
                                />
                            </div>

                            <div className="lg:col-span-4 lg:h-[490px] flex flex-col justify-between space-y-2">
                                <div className="p-3 rounded-xl border border-gray-200 bg-gray-50/70 space-y-2">
                                    <div className="flex items-center justify-between border-b border-gray-200 pb-1.5 shrink-0">
                                        <div>
                                            <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wider block">
                                                Data Pasien &amp; Pemilik
                                            </span>
                                            <span className="text-[10px] font-semibold text-emerald-700 block mt-0.5">
                                                📅 Tanggal:{" "}
                                                {selectedRecord.tgl_kunjungan} •
                                                Rekam Medis ke-
                                                {calculateVisitNumber(
                                                    selectedRecord,
                                                )}
                                            </span>
                                        </div>
                                        <span className="font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-xs">
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
                                                {selectedRecord.nama_hewan}
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

                                        <div className="col-span-2 flex items-center justify-between border-t border-gray-100 pt-2 mt-0.5 min-w-0 gap-2">
                                            <div className="flex items-center gap-1.5 shrink-0">
                                                <span className="text-[10px] text-gray-400">
                                                    WA:
                                                </span>
                                                <span className="font-mono text-gray-700">
                                                    {selectedRecord.no_hp}
                                                </span>
                                            </div>
                                            <div
                                                className="text-[10.5px] text-gray-500 truncate text-right cursor-help"
                                                title={
                                                    selectedRecord.alamat_pemilik
                                                }
                                            >
                                                📍{" "}
                                                {selectedRecord.alamat_pemilik}
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

                            <div className="lg:col-span-4 lg:h-[490px] flex flex-col justify-between space-y-2">
                                <div className="space-y-2 flex-1 overflow-y-auto pr-0.5">
                                    <div className="p-2.5 rounded-xl border border-gray-200 bg-gray-50/70">
                                        <span className="text-[10.5px] font-bold text-gray-700 uppercase tracking-wider block mb-1">
                                            Diagnosa Klinis Dokter
                                        </span>
                                        <div className="p-2 bg-white rounded-lg border border-gray-200 text-xs text-gray-900 min-h-[44px]">
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
                                        <div className="p-2 bg-white rounded-lg border border-gray-200 text-xs font-mono text-gray-800 leading-relaxed max-h-[85px] overflow-y-auto whitespace-pre-wrap">
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
                                                                    selectedRecord.dokter_nama ||
                                                                    selectedRecord.dokter
                                                                }
                                                                className="w-7 h-7 rounded-full object-cover object-center border border-emerald-300 shadow-xs shrink-0"
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
                                                                selectedRecord.dokter_nama ||
                                                                    selectedRecord.dokter,
                                                            )}
                                                        </span>
                                                        <span className="text-[9.5px] text-emerald-700 font-semibold block truncate">
                                                            Medik Veteriner
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
                                        onClick={() => setIsDetailOpen(false)}
                                        className="px-3 py-1.5 text-xs"
                                    >
                                        Tutup
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            handlePrint(selectedRecord)
                                        }
                                        className="px-3 py-1.5 text-xs border-blue-300 text-blue-700 hover:bg-blue-50"
                                    >
                                        🖨️ Cetak Dokumen
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="primary"
                                        size="sm"
                                        onClick={() => {
                                            setIsDetailOpen(false);
                                            openEditModal(selectedRecord);
                                        }}
                                        className="bg-amber-600 hover:bg-amber-700 font-bold px-3 py-1.5 text-xs text-white cursor-pointer"
                                    >
                                        ✏️ Edit Rekam Medis
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            <Modal
                isOpen={isExamModalOpen}
                onClose={() => setIsExamModalOpen(false)}
                title={`Edit Rekam Medis: ${examRecord?.nama_hewan ?? ""} (${examRecord?.no_rm ?? ""})`}
                size="full"
                className="max-w-7xl w-full"
            >
                {examRecord && (
                    <form
                        onSubmit={handleRequestSaveExamination}
                        className="text-xs"
                    >
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-3.5 items-stretch">
                            <div className="lg:col-span-4 lg:h-[490px] p-3 rounded-xl border border-gray-200 bg-gray-50/70 flex flex-col">
                                <PatientHistoryPagination
                                    records={examRecord.historical_records}
                                    activeIndex={activeExamHistoryIndex}
                                    onSelectIndex={setActiveExamHistoryIndex}
                                    title="Riwayat Rekam Medis"
                                />
                            </div>

                            <div className="lg:col-span-4 lg:h-[490px] flex flex-col justify-between space-y-2">
                                <div className="p-3 rounded-xl border border-gray-200 bg-gray-50/70 space-y-2">
                                    <div className="flex items-center justify-between border-b border-gray-200 pb-1.5 shrink-0">
                                        <div>
                                            <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wider block">
                                                Data Pasien &amp; Pemilik
                                            </span>
                                            <span className="text-[10px] font-semibold text-emerald-700 block mt-0.5">
                                                📅 Tanggal:{" "}
                                                {examRecord.tgl_kunjungan} •
                                                Rekam Medis ke-
                                                {calculateVisitNumber(
                                                    examRecord,
                                                )}
                                            </span>
                                        </div>
                                        <span className="font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-xs">
                                            {examRecord.no_rm}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-x-2 gap-y-2.5 text-xs">
                                        <div className="min-w-0">
                                            <span className="text-gray-400 text-[10px] block leading-tight">
                                                Nama Pasien:
                                            </span>
                                            <span
                                                className="font-bold text-gray-900 block truncate cursor-help hover:text-purple-700 transition-colors"
                                                title={examRecord.nama_hewan}
                                            >
                                                {examRecord.nama_hewan}
                                            </span>
                                        </div>

                                        <div className="min-w-0">
                                            <span className="text-gray-400 text-[10px] block leading-tight">
                                                Spesies / Kelamin:
                                            </span>
                                            <span
                                                className="text-gray-700 block truncate cursor-help"
                                                title={`${examRecord.jenis_hewan} (${examRecord.jenis_kelamin})`}
                                            >
                                                {examRecord.jenis_hewan} (
                                                {examRecord.jenis_kelamin})
                                            </span>
                                        </div>

                                        <div className="min-w-0">
                                            <span className="text-gray-400 text-[10px] block leading-tight">
                                                Umur & Warna:
                                            </span>
                                            <span
                                                className="text-gray-700 block truncate cursor-help"
                                                title={`${examRecord.umur} • ${examRecord.warna_hewan}`}
                                            >
                                                {examRecord.umur} •{" "}
                                                {examRecord.warna_hewan}
                                            </span>
                                        </div>

                                        <div className="min-w-0">
                                            <span className="text-gray-400 text-[10px] block leading-tight">
                                                Nama Pemilik:
                                            </span>
                                            <div className="flex items-baseline gap-1 overflow-hidden">
                                                <span
                                                    className="font-semibold text-gray-900 truncate cursor-help hover:text-purple-700 transition-colors"
                                                    title={examRecord.pemilik}
                                                >
                                                    {examRecord.pemilik}
                                                </span>
                                                <span className="text-gray-400 text-[9px] shrink-0">
                                                    ({examRecord.nik_pemilik})
                                                </span>
                                            </div>
                                        </div>

                                        <div className="col-span-2 flex items-center justify-between border-t border-gray-100 pt-2 mt-0.5 min-w-0 gap-2">
                                            <div className="flex items-center gap-1.5 shrink-0">
                                                <span className="text-[10px] text-gray-400">
                                                    WA:
                                                </span>
                                                <span className="font-mono text-gray-700">
                                                    {examRecord.no_hp}
                                                </span>
                                            </div>
                                            <div
                                                className="text-[10.5px] text-gray-500 truncate text-right cursor-help"
                                                title={
                                                    examRecord.alamat_pemilik
                                                }
                                            >
                                                📍 {examRecord.alamat_pemilik}
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
                                            {examRecord.jam_kunjungan ||
                                                examRecord.waktu_selesai}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 text-xs shrink-0">
                                        <div className="p-2 bg-white rounded-lg border border-gray-200 text-center">
                                            <span className="text-[10px] text-gray-400 block">
                                                Berat Badan:
                                            </span>
                                            <span className="font-extrabold text-gray-900 text-sm">
                                                {examRecord.berat_badan}{" "}
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
                                                {examRecord.suhu_tubuh}{" "}
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
                                            &quot;{examRecord.anamnesa}&quot;
                                        </p>
                                    </div>

                                    <div className="text-[10.5px] text-gray-400 pt-0.5 shrink-0">
                                        Petugas Loket:{" "}
                                        <strong className="text-gray-700">
                                            {examRecord.admin_petugas}
                                        </strong>
                                    </div>
                                </div>
                            </div>

                            <div className="lg:col-span-4 lg:h-[490px] flex flex-col justify-between space-y-2">
                                <div className="space-y-1.5 flex-1 overflow-y-auto pr-0.5">
                                    <div>
                                        <label className="block text-[11px] font-bold text-gray-900 mb-0.5">
                                            Diagnosa Klinis Dokter{" "}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </label>
                                        <textarea
                                            rows={2}
                                            value={examDiagnosa}
                                            onChange={(e) =>
                                                setExamDiagnosa(e.target.value)
                                            }
                                            placeholder="Masukkan diagnosa klinis pemeriksaan..."
                                            className={cn(
                                                "w-full p-2 text-xs bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 transition-all",
                                                examErrors.diagnosa
                                                    ? "border-red-500 ring-1 ring-red-200"
                                                    : "border-gray-300",
                                            )}
                                        />
                                        {examErrors.diagnosa && (
                                            <p className="text-[10.5px] text-red-500 mt-0.5">
                                                {examErrors.diagnosa}
                                            </p>
                                        )}
                                    </div>

                                    <div className="p-2 rounded-xl border border-gray-200 bg-gray-50/70 space-y-1.5">
                                        <span className="text-[10.5px] font-bold text-gray-600 uppercase tracking-wider block">
                                            💊 Bantuan Cepat Resep Obat Apotek
                                        </span>
                                        <Select
                                            value={selectedMedId}
                                            onChange={(val) =>
                                                setSelectedMedId(val)
                                            }
                                            options={medicineOptions}
                                            placeholder="Pilih obat tersedia..."
                                            size="sm"
                                        />
                                        <div className="grid grid-cols-12 gap-1.5 items-center">
                                            <div className="col-span-3">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={medJumlah}
                                                    onChange={(e) =>
                                                        setMedJumlah(
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="Jml"
                                                    className="w-full h-7 px-1.5 text-xs bg-white border border-gray-300 rounded-lg text-center font-bold focus:outline-none focus:border-emerald-700"
                                                />
                                            </div>
                                            <div className="col-span-6">
                                                <Select
                                                    value={medDosis}
                                                    onChange={(val) =>
                                                        setMedDosis(val)
                                                    }
                                                    options={DOSIS_OPTIONS}
                                                    placeholder="Dosis..."
                                                    size="sm"
                                                />
                                            </div>
                                            <div className="col-span-3">
                                                <Button
                                                    type="button"
                                                    variant="primary"
                                                    size="sm"
                                                    onClick={
                                                        handleAppendMedicine
                                                    }
                                                    className="w-full h-7 text-[11px] font-bold bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg px-1 flex items-center justify-center gap-0.5 cursor-pointer"
                                                >
                                                    + Resep
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[11px] font-bold text-gray-900 mb-0.5">
                                            Terapi Tindakan Medis &amp; Resep
                                            Obat{" "}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </label>
                                        <textarea
                                            rows={2}
                                            value={examTerapi}
                                            onChange={(e) =>
                                                setExamTerapi(e.target.value)
                                            }
                                            placeholder="Tuliskan tindakan medis, injeksi, atau resep obat..."
                                            className={cn(
                                                "w-full p-2 text-xs bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 transition-all font-mono leading-relaxed",
                                                examErrors.terapi_pengobatan
                                                    ? "border-red-500 ring-1 ring-red-200"
                                                    : "border-gray-300",
                                            )}
                                        />
                                        {examErrors.terapi_pengobatan && (
                                            <p className="text-[10.5px] text-red-500 mt-0.5">
                                                {examErrors.terapi_pengobatan}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-[11px] font-bold text-gray-900 mb-0.5">
                                            Catatan / Anjuran Khusus Pemilik
                                        </label>
                                        <input
                                            type="text"
                                            value={examCatatan}
                                            onChange={(e) =>
                                                setExamCatatan(e.target.value)
                                            }
                                            placeholder="Instruksi perawatan untuk pemilik di rumah..."
                                            className="w-full h-7 px-2 text-xs bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-700"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-200 shrink-0">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            setIsExamModalOpen(false)
                                        }
                                        disabled={isSavingExam}
                                        className="px-3 py-1.5 text-xs"
                                    >
                                        Batal
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        size="sm"
                                        disabled={isSavingExam}
                                        className="bg-emerald-700 hover:bg-emerald-800 font-bold px-4 py-1.5 text-xs text-white cursor-pointer"
                                    >
                                        {isSavingExam
                                            ? "Menyimpan..."
                                            : "Simpan & Selesaikan Edit"}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </form>
                )}
            </Modal>

            <Modal
                isOpen={isConfirmSaveModalOpen}
                onClose={() => setIsConfirmSaveModalOpen(false)}
                title="Konfirmasi Simpan Rekam Medis"
                size="md"
            >
                <div className="space-y-3.5 text-xs sm:text-sm">
                    <p className="text-gray-600">
                        Apakah Anda yakin ingin menyimpan perubahan data
                        pemeriksaan medis untuk pasien{" "}
                        <strong className="text-gray-900">
                            {examRecord?.nama_hewan}
                        </strong>{" "}
                        ({examRecord?.no_rm})?
                    </p>
                    <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200 text-xs text-amber-800 space-y-1">
                        <span className="font-bold block">💡 Perhatian:</span>
                        <p>
                            Perubahan pada diagnosa klinis dan terapi pengobatan
                            akan langsung diperbarui pada catatan rekam medis
                            pasien.
                        </p>
                    </div>
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setIsConfirmSaveModalOpen(false)}
                            disabled={isSavingExam}
                        >
                            Batal
                        </Button>
                        <Button
                            type="button"
                            variant="primary"
                            size="sm"
                            disabled={isSavingExam}
                            onClick={executeSubmitExamination}
                            className="bg-emerald-700 hover:bg-emerald-800 font-bold text-white px-4"
                        >
                            {isSavingExam
                                ? "Menyimpan..."
                                : "Ya, Simpan Perubahan"}
                        </Button>
                    </div>
                </div>
            </Modal>

            <Modal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                title="Konfirmasi Hapus Rekam Medis"
                type="danger"
                size="md"
            >
                <div className="space-y-3.5 text-xs sm:text-sm">
                    <p className="text-gray-600">
                        Apakah Anda yakin ingin menghapus data rekam medis
                        pasien{" "}
                        <strong className="text-gray-900">
                            {deletingRecord?.nama_hewan}
                        </strong>{" "}
                        ({deletingRecord?.no_rm})?
                    </p>
                    <div className="p-3 bg-rose-50/80 rounded-xl border border-rose-200 text-xs text-rose-800 space-y-1">
                        <span className="font-bold block">⚠️ Peringatan:</span>
                        <p>
                            Data rekam medis serta tindakan medis yang sudah
                            tersimpan akan dihapus permanen dari sistem dan
                            tidak dapat dipulihkan.
                        </p>
                    </div>
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setDeleteModalOpen(false)}
                            disabled={isDeleting}
                        >
                            Batal
                        </Button>
                        <Button
                            type="button"
                            variant="danger"
                            size="sm"
                            disabled={isDeleting}
                            onClick={executeDeleteRecord}
                            className="bg-rose-600 hover:bg-rose-700 font-bold text-white px-4"
                        >
                            {isDeleting ? "Menghapus..." : "Ya, Hapus Permanen"}
                        </Button>
                    </div>
                </div>
            </Modal>
        </DashboardLayout>
    );
}
