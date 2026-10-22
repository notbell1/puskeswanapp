import React from "react";
import { ContactFormData } from "./types";

interface ContactSectionProps {
    contactForm?: ContactFormData;
    setContactForm?: React.Dispatch<React.SetStateAction<ContactFormData>>;
    isSending?: boolean;
    onSubmit?: (e: React.FormEvent) => void;
}

export default function ContactSection(_props: ContactSectionProps) {
    return (
        <section
            id="kontak"
            className="relative isolate flex min-h-[calc(100svh-4rem)] lg:min-h-[calc(100vh-4rem)] items-center overflow-hidden bg-gray-50/70 border-t border-gray-100 py-10 sm:py-12"
        >
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-6 sm:mb-8">
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight">
                        Hubungi &amp; Kunjungi <span className="text-purple-700">Puskeswan</span>
                    </h2>
                    <p className="mt-2 text-xs sm:text-sm text-gray-600 leading-relaxed max-w-2xl mx-auto">
                        Kunjungi langsung lokasi pelayanan UPT Puskeswan dan Inseminasi Buatan (IB)
                        Kota Pariaman atau hubungi kontak resmi kami untuk informasi pelayanan kesehatan hewan.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-stretch">
                    <div className="lg:col-span-5 flex flex-col justify-between">
                        <div className="h-full rounded-2xl bg-white p-5 sm:p-6 border border-gray-200/80 shadow-xs flex flex-col justify-between space-y-5">
                            <div>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10.5px] font-bold uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200 mb-2">
                                    Dinas Pertanian Pangan &amp; Perikanan
                                </span>
                                <h3 className="text-base sm:text-lg font-extrabold text-gray-900 tracking-tight">
                                    UPT Puskeswan dan IB Kota Pariaman
                                </h3>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    Pusat Kesehatan Hewan &amp; Inseminasi Buatan Terpadu Pemerintah Kota Pariaman.
                                </p>
                            </div>

                            <div className="space-y-4 text-xs text-gray-600">
                                <div className="flex items-start gap-3">
                                    <div className="h-9 w-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                                        <svg
                                            className="w-4.5 h-4.5"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                            />
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                            />
                                        </svg>
                                    </div>
                                    <div>
                                        <strong className="block text-gray-900 text-xs font-bold">
                                            Alamat Kantor:
                                        </strong>
                                        <span className="text-[11.5px] leading-relaxed text-gray-600 block mt-0.5">
                                            Jl. Sentot Ali Basa, Kel. Jati Mudik / Jati Hilir, Kec. Pariaman Tengah, Kota Pariaman, Sumatera Barat (25516)
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="h-9 w-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                                        <svg
                                            className="w-4.5 h-4.5"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                            />
                                        </svg>
                                    </div>
                                    <div>
                                        <strong className="block text-gray-900 text-xs font-bold">
                                            Jam Operasional Pelayanan:
                                        </strong>
                                        <span className="text-[11.5px] text-gray-600 block mt-0.5">
                                            Senin – Jumat: 08.00 – 15.30 WIB
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="h-9 w-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                                        <svg
                                            className="w-4.5 h-4.5"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                            />
                                        </svg>
                                    </div>
                                    <div>
                                        <strong className="block text-gray-900 text-xs font-bold">
                                            Email Pengaduan &amp; Surat Resmi:
                                        </strong>
                                        <span className="text-[11.5px] text-gray-600 block mt-0.5">
                                            puskeswanpariaman1@gmail.com
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-3.5 rounded-xl bg-purple-50/80 border border-purple-100 text-xs space-y-1">
                                <div className="font-bold flex items-center gap-1.5 text-purple-900 text-[11px]">
                                    <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse" />
                                    <span>Layanan Darurat Kasus Gigitan Rabies (GHPR)</span>
                                </div>
                                <p className="text-purple-700 leading-relaxed text-[11px]">
                                    Cuci luka gigitan dengan sabun dan air mengalir selama 15 menit, lalu
                                    segera laporkan hewan penggigit ke UPT Puskeswan Kota Pariaman untuk observasi 14 hari.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-7 flex">
                        <div className="w-full rounded-2xl bg-white p-3 sm:p-4 border border-gray-200/80 shadow-xs flex flex-col justify-between gap-3">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
                                <div>
                                    <h3 className="text-sm sm:text-base font-extrabold text-gray-900 tracking-tight">
                                        Peta Lokasi UPT Puskeswan dan IB Kota Pariaman
                                    </h3>
                                    <p className="text-[11px] sm:text-xs text-gray-500">
                                        Jl. Sentot Ali Basa, Jati Mudik, Kec. Pariaman Tengah, Kota Pariaman
                                    </p>
                                </div>
                                <a
                                    href="https://maps.google.com/?q=UPT+PUSKESWAN+DAN+IB+KOTA+PARIAMAN"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-[11px] font-bold transition-colors shrink-0 self-start sm:self-auto"
                                >
                                    <span>Buka di Google Maps</span>
                                    <span>&rarr;</span>
                                </a>
                            </div>

                            <div className="relative w-full flex-1 min-h-[320px] sm:min-h-[380px] rounded-xl overflow-hidden border border-gray-200 bg-gray-100">
                                <iframe
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3989.587880879524!2d100.13538597472355!3d-0.6158026993781806!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2fd4e244a233ee99%3A0xeb72dff1ed37a07a!2sUPT%20PUSKESWAN%20DAN%20IB%20KOTA%20PARIAMAN!5e0!3m2!1sid!2sid!4v1792615358084!5m2!1sid!2sid"
                                    width="600"
                                    height="450"
                                    style={{ border: 0 }}
                                    allowFullScreen
                                    loading="lazy"
                                    referrerPolicy="strict-origin-when-cross-origin"
                                    title="Peta Lokasi UPT Puskeswan dan IB Kota Pariaman"
                                    className="w-full h-full min-h-[320px] sm:min-h-[380px]"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
