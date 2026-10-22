import React, { useState, useRef } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Button, Modal, Select } from '@/components/ui';
import { useToast } from '@/components/ui/Toast';

interface AnimalTypeOption {
    id: number;
    nama_jenis: string;
}

interface PageProps {
    animalTypes: AnimalTypeOption[];
    suggestedNoSurat: string;
}

const GENDER_OPTIONS = [
    { value: 'Laki-Laki', label: 'Laki-Laki' },
    { value: 'Perempuan', label: 'Perempuan' },
];

const ANIMAL_GENDER_OPTIONS = [
    { value: 'Jantan', label: 'Jantan' },
    { value: 'Betina', label: 'Betina' },
];

const VAR_OPTIONS = [
    { value: 'Diberikan VAR Dosis 1', label: 'Diberikan VAR Dosis 1 (Penanganan Awal Korban)' },
    { value: 'Sudah Diberikan VAR', label: 'Sudah Diberikan VAR Lengkap (Sesuai Protokol Kemenkes)' },
    { value: 'Belum Diberikan VAR', label: 'Belum Diberikan VAR (Masih Observasi Hewan)' },
];

const ANIMAL_STATUS_OPTIONS = [
    { value: 'Dalam Karantina Observasi 14 Hari', label: 'Dalam Karantina Observasi 14 Hari (Standar SOP)' },
    { value: 'Mati / Terkonfirmasi Positif Rabies', label: 'Mati / Terkonfirmasi Positif Rabies (Uji Lab Lanjutan)' },
    { value: 'Sehat Bebas Gejala Rabies', label: 'Sehat Bebas Gejala Rabies (Lolos Observasi 14 Hari)' },
    { value: 'Liar / Hilang Tidak Terlacak', label: 'Liar / Hilang Tidak Terlacak (Hewan Kabur)' },
];

const AGE_OPTIONS = [
    '< 3 Bulan',
    '3 - 6 Bulan',
    '6 - 12 Bulan',
    '1 Tahun',
    '1.5 Tahun (1 Tahun 6 Bulan)',
    '2 Tahun',
    '2.5 Tahun',
    '3 Tahun',
    '4 Tahun',
    '5 Tahun',
    '6 - 8 Tahun',
    '> 8 Tahun (Senior / Geriatri)',
];

export default function RabiesCaseCreate({ animalTypes, suggestedNoSurat }: PageProps) {
    const { success, error, warning } = useToast();

    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isSubmittingRef = useRef(false);

    const { data, setData, errors } = useForm({
        no_surat: suggestedNoSurat || '',
        lampiran: '1 Berkas Hasil Investigasi',
        perihal: 'Laporan Kasus Gigitan Hewan Penular Rabies (GHPR)',
        id_jenis_hewan: animalTypes[0]?.id ? String(animalTypes[0].id) : '',
        nik_pasien: '',
        nama_pasien: '',
        jenis_kelamin_pasien: 'Laki-Laki',
        umur_pasien: '',
        alamat_pasien: '',
        no_hp_pasien: '',
        lokasi_gigitan: '',
        status_var: 'Diberikan VAR Dosis 1',
        jenis_kelamin_hewan: 'Jantan',
        ras_hewan: 'Lokal / Kampung',
        umur_hewan: '1 Tahun',
        nama_pemilik_hewan: 'Liar / Tidak Bertuan',
        status_hewan: 'Dalam Karantina Observasi 14 Hari',
        tgl_kejadian: new Date().toISOString().split('T')[0],
        alamat_kejadian: '',
        kronologi: '',
    });

    const handlePreSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!data.no_surat.trim()) {
            warning('Nomor surat penyelidikan otomatis belum terisi!');
            return;
        }
        if (!data.nik_pasien.trim() || data.nik_pasien.length !== 16) {
            warning('NIK pasien / korban gigitan harus 16 digit angka!');
            return;
        }
        if (!data.nama_pasien.trim()) {
            warning('Nama lengkap korban gigitan wajib diisi!');
            return;
        }
        if (!data.umur_pasien.trim()) {
            warning('Usia korban gigitan wajib diisi!');
            return;
        }
        if (!data.alamat_pasien.trim()) {
            warning('Alamat domisili korban gigitan wajib diisi!');
            return;
        }
        if (!data.lokasi_gigitan.trim()) {
            warning('Bagian tubuh letak luka gigitan wajib diisi!');
            return;
        }
        if (!data.id_jenis_hewan) {
            warning('Pilih jenis / spesies hewan penggigit!');
            return;
        }
        if (!data.alamat_kejadian.trim()) {
            warning('Lokasi / tempat terjadinya insiden gigitan wajib diisi!');
            return;
        }
        if (!data.kronologi.trim()) {
            warning('Kronologi kejadian gigitan wajib dicatat secara lengkap!');
            return;
        }

        setConfirmModalOpen(true);
    };

    const executeSubmit = () => {
        if (isSubmittingRef.current || isSubmitting) return;
        isSubmittingRef.current = true;
        setIsSubmitting(true);

        router.post('/admin/rabies', data, {
            preserveScroll: true,
            onSuccess: () => {
                setConfirmModalOpen(false);
                success(`Laporan surveilans gigitan rabies atas nama korban ${data.nama_pasien} berhasil disimpan!`);
            },
            onError: (errs) => {
                setConfirmModalOpen(false);
                const firstErr = Object.values(errs)[0];
                error(typeof firstErr === 'string' ? firstErr : 'Gagal menyimpan laporan. Periksa isian form.');
            },
            onFinish: () => {
                isSubmittingRef.current = false;
                setIsSubmitting(false);
            },
        });
    };

    const animalTypeSelectOptions = animalTypes.map((t) => ({
        value: String(t.id),
        label: t.nama_jenis,
    }));

    const ageSelectOptions = AGE_OPTIONS.map((opt) => ({
        value: opt,
        label: opt,
    }));

    return (
        <DashboardLayout title="Catat Kasus Gigitan Rabies">
            <Head title="Catat Kasus Gigitan Rabies" />

            <div className="max-w-[1200px] mx-auto pb-10">
                <form onSubmit={handlePreSubmit}>
                    <div className="rounded-xl border border-gray-200 bg-white p-6 md:p-8 shadow-xs space-y-8">
                        <div className="space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-150 gap-2">
                                <div className="flex items-center gap-2.5">
                                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-600 text-white text-xs font-bold shrink-0">
                                        1
                                    </span>
                                    <div>
                                        <h2 className="text-sm font-bold text-gray-900 tracking-tight">
                                            Surat Penyelidikan &amp; Waktu Kejadian
                                        </h2>
                                        <p className="text-[11px] text-gray-500">
                                            Nomor surat diterbitkan otomatis oleh server dan bersifat permanen.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                                        No. Surat Penyelidikan
                                    </label>
                                    <input
                                        type="text"
                                        value={data.no_surat}
                                        readOnly
                                        disabled
                                        className="w-full h-10 rounded-lg border border-gray-200 bg-gray-100 px-3 text-xs font-mono font-bold text-gray-800 cursor-not-allowed select-none focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                                        Tanggal Kejadian Gigitan <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={data.tgl_kejadian}
                                        onChange={(e) => setData('tgl_kejadian', e.target.value)}
                                        className="w-full h-10 rounded-lg border border-gray-300 bg-white px-3 text-xs text-gray-900 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                                    />
                                    {errors.tgl_kejadian && <p className="text-[11px] text-rose-500 mt-0.5">{errors.tgl_kejadian}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                                        Lampiran Dokumen
                                    </label>
                                    <input
                                        type="text"
                                        value={data.lampiran}
                                        onChange={(e) => setData('lampiran', e.target.value)}
                                        placeholder="1 Berkas Hasil Investigasi"
                                        className="w-full h-10 rounded-lg border border-gray-300 bg-white px-3 text-xs text-gray-900 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-gray-200">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-150 gap-2">
                                <div className="flex items-center gap-2.5">
                                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-600 text-white text-xs font-bold shrink-0">
                                        2
                                    </span>
                                    <div>
                                        <h2 className="text-sm font-bold text-gray-900 tracking-tight">
                                            Identitas Korban Gigitan (Manusia)
                                        </h2>
                                        <p className="text-[11px] text-gray-500">
                                            Data lengkap korban gigitan untuk koordinasi surveilans terpadu dengan Dinas Kesehatan / Puskesmas.
                                        </p>
                                    </div>
                                </div>
                                <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
                                    <span className="text-rose-500 font-bold">*</span> Wajib sesuai KTP korban
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                                        NIK Korban (16 Digit) <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        maxLength={16}
                                        value={data.nik_pasien}
                                        onChange={(e) => setData('nik_pasien', e.target.value.replace(/\D/g, ''))}
                                        placeholder="Ketik 16 digit NIK KTP..."
                                        className="w-full h-10 rounded-lg border border-gray-300 bg-white px-3 text-xs font-mono text-gray-900 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                                    />
                                    <p className="text-[11px] text-gray-400 mt-1">{data.nik_pasien.length}/16 Digit angka.</p>
                                    {errors.nik_pasien && <p className="text-[11px] text-rose-500 mt-0.5">{errors.nik_pasien}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                                        Nama Lengkap Korban <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.nama_pasien}
                                        onChange={(e) => setData('nama_pasien', e.target.value)}
                                        placeholder="Nama lengkap korban"
                                        className="w-full h-10 rounded-lg border border-gray-300 bg-white px-3 text-xs text-gray-900 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                                    />
                                    {errors.nama_pasien && <p className="text-[11px] text-rose-500 mt-0.5">{errors.nama_pasien}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                                            Jenis Kelamin <span className="text-rose-500">*</span>
                                        </label>
                                        <Select
                                            value={data.jenis_kelamin_pasien}
                                            onChange={(val) => setData('jenis_kelamin_pasien', String(val))}
                                            options={GENDER_OPTIONS}
                                            placeholder="Pilih jenis kelamin..."
                                            size="md"
                                            showCheckmark
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                                            Usia Korban <span className="text-rose-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={data.umur_pasien}
                                            onChange={(e) => setData('umur_pasien', e.target.value)}
                                            placeholder="28 Tahun"
                                            className="w-full h-10 rounded-lg border border-gray-300 bg-white px-3 text-xs text-gray-900 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                                        />
                                        {errors.umur_pasien && <p className="text-[11px] text-rose-500 mt-0.5">{errors.umur_pasien}</p>}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                                        No. Handphone / WhatsApp Korban
                                    </label>
                                    <input
                                        type="text"
                                        value={data.no_hp_pasien}
                                        onChange={(e) => setData('no_hp_pasien', e.target.value)}
                                        placeholder="0812xxxxxxxx"
                                        className="w-full h-10 rounded-lg border border-gray-300 bg-white px-3 text-xs font-mono text-gray-900 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                                    />
                                    {errors.no_hp_pasien && <p className="text-[11px] text-rose-500 mt-0.5">{errors.no_hp_pasien}</p>}
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                                        Alamat Lengkap Domisili Korban <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.alamat_pasien}
                                        onChange={(e) => setData('alamat_pasien', e.target.value)}
                                        placeholder="Dusun/Jalan, RT/RW, Desa, Kecamatan domisili korban..."
                                        className="w-full h-10 rounded-lg border border-gray-300 bg-white px-3 text-xs text-gray-900 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                                    />
                                    {errors.alamat_pasien && <p className="text-[11px] text-rose-500 mt-0.5">{errors.alamat_pasien}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                                        Bagian Tubuh Luka Gigitan (Lokasi Gigitan) <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.lokasi_gigitan}
                                        onChange={(e) => setData('lokasi_gigitan', e.target.value)}
                                        placeholder="Contoh: Betis Kanan, Telapak Tangan Kiri, Jari Jempol Kaki..."
                                        className="w-full h-10 rounded-lg border border-gray-300 bg-white px-3 text-xs text-gray-900 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                                    />
                                    <p className="text-[11px] text-gray-400 mt-1">
                                        Gigitan risiko tinggi: wajah, leher, kepala, dan ujung jari tangan/kaki.
                                    </p>
                                    {errors.lokasi_gigitan && <p className="text-[11px] text-rose-500 mt-0.5">{errors.lokasi_gigitan}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                                        Status Vaksinasi Anti Rabies (VAR) Pasien <span className="text-rose-500">*</span>
                                    </label>
                                    <Select
                                        value={data.status_var}
                                        onChange={(val) => setData('status_var', String(val))}
                                        options={VAR_OPTIONS}
                                        placeholder="Pilih status pemberian VAR..."
                                        size="md"
                                        showCheckmark
                                    />
                                    <p className="text-[11px] text-gray-400 mt-1">
                                        Koordinasi dengan Puskesmas/Dinkes setempat.
                                    </p>
                                    {errors.status_var && <p className="text-[11px] text-rose-500 mt-0.5">{errors.status_var}</p>}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-gray-200">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-150 gap-2">
                                <div className="flex items-center gap-2.5">
                                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-600 text-white text-xs font-bold shrink-0">
                                        3
                                    </span>
                                    <div>
                                        <h2 className="text-sm font-bold text-gray-900 tracking-tight">
                                            Data Hewan Penular Rabies (Penggigit)
                                        </h2>
                                        <p className="text-[11px] text-gray-500">
                                            Informasi spesimen hewan penggigit, kepemilikan, dan status karantina observasi 14 hari.
                                        </p>
                                    </div>
                                </div>
                                <span className="inline-flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 font-semibold">
                                    Karantina Observasi 14 Hari
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                                        Jenis / Spesies Hewan Penggigit <span className="text-rose-500">*</span>
                                    </label>
                                    <Select
                                        value={data.id_jenis_hewan}
                                        onChange={(val) => setData('id_jenis_hewan', String(val))}
                                        options={animalTypeSelectOptions}
                                        placeholder="Pilih jenis hewan..."
                                        size="md"
                                        showCheckmark
                                    />
                                    {errors.id_jenis_hewan && <p className="text-[11px] text-rose-500 mt-0.5">{errors.id_jenis_hewan}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                                        Ras / Ciri Corak Fisik Hewan
                                    </label>
                                    <input
                                        type="text"
                                        value={data.ras_hewan}
                                        onChange={(e) => setData('ras_hewan', e.target.value)}
                                        placeholder="Contoh: Lokal / Kampung, Bulu Cokelat..."
                                        className="w-full h-10 rounded-lg border border-gray-300 bg-white px-3 text-xs text-gray-900 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                                        Jenis Kelamin Hewan
                                    </label>
                                    <Select
                                        value={data.jenis_kelamin_hewan}
                                        onChange={(val) => setData('jenis_kelamin_hewan', String(val))}
                                        options={ANIMAL_GENDER_OPTIONS}
                                        placeholder="Pilih jenis kelamin..."
                                        size="md"
                                        showCheckmark
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                                        Perkiraan Umur Hewan Penggigit <span className="text-rose-500">*</span>
                                    </label>
                                    <Select
                                        value={data.umur_hewan}
                                        onChange={(val) => setData('umur_hewan', String(val))}
                                        options={ageSelectOptions}
                                        placeholder="Pilih perkiraan umur hewan..."
                                        size="md"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                                        Nama Pemilik Hewan Penggigit
                                    </label>
                                    <input
                                        type="text"
                                        value={data.nama_pemilik_hewan}
                                        onChange={(e) => setData('nama_pemilik_hewan', e.target.value)}
                                        placeholder="Tulis nama pemilik atau 'Liar / Tidak Bertuan'"
                                        className="w-full h-10 rounded-lg border border-gray-300 bg-white px-3 text-xs text-gray-900 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                                        Status Karantina / Observasi Hewan <span className="text-rose-500">*</span>
                                    </label>
                                    <Select
                                        value={data.status_hewan}
                                        onChange={(val) => setData('status_hewan', String(val))}
                                        options={ANIMAL_STATUS_OPTIONS}
                                        placeholder="Pilih status observasi..."
                                        size="md"
                                        showCheckmark
                                    />
                                    {errors.status_hewan && <p className="text-[11px] text-rose-500 mt-0.5">{errors.status_hewan}</p>}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-gray-200">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-150 gap-2">
                                <div className="flex items-center gap-2.5">
                                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-600 text-white text-xs font-bold shrink-0">
                                        4
                                    </span>
                                    <div>
                                        <h2 className="text-sm font-bold text-gray-900 tracking-tight">
                                            Lokasi Tempat &amp; Kronologi Kejadian Gigitan
                                        </h2>
                                        <p className="text-[11px] text-gray-500">
                                            Detail tempat terjadinya peristiwa gigitan dan kronologi singkat perilaku hewan penggigit.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Alamat Tempat Kejadian Gigitan <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.alamat_kejadian}
                                    onChange={(e) => setData('alamat_kejadian', e.target.value)}
                                    placeholder="Contoh: Jl. Diponegoro No. 12, RT 02/RW 01, Desa Sukamaju, depan pekarangan rumah warga..."
                                    className="w-full h-10 rounded-lg border border-gray-300 bg-white px-3 text-xs text-gray-900 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                                />
                                {errors.alamat_kejadian && <p className="text-[11px] text-rose-500 mt-0.5">{errors.alamat_kejadian}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Kronologi Kejadian Gigitan <span className="text-rose-500">*</span>
                                </label>
                                <textarea
                                    rows={3}
                                    value={data.kronologi}
                                    onChange={(e) => setData('kronologi', e.target.value)}
                                    placeholder="Jelaskan secara runtut kronologi kejadian (misal: korban sedang berjalan melintasi gang, tiba-tiba seekor anjing liar berlari dari semak dan langsung menggigit bagian betis kanan korban tanpa provokasi)..."
                                    className="w-full rounded-lg border border-gray-300 bg-white p-3 text-xs text-gray-900 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                                />
                                {errors.kronologi && <p className="text-[11px] text-rose-500 mt-0.5">{errors.kronologi}</p>}
                            </div>
                        </div>

                        <div className="pt-6 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                <span className="text-rose-500 font-bold">*</span>
                                <span>Wajib diisi lengkap untuk pelaporan resmi surveilans GHPR.</span>
                            </div>

                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                <Link
                                    href="/admin/rabies"
                                    className="w-full sm:w-auto text-center px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                                >
                                    Batal
                                </Link>

                                <Button
                                    type="submit"
                                    variant="primary"
                                    size="md"
                                    className="w-full sm:w-auto px-6 h-10 text-xs font-semibold bg-rose-600 hover:bg-rose-700 active:bg-rose-800 shadow-xs"
                                    leftIcon={
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                                        </svg>
                                    }
                                >
                                    Simpan Laporan Kasus GHPR
                                </Button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>

            <Modal
                isOpen={confirmModalOpen}
                onClose={() => setConfirmModalOpen(false)}
                title="Konfirmasi Laporan Kasus Gigitan Rabies"
                size="md"
            >
                <div className="space-y-4">
                    <p className="text-xs text-gray-600 leading-relaxed">
                        Pastikan seluruh rincian korban, bagian luka gigitan, status VAR, serta data hewan penggigit telah akurat untuk arsip resmi penyelidikan epidemiologi.
                    </p>

                    <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 space-y-2 text-xs">
                        <div className="flex justify-between py-1 border-b border-gray-150">
                            <span className="text-gray-500">No. Surat:</span>
                            <span className="font-mono font-bold text-gray-900">{data.no_surat}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-gray-150">
                            <span className="text-gray-500">Nama Korban:</span>
                            <span className="font-bold text-gray-900">
                                {data.nama_pasien} ({data.umur_pasien})
                            </span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-gray-150">
                            <span className="text-gray-500">Luka Gigitan:</span>
                            <span className="font-bold text-rose-700">{data.lokasi_gigitan}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-gray-150">
                            <span className="text-gray-500">Status VAR:</span>
                            <span className="font-semibold text-emerald-700">{data.status_var}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-gray-150">
                            <span className="text-gray-500">Hewan Penggigit:</span>
                            <span className="font-semibold text-gray-900">
                                {animalTypes.find((t) => String(t.id) === String(data.id_jenis_hewan))?.nama_jenis || '-'} &bull; {data.status_hewan}
                            </span>
                        </div>
                        <div className="py-1">
                            <span className="text-gray-500 block mb-0.5">Lokasi Insiden:</span>
                            <span className="text-gray-800 italic block">{data.alamat_kejadian}</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2">
                        <Button
                            type="button"
                            variant="secondary"
                            size="md"
                            onClick={() => setConfirmModalOpen(false)}
                            disabled={isSubmitting}
                        >
                            Periksa Kembali
                        </Button>
                        <Button
                            type="button"
                            variant="primary"
                            size="md"
                            className="bg-rose-600 hover:bg-rose-700"
                            onClick={executeSubmit}
                            isLoading={isSubmitting}
                            disabled={isSubmitting}
                        >
                            Ya, Simpan Laporan
                        </Button>
                    </div>
                </div>
            </Modal>
        </DashboardLayout>
    );
}
