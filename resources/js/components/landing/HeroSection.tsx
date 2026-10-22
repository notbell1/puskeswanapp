import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui";

interface HeroSectionProps {
    onNavigate: (
        path: string,
        sectionId: string,
        event?: React.MouseEvent,
    ) => void;
}

interface ServiceHighlight {
    id: string;
    tabLabel: string;
    badge: string;
    badgeColor: string;
    title: string;
    description: string;
    requirements: string[];
    schedule: string;
    cost: string;
    targetSectionPath: string;
    targetSectionId: string;
    ctaText: string;
}

const SERVICE_HIGHLIGHTS: ServiceHighlight[] = [
    {
        id: "klinis",
        tabLabel: "Poliklinik & Medis",
        badge: "Layanan Poliklinik Harian",
        badgeColor: "bg-purple-100 text-purple-800 border-purple-200",
        title: "Pemeriksaan Fisik, Pengobatan & Bedah Minor",
        description:
            "Penanganan klinis komprehensif untuk kucing, anjing, sapi, kambing, dan ternak rakyat oleh dokter hewan ber-STRV/SIP resmi.",
        requirements: [
            "Membawa KTP/NIK pemilik untuk registrasi Rekam Medis (RM)",
            "Triase suhu tubuh, berat badan, & anamnesa di loket pendaftaran",
            "Konsultasi diagnosa, injeksi vitamin/antibiotik, & terapi obat",
        ],
        schedule: "Senin – Jumat (08.00 – 15.30 WIB)",
        cost: "Sesuai Perda / Subsidi",
        targetSectionPath: "/cek-rekam-medis",
        targetSectionId: "cek-rekam-medis",
        ctaText: "Cek Riwayat Rekam Medis",
    },
    {
        id: "rabies",
        tabLabel: "Vaksinasi & Rabies",
        badge: "Pengendalian Zoonosis & GHPR",
        badgeColor: "bg-rose-100 text-rose-800 border-rose-200",
        title: "Vaksinasi Rabies Gratis & Observasi Kasus Gigitan",
        description:
            "Perlindungan aktif bagi Hewan Penular Rabies (anjing, kucing, kera) serta penerbitan surat pengantar observasi 14 hari kasus gigitan.",
        requirements: [
            "Hewan minimal berusia 3 bulan, sehat, dan tidak sedang bunting",
            "Pencucian luka gigitan 15 menit dengan sabun & air mengalir",
            "Karantina & observasi hewan penggigit selama 14 hari oleh dokter",
        ],
        schedule: "Pelayanan Harian & Pos Massal",
        cost: "Gratis (Program Pemerintah)",
        targetSectionPath: "/berita",
        targetSectionId: "berita",
        ctaText: "Baca Edukasi Zoonosis",
    },
    {
        id: "ib",
        tabLabel: "Inseminasi Buatan (IB)",
        badge: "Optimalisasi Reproduksi Ternak",
        badgeColor: "bg-blue-100 text-blue-800 border-blue-200",
        title: "Kawin Suntik Straw Unggul & Pemeriksaan Kebuntingan",
        description:
            "Peningkatan mutu genetik sapi dan kerbau peternak menggunakan semen beku Simmental & Limousin bersertifikat dengan rantai dingin -196°C.",
        requirements: [
            "Segera lapor petugas saat sapi menunjukkan tanda birahi (3A)",
            "Waktu optimal IB: 8 – 10 jam sejak awal munculnya birahi",
            "Pemeriksaan Kebuntingan (PKB) & USG pada usia 60 – 90 hari",
        ],
        schedule: "Kunjungan Kandang / Lapangan",
        cost: "Layanan Prioritas Peternak",
        targetSectionPath: "/staff",
        targetSectionId: "staff",
        ctaText: "Lihat Tim Medik & IB",
    },
];

const HERO_SLIDES = [
    {
        src: "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=1000&q=85",
        alt: "Pemeriksaan kesehatan hewan kesayangan",
        tag: "Poliklinik Veteriner",
        label: "Kesehatan Hewan Kesayangan",
        desc: "Pemeriksaan klinis, terapi pengobatan, & vaksinasi berkala",
    },
    {
        src: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=1000&q=85",
        alt: "Perawatan medis kucing",
        tag: "Vaksinasi & Sterilisasi",
        label: "Proteksi Penyakit Menular",
        desc: "Pencegahan Rabies, Panleukopenia, & parasit kulit",
    },
    {
        src: "https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&w=1000&q=85",
        alt: "Sapi ternak unggul program IB",
        tag: "Inseminasi Buatan (IB)",
        label: "Ketahanan Ternak Rakyat",
        desc: "Peningkatan genetik sapi potong & pemeriksaan kebuntingan",
    },
    {
        src: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=1000&q=85",
        alt: "Surveilans kesehatan hewan",
        tag: "Rekam Medis Digital",
        label: "Transparansi Riwayat Medis",
        desc: "Cek dan cetak mandiri hasil pemeriksaan dokter secara online",
    },
];

export default function HeroSection({ onNavigate }: HeroSectionProps) {
    const [activeSlide, setActiveSlide] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [selectedServiceId, setSelectedServiceId] =
        useState<string>("klinis");

    const activeService =
        SERVICE_HIGHLIGHTS.find((s) => s.id === selectedServiceId) ||
        SERVICE_HIGHLIGHTS[0];

    useEffect(() => {
        if (isPaused) return;
        const interval = window.setInterval(() => {
            setActiveSlide((curr) => (curr + 1) % HERO_SLIDES.length);
        }, 4500);
        return () => window.clearInterval(interval);
    }, [isPaused]);

    const handleSelectService = (id: string, index: number) => {
        setSelectedServiceId(id);
        setActiveSlide(index % HERO_SLIDES.length);
    };

    return (
        <section
            id="hero"
            className="relative isolate flex min-h-[calc(100svh-5rem)] lg:h-[calc(100vh-5rem)] items-center overflow-hidden bg-white py-6 lg:py-0"
        >
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
            >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-50/60 via-white to-indigo-50/40" />
                <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-purple-200/30 blur-3xl" />
                <div className="absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-indigo-100/40 blur-3xl" />
            </div>

            <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
                <div className="grid items-center gap-6 lg:grid-cols-12 lg:gap-8">
                    <div className="lg:col-span-7 space-y-4">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-purple-100/90 text-purple-800 border border-purple-200">
                                <img
                                    src="/images/logo-pariaman.png"
                                    alt="Kota Pariaman"
                                    className="w-3.5 h-3.5 object-contain"
                                />
                                <span>
                                    UPT Puskeswan &amp; IB Kota Pariaman
                                </span>
                            </span>
                        </div>

                        <div>
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-[2.6rem] font-extrabold leading-[1.15] tracking-tight text-gray-900">
                                Pusat Layanan Kesehatan Hewan &amp;{" "}
                                <span className="text-purple-700">
                                    Inseminasi Buatan Terpadu
                                </span>
                            </h1>
                            <p className="mt-2 text-xs sm:text-sm leading-relaxed text-gray-600 max-w-2xl">
                                Melayani pemeriksaan klinis hewan kesayangan,
                                vaksinasi Rabies gratis, pengendalian penyakit
                                zoonosis, kawin suntik (IB) ternak unggul, serta
                                akses rekam medis elektronik mandiri bagi
                                masyarakat Kota Pariaman.
                            </p>
                        </div>

                        <div className="rounded-2xl bg-white/95 border border-gray-200/90 shadow-sm p-3.5 sm:p-4 space-y-3">
                            <div className="flex items-center justify-between gap-2 flex-wrap border-b border-gray-100 pb-2.5">
                                <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-400">
                                    Eksplorasi Layanan:
                                </span>
                                <div
                                    className="flex items-center gap-1.5 flex-wrap"
                                    role="tablist"
                                >
                                    {SERVICE_HIGHLIGHTS.map((srv, idx) => {
                                        const isActive =
                                            srv.id === selectedServiceId;
                                        return (
                                            <button
                                                key={srv.id}
                                                type="button"
                                                role="tab"
                                                aria-selected={isActive}
                                                onClick={() =>
                                                    handleSelectService(
                                                        srv.id,
                                                        idx,
                                                    )
                                                }
                                                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                                                    isActive
                                                        ? "bg-purple-700 text-white shadow-xs shadow-purple-700/20"
                                                        : "bg-gray-100 text-gray-600 hover:bg-purple-50 hover:text-purple-700"
                                                }`}
                                            >
                                                {srv.tabLabel}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="space-y-2.5">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <span
                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${activeService.badgeColor}`}
                                    >
                                        {activeService.badge}
                                    </span>
                                    <div className="flex items-center gap-2 text-[11px] font-semibold text-gray-500">
                                        <span>🗓 {activeService.schedule}</span>
                                        <span className="text-gray-300">
                                            &bull;
                                        </span>
                                        <span className="text-emerald-700 font-bold">
                                            {activeService.cost}
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <h2 className="text-sm sm:text-base font-extrabold text-gray-900">
                                        {activeService.title}
                                    </h2>
                                    <p className="text-[11.5px] sm:text-xs text-gray-500 leading-relaxed mt-0.5">
                                        {activeService.description}
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                                    {activeService.requirements.map(
                                        (req, i) => (
                                            <div
                                                key={i}
                                                className="flex items-start gap-1.5 p-2 rounded-xl bg-gray-50/90 border border-gray-100 text-[10.5px] text-gray-700 font-medium leading-snug"
                                            >
                                                <span className="w-4 h-4 rounded-full bg-purple-100 text-purple-700 font-extrabold text-[9.5px] flex items-center justify-center shrink-0 mt-0.5">
                                                    {i + 1}
                                                </span>
                                                <span>{req}</span>
                                            </div>
                                        ),
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                            <div className="flex flex-wrap items-center gap-2.5">
                                <Button
                                    size="md"
                                    variant="primary"
                                    className="h-10 px-5 text-xs font-bold shadow-md shadow-purple-700/20 rounded-xl"
                                    onClick={(e) =>
                                        onNavigate(
                                            "/cek-rekam-medis",
                                            "cek-rekam-medis",
                                            e,
                                        )
                                    }
                                    leftIcon={
                                        <svg
                                            className="h-4 w-4 shrink-0"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                            />
                                        </svg>
                                    }
                                >
                                    Cek Rekam Medis Pasien
                                </Button>

                                <button
                                    type="button"
                                    onClick={(e) =>
                                        onNavigate("/kontak", "kontak", e)
                                    }
                                    className="h-10 px-4 text-xs font-bold border border-gray-200 bg-white text-gray-700 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200 rounded-xl"
                                >
                                    <span>📍 Lokasi Puskeswan</span>
                                </button>
                            </div>

                            <div className="flex items-center gap-4 border-t sm:border-t-0 pt-2.5 sm:pt-0 border-gray-100 shrink-0">
                                <div>
                                    <span className="block text-sm font-black text-purple-700 leading-none">
                                        100% Digital
                                    </span>
                                    <span className="text-[10px] text-gray-500 font-semibold">
                                        E-Rekam Medis
                                    </span>
                                </div>
                                <div className="h-6 w-px bg-gray-200" />
                                <div>
                                    <span className="block text-sm font-black text-emerald-700 leading-none">
                                        Gratis Vaksin
                                    </span>
                                    <span className="text-[10px] text-gray-500 font-semibold">
                                        Program Rabies
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-5 space-y-3">
                        <div
                            className="group relative overflow-hidden rounded-2xl bg-gray-900 shadow-lg border border-gray-200/80"
                            onMouseEnter={() => setIsPaused(true)}
                            onMouseLeave={() => setIsPaused(false)}
                        >
                            <div className="relative aspect-[16/10] sm:aspect-[16/9] lg:aspect-[16/10] overflow-hidden">
                                {HERO_SLIDES.map((slide, index) => (
                                    <img
                                        key={slide.src}
                                        src={slide.src}
                                        alt={slide.alt}
                                        draggable={false}
                                        loading={index === 0 ? "eager" : "lazy"}
                                        className={`absolute inset-0 h-full w-full object-cover transition-all duration-700 ease-in-out ${
                                            index === activeSlide
                                                ? "z-10 opacity-100 scale-100"
                                                : "z-0 opacity-0 scale-105"
                                        }`}
                                    />
                                ))}

                                <div className="pointer-events-none absolute inset-0 z-20 bg-gradient-to-t from-gray-950/85 via-gray-950/25 to-black/15" />

                                <div className="absolute left-3.5 top-3.5 z-30">
                                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-white/20 backdrop-blur-md border border-white/25 text-[10px] font-bold text-white uppercase tracking-wider">
                                        {HERO_SLIDES[activeSlide].tag}
                                    </span>
                                </div>

                                <div className="absolute right-3.5 top-3.5 z-30 flex items-center gap-1.5 bg-black/30 backdrop-blur-xs px-2.5 py-1.5 rounded-full">
                                    {HERO_SLIDES.map((slide, index) => (
                                        <button
                                            key={slide.src}
                                            type="button"
                                            aria-label={`Slide ${index + 1}`}
                                            onClick={() =>
                                                setActiveSlide(index)
                                            }
                                            className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                                                index === activeSlide
                                                    ? "w-5 bg-white"
                                                    : "w-1.5 bg-white/50 hover:bg-white/80"
                                            }`}
                                        />
                                    ))}
                                </div>

                                <div className="absolute inset-x-0 bottom-0 z-30 p-4 flex items-end justify-between gap-3">
                                    <div>
                                        <p className="text-sm sm:text-base font-extrabold text-white leading-tight">
                                            {HERO_SLIDES[activeSlide].label}
                                        </p>
                                        <p className="mt-0.5 text-[11px] sm:text-xs text-white/85">
                                            {HERO_SLIDES[activeSlide].desc}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-1.5 shrink-0">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setActiveSlide(
                                                    (curr) =>
                                                        (curr -
                                                            1 +
                                                            HERO_SLIDES.length) %
                                                        HERO_SLIDES.length,
                                                )
                                            }
                                            aria-label="Slide sebelumnya"
                                            className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/20 backdrop-blur-md border border-white/25 text-white hover:bg-white hover:text-gray-900 transition cursor-pointer"
                                        >
                                            <svg
                                                className="h-4 w-4"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    d="m15 18-6-6 6-6"
                                                    strokeWidth="2.5"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setActiveSlide(
                                                    (curr) =>
                                                        (curr + 1) %
                                                        HERO_SLIDES.length,
                                                )
                                            }
                                            aria-label="Slide berikutnya"
                                            className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/20 backdrop-blur-md border border-white/25 text-white hover:bg-white hover:text-gray-900 transition cursor-pointer"
                                        >
                                            <svg
                                                className="h-4 w-4"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    d="m9 18 6-6-6-6"
                                                    strokeWidth="2.5"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div
                                onClick={(e) =>
                                    onNavigate(
                                        "/cek-rekam-medis",
                                        "cek-rekam-medis",
                                        e,
                                    )
                                }
                                className="p-3 rounded-2xl bg-purple-50/70 hover:bg-purple-100/70 border border-purple-200/70 transition-colors cursor-pointer group"
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-700">
                                        Portal Mandiri
                                    </span>
                                    <span className="text-xs font-bold text-purple-700 group-hover:translate-x-0.5 transition-transform">
                                        &rarr;
                                    </span>
                                </div>
                                <p className="text-xs font-extrabold text-gray-900">
                                    Cari &amp; Cetak Rekam Medis
                                </p>
                                <p className="text-[10.5px] text-gray-500 mt-0.5 line-clamp-1">
                                    Gunakan NIK &amp; Nama Pemilik
                                </p>
                            </div>

                            <div
                                onClick={(e) =>
                                    onNavigate("/berita", "berita", e)
                                }
                                className="p-3 rounded-2xl bg-rose-50/70 hover:bg-rose-100/70 border border-rose-200/70 transition-colors cursor-pointer group"
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-700">
                                        Siaga Zoonosis
                                    </span>
                                    <span className="text-xs font-bold text-rose-700 group-hover:translate-x-0.5 transition-transform">
                                        &rarr;
                                    </span>
                                </div>
                                <p className="text-xs font-extrabold text-gray-900">
                                    Protokol Kasus Gigitan
                                </p>
                                <p className="text-[10.5px] text-gray-500 mt-0.5 line-clamp-1">
                                    Observasi 14 Hari &amp; Vaksinasi
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
