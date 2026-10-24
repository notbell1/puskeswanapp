import React from "react";

export default function AboutSection() {
    return (
        <section
            id="tentang"
            className="relative isolate flex min-h-[calc(100svh-4rem)] lg:min-h-[calc(100vh-4rem)] items-center overflow-hidden bg-gray-50/70 border-t border-gray-100 py-10 sm:py-12"
        >
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
                <div className="text-center max-w-3xl mx-auto">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-purple-100 text-purple-800 border border-purple-200/80 mb-2.5">
                        Profil Instansi &amp; Pelayanan Publik
                    </span>
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight">
                        UPT Puskeswan &amp; Inseminasi Buatan <br></br>
                        <span className="text-purple-700">Kota Pariaman</span>
                    </h2>
                    <p className="mt-2.5 text-xs sm:text-sm text-gray-600 leading-relaxed max-w-2xl mx-auto">
                        Unit Pelaksana Teknis Daerah (UPTD) di bawah naungan
                        Dinas Pertanian Pangan dan Perikanan Kota Pariaman yang
                        berkomitmen menyelenggarakan pelayanan medik veteriner,
                        pengendalian penyakit hewan menular, dan optimalisasi
                        reproduksi ternak masyarakat.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-stretch">
                    <div className="lg:col-span-7 rounded-2xl bg-white p-5 sm:p-6 border border-gray-200/80 shadow-xs flex flex-col justify-between space-y-4">
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <img
                                    src="/images/logo-pariaman.webp"
                                    alt="Logo Pemerintah Kota Pariaman"
                                    className="h-10 sm:h-11 w-auto object-contain shrink-0"
                                />
                                <div>
                                    <h3 className="text-sm sm:text-base font-extrabold text-gray-900 leading-snug">
                                        Garda Terdepan Kesehatan Hewan &amp;
                                        Ketahanan Pangan Daerah
                                    </h3>
                                    <p className="text-[11px] sm:text-xs font-semibold text-purple-700">
                                        Pemerintah Kota Pariaman &bull; Sumatera
                                        Barat
                                    </p>
                                </div>
                            </div>

                            <p className="text-xs text-gray-600 leading-relaxed">
                                UPT Puskeswan dan IB Kota Pariaman hadir
                                memberikan layanan kesehatan hewan yang
                                profesional, responsif, dan terintegrasi secara
                                digital. Kami melayani pemeriksaan klinis hewan
                                kesayangan (kucing, anjing) maupun hewan ternak
                                produktif (sapi, kerbau, kambing, domba, dan
                                unggas) baik secara pasif di klinik maupun aktif
                                melalui kunjungan lapangan ke sentra kelompok
                                tani ternak.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-gray-100">
                            <div className="p-3.5 rounded-xl bg-purple-50/60 border border-purple-100 space-y-1.5">
                                <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-purple-900 uppercase tracking-wide">
                                    <span className="w-1.5 h-1.5 rounded-full bg-purple-600" />
                                    Fokus Kesehatan Masyarakat Veteriner
                                </span>
                                <p className="text-[11px] text-gray-600 leading-relaxed">
                                    Mempertahankan status wilayah bebas penyakit
                                    zoonosis strategis melalui vaksinasi Rabies
                                    rutin, surveilans GHPR, serta pengendalian
                                    PMK dan LSD.
                                </p>
                            </div>

                            <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-100 space-y-1.5">
                                <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-blue-900 uppercase tracking-wide">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                                    Akselerasi Populasi &amp; Genetik Ternak
                                </span>
                                <p className="text-[11px] text-gray-600 leading-relaxed">
                                    Meningkatkan produktivitas peternak lokal
                                    melalui layanan Inseminasi Buatan (IB)
                                    bersertifikat, pemeriksaan kebuntingan
                                    (PKB), dan penanganan gangguan reproduksi.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-5 rounded-2xl bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 text-white p-5 sm:p-6 shadow-sm flex flex-col justify-between space-y-4">
                        <div className="space-y-1">
                            <span className="text-[10.5px] font-bold uppercase tracking-widest text-purple-200">
                                Komitmen Mutu Pelayanan
                            </span>
                            <h3 className="text-base sm:text-lg font-extrabold tracking-tight">
                                Standar Layanan Medik Veteriner Resmi
                            </h3>
                            <p className="text-xs text-purple-100/90 leading-relaxed">
                                Seluruh prosedur medis ditangani langsung oleh
                                Dokter Hewan ber-STRV/SIP resmi dan Paramedis
                                Veteriner terlatih.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-2.5">
                            <div className="p-3 rounded-xl bg-white/10 backdrop-blur-xs border border-white/15">
                                <span className="block text-lg sm:text-xl font-black text-white">
                                    100%
                                </span>
                                <span className="text-[11px] text-purple-100 font-medium leading-tight block mt-0.5">
                                    Rekam Medis Terintegrasi Digital
                                </span>
                            </div>
                            <div className="p-3 rounded-xl bg-white/10 backdrop-blur-xs border border-white/15">
                                <span className="block text-lg sm:text-xl font-black text-emerald-300">
                                    Gratis
                                </span>
                                <span className="text-[11px] text-purple-100 font-medium leading-tight block mt-0.5">
                                    Program Vaksinasi Rabies Terjadwal
                                </span>
                            </div>
                            <div className="p-3 rounded-xl bg-white/10 backdrop-blur-xs border border-white/15">
                                <span className="block text-lg sm:text-xl font-black text-amber-300">
                                    14 Hari
                                </span>
                                <span className="text-[11px] text-purple-100 font-medium leading-tight block mt-0.5">
                                    Protokol Observasi Suspek GHPR
                                </span>
                            </div>
                            <div className="p-3 rounded-xl bg-white/10 backdrop-blur-xs border border-white/15">
                                <span className="block text-lg sm:text-xl font-black text-cyan-300">
                                    -196°C
                                </span>
                                <span className="text-[11px] text-purple-100 font-medium leading-tight block mt-0.5">
                                    Standar Rantai Dingin Straw Semen IB
                                </span>
                            </div>
                        </div>

                        <div className="pt-2 border-t border-white/15 flex items-center justify-between text-[11px] text-purple-100">
                            <span>
                                📍 Jl. Sentot Ali Basa, Jati Mudik, Pariaman
                                Tengah
                            </span>
                            <span className="font-bold text-white shrink-0 ml-2">
                                Senin – Jumat
                            </span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                    <div className="p-4 sm:p-5 rounded-2xl bg-white border border-gray-200/80 shadow-xs hover:shadow-md hover:border-purple-200 transition-all duration-200 flex flex-col justify-between group">
                        <div className="space-y-3">
                            <div className="h-10 w-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                                    />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-sm font-extrabold text-gray-900 group-hover:text-purple-700 transition-colors">
                                    Pemeriksaan &amp; Pengobatan Klinis
                                </h3>
                                <p className="mt-1 text-xs text-gray-500 leading-relaxed">
                                    Diagnosa medis, terapi injeksi, bedah minor
                                    (sterilisasi/penanganan luka), serta
                                    konsultasi nutrisi hewan kesayangan dan
                                    ternak.
                                </p>
                            </div>
                        </div>
                        <div className="pt-3 mt-3 border-t border-gray-100 text-[11px] font-bold text-purple-700 flex items-center justify-between">
                            <span>Pelayanan Poliklinik &amp; Lapangan</span>
                            <span>✓</span>
                        </div>
                    </div>

                    <div className="p-4 sm:p-5 rounded-2xl bg-white border border-gray-200/80 shadow-xs hover:shadow-md hover:border-emerald-200 transition-all duration-200 flex flex-col justify-between group">
                        <div className="space-y-3">
                            <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                                <svg
                                    className="w-5 h-5"
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
                            </div>
                            <div>
                                <h3 className="text-sm font-extrabold text-gray-900 group-hover:text-emerald-700 transition-colors">
                                    Vaksinasi &amp; Surveilans Zoonosis
                                </h3>
                                <p className="mt-1 text-xs text-gray-500 leading-relaxed">
                                    Vaksinasi Rabies bagi HPR (anjing, kucing,
                                    kera), vaksinasi PMK/SE pada sapi dan
                                    kerbau, serta penerbitan surat keterangan
                                    observasi gigitan.
                                </p>
                            </div>
                        </div>
                        <div className="pt-3 mt-3 border-t border-gray-100 text-[11px] font-bold text-emerald-700 flex items-center justify-between">
                            <span>Proteksi Zoonosis Terjadwal</span>
                            <span>✓</span>
                        </div>
                    </div>

                    <div className="p-4 sm:p-5 rounded-2xl bg-white border border-gray-200/80 shadow-xs hover:shadow-md hover:border-blue-200 transition-all duration-200 flex flex-col justify-between group">
                        <div className="space-y-3">
                            <div className="h-10 w-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                                    />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-sm font-extrabold text-gray-900 group-hover:text-blue-700 transition-colors">
                                    Inseminasi Buatan (IB) &amp; PKB
                                </h3>
                                <p className="mt-1 text-xs text-gray-500 leading-relaxed">
                                    Pelayanan kawin suntik ternak sapi dan
                                    kerbau menggunakan straw semen beku
                                    Simmental &amp; Limousin disertai
                                    Pemeriksaan Kebuntingan (PKB).
                                </p>
                            </div>
                        </div>
                        <div className="pt-3 mt-3 border-t border-gray-100 text-[11px] font-bold text-blue-700 flex items-center justify-between">
                            <span>Optimalisasi Mutu Genetik</span>
                            <span>✓</span>
                        </div>
                    </div>

                    <div className="p-4 sm:p-5 rounded-2xl bg-white border border-gray-200/80 shadow-xs hover:shadow-md hover:border-amber-200 transition-all duration-200 flex flex-col justify-between group">
                        <div className="space-y-3">
                            <div className="h-10 w-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                    />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-sm font-extrabold text-gray-900 group-hover:text-amber-700 transition-colors">
                                    Rekam Medis Elektronik Mandiri
                                </h3>
                                <p className="mt-1 text-xs text-gray-500 leading-relaxed">
                                    Pencatatan riwayat triase, anamnesa,
                                    diagnosa dokter, hingga terapi obat secara
                                    transparan yang dapat dicek dan dicetak
                                    mandiri oleh pemilik.
                                </p>
                            </div>
                        </div>
                        <div className="pt-3 mt-3 border-t border-gray-100 text-[11px] font-bold text-amber-700 flex items-center justify-between">
                            <span>Transparan &amp; Akuntabel</span>
                            <span>✓</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
