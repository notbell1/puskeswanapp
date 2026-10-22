import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/layouts/DashboardLayout';

interface ChartPoint {
    date: string;
    label: string;
    full_date?: string;
    day_name?: string;
    day_num?: string;
    count: number;
}

interface PriorityVisit {
    id: number;
    no_rm: string;
    nama_hewan: string;
    jenis_hewan: string;
    pemilik: string;
    tgl_kunjungan: string;
    berat_badan: number;
    suhu_tubuh: number;
    anamnesa: string;
    status_antrean: string;
}

interface RecentExamination {
    id: number;
    no_rm: string;
    nama_hewan: string;
    jenis_hewan: string;
    pemilik: string;
    waktu_selesai: string;
    diagnosa: string;
    terapi_pengobatan: string;
}

interface DokterDashboardProps {
    chart: {
        period: string;
        filter_type?: string;
        bulan?: number;
        tahun?: number;
        start_date?: string;
        end_date?: string;
        points: ChartPoint[];
        max: number;
        all?: Record<string, { points: ChartPoint[]; max: number }>;
    };
    priorityQueue: PriorityVisit[];
    totalAntreanAktif?: number;
    recentExaminations: RecentExamination[];
}

const MONTH_NAMES = [
    { value: 1, label: 'Januari' },
    { value: 2, label: 'Februari' },
    { value: 3, label: 'Maret' },
    { value: 4, label: 'April' },
    { value: 5, label: 'Mei' },
    { value: 6, label: 'Juni' },
    { value: 7, label: 'Juli' },
    { value: 8, label: 'Agustus' },
    { value: 9, label: 'September' },
    { value: 10, label: 'Oktober' },
    { value: 11, label: 'November' },
    { value: 12, label: 'Desember' },
];

const YEAR_OPTIONS = [2024, 2025, 2026, 2027];

export default function DokterDashboard({
    chart = {
        period: '7d',
        filter_type: 'preset',
        points: [],
        max: 10,
    },
    priorityQueue = [],
    totalAntreanAktif = 0,
    recentExaminations = [],
}: DokterDashboardProps) {
    const activeFilterType = chart.filter_type || 'preset';
    const [activePeriod, setActivePeriod] = useState<'7d' | '30d'>(
        chart.period === '30d' ? '30d' : '7d'
    );

    const [filterOpen, setFilterOpen] = useState(false);
    const [filterTab, setFilterTab] = useState<'month' | 'range'>(
        activeFilterType === 'range' ? 'range' : 'month'
    );
    const [selectedMonth, setSelectedMonth] = useState<number>(
        chart.bulan || new Date().getMonth() + 1
    );
    const [selectedYear, setSelectedYear] = useState<number>(
        chart.tahun || new Date().getFullYear()
    );
    const [startDate, setStartDate] = useState<string>(chart.start_date || '');
    const [endDate, setEndDate] = useState<string>(chart.end_date || '');
    const [isApplying, setIsApplying] = useState(false);

    const [hoveredPoint, setHoveredPoint] = useState<ChartPoint | null>(null);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    const activeData =
        activeFilterType === 'preset' && chart.all?.[activePeriod]
            ? chart.all[activePeriod]
            : {
                  points: chart.points || [],
                  max: chart.max || 10,
              };

    const points = activeData.points || [];
    const maxVal = Math.max(activeData.max || 10, 10);

    const svgWidth = 720;
    const svgHeight = 380;
    const padLeft = 36;
    const padRight = 24;
    const padTop = 24;
    const padBottom = 42;
    const plotW = svgWidth - padLeft - padRight;
    const plotH = svgHeight - padTop - padBottom;

    const coords = points.map((p, idx) => {
        const x =
            points.length > 1
                ? padLeft + (idx / (points.length - 1)) * plotW
                : padLeft + plotW / 2;
        const y = padTop + plotH - (p.count / maxVal) * plotH;
        return { x, y, ...p };
    });

    const pathData =
        coords.length > 0
            ? coords.reduce(
                  (acc, curr, idx) =>
                      idx === 0
                          ? `M ${curr.x} ${curr.y}`
                          : `${acc} L ${curr.x} ${curr.y}`,
                  ''
              )
            : '';

    const areaData =
        coords.length > 0
            ? `${pathData} L ${coords[coords.length - 1].x} ${padTop + plotH} L ${coords[0].x} ${padTop + plotH} Z`
            : '';

    const yTicks = Array.from({ length: maxVal + 1 }, (_, i) => maxVal - i);

    const handlePresetChange = (preset: '7d' | '30d') => {
        setActivePeriod(preset);
        setHoveredPoint(null);
        setHoveredIndex(null);

        if (activeFilterType !== 'preset') {
            router.get(
                '/dokter/dashboard',
                { period: preset, filter_type: 'preset' },
                { preserveState: true, preserveScroll: true, only: ['chart'] }
            );
        }
    };

    const handleApplyMonthFilter = (e: React.FormEvent) => {
        e.preventDefault();
        setIsApplying(true);
        router.get(
            '/dokter/dashboard',
            {
                filter_type: 'month',
                bulan: selectedMonth,
                tahun: selectedYear,
            },
            {
                preserveState: true,
                preserveScroll: true,
                only: ['chart'],
                onFinish: () => {
                    setIsApplying(false);
                    setFilterOpen(false);
                },
            }
        );
    };

    const handleApplyRangeFilter = (e: React.FormEvent) => {
        e.preventDefault();
        if (!startDate || !endDate) return;
        setIsApplying(true);
        router.get(
            '/dokter/dashboard',
            {
                filter_type: 'range',
                start_date: startDate,
                end_date: endDate,
            },
            {
                preserveState: true,
                preserveScroll: true,
                only: ['chart'],
                onFinish: () => {
                    setIsApplying(false);
                    setFilterOpen(false);
                },
            }
        );
    };

    const totalTindakanActive = points.reduce((acc, curr) => acc + curr.count, 0);

    return (
        <DashboardLayout title="Dashboard Dokter Hewan">
            <Head title="Dashboard Dokter" />

            <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden mb-5">
                <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-gray-200 bg-white">
                    <div className="lg:col-span-7 p-4 sm:p-5 flex flex-col justify-between">
                        <div className="flex-1 flex flex-col">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-base font-bold text-gray-900 tracking-tight">
                                            Aktivitas Pemeriksaan Klinis
                                        </h3>
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                            {totalTindakanActive} Tindakan
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        Tren harian pasien hewan yang telah Anda periksa
                                    </p>
                                </div>

                                <div className="flex items-center gap-1.5 self-start sm:self-auto">
                                    <div className="inline-flex rounded-lg bg-gray-100 p-0.5 text-xs font-semibold">
                                        <button
                                            type="button"
                                            onClick={() => handlePresetChange('7d')}
                                            className={`px-2.5 py-1 rounded-md transition-all ${
                                                activeFilterType === 'preset' && activePeriod === '7d'
                                                    ? 'bg-white text-emerald-800 shadow-2xs font-bold'
                                                    : 'text-gray-500 hover:text-gray-900'
                                            }`}
                                        >
                                            7 Hari
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handlePresetChange('30d')}
                                            className={`px-2.5 py-1 rounded-md transition-all ${
                                                activeFilterType === 'preset' && activePeriod === '30d'
                                                    ? 'bg-white text-emerald-800 shadow-2xs font-bold'
                                                    : 'text-gray-500 hover:text-gray-900'
                                            }`}
                                        >
                                            30 Hari
                                        </button>
                                    </div>

                                    <div className="relative">
                                        <button
                                            type="button"
                                            onClick={() => setFilterOpen((prev) => !prev)}
                                            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                                                activeFilterType !== 'preset'
                                                    ? 'bg-purple-50 text-purple-700 border-purple-300 ring-2 ring-purple-100'
                                                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                                            }`}
                                            title="Filter pilihan bulan/tahun atau rentang tanggal"
                                        >
                                            <svg className="w-3.5 h-3.5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <span>
                                                {activeFilterType === 'month'
                                                    ? `${MONTH_NAMES.find((m) => m.value === chart.bulan)?.label || 'Bulan'} ${chart.tahun}`
                                                    : activeFilterType === 'range'
                                                    ? 'Rentang Tanggal'
                                                    : 'Filter Lainnya'}
                                            </span>
                                            <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </button>

                                        {filterOpen && (
                                            <div className="absolute right-0 sm:right-auto sm:left-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 p-3 z-30 animate-in fade-in zoom-in-95 duration-100">
                                                <div className="grid grid-cols-2 gap-1 bg-gray-100 p-0.5 rounded-lg text-xs font-semibold mb-3">
                                                    <button
                                                        type="button"
                                                        onClick={() => setFilterTab('month')}
                                                        className={`py-1 rounded-md transition-all ${
                                                            filterTab === 'month'
                                                                ? 'bg-white text-purple-700 font-bold shadow-2xs'
                                                                : 'text-gray-500 hover:text-gray-900'
                                                        }`}
                                                    >
                                                        Pilih Bulan &amp; Tahun
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setFilterTab('range')}
                                                        className={`py-1 rounded-md transition-all ${
                                                            filterTab === 'range'
                                                                ? 'bg-white text-purple-700 font-bold shadow-2xs'
                                                                : 'text-gray-500 hover:text-gray-900'
                                                        }`}
                                                    >
                                                        Rentang Tanggal
                                                    </button>
                                                </div>

                                                {filterTab === 'month' ? (
                                                    <form onSubmit={handleApplyMonthFilter} className="space-y-2.5">
                                                        <div>
                                                            <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                                                                Bulan Pemeriksaan:
                                                            </label>
                                                            <select
                                                                value={selectedMonth}
                                                                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                                                                className="w-full text-xs py-1.5 px-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                                                            >
                                                                {MONTH_NAMES.map((m) => (
                                                                    <option key={m.value} value={m.value}>
                                                                        {m.label}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </div>

                                                        <div>
                                                            <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                                                                Tahun:
                                                            </label>
                                                            <select
                                                                value={selectedYear}
                                                                onChange={(e) => setSelectedYear(Number(e.target.value))}
                                                                className="w-full text-xs py-1.5 px-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                                                            >
                                                                {YEAR_OPTIONS.map((y) => (
                                                                    <option key={y} value={y}>
                                                                        {y}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </div>

                                                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                                                            <button
                                                                type="button"
                                                                onClick={() => setFilterOpen(false)}
                                                                className="px-2.5 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded-lg font-medium"
                                                            >
                                                                Batal
                                                            </button>
                                                            <button
                                                                type="submit"
                                                                disabled={isApplying}
                                                                className="px-3 py-1 text-xs bg-purple-700 hover:bg-purple-800 text-white rounded-lg font-bold shadow-xs transition-colors disabled:opacity-50"
                                                            >
                                                                {isApplying ? 'Memuat...' : 'Terapkan'}
                                                            </button>
                                                        </div>
                                                    </form>
                                                ) : (
                                                    /* Form Mode 2: Rentang Tanggal Custom */
                                                    <form onSubmit={handleApplyRangeFilter} className="space-y-2.5">
                                                        <div>
                                                            <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                                                                Dari Tanggal:
                                                            </label>
                                                            <input
                                                                type="date"
                                                                value={startDate}
                                                                onChange={(e) => setStartDate(e.target.value)}
                                                                required
                                                                className="w-full text-xs py-1.5 px-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                                                            />
                                                        </div>

                                                        <div>
                                                            <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                                                                Sampai Tanggal:
                                                            </label>
                                                            <input
                                                                type="date"
                                                                value={endDate}
                                                                onChange={(e) => setEndDate(e.target.value)}
                                                                required
                                                                className="w-full text-xs py-1.5 px-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                                                            />
                                                        </div>

                                                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                                                            <button
                                                                type="button"
                                                                onClick={() => setFilterOpen(false)}
                                                                className="px-2.5 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded-lg font-medium"
                                                            >
                                                                Batal
                                                            </button>
                                                            <button
                                                                type="submit"
                                                                disabled={isApplying || !startDate || !endDate}
                                                                className="px-3 py-1 text-xs bg-purple-700 hover:bg-purple-800 text-white rounded-lg font-bold shadow-xs transition-colors disabled:opacity-50"
                                                            >
                                                                {isApplying ? 'Memuat...' : 'Terapkan'}
                                                            </button>
                                                        </div>
                                                    </form>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="relative w-full flex-1 flex flex-col justify-center select-none my-1">
                                {hoveredPoint && (
                                    <div className="absolute top-2 right-2 bg-gray-900/95 text-white text-xs px-3 py-1.5 rounded-xl shadow-lg border border-gray-700/80 flex items-center gap-2 pointer-events-none z-20 backdrop-blur-xs">
                                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                        <div>
                                            <span className="text-[10.5px] text-gray-300 block leading-tight">
                                                {hoveredPoint.full_date || hoveredPoint.label}
                                            </span>
                                            <span className="font-extrabold text-emerald-300 text-xs block leading-tight">
                                                {hoveredPoint.count} Pasien Selesai Diperiksa
                                            </span>
                                        </div>
                                    </div>
                                )}

                                <svg
                                    viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                                    className="w-full h-80 sm:h-[360px] lg:h-[400px] select-none"
                                    onMouseLeave={() => {
                                        setHoveredPoint(null);
                                        setHoveredIndex(null);
                                    }}
                                >
                                    <defs>
                                        <linearGradient id="dokterGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#059669" stopOpacity="0.32" />
                                            <stop offset="75%" stopColor="#059669" stopOpacity="0.06" />
                                            <stop offset="100%" stopColor="#059669" stopOpacity="0.0" />
                                        </linearGradient>
                                    </defs>

                                    {yTicks.map((val, idx) => {
                                        const y = padTop + plotH - (val / maxVal) * plotH;
                                        const isBase = val === 0;
                                        return (
                                            <g key={idx}>
                                                <line
                                                    x1={padLeft}
                                                    y1={y}
                                                    x2={svgWidth - padRight}
                                                    y2={y}
                                                    stroke={isBase ? '#94a3b8' : '#f1f5f9'}
                                                    strokeWidth={isBase ? '1.5' : '1'}
                                                    strokeDasharray={isBase ? '' : '3 3'}
                                                />
                                                <text
                                                    x={padLeft - 7}
                                                    y={y + 3.5}
                                                    fontSize="10"
                                                    textAnchor="end"
                                                    fill={isBase ? '#475569' : '#64748b'}
                                                    fontWeight="700"
                                                    fontFamily="monospace"
                                                >
                                                    {val}
                                                </text>
                                            </g>
                                        );
                                    })}

                                    {areaData && <path d={areaData} fill="url(#dokterGradient)" />}

                                    {pathData && (
                                        <path
                                            d={pathData}
                                            fill="none"
                                            stroke="#059669"
                                            strokeWidth="2.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    )}

                                    {hoveredIndex !== null && coords[hoveredIndex] && (
                                        <g>
                                            <line
                                                x1={coords[hoveredIndex].x}
                                                y1={padTop}
                                                x2={coords[hoveredIndex].x}
                                                y2={padTop + plotH}
                                                stroke="#059669"
                                                strokeWidth="1.5"
                                                strokeDasharray="3 3"
                                            />
                                            <circle
                                                cx={coords[hoveredIndex].x}
                                                cy={coords[hoveredIndex].y}
                                                r="7"
                                                fill="#059669"
                                                fillOpacity="0.25"
                                            />
                                            <circle
                                                cx={coords[hoveredIndex].x}
                                                cy={coords[hoveredIndex].y}
                                                r="4.5"
                                                fill="#059669"
                                                stroke="#ffffff"
                                                strokeWidth="2"
                                            />
                                        </g>
                                    )}

                                    {coords.map((c, idx) => {
                                        const isHovered = hoveredIndex === idx;
                                        if (isHovered) return null;
                                        return (
                                            <g key={`point-${idx}`}>
                                                <circle
                                                    cx={c.x}
                                                    cy={c.y}
                                                    r={c.count > 0 ? 4.5 : 3}
                                                    fill={c.count > 0 ? '#059669' : '#ffffff'}
                                                    stroke="#059669"
                                                    strokeWidth="2"
                                                />
                                                {c.count > 0 && points.length <= 16 && (
                                                    <g>
                                                        <rect
                                                            x={c.x - 9}
                                                            y={c.y - 19}
                                                            width="18"
                                                            height="13"
                                                            rx="3.5"
                                                            fill="#059669"
                                                        />
                                                        <text
                                                            x={c.x}
                                                            y={c.y - 9.5}
                                                            fontSize="9"
                                                            textAnchor="middle"
                                                            fill="#ffffff"
                                                            fontWeight="800"
                                                            fontFamily="monospace"
                                                        >
                                                            {c.count}
                                                        </text>
                                                    </g>
                                                )}
                                            </g>
                                        );
                                    })}

                                    {coords.map((c, idx) => {
                                        const shouldShowLabel =
                                            points.length <= 14 ||
                                            idx === 0 ||
                                            idx === points.length - 1 ||
                                            (points.length <= 31 ? idx % 3 === 0 : idx % 5 === 0);

                                        if (!shouldShowLabel) return null;

                                        return (
                                            <g key={`x-axis-${idx}`}>
                                                <line
                                                    x1={c.x}
                                                    y1={padTop + plotH}
                                                    x2={c.x}
                                                    y2={padTop + plotH + 4}
                                                    stroke="#94a3b8"
                                                    strokeWidth="1"
                                                />
                                                {points.length <= 10 && c.day_name && (
                                                    <text
                                                        x={c.x}
                                                        y={padTop + plotH + 15}
                                                        textAnchor="middle"
                                                        fontSize="9"
                                                        fill="#64748b"
                                                        fontWeight="600"
                                                    >
                                                        {c.day_name}
                                                    </text>
                                                )}
                                                <text
                                                    x={c.x}
                                                    y={
                                                        points.length <= 10 && c.day_name
                                                            ? padTop + plotH + 28
                                                            : padTop + plotH + 18
                                                    }
                                                    textAnchor="middle"
                                                    fontSize="9.5"
                                                    fill={c.count > 0 ? '#065f46' : '#475569'}
                                                    fontWeight={c.count > 0 ? '800' : '600'}
                                                    fontFamily="monospace"
                                                >
                                                    {c.label}
                                                </text>
                                            </g>
                                        );
                                    })}

                                    {coords.map((c, idx) => {
                                        const step =
                                            coords.length > 1 ? plotW / (coords.length - 1) : plotW;
                                        const sliceX = c.x - step / 2;
                                        return (
                                            <rect
                                                key={`hitbox-${idx}`}
                                                x={sliceX}
                                                y={padTop}
                                                width={step}
                                                height={plotH + padBottom}
                                                fill="transparent"
                                                className="cursor-pointer"
                                                onMouseEnter={() => {
                                                    setHoveredPoint(c);
                                                    setHoveredIndex(idx);
                                                }}
                                            />
                                        );
                                    })}
                                </svg>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100 mt-2 gap-1">
                            <span className="font-medium text-gray-600">
                                📅 Periode:{' '}
                                <strong className="text-gray-900 font-bold">
                                    {points[0]?.label ?? '-'} s/d {points[points.length - 1]?.label ?? '-'}
                                </strong>
                            </span>
                            <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200 self-start sm:self-auto">
                                Total: {totalTindakanActive} Tindakan Klinis
                            </span>
                        </div>
                    </div>

                    <div className="lg:col-span-5 p-4 sm:p-5 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-base font-bold text-gray-900 tracking-tight">
                                            Antrean Pasien Hari Ini
                                        </h3>
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                            {totalAntreanAktif} Pasien
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        Pasien yang memerlukan pemeriksaan medis
                                    </p>
                                </div>
                                <Link
                                    href="/dokter/antrian"
                                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800"
                                >
                                    Kelola Antrean →
                                </Link>
                            </div>

                            {priorityQueue.length === 0 ? (
                                <div className="py-12 text-center">
                                    <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <p className="text-xs font-bold text-gray-900">Tidak Ada Antrean Menunggu</p>
                                    <p className="text-[11px] text-gray-400 mt-0.5">Semua antrean hari ini telah selesai diperiksa.</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {priorityQueue.map((item) => (
                                        <div
                                            key={item.id}
                                            className="p-2.5 sm:p-3 rounded-xl border border-gray-100 bg-white hover:border-emerald-200 hover:bg-emerald-50/20 transition-all flex items-center justify-between gap-3 text-xs"
                                        >
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                                                    <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded text-[10px] border border-emerald-100">
                                                        {item.no_rm}
                                                    </span>
                                                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800">
                                                        Menunggu
                                                    </span>
                                                    <span className="text-[10px] text-gray-400 font-mono">
                                                        Pukul {item.tgl_kunjungan}
                                                    </span>
                                                </div>
                                                <h4 className="font-bold text-gray-900 truncate">
                                                    {item.nama_hewan}{' '}
                                                    <span className="text-[11px] font-normal text-gray-500">
                                                        ({item.jenis_hewan})
                                                    </span>
                                                </h4>
                                                <div className="flex items-center gap-1.5 text-[11px] text-gray-500 truncate mt-0.5">
                                                    <span>
                                                        Pemilik: <strong className="font-medium text-gray-700">{item.pemilik}</strong>
                                                    </span>
                                                    {item.anamnesa && (
                                                        <>
                                                            <span className="text-gray-300">•</span>
                                                            <span className="truncate max-w-[150px] text-gray-500" title={item.anamnesa}>
                                                                {item.anamnesa}
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            <Link
                                                href="/dokter/antrian"
                                                className="shrink-0 px-3 py-1.5 rounded-lg text-white text-[11px] font-bold transition-all shadow-2xs whitespace-nowrap bg-emerald-700 hover:bg-emerald-800"
                                            >
                                                Periksa
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="pt-3 border-t border-gray-100 mt-3 text-xs text-gray-500 flex items-center justify-between">
                            <span>
                                Total <strong className="font-bold text-gray-800">{totalAntreanAktif}</strong> pasien dalam antrean aktif hari ini
                            </span>
                            <Link
                                href="/dokter/antrian"
                                className="font-bold text-emerald-700 hover:text-emerald-800 text-[11px]"
                            >
                                Buka Antrean →
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden mb-6">
                <div className="p-3.5 sm:px-5 sm:py-3.5 border-b border-gray-100 flex items-center justify-between bg-white">
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-base font-bold text-gray-900 tracking-tight">
                                Riwayat Terkini Pemeriksaan Saya
                            </h3>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                {recentExaminations.length} Terakhir
                            </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">Tindakan klinis terakhir yang Anda selesaikan</p>
                    </div>
                    <Link
                        href="/dokter/riwayat"
                        className="text-xs font-bold text-emerald-700 hover:text-emerald-800"
                    >
                        Buka Semua Riwayat →
                    </Link>
                </div>

                {recentExaminations.length === 0 ? (
                    <div className="py-12 text-center text-gray-400">
                        <div className="flex flex-col items-center justify-center">
                            <span className="text-3xl mb-2">📋</span>
                            <p className="font-semibold text-gray-700 text-xs">Belum ada riwayat pemeriksaan</p>
                            <p className="text-[11px] text-gray-400 mt-0.5">Tindakan medis yang selesai akan dicatat otomatis di sini.</p>
                        </div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[880px]">
                            <thead>
                                <tr className="bg-gray-100/80 border-b border-gray-200 text-[11px] font-bold text-gray-700 uppercase tracking-wider">
                                    <th className="py-2.5 px-3 border-r border-gray-200 w-12 text-center whitespace-nowrap">No.</th>
                                    <th className="py-2.5 px-3 border-r border-gray-200 w-28 whitespace-nowrap">No. RM</th>
                                    <th className="py-2.5 px-3 border-r border-gray-200 w-36 whitespace-nowrap">Waktu Selesai</th>
                                    <th className="py-2.5 px-3 border-r border-gray-200 w-40 whitespace-nowrap">Pasien Hewan</th>
                                    <th className="py-2.5 px-3 border-r border-gray-200 w-36 whitespace-nowrap">Pemilik</th>
                                    <th className="py-2.5 px-3 border-r border-gray-200 whitespace-nowrap">Diagnosa Klinis</th>
                                    <th className="py-2.5 px-3 border-r border-gray-200 whitespace-nowrap">Terapi / Pengobatan</th>
                                    <th className="py-2.5 px-2 w-20 text-center whitespace-nowrap">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 text-xs text-gray-800">
                                {recentExaminations.map((item, idx) => (
                                    <tr
                                        key={item.id || idx}
                                        className="h-11 even:bg-gray-50/50 hover:bg-emerald-50/30 transition-colors"
                                    >
                                        <td className="py-2 px-3 border-r border-gray-200 text-center whitespace-nowrap font-medium text-gray-500 text-xs">
                                            {idx + 1}
                                        </td>

                                        <td className="py-2 px-3 border-r border-gray-200 whitespace-nowrap">
                                            <span className="font-mono font-bold text-gray-900 text-xs">
                                                {item.no_rm}
                                            </span>
                                        </td>

                                        <td className="py-2 px-3 border-r border-gray-200 whitespace-nowrap text-xs text-gray-700">
                                            <span className="font-mono text-gray-600">{item.waktu_selesai}</span>
                                        </td>

                                        <td className="py-2 px-3 border-r border-gray-200 whitespace-nowrap">
                                            <span className="font-bold text-gray-900 text-xs truncate max-w-[130px] block" title={item.nama_hewan}>
                                                {item.nama_hewan}
                                            </span>
                                            <span className="text-[10px] text-gray-500 font-normal">
                                                ({item.jenis_hewan})
                                            </span>
                                        </td>

                                        <td className="py-2 px-3 border-r border-gray-200 whitespace-nowrap">
                                            <span className="font-medium text-gray-800 text-xs truncate max-w-[130px] block" title={item.pemilik}>
                                                {item.pemilik}
                                            </span>
                                        </td>

                                        <td className="py-2 px-3 border-r border-gray-200">
                                            <span className="text-gray-700 text-xs truncate block max-w-xs" title={item.diagnosa || '-'}>
                                                {item.diagnosa || '-'}
                                            </span>
                                        </td>

                                        <td className="py-2 px-3 border-r border-gray-200">
                                            <span className="text-gray-600 text-xs truncate block max-w-xs" title={item.terapi_pengobatan || '-'}>
                                                {item.terapi_pengobatan || '-'}
                                            </span>
                                        </td>

                                        <td className="py-2 px-2 text-center whitespace-nowrap">
                                            <div className="flex items-center justify-center">
                                                <span
                                                    className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-2xs"
                                                    title="Status: Selesai Diperiksa"
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
