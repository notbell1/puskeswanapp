import React from "react";

interface FooterProps {
    onNavigate: (
        path: string,
        sectionId: string,
        event?: React.MouseEvent,
    ) => void;
    user?: any;
}

export default function Footer({ onNavigate }: FooterProps) {
    const handleLogoClick = (e: React.MouseEvent) => {
        onNavigate("/", "hero", e);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleBackToTop = (e: React.MouseEvent) => {
        e.preventDefault();
        if (document.getElementById("hero")) {
            onNavigate("/", "hero", e);
        }
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <footer className="bg-gray-900 text-gray-300 border-t border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex flex-col items-center md:items-start gap-4">
                        <a
                            href="/"
                            onClick={handleLogoClick}
                            className="flex items-center gap-2.5 group focus:outline-none focus:ring-0 [-webkit-tap-highlight-color:transparent]"
                        >
                            <img
                                src="/images/logo_puskeswan.webp"
                                alt="Logo Puskeswan"
                                className="h-8 sm:h-9 w-auto object-contain bg-white rounded-lg p-0.5 transition-transform duration-200 group-hover:scale-105"
                            />
                            <div className="flex items-baseline">
                                <span className="text-xl font-extrabold tracking-tight text-white transition-colors">
                                    Puskeswan
                                </span>
                                <span className="text-xl font-bold tracking-tight text-purple-500 transition-colors">
                                    App
                                </span>
                            </div>
                        </a>
                        <p className="text-xs text-gray-500 text-center md:text-left">
                            © {new Date().getFullYear()} Sistem Informasi
                            Puskeswan. Seluruh hak cipta dilindungi.
                        </p>
                    </div>

                    <div className="flex items-center justify-center text-sm font-medium">
                        <a
                            href="/"
                            onClick={handleBackToTop}
                            className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors focus:outline-none [-webkit-tap-highlight-color:transparent] group"
                        >
                            <span>Kembali ke Atas</span>
                            <svg
                                className="w-4 h-4 transition-transform duration-300 group-hover:-translate-y-1"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M5 10l7-7m0 0l7 7m-7-7v18"
                                />
                            </svg>
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
