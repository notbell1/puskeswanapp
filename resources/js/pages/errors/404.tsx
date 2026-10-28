import { Head, Link, usePage } from "@inertiajs/react";
import { Button } from "@/components/ui";

interface Error404Props {
    status?: number;
    message?: string;
}

interface AuthUser {
    name?: string;
    email?: string;
    foto?: string | null;
    photo_url?: string | null;
    role?: string;
    role_display?: string;
}

export default function Error404({ status = 404, message }: Error404Props) {
    const { auth } = usePage().props as {
        auth?: {
            user?: AuthUser | null;
        };
    };

    const user = auth?.user;

    const title =
        status === 403
            ? "Akses Ditolak"
            : status === 500
              ? "Terjadi Kesalahan"
              : "Halaman Tidak Ditemukan";

    const description =
        message ||
        (status === 403
            ? "Maaf, Anda tidak memiliki izin untuk mengakses halaman ini."
            : status === 500
              ? "Terjadi kesalahan pada sistem. Silakan coba kembali beberapa saat lagi."
              : "Halaman yang Anda cari mungkin telah dipindahkan, dihapus, atau alamatnya tidak tepat.");

    const homeUrl = "/";
    const dashboardUrl = "/dashboard";

    return (
        <>
            <Head title={`${status} - ${title}`} />

            <div className="flex min-h-dvh w-full bg-gray-50 overflow-hidden font-sans relative flex-col lg:flex-row">
                {/* Kolom kiri — gradient dan pattern tapak kaki */}
                <div className="hidden lg:flex relative w-1/2 bg-linear-to-br from-purple-900 via-purple-800 to-purple-600 items-center justify-center overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full opacity-30">
                        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-500 rounded-full blur-[100px]" />
                        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-pink-500 rounded-full blur-[100px]" />
                    </div>

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

                    <div className="relative z-10 p-12 max-w-lg flex flex-col items-center text-center text-white">
                        <Link href="/" className="mb-8">
                            <img
                                src="/images/logo_puskeswan.webp"
                                alt="Logo Puskeswan Pariaman"
                                className="w-32 sm:w-40 h-auto drop-shadow-xl"
                            />
                        </Link>

                        <h1 className="mt-6 text-3xl sm:text-4xl font-extrabold leading-tight">
                            Sepertinya Kita Salah Jalan
                        </h1>

                        <p className="mt-4 text-purple-100 text-base sm:text-lg leading-relaxed">
                            Halaman yang Anda cari tidak dapat ditemukan.
                            Silakan kembali ke halaman publik untuk melanjutkan
                            aktivitas Anda.
                        </p>
                    </div>
                </div>

                {/* Kolom kanan — card error */}
                <div className="relative flex-1 flex flex-col justify-center items-center w-full lg:w-1/2 p-4 sm:p-8 overflow-y-auto">
                    <div className="absolute inset-0 lg:hidden bg-linear-to-br from-purple-50/90 via-white to-purple-100/80 -z-10" />

                    <div className="absolute -top-24 -left-24 w-72 h-72 bg-purple-300/30 rounded-full blur-3xl lg:hidden -z-10" />

                    <div className="w-full max-w-sm">
                        <div className="bg-white/80 lg:bg-white border border-white/50 lg:border-gray-100 shadow-2xl shadow-purple-900/5 rounded-3xl p-6 sm:p-8 relative">
                            <div className="text-center mb-6">
                                {/* Mobile: logo | Desktop: ikon tanda seru */}
                                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-purple-100 bg-purple-50 text-purple-700">
                                    <svg
                                        className="h-8 w-8"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        aria-hidden="true"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="1.8"
                                            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                                        />
                                    </svg>
                                </div>

                                <p className="text-7xl font-extrabold tracking-tight text-purple-800">
                                    {status}
                                </p>

                                <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-gray-900">
                                    {title}
                                </h2>

                                <p className="text-sm mt-2 leading-relaxed text-gray-500">
                                    {description}
                                </p>
                            </div>

                            {/* Informasi pengguna */}
                            {user && (
                                <div className="mb-5 flex items-center gap-3 rounded-xl border border-purple-100 bg-purple-50/70 p-3">
                                    {user.photo_url || user.foto ? (
                                        <img
                                            src={
                                                user.photo_url ||
                                                user.foto ||
                                                ""
                                            }
                                            alt="Foto profil"
                                            className="h-10 w-10 rounded-full border border-purple-100 object-cover object-center"
                                        />
                                    ) : (
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-200 font-bold text-purple-800">
                                            {user.name
                                                ?.charAt(0)
                                                .toUpperCase() || "U"}
                                        </div>
                                    )}

                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-bold text-gray-800">
                                            {user.name || "Pengguna"}
                                        </p>

                                        <p className="truncate text-xs text-gray-500">
                                            {user.role_display ||
                                                user.role ||
                                                user.email ||
                                                "Pengguna terautentikasi"}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Tombol navigasi */}
                            <div className="flex flex-col gap-3">
                                {user && (
                                    <Button
                                        type="button"
                                        variant="primary"
                                        onClick={() => {
                                            window.location.href = dashboardUrl;
                                        }}
                                        className="w-full h-11 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-sm shadow-lg shadow-purple-600/20 transition-all"
                                    >
                                        <svg
                                            className="mr-2 h-4 w-4"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            aria-hidden="true"
                                        >
                                            <rect
                                                x="3"
                                                y="3"
                                                width="7"
                                                height="7"
                                                rx="1"
                                                strokeWidth="2"
                                            />
                                            <rect
                                                x="14"
                                                y="3"
                                                width="7"
                                                height="7"
                                                rx="1"
                                                strokeWidth="2"
                                            />
                                            <rect
                                                x="14"
                                                y="14"
                                                width="7"
                                                height="7"
                                                rx="1"
                                                strokeWidth="2"
                                            />
                                            <rect
                                                x="3"
                                                y="14"
                                                width="7"
                                                height="7"
                                                rx="1"
                                                strokeWidth="2"
                                            />
                                        </svg>
                                        Kembali ke Dashboard
                                    </Button>
                                )}

                                <Button
                                    type="button"
                                    variant={user ? "secondary" : "primary"}
                                    onClick={() => {
                                        window.location.href = homeUrl;
                                    }}
                                    className={`w-full h-11 rounded-xl text-sm font-bold transition-all ${
                                        user
                                            ? "border border-gray-200 bg-white hover:bg-gray-50 text-gray-700"
                                            : "bg-purple-700 hover:bg-purple-800 text-white shadow-lg shadow-purple-600/20"
                                    }`}
                                >
                                    <svg
                                        className="mr-2 h-4 w-4"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        aria-hidden="true"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="m3 10 9-7 9 7M5 9v11h14V9M9 20v-7h6v7"
                                        />
                                    </svg>
                                    Kembali ke Halaman Publik
                                </Button>
                            </div>
                        </div>

                        <p className="text-center text-xs mt-6 lg:mt-4 font-medium mb-4 text-gray-400">
                            © {new Date().getFullYear()} Puskeswan. Hak Cipta
                            Dilindungi.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
