import React, { useState, useEffect, useRef, useCallback } from 'react';
import { usePage, router, Link } from '@inertiajs/react';
import { useToast } from '@/components/ui';

/**
 * Komponen Lonceng Notifikasi Realtime Header Dashboard
 * Fitur:
 * - Menampilkan angka jumlah antrean pasien menunggu hari ini secara realtime.
 * - Auto-polling berkala setiap 10 detik tanpa membebani browser (hanya saat tab aktif).
 * - Dropdown interaktif daftar pasien yang sedang mengantre hari ini.
 * - Audio Chime halus & Toast Notification otomatis saat ada antrean pasien baru masuk.
 * - Tombol refresh manual dengan indikator putar.
 * - Link langsung ke menu Antrean Pasien Dokter.
 */
export default function NotificationBell({ userRole = 'dokter' }) {
    if (userRole !== 'dokter') {
        return null;
    }

    const page = usePage();
    const toast = useToast();

    const initialQueue = page?.props?.queue_summary || { count: 0, waiting_list: [] };
    const [count, setCount] = useState(Number(initialQueue.count) || 0);
    const [waitingList, setWaitingList] = useState(initialQueue.waiting_list || []);
    const [isOpen, setIsOpen] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const [hasNewAlert, setHasNewAlert] = useState(false);

    const dropdownRef = useRef(null);
    const prevCountRef = useRef(count);

    const playChime = useCallback(() => {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return;
            const ctx = new AudioContext();
            const now = ctx.currentTime;

            const osc1 = ctx.createOscillator();
            const gain1 = ctx.createGain();
            osc1.type = 'sine';
            osc1.frequency.setValueAtTime(587.33, now);
            gain1.gain.setValueAtTime(0.12, now);
            gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
            osc1.connect(gain1);
            gain1.connect(ctx.destination);
            osc1.start(now);
            osc1.stop(now + 0.22);

            const osc2 = ctx.createOscillator();
            const gain2 = ctx.createGain();
            osc2.type = 'sine';
            osc2.frequency.setValueAtTime(880, now + 0.1);
            gain2.gain.setValueAtTime(0.15, now + 0.1);
            gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
            osc2.connect(gain2);
            gain2.connect(ctx.destination);
            osc2.start(now + 0.1);
            osc2.stop(now + 0.38);
        } catch (e) {
        }
    }, []);

    useEffect(() => {
        if (page?.props?.queue_summary) {
            const newCount = Number(page.props.queue_summary.count) || 0;
            setCount(newCount);
            setWaitingList(page.props.queue_summary.waiting_list || []);
            prevCountRef.current = newCount;
        }
    }, [page?.props?.queue_summary]);

    const fetchRealtimeQueue = useCallback(async (isManual = false) => {
        if (!isManual && typeof document !== 'undefined' && document.hidden) {
            return;
        }

        if (isManual) setIsFetching(true);

        try {
            const res = await fetch('/api/realtime/queue-notifications', {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            if (!res.ok) return;

            const data = await res.json();
            const newCount = Number(data.count) || 0;

            if (newCount > prevCountRef.current) {
                playChime();
                setHasNewAlert(true);

                if (toast?.blue) {
                    toast.blue(
                        `Ada pasien baru dalam antrean (${newCount} pasien menunggu pemeriksaan).`,
                        'Antrean Pasien Baru'
                    );
                }

                if (typeof window !== 'undefined' && window.location.pathname.includes('/dokter/antrian')) {
                    router.reload({ preserveScroll: true });
                }
            }

            setCount(newCount);
            setWaitingList(data.waiting_list || []);
            prevCountRef.current = newCount;
        } catch (err) {
        } finally {
            if (isManual) {
                setTimeout(() => setIsFetching(false), 300);
            }
        }
    }, [playChime, toast]);

    useEffect(() => {
        const intervalId = setInterval(() => {
            fetchRealtimeQueue(false);
        }, 10000);

        return () => clearInterval(intervalId);
    }, [fetchRealtimeQueue]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleToggleDropdown = () => {
        setIsOpen((prev) => !prev);
        if (!isOpen) {
            setHasNewAlert(false);
            fetchRealtimeQueue(true);
        }
    };

    const targetAntreanUrl = userRole === 'admin' ? '/admin/rekam-medis/antrian' : '/dokter/antrian';

    const handlePatientClick = (patientId) => {
        setIsOpen(false);
        router.visit(targetAntreanUrl);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <style>{`
                @keyframes bell-wiggle {
                    0%, 45%, 100% {
                        transform: rotate(0deg);
                    }
                    5% {
                        transform: rotate(14deg);
                    }
                    10% {
                        transform: rotate(-14deg);
                    }
                    15% {
                        transform: rotate(10deg);
                    }
                    20% {
                        transform: rotate(-10deg);
                    }
                    25% {
                        transform: rotate(6deg);
                    }
                    30% {
                        transform: rotate(-6deg);
                    }
                    35% {
                        transform: rotate(3deg);
                    }
                    40% {
                        transform: rotate(0deg);
                    }
                }
                @keyframes bell-ambient {
                    0%, 45%, 100% {
                        transform: scale(0.95);
                        opacity: 0;
                        box-shadow: 0 0 0 0 rgba(168, 85, 247, 0);
                    }
                    8% {
                        transform: scale(1.18);
                        opacity: 0.85;
                        box-shadow: 0 0 16px 6px rgba(168, 85, 247, 0.45);
                    }
                    18% {
                        transform: scale(1.36);
                        opacity: 0.6;
                        box-shadow: 0 0 24px 10px rgba(168, 85, 247, 0.3);
                    }
                    28% {
                        transform: scale(1.52);
                        opacity: 0.3;
                        box-shadow: 0 0 32px 14px rgba(168, 85, 247, 0.15);
                    }
                    38% {
                        transform: scale(1.68);
                        opacity: 0;
                        box-shadow: 0 0 40px 18px rgba(168, 85, 247, 0);
                    }
                }
                .bell-wiggle-active {
                    transform-origin: top center;
                    animation: bell-wiggle 5s ease-in-out infinite;
                }
                .bell-ambient-ring {
                    position: absolute;
                    inset: -3px;
                    border-radius: 14px;
                    pointer-events: none;
                    animation: bell-ambient 5s ease-out infinite;
                    background: radial-gradient(circle, rgba(168, 85, 247, 0.38) 0%, rgba(147, 51, 234, 0.14) 60%, transparent 100%);
                }
            `}</style>

            <div className="relative inline-flex items-center justify-center">
                {count > 0 && <div className="bell-ambient-ring" />}

                <button
                    type="button"
                    onClick={handleToggleDropdown}
                    className={`relative p-2 rounded-xl transition-all duration-200 focus:outline-none ${
                        count > 0
                            ? 'bg-purple-50/90 text-purple-700 ring-1 ring-purple-200/80 shadow-[0_0_12px_rgba(168,85,247,0.25)] hover:bg-purple-100/90'
                            : 'text-gray-600 hover:text-purple-700 hover:bg-purple-50'
                    } ${isOpen ? 'bg-purple-100 text-purple-800 ring-2 ring-purple-300' : ''}`}
                    title={`Notifikasi Antrean: ${count} Pasien Menunggu`}
                    aria-label="Notifikasi sistem antrean"
                >
                    <svg
                        className={`w-5 h-5 transition-transform ${
                            count > 0 ? 'bell-wiggle-active text-purple-700' : ''
                        } ${hasNewAlert ? 'animate-bounce' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                        />
                    </svg>

                    {count > 0 ? (
                        <span
                            className={`absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-600 text-white text-[9.5px] font-black flex items-center justify-center ring-2 ring-white shadow-xs ${
                                hasNewAlert ? 'animate-pulse scale-110' : ''
                            }`}
                        >
                            {count > 99 ? '99+' : count}
                        </span>
                    ) : (
                        <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white" />
                    )}
                </button>
            </div>

            {isOpen && (
                <div className="fixed sm:absolute left-3 right-3 sm:left-auto sm:right-0 top-16 sm:top-auto sm:mt-2 w-auto sm:w-[350px] max-w-[calc(100vw-24px)] bg-white rounded-2xl shadow-2xl border border-gray-200/95 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-2 bg-gradient-to-r from-purple-700 via-purple-800 to-indigo-800 text-white flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
                                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <div className="leading-tight">
                                <h3 className="font-bold text-[11.5px] tracking-tight">Antrean Pasien Hari Ini</h3>
                                <p className="text-[9.5px] text-purple-200">
                                    {count > 0 ? `${count} pasien menunggu pemeriksaan` : 'Tidak ada antrean'}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                            <button
                                type="button"
                                onClick={() => fetchRealtimeQueue(true)}
                                disabled={isFetching}
                                className="p-1 rounded-md bg-white/10 hover:bg-white/20 text-white transition-colors disabled:opacity-50"
                                title="Perbarui data antrean"
                            >
                                <svg
                                    className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                            </button>

                            <span className="px-1.5 py-0.5 rounded-full text-[9.5px] font-bold bg-white/20 text-white border border-white/30 backdrop-blur-xs">
                                {count} Antri
                            </span>
                        </div>
                    </div>

                    <div className="max-h-72 overflow-y-auto divide-y divide-gray-100 bg-white">
                        {count === 0 ? (
                            <div className="py-6 px-4 text-center">
                                <div className="w-10 h-10 mx-auto rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg font-bold mb-1.5">
                                    ✓
                                </div>
                                <p className="text-xs font-semibold text-gray-800">Tidak Ada Antrean Menunggu</p>
                                <p className="text-[10px] text-gray-400 mt-0.5 max-w-[200px] mx-auto leading-tight">
                                    Semua pasien hari ini telah selesai diperiksa.
                                </p>
                            </div>
                        ) : (
                            waitingList.map((item, idx) => (
                                <div
                                    key={item.id || idx}
                                    onClick={() => handlePatientClick(item.id)}
                                    className="px-2.5 py-2 hover:bg-purple-50/70 transition-colors cursor-pointer group flex items-center gap-2.5"
                                >
                                    <div className="w-6 h-6 rounded-md bg-purple-100 text-purple-700 font-extrabold text-[10px] flex items-center justify-center shrink-0 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                        #{idx + 1}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-1 leading-tight">
                                            <div className="flex items-center gap-1.5 truncate">
                                                <span className="font-bold text-xs text-gray-900 group-hover:text-purple-700 truncate">
                                                    {item.nama_hewan}
                                                </span>
                                                <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200/50 shrink-0">
                                                    {item.jenis_hewan}
                                                </span>
                                            </div>
                                            <span className="text-[10px] font-mono text-gray-400 shrink-0">
                                                {item.jam_kunjungan}
                                            </span>
                                        </div>

                                        <div className="text-[10.5px] text-gray-500 flex items-center gap-1 leading-tight mt-0.5 truncate">
                                            <span className="font-mono font-bold text-gray-700">{item.no_rm}</span>
                                            <span>•</span>
                                            <span className="truncate text-gray-600">{item.pemilik}</span>
                                            {item.anamnesa && (
                                                <>
                                                    <span>•</span>
                                                    <span className="text-[10px] text-gray-400 italic truncate group-hover:text-gray-600">
                                                        {item.anamnesa}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    <svg className="w-3.5 h-3.5 text-gray-300 group-hover:text-purple-600 group-hover:translate-x-0.5 transition-all shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="p-2 bg-gray-50/90 border-t border-gray-100 text-center">
                        <Link
                            href={targetAntreanUrl}
                            onClick={() => setIsOpen(false)}
                            className="inline-flex items-center justify-center gap-1.5 w-full py-1 px-3 rounded-lg text-[11px] font-semibold text-purple-700 hover:text-purple-800 hover:bg-purple-100/70 transition-colors"
                        >
                            <span>Buka Halaman Antrean Pasien</span>
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}

