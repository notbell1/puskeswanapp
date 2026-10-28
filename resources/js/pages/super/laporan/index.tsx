import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Button, Dropdown, Select } from '@/components/ui';

interface ReportProps {
    reportType: 'kunjungan' | 'rabies' | 'obat';
    startDate: string;
    endDate: string;
    reportData: any[];
    summary: {
        total_records: number;
        total_kunjungan_bulan_ini: number;
        total_rabies_tahun_ini: number;
        total_obat_kritis: number;
    };
}

export default function ReportIndex({ reportType, startDate, endDate, reportData, summary }: ReportProps) {
    const [selectedType, setSelectedType] = useState<string>(reportType);
    const [start, setStart] = useState<string>(startDate);
    const [end, setEnd] = useState<string>(endDate);

    const handleApplyFilter = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        router.get(
            '/super/laporan',
            {
                tipe: selectedType,
                tgl_mulai: start,
                tgl_selesai: end,
            },
            { preserveState: true, replace: true }
        );
    };

    const handleSelectType = (type: string) => {
        setSelectedType(type);
        router.get(
            '/super/laporan',
            {
                tipe: type,
                tgl_mulai: start,
                tgl_selesai: end,
            },
            { preserveState: true, replace: true }
        );
    };

    const handlePrint = () => {
        window.print();
    };

    const typeTitleMap: Record<string, string> = {
        kunjungan: 'Laporan Rekapitulasi Pelayanan & Rekam Medis Pasien',
        rabies: 'Laporan Surveilans Kasus Gigitan Hewan Penular Rabies (GHPR)',
        obat: 'Laporan Inventarisasi Ketersediaan Obat & Vaksin Puskeswan',
    };

    return (
        <DashboardLayout title="Pusat Laporan & Rekapitulasi">
            <Head title="Pusat Laporan" />

            <style>{`
                @media print {
                    nav, header, aside, .no-print, button, form {
                        display: none !important;
                    }
                    body {
                        background: white !important;
                        color: black !important;
                        font-size: 10pt;
                    }
                    .print-only {
                        display: block !important;
                    }
                    .print-card {
                        box-shadow: none !important;
                        border: none !important;
                        padding: 0 !important;
                    }
                    table {
                        width: 100% !important;
                        border-collapse: collapse !important;
                    }
                    th, td {
                        border: 1px solid #333 !important;
                        padding: 6px !important;
                    }
                }
                .print-only {
                    display: none;
                }
            `}</style>

            <div className="print-only mb-6 pb-2">
                <div className="relative flex items-center border-b-[2.5px] border-black pb-2">
                    <img
                        src="/images/logo-pariaman.webp"
                        alt="Logo Kota Pariaman"
                        className="absolute left-0 top-1 h-16 w-auto object-contain"
                    />
                    <div className="text-center font-serif text-black leading-tight w-full pl-16 pr-4">
                        <div className="text-xs uppercase tracking-wider font-normal">
                            PEMERINTAH KOTA PARIAMAN
                        </div>
                        <div className="text-sm uppercase tracking-wide font-bold">
                            DINAS PERTANIAN PANGAN DAN PERIKANAN
                        </div>
                        <div className="text-base uppercase tracking-wider font-black">
                            UPT PUSKESWAN DAN IB
                        </div>
                        <div className="text-[10px] font-semibold">
                            (Pusat Kesehatan Hewan dan Inseminasi Buatan)
                        </div>
                        <div className="text-[9px] mt-0.5">
                            Jl. Sentot Ali Basa Jati Telp. (0751) 93898 | E-Mail: puskeswanpariaman1@gmail.com | Kode Pos: 25516
                        </div>
                    </div>
                </div>
                <div className="mt-3 text-center">
                    <h4 className="text-sm font-bold uppercase text-gray-900 tracking-wide underline">
                        {typeTitleMap[selectedType] || 'Laporan Puskeswan'}
                    </h4>
                    {selectedType !== 'obat' && (
                        <p className="text-xs text-gray-600 mt-0.5">
                            Periode: {start} s/d {end}
                        </p>
                    )}
                </div>
            </div>

            <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                        Pusat Laporan &amp; Rekapitulasi Eksekutif
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                        Rekapitulasi multi-filter pelayanan medis, surveilans kasus rabies, dan laporan ketersediaan logistik obat/vaksin.
                    </p>
                </div>
                <div className="flex items-center gap-2.5">
                    <Button
                        variant="secondary"
                        size="md"
                        onClick={handlePrint}
                        className="shadow-xs whitespace-nowrap self-start sm:self-auto bg-white border border-gray-200"
                        leftIcon={
                            <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                            </svg>
                        }
                    >
                        Cetak Laporan / PDF
                    </Button>
                </div>
            </div>

            <div className="no-print grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
                <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs">
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
                        Data Laporan Terfilter
                    </span>
                    <span className="text-2xl font-black text-gray-900 mt-1 block">
                        {summary.total_records}
                    </span>
                    <span className="text-[11px] text-purple-600 font-semibold mt-0.5 block">
                        Tercatat pada filter aktif
                    </span>
                </div>
                <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs">
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
                        Kunjungan Bulan Ini
                    </span>
                    <span className="text-2xl font-black text-gray-900 mt-1 block">
                        {summary.total_kunjungan_bulan_ini}
                    </span>
                    <span className="text-[11px] text-emerald-600 font-semibold mt-0.5 block">
                        Pasien hewan terlayani
                    </span>
                </div>
                <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs">
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
                        Kasus Rabies Tahun Ini
                    </span>
                    <span className="text-2xl font-black text-rose-600 mt-1 block">
                        {summary.total_rabies_tahun_ini}
                    </span>
                    <span className="text-[11px] text-rose-600 font-semibold mt-0.5 block">
                        Surveilans gigitan aktif
                    </span>
                </div>
                <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs">
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
                        Obat Stok Kritis
                    </span>
                    <span className="text-2xl font-black text-amber-600 mt-1 block">
                        {summary.total_obat_kritis}
                    </span>
                    <span className="text-[11px] text-amber-600 font-semibold mt-0.5 block">
                        Perlu pengadaan segera (≤10)
                    </span>
                </div>
            </div>

            <div className="no-print bg-white rounded-2xl p-4 border border-gray-100 shadow-xs mb-5">
                <form onSubmit={handleApplyFilter} className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
                    <div className="w-full lg:w-96">
                        <Select
                            value={selectedType}
                            onChange={(val) => handleSelectType(val)}
                            options={[
                                {
                                    value: 'kunjungan',
                                    label: '🏥 Kunjungan & Pelayanan Medis',
                                    sublabel: 'Rekapitulasi diagnosa, tindakan medis, & dokter pemeriksa',
                                },
                                {
                                    value: 'rabies',
                                    label: '⚠️ Kasus Gigitan Rabies (GHPR)',
                                    sublabel: 'Surveilans gigitan HPR, lokasi luka, & status VAR/SAR',
                                },
                                {
                                    value: 'obat',
                                    label: '💊 Logistik Stok Obat & Vaksin',
                                    sublabel: 'Kuantitas persediaan farmasi & status ketersediaan',
                                },
                            ]}
                        />
                    </div>

                    {selectedType !== 'obat' && (
                        <div className="flex flex-col sm:flex-row items-center gap-2">
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <label className="text-xs text-gray-500 font-semibold whitespace-nowrap">Dari:</label>
                                <input
                                    type="date"
                                    value={start}
                                    onChange={(e) => setStart(e.target.value)}
                                    className="h-10 px-3 text-xs rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-600 font-medium"
                                />
                            </div>
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <label className="text-xs text-gray-500 font-semibold whitespace-nowrap">Sampai:</label>
                                <input
                                    type="date"
                                    value={end}
                                    onChange={(e) => setEnd(e.target.value)}
                                    className="h-10 px-3 text-xs rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-600 font-medium"
                                />
                            </div>
                            <Button type="submit" variant="primary" size="md" className="h-10 px-4 text-xs whitespace-nowrap">
                                Terapkan
                            </Button>
                        </div>
                    )}
                </form>
            </div>

            <div className="print-card bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden mb-6">
                <div className="overflow-x-auto">
                    {selectedType === 'kunjungan' && (
                        <table className="w-full text-xs text-left border-collapse border border-gray-200">
                            <thead>
                                <tr className="bg-gray-100/90 border-b border-gray-200 text-gray-700 uppercase text-[11px] font-bold tracking-wider">
                                    <th className="py-3 px-3.5 border-r border-gray-200 text-center font-bold w-12 shrink-0">No</th>
                                    <th className="py-3 px-3.5 border-r border-gray-200 text-center font-bold">Waktu Kunjungan</th>
                                    <th className="py-3 px-3.5 border-r border-gray-200 text-center font-bold">No. RM &amp; Hewan</th>
                                    <th className="py-3 px-3.5 border-r border-gray-200 text-center font-bold">Pemilik</th>
                                    <th className="py-3 px-3.5 border-r border-gray-200 text-center font-bold">Anamnesa &amp; Diagnosa</th>
                                    <th className="py-3 px-3.5 border-r border-gray-200 text-center font-bold">Terapi Pengobatan</th>
                                    <th className="py-3 px-3.5 border-r border-gray-200 text-center font-bold">Dokter Medis</th>
                                    <th className="py-3 px-3.5 text-center font-bold w-28 shrink-0">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {reportData.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="py-8 text-center text-gray-400">
                                            Tidak ada data kunjungan pada periode tanggal yang dipilih.
                                        </td>
                                    </tr>
                                ) : (
                                    reportData.map((item, index) => (
                                        <tr key={item.id} className="odd:bg-white even:bg-gray-50/70 hover:bg-purple-50/40 transition-colors">
                                            <td className="py-3 px-3.5 border-r border-gray-200 text-center font-medium text-gray-600">
                                                {index + 1}
                                            </td>
                                            <td className="py-3 px-3.5 border-r border-gray-200 font-medium text-gray-800 whitespace-nowrap">
                                                {item.tgl}
                                            </td>
                                            <td className="py-3 px-3.5 border-r border-gray-200">
                                                <span className="font-mono font-bold text-purple-700 block text-[11px]">
                                                    {item.no_rm}
                                                </span>
                                                <span className="font-bold text-gray-900 block leading-tight break-words">
                                                    {item.nama_hewan} ({item.jenis_hewan})
                                                </span>
                                            </td>
                                            <td className="py-3 px-3.5 border-r border-gray-200 text-gray-700 font-medium break-words">
                                                {item.pemilik}
                                            </td>
                                            <td className="py-3 px-3.5 border-r border-gray-200 max-w-xs">
                                                <span className="font-semibold text-gray-900 block leading-tight break-words">
                                                    {item.diagnosa}
                                                </span>
                                                <span className="text-[11px] text-gray-500 block break-words mt-1 leading-relaxed">
                                                    Keluhan: {item.anamnesa}
                                                </span>
                                            </td>
                                            <td className="py-3 px-3.5 border-r border-gray-200 text-gray-700 break-words leading-relaxed">
                                                {item.terapi}
                                            </td>
                                            <td className="py-3 px-3.5 border-r border-gray-200 font-medium text-gray-700 break-words">
                                                {item.dokter}
                                            </td>
                                            <td className="py-3 px-3.5 text-center">
                                                <span className="text-xs font-semibold text-purple-700">
                                                    {item.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}

                    {selectedType === 'rabies' && (
                        <table className="w-full text-xs text-left border-collapse border border-gray-200">
                            <thead>
                                <tr className="bg-gray-100/90 border-b border-gray-200 text-gray-700 uppercase text-[11px] font-bold tracking-wider">
                                    <th className="py-3 px-3.5 border-r border-gray-200 text-center font-bold w-12 shrink-0">No</th>
                                    <th className="py-3 px-3.5 border-r border-gray-200 text-center font-bold">No. Surat &amp; Tanggal</th>
                                    <th className="py-3 px-3.5 border-r border-gray-200 text-center font-bold">Korban / Pasien Gigitan</th>
                                    <th className="py-3 px-3.5 border-r border-gray-200 text-center font-bold">Lokasi Tubuh Digigit</th>
                                    <th className="py-3 px-3.5 border-r border-gray-200 text-center font-bold">Hewan Penggigit</th>
                                    <th className="py-3 px-3.5 border-r border-gray-200 text-center font-bold">Status Observasi Hewan</th>
                                    <th className="py-3 px-3.5 text-center font-bold w-28 shrink-0">Vaksin VAR/SAR</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {reportData.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="py-8 text-center text-gray-400">
                                            Tidak ada pencatatan kasus rabies pada rentang tanggal tersebut.
                                        </td>
                                    </tr>
                                ) : (
                                    reportData.map((item, index) => (
                                        <tr key={item.id} className="odd:bg-white even:bg-gray-50/70 hover:bg-purple-50/40 transition-colors">
                                            <td className="py-3 px-3.5 border-r border-gray-200 text-center font-medium text-gray-600">
                                                {index + 1}
                                            </td>
                                            <td className="py-3 px-3.5 border-r border-gray-200 whitespace-nowrap">
                                                <span className="font-mono font-bold text-gray-900 block text-[11px]">
                                                    {item.no_surat}
                                                </span>
                                                <span className="text-[11px] text-gray-500">{item.tgl_kejadian}</span>
                                            </td>
                                            <td className="py-3 px-3.5 border-r border-gray-200">
                                                <span className="font-bold text-gray-900 block leading-tight break-words">
                                                    {item.nama_pasien}
                                                </span>
                                                <span className="text-[11px] text-gray-500 block break-words mt-1 leading-relaxed">
                                                    {item.alamat_pasien}
                                                </span>
                                            </td>
                                            <td className="py-3 px-3.5 border-r border-gray-200 font-semibold text-rose-700">
                                                {item.lokasi_gigitan}
                                            </td>
                                            <td className="py-3 px-3.5 border-r border-gray-200 font-medium text-gray-800">
                                                {item.jenis_hewan}
                                            </td>
                                            <td className="py-3 px-3.5 border-r border-gray-200">
                                                <span className="text-xs font-semibold text-amber-600">
                                                    {item.status_hewan}
                                                </span>
                                            </td>
                                            <td className="py-3 px-3.5 text-center">
                                                <span className="text-xs font-semibold text-emerald-600">
                                                    {item.status_var}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}

                    {selectedType === 'obat' && (
                        <table className="w-full text-xs text-left border-collapse border border-gray-200">
                            <thead>
                                <tr className="bg-gray-100/90 border-b border-gray-200 text-gray-700 uppercase text-[11px] font-bold tracking-wider">
                                    <th className="py-3 px-3.5 border-r border-gray-200 text-center font-bold w-12 shrink-0">No</th>
                                    <th className="py-3 px-3.5 border-r border-gray-200 text-center font-bold">Kode</th>
                                    <th className="py-3 px-3.5 border-r border-gray-200 text-center font-bold">Nama Obat / Merek Vaksin</th>
                                    <th className="py-3 px-3.5 border-r border-gray-200 text-center font-bold">Kuantitas Stok</th>
                                    <th className="py-3 px-3.5 border-r border-gray-200 text-center font-bold">Satuan</th>
                                    <th className="py-3 px-3.5 text-center font-bold w-36 shrink-0">Status Ketersediaan</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {reportData.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-8 text-center text-gray-400">
                                            Tidak ada data perbekalan farmasi.
                                        </td>
                                    </tr>
                                ) : (
                                    reportData.map((item, index) => (
                                        <tr key={item.id} className="odd:bg-white even:bg-gray-50/70 hover:bg-purple-50/40 transition-colors">
                                            <td className="py-3 px-3.5 border-r border-gray-200 text-center font-medium text-gray-600">
                                                {index + 1}
                                            </td>
                                            <td className="py-3 px-3.5 border-r border-gray-200 font-mono font-bold text-purple-700">
                                                {item.kode_obat}
                                            </td>
                                            <td className="py-3 px-3.5 border-r border-gray-200 font-bold text-gray-900 break-words">
                                                {item.nama_obat}
                                            </td>
                                            <td className="py-3 px-3.5 border-r border-gray-200 font-bold text-sm text-gray-900">
                                                {item.stok}
                                            </td>
                                            <td className="py-3 px-3.5 border-r border-gray-200 text-gray-600 font-medium">
                                                {item.satuan}
                                            </td>
                                            <td className="py-3 px-3.5 text-center">
                                                {item.status === 'Kritis' && (
                                                    <span className="text-xs font-semibold text-rose-600">
                                                        Kritis (≤ 10)
                                                    </span>
                                                )}
                                                {item.status === 'Menipis' && (
                                                    <span className="text-xs font-semibold text-amber-600">
                                                        Menipis (11-30)
                                                    </span>
                                                )}
                                                {item.status === 'Aman' && (
                                                    <span className="text-xs font-semibold text-emerald-600">
                                                        Aman (&gt; 30)
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}
                </div>

                <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                    <span>
                        Total entitas data tercetak: <strong className="text-gray-900">{reportData.length} baris</strong>
                    </span>
                    <span className="text-[11px] text-gray-400">
                        Puskeswan Inseminasi Buatan &bull; Sistem Terintegrasi
                    </span>
                </div>
            </div>

            <div className="print-only mt-10 pt-4 flex justify-end">
                <div className="text-center w-64">
                    <p className="text-xs text-gray-700">Dikeluarkan di: Puskeswan Terpadu</p>
                    <p className="text-xs text-gray-700 mt-0.5">Tanggal: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    <p className="text-xs font-bold text-gray-900 mt-3">Mengetahui,</p>
                    <p className="text-xs text-gray-700">Kepala UPTD Puskeswan</p>
                    <div className="h-20" />
                    <p className="text-xs font-bold text-gray-900 underline">( .................................................... )</p>
                    <p className="text-[10px] text-gray-600">NIP. ....................................................</p>
                </div>
            </div>
        </DashboardLayout>
    );
}

