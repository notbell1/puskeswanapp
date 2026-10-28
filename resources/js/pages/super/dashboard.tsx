import React, { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import DashboardLayout from '@/layouts/DashboardLayout';

interface MetricProps {
    total_users: number;
    total_staff: number;
    total_animals: number;
    total_visits: number;
    total_medicines: number;
    critical_medicines: number;
    total_inventories: number;
    active_rabies_cases: number;
    total_articles: number;
}

interface MonthlyMedicalData {
    month_key: string;
    label: string;
    full_label: string;
    total: number;
    selesai: number;
    antri: number;
}

interface SpeciesData {
    name: string;
    count: number;
}

interface MonthlyRabiesData {
    month_key: string;
    label: string;
    full_label: string;
    kasus: number;
    var: number;
    observasi: number;
}

interface StatusHewanData {
    status: string;
    count: number;
}

interface SuperDashboardProps {
    metrics?: MetricProps;
    recent_visits?: Array<{
        id: number;
        no_rm: string;
        nama_hewan: string;
        jenis_hewan: string;
        pemilik: string;
        tgl_kunjungan: string;
        status_antrean: string;
    }>;
    low_stock_medicines?: Array<{
        id: number;
        kode_obat: string;
        nama_obat: string;
        stok: number;
        satuan: string;
    }>;
    medical_chart?: {
        monthly: MonthlyMedicalData[];
        species: SpeciesData[];
        summary: {
            total_6m: number;
            selesai_6m: number;
            avg_monthly: number;
            completion_rate: number;
        };
    };
    rabies_chart?: {
        monthly: MonthlyRabiesData[];
        status_hewan: StatusHewanData[];
        summary: {
            total_6m: number;
            var_6m: number;
            observasi_6m: number;
            var_coverage_rate: number;
        };
    };
}

export default function SuperDashboard({
    metrics,
    recent_visits = [],
    low_stock_medicines = [],
    medical_chart = {
        monthly: [],
        species: [],
        summary: { total_6m: 0, selesai_6m: 0, avg_monthly: 0, completion_rate: 100 },
    },
    rabies_chart = {
        monthly: [],
        status_hewan: [],
        summary: { total_6m: 0, var_6m: 0, observasi_6m: 0, var_coverage_rate: 100 },
    },
}: SuperDashboardProps) {
    const { auth } = usePage().props;
    const user = (auth as any)?.user || {};

    const [hoveredMedicalMonth, setHoveredMedicalMonth] = useState<MonthlyMedicalData | null>(null);
    const [hoveredRabiesMonth, setHoveredRabiesMonth] = useState<MonthlyRabiesData | null>(null);

    const stats = [
        {
            label: 'Total Akun Pengguna',
            value: metrics?.total_users ?? 3,
            unit: 'Akun',
            trend: `${metrics?.total_staff ?? 3} Staf Terdaftar`,
            color: 'bg-purple-50 text-purple-700 border-purple-100',
            href: '/super/pengguna',
            icon: (
                <svg className="w-5 h-5 text-purple-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            ),
        },
        {
            label: 'Total Kunjungan Medis',
            value: metrics?.total_visits ?? 0,
            unit: 'Pasien',
            trend: `${metrics?.total_animals ?? 0} Hewan Terdata`,
            color: 'bg-blue-50 text-blue-700 border-blue-100',
            href: '/super/laporan/rekam-medis',
            icon: (
                <svg className="w-5 h-5 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
            ),
        },
        {
            label: 'Stok Obat & Vaksin',
            value: metrics?.total_medicines ?? 0,
            unit: 'Jenis',
            trend: metrics?.critical_medicines ? `${metrics.critical_medicines} Perlu Restock` : 'Stok Aman',
            color: metrics?.critical_medicines ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-100',
            href: '/super/obat',
            icon: (
                <svg className="w-5 h-5 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
            ),
        },
        {
            label: 'Kasus Rabies (GHPR)',
            value: metrics?.active_rabies_cases ?? 0,
            unit: 'Kasus',
            trend: 'Surveilans Terpadu',
            color: 'bg-rose-50 text-rose-700 border-rose-100',
            href: '/super/laporan/rabies',
            icon: (
                <svg className="w-5 h-5 text-rose-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            ),
        },
    ];

    const medicalMonthly = medical_chart.monthly.length > 0
        ? medical_chart.monthly
        : [
            { month_key: '1', label: 'Mei', full_label: 'Mei 2026', total: 0, selesai: 0, antri: 0 },
            { month_key: '2', label: 'Jun', full_label: 'Jun 2026', total: 0, selesai: 0, antri: 0 },
            { month_key: '3', label: 'Jul', full_label: 'Jul 2026', total: 0, selesai: 0, antri: 0 },
            { month_key: '4', label: 'Agu', full_label: 'Agu 2026', total: 0, selesai: 0, antri: 0 },
            { month_key: '5', label: 'Sep', full_label: 'Sep 2026', total: 0, selesai: 0, antri: 0 },
            { month_key: '6', label: 'Okt', full_label: 'Okt 2026', total: 0, selesai: 0, antri: 0 },
        ];

    const maxMedicalVal = Math.max(...medicalMonthly.map((m) => m.total), 4);
    const medicalChartWidth = 520;
    const medicalChartHeight = 150;
    const medicalPadding = { top: 15, right: 20, bottom: 25, left: 30 };
    const medicalPlotWidth = medicalChartWidth - medicalPadding.left - medicalPadding.right;
    const medicalPlotHeight = medicalChartHeight - medicalPadding.top - medicalPadding.bottom;

    const medicalPoints = medicalMonthly.map((m, idx) => {
        const x = medicalPadding.left + (idx / Math.max(medicalMonthly.length - 1, 1)) * medicalPlotWidth;
        const y = medicalPadding.top + medicalPlotHeight - (m.total / maxMedicalVal) * medicalPlotHeight;
        const ySelesai = medicalPadding.top + medicalPlotHeight - (m.selesai / maxMedicalVal) * medicalPlotHeight;
        return { x, y, ySelesai, data: m };
    });

    const medicalPathD = medicalPoints.reduce((acc, pt, idx, arr) => {
        if (idx === 0) return `M ${pt.x} ${pt.y}`;
        const prev = arr[idx - 1];
        const cx1 = prev.x + (pt.x - prev.x) / 2;
        const cy1 = prev.y;
        const cx2 = prev.x + (pt.x - prev.x) / 2;
        const cy2 = pt.y;
        return `${acc} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${pt.x} ${pt.y}`;
    }, '');

    const medicalAreaD = `${medicalPathD} L ${medicalPoints[medicalPoints.length - 1].x} ${
        medicalPadding.top + medicalPlotHeight
    } L ${medicalPoints[0].x} ${medicalPadding.top + medicalPlotHeight} Z`;

    const rabiesMonthly = rabies_chart.monthly.length > 0
        ? rabies_chart.monthly
        : [
            { month_key: '1', label: 'Mei', full_label: 'Mei 2026', kasus: 0, var: 0, observasi: 0 },
            { month_key: '2', label: 'Jun', full_label: 'Jun 2026', kasus: 0, var: 0, observasi: 0 },
            { month_key: '3', label: 'Jul', full_label: 'Jul 2026', kasus: 0, var: 0, observasi: 0 },
            { month_key: '4', label: 'Agu', full_label: 'Agu 2026', kasus: 0, var: 0, observasi: 0 },
            { month_key: '5', label: 'Sep', full_label: 'Sep 2026', kasus: 0, var: 0, observasi: 0 },
            { month_key: '6', label: 'Okt', full_label: 'Okt 2026', kasus: 0, var: 0, observasi: 0 },
        ];

    const maxRabiesVal = Math.max(...rabiesMonthly.map((r) => Math.max(r.kasus, r.var)), 4);
    const rabiesChartWidth = 520;
    const rabiesChartHeight = 150;
    const rabiesPadding = { top: 15, right: 20, bottom: 25, left: 30 };
    const rabiesPlotWidth = rabiesChartWidth - rabiesPadding.left - rabiesPadding.right;
    const rabiesPlotHeight = rabiesChartHeight - rabiesPadding.top - rabiesPadding.bottom;

    const barBandWidth = rabiesPlotWidth / rabiesMonthly.length;
    const singleBarWidth = Math.min(barBandWidth * 0.35, 18);

    return (
        <DashboardLayout title="Dashboard Super Admin">
            <Head title="Dashboard Super Admin" />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {stats.map((item, idx) => (
                    <Link
                        key={idx}
                        href={item.href}
                        className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-xs hover:shadow-md hover:border-purple-200 transition-all flex flex-col justify-between group"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 group-hover:scale-105 transition-transform">
                                {item.icon}
                            </div>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${item.color}`}>
                                {item.trend}
                            </span>
                        </div>
                        <div>
                            <div className="flex items-baseline gap-1.5 mt-2">
                                <h3 className="text-2xl font-black text-gray-900 tracking-tight">{item.value}</h3>
                                <span className="text-xs text-gray-400 font-medium">{item.unit}</span>
                            </div>
                            <p className="text-xs font-medium text-gray-500 mt-0.5">{item.label}</p>
                        </div>
                    </Link>
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 mb-6">
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs flex flex-col justify-between">
                    <div>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-gray-100 mb-4">
                            <div className="flex items-center gap-2.5">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-700 border border-purple-100">
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                                        Statistik Tren Rekam Medis Pasien
                                    </h3>
                                    <p className="text-xs text-gray-400">
                                        Fluktuasi volume kunjungan &amp; rekap status tindakan (6 Bulan Terakhir)
                                    </p>
                                </div>
                            </div>
                            <span className="self-start sm:self-auto inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                                <span className="h-1.5 w-1.5 rounded-full bg-purple-600 animate-pulse" />
                                {medical_chart.summary.completion_rate}% Selesai
                            </span>
                        </div>

                        <div className="grid grid-cols-3 gap-2.5 mb-4 text-center">
                            <div className="p-2.5 rounded-xl bg-purple-50/60 border border-purple-100">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 block">
                                    Total Kunjungan
                                </span>
                                <span className="text-base sm:text-lg font-black text-purple-950 mt-0.5 block">
                                    {medical_chart.summary.total_6m} <span className="text-xs font-normal text-purple-600">Pasien</span>
                                </span>
                            </div>
                            <div className="p-2.5 rounded-xl bg-indigo-50/60 border border-indigo-100">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 block">
                                    Rata-Rata / Bln
                                </span>
                                <span className="text-base sm:text-lg font-black text-indigo-950 mt-0.5 block">
                                    {medical_chart.summary.avg_monthly} <span className="text-xs font-normal text-indigo-600">Kunjungan</span>
                                </span>
                            </div>
                            <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-100">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
                                    Tindakan Tuntas
                                </span>
                                <span className="text-base sm:text-lg font-black text-emerald-950 mt-0.5 block">
                                    {medical_chart.summary.selesai_6m} <span className="text-xs font-normal text-emerald-600">Selesai</span>
                                </span>
                            </div>
                        </div>

                        <div className="relative w-full">
                            {hoveredMedicalMonth && (
                                <div className="absolute top-2 right-2 z-10 rounded-lg bg-gray-900/90 text-white px-2.5 py-1.5 text-[11px] shadow-lg pointer-events-none backdrop-blur-xs">
                                    <div className="font-bold text-purple-300">{hoveredMedicalMonth.full_label}</div>
                                    <div className="text-gray-200 mt-0.5">
                                        Total: <span className="font-semibold">{hoveredMedicalMonth.total} pasien</span>
                                    </div>
                                    <div className="text-emerald-400">
                                        Selesai: <span className="font-semibold">{hoveredMedicalMonth.selesai}</span> &bull; Antre: {hoveredMedicalMonth.antri}
                                    </div>
                                </div>
                            )}

                            <svg
                                viewBox={`0 0 ${medicalChartWidth} ${medicalChartHeight}`}
                                className="w-full h-44 sm:h-48 overflow-visible"
                            >
                                <defs>
                                    <linearGradient id="medical-area-gradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.35" />
                                        <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.02" />
                                    </linearGradient>
                                </defs>

                                {[0, 0.5, 1].map((pct, i) => {
                                    const y = medicalPadding.top + medicalPlotHeight * (1 - pct);
                                    const val = Math.round(maxMedicalVal * pct);
                                    return (
                                        <g key={i}>
                                            <line
                                                x1={medicalPadding.left}
                                                y1={y}
                                                x2={medicalChartWidth - medicalPadding.right}
                                                y2={y}
                                                stroke="#f1f5f9"
                                                strokeWidth="1"
                                                strokeDasharray="4 4"
                                            />
                                            <text
                                                x={medicalPadding.left - 6}
                                                y={y + 3}
                                                textAnchor="end"
                                                className="text-[9px] fill-gray-400 font-mono font-medium"
                                            >
                                                {val}
                                            </text>
                                        </g>
                                    );
                                })}

                                <path d={medicalAreaD} fill="url(#medical-area-gradient)" />

                                <path
                                    d={medicalPathD}
                                    fill="none"
                                    stroke="#7c3aed"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                />

                                {medicalPoints.map((pt, idx) => (
                                    <g
                                        key={idx}
                                        onMouseEnter={() => setHoveredMedicalMonth(pt.data)}
                                        onMouseLeave={() => setHoveredMedicalMonth(null)}
                                        className="cursor-pointer"
                                    >
                                        <rect
                                            x={pt.x - 20}
                                            y={medicalPadding.top}
                                            width="40"
                                            height={medicalPlotHeight}
                                            fill="transparent"
                                        />

                                        <circle
                                            cx={pt.x}
                                            cy={pt.y}
                                            r={hoveredMedicalMonth?.month_key === pt.data.month_key ? '7' : '4.5'}
                                            fill="#ffffff"
                                            stroke="#7c3aed"
                                            strokeWidth="2.5"
                                            className="transition-all duration-150"
                                        />

                                        <circle
                                            cx={pt.x}
                                            cy={pt.y}
                                            r="2"
                                            fill="#7c3aed"
                                        />

                                        <text
                                            x={pt.x}
                                            y={medicalChartHeight - 6}
                                            textAnchor="middle"
                                            className={`text-[10px] font-semibold transition-colors ${
                                                hoveredMedicalMonth?.month_key === pt.data.month_key
                                                    ? 'fill-purple-700 font-bold'
                                                    : 'fill-gray-400'
                                            }`}
                                        >
                                            {pt.data.label}
                                        </text>
                                    </g>
                                ))}
                            </svg>
                        </div>

                        {medical_chart.species.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-gray-100">
                                <span className="text-[10.5px] font-bold text-gray-500 uppercase tracking-wider block mb-2">
                                    Spesies Pasien Terbanyak
                                </span>
                                <div className="space-y-1.5">
                                    {medical_chart.species.map((sp, idx) => {
                                        const totalAll = medical_chart.species.reduce((a, b) => a + b.count, 0);
                                        const pct = totalAll > 0 ? Math.round((sp.count / totalAll) * 100) : 0;
                                        return (
                                            <div key={idx} className="flex items-center justify-between text-xs gap-3">
                                                <span className="text-gray-700 font-medium truncate max-w-[150px]">
                                                    {sp.name}
                                                </span>
                                                <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 transition-all duration-500"
                                                        style={{ width: `${Math.max(pct, 6)}%` }}
                                                    />
                                                </div>
                                                <span className="font-bold text-gray-800 shrink-0 text-[11px]">
                                                    {sp.count} ({pct}%)
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs flex flex-col justify-between">
                    <div>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-gray-100 mb-4">
                            <div className="flex items-center gap-2.5">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-700 border border-rose-100">
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                                        Surveilans Kasus Gigitan Rabies (GHPR)
                                    </h3>
                                    <p className="text-xs text-gray-400">
                                        Pemantauan insiden gigitan hewan, vaksinasi VAR, &amp; masa observasi
                                    </p>
                                </div>
                            </div>
                            <span className="self-start sm:self-auto inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                                <span className="h-1.5 w-1.5 rounded-full bg-rose-600 animate-pulse" />
                                {rabies_chart.summary.var_coverage_rate}% VAR Terpenuhi
                            </span>
                        </div>

                        <div className="grid grid-cols-3 gap-2.5 mb-4 text-center">
                            <div className="p-2.5 rounded-xl bg-rose-50/60 border border-rose-100">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 block">
                                    Kasus Gigitan
                                </span>
                                <span className="text-base sm:text-lg font-black text-rose-950 mt-0.5 block">
                                    {rabies_chart.summary.total_6m} <span className="text-xs font-normal text-rose-600">Insiden</span>
                                </span>
                            </div>
                            <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-100">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block">
                                    Cakupan VAR
                                </span>
                                <span className="text-base sm:text-lg font-black text-amber-950 mt-0.5 block">
                                    {rabies_chart.summary.var_6m} <span className="text-xs font-normal text-amber-600">Vaksinasi</span>
                                </span>
                            </div>
                            <div className="p-2.5 rounded-xl bg-orange-50/60 border border-orange-100">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-orange-700 block">
                                    Masa Karantina
                                </span>
                                <span className="text-base sm:text-lg font-black text-orange-950 mt-0.5 block">
                                    {rabies_chart.summary.observasi_6m} <span className="text-xs font-normal text-orange-600">Observasi</span>
                                </span>
                            </div>
                        </div>

                        <div className="relative w-full">
                            {hoveredRabiesMonth && (
                                <div className="absolute top-2 right-2 z-10 rounded-lg bg-gray-900/90 text-white px-2.5 py-1.5 text-[11px] shadow-lg pointer-events-none backdrop-blur-xs">
                                    <div className="font-bold text-rose-300">{hoveredRabiesMonth.full_label}</div>
                                    <div className="text-rose-400 mt-0.5">
                                        Kasus Gigitan: <span className="font-semibold">{hoveredRabiesMonth.kasus} kejadian</span>
                                    </div>
                                    <div className="text-amber-400">
                                        Diberikan VAR: <span className="font-semibold">{hoveredRabiesMonth.var}</span>
                                    </div>
                                    <div className="text-orange-300">
                                        Observasi Hewan: <span className="font-semibold">{hoveredRabiesMonth.observasi}</span>
                                    </div>
                                </div>
                            )}

                            <svg
                                viewBox={`0 0 ${rabiesChartWidth} ${rabiesChartHeight}`}
                                className="w-full h-44 sm:h-48 overflow-visible"
                            >
                                {[0, 0.5, 1].map((pct, i) => {
                                    const y = rabiesPadding.top + rabiesPlotHeight * (1 - pct);
                                    const val = Math.round(maxRabiesVal * pct);
                                    return (
                                        <g key={i}>
                                            <line
                                                x1={rabiesPadding.left}
                                                y1={y}
                                                x2={rabiesChartWidth - rabiesPadding.right}
                                                y2={y}
                                                stroke="#f1f5f9"
                                                strokeWidth="1"
                                                strokeDasharray="4 4"
                                            />
                                            <text
                                                x={rabiesPadding.left - 6}
                                                y={y + 3}
                                                textAnchor="end"
                                                className="text-[9px] fill-gray-400 font-mono font-medium"
                                            >
                                                {val}
                                            </text>
                                        </g>
                                    );
                                })}

                                {rabiesMonthly.map((r, idx) => {
                                    const centerX = rabiesPadding.left + idx * barBandWidth + barBandWidth / 2;
                                    const bar1X = centerX - singleBarWidth - 2;
                                    const bar2X = centerX + 2;

                                    const bar1Height = (r.kasus / maxRabiesVal) * rabiesPlotHeight;
                                    const bar1Y = rabiesPadding.top + rabiesPlotHeight - bar1Height;

                                    const bar2Height = (r.var / maxRabiesVal) * rabiesPlotHeight;
                                    const bar2Y = rabiesPadding.top + rabiesPlotHeight - bar2Height;

                                    const isHovered = hoveredRabiesMonth?.month_key === r.month_key;

                                    return (
                                        <g
                                            key={idx}
                                            onMouseEnter={() => setHoveredRabiesMonth(r)}
                                            onMouseLeave={() => setHoveredRabiesMonth(null)}
                                            className="cursor-pointer"
                                        >
                                            <rect
                                                x={centerX - barBandWidth / 2}
                                                y={rabiesPadding.top}
                                                width={barBandWidth}
                                                height={rabiesPlotHeight}
                                                fill="transparent"
                                            />

                                            <rect
                                                x={bar1X}
                                                y={bar1Height > 0 ? bar1Y : rabiesPadding.top + rabiesPlotHeight - 2}
                                                width={singleBarWidth}
                                                height={Math.max(bar1Height, 2)}
                                                rx="4"
                                                fill={isHovered ? '#e11d48' : '#f43f5e'}
                                                className="transition-all duration-200"
                                            />

                                            <rect
                                                x={bar2X}
                                                y={bar2Height > 0 ? bar2Y : rabiesPadding.top + rabiesPlotHeight - 2}
                                                width={singleBarWidth}
                                                height={Math.max(bar2Height, 2)}
                                                rx="4"
                                                fill={isHovered ? '#d97706' : '#f59e0b'}
                                                className="transition-all duration-200"
                                            />

                                            <text
                                                x={centerX}
                                                y={rabiesChartHeight - 6}
                                                textAnchor="middle"
                                                className={`text-[10px] font-semibold transition-colors ${
                                                    isHovered ? 'fill-rose-700 font-bold' : 'fill-gray-400'
                                                }`}
                                            >
                                                {r.label}
                                            </text>
                                        </g>
                                    );
                                })}
                            </svg>
                        </div>

                        <div className="mt-3 pt-3 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1.5 text-gray-600 font-medium">
                                    <span className="h-2.5 w-2.5 rounded-sm bg-rose-500" />
                                    Kasus Gigitan
                                </div>
                                <div className="flex items-center gap-1.5 text-gray-600 font-medium">
                                    <span className="h-2.5 w-2.5 rounded-sm bg-amber-500" />
                                    Diberikan VAR
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-1.5">
                                {rabies_chart.status_hewan.slice(0, 3).map((st, i) => (
                                    <span
                                        key={i}
                                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-gray-100 text-gray-700"
                                    >
                                        {st.status}: <span className="font-bold">{st.count}</span>
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-6">
                <div className="lg:col-span-8 bg-white rounded-2xl p-5 border border-gray-100 shadow-xs flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
                            <div>
                                <h3 className="text-sm font-bold text-gray-900">Aktivitas Kunjungan Pasien Terbaru</h3>
                                <p className="text-xs text-gray-400 mt-0.5">Catatan data masuk dari loket pendaftaran</p>
                            </div>
                            <Link href="/super/laporan/rekam-medis" className="text-xs font-bold text-purple-700 hover:underline">
                                Semua Data &rarr;
                            </Link>
                        </div>

                        {recent_visits.length === 0 ? (
                            <div className="py-8 text-center text-xs text-gray-400">
                                Belum ada catatan kunjungan pasien hari ini.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs text-left border-collapse border border-gray-200">
                                    <thead>
                                        <tr className="bg-gray-100/90 border-b border-gray-200 text-[11px] font-bold uppercase tracking-wider text-gray-700">
                                            <th className="py-2.5 px-3 border-r border-gray-200 text-center font-bold w-10 shrink-0">No</th>
                                            <th className="py-2.5 px-3 border-r border-gray-200 text-center font-bold">No. RM</th>
                                            <th className="py-2.5 px-3 border-r border-gray-200 text-center font-bold">Pasien Hewan</th>
                                            <th className="py-2.5 px-3 border-r border-gray-200 text-center font-bold">Pemilik</th>
                                            <th className="py-2.5 px-3 border-r border-gray-200 text-center font-bold">Waktu Kunjungan</th>
                                            <th className="py-2.5 px-3 text-center font-bold w-28 shrink-0">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {recent_visits.map((visit, index) => (
                                            <tr key={visit.id} className="odd:bg-white even:bg-gray-50/70 hover:bg-purple-50/40 transition-colors">
                                                <td className="py-2.5 px-3 border-r border-gray-200 text-center font-medium text-gray-600">
                                                    {index + 1}
                                                </td>
                                                <td className="py-2.5 px-3 border-r border-gray-200 font-bold text-purple-700 font-mono">
                                                    {visit.no_rm}
                                                </td>
                                                <td className="py-2.5 px-3 border-r border-gray-200">
                                                    <span className="font-semibold text-gray-900 block break-words leading-tight">{visit.nama_hewan}</span>
                                                    <span className="text-[11px] text-gray-500 block mt-0.5">{visit.jenis_hewan}</span>
                                                </td>
                                                <td className="py-2.5 px-3 border-r border-gray-200 text-gray-700 font-medium break-words">
                                                    {visit.pemilik}
                                                </td>
                                                <td className="py-2.5 px-3 border-r border-gray-200 text-gray-600 text-[11px] whitespace-nowrap">
                                                    {visit.tgl_kunjungan}
                                                </td>
                                                <td className="py-2.5 px-3 text-center">
                                                    <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                        {visit.status_antrean}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-4 bg-white rounded-2xl p-5 border border-gray-100 shadow-xs flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
                            <div>
                                <h3 className="text-sm font-bold text-gray-900">Peringatan Stok Obat</h3>
                                <p className="text-xs text-gray-400 mt-0.5">Item dengan stok perlu dipantau</p>
                            </div>
                            <Link href="/super/obat" className="text-xs font-bold text-purple-700 hover:underline">
                                Kelola &rarr;
                            </Link>
                        </div>

                        {low_stock_medicines.length === 0 ? (
                            <div className="py-8 text-center text-xs text-emerald-600 bg-emerald-50/50 rounded-xl">
                                Seluruh stok obat dan vaksin berada dalam jumlah aman.
                            </div>
                        ) : (
                            <div className="space-y-2.5">
                                {low_stock_medicines.map((med) => (
                                    <div
                                        key={med.id}
                                        className="flex items-center justify-between p-2.5 rounded-xl border border-gray-100 bg-gray-50/50 text-xs"
                                    >
                                        <div>
                                            <span className="font-semibold text-gray-800 block text-xs truncate max-w-[160px]">
                                                {med.nama_obat}
                                            </span>
                                            <span className="text-[10px] text-gray-400">{med.kode_obat}</span>
                                        </div>
                                        <div className="text-right">
                                            <span
                                                className={`font-bold px-2 py-0.5 rounded-md text-[11px] ${
                                                    med.stok <= 10
                                                        ? 'bg-rose-100 text-rose-700 border border-rose-200'
                                                        : 'bg-amber-100 text-amber-700 border border-amber-200'
                                                }`}
                                            >
                                                {med.stok} {med.satuan}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
