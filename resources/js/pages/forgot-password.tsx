import React, { useState, useEffect } from "react";
import { Head, Link, router } from "@inertiajs/react";
import { Button, ToastProvider, useToast } from "@/components/ui";

interface InteractiveMascotProps {
    focusField: "idle" | "email";
    isSubmitting: boolean;
}

/**
 * Maskot Dokter Hewan Interaktif (Disesuaikan untuk Lupa Sandi)
 */
function InteractiveMascot({
    focusField,
    isSubmitting,
}: InteractiveMascotProps) {
    const isEmail = focusField === "email" && !isSubmitting;

    const leftEarTransform = isEmail ? "rotate(-6deg)" : "none";
    const rightEarTransform = isEmail ? "rotate(6deg)" : "none";
    const eyeRy = "8"; // Mata selalu terbuka di form ini
    const eyeFill = "#ffffff";
    const mouthPath = "M 55 74 Q 60 78 60 72 Q 60 78 65 74";

    return (
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 mx-auto -mb-4 sm:-mb-6 select-none pointer-events-none z-10 drop-shadow-xl transition-transform duration-500 hover:scale-105">
            <div className="absolute inset-0 rounded-full blur-xl animate-pulse transition-colors duration-500 bg-purple-300/40" />

            <svg
                viewBox="0 0 120 120"
                className={`relative w-full h-full transform transition-all duration-300 ${isSubmitting ? "animate-bounce" : ""}`}
            >
                <path
                    d="M 28 42 L 18 16 L 46 28 Z"
                    fill="#7e22ce"
                    className="transition-all duration-300 origin-bottom-left"
                    style={{ transform: leftEarTransform }}
                />
                <path
                    d="M 27 38 L 22 22 L 40 30 Z"
                    fill="#f3e8ff"
                    className="transition-colors duration-300"
                />

                <path
                    d="M 92 42 L 102 16 L 74 28 Z"
                    fill="#7e22ce"
                    className="transition-all duration-300 origin-bottom-right"
                    style={{ transform: rightEarTransform }}
                />
                <path
                    d="M 93 38 L 98 22 L 80 30 Z"
                    fill="#f3e8ff"
                    className="transition-colors duration-300"
                />

                <circle
                    cx="60"
                    cy="62"
                    r="38"
                    fill="#9333ea"
                    className="transition-colors duration-500"
                />
                <circle
                    cx="60"
                    cy="64"
                    r="34"
                    fill="#a855f7"
                    className="transition-colors duration-500"
                />

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
                        className="transition-all duration-300"
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
                        className="transition-all duration-300"
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

                <g
                    className="transition-all duration-300 ease-in-out"
                    style={{ transformOrigin: "40px 88px" }}
                >
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

                <g
                    className="transition-all duration-300 ease-in-out"
                    style={{ transformOrigin: "80px 88px" }}
                >
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

    const [email, setEmail] = useState<string>("");
    const [focusField, setFocusField] = useState<"idle" | "email">("idle");
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [isSuccess, setIsSuccess] = useState<boolean>(false);

    const [isMounted, setIsMounted] = useState<boolean>(false);
    useEffect(() => setIsMounted(true), []);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!email.trim()) {
            error("Harap masukkan email Anda!");
            return;
        }

        setIsSubmitting(true);
        router.post(
            "/forgot-password",
            { email },
            {
                onSuccess: () => {
                    setIsSuccess(true);
                    success(
                        "Tautan pemulihan sandi telah dikirim ke email Anda.",
                    );
                },
                onError: (errs: any) => {
                    setIsSubmitting(false);
                    const rawMsg = errs.email || Object.values(errs)[0];
                    error(String(rawMsg || "Gagal memproses permintaan."));
                },
                onFinish: () => setIsSubmitting(false),
            },
        );
    };

    return (
        <div className="flex h-[100dvh] w-full bg-gray-50 overflow-hidden font-sans relative flex-col lg:flex-row">
            <div className="fixed top-5 left-5 sm:top-8 sm:left-8 lg:hidden z-50">
                <Link
                    href="/login"
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-white/80 backdrop-blur-md shadow-md border border-purple-100 text-gray-600 hover:text-purple-700 hover:bg-white active:scale-90 transition-all duration-200"
                >
                    <svg
                        className="w-5 h-5 pr-0.5"
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

            <div className="hidden lg:flex relative w-1/2 bg-gradient-to-br from-purple-900 via-purple-800 to-purple-600 items-center justify-center overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-30">
                    <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-500 rounded-full blur-[100px]"></div>
                    <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-pink-500 rounded-full blur-[100px]"></div>
                </div>

                <div
                    className={`relative z-10 p-12 max-w-lg flex flex-col items-center text-center text-white transition-all duration-1000 transform ${isMounted ? "translate-x-0 opacity-100" : "-translate-x-12 opacity-0"}`}
                >
                    <img
                        src="/images/logo_puskeswan.png"
                        alt="Logo Puskeswan Pariaman"
                        className="w-32 sm:w-40 h-auto mb-8 drop-shadow-xl"
                    />

                    <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-4 drop-shadow-lg">
                        Pemulihan <br />
                        <span className="text-purple-300">Akses Akun</span>
                    </h1>
                    <p className="text-purple-100 text-lg leading-relaxed mb-10">
                        Keamanan data medis adalah prioritas kami. Gunakan email
                        resmi yang terdaftar pada sistem untuk mereset kata
                        sandi Anda.
                    </p>
                </div>
            </div>

            <div className="relative flex-1 flex flex-col justify-center items-center w-full lg:w-1/2 p-4 sm:p-8 overflow-y-auto">
                <div className="absolute inset-0 lg:hidden bg-gradient-to-br from-purple-50/90 via-white to-purple-100/80 -z-10" />
                <div className="absolute -top-24 -left-24 w-72 h-72 bg-purple-300/30 rounded-full blur-3xl lg:hidden -z-10 animate-pulse" />

                <div
                    className={`w-full max-w-sm transition-all duration-700 delay-150 transform ${isMounted ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
                >
                    <InteractiveMascot
                        focusField={focusField}
                        isSubmitting={isSubmitting}
                    />

                    <div className="backdrop-blur-xl border border-white/50 lg:border-gray-100 shadow-2xl shadow-purple-900/5 rounded-3xl p-6 sm:p-8 z-20 relative bg-white/80 lg:bg-white transition-all duration-500">
                        <div className="text-center mb-6">
                            <img
                                src="/images/logo_puskeswan.png"
                                alt="Logo Puskeswan Pariaman"
                                className="w-16 sm:w-20 h-auto mx-auto mb-4 lg:hidden drop-shadow-sm"
                            />
                            <h2 className="text-2xl font-extrabold tracking-tight text-gray-900">
                                Lupa Kata Sandi?
                            </h2>
                            <p className="text-sm mt-2 text-gray-500 leading-relaxed">
                                {isSuccess
                                    ? "Tautan pemulihan telah dikirim. Silakan periksa kotak masuk email Anda."
                                    : "Masukkan email yang terdaftar. Kami akan mengirimkan instruksi pemulihan ke email Anda."}
                            </p>
                        </div>

                        {!isSuccess ? (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-bold text-gray-700">
                                        Email Petugas Terdaftar
                                    </label>
                                    <div className="relative group">
                                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-purple-600 transition-colors duration-300">
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
                                                    d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206"
                                                />
                                            </svg>
                                        </span>
                                        <input
                                            type="email"
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
                                            className="w-full h-11 pl-10 pr-4 text-sm rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all placeholder:text-gray-400 font-medium disabled:bg-gray-100/50 disabled:text-gray-400 disabled:cursor-not-allowed"
                                        />
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    size="lg"
                                    variant="primary"
                                    disabled={isSubmitting}
                                    isLoading={isSubmitting}
                                    className="w-full h-11 text-sm font-bold transition-all mt-4 bg-purple-700 hover:bg-purple-800 shadow-lg shadow-purple-600/30 active:scale-[0.98]"
                                >
                                    Kirim Tautan Pemulihan
                                </Button>
                            </form>
                        ) : (
                            <div className="mt-6 flex flex-col gap-3">
                                <Link
                                    href="/login"
                                    className="flex items-center justify-center w-full h-11 rounded-xl bg-purple-50 text-purple-700 font-bold text-sm hover:bg-purple-100 transition-colors"
                                >
                                    Kembali ke Halaman Login
                                </Link>
                            </div>
                        )}

                        {!isSuccess && (
                            <div className="mt-6 text-center">
                                <Link
                                    href="/login"
                                    className="text-[12px] font-semibold text-gray-500 hover:text-purple-600 transition-colors"
                                >
                                    Ingat kata sandi Anda?{" "}
                                    <span className="text-purple-700">
                                        Masuk di sini
                                    </span>
                                </Link>
                            </div>
                        )}
                    </div>

                    <p className="text-center text-xs mt-6 lg:mt-4 font-medium mb-4 text-gray-400">
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
