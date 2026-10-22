import React, { useState, useEffect } from "react";
import { Head, Link, router } from "@inertiajs/react";
import { Button, ToastProvider, useToast } from "@/components/ui";

interface InteractiveMascotProps {
    focusField: "idle" | "email" | "password";
    showPassword: boolean;
    isLocked: boolean; // Benar-benar diblokir oleh countdown (rate limit)
    isSubmitting: boolean; // Sedang memproses login
}

/**
 * Maskot Dokter Hewan Interaktif (Live Animated Mascot)
 */
function InteractiveMascot({
    focusField,
    showPassword,
    isLocked,
    isSubmitting,
}: InteractiveMascotProps) {
    const isEmail = focusField === "email" && !isLocked && !isSubmitting;
    const isPasswordHidden =
        focusField === "password" &&
        !showPassword &&
        !isLocked &&
        !isSubmitting;
    const isPasswordVisible =
        focusField === "password" && showPassword && !isLocked && !isSubmitting;

    const leftEarTransform = isLocked
        ? "rotate(-25deg)"
        : isEmail
          ? "rotate(-6deg)"
          : "none";
    const rightEarTransform = isLocked
        ? "rotate(25deg)"
        : isEmail
          ? "rotate(6deg)"
          : "none";
    const eyeRy = isLocked
        ? "1"
        : isPasswordHidden || isPasswordVisible
          ? "1"
          : "8";
    const eyeFill = isLocked
        ? "#7f1d1d"
        : isPasswordHidden || isPasswordVisible
          ? "#581c87"
          : "#ffffff";
    const mouthPath = isLocked
        ? "M 54 75 Q 60 70 66 75"
        : "M 55 74 Q 60 78 60 72 Q 60 78 65 74";

    return (
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 mx-auto -mb-4 sm:-mb-6 select-none pointer-events-none z-10 drop-shadow-xl transition-transform duration-500 hover:scale-105">
            <div
                className={`absolute inset-0 rounded-full blur-xl animate-pulse transition-colors duration-500 ${isLocked ? "bg-red-500/50" : "bg-purple-300/40"}`}
            />

            <svg
                viewBox="0 0 120 120"
                className={`relative w-full h-full transform transition-all duration-300 ${isLocked ? "scale-95" : ""} ${isSubmitting ? "animate-bounce" : ""}`}
            >
                <path
                    d="M 28 42 L 18 16 L 46 28 Z"
                    fill={isLocked ? "#b91c1c" : "#7e22ce"}
                    className="transition-all duration-300 origin-bottom-left"
                    style={{ transform: leftEarTransform }}
                />
                <path
                    d="M 27 38 L 22 22 L 40 30 Z"
                    fill={isLocked ? "#fee2e2" : "#f3e8ff"}
                    className="transition-colors duration-300"
                />

                <path
                    d="M 92 42 L 102 16 L 74 28 Z"
                    fill={isLocked ? "#b91c1c" : "#7e22ce"}
                    className="transition-all duration-300 origin-bottom-right"
                    style={{ transform: rightEarTransform }}
                />
                <path
                    d="M 93 38 L 98 22 L 80 30 Z"
                    fill={isLocked ? "#fee2e2" : "#f3e8ff"}
                    className="transition-colors duration-300"
                />

                <circle
                    cx="60"
                    cy="62"
                    r="38"
                    fill={isLocked ? "#dc2626" : "#9333ea"}
                    className="transition-colors duration-500"
                />
                <circle
                    cx="60"
                    cy="64"
                    r="34"
                    fill={isLocked ? "#ef4444" : "#a855f7"}
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
                    fill={isLocked ? "#b91c1c" : "#7e22ce"}
                    className="transition-colors duration-300"
                />
                <rect
                    x="56"
                    y="23"
                    width="8"
                    height="4"
                    rx="1"
                    fill={isLocked ? "#b91c1c" : "#7e22ce"}
                    className="transition-colors duration-300"
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
                    {!isPasswordHidden && !isLocked && (
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
                    )}
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
                    {!isPasswordHidden && !isPasswordVisible && !isLocked && (
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
                    )}
                </g>

                <polygon
                    points="57,68 63,68 60,72"
                    fill={isLocked ? "#991b1b" : "#f43f5e"}
                    className="transition-colors duration-300"
                />
                <path
                    d={mouthPath}
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    className="transition-all duration-300"
                />

                <circle
                    cx="38"
                    cy="68"
                    r="4"
                    fill={isLocked ? "#fca5a5" : "#f472b6"}
                    opacity={isLocked ? "0.3" : "0.6"}
                />
                <circle
                    cx="82"
                    cy="68"
                    r="4"
                    fill={isLocked ? "#fca5a5" : "#f472b6"}
                    opacity={isLocked ? "0.3" : "0.6"}
                />

                <path
                    d="M 40 85 Q 60 102 80 85"
                    fill="none"
                    stroke={isLocked ? "#fecaca" : "#e9d5ff"}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    className="transition-colors duration-300"
                />
                <circle
                    cx="60"
                    cy="94"
                    r="4.5"
                    fill="#facc15"
                    stroke={isLocked ? "#b91c1c" : "#7e22ce"}
                    strokeWidth="1.5"
                />

                <g
                    className="transition-all duration-300 ease-in-out"
                    style={{
                        transformOrigin: "40px 88px",
                        transform:
                            isPasswordHidden && !isLocked
                                ? "translate(8px, -28px) scale(1.15)"
                                : "translate(0px, 0px) scale(1)",
                    }}
                >
                    <ellipse
                        cx="40"
                        cy="88"
                        rx="8"
                        ry="7"
                        fill={isLocked ? "#fee2e2" : "#f3e8ff"}
                        stroke={isLocked ? "#b91c1c" : "#7e22ce"}
                        strokeWidth="1.5"
                        className="transition-colors duration-300"
                    />
                    <circle
                        cx="37"
                        cy="87"
                        r="1.5"
                        fill={isLocked ? "#fca5a5" : "#d8b4fe"}
                    />
                    <circle
                        cx="40"
                        cy="85"
                        r="1.5"
                        fill={isLocked ? "#fca5a5" : "#d8b4fe"}
                    />
                    <circle
                        cx="43"
                        cy="87"
                        r="1.5"
                        fill={isLocked ? "#fca5a5" : "#d8b4fe"}
                    />
                </g>

                <g
                    className="transition-all duration-300 ease-in-out"
                    style={{
                        transformOrigin: "80px 88px",
                        transform:
                            (isPasswordHidden || isPasswordVisible) && !isLocked
                                ? "translate(-8px, -28px) scale(1.15)"
                                : "translate(0px, 0px) scale(1)",
                    }}
                >
                    <ellipse
                        cx="80"
                        cy="88"
                        rx="8"
                        ry="7"
                        fill={isLocked ? "#fee2e2" : "#f3e8ff"}
                        stroke={isLocked ? "#b91c1c" : "#7e22ce"}
                        strokeWidth="1.5"
                        className="transition-colors duration-300"
                    />
                    <circle
                        cx="77"
                        cy="87"
                        r="1.5"
                        fill={isLocked ? "#fca5a5" : "#d8b4fe"}
                    />
                    <circle
                        cx="80"
                        cy="85"
                        r="1.5"
                        fill={isLocked ? "#fca5a5" : "#d8b4fe"}
                    />
                    <circle
                        cx="83"
                        cy="87"
                        r="1.5"
                        fill={isLocked ? "#fca5a5" : "#d8b4fe"}
                    />
                </g>
            </svg>
        </div>
    );
}

function LoginFormContent({
    lockout_seconds = 0,
}: {
    lockout_seconds?: number;
}) {
    const { success, error, info } = useToast();

    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [remember, setRemember] = useState<boolean>(false);
    const [showPassword, setShowPassword] = useState<boolean>(false);

    const [honeyTrap, setHoneyTrap] = useState<string>("");

    const [focusField, setFocusField] = useState<"idle" | "email" | "password">(
        "idle",
    );
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [countdown, setCountdown] = useState<number>(() =>
        Math.max(0, lockout_seconds),
    );

    const isLocked = countdown > 0;
    const isDisabled = isSubmitting || isLocked; // Keduanya tetap membuat form tidak bisa diklik

    useEffect(() => {
        if (lockout_seconds > 0) {
            setCountdown(lockout_seconds);
        }
    }, [lockout_seconds]);

    useEffect(() => {
        if (countdown <= 0) return;

        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [countdown]);

    const formatCountdown = (totalSeconds: number): string => {
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    };

    const [isMounted, setIsMounted] = useState<boolean>(false);
    useEffect(() => setIsMounted(true), []);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (countdown > 0) return;

        if (!email.trim() || !password.trim()) {
            error("Harap masukkan email dan kata sandi Anda!");
            return;
        }

        setIsSubmitting(true);
        router.post(
            "/login",
            {
                email,
                password,
                remember,
                honey_trap: honeyTrap,
            },
            {
                onSuccess: () =>
                    success("Verifikasi berhasil! Mengalihkan ke dashboard..."),
                onError: (errs: any) => {
                    setIsSubmitting(false);

                    if (errs.ip_blocked) {
                        error(
                            "Alamat IP Anda telah diblokir selama 30 menit karena terdeteksi aktivitas login mencurigakan berulang kali! Mengalihkan ke sistem keamanan...",
                        );
                        setTimeout(() => {
                            router.visit("/429");
                        }, 1000);
                        return;
                    }

                    if (errs.lockout_seconds) {
                        setCountdown(Number(errs.lockout_seconds));
                    }

                    const rawMsg =
                        errs.email || errs.password || Object.values(errs)[0];
                    error(
                        String(rawMsg || "Email atau kata sandi tidak valid."),
                    );
                },
                onFinish: () => setIsSubmitting(false),
            },
        );
    };

    return (
        <div className="flex h-[100dvh] w-full bg-gray-50 overflow-hidden font-sans relative flex-col lg:flex-row">
            <div className="fixed top-5 left-5 sm:top-8 sm:left-8 lg:hidden z-50">
                <Link
                    href="/"
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

                <svg
                    className="absolute inset-0 w-full h-full opacity-10"
                    xmlns="http://www.w3.org/2000/svg"
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
                    ></rect>
                </svg>

                <div
                    className={`relative z-10 p-12 max-w-lg flex flex-col items-center text-center text-white transition-all duration-1000 transform ${isMounted ? "translate-x-0 opacity-100" : "-translate-x-12 opacity-0"}`}
                >
                    <img
                        src="/images/logo_puskeswan.png"
                        alt="Logo Puskeswan Pariaman"
                        className="w-32 sm:w-40 h-auto mb-8 drop-shadow-xl"
                    />

                    <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-4 drop-shadow-lg">
                        Pelayanan Medis <br />
                        <span className="text-purple-300">Terpadu & Cepat</span>
                    </h1>
                    <p className="text-purple-100 text-lg leading-relaxed mb-10">
                        Platform manajemen Pusat Kesehatan Hewan terintegrasi
                        untuk pendataan rekam medis, inventori obat, dan jadwal
                        dokter yang lebih efisien.
                    </p>

                    <Link
                        href="/"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 shadow-lg text-sm font-bold text-white transition-all duration-300 group"
                    >
                        <svg
                            className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform"
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
                        Kembali ke Halaman Publik
                    </Link>
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
                        showPassword={showPassword}
                        isLocked={isLocked} // Inject hanya jika benar-benar lockout rate limit
                        isSubmitting={isSubmitting} // Inject status memproses login biasa
                    />

                    <div
                        className={`backdrop-blur-xl border shadow-2xl rounded-3xl p-6 sm:p-8 z-20 relative transition-all duration-500 ${
                            isLocked
                                ? "bg-red-50/95 border-red-200 shadow-red-900/10"
                                : "bg-white/80 lg:bg-white border-white/50 lg:border-gray-100 shadow-purple-900/5"
                        }`}
                    >
                        <div className="text-center mb-6">
                            <img
                                src="/images/logo_puskeswan.png"
                                alt="Logo Puskeswan Pariaman"
                                className="w-16 sm:w-20 h-auto mx-auto mb-4 lg:hidden drop-shadow-sm"
                            />
                            <h2
                                className={`text-2xl font-extrabold tracking-tight transition-colors duration-500 ${isLocked ? "text-red-900" : "text-gray-900"}`}
                            >
                                {isLocked ? "Akses Ditahan" : "Selamat Datang!"}
                            </h2>
                            <p
                                className={`text-sm mt-1 transition-colors duration-500 ${isLocked ? "text-red-600 font-medium" : "text-gray-500"}`}
                            >
                                {isLocked
                                    ? "Terlalu banyak percobaan."
                                    : "Masuk untuk mengelola layanan medis hewan."}
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div
                                className="absolute -left-[9999px] top-auto overflow-hidden w-1 h-1"
                                aria-hidden="true"
                            >
                                <label htmlFor="honey_trap">
                                    Tinggalkan kosong jika Anda manusia
                                </label>
                                <input
                                    type="text"
                                    id="honey_trap"
                                    name="honey_trap"
                                    tabIndex={-1}
                                    autoComplete="off"
                                    value={honeyTrap}
                                    onChange={(e) =>
                                        setHoneyTrap(e.target.value)
                                    }
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label
                                    className={`block text-xs font-bold transition-colors duration-300 ${isLocked ? "text-red-800" : "text-gray-700"}`}
                                >
                                    Email Petugas
                                </label>
                                <div className="relative group">
                                    <span
                                        className={`absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors duration-300 ${
                                            isLocked
                                                ? "text-red-400"
                                                : "text-gray-400 group-focus-within:text-purple-600"
                                        }`}
                                    >
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
                                        disabled={isDisabled}
                                        onFocus={() => setFocusField("email")}
                                        onBlur={() => setFocusField("idle")}
                                        onChange={(e) =>
                                            setEmail(e.target.value)
                                        }
                                        placeholder="nama@puskeswan.go.id"
                                        className={`w-full h-11 pl-10 pr-4 text-sm rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all placeholder:text-gray-400 font-medium ${
                                            isLocked
                                                ? "!bg-red-100/50 !border-red-300 !text-red-900 !placeholder-red-300 cursor-not-allowed"
                                                : "disabled:bg-gray-100/50 disabled:text-gray-400 disabled:cursor-not-allowed"
                                        }`}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <label
                                        className={`block text-xs font-bold transition-colors duration-300 ${isLocked ? "text-red-800" : "text-gray-700"}`}
                                    >
                                        Kata Sandi
                                    </label>
                                    <Link
                                        href="/forgot-password"
                                        className={`text-[11px] font-semibold transition-colors ${
                                            isLocked
                                                ? "text-red-500 cursor-not-allowed pointer-events-none"
                                                : "text-purple-600 hover:text-purple-800"
                                        }`}
                                    >
                                        Lupa Sandi?
                                    </Link>
                                </div>
                                <div className="relative group">
                                    <span
                                        className={`absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors duration-300 ${
                                            isLocked
                                                ? "text-red-400"
                                                : "text-gray-400 group-focus-within:text-purple-600"
                                        }`}
                                    >
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
                                                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                            />
                                        </svg>
                                    </span>
                                    <input
                                        type={
                                            showPassword ? "text" : "password"
                                        }
                                        required
                                        value={password}
                                        disabled={isDisabled}
                                        onFocus={() =>
                                            setFocusField("password")
                                        }
                                        onBlur={() => setFocusField("idle")}
                                        onChange={(e) =>
                                            setPassword(e.target.value)
                                        }
                                        placeholder="••••••••"
                                        className={`w-full h-11 pl-10 pr-11 text-sm rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all placeholder:text-gray-400 font-medium ${
                                            isLocked
                                                ? "!bg-red-100/50 !border-red-300 !text-red-900 !placeholder-red-300 cursor-not-allowed"
                                                : "disabled:bg-gray-100/50 disabled:text-gray-400 disabled:cursor-not-allowed"
                                        }`}
                                    />
                                    <button
                                        type="button"
                                        disabled={isDisabled}
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                        className={`absolute inset-y-0 right-0 pr-3.5 flex items-center focus:outline-none transition-colors ${
                                            isLocked
                                                ? "text-red-400 cursor-not-allowed"
                                                : "text-gray-400 hover:text-purple-600 disabled:text-gray-300"
                                        }`}
                                    >
                                        {showPassword ? (
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
                                                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
                                                />
                                            </svg>
                                        ) : (
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
                                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                />
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                                />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            <label
                                className={`flex items-center gap-2 pt-1 transition-all ${
                                    isLocked
                                        ? "cursor-not-allowed text-red-700"
                                        : "cursor-pointer text-gray-600 disabled:text-gray-400"
                                }`}
                            >
                                <input
                                    type="checkbox"
                                    checked={remember}
                                    disabled={isDisabled}
                                    onChange={(e) =>
                                        setRemember(e.target.checked)
                                    }
                                    className={`h-4 w-4 rounded border-gray-300 focus:ring-purple-500 text-purple-600 ${
                                        isLocked
                                            ? "disabled:bg-red-200 disabled:border-red-300 disabled:checked:bg-red-500 cursor-not-allowed"
                                            : "disabled:bg-gray-100 disabled:border-gray-200 disabled:cursor-not-allowed"
                                    }`}
                                />
                                <span className="text-xs font-medium select-none">
                                    Ingat saya
                                </span>
                            </label>

                            <Button
                                type="submit"
                                size="lg"
                                variant="primary"
                                disabled={isDisabled}
                                isLoading={isSubmitting}
                                className={`w-full h-11 text-sm font-bold transition-all mt-2 ${
                                    isLocked
                                        ? "!bg-red-600 !text-white !cursor-not-allowed shadow-lg shadow-red-600/30 opacity-100 hover:!bg-red-600"
                                        : "bg-purple-700 hover:bg-purple-800 shadow-lg shadow-purple-600/30 active:scale-[0.98]"
                                }`}
                            >
                                {isLocked ? (
                                    <span className="flex items-center justify-center gap-2 font-mono">
                                        <svg
                                            className="w-4 h-4 text-white animate-bounce"
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
                                        Tunggu ({formatCountdown(countdown)})
                                    </span>
                                ) : (
                                    "Masuk"
                                )}
                            </Button>
                        </form>
                    </div>

                    <p
                        className={`text-center text-xs mt-6 lg:mt-4 font-medium mb-4 transition-colors ${isLocked ? "text-red-400" : "text-gray-400"}`}
                    >
                        © {new Date().getFullYear()} Puskeswan. Hak Cipta
                        Dilindungi.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function Login({
    lockout_seconds = 0,
}: {
    lockout_seconds?: number;
}) {
    return (
        <ToastProvider>
            <Head title="Masuk Petugas" />
            <LoginFormContent lockout_seconds={lockout_seconds} />
        </ToastProvider>
    );
}
