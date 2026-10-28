import React from 'react';
import { Head, usePage } from '@inertiajs/react';
import { DashboardLayout } from '@/layouts';
import { Button, useToast } from '@/components/ui';

export default function Dashboard() {
    const page = usePage();
    const { success, info } = useToast();

    const auth = page?.props?.auth as { user?: { name?: string; email?: string; role?: string } } | undefined;
    const user = auth?.user || {
        name: 'drh. Ahmad Fauzi',
        email: 'dokter@puskeswan.go.id',
        role: 'dokter',
    };

    const role = (String(user.role || 'dokter')).toLowerCase();

    const roleTitles: Record<string, string> = {
        super: 'Ringkasan Eksekutif & Manajemen Puskeswan',
        admin: 'Papan Kendali Administrasi & Antrean Pasien',
        dokter: 'Papan Kerja Medis & Antrean Pemeriksaan Pasien',
    };

    return (
        <DashboardLayout title={roleTitles[role] || 'Dashboard Puskeswan'}>
            <Head title="Dashboard" />

            <div className="space-y-6">
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-800 via-purple-700 to-indigo-800 p-6 sm:p-8 text-white shadow-xl shadow-purple-950/10">
                    <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                        <div className="space-y-2">
                            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-md text-purple-100">
                                Sesi Masuk Aktif
                            </span>
                            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                                Selamat Datang, {user.name}!
                            </h2>
                            <p className="text-xs sm:text-sm text-purple-100/90 max-w-xl leading-relaxed">
                                Anda saat ini mengelola sistem dengan hak akses{' '}
                                <strong className="underline underline-offset-4 capitalize">{String(user.role || 'Petugas')}</strong>. Seluruh aktivitas pelayanan dan rekam medis tercatat secara aman.
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <Button
                                variant="secondary"
                                onClick={() => info('Fitur pendaftaran langsung siap digunakan.')}
                                className="bg-white text-purple-800 font-bold hover:bg-purple-50"
                            >
                                + Antrean Baru
                            </Button>
                        </div>
                    </div>

                    <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    <div className="rounded-3xl bg-white p-5 border border-gray-100 shadow-2xs space-y-2">
                        <span className="text-xs font-semibold text-gray-500">Antrean Hari Ini</span>
                        <div className="text-2xl sm:text-3xl font-black text-purple-700">28 Pasien</div>
                        <span className="text-[11px] text-emerald-600 font-bold">● 14 Sudah Selesai</span>
                    </div>

                    <div className="rounded-3xl bg-white p-5 border border-gray-100 shadow-2xs space-y-2">
                        <span className="text-xs font-semibold text-gray-500">Pasien Dalam Pemeriksaan</span>
                        <div className="text-2xl sm:text-3xl font-black text-gray-900">3 Hewan</div>
                        <span className="text-[11px] text-purple-600 font-bold">Poli 1 &amp; Poli 2</span>
                    </div>

                    <div className="rounded-3xl bg-white p-5 border border-gray-100 shadow-2xs space-y-2">
                        <span className="text-xs font-semibold text-gray-500">Stok Vaksin Rabies</span>
                        <div className="text-2xl sm:text-3xl font-black text-emerald-600">84 Dosis</div>
                        <span className="text-[11px] text-gray-400">Kondisi Suhu Chiller: 4°C</span>
                    </div>

                    <div className="rounded-3xl bg-white p-5 border border-gray-100 shadow-2xs space-y-2">
                        <span className="text-xs font-semibold text-gray-500">Inseminasi Buatan (IB)</span>
                        <div className="text-2xl sm:text-3xl font-black text-blue-600">6 Jadwal</div>
                        <span className="text-[11px] text-blue-600 font-bold">Kandang Peternak Wilayah 2</span>
                    </div>
                </div>

                <div className="rounded-3xl bg-white border border-gray-100 shadow-2xs overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                        <div>
                            <h3 className="text-base font-bold text-gray-900">Daftar Antrean Pemeriksaan Terkini</h3>
                            <p className="text-xs text-gray-500">Data live dari unit pendaftaran loket depan</p>
                        </div>
                        <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => success('Data antrean berhasil disegarkan!')}
                        >
                            Segarkan Data
                        </Button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse border border-gray-200">
                            <thead>
                                <tr className="bg-gray-100/90 text-gray-700 font-bold uppercase text-[11px] tracking-wider border-b border-gray-200">
                                    <th className="py-3 px-3.5 border-r border-gray-200 text-center font-bold w-12 shrink-0">No</th>
                                    <th className="py-3 px-3.5 border-r border-gray-200 text-center font-bold">No. Antrean</th>
                                    <th className="py-3 px-3.5 border-r border-gray-200 text-center font-bold">Pasien &amp; Jenis</th>
                                    <th className="py-3 px-3.5 border-r border-gray-200 text-center font-bold">Pemilik Hewan</th>
                                    <th className="py-3 px-3.5 border-r border-gray-200 text-center font-bold">Layanan</th>
                                    <th className="py-3 px-3.5 border-r border-gray-200 text-center font-bold">Dokter Jaga</th>
                                    <th className="py-3 px-3.5 text-center font-bold w-32 shrink-0">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                <tr className="odd:bg-white even:bg-gray-50/70 hover:bg-purple-50/40 transition-colors">
                                    <td className="py-3 px-3.5 border-r border-gray-200 text-center font-medium text-gray-600">1</td>
                                    <td className="py-3 px-3.5 border-r border-gray-200 font-bold text-purple-700 font-mono">A-012</td>
                                    <td className="py-3 px-3.5 border-r border-gray-200 font-semibold text-gray-900 break-words">Milo (Kucing Persia)</td>
                                    <td className="py-3 px-3.5 border-r border-gray-200 text-gray-700 break-words">Bpk. Bambang Sutrisno</td>
                                    <td className="py-3 px-3.5 border-r border-gray-200 text-gray-700 break-words">Pemeriksaan &amp; Pengobatan</td>
                                    <td className="py-3 px-3.5 border-r border-gray-200 font-medium text-purple-700">drh. Ahmad Fauzi</td>
                                    <td className="py-3 px-3.5 text-center">
                                        <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                                            Sedang Diperiksa
                                        </span>
                                    </td>
                                </tr>
                                <tr className="odd:bg-white even:bg-gray-50/70 hover:bg-purple-50/40 transition-colors">
                                    <td className="py-3 px-3.5 border-r border-gray-200 text-center font-medium text-gray-600">2</td>
                                    <td className="py-3 px-3.5 border-r border-gray-200 font-bold text-purple-700 font-mono">A-013</td>
                                    <td className="py-3 px-3.5 border-r border-gray-200 font-semibold text-gray-900 break-words">Bima (Sapi Limousin)</td>
                                    <td className="py-3 px-3.5 border-r border-gray-200 text-gray-700 break-words">H. Sudirman</td>
                                    <td className="py-3 px-3.5 border-r border-gray-200 text-gray-700 break-words">Inseminasi Buatan (IB)</td>
                                    <td className="py-3 px-3.5 border-r border-gray-200 font-medium text-purple-700">drh. Budi Pratama</td>
                                    <td className="py-3 px-3.5 text-center">
                                        <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                            Menunggu Dokter
                                        </span>
                                    </td>
                                </tr>
                                <tr className="odd:bg-white even:bg-gray-50/70 hover:bg-purple-50/40 transition-colors">
                                    <td className="py-3 px-3.5 border-r border-gray-200 text-center font-medium text-gray-600">3</td>
                                    <td className="py-3 px-3.5 border-r border-gray-200 font-bold text-purple-700 font-mono">A-014</td>
                                    <td className="py-3 px-3.5 border-r border-gray-200 font-semibold text-gray-900 break-words">Chiko (Kucing Domestik)</td>
                                    <td className="py-3 px-3.5 border-r border-gray-200 text-gray-700 break-words">Ibu Dewi Safitri</td>
                                    <td className="py-3 px-3.5 border-r border-gray-200 text-gray-700 break-words">Vaksinasi Rabies</td>
                                    <td className="py-3 px-3.5 border-r border-gray-200 font-medium text-purple-700">drh. Siti Nurhaliza</td>
                                    <td className="py-3 px-3.5 text-center">
                                        <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700 border border-gray-200">
                                            Dalam Antrean
                                        </span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
