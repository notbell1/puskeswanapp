import React from "react";
import { Head, Link, usePage } from "@inertiajs/react";
import { Button } from "@/components/ui";

export default function Error404({
    status = 404,
    message,
}: {
    status?: number;
    message?: string;
}) {
    const { auth } = usePage().props as any;
    const user = auth?.user;

    return (
        <div className="min-h-screen relative flex items-center justify-center p-4 sm:p-6 font-sans overflow-hidden bg-gradient-to-br from-gray-50 via-indigo-50/30 to-purple-50">
            <Head title={`${status} Halaman Tidak Ditemukan`} />

            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-300/20 rounded-full blur-[80px] pointer-events-none animate-pulse-glow" />
            <div
                className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-300/15 rounded-full blur-[80px] pointer-events-none animate-pulse-glow"
                style={{ animationDelay: "2s" }}
            />

            <div className="relative w-full max-w-lg bg-white/90 backdrop-blur-xl rounded-[2.5rem] p-6 sm:p-12 border border-white shadow-2xl shadow-indigo-900/10 text-center overflow-hidden z-10">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none pointer-events-none opacity-[0.03] z-0">
                    <span className="text-[8rem] sm:text-[14rem] font-black text-gray-900 leading-none">
                        {status}
                    </span>
                </div>

                <div className="relative z-10">
                    <div className="relative inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 mb-6 sm:mb-8">
                        <div className="absolute inset-0 bg-indigo-100 rounded-full animate-pulse opacity-60 duration-1000" />
                        <div className="relative flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-2xl shadow-lg border border-indigo-50 text-indigo-500 transform -rotate-3 transition-transform hover:rotate-0 duration-300">
                            <svg
                                className="w-8 h-8 sm:w-10 sm:h-10 animate-[bounce_3s_ease-in-out_infinite]"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 9v2m0 4h.01"
                                />
                            </svg>
                            <span
                                className="absolute -top-2 -right-2 text-indigo-400 text-lg sm:text-xl font-black animate-bounce"
                                style={{ animationDelay: "0.5s" }}
                            >
                                ?
                            </span>
                        </div>
                    </div>

                    <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-[10px] font-black tracking-widest uppercase mb-4">
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
                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        Tidak Ditemukan
                    </div>

                    <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-3">
                        Halaman Hilang
                    </h1>
                    <p className="text-sm text-gray-500 leading-relaxed max-w-sm mx-auto mb-8 font-medium">
                        {message ||
                            "Maaf, alamat URL yang Anda tuju tidak ditemukan di sistem Puskeswan. Halaman mungkin telah dipindahkan atau dihapus."}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                        {user ? (
                            <Link
                                href="/dashboard"
                                className="w-full sm:w-auto"
                            >
                                <Button
                                    variant="primary"
                                    className="w-full h-12 px-6 bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-600/20 text-sm font-bold rounded-xl transition-all hover:-translate-y-0.5"
                                >
                                    Menuju Dashboard
                                </Button>
                            </Link>
                        ) : (
                            <Link href="/" className="w-full sm:w-auto">
                                <Button
                                    variant="primary"
                                    className="w-full h-12 px-6 bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-600/20 text-sm font-bold rounded-xl transition-all hover:-translate-y-0.5"
                                >
                                    Ke Halaman Utama
                                </Button>
                            </Link>
                        )}

                        <Link href="/login" className="w-full sm:w-auto">
                            <Button
                                variant="secondary"
                                className="w-full h-12 px-6 text-sm font-bold bg-white border-2 border-gray-100 hover:bg-gray-50 hover:border-gray-200 text-gray-600 rounded-xl transition-all"
                            >
                                Masuk Petugas
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            <div className="absolute bottom-4 sm:bottom-6 text-center w-full z-10 px-4">
                <p className="text-[10px] sm:text-xs text-gray-400 font-semibold tracking-wide break-words">
                    Sistem Informasi Puskeswan Kota Pariaman &copy;{" "}
                    {new Date().getFullYear()}
                </p>
            </div>
        </div>
    );
}
