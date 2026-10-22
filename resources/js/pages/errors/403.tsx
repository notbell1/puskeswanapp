import React from "react";
import { Head, Link, usePage } from "@inertiajs/react";
import { Button } from "@/components/ui";

export default function Error403({
    status = 403,
    message,
}: {
    status?: number;
    message?: string;
}) {
    const { auth } = usePage().props as any;
    const user = auth?.user;

    return (
        <div className="min-h-screen relative flex items-center justify-center p-4 sm:p-6 font-sans overflow-hidden bg-gradient-to-br from-gray-50 via-purple-50/30 to-gray-100">
            <Head title={`${status} Akses Ditolak`} />

            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-300/20 rounded-full blur-[80px] pointer-events-none animate-pulse-glow" />
            <div
                className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-rose-300/15 rounded-full blur-[80px] pointer-events-none animate-pulse-glow"
                style={{ animationDelay: "2s" }}
            />

            <div className="relative w-full max-w-lg bg-white/90 backdrop-blur-xl rounded-[2.5rem] p-6 sm:p-12 border border-white shadow-2xl shadow-purple-900/10 text-center overflow-hidden z-10">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none pointer-events-none opacity-[0.03] z-0">
                    <span className="text-[8rem] sm:text-[14rem] font-black text-gray-900 leading-none">
                        {status}
                    </span>
                </div>

                <div className="relative z-10">
                    <div className="relative inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 mb-6 sm:mb-8">
                        <div className="absolute inset-0 bg-rose-100 rounded-full animate-ping opacity-50 duration-1000" />
                        <div className="relative flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-2xl shadow-lg border border-rose-100 text-rose-500 transform rotate-3 transition-transform hover:rotate-0 duration-300">
                            <svg
                                className="w-8 h-8 sm:w-10 sm:h-10"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="1.5"
                                    d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
                                    fill="#fff1f2"
                                />
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M12 15c-1.5 0-2.5-1-2.5-2 0-.5.5-1 1-1.5s2-.5 3 0c.5.5 1 1 1 1.5 0 1-1 2-2.5 2z"
                                    fill="currentColor"
                                />
                                <circle
                                    cx="9"
                                    cy="9.5"
                                    r="1.5"
                                    fill="currentColor"
                                    stroke="none"
                                />
                                <circle
                                    cx="12"
                                    cy="8"
                                    r="1.5"
                                    fill="currentColor"
                                    stroke="none"
                                />
                                <circle
                                    cx="15"
                                    cy="9.5"
                                    r="1.5"
                                    fill="currentColor"
                                    stroke="none"
                                />
                            </svg>
                            <span className="absolute -top-1.5 -right-1.5 flex h-3 w-3 sm:h-4 sm:w-4">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-3 w-3 sm:h-4 sm:w-4 bg-rose-500 shadow-sm border-2 border-white" />
                            </span>
                        </div>
                    </div>

                    <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-rose-50 border border-rose-100 text-rose-600 text-[10px] font-black tracking-widest uppercase mb-4">
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
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                        </svg>
                        Akses Dibatasi
                    </div>

                    <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-3">
                        LARANGAN
                    </h1>
                    <p className="text-sm text-gray-500 leading-relaxed max-w-sm mx-auto mb-8 font-medium">
                        {message ||
                            "Anda tidak memiliki wewenang medis atau administratif untuk mengakses halaman ini. Otorisasi Anda tidak mencukupi."}
                    </p>

                    {user && (
                        <div className="mb-8 p-4 rounded-2xl bg-gray-50/80 border border-gray-100 flex flex-col sm:flex-row items-center gap-3 sm:gap-4 hover:bg-gray-50 transition-colors w-full">
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-lg border border-purple-200">
                                {user.name.charAt(0).toUpperCase()}
                            </div>

                            <div className="flex-1 w-full text-center sm:text-left min-w-0">
                                <span className="block font-bold text-gray-900 break-words">
                                    {user.name}
                                </span>
                                <span className="block text-gray-400 text-xs break-words">
                                    {user.email}
                                </span>
                            </div>

                            <div className="flex-shrink-0 mt-1 sm:mt-0">
                                <span className="inline-block px-2.5 py-1 rounded-md text-[10px] font-extrabold bg-white border border-gray-200 text-gray-600 uppercase shadow-sm whitespace-nowrap">
                                    {user.role_display || user.role}
                                </span>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                        {user ? (
                            <Link
                                href="/dashboard"
                                className="w-full sm:w-auto"
                            >
                                <Button
                                    variant="primary"
                                    className="w-full h-12 px-6 bg-purple-700 hover:bg-purple-800 shadow-xl shadow-purple-700/20 text-sm font-bold rounded-xl transition-all hover:-translate-y-0.5"
                                >
                                    Kembali ke Dashboard
                                </Button>
                            </Link>
                        ) : (
                            <Link href="/login" className="w-full sm:w-auto">
                                <Button
                                    variant="primary"
                                    className="w-full h-12 px-6 bg-purple-700 hover:bg-purple-800 shadow-xl shadow-purple-700/20 text-sm font-bold rounded-xl transition-all hover:-translate-y-0.5"
                                >
                                    Masuk ke Sistem
                                </Button>
                            </Link>
                        )}

                        <Link href="/" className="w-full sm:w-auto">
                            <Button
                                variant="secondary"
                                className="w-full h-12 px-6 text-sm font-bold bg-white border-2 border-gray-100 hover:bg-gray-50 hover:border-gray-200 text-gray-600 rounded-xl transition-all"
                            >
                                Halaman Utama
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            <div className="absolute bottom-4 sm:bottom-6 text-center w-full z-10 px-4">
                <p className="text-[10px] sm:text-xs text-gray-400 font-semibold tracking-wide break-words">
                    Sistem Informasi Puskeswan &copy; {new Date().getFullYear()}
                </p>
            </div>
        </div>
    );
}
