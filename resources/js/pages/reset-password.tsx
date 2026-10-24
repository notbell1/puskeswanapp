import React, { useState, useEffect } from "react";
import { Head, Link, router } from "@inertiajs/react";
import { Button, ToastProvider, useToast } from "@/components/ui";

interface Props {
    token: string;
    email: string;
}

interface InteractiveMascotProps {
    focusField: "idle" | "password";
    showPassword: boolean;
    isSubmitting: boolean;
}

function InteractiveMascot({
    focusField,
    showPassword,
    isSubmitting,
}: InteractiveMascotProps) {
    const isPasswordHidden =
        focusField === "password" && !showPassword && !isSubmitting;
    const isPasswordVisible =
        focusField === "password" && showPassword && !isSubmitting;

    const eyeRy = isPasswordHidden || isPasswordVisible ? "1" : "8";
    const eyeFill =
        isPasswordHidden || isPasswordVisible ? "#581c87" : "#ffffff";
    const mouthPath = "M 55 74 Q 60 78 60 72 Q 60 78 65 74";

    return (
        <div className="relative z-10 mx-auto -mb-4 h-24 w-24 select-none drop-shadow-xl transition-transform duration-500 sm:-mb-6 sm:h-28 sm:w-28">
            <div className="absolute inset-0 animate-pulse rounded-full bg-purple-300/40 blur-xl" />

            <svg
                viewBox="0 0 120 120"
                className={`relative h-full w-full transform transition-all duration-300 ${
                    isSubmitting ? "animate-bounce" : ""
                }`}
            >
                <path
                    d="M 28 42 L 18 16 L 46 28 Z"
                    fill="#7e22ce"
                    className="origin-bottom-left transition-all duration-300"
                />
                <path d="M 27 38 L 22 22 L 40 30 Z" fill="#f3e8ff" />

                <path
                    d="M 92 42 L 102 16 L 74 28 Z"
                    fill="#7e22ce"
                    className="origin-bottom-right transition-all duration-300"
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
                        cx="48"
                        cy="60"
                        rx="7"
                        ry={eyeRy}
                        fill={eyeFill}
                        className="transition-all duration-300"
                    />
                    {!isPasswordHidden && (
                        <circle cx="48" cy="60" r="4" fill="#1e1b4b">
                            <animate
                                attributeName="r"
                                values="4;4;0.5;4"
                                dur="4s"
                                repeatCount="indefinite"
                            />
                        </circle>
                    )}
                </g>

                <g className="transition-all duration-300 ease-in-out">
                    <ellipse
                        cx="72"
                        cy="60"
                        rx="7"
                        ry={eyeRy}
                        fill={eyeFill}
                        className="transition-all duration-300"
                    />
                    {!isPasswordHidden && !isPasswordVisible && (
                        <circle cx="72" cy="60" r="4" fill="#1e1b4b">
                            <animate
                                attributeName="r"
                                values="4;4;0.5;4"
                                dur="4s"
                                repeatCount="indefinite"
                            />
                        </circle>
                    )}
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
                    style={{
                        transformOrigin: "40px 88px",
                        transform: isPasswordHidden
                            ? "translate(8px, -28px) scale(1.15)"
                            : "translate(0px, 0px) scale(1)",
                    }}
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
                    style={{
                        transformOrigin: "80px 88px",
                        transform:
                            isPasswordHidden || isPasswordVisible
                                ? "translate(-8px, -28px) scale(1.15)"
                                : "translate(0px, 0px) scale(1)",
                    }}
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

function ResetPasswordFormContent({ token, email }: Props) {
    const { success, error } = useToast();

    const [data, setData] = useState({
        token,
        email,
        password: "",
        password_confirmation: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] =
        useState(false);
    const [focusField, setFocusField] = useState<"idle" | "password">("idle");
    const [activePasswordField, setActivePasswordField] = useState<
        "password" | "confirmation" | null
    >(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const isCurrentPasswordVisible =
        activePasswordField === "confirmation"
            ? showPasswordConfirmation
            : showPassword;

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!data.password.trim()) {
            error("Kata sandi baru wajib diisi.");
            return;
        }

        if (data.password !== data.password_confirmation) {
            error("Konfirmasi kata sandi tidak cocok!");
            return;
        }

        setIsSubmitting(true);

        router.post("/reset-password", data, {
            onSuccess: () => {
                success("Kata sandi berhasil diubah! Silakan login.");
            },
            onError: (errs) => {
                const rawMsg =
                    errs.email || errs.password || Object.values(errs)[0];

                error(String(rawMsg || "Gagal mengubah kata sandi."));
            },
            onFinish: () => setIsSubmitting(false),
        });
    };

    const passwordInputClass =
        "h-11 w-full rounded-xl border border-gray-200 bg-gray-50/50 pl-10 pr-11 text-sm font-medium transition-all placeholder:text-gray-400 focus:border-transparent focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-600 disabled:cursor-not-allowed disabled:bg-gray-100/50 disabled:text-gray-400";

    const renderEyeIcon = (visible: boolean) =>
        visible ? (
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
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
                />
            </svg>
        ) : (
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
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
            </svg>
        );

    return (
        <div className="relative flex h-[100dvh] w-full flex-col overflow-hidden bg-gray-50 font-sans lg:flex-row">
            {/* Tombol kembali mobile */}
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
                        Pembaruan
                        <br />
                        <span className="text-purple-300">Kata Sandi</span>
                    </h1>

                    <p className="text-lg leading-relaxed text-purple-100">
                        Keamanan data medis adalah prioritas kami. Buat kata
                        sandi baru yang kuat untuk kembali mengakses sistem
                        Puskeswan dengan aman.
                    </p>
                </div>
            </div>

            {/* Panel kanan */}
            <div className="relative flex w-full flex-1 flex-col items-center justify-center overflow-y-auto px-4 py-2 sm:p-8 lg:w-1/2">
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
                        showPassword={isCurrentPasswordVisible}
                        isSubmitting={isSubmitting}
                    />

                    {/* Card form */}
                    <div className="relative z-20 rounded-3xl border border-white/50 bg-white/80 p-4 shadow-2xl shadow-purple-900/5 backdrop-blur-xl transition-all duration-500 sm:p-8 lg:border-gray-100 lg:bg-white">
                        <div className="mb-3 text-center sm:mb-5">
                            <img
                                src="/images/logo_puskeswan.webp"
                                alt="Logo Puskeswan Pariaman"
                                className="mx-auto mb-2 h-auto w-12 drop-shadow-sm sm:mb-3 sm:w-20 lg:hidden"
                            />

                            <h2 className="text-2xl font-extrabold tracking-tight text-gray-900">
                                Buat Sandi Baru
                            </h2>

                            <p className="mt-1.5 text-sm leading-relaxed text-gray-500">
                                Masukkan dan konfirmasi kata sandi baru untuk
                                akun petugas Anda.
                            </p>
                        </div>

                        <form
                            onSubmit={handleSubmit}
                            className="space-y-2.5 sm:space-y-3.5"
                        >
                            {/* Email */}
                            <div className="space-y-1">
                                <label
                                    htmlFor="reset-email"
                                    className="block text-xs font-bold text-gray-700"
                                >
                                    Email Petugas Terdaftar
                                </label>

                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
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
                                        id="reset-email"
                                        type="email"
                                        autoComplete="email"
                                        value={data.email}
                                        disabled
                                        className="h-11 w-full cursor-not-allowed rounded-xl border border-gray-200 bg-gray-100/80 pl-10 pr-4 text-sm font-medium text-gray-500"
                                    />
                                </div>
                            </div>

                            {/* Kata sandi baru */}
                            <div className="space-y-1">
                                <label
                                    htmlFor="reset-password"
                                    className="block text-xs font-bold text-gray-700"
                                >
                                    Kata Sandi Baru
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
                                                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                            />
                                        </svg>
                                    </span>

                                    <input
                                        id="reset-password"
                                        name="password"
                                        type={
                                            showPassword ? "text" : "password"
                                        }
                                        autoComplete="new-password"
                                        required
                                        value={data.password}
                                        disabled={isSubmitting}
                                        onFocus={() => {
                                            setFocusField("password");
                                            setActivePasswordField("password");
                                        }}
                                        onBlur={() => {
                                            setFocusField("idle");
                                            setActivePasswordField(null);
                                        }}
                                        onChange={(e) =>
                                            setData({
                                                ...data,
                                                password: e.target.value,
                                            })
                                        }
                                        placeholder="••••••••"
                                        className={passwordInputClass}
                                    />

                                    <button
                                        type="button"
                                        aria-label={
                                            showPassword
                                                ? "Sembunyikan kata sandi"
                                                : "Tampilkan kata sandi"
                                        }
                                        aria-pressed={showPassword}
                                        disabled={isSubmitting}
                                        onClick={() =>
                                            setShowPassword((value) => !value)
                                        }
                                        className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400 transition-colors hover:text-purple-600 focus:outline-none disabled:text-gray-300"
                                    >
                                        {renderEyeIcon(showPassword)}
                                    </button>
                                </div>
                            </div>

                            {/* Konfirmasi kata sandi */}
                            <div className="space-y-1">
                                <label
                                    htmlFor="reset-password-confirmation"
                                    className="block text-xs font-bold text-gray-700"
                                >
                                    Konfirmasi Sandi Baru
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
                                                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                                            />
                                        </svg>
                                    </span>

                                    <input
                                        id="reset-password-confirmation"
                                        name="password_confirmation"
                                        type={
                                            showPasswordConfirmation
                                                ? "text"
                                                : "password"
                                        }
                                        autoComplete="new-password"
                                        required
                                        value={data.password_confirmation}
                                        disabled={isSubmitting}
                                        onFocus={() => {
                                            setFocusField("password");
                                            setActivePasswordField(
                                                "confirmation",
                                            );
                                        }}
                                        onBlur={() => {
                                            setFocusField("idle");
                                            setActivePasswordField(null);
                                        }}
                                        onChange={(e) =>
                                            setData({
                                                ...data,
                                                password_confirmation:
                                                    e.target.value,
                                            })
                                        }
                                        placeholder="••••••••"
                                        className={passwordInputClass}
                                    />

                                    <button
                                        type="button"
                                        aria-label={
                                            showPasswordConfirmation
                                                ? "Sembunyikan konfirmasi kata sandi"
                                                : "Tampilkan konfirmasi kata sandi"
                                        }
                                        aria-pressed={showPasswordConfirmation}
                                        disabled={isSubmitting}
                                        onClick={() =>
                                            setShowPasswordConfirmation(
                                                (value) => !value,
                                            )
                                        }
                                        className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400 transition-colors hover:text-purple-600 focus:outline-none disabled:text-gray-300"
                                    >
                                        {renderEyeIcon(
                                            showPasswordConfirmation,
                                        )}
                                    </button>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                size="lg"
                                variant="primary"
                                disabled={isSubmitting}
                                isLoading={isSubmitting}
                                className="mt-2 h-10 w-full bg-purple-700 text-sm font-bold shadow-lg shadow-purple-600/30 transition-all hover:bg-purple-800 active:scale-[0.98] sm:mt-3 sm:h-11"
                            >
                                Simpan Kata Sandi
                            </Button>
                        </form>

                        <div className="mt-3 text-center text-xs font-semibold text-gray-500 sm:mt-5">
                            Batal mengatur ulang?{" "}
                            <Link
                                href="/login"
                                className="text-purple-700 transition-colors hover:text-purple-600"
                            >
                                Kembali ke Login
                            </Link>
                        </div>
                    </div>

                    <p className="mb-1 mt-3 text-center text-[10px] font-medium text-gray-400 sm:mb-4 sm:mt-6 sm:text-xs lg:mt-4">
                        © {new Date().getFullYear()} Puskeswan. Hak Cipta
                        Dilindungi.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function ResetPassword({ token, email }: Props) {
    return (
        <ToastProvider>
            <Head title="Buat Sandi Baru" />
            <ResetPasswordFormContent token={token} email={email} />
        </ToastProvider>
    );
}
