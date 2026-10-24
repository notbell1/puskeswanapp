import { useState, useEffect } from "react";
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

    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

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
        <>
            <Head title={`${status} - Terlalu Banyak Permintaan`} />

            <div className="flex min-h-screen flex-col bg-gray-50 font-sans lg:h-screen lg:flex-row">
                {/* Panel kiri */}
                <section className="relative hidden w-1/2 items-center justify-center overflow-hidden bg-gradient-to-br from-purple-900 via-purple-800 to-purple-600 lg:flex">
                    {/* Background accents */}
                    <div className="absolute inset-0 opacity-30">
                        <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-purple-500 blur-[100px]" />
                        <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-pink-500 blur-[100px]" />
                    </div>

                    {/* Pattern tapak kaki */}
                    <svg
                        className="absolute inset-0 w-full h-full opacity-10"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                    >
                        <pattern
                            id="pattern-paws"
                            x="0"
                            y="0"
                            width="100"
                            height="100"
                            patternUnits="userSpaceOnUse"
                        >
                            <path
                                d="M40 30 A 10 10 0 1 0 60 30 A 10 10 0 1 0 40 30 Z M20 50 A 10 10 0 1 0 40 50 A 10 10 0 1 0 20 50 Z M60 50 A 10 10 0 1 0 80 50 A 10 10 0 1 0 60 50 Z M35 70 Q 50 90 65 70 Q 60 60 50 60 Q 40 60 35 70 Z"
                                fill="currentColor"
                            />
                        </pattern>

                        <rect
                            x="0"
                            y="0"
                            width="100%"
                            height="100%"
                            fill="url(#pattern-paws)"
                        />
                    </svg>

                    {/* Konten panel kiri */}
                    <div
                        className={`relative z-10 flex max-w-lg flex-col items-center p-10 text-center text-white transition-all duration-700 xl:p-12 ${
                            isMounted
                                ? "translate-x-0 opacity-100"
                                : "-translate-x-8 opacity-0"
                        }`}
                    >
                        <img
                            src="/images/logo_puskeswan.png"
                            alt="Logo Puskeswan Pariaman"
                            className="mb-8 h-auto w-32 drop-shadow-xl xl:w-40"
                        />

                        <h1 className="mb-4 text-4xl font-extrabold leading-tight drop-shadow-lg xl:text-5xl">
                            Terlalu Banyak
                            <br />
                            <span className="text-purple-300">Permintaan</span>
                        </h1>

                        <p className="max-w-md text-base leading-relaxed text-purple-100 xl:text-lg">
                            Sistem mendeteksi terlalu banyak permintaan dalam
                            waktu singkat. Akses dibatasi sementara untuk
                            menjaga keamanan layanan Puskeswan.
                        </p>

                        <div className="mt-8 flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-5 py-4 text-left backdrop-blur-sm">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-400/15 text-red-200">
                                <svg
                                    className="h-5 w-5"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    aria-hidden="true"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M12 8v4m0 4h.01M4.93 4.93l14.14 14.14M12 3a9 9 0 100 18 9 9 0 000-18z"
                                    />
                                </svg>
                            </div>

                            <div>
                                <p className="text-sm font-semibold">
                                    Pembatasan Sementara
                                </p>
                                <p className="mt-1 text-xs leading-5 text-purple-100">
                                    Tunggu hingga penghitung waktu selesai
                                    sebelum mencoba kembali.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Panel kanan */}
                <main className="relative flex min-h-screen w-full flex-1 items-center justify-center overflow-hidden bg-gradient-to-br from-purple-50 via-white to-purple-100/80 px-4 py-8 sm:px-6 lg:h-full lg:min-h-0 lg:w-1/2 lg:overflow-y-auto lg:px-8 lg:py-10">
                    {/* Background accents mobile */}
                    <div
                        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-purple-200/40 blur-3xl lg:hidden"
                        aria-hidden="true"
                    />

                    <div
                        className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-rose-200/30 blur-3xl lg:hidden"
                        aria-hidden="true"
                    />

                    <div
                        className={`relative z-10 w-full max-w-md transition-all duration-700 ${
                            isMounted
                                ? "translate-y-0 opacity-100"
                                : "translate-y-5 opacity-0"
                        }`}
                    >
                        {/* Card error */}
                        <div className="relative overflow-hidden rounded-3xl border border-gray-100 bg-white p-6 text-center shadow-xl shadow-purple-900/5 sm:p-8 lg:p-10">
                            {/* Accent atas */}
                            <div className="absolute left-0 right-0 top-0 h-1.5 bg-red-600" />

                            {/* Ikon */}
                            <div className="my-4 flex justify-center sm:my-5">
                                <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-red-100 bg-red-50 text-red-600 shadow-sm sm:h-[72px] sm:w-[72px]">
                                    <svg
                                        className="h-8 w-8 sm:h-9 sm:w-9"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.75"
                                        aria-hidden="true"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                                        />
                                    </svg>
                                </div>
                            </div>

                            {/* Judul dan pesan */}
                            <h2 className="mb-2 mt-2 text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
                                Terlalu Banyak Permintaan
                            </h2>

                            <p className="mb-6 text-sm font-normal leading-relaxed text-gray-500">
                                {message ||
                                    "Aktivitas terdeteksi terlalu sering. Akses dari jaringan Anda dibatasi sementara demi keamanan sistem."}
                            </p>

                            {/* Informasi IP */}
                            <div className="mb-4 flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 p-3 text-left">
                                <div className="flex min-w-0 items-center gap-2.5">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-100 text-xs font-bold text-red-600">
                                        IP
                                    </div>

                                    <div className="min-w-0">
                                        <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                            Alamat IP Terdeteksi
                                        </span>

                                        <span className="block break-all font-mono text-xs font-bold text-gray-800">
                                            {ip}
                                        </span>
                                    </div>
                                </div>

                                <span className="ml-2 shrink-0 rounded border border-red-200 bg-red-50 px-2 py-1 text-[10px] font-bold uppercase text-red-600">
                                    Dibatasi
                                </span>
                            </div>

                            {/* Countdown */}
                            <div className="mb-6 rounded-xl border border-gray-100 bg-gray-50 p-4 text-center">
                                <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                    Sisa Waktu Pembatasan
                                </span>

                                <div
                                    role="timer"
                                    aria-live="off"
                                    className="font-mono text-2xl font-extrabold tracking-wider text-red-600 sm:text-3xl"
                                >
                                    {formatTime(secondsLeft)}
                                </div>
                            </div>

                            {/* Tombol aksi */}
                            <div className="flex flex-col gap-2.5">
                                <Button
                                    variant="primary"
                                    onClick={() => router.reload()}
                                    className="h-11 w-full rounded-xl bg-red-600 text-sm font-semibold text-white shadow-md shadow-red-600/10 transition-all hover:bg-red-700"
                                >
                                    <span className="inline-flex items-center justify-center gap-2">
                                        <svg
                                            className="h-4 w-4"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            aria-hidden="true"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M4 4v5h5M20 20v-5h-5M5.64 9A7 7 0 0118 6l2 3M18.36 15A7 7 0 016 18l-2-3"
                                            />
                                        </svg>
                                        Perbarui Waktu
                                    </span>
                                </Button>
                            </div>

                            {/* Footer */}
                            <div className="mt-7 border-t border-gray-100 pt-4 text-center">
                                <p className="text-[11px] font-medium text-gray-400">
                                    Sistem Informasi Puskeswan &copy;{" "}
                                    {new Date().getFullYear()}
                                </p>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}
