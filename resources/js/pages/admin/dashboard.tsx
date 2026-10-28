import React, { useState } from "react";
import { Head, Link, router, usePage } from "@inertiajs/react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Button, Dropdown } from "@/components/ui";

interface MedicalChartPoint {
    key: string;
    label: string;
    full_label: string;
    total: number;
    selesai: number;
    antri: number;
}

interface RabiesChartPoint {
    key: string;
    label: string;
    full_label: string;
    kasus: number;
    var: number;
    observasi: number;
}

interface DashboardProps {
    metrics: {
        total_antrean_hari_ini: number;
        menunggu_hari_ini: number;
        diperiksa_hari_ini: number;
        selesai_hari_ini: number;
        total_pemilik: number;
        total_hewan: number;
        total_rabies: number;
        next_no_rm: string;
    };
    todayVisits: Array<{
        id: number;
        no_antrean: string;
        no_rm: string;
        nama_hewan: string;
        jenis_hewan: string;
        pemilik: string;
        no_hp: string;
        waktu: string;
        berat_badan: string;
        suhu_tubuh: string;
        anamnesa: string;
        status_antrean: string;
    }>;
    currentPeriod: string;
    medicalChart: {
        points: MedicalChartPoint[];
        summary: {
            total: number;
            selesai: number;
            antri: number;
            completion_rate: number;
        };
    };
    rabiesChart: {
        points: RabiesChartPoint[];
        summary: {
            total_kasus: number;
            total_var: number;
            total_observasi: number;
            var_coverage_rate: number;
        };
    };
}

const PERIOD_LABELS: Record<string, string> = {
    "7d": "7 Hari Terakhir",
    "30d": "30 Hari Terakhir",
    "6m": "6 Bulan Terakhir",
    "1y": "1 Tahun Terakhir",
};

export default function AdminDashboard({
    metrics,
    todayVisits = [],
    currentPeriod = "30d",
    medicalChart,
    rabiesChart,
}: DashboardProps) {
    const { auth } = usePage().props;
    const user = (auth as any)?.user || {};

    const [hoveredMedical, setHoveredMedical] =
        useState<MedicalChartPoint | null>(null);
    const [hoveredRabies, setHoveredRabies] = useState<RabiesChartPoint | null>(
        null,
    );

    const handlePeriodChange = (newPeriod: string) => {
        router.get(
            "/admin/dashboard",
            { period: newPeriod },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const medPointsData =
        medicalChart?.points?.length > 0 ? medicalChart.points : [];
    const maxMedVal = Math.max(...medPointsData.map((p) => p.total), 4);
    const medSvgWidth = 600;
    const medSvgHeight = 160;
    const medPadding = { top: 15, right: 15, bottom: 25, left: 30 };
    const medPlotW = medSvgWidth - medPadding.left - medPadding.right;
    const medPlotH = medSvgHeight - medPadding.top - medPadding.bottom;

    const medCoords = medPointsData.map((pt, idx) => {
        const x =
            medPadding.left +
            (idx / Math.max(medPointsData.length - 1, 1)) * medPlotW;
        const y = medPadding.top + medPlotH - (pt.total / maxMedVal) * medPlotH;
        const ySelesai =
            medPadding.top + medPlotH - (pt.selesai / maxMedVal) * medPlotH;
        return { x, y, ySelesai, data: pt };
    });

    const medPathD = medCoords.reduce((acc, pt, idx, arr) => {
        if (idx === 0) return `M ${pt.x} ${pt.y}`;
        const prev = arr[idx - 1];
        const cx1 = prev.x + (pt.x - prev.x) / 2;
        const cy1 = prev.y;
        const cx2 = prev.x + (pt.x - prev.x) / 2;
        const cy2 = pt.y;
        return `${acc} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${pt.x} ${pt.y}`;
    }, "");

    const medAreaD =
        medCoords.length > 0
            ? `${medPathD} L ${medCoords[medCoords.length - 1].x} ${medPadding.top + medPlotH} L ${medCoords[0].x} ${medPadding.top + medPlotH} Z`
            : "";

    const rabPointsData =
        rabiesChart?.points?.length > 0 ? rabiesChart.points : [];
    const maxRabVal = Math.max(
        ...rabPointsData.map((p) => Math.max(p.kasus, p.var)),
        4,
    );
    const rabSvgWidth = 600;
    const rabSvgHeight = 160;
    const rabPadding = { top: 15, right: 15, bottom: 25, left: 30 };
    const rabPlotW = rabSvgWidth - rabPadding.left - rabPadding.right;
    const rabPlotH = rabSvgHeight - rabPadding.top - rabPadding.bottom;

    const rabBandW =
        rabPointsData.length > 0 ? rabPlotW / rabPointsData.length : rabPlotW;
    const rabBarW = Math.max(Math.min(rabBandW * 0.35, 14), 2);

    return (
        <DashboardLayout title="Dashboard Administrasi Loket">
            <Head title="Dashboard Admin" />

            <div className="space-y-6 max-w-[1600px] mx-auto">

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
                    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-xs flex items-center justify-between">
                        <div>
                            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
                                Antrean Pasien Hari Ini
                            </span>
                            <span className="text-2xl font-black text-gray-900 mt-1 block">
                                {metrics.total_antrean_hari_ini}
                            </span>
                            
                        </div>
                        <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
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
                                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                />
                            </svg>
                        </div>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-xs flex items-center justify-between">
                        <div>
                            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
                                Menunggu Dokter
                            </span>
                            <span className="text-2xl font-black text-amber-600 mt-1 block">
                                {metrics.menunggu_hari_ini}
                            </span>

                        </div>
                        <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
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
                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                        </div>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-xs flex items-center justify-between">
                        <div>
                            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
                                Pemilik Terdata (NIK)
                            </span>
                            <span className="text-2xl font-black text-blue-600 mt-1 block">
                                {metrics.total_pemilik}
                            </span>

                        </div>
                        <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
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
                                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                />
                            </svg>
                        </div>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-xs flex items-center justify-between">
                        <div>
                            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
                                Pasien Hewan Aktif
                            </span>
                            <span className="text-2xl font-black text-emerald-600 mt-1 block">
                                {metrics.total_hewan}
                            </span>
                        </div>
                        <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
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
                                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-gray-200 shadow-xs">
                        <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-purple-600" />
                            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                                Grafik Analitik &amp; Tren Pelayanan Puskeswan
                            </h3>
                            <span className="text-xs text-gray-400 hidden md:inline">
                                |
                            </span>
                            <span className="text-xs text-gray-500 hidden md:inline">
                                Periode:{" "}
                                <strong className="text-purple-700">
                                    {PERIOD_LABELS[currentPeriod] ||
                                        currentPeriod}
                                </strong>
                            </span>
                        </div>

                        <div className="flex items-center gap-1.5 self-stretch sm:self-auto overflow-x-auto">
                            {(["7d", "30d", "6m", "1y"] as const).map(
                                (periodKey) => (
                                    <button
                                        key={periodKey}
                                        type="button"
                                        onClick={() =>
                                            handlePeriodChange(periodKey)
                                        }
                                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                                            currentPeriod === periodKey
                                                ? "bg-purple-600 text-white shadow-xs"
                                                : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900"
                                        }`}
                                    >
                                        {PERIOD_LABELS[periodKey]}
                                    </button>
                                ),
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs flex flex-col justify-between">
                            <div>
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-gray-100 mb-4">
                                    <div className="flex items-center gap-2.5">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-700 border border-purple-100">
                                            <svg
                                                className="h-5 w-5"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                                />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-gray-900">
                                                Tren Rekam Medis &amp; Kunjungan
                                                Pasien
                                            </h3>
                                            <p className="text-xs text-gray-400">
                                                Volume registrasi pasien &amp;
                                                penyelesaian tindakan dokter
                                            </p>
                                        </div>
                                    </div>
                                    <span className="self-start sm:self-auto inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                                        <span className="h-1.5 w-1.5 rounded-full bg-purple-600 animate-pulse" />
                                        {medicalChart.summary.completion_rate}%
                                        Selesai
                                    </span>
                                </div>

                                <div className="grid grid-cols-3 gap-2.5 mb-4 text-center">
                                    <div className="p-2.5 rounded-xl bg-purple-50/60 border border-purple-100">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 block">
                                            Total Pasien
                                        </span>
                                        <span className="text-base sm:text-lg font-black text-purple-950 mt-0.5 block">
                                            {medicalChart.summary.total}{" "}
                                            <span className="text-xs font-normal text-purple-600">
                                                Pasien
                                            </span>
                                        </span>
                                    </div>
                                    <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-100">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
                                            Tindakan Selesai
                                        </span>
                                        <span className="text-base sm:text-lg font-black text-emerald-950 mt-0.5 block">
                                            {medicalChart.summary.selesai}{" "}
                                            <span className="text-xs font-normal text-emerald-600">
                                                Selesai
                                            </span>
                                        </span>
                                    </div>
                                    <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-100">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block">
                                            Antre / Tunggu
                                        </span>
                                        <span className="text-base sm:text-lg font-black text-amber-950 mt-0.5 block">
                                            {medicalChart.summary.antri}{" "}
                                            <span className="text-xs font-normal text-amber-600">
                                                Antre
                                            </span>
                                        </span>
                                    </div>
                                </div>

                                <div className="relative w-full">
                                    {hoveredMedical && (
                                        <div className="absolute top-2 right-2 z-10 rounded-lg bg-gray-900/90 text-white px-2.5 py-1.5 text-[11px] shadow-lg pointer-events-none backdrop-blur-xs">
                                            <div className="font-bold text-purple-300">
                                                {hoveredMedical.full_label}
                                            </div>
                                            <div className="text-gray-200 mt-0.5">
                                                Total Pasien:{" "}
                                                <span className="font-semibold text-white">
                                                    {hoveredMedical.total}
                                                </span>
                                            </div>
                                            <div className="text-emerald-400">
                                                Selesai:{" "}
                                                <span className="font-semibold">
                                                    {hoveredMedical.selesai}
                                                </span>{" "}
                                                &bull; Antre:{" "}
                                                {hoveredMedical.antri}
                                            </div>
                                        </div>
                                    )}

                                    <svg
                                        viewBox={`0 0 ${medSvgWidth} ${medSvgHeight}`}
                                        className="w-full h-44 sm:h-48 overflow-visible select-none"
                                        onMouseLeave={() =>
                                            setHoveredMedical(null)
                                        }
                                    >
                                        <defs>
                                            <linearGradient
                                                id="admin-medical-gradient"
                                                x1="0"
                                                y1="0"
                                                x2="0"
                                                y2="1"
                                            >
                                                <stop
                                                    offset="0%"
                                                    stopColor="#8b5cf6"
                                                    stopOpacity="0.4"
                                                />
                                                <stop
                                                    offset="100%"
                                                    stopColor="#8b5cf6"
                                                    stopOpacity="0.02"
                                                />
                                            </linearGradient>
                                        </defs>

                                        {[0, 0.25, 0.5, 0.75, 1].map(
                                            (pct, idx) => {
                                                const y =
                                                    medPadding.top +
                                                    medPlotH * (1 - pct);
                                                const val = Math.round(
                                                    maxMedVal * pct,
                                                );
                                                return (
                                                    <g key={idx}>
                                                        <line
                                                            x1={medPadding.left}
                                                            y1={y}
                                                            x2={
                                                                medSvgWidth -
                                                                medPadding.right
                                                            }
                                                            y2={y}
                                                            stroke="#e5e7eb"
                                                            strokeDasharray="3 3"
                                                            strokeWidth="1"
                                                        />
                                                        <text
                                                            x={
                                                                medPadding.left -
                                                                6
                                                            }
                                                            y={y + 3}
                                                            textAnchor="end"
                                                            className="text-[9px] fill-gray-400 font-medium"
                                                        >
                                                            {val}
                                                        </text>
                                                    </g>
                                                );
                                            },
                                        )}

                                        {medAreaD && (
                                            <path
                                                d={medAreaD}
                                                fill="url(#admin-medical-gradient)"
                                            />
                                        )}

                                        {hoveredMedical &&
                                            (() => {
                                                const activePt = medCoords.find(
                                                    (p) =>
                                                        p.data.key ===
                                                        hoveredMedical.key,
                                                );
                                                if (!activePt) return null;
                                                return (
                                                    <line
                                                        x1={activePt.x}
                                                        y1={medPadding.top}
                                                        x2={activePt.x}
                                                        y2={
                                                            medPadding.top +
                                                            medPlotH
                                                        }
                                                        stroke="#a78bfa"
                                                        strokeDasharray="3 3"
                                                        strokeWidth="1.5"
                                                    />
                                                );
                                            })()}

                                        {medPathD && (
                                            <path
                                                d={medPathD}
                                                fill="none"
                                                stroke="#7c3aed"
                                                strokeWidth="2.5"
                                                strokeLinecap="round"
                                            />
                                        )}

                                        {medCoords.map((pt, idx) => {
                                            const isHovered =
                                                hoveredMedical?.key ===
                                                pt.data.key;
                                            return (
                                                <g key={idx}>
                                                    {isHovered && (
                                                        <circle
                                                            cx={pt.x}
                                                            cy={pt.y}
                                                            r="7"
                                                            fill="none"
                                                            stroke="#7c3aed"
                                                            strokeWidth="2"
                                                            className="animate-pulse"
                                                        />
                                                    )}
                                                    <circle
                                                        cx={pt.x}
                                                        cy={pt.y}
                                                        r={isHovered ? 5 : 3.5}
                                                        fill="#ffffff"
                                                        stroke="#7c3aed"
                                                        strokeWidth={
                                                            isHovered ? 3 : 2
                                                        }
                                                        className="transition-all"
                                                    />
                                                    {(medPointsData.length <=
                                                        12 ||
                                                        idx %
                                                            Math.ceil(
                                                                medPointsData.length /
                                                                    8,
                                                            ) ===
                                                            0 ||
                                                        idx ===
                                                            medPointsData.length -
                                                                1) && (
                                                        <text
                                                            x={pt.x}
                                                            y={medSvgHeight - 6}
                                                            textAnchor="middle"
                                                            className="text-[9px] fill-gray-400 font-medium select-none pointer-events-none"
                                                        >
                                                            {pt.data.label}
                                                        </text>
                                                    )}
                                                </g>
                                            );
                                        })}

                                        {medCoords.map((pt, idx) => {
                                            const sliceW =
                                                medPlotW /
                                                Math.max(
                                                    medPointsData.length - 1,
                                                    1,
                                                );
                                            const sliceX =
                                                idx === 0
                                                    ? medPadding.left
                                                    : pt.x - sliceW / 2;
                                            const actualW =
                                                idx === 0 ||
                                                idx === medCoords.length - 1
                                                    ? sliceW / 2
                                                    : sliceW;
                                            return (
                                                <rect
                                                    key={`hit-med-${idx}`}
                                                    x={sliceX}
                                                    y={0}
                                                    width={Math.max(
                                                        actualW,
                                                        10,
                                                    )}
                                                    height={medSvgHeight}
                                                    fill="transparent"
                                                    className="cursor-pointer"
                                                    onMouseEnter={() =>
                                                        setHoveredMedical(
                                                            pt.data,
                                                        )
                                                    }
                                                />
                                            );
                                        })}
                                    </svg>
                                </div>
                            </div>

                            <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs mt-3">
                                <span className="text-gray-400 flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-purple-600" />
                                    Total Kunjungan Pasien
                                </span>
                                <Link
                                    href="/admin/rekam-medis/hasil"
                                    className="font-bold text-purple-700 hover:text-purple-800 hover:underline flex items-center gap-1"
                                >
                                    <span>Lihat Hasil Rekam Medis</span>
                                    <svg
                                        className="w-3.5 h-3.5"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M9 5l7 7-7 7"
                                        />
                                    </svg>
                                </Link>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs flex flex-col justify-between">
                            <div>
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-gray-100 mb-4">
                                    <div className="flex items-center gap-2.5">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-700 border border-rose-100">
                                            <svg
                                                className="h-5 w-5"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                                />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-gray-900">
                                                Surveilans Kasus Gigitan Rabies
                                                (GHPR)
                                            </h3>
                                            <p className="text-xs text-gray-400">
                                                Insiden gigitan &amp; cakupan
                                                vaksinasi anti rabies (VAR)
                                            </p>
                                        </div>
                                    </div>
                                    <span className="self-start sm:self-auto inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                                        <span className="h-1.5 w-1.5 rounded-full bg-rose-600 animate-pulse" />
                                        {rabiesChart.summary.var_coverage_rate}%
                                        Cakupan VAR
                                    </span>
                                </div>

                                <div className="grid grid-cols-3 gap-2.5 mb-4 text-center">
                                    <div className="p-2.5 rounded-xl bg-rose-50/60 border border-rose-100">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 block">
                                            Total Kasus GHPR
                                        </span>
                                        <span className="text-base sm:text-lg font-black text-rose-950 mt-0.5 block">
                                            {rabiesChart.summary.total_kasus}{" "}
                                            <span className="text-xs font-normal text-rose-600">
                                                Kasus
                                            </span>
                                        </span>
                                    </div>
                                    <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-100">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
                                            Diberikan VAR
                                        </span>
                                        <span className="text-base sm:text-lg font-black text-emerald-950 mt-0.5 block">
                                            {rabiesChart.summary.total_var}{" "}
                                            <span className="text-xs font-normal text-emerald-600">
                                                Pasien
                                            </span>
                                        </span>
                                    </div>
                                    <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-100">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block">
                                            Karantina Observasi
                                        </span>
                                        <span className="text-base sm:text-lg font-black text-amber-950 mt-0.5 block">
                                            {
                                                rabiesChart.summary
                                                    .total_observasi
                                            }{" "}
                                            <span className="text-xs font-normal text-amber-600">
                                                Hewan
                                            </span>
                                        </span>
                                    </div>
                                </div>

                                <div className="relative w-full">
                                    {hoveredRabies && (
                                        <div className="absolute top-2 right-2 z-10 rounded-lg bg-gray-900/90 text-white px-2.5 py-1.5 text-[11px] shadow-lg pointer-events-none backdrop-blur-xs">
                                            <div className="font-bold text-rose-300">
                                                {hoveredRabies.full_label}
                                            </div>
                                            <div className="text-gray-200 mt-0.5">
                                                Kasus GHPR:{" "}
                                                <span className="font-semibold text-rose-400">
                                                    {hoveredRabies.kasus}
                                                </span>
                                            </div>
                                            <div className="text-emerald-400">
                                                Diberi VAR:{" "}
                                                <span className="font-semibold">
                                                    {hoveredRabies.var}
                                                </span>{" "}
                                                &bull; Observasi:{" "}
                                                {hoveredRabies.observasi}
                                            </div>
                                        </div>
                                    )}

                                    <svg
                                        viewBox={`0 0 ${rabSvgWidth} ${rabSvgHeight}`}
                                        className="w-full h-44 sm:h-48 overflow-visible select-none"
                                        onMouseLeave={() =>
                                            setHoveredRabies(null)
                                        }
                                    >
                                        {[0, 0.25, 0.5, 0.75, 1].map(
                                            (pct, idx) => {
                                                const y =
                                                    rabPadding.top +
                                                    rabPlotH * (1 - pct);
                                                const val = Math.round(
                                                    maxRabVal * pct,
                                                );
                                                return (
                                                    <g key={idx}>
                                                        <line
                                                            x1={rabPadding.left}
                                                            y1={y}
                                                            x2={
                                                                rabSvgWidth -
                                                                rabPadding.right
                                                            }
                                                            y2={y}
                                                            stroke="#e5e7eb"
                                                            strokeDasharray="3 3"
                                                            strokeWidth="1"
                                                        />
                                                        <text
                                                            x={
                                                                rabPadding.left -
                                                                6
                                                            }
                                                            y={y + 3}
                                                            textAnchor="end"
                                                            className="text-[9px] fill-gray-400 font-medium"
                                                        >
                                                            {val}
                                                        </text>
                                                    </g>
                                                );
                                            },
                                        )}

                                        {hoveredRabies &&
                                            (() => {
                                                const activeIdx =
                                                    rabPointsData.findIndex(
                                                        (p) =>
                                                            p.key ===
                                                            hoveredRabies.key,
                                                    );
                                                if (activeIdx === -1)
                                                    return null;
                                                const bandLeft =
                                                    rabPadding.left +
                                                    activeIdx * rabBandW;
                                                return (
                                                    <rect
                                                        x={bandLeft + 1}
                                                        y={rabPadding.top}
                                                        width={Math.max(
                                                            rabBandW - 2,
                                                            4,
                                                        )}
                                                        height={rabPlotH}
                                                        rx="4"
                                                        fill="#ffe4e6"
                                                        opacity="0.6"
                                                    />
                                                );
                                            })()}

                                        {rabPointsData.map((pt, idx) => {
                                            const bandCenter =
                                                rabPadding.left +
                                                (idx + 0.5) * rabBandW;
                                            const hKasus =
                                                maxRabVal > 0
                                                    ? (pt.kasus / maxRabVal) *
                                                      rabPlotH
                                                    : 0;
                                            const hVar =
                                                maxRabVal > 0
                                                    ? (pt.var / maxRabVal) *
                                                      rabPlotH
                                                    : 0;
                                            const yKasus =
                                                rabPadding.top +
                                                rabPlotH -
                                                hKasus;
                                            const yVar =
                                                rabPadding.top +
                                                rabPlotH -
                                                hVar;
                                            const isHovered =
                                                hoveredRabies?.key === pt.key;

                                            return (
                                                <g key={idx}>
                                                    <rect
                                                        x={
                                                            bandCenter -
                                                            rabBarW -
                                                            1
                                                        }
                                                        y={yKasus}
                                                        width={rabBarW}
                                                        height={Math.max(
                                                            hKasus,
                                                            2,
                                                        )}
                                                        rx="2"
                                                        className={`transition-colors ${isHovered ? "fill-rose-600" : "fill-rose-500"}`}
                                                    />
                                                    <rect
                                                        x={bandCenter + 1}
                                                        y={yVar}
                                                        width={rabBarW}
                                                        height={Math.max(
                                                            hVar,
                                                            2,
                                                        )}
                                                        rx="2"
                                                        className={`transition-colors ${isHovered ? "fill-emerald-600" : "fill-emerald-500"}`}
                                                    />
                                                    {(rabPointsData.length <=
                                                        12 ||
                                                        idx %
                                                            Math.ceil(
                                                                rabPointsData.length /
                                                                    8,
                                                            ) ===
                                                            0 ||
                                                        idx ===
                                                            rabPointsData.length -
                                                                1) && (
                                                        <text
                                                            x={bandCenter}
                                                            y={rabSvgHeight - 6}
                                                            textAnchor="middle"
                                                            className="text-[9px] fill-gray-400 font-medium select-none pointer-events-none"
                                                        >
                                                            {pt.label}
                                                        </text>
                                                    )}
                                                </g>
                                            );
                                        })}

                                        {rabPointsData.map((pt, idx) => {
                                            const bandLeft =
                                                rabPadding.left +
                                                idx * rabBandW;
                                            return (
                                                <rect
                                                    key={`hit-rab-${idx}`}
                                                    x={bandLeft}
                                                    y={0}
                                                    width={rabBandW}
                                                    height={rabSvgHeight}
                                                    fill="transparent"
                                                    className="cursor-pointer"
                                                    onMouseEnter={() =>
                                                        setHoveredRabies(pt)
                                                    }
                                                />
                                            );
                                        })}
                                    </svg>
                                </div>
                            </div>

                            <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs mt-3">
                                <div className="flex items-center gap-3 text-[11px] text-gray-500">
                                    <span className="flex items-center gap-1.5">
                                        <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" />
                                        Kasus Gigitan
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
                                        Diberi VAR
                                    </span>
                                </div>
                                <Link
                                    href="/admin/rabies"
                                    className="font-bold text-rose-700 hover:text-rose-800 hover:underline flex items-center gap-1"
                                >
                                    <span>Lihat Riwayat Kasus</span>
                                    <svg
                                        className="w-3.5 h-3.5"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M9 5l7 7-7 7"
                                        />
                                    </svg>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    <div className="xl:col-span-2 space-y-3">
                        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xs">
                            <div className="p-3.5 border-b border-gray-200 bg-white flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <div className="h-8 w-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
                                        <svg
                                            className="h-4 w-4"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                            />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                                            Antrean Pasien Hari Ini
                                        </h3>
                                        <p className="text-[11px] text-gray-500">
                                            Monitoring live pasien yang menunggu
                                            giliran periksa dokter.
                                        </p>
                                    </div>
                                </div>
                                <Link
                                    href="/admin/rekam-medis/antrian"
                                    className="text-xs font-bold text-purple-700 hover:text-purple-800 hover:underline flex items-center gap-1"
                                >
                                    <span>Lihat Semua Antrean</span>
                                    <svg
                                        className="w-3.5 h-3.5"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M9 5l7 7-7 7"
                                        />
                                    </svg>
                                </Link>
                            </div>

                            <div className="overflow-x-auto min-h-[310px]">
                                <table className="w-full text-left text-xs border-collapse border border-gray-200">
                                    <thead>
                                        <tr className="bg-gray-100/90 border-b border-gray-200 text-[11px] font-bold uppercase tracking-wider text-gray-700">
                                            <th className="py-2.5 px-3 border-r border-gray-200 text-center font-bold w-16">
                                                No. Antre
                                            </th>
                                            <th className="py-2.5 px-3 border-r border-gray-200 text-center font-bold">
                                                Pasien Hewan
                                            </th>
                                            <th className="py-2.5 px-3 border-r border-gray-200 text-center font-bold">
                                                No. RM
                                            </th>
                                            <th className="py-2.5 px-3 border-r border-gray-200 text-center font-bold">
                                                Pemilik
                                            </th>
                                            <th className="py-2.5 px-3 border-r border-gray-200 text-center font-bold">
                                                Triage
                                            </th>
                                            <th className="py-2.5 px-3 text-center font-bold w-28">
                                                Status
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {todayVisits.length === 0 ? (
                                            <tr>
                                                <td
                                                    colSpan={6}
                                                    className="py-14 text-center"
                                                >
                                                    <div className="flex flex-col items-center justify-center">
                                                        <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-2">
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
                                                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                                />
                                                            </svg>
                                                        </div>
                                                        <p className="font-semibold text-gray-700 text-xs">
                                                            Belum ada antrean
                                                            pasien untuk hari
                                                            ini
                                                        </p>
                                                        <p className="text-[11px] text-gray-400 mt-0.5">
                                                            Klik tombol
                                                            'Daftarkan Pasien
                                                            Baru' untuk memulai
                                                            registrasi antrean.
                                                        </p>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            <>
                                                {todayVisits.map((item) => (
                                                    <tr
                                                        key={item.id}
                                                        className="odd:bg-white even:bg-gray-50/70 hover:bg-purple-50/40 transition-colors h-[54px]"
                                                    >
                                                        <td className="py-2 px-3 border-r border-gray-200 text-center font-black font-mono text-purple-700 text-sm">
                                                            {item.no_antrean}
                                                        </td>
                                                        <td className="py-2 px-3 border-r border-gray-200">
                                                            <span className="font-bold text-gray-900 block leading-tight">
                                                                {
                                                                    item.nama_hewan
                                                                }
                                                            </span>
                                                            <span className="text-[11px] text-gray-500 block">
                                                                {
                                                                    item.jenis_hewan
                                                                }
                                                            </span>
                                                        </td>
                                                        <td className="py-2 px-3 border-r border-gray-200 font-mono font-bold text-gray-800 text-xs">
                                                            {item.no_rm}
                                                        </td>
                                                        <td className="py-2 px-3 border-r border-gray-200">
                                                            <span className="font-medium text-gray-900 block leading-tight">
                                                                {item.pemilik}
                                                            </span>
                                                            <span className="text-[10px] text-gray-500 font-mono block">
                                                                {item.no_hp}
                                                            </span>
                                                        </td>
                                                        <td className="py-2 px-3 border-r border-gray-200 text-[11px] text-gray-600">
                                                            <div>
                                                                BB:{" "}
                                                                {
                                                                    item.berat_badan
                                                                }
                                                            </div>
                                                            <div>
                                                                Suhu:{" "}
                                                                {
                                                                    item.suhu_tubuh
                                                                }
                                                            </div>
                                                        </td>
                                                        <td className="py-2 px-3 text-center">
                                                            {item.status_antrean ===
                                                                "Pemeriksaan" && (
                                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold text-[10px] bg-blue-50 text-blue-700 border border-blue-200">
                                                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                                                                    Diperiksa
                                                                </span>
                                                            )}
                                                            {item.status_antrean ===
                                                                "Antri" && (
                                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold text-[10px] bg-amber-50 text-amber-700 border border-amber-200">
                                                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                                                    Antri
                                                                </span>
                                                            )}
                                                            {item.status_antrean ===
                                                                "Selesai" && (
                                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                                    Selesai
                                                                </span>
                                                            )}
                                                            {item.status_antrean ===
                                                                "Batal" && (
                                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold text-[10px] bg-rose-50 text-rose-700 border border-rose-200">
                                                                    Batal
                                                                </span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                                {todayVisits.length < 5 &&
                                                    Array.from({
                                                        length:
                                                            5 -
                                                            todayVisits.length,
                                                    }).map((_, idx) => (
                                                        <tr
                                                            key={`empty-${idx}`}
                                                            aria-hidden="true"
                                                            className="odd:bg-white even:bg-gray-50/70 h-[54px]"
                                                        >
                                                            <td className="py-2 px-3 border-r border-gray-200 text-center">
                                                                &nbsp;
                                                            </td>
                                                            <td className="py-2 px-3 border-r border-gray-200">
                                                                &nbsp;
                                                            </td>
                                                            <td className="py-2 px-3 border-r border-gray-200">
                                                                &nbsp;
                                                            </td>
                                                            <td className="py-2 px-3 border-r border-gray-200">
                                                                &nbsp;
                                                            </td>
                                                            <td className="py-2 px-3 border-r border-gray-200">
                                                                &nbsp;
                                                            </td>
                                                            <td className="py-2 px-3 text-center">
                                                                &nbsp;
                                                            </td>
                                                        </tr>
                                                    ))}
                                            </>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-xs">
                            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                                <span className="text-purple-600">🐾</span>
                                Alur Pendaftaran Pasien (SOP)
                            </h4>
                            <div className="space-y-2.5">
                                <div className="flex gap-2.5 items-start p-2.5 rounded-lg bg-gray-50 border border-gray-100">
                                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-700 text-white text-[11px] font-bold">
                                        1
                                    </span>
                                    <div>
                                        <p className="text-xs font-bold text-gray-900">
                                            Ketik NIK Pemilik (16 Digit)
                                        </p>
                                        <p className="text-[11px] text-gray-500 mt-0.5">
                                            Jika sudah pernah berkunjung, data
                                            diri dan daftar hewan langsung
                                            terisi otomatis.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-2.5 items-start p-2.5 rounded-lg bg-gray-50 border border-gray-100">
                                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-700 text-white text-[11px] font-bold">
                                        2
                                    </span>
                                    <div>
                                        <p className="text-xs font-bold text-gray-900">
                                            Pilih Pasien / Hewan Baru
                                        </p>
                                        <p className="text-[11px] text-gray-500 mt-0.5">
                                            Gunakan No. RM lama jika hewan yang
                                            sama, atau generate RM baru (1 hewan
                                            = 1 RM).
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-2.5 items-start p-2.5 rounded-lg bg-gray-50 border border-gray-100">
                                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-700 text-white text-[11px] font-bold">
                                        3
                                    </span>
                                    <div>
                                        <p className="text-xs font-bold text-gray-900">
                                            Timbang BB, Suhu &amp; Anamnesa
                                        </p>
                                        <p className="text-[11px] text-gray-500 mt-0.5">
                                            Catat keluhan awal sebelum pasien
                                            dipanggil ke ruang tindakan dokter.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-xs">
                            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                <span className="text-rose-600">⚠️</span>
                                SOP Kasus Gigitan Rabies (GHPR)
                            </h4>
                            <p className="text-[11px] text-gray-500 leading-relaxed mb-2">
                                Setiap kasus gigitan hewan penular rabies wajib
                                segera dicatat dengan nomor surat otomatis,
                                dipantau status VAR korban, serta observasi
                                hewan penggigit selama 14 hari.
                            </p>
                            <Link
                                href="/admin/rabies/create"
                                className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 hover:text-rose-800 hover:underline"
                            >
                                <span>Buka Form Surveilans GHPR</span>
                                <svg
                                    className="w-3.5 h-3.5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M9 5l7 7-7 7"
                                    />
                                </svg>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
