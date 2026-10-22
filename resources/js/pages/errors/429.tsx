import React, { useState, useEffect } from "react";
import { Head, router } from "@inertiajs/react";
import { Button } from "@/components/ui";

interface Error429Props {
    status?: number;
    message?: string;
    ip?: string;
    remaining_seconds?: number;
}

export default function Error429({
    status = 429,
    message,
    ip = "127.0.0.1",
    remaining_seconds = 1800,
}: Error429Props) {
    const [secondsLeft, setSecondsLeft] = useState<number>(() =>
        Math.max(0, remaining_seconds),
    );

    useEffect(() => {
        setSecondsLeft(Math.max(0, remaining_seconds));
    }, [remaining_seconds]);

    useEffect(() => {
        if (secondsLeft <= 0) {
            router.visit("/");
            return;
        }

        const timer = setInterval(() => {
            setSecondsLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    router.visit("/");
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [secondsLeft]);

    const formatTime = (totalSeconds: number): string => {
        const hrs = Math.floor(totalSeconds / 3600);
        const mins = Math.floor((totalSeconds % 3600) / 60);
        const secs = totalSeconds % 60;

        const pad = (n: number) => String(n).padStart(2, "0");

        if (hrs > 0) {
            return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
        }
        return `${pad(mins)}:${pad(secs)}`;
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center p-4 sm:p-6 font-sans overflow-hidden bg-gradient-to-br from-gray-900 via-purple-950 to-black text-white">
            <Head title={`${status} Terlalu Banyak Permintaan`} />

            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-600/20 rounded-full blur-[100px] pointer-events-none animate-pulse" />
            <div
                className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] pointer-events-none animate-pulse"
                style={{ animationDelay: "2s" }}
            />

            <div className="relative w-full max-w-lg bg-gray-900/80 backdrop-blur-2xl rounded-[2.5rem] p-6 sm:p-10 border border-red-500/30 shadow-2xl shadow-red-950/50 text-center overflow-hidden z-10">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none pointer-events-none opacity-[0.04] z-0">
                    <span className="text-[9rem] sm:text-[14rem] font-black text-white leading-none">
                        429
                    </span>
                </div>

                <div className="relative z-10">
                    <div className="relative inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 mb-6">
                        <div className="absolute inset-0 bg-red-500/20 rounded-full animate-ping opacity-75 duration-1000" />
                        <div className="relative flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-red-600 to-rose-700 rounded-2xl shadow-xl shadow-red-600/40 border border-red-400/30 text-white transform hover:scale-105 transition-transform duration-300">
                            <svg
                                className="w-8 h-8 sm:w-10 sm:h-10 text-white"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="1.8"
                                    d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
                                />
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2.2"
                                    d="M12 8v5m0 3h.01"
                                />
                            </svg>
                            <span className="absolute -top-1 -right-1 flex h-4 w-4">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-gray-900" />
                            </span>
                        </div>
                    </div>

                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-[11px] font-black tracking-widest uppercase mb-3">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        SISTEM PERTAHANAN AKTIF • TIER 2
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
                        429 Too Many Requests
                    </h1>
                    <p className="text-xs sm:text-sm text-gray-300 leading-relaxed max-w-sm mx-auto mb-6">
                        {message ||
                            "Aktivitas mencurigakan terdeteksi berulang kali (3x Cooldown). Akses dari perangkat dan jaringan Anda diblokir sementara demi keamanan sistem."}
                    </p>

                    <div className="mb-6 p-4 rounded-2xl bg-black/40 border border-gray-800 text-left flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 flex-shrink-0">
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
                                        d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                                    />
                                </svg>
                            </div>
                            <div>
                                <span className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                                    Alamat IP Terblokir
                                </span>
                                <span className="block font-mono text-xs sm:text-sm font-bold text-red-300">
                                    {ip}
                                </span>
                            </div>
                        </div>

                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold bg-red-500/20 border border-red-500/30 text-red-300 uppercase tracking-wider">
                            BLOCKED
                        </span>
                    </div>

                    <div className="mb-6 p-5 rounded-2xl bg-gradient-to-b from-gray-800/60 to-gray-900/90 border border-purple-500/20 text-center relative overflow-hidden">
                        <span className="block text-[11px] font-bold text-purple-300/80 uppercase tracking-widest mb-1.5">
                            Sisa Waktu Pemblokiran
                        </span>
                        <div className="font-mono text-3xl sm:text-4xl font-extrabold tracking-wider text-red-400 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]">
                            {formatTime(secondsLeft)}
                        </div>
                        <p className="text-[11px] text-gray-400 mt-2 font-medium">
                            Setelah timer habis, halaman akan otomatis diarahkan kembali ke halaman utama.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                        <Button
                            variant="secondary"
                            onClick={() => router.reload()}
                            className="w-full sm:w-auto h-11 px-6 text-xs font-bold bg-white/10 hover:bg-white/20 border border-white/10 text-white rounded-xl transition-all"
                        >
                            <svg
                                className="w-4 h-4 mr-1.5"
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
                            Periksa Status Sekarang
                        </Button>
                    </div>
                </div>
            </div>

            <div className="absolute bottom-4 sm:bottom-6 text-center w-full z-10 px-4">
                <p className="text-[10px] sm:text-xs text-gray-500 font-semibold tracking-wide">
                    Sistem Keamanan Siber & Pertahanan Puskeswan &copy; {new Date().getFullYear()}
                </p>
            </div>
        </div>
    );
}

