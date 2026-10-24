import React, { useState, useEffect } from "react";
import { Head, Link, router } from "@inertiajs/react";
import { Button, ToastProvider, useToast } from "@/components/ui";

interface InteractiveMascotProps {
    focusField: "idle" | "email";
    isSubmitting: boolean;
}

function InteractiveMascot({
    focusField,
    isSubmitting,
}: InteractiveMascotProps) {
    const isEmail = focusField === "email" && !isSubmitting;

    const leftEarTransform = isEmail ? "rotate(-6deg)" : "none";
    const rightEarTransform = isEmail ? "rotate(6deg)" : "none";
    const eyeRy = "8";
    const eyeFill = "#ffffff";
    const mouthPath = "M 55 74 Q 60 78 60 72 Q 60 78 65 74";

    return (
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 mx-auto -mb-4 sm:-mb-6 select-none pointer-events-none z-10 drop-shadow-xl transition-transform duration-500">
            <div className="absolute inset-0 rounded-full blur-xl animate-pulse transition-colors duration-500 bg-purple-300/40" />

            <svg
                viewBox="0 0 120 120"
                className={`relative w-full h-full transform transition-all duration-300 ${
                    isSubmitting ? "animate-bounce" : ""
                }`}
            >
                <path
                    d="M 28 42 L 18 16 L 46 28 Z"
                    fill="#7e22ce"
                    className="transition-all duration-300 origin-bottom-left"
                    style={{ transform: leftEarTransform }}
                />
                <path d="M 27 38 L 22 22 L 40 30 Z" fill="#f3e8ff" />

                <path
                    d="M 92 42 L 102 16 L 74 28 Z"
                    fill="#7e22ce"
                    className="transition-all duration-300 origin-bottom-right"
                    style={{ transform: rightEarTransform }}
                />
                <path d="M 93 38 L 98 22 L 80 30 Z" fill="#f3e8ff" />

                <circle cx="60" cy="62" r="38" fill="#9333ea" />
                <circle cx="60" cy="64" r="34" fill="#a855f7" />

                <path
                    d="M 42 30 Q 60 22 78 30 L 76 22 Q 60 16 44 22 Z"
                    fill="#ffffff"
                />
                <rect
                    x="58"
                    y="21"
                    width="4"
                    height="8"
                    rx="1"
                    fill="#7e22ce"
                />
                <rect
                    x="56"
                    y="23"
                    width="8"
                    height="4"
                    rx="1"
                    fill="#7e22ce"
                />

                <g className="transition-all duration-300 ease-in-out">
                    <ellipse
                        cx={isEmail ? "45" : "48"}
                        cy={isEmail ? "65" : "60"}
                        rx="7"
                        ry={eyeRy}
                        fill={eyeFill}
                    />
                    <circle
                        cx={isEmail ? "45" : "48"}
                        cy={isEmail ? "66" : "60"}
                        r="4"
                        fill="#1e1b4b"
                    >
                        <animate
                            attributeName="r"
                            values="4;4;0.5;4"
                            dur="4s"
                            repeatCount="indefinite"
                        />
                    </circle>
                </g>

                <g className="transition-all duration-300 ease-in-out">
                    <ellipse
                        cx={isEmail ? "75" : "72"}
                        cy={isEmail ? "65" : "60"}
                        rx="7"
                        ry={eyeRy}
                        fill={eyeFill}
                    />
                    <circle
                        cx={isEmail ? "75" : "72"}
                        cy={isEmail ? "66" : "60"}
                        r="4"
                        fill="#1e1b4b"
                    >
                        <animate
                            attributeName="r"
                            values="4;4;0.5;4"
                            dur="4s"
                            repeatCount="indefinite"
                        />
                    </circle>
                </g>

                <polygon points="57,68 63,68 60,72" fill="#f43f5e" />
                <path
                    d={mouthPath}
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                />

                <circle cx="38" cy="68" r="4" fill="#f472b6" opacity="0.6" />
                <circle cx="82" cy="68" r="4" fill="#f472b6" opacity="0.6" />

                <path
                    d="M 40 85 Q 60 102 80 85"
                    fill="none"
                    stroke="#e9d5ff"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                />
                <circle
                    cx="60"
                    cy="94"
                    r="4.5"
                    fill="#facc15"
                    stroke="#7e22ce"
                    strokeWidth="1.5"
                />

                <g style={{ transformOrigin: "40px 88px" }}>
                    <ellipse
                        cx="40"
                        cy="88"
                        rx="8"
                        ry="7"
                        fill="#f3e8ff"
                        stroke="#7e22ce"
                        strokeWidth="1.5"
                    />
                    <circle cx="37" cy="87" r="1.5" fill="#d8b4fe" />
                    <circle cx="40" cy="85" r="1.5" fill="#d8b4fe" />
                    <circle cx="43" cy="87" r="1.5" fill="#d8b4fe" />
                </g>

                <g style={{ transformOrigin: "80px 88px" }}>
                    <ellipse
                        cx="80"
                        cy="88"
                        rx="8"
                        ry="7"
                        fill="#f3e8ff"
                        stroke="#7e22ce"
                        strokeWidth="1.5"
                    />
                    <circle cx="77" cy="87" r="1.5" fill="#d8b4fe" />
                    <circle cx="80" cy="85" r="1.5" fill="#d8b4fe" />
                    <circle cx="83" cy="87" r="1.5" fill="#d8b4fe" />
                </g>
            </svg>
        </div>
    );
}

function ForgotPasswordFormContent() {
    const { success, error } = useToast();

    const [email, setEmail] = useState("");
    const [focusField, setFocusField] = useState<"idle" | "email">("idle");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!email.trim()) {
            error("Harap masukkan email Anda!");
            return;
        }

        setIsSubmitting(true);

        router.post(
            "/forgot-password",
            { email: email.trim() },
            {
                onSuccess: () => {
                    setIsSuccess(true);
                    success(
                        "Jika email terdaftar, instruksi pemulihan akan dikirim ke email Anda.",
                    );
                },
                onError: (errs) => {
                    const rawMsg = errs.email || Object.values(errs)[0];
                    error(String(rawMsg || "Gagal memproses permintaan."));
                },
                onFinish: () => setIsSubmitting(false),
            },
        );
    };

    return (
        <div className="relative flex h-[100dvh] w-full flex-col overflow-hidden bg-gray-50 font-sans lg:flex-row">
            {/* Tombol kembali untuk mobile */}
            <div className="fixed left-5 top-5 z-50 sm:left-8 sm:top-8 lg:hidden">
                <Link
                    href="/login"
                    aria-label="Kembali ke halaman login"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-purple-100 bg-white/80 text-gray-600 shadow-md backdrop-blur-md transition-all duration-200 hover:bg-white hover:text-purple-700 active:scale-90"
                >
                    <svg
                        className="h-5 w-5 pr-0.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M10 19l-7-7m0 0l7-7m-7 7h18"
                        />
                    </svg>
                </Link>
            </div>

            {/* Panel kiri */}
            <div className="relative hidden w-1/2 items-center justify-center overflow-hidden bg-gradient-to-br from-purple-900 via-purple-800 to-purple-600 lg:flex">
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

                <div
                    className={`relative z-10 flex max-w-lg flex-col items-center p-12 text-center text-white transition-all duration-1000 ${
                        isMounted
                            ? "translate-x-0 opacity-100"
                            : "-translate-x-12 opacity-0"
                    }`}
                >
                    <img
                        src="/images/logo_puskeswan.webp"
                        alt="Logo Puskeswan Pariaman"
                        className="mb-8 h-auto w-32 drop-shadow-xl sm:w-40"
                    />

                    <h1 className="mb-4 text-4xl font-extrabold leading-tight drop-shadow-lg sm:text-5xl">
                        Pemulihan
                        <br />
                        <span className="text-purple-300">Akses Akun</span>
                    </h1>

                    <p className="text-lg leading-relaxed text-purple-100">
                        Pulihkan akses akun Anda dengan aman menggunakan email
                        resmi yang terdaftar pada sistem Puskeswan Pariaman.
                    </p>
                </div>
            </div>

            {/* Panel kanan */}
            <div className="relative flex w-full flex-1 flex-col items-center justify-center overflow-y-auto p-4 sm:p-8 lg:w-1/2">
                <div className="absolute inset-0 -z-10 bg-gradient-to-br from-purple-50/90 via-white to-purple-100/80 lg:hidden" />

                <div className="absolute -left-24 -top-24 -z-10 h-72 w-72 animate-pulse rounded-full bg-purple-300/30 blur-3xl lg:hidden" />

                <div
                    className={`w-full max-w-sm transform transition-all delay-150 duration-700 ${
                        isMounted
                            ? "translate-y-0 opacity-100"
                            : "translate-y-8 opacity-0"
                    }`}
                >
                    <InteractiveMascot
                        focusField={focusField}
                        isSubmitting={isSubmitting}
                    />

                    {/* Card form */}
                    <div className="relative z-20 rounded-3xl border border-white/50 bg-white/80 p-6 shadow-2xl shadow-purple-900/5 backdrop-blur-xl transition-all duration-500 sm:p-8 lg:border-gray-100 lg:bg-white">
                        <div className="mb-6 text-center">
                            <img
                                src="/images/logo_puskeswan.webp"
                                alt="Logo Puskeswan Pariaman"
                                className="mx-auto mb-4 h-auto w-16 drop-shadow-sm sm:w-20 lg:hidden"
                            />

                            <h2 className="text-2xl font-extrabold tracking-tight text-gray-900">
                                {isSuccess
                                    ? "Periksa Email Anda"
                                    : "Lupa Kata Sandi?"}
                            </h2>

                            <p className="mt-2 text-sm leading-relaxed text-gray-500">
                                {isSuccess
                                    ? "Jika email tersebut terdaftar, instruksi pemulihan akan dikirim. Silakan periksa kotak masuk atau folder spam."
                                    : "Masukkan email petugas yang terdaftar. Kami akan mengirimkan instruksi untuk memulihkan akses akun Anda."}
                            </p>
                        </div>

                        {!isSuccess ? (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label
                                        htmlFor="email"
                                        className="block text-xs font-bold text-gray-700"
                                    >
                                        Email Petugas Terdaftar
                                    </label>

                                    <div className="group relative">
                                        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400 transition-colors duration-300 group-focus-within:text-purple-600">
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
                                                    d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206"
                                                />
                                            </svg>
                                        </span>

                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            autoComplete="email"
                                            required
                                            value={email}
                                            disabled={isSubmitting}
                                            onFocus={() =>
                                                setFocusField("email")
                                            }
                                            onBlur={() => setFocusField("idle")}
                                            onChange={(e) =>
                                                setEmail(e.target.value)
                                            }
                                            placeholder="nama@puskeswan.go.id"
                                            className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50/50 pl-10 pr-4 text-sm font-medium transition-all placeholder:text-gray-400 focus:border-transparent focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-600 disabled:cursor-not-allowed disabled:bg-gray-100/50 disabled:text-gray-400"
                                        />
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    size="lg"
                                    variant="primary"
                                    disabled={isSubmitting}
                                    isLoading={isSubmitting}
                                    className="mt-4 h-11 w-full text-sm font-bold shadow-lg shadow-purple-600/30 transition-all hover:bg-purple-800 active:scale-[0.98]"
                                >
                                    Kirim Tautan Pemulihan
                                </Button>
                            </form>
                        ) : (
                            <div className="mt-6 flex flex-col gap-3">
                                <Link
                                    href="/login"
                                    className="flex h-11 w-full items-center justify-center rounded-xl bg-purple-50 text-sm font-bold text-purple-700 transition-colors hover:bg-purple-100"
                                >
                                    Kembali ke Halaman Login
                                </Link>
                            </div>
                        )}

                        {!isSuccess && (
                            <div className="mt-6 text-center text-xs font-semibold text-gray-500">
                                Ingat kata sandi Anda?{" "}
                                <Link
                                    href="/login"
                                    className="text-purple-700 transition-colors hover:text-purple-600"
                                >
                                    Masuk di sini
                                </Link>
                            </div>
                        )}
                    </div>

                    <p className="mb-4 mt-6 text-center text-xs font-medium text-gray-400 lg:mt-4">
                        © {new Date().getFullYear()} Puskeswan. Hak Cipta
                        Dilindungi.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function ForgotPassword() {
    return (
        <ToastProvider>
            <Head title="Lupa Kata Sandi" />
            <ForgotPasswordFormContent />
        </ToastProvider>
    );
}
