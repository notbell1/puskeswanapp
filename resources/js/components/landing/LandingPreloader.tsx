import React, { useState, useEffect } from "react";

export default function LandingPreloader() {
    const [progress, setProgress] = useState<number>(15);
    const [isFadingOut, setIsFadingOut] = useState<boolean>(false);
    const [isDone, setIsDone] = useState<boolean>(false);

    useEffect(() => {
        // Kunci scrolling selama preloader aktif
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        // Progres cepat dan halus (~750ms)
        const t1 = setTimeout(() => setProgress(55), 150);
        const t2 = setTimeout(() => setProgress(88), 350);
        const t3 = setTimeout(() => setProgress(100), 550);

        // Mulai fade-out
        const t4 = setTimeout(() => {
            setIsFadingOut(true);
            document.body.style.overflow = originalOverflow;
        }, 750);

        // Selesai dan copot dari DOM
        const t5 = setTimeout(() => {
            setIsDone(true);
        }, 1150);

        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
            clearTimeout(t3);
            clearTimeout(t4);
            clearTimeout(t5);
            document.body.style.overflow = originalOverflow;
        };
    }, []);

    if (isDone) {
        return null;
    }

    return (
        <div
            className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-white transition-opacity duration-400 ease-out select-none ${
                isFadingOut ? "opacity-0 pointer-events-none" : "opacity-100"
            }`}
            aria-hidden="true"
        >
            {/* Latar Belakang Gradien Halus */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(147,51,234,0.08)_0%,transparent_70%)] pointer-events-none" />

            <div className="relative flex flex-col items-center px-4 max-w-sm w-full text-center">
                {/* Logo Puskeswan dengan Soft Pulse & Glow */}
                <div className="relative mb-5">
                    <div className="absolute -inset-2 bg-gradient-to-tr from-purple-400/30 to-indigo-400/30 rounded-3xl blur-md animate-pulse" />
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white border border-purple-100 shadow-md flex items-center justify-center p-3">
                        <img
                            src="/images/logo_puskeswan.webp"
                            alt="Logo Puskeswan"
                            className="w-full h-full object-contain pointer-events-none select-none"
                            draggable={false}
                        />
                    </div>
                </div>

                {/* Teks Branding */}
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 leading-snug">
                    Puskeswan<span className="text-purple-700">App</span>
                </h1>
                <p className="mt-1 text-xs sm:text-sm font-medium text-gray-500">
                    UPTD Puskeswan &amp; Inseminasi Buatan Kota Pariaman
                </p>

                {/* Progress Bar Halus */}
                <div className="w-52 sm:w-64 h-1.5 bg-gray-100 rounded-full mt-6 overflow-hidden shadow-inner relative">
                    <div
                        className="h-full bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                {/* Keterangan Status */}
                <span className="mt-3 text-[11px] font-semibold tracking-wide text-purple-700/80 animate-pulse">
                    Menyiapkan layanan kesehatan hewan...
                </span>
            </div>
        </div>
    );
}
