import React, { useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Button, Modal, Pagination, Select, useToast } from "@/components/ui";
import { cn } from "@/lib/utils";

interface HistoricalRecord {
    id: number;
    tgl_kunjungan: string;
    berat_badan: number;
    suhu_tubuh: number;
    anamnesa: string;
    diagnosa: string;
    terapi_pengobatan: string;
    catatan: string;
    dokter: string;
    dokter_foto?: string | null;
    dokter_nip?: string;
}

interface MedicineItem {
    id: number;
    kode_obat: string;
    nama_obat: string;
    stok: number;
    satuan: string;
}

interface VisitItem {
    id: number;
    no_rm: string;
    nama_hewan: string;
    id_hewan: number;
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
    admin_petugas: string;
    has_examination: boolean;
    diagnosa?: string;
    terapi_pengobatan?: string;
    catatan?: string;
    dokter_nama?: string;
    dokter_foto?: string | null;
    historical_records?: HistoricalRecord[];
}

interface AntrianPageProps {
    visits: {
        data: VisitItem[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        links: any[];
    };
    medicines?: MedicineItem[];
    filters: {
        search: string;
        status: string;
        tanggal: string;
    };
    summary: {
        total?: number;
        antri: number;
        pemeriksaan?: number;
        selesai: number;
    };
}

const DOSIS_OPTIONS = [
    { value: "1x1 hari", label: "1x1 hari (1x Sehari)" },
    { value: "2x1 hari", label: "2x1 hari (2x Sehari)" },
    { value: "3x1 hari", label: "3x1 hari (3x Sehari)" },
    { value: "4x1 hari", label: "4x1 hari (4x Sehari)" },
    { value: "1x2 hari", label: "1x2 hari (1x Tiap 2 Hari)" },
    { value: "1x3 hari", label: "1x3 hari (1x Tiap 3 Hari)" },
    { value: "1x seminggu", label: "1x seminggu" },
    { value: "Sebelum makan", label: "Sebelum makan" },
    { value: "Sesudah makan", label: "Sesudah makan" },
    { value: "Oles 2x sehari", label: "Oles 2x sehari" },
    { value: "Tetes 2x sehari", label: "Tetes 2x sehari" },
    { value: "Sesuai anjuran dokter", label: "Sesuai anjuran dokter" },
];

/**
 * Format nama dokter pemeriksa agar tidak terjadi duplikasi gelar (misal: drh. drh. Nama)
 */
const formatDoctorName = (name?: string | null): string => {
    if (!name) return "-";
    const trimmed = name.trim();
    if (/^drh\.?\s+/i.test(trimmed)) {
        return trimmed;
    }
    return `drh. ${trimmed}`;
};

/**
 * Komponen Tab Pagination Riwayat Rekam Medis Lampau (Kompak 3 Kolom)
 * Menampilkan tab nomor saja (#1, #2, dst.) secara kronologis (riwayat paling awal = #1).
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
                    ℹ️ Pemeriksaan saat ini akan tercatat sebagai Kunjungan ke-1
                    pasien.
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

export default function DokterAntrianPage({
    visits,
    medicines = [],
    filters = { search: "", status: "all", tanggal: "" },
    summary = { total: 0, antri: 0, selesai: 0 },
}: AntrianPageProps) {
    const { success, error, warning, blue, deleted } = useToast();

    const [search, setSearch] = useState(filters.search || "");
    const [status, setStatus] = useState(filters.status || "all");
    const [tanggal, setTanggal] = useState(filters.tanggal || "");
    const isFirstSearchRender = React.useRef(true);

    const [selectedVisit, setSelectedVisit] = useState<VisitItem | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    const [statusModalOpen, setStatusModalOpen] = useState(false);
    const [statusVisitTarget, setStatusVisitTarget] =
        useState<VisitItem | null>(null);
    const [newStatusValue, setNewStatusValue] = useState("Antri");
    const [isSubmittingStatus, setIsSubmittingStatus] = useState(false);

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deletingVisit, setDeletingVisit] = useState<VisitItem | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const [isConfirmSaveModalOpen, setIsConfirmSaveModalOpen] = useState(false);

    const [examVisit, setExamVisit] = useState<VisitItem | null>(null);
    const [isExamModalOpen, setIsExamModalOpen] = useState(false);
    const [examDiagnosa, setExamDiagnosa] = useState("");
    const [examTerapi, setExamTerapi] = useState("");
    const [examCatatan, setExamCatatan] = useState("");
    const [isSavingExam, setIsSavingExam] = useState(false);
    const [examErrors, setExamErrors] = useState<{
        diagnosa?: string;
        terapi_pengobatan?: string;
    }>({});

    const [selectedMedId, setSelectedMedId] = useState("");
    const [medJumlah, setMedJumlah] = useState("1");
    const [medDosis, setMedDosis] = useState("1x1 hari");

    const [showTrackRecord, setShowTrackRecord] = useState(true);
    const [activeExamHistoryIndex, setActiveExamHistoryIndex] = useState(0);
    const [activeDetailHistoryIndex, setActiveDetailHistoryIndex] = useState(0);

    const calculateVisitNumber = (record: VisitItem | null): number => {
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

    React.useEffect(() => {
        if (isFirstSearchRender.current) {
            isFirstSearchRender.current = false;
            return;
        }

        const timer = setTimeout(() => {
            router.get(
                "/dokter/antrian",
                {
                    search: search,
                    status: status,
                    tanggal: tanggal,
                },
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                },
            );
        }, 250);

        return () => clearTimeout(timer);
    }, [search]);

    const handleTanggalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setTanggal(val);
        router.get(
            "/dokter/antrian",
            {
                search: search,
                status: status,
                tanggal: val,
            },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const handleClearSearch = () => {
        setSearch("");
        router.get(
            "/dokter/antrian",
            {
                search: "",
                status: status,
                tanggal: tanggal,
            },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const handleResetFilter = () => {
        setSearch("");
        setStatus("all");
        setTanggal("");
        router.get(
            "/dokter/antrian",
            {},
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const openDetailModal = (v: VisitItem) => {
        setSelectedVisit(v);
        setActiveDetailHistoryIndex(0);
        setIsDetailOpen(true);
    };

    const openStatusModal = (v: VisitItem) => {
        if (v.status_antrean === "Selesai") {
            warning(
                "Status Terkunci",
                "Pasien yang sudah selesai diperiksa tidak dapat diubah statusnya, kecuali dihapus.",
            );
            return;
        }
        setStatusVisitTarget(v);
        setNewStatusValue(v.status_antrean);
        setStatusModalOpen(true);
    };

    const openDeleteModal = (v: VisitItem) => {
        setDeletingVisit(v);
        setDeleteModalOpen(true);
    };

    const executeDeleteVisit = () => {
        if (!deletingVisit || isDeleting) return;
        setIsDeleting(true);

        router.delete(`/dokter/antrian/${deletingVisit.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                const nama = deletingVisit.nama_hewan;
                setDeleteModalOpen(false);
                setDeletingVisit(null);
                setIsDeleting(false);
                deleted(
                    `Data antrean dan rekam medis pasien ${nama} berhasil dihapus dari sistem.`,
                    "Data Dihapus",
                );
            },
            onError: () => {
                setIsDeleting(false);
                error(
                    "Terjadi kesalahan saat menghapus data antrean.",
                    "Gagal",
                );
            },
        });
    };

    const submitStatusChange = () => {
        if (!statusVisitTarget) return;
        setIsSubmittingStatus(true);

        router.patch(
            `/dokter/antrian/${statusVisitTarget.id}/status`,
            { status_antrean: newStatusValue },
            {
                preserveScroll: true,
                onSuccess: () => {
                    success(
                        "Status Antrean Diperbarui",
                        `Status antrean ${statusVisitTarget.nama_hewan} berhasil diubah.`,
                    );
                    setStatusModalOpen(false);
                    setStatusVisitTarget(null);
                },
                onError: () => {
                    error(
                        "Gagal",
                        "Terjadi kesalahan saat mengubah status antrean.",
                    );
                },
                onFinish: () => {
                    setIsSubmittingStatus(false);
                },
            },
        );
    };

    const openInstantExamModal = (v: VisitItem) => {
        setExamVisit(v);
        setActiveExamHistoryIndex(0);
        setExamDiagnosa(v.diagnosa || "");
        setExamTerapi(v.terapi_pengobatan || "");
        setExamCatatan(v.catatan || "");
        setExamErrors({});
        setSelectedMedId("");
        setMedJumlah("1");
        setMedDosis("1x1 hari");
        setShowTrackRecord(true);
        setIsExamModalOpen(true);
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
        if (!examVisit) return;

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
        if (!examVisit || isSavingExam) return;

        setIsSavingExam(true);
        const isEditingCompleted =
            examVisit.status_antrean === "Selesai" || examVisit.has_examination;
        const targetNama = examVisit.nama_hewan;
        const targetNoRm = examVisit.no_rm;

        router.post(
            `/dokter/pemeriksaan/${examVisit.id}`,
            {
                diagnosa: examDiagnosa,
                terapi_pengobatan: examTerapi,
                catatan: examCatatan,
                redirect_to: "antrian",
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setIsConfirmSaveModalOpen(false);
                    setIsExamModalOpen(false);
                    setExamVisit(null);
                    setIsSavingExam(false);

                    if (isEditingCompleted) {
                        blue(
                            `Perubahan rekam medis untuk ${targetNama} (${targetNoRm}) berhasil disimpan.`,
                            "Data Berhasil Diperbarui",
                        );
                    } else {
                        success(
                            `Pemeriksaan pasien ${targetNama} (${targetNoRm}) selesai. Status antrean diperbarui menjadi Selesai.`,
                            "Pemeriksaan Selesai",
                        );
                    }
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

    const dataCount = visits.data.length;
    const emptyRowsCount = Math.max(0, 5 - dataCount);

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
        <DashboardLayout title="Antrean Pasien Dokter">
            <Head title="Antrean Pasien" />

            <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
                <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-gray-200 border-b border-gray-200 bg-white">
                    <div className="p-3 sm:px-4 sm:py-3 flex items-center justify-between">
                        <div>
                            <span className="text-[10px] sm:text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                                Antrean Menunggu Hari Ini
                            </span>
                            <div className="flex items-baseline gap-1 mt-0.5">
                                <span className="text-lg sm:text-xl font-black text-amber-600">
                                    {summary.antri}
                                </span>
                                <span className="text-[11px] font-semibold text-gray-500">
                                    Pasien
                                </span>
                            </div>
                        </div>
                        <span className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-sm shrink-0">
                            ⏳
                        </span>
                    </div>

                    <div className="p-3 sm:px-4 sm:py-3 flex items-center justify-between">
                        <div>
                            <span className="text-[10px] sm:text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                                Total Pasien Menunggu
                            </span>
                            <div className="flex items-baseline gap-1 mt-0.5">
                                <span className="text-lg sm:text-xl font-black text-purple-700">
                                    {summary.total ?? summary.antri}
                                </span>
                                <span className="text-[11px] font-semibold text-gray-500">
                                    Pasien Dalam Antrean
                                </span>
                            </div>
                        </div>
                        <Link
                            href="/dokter/riwayat"
                            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 group py-1.5 px-3 rounded-xl bg-emerald-50/60 border border-emerald-100 hover:bg-emerald-100/50 transition-colors"
                        >
                            <span>Riwayat Pemeriksaan</span>
                            <span className="group-hover:translate-x-0.5 transition-transform">
                                →
                            </span>
                        </Link>
                    </div>
                </div>

                <div className="p-4 sm:p-5 border-b border-gray-200 bg-gray-50/60">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
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
                                placeholder="Cari No. RM, nama hewan, nama pemilik, NIK, keluhan..."
                                className="w-full pl-10 pr-9 py-2 text-xs sm:text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 transition-all placeholder:text-gray-400"
                            />
                            {search && (
                                <button
                                    type="button"
                                    onClick={handleClearSearch}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 text-xs font-bold transition-colors"
                                    title="Bersihkan pencarian"
                                >
                                    ✕
                                </button>
                            )}
                        </div>

                        <div className="w-full sm:w-48 shrink-0">
                            <input
                                type="date"
                                value={tanggal}
                                onChange={handleTanggalChange}
                                className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 transition-all text-gray-700"
                            />
                        </div>

                        {(search || tanggal) && (
                            <div className="flex items-center shrink-0">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="md"
                                    onClick={handleResetFilter}
                                    className="w-full sm:w-auto text-xs font-semibold text-rose-600 hover:text-rose-700 border-rose-200 hover:bg-rose-50"
                                >
                                    Reset Filter
                                </Button>
                            </div>
                        )}
                    </div>
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
                                    Anamnesa / Keluhan
                                </th>
                                <th className="py-2.5 px-2 border-r border-gray-200 w-16 text-center whitespace-nowrap">
                                    Status
                                </th>
                                <th className="py-2.5 px-2 w-28 text-center whitespace-nowrap">
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
                                                📋
                                            </span>
                                            <p className="font-semibold text-gray-700">
                                                Tidak ada data antrean ditemukan
                                            </p>
                                            <p className="text-[11px] text-gray-400 mt-1">
                                                Coba sesuaikan kata kunci
                                                pencarian atau filter status
                                                antrean Anda.
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                visits.data.map((visit, index) => (
                                    <tr
                                        key={visit.id}
                                        className="h-11 even:bg-gray-50/50 hover:bg-emerald-50/30 transition-colors"
                                    >
                                        <td className="py-2 px-3 border-r border-gray-200 text-center whitespace-nowrap font-medium text-gray-500 text-xs">
                                            {(visits.current_page - 1) *
                                                visits.per_page +
                                                index +
                                                1}
                                        </td>

                                        <td className="py-2 px-3 border-r border-gray-200 whitespace-nowrap">
                                            <span className="font-mono font-bold text-gray-900 text-xs">
                                                {visit.no_rm}
                                            </span>
                                        </td>

                                        <td className="py-2 px-3 border-r border-gray-200 whitespace-nowrap text-xs text-gray-700">
                                            <span className="font-semibold text-gray-900">
                                                {visit.tgl_kunjungan}
                                            </span>
                                        </td>

                                        <td className="py-2 px-3 border-r border-gray-200 whitespace-nowrap">
                                            <span
                                                className="font-bold text-gray-900 text-xs truncate max-w-[130px] block"
                                                title={visit.nama_hewan}
                                            >
                                                {visit.nama_hewan}
                                            </span>
                                        </td>

                                        <td className="py-2 px-3 border-r border-gray-200 whitespace-nowrap">
                                            <span
                                                className="font-medium text-gray-800 text-xs truncate max-w-[130px] block"
                                                title={visit.pemilik}
                                            >
                                                {visit.pemilik}
                                            </span>
                                        </td>

                                        <td className="py-2 px-3 border-r border-gray-200 max-w-0">
                                            <span
                                                className="text-gray-700 text-xs truncate block w-full"
                                                title={visit.anamnesa}
                                            >
                                                {visit.anamnesa}
                                            </span>
                                        </td>

                                        <td className="py-2 px-2 border-r border-gray-200 text-center whitespace-nowrap">
                                            <div className="flex items-center justify-center">
                                                <span
                                                    className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shadow-2xs"
                                                    title="Status: Menunggu Pemeriksaan (Antri)"
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
                                                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
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
                                                        openInstantExamModal(
                                                            visit,
                                                        )
                                                    }
                                                    className="p-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs transition-colors shrink-0 cursor-pointer"
                                                    title="Mulai Periksa Pasien"
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
                                                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                                        />
                                                    </svg>
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        openDetailModal(visit)
                                                    }
                                                    className="p-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 text-gray-600 transition-colors shrink-0 cursor-pointer"
                                                    title="Lihat Detail Pasien"
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
                                                        openDeleteModal(visit)
                                                    }
                                                    className="p-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors shrink-0 cursor-pointer"
                                                    title="Batalkan / Hapus Antrean"
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
                            {visits.data.length}
                        </span>{" "}
                        dari{" "}
                        <span className="font-bold text-gray-900">
                            {visits.total}
                        </span>{" "}
                        total antrean (Maksimal 5 data per halaman)
                    </div>
                    {visits.last_page > 1 && (
                        <div>
                            <Pagination links={visits.links} />
                        </div>
                    )}
                </div>
            </div>

            <Modal
                isOpen={isExamModalOpen}
                onClose={() => setIsExamModalOpen(false)}
                title={
                    examVisit?.status_antrean === "Selesai"
                        ? `Edit Rekam Medis: ${examVisit?.nama_hewan ?? ""} (${examVisit?.no_rm ?? ""})`
                        : `Pemeriksaan Pasien: ${examVisit?.nama_hewan ?? ""} (${examVisit?.no_rm ?? ""})`
                }
                size="full"
                className="max-w-7xl w-full"
            >
                {examVisit && (
                    <form
                        onSubmit={handleRequestSaveExamination}
                        className="text-xs"
                    >
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-3.5 items-stretch">
                            <div className="lg:col-span-4 lg:h-[490px] p-3 rounded-xl border border-gray-200 bg-gray-50/70 flex flex-col">
                                <PatientHistoryPagination
                                    records={examVisit.historical_records}
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
                                                {examVisit.tgl_kunjungan} •
                                                Rekam Medis ke-
                                                {calculateVisitNumber(
                                                    examVisit,
                                                )}
                                            </span>
                                        </div>
                                        <span className="font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-xs">
                                            {examVisit.no_rm}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-x-2 gap-y-2.5 text-xs">
                                        <div className="min-w-0">
                                            <span className="text-gray-400 text-[10px] block leading-tight">
                                                Nama Pasien:
                                            </span>
                                            <span
                                                className="font-bold text-gray-900 block truncate cursor-help hover:text-purple-700 transition-colors"
                                                title={examVisit.nama_hewan}
                                            >
                                                {examVisit.nama_hewan}
                                            </span>
                                        </div>

                                        <div className="min-w-0">
                                            <span className="text-gray-400 text-[10px] block leading-tight">
                                                Spesies / Kelamin:
                                            </span>
                                            <span
                                                className="text-gray-700 block truncate cursor-help"
                                                title={`${examVisit.jenis_hewan} (${examVisit.jenis_kelamin})`}
                                            >
                                                {examVisit.jenis_hewan} (
                                                {examVisit.jenis_kelamin})
                                            </span>
                                        </div>

                                        <div className="min-w-0">
                                            <span className="text-gray-400 text-[10px] block leading-tight">
                                                Umur & Warna:
                                            </span>
                                            <span
                                                className="text-gray-700 block truncate cursor-help"
                                                title={`${examVisit.umur} • ${examVisit.warna_hewan}`}
                                            >
                                                {examVisit.umur} •{" "}
                                                {examVisit.warna_hewan}
                                            </span>
                                        </div>

                                        <div className="min-w-0">
                                            <span className="text-gray-400 text-[10px] block leading-tight">
                                                Nama Pemilik:
                                            </span>
                                            <div className="flex items-baseline gap-1 overflow-hidden">
                                                <span
                                                    className="font-semibold text-gray-900 truncate cursor-help hover:text-purple-700 transition-colors"
                                                    title={examVisit.pemilik}
                                                >
                                                    {examVisit.pemilik}
                                                </span>
                                                <span className="text-gray-400 text-[9px] shrink-0">
                                                    ({examVisit.nik_pemilik})
                                                </span>
                                            </div>
                                        </div>

                                        <div className="col-span-2 flex items-center justify-between border-t border-gray-100 pt-2 mt-0.5 min-w-0 gap-2">
                                            <div className="flex items-center gap-1.5 shrink-0">
                                                <span className="text-[10px] text-gray-400">
                                                    WA:
                                                </span>
                                                <span className="font-mono text-gray-700">
                                                    {examVisit.no_hp}
                                                </span>
                                            </div>
                                            <div
                                                className="text-[10.5px] text-gray-500 truncate text-right cursor-help"
                                                title={examVisit.alamat_pemilik}
                                            >
                                                📍 {examVisit.alamat_pemilik}
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
                                            {examVisit.jam_kunjungan}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 text-xs shrink-0">
                                        <div className="p-2 bg-white rounded-lg border border-gray-200 text-center">
                                            <span className="text-[10px] text-gray-400 block">
                                                Berat Badan:
                                            </span>
                                            <span className="font-extrabold text-gray-900 text-sm">
                                                {examVisit.berat_badan}{" "}
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
                                                {examVisit.suhu_tubuh}{" "}
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
                                            &quot;{examVisit.anamnesa}&quot;
                                        </p>
                                    </div>

                                    <div className="text-[10.5px] text-gray-400 pt-0.5 shrink-0">
                                        Petugas Loket:{" "}
                                        <strong className="text-gray-700">
                                            {examVisit.admin_petugas}
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
                                            : examVisit.status_antrean ===
                                                "Selesai"
                                              ? "Simpan & Selesaikan Edit"
                                              : "Simpan & Selesaikan"}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </form>
                )}
            </Modal>

            <Modal
                isOpen={isDetailOpen}
                onClose={() => setIsDetailOpen(false)}
                title={`Detail Pasien: ${selectedVisit?.nama_hewan ?? ""} (${selectedVisit?.no_rm ?? ""})`}
                size="full"
                className="max-w-7xl w-full"
            >
                {selectedVisit && (
                    <div className="text-xs">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-3.5 items-stretch">
                            <div className="lg:col-span-4 lg:h-[490px] p-3 rounded-xl border border-gray-200 bg-gray-50/70 flex flex-col">
                                <PatientHistoryPagination
                                    records={selectedVisit.historical_records}
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
                                                {selectedVisit.tgl_kunjungan} •
                                                Rekam Medis ke-
                                                {calculateVisitNumber(
                                                    selectedVisit,
                                                )}
                                            </span>
                                        </div>
                                        <span className="font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-xs">
                                            {selectedVisit.no_rm}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-x-2 gap-y-2.5 text-xs">
                                        <div className="min-w-0">
                                            <span className="text-gray-400 text-[10px] block leading-tight">
                                                Nama Pasien:
                                            </span>
                                            <span
                                                className="font-bold text-gray-900 block truncate cursor-help hover:text-purple-700 transition-colors"
                                                title={selectedVisit.nama_hewan}
                                            >
                                                {selectedVisit.nama_hewan}
                                            </span>
                                        </div>

                                        <div className="min-w-0">
                                            <span className="text-gray-400 text-[10px] block leading-tight">
                                                Spesies / Kelamin:
                                            </span>
                                            <span
                                                className="text-gray-700 block truncate cursor-help"
                                                title={`${selectedVisit.jenis_hewan} (${selectedVisit.jenis_kelamin})`}
                                            >
                                                {selectedVisit.jenis_hewan} (
                                                {selectedVisit.jenis_kelamin})
                                            </span>
                                        </div>

                                        <div className="min-w-0">
                                            <span className="text-gray-400 text-[10px] block leading-tight">
                                                Umur & Warna:
                                            </span>
                                            <span
                                                className="text-gray-700 block truncate cursor-help"
                                                title={`${selectedVisit.umur} • ${selectedVisit.warna_hewan}`}
                                            >
                                                {selectedVisit.umur} •{" "}
                                                {selectedVisit.warna_hewan}
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
                                                        selectedVisit.pemilik
                                                    }
                                                >
                                                    {selectedVisit.pemilik}
                                                </span>
                                                <span className="text-gray-400 text-[9px] shrink-0">
                                                    ({selectedVisit.nik_pemilik}
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
                                                    {selectedVisit.no_hp}
                                                </span>
                                            </div>
                                            <div
                                                className="text-[10.5px] text-gray-500 truncate text-right cursor-help"
                                                title={
                                                    selectedVisit.alamat_pemilik
                                                }
                                            >
                                                📍{" "}
                                                {selectedVisit.alamat_pemilik}
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
                                            {selectedVisit.jam_kunjungan}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 text-xs shrink-0">
                                        <div className="p-2 bg-white rounded-lg border border-gray-200 text-center">
                                            <span className="text-[10px] text-gray-400 block">
                                                Berat Badan:
                                            </span>
                                            <span className="font-extrabold text-gray-900 text-sm">
                                                {selectedVisit.berat_badan}{" "}
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
                                                {selectedVisit.suhu_tubuh}{" "}
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
                                            &quot;{selectedVisit.anamnesa}&quot;
                                        </p>
                                    </div>

                                    <div className="text-[10.5px] text-gray-400 pt-0.5 shrink-0">
                                        Petugas Loket:{" "}
                                        <strong className="text-gray-700">
                                            {selectedVisit.admin_petugas}
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
                                            {selectedVisit.diagnosa || (
                                                <span className="text-gray-400 italic">
                                                    Belum ada diagnosa (masih
                                                    dalam antrean)
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
                                            {selectedVisit.terapi_pengobatan || (
                                                <span className="text-gray-400 italic font-sans">
                                                    Belum ada terapi tindakan
                                                    medis yang dicatat
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="p-2.5 rounded-xl border border-gray-200 bg-gray-50/70">
                                        <span className="text-[10.5px] font-bold text-gray-700 uppercase tracking-wider block mb-0.5">
                                            Catatan / Anjuran Khusus Pemilik
                                        </span>
                                        <div className="p-2 bg-white rounded-lg border border-gray-200 text-xs text-gray-800 min-h-[32px]">
                                            {selectedVisit.catatan &&
                                            selectedVisit.catatan !== "-" ? (
                                                selectedVisit.catatan
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
                                                    {selectedVisit.dokter_foto ? (
                                                        <>
                                                            <img
                                                                src={
                                                                    selectedVisit.dokter_foto
                                                                }
                                                                alt={
                                                                    selectedVisit.dokter_nama ||
                                                                    "Dokter"
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
                                                                selectedVisit.dokter_nama,
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
                                                {selectedVisit.status_antrean ===
                                                    "Selesai" && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                                                        Selesai
                                                    </span>
                                                )}
                                                {selectedVisit.status_antrean ===
                                                    "Pemeriksaan" && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse"></span>
                                                        Sedang Diperiksa
                                                    </span>
                                                )}
                                                {selectedVisit.status_antrean ===
                                                    "Antri" && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-300">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                                                        Antri (Menunggu)
                                                    </span>
                                                )}
                                                {selectedVisit.status_antrean ===
                                                    "Batal" && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
                                                        Dibatalkan
                                                    </span>
                                                )}
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
                                    {selectedVisit.status_antrean !==
                                    "Selesai" ? (
                                        <Button
                                            type="button"
                                            variant="primary"
                                            size="sm"
                                            onClick={() => {
                                                setIsDetailOpen(false);
                                                openInstantExamModal(
                                                    selectedVisit,
                                                );
                                            }}
                                            className="bg-emerald-700 hover:bg-emerald-800 font-bold px-3 py-1.5 text-xs text-white cursor-pointer"
                                        >
                                            🩺 Periksa Sekarang →
                                        </Button>
                                    ) : (
                                        <Button
                                            type="button"
                                            variant="primary"
                                            size="sm"
                                            onClick={() => {
                                                setIsDetailOpen(false);
                                                openInstantExamModal(
                                                    selectedVisit,
                                                );
                                            }}
                                            className="bg-amber-600 hover:bg-amber-700 font-bold px-3 py-1.5 text-xs text-white cursor-pointer"
                                        >
                                            ✏️ Edit Rekam Medis
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            <Modal
                isOpen={statusModalOpen}
                onClose={() => setStatusModalOpen(false)}
                title={`Ubah Status Antrean: ${statusVisitTarget?.nama_hewan ?? ""}`}
                size="md"
            >
                <div className="space-y-4 text-xs sm:text-sm">
                    <p className="text-gray-600">
                        Atur status antrean pasien{" "}
                        <strong className="text-gray-900">
                            {statusVisitTarget?.nama_hewan}
                        </strong>{" "}
                        ({statusVisitTarget?.no_rm}):
                    </p>

                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1.5">
                            Pilih Status Baru
                        </label>
                        <Select
                            value={newStatusValue}
                            onChange={(val) => setNewStatusValue(val)}
                            options={[
                                { value: "Antri", label: "Menunggu (Antri)" },
                                {
                                    value: "Selesai",
                                    label: "Selesai Diperiksa",
                                },
                            ]}
                        />
                        <p className="text-[11px] text-gray-400 mt-1.5">
                            * Catatan: Pasien yang telah selesai diperiksa tidak
                            dapat diubah statusnya, kecuali dihapus.
                        </p>
                    </div>

                    <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                        <Button
                            variant="outline"
                            onClick={() => setStatusModalOpen(false)}
                        >
                            Batal
                        </Button>
                        <Button
                            variant="primary"
                            onClick={submitStatusChange}
                            disabled={isSubmittingStatus}
                            className="bg-emerald-700 hover:bg-emerald-800 font-bold"
                        >
                            {isSubmittingStatus
                                ? "Menyimpan..."
                                : "Simpan Status"}
                        </Button>
                    </div>
                </div>
            </Modal>

            <Modal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                title="Hapus Data Pelayanan Antrean"
                size="md"
            >
                {deletingVisit && (
                    <div className="space-y-4">
                        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900">
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
                            <div className="space-y-1">
                                <p className="font-bold text-rose-950">
                                    Konfirmasi Hapus Data Antrean &amp; Rekam
                                    Medis
                                </p>
                                <p className="leading-relaxed text-rose-800">
                                    Apakah Anda yakin ingin menghapus data
                                    antrean dan pemeriksaan untuk pasien{" "}
                                    <strong>{deletingVisit.nama_hewan}</strong>{" "}
                                    ({deletingVisit.no_rm}) milik{" "}
                                    <strong>{deletingVisit.pemilik}</strong>?
                                </p>
                                <p className="text-[11px] text-rose-600 font-semibold pt-0.5">
                                    ⚠️ Tindakan ini permanen dan akan menghapus
                                    rekam medis terkait dari sistem.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-gray-100">
                            <Button
                                type="button"
                                variant="outline"
                                disabled={isDeleting}
                                onClick={() => setDeleteModalOpen(false)}
                                className="px-4 py-2 text-xs font-semibold"
                            >
                                Batal
                            </Button>
                            <Button
                                type="button"
                                variant="primary"
                                disabled={isDeleting}
                                onClick={executeDeleteVisit}
                                className="px-4 py-2 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-700 text-white shadow-xs"
                            >
                                {isDeleting ? "Menghapus..." : "Ya, Hapus Data"}
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>

            <Modal
                isOpen={isConfirmSaveModalOpen}
                onClose={() => setIsConfirmSaveModalOpen(false)}
                title={
                    examVisit?.status_antrean === "Selesai"
                        ? "Konfirmasi Simpan Perubahan"
                        : "Konfirmasi Simpan Pemeriksaan"
                }
                size="md"
            >
                {examVisit && (
                    <div className="space-y-4">
                        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950">
                            <div className="text-emerald-700 shrink-0 mt-0.5">
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
                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                            </div>
                            <div className="space-y-1">
                                <p className="font-bold text-emerald-950 text-sm">
                                    {examVisit.status_antrean === "Selesai"
                                        ? "Simpan Perubahan Rekam Medis?"
                                        : "Selesaikan Pemeriksaan Pasien?"}
                                </p>
                                <p className="leading-relaxed text-emerald-900">
                                    Apakah Anda yakin data diagnosa dan terapi
                                    pengobatan untuk pasien{" "}
                                    <strong>{examVisit.nama_hewan}</strong> (
                                    {examVisit.no_rm}) sudah sesuai dan ingin
                                    disimpan ke dalam rekam medis?
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-gray-100">
                            <Button
                                type="button"
                                variant="outline"
                                disabled={isSavingExam}
                                onClick={() => setIsConfirmSaveModalOpen(false)}
                                className="px-4 py-2 text-xs font-semibold"
                            >
                                Periksa Kembali
                            </Button>
                            <Button
                                type="button"
                                variant="primary"
                                disabled={isSavingExam}
                                onClick={executeSubmitExamination}
                                className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs"
                            >
                                {isSavingExam
                                    ? "Menyimpan..."
                                    : "Ya, Simpan & Selesaikan"}
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </DashboardLayout>
    );
}
