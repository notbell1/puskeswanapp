import React, { useState, useRef, useEffect } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Button, Modal, Select } from '@/components/ui';
import { useToast } from '@/components/ui/Toast';

interface AnimalTypeOption {
    id: number;
    nama_jenis: string;
}

interface ExistingAnimal {
    id: number;
    no_rm: string;
    nama_hewan: string;
    id_jenis_hewan: number;
    nama_jenis: string;
    jenis_kelamin: string;
    umur: string;
    warna_hewan: string;
    last_visit?: string;
    last_anamnesa?: string;
    last_bb?: number | string;
    last_suhu?: number | string;
}

interface PageProps {
    animalTypes: AnimalTypeOption[];
    nextNoRm: string;
    initialNik?: string;
}

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

const GENDER_OPTIONS = [
    { value: 'Laki-Laki', label: 'Laki-Laki' },
    { value: 'Perempuan', label: 'Perempuan' },
];

const ANIMAL_GENDER_OPTIONS = [
    { value: 'Jantan', label: 'Jantan' },
    { value: 'Betina', label: 'Betina' },
];

export default function RekamMedisCreate({ animalTypes, nextNoRm, initialNik = '' }: PageProps) {
    const { success, error, warning } = useToast();

    const [isSearchingNik, setIsSearchingNik] = useState(false);
    const [nikSearchStatus, setNikSearchStatus] = useState<'idle' | 'found' | 'new'>('idle');
    const [existingAnimals, setExistingAnimals] = useState<ExistingAnimal[]>([]);
    const [matchedAnimal, setMatchedAnimal] = useState<ExistingAnimal | null>(null);

    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isSubmittingRef = useRef(false);

    const { data, setData, errors, reset } = useForm({
        nik: initialNik,
        nama_lengkap: '',
        jenis_kelamin_pemilik: 'Laki-Laki',
        no_hp_wa: '',
        alamat_lengkap: '',

        id_hewan: '' as number | string,
        nama_hewan: '',
        id_jenis_hewan: animalTypes[0]?.id ? String(animalTypes[0].id) : '',
        jenis_kelamin_hewan: 'Jantan' as 'Jantan' | 'Betina',
        umur: '1 Tahun',
        warna_hewan: '',

        berat_badan: '' as number | string,
        suhu_tubuh: '' as number | string,
        anamnesa: '',
    });

    useEffect(() => {
        const cleanNik = data.nik.trim();
        if (cleanNik.length === 16) {
            triggerInstantNikSearch(cleanNik);
        } else if (cleanNik.length < 16 && nikSearchStatus !== 'idle') {
            setNikSearchStatus('idle');
            setExistingAnimals([]);
            setMatchedAnimal(null);
        }
    }, [data.nik]);

    const triggerInstantNikSearch = async (nikToSearch: string) => {
        setIsSearchingNik(true);
        try {
            const res = await fetch(`/admin/rekam-medis/search-owner?nik=${encodeURIComponent(nikToSearch)}`);
            const json = await res.json();

            if (json.found && json.owner) {
                setData((prev) => ({
                    ...prev,
                    nama_lengkap: json.owner.nama_lengkap,
                    jenis_kelamin_pemilik: json.owner.jenis_kelamin || 'Laki-Laki',
                    no_hp_wa: json.owner.no_hp_wa,
                    alamat_lengkap: json.owner.alamat_lengkap,
                }));
                const animals: ExistingAnimal[] = json.animals || [];
                setExistingAnimals(animals);
                setNikSearchStatus('found');

                if (animals.length > 0) {
                    success(`Pemilik terdaftar ditemukan: ${json.owner.nama_lengkap} (${animals.length} pasien hewan tercatat). Data pemilik berhasil di-autofill.`);
                } else {
                    success(`Pemilik terdaftar ditemukan: ${json.owner.nama_lengkap}. Data berhasil di-autofill.`);
                }
            } else {
                setNikSearchStatus('new');
                setExistingAnimals([]);
                setMatchedAnimal(null);
                setData((prev) => ({
                    ...prev,
                    id_hewan: '',
                }));
            }
        } catch {
            error('Gagal menghubungi server untuk pencarian NIK.');
        } finally {
            setIsSearchingNik(false);
        }
    };

    const handleSelectExistingAnimal = (animal: ExistingAnimal) => {
        setMatchedAnimal(animal);
        setData((prev) => ({
            ...prev,
            id_hewan: animal.id,
            nama_hewan: animal.nama_hewan,
            id_jenis_hewan: String(animal.id_jenis_hewan),
            jenis_kelamin_hewan: (animal.jenis_kelamin as 'Jantan' | 'Betina') || 'Jantan',
            warna_hewan: animal.warna_hewan,
            umur: animal.umur && AGE_OPTIONS.includes(animal.umur) ? animal.umur : prev.umur,
        }));
    };

    const handleAnimalNameChange = (typedName: string) => {
        setData('nama_hewan', typedName);

        const matched = existingAnimals.find(
            (a) => a.nama_hewan.trim().toLowerCase() === typedName.trim().toLowerCase()
        );

        if (matched) {
            setMatchedAnimal(matched);
            setData((prev) => ({
                ...prev,
                nama_hewan: typedName,
                id_hewan: matched.id,
                id_jenis_hewan: String(matched.id_jenis_hewan),
                jenis_kelamin_hewan: (matched.jenis_kelamin as 'Jantan' | 'Betina') || 'Jantan',
                warna_hewan: matched.warna_hewan,
                umur: matched.umur && AGE_OPTIONS.includes(matched.umur) ? matched.umur : prev.umur,
            }));
        } else if (matchedAnimal) {
            setMatchedAnimal(null);
            setData((prev) => ({
                ...prev,
                nama_hewan: typedName,
                id_hewan: '',
            }));
        }
    };

    const handleResetToNewAnimal = () => {
        setMatchedAnimal(null);
        setData((prev) => ({
            ...prev,
            id_hewan: '',
            nama_hewan: '',
            warna_hewan: '',
        }));
    };

    const handlePreSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!data.nik.trim() || data.nik.length !== 16) {
            warning('NIK pemilik harus terdiri dari 16 digit angka!');
            return;
        }
        if (!data.nama_lengkap.trim()) {
            warning('Nama lengkap pemilik wajib diisi!');
            return;
        }
        if (!data.no_hp_wa.trim()) {
            warning('Nomor WhatsApp pemilik wajib diisi untuk notifikasi antrean loket!');
            return;
        }
        if (!data.alamat_lengkap.trim()) {
            warning('Alamat domisili pemilik wajib diisi!');
            return;
        }

        if (!data.nama_hewan.trim()) {
            warning('Nama pasien hewan wajib diisi!');
            return;
        }
        if (!data.id_jenis_hewan) {
            warning('Pilih jenis / spesies hewan!');
            return;
        }
        if (!data.warna_hewan.trim()) {
            warning('Warna / corak fisik hewan wajib diisi!');
            return;
        }
        if (!data.umur) {
            warning('Pilih perkiraan umur hewan dari dropdown!');
            return;
        }

        if (!data.berat_badan || Number(data.berat_badan) <= 0) {
            warning('Berat badan hewan wajib diisi hasil timbang fisik!');
            return;
        }
        if (!data.suhu_tubuh || Number(data.suhu_tubuh) < 30 || Number(data.suhu_tubuh) > 45) {
            warning('Suhu tubuh hewan wajib dalam rentang wajar (30 - 45 °C)!');
            return;
        }
        if (!data.anamnesa.trim()) {
            warning('Keluhan utama / anamnesa awal pasien wajib dicatat!');
            return;
        }

        setConfirmModalOpen(true);
    };

    const executeSubmit = () => {
        if (isSubmittingRef.current || isSubmitting) return;
        isSubmittingRef.current = true;
        setIsSubmitting(true);

        router.post('/admin/rekam-medis', data, {
            preserveScroll: true,
            onSuccess: () => {
                setConfirmModalOpen(false);
                success('Pendaftaran rekam medis berhasil! Tiket antrean baru telah diterbitkan.');
            },
            onError: (errs) => {
                setConfirmModalOpen(false);
                const firstErr = Object.values(errs)[0];
                error(typeof firstErr === 'string' ? firstErr : 'Gagal memproses pendaftaran. Periksa isian form.');
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
        <DashboardLayout title="Pendaftaran Rekam Medis">
            <Head title="Pendaftaran Rekam Medis" />

            <div className="max-w-[1200px] mx-auto pb-10">
                <form onSubmit={handlePreSubmit}>
                    <div className="rounded-xl border border-gray-200 bg-white p-6 md:p-8 shadow-xs space-y-8">
                        <div className="space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-150 gap-2">
                                <div className="flex items-center gap-2.5">
                                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-700 text-white text-xs font-bold shrink-0">
                                        1
                                    </span>
                                    <div>
                                        <h2 className="text-sm font-bold text-gray-900 tracking-tight">
                                            Identitas Pemilik Hewan
                                        </h2>
                                        <p className="text-[11px] text-gray-500">
                                            Ketik 16 Digit NIK KTP. Server langsung mencari otomatis dan meng-autofill identitas pemilik yang pernah terdaftar.
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    {isSearchingNik && (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                                            <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                            </svg>
                                            Mencari di Server...
                                        </span>
                                    )}
                                    {!isSearchingNik && nikSearchStatus === 'found' && (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                            Pemilik Terdaftar (Autofill Aktif)
                                        </span>
                                    )}
                                    {!isSearchingNik && nikSearchStatus === 'new' && (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                            NIK Baru (Tersimpan Otomatis)
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                                        Nomor Induk Kependudukan (NIK) <span className="text-rose-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            maxLength={16}
                                            value={data.nik}
                                            onChange={(e) => setData('nik', e.target.value.replace(/\D/g, ''))}
                                            placeholder="Ketik 16 digit NIK..."
                                            className={`w-full h-10 rounded-lg border bg-white px-3 text-xs font-mono font-semibold transition-all focus:outline-none focus:ring-1 ${
                                                nikSearchStatus === 'found'
                                                    ? 'border-emerald-400 bg-emerald-50/20 text-emerald-950 focus:border-emerald-500 focus:ring-emerald-500'
                                                    : 'border-gray-300 text-gray-900 focus:border-purple-500 focus:ring-purple-500'
                                            }`}
                                        />
                                        {data.nik.length === 16 && (
                                            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-emerald-600">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                                                </svg>
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-[11px] text-gray-400 mt-1">
                                        {data.nik.length}/16 Digit angka KTP.
                                    </p>
                                    {errors.nik && <p className="text-[11px] text-rose-500 mt-0.5">{errors.nik}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                                        Nama Lengkap Pemilik <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.nama_lengkap}
                                        onChange={(e) => setData('nama_lengkap', e.target.value)}
                                        placeholder="Nama lengkap sesuai KTP"
                                        className="w-full h-10 rounded-lg border border-gray-300 bg-white px-3 text-xs text-gray-900 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                                    />
                                    {errors.nama_lengkap && <p className="text-[11px] text-rose-500 mt-0.5">{errors.nama_lengkap}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                                        Jenis Kelamin Pemilik <span className="text-rose-500">*</span>
                                    </label>
                                    <Select
                                        value={data.jenis_kelamin_pemilik}
                                        onChange={(val) => setData('jenis_kelamin_pemilik', String(val))}
                                        options={GENDER_OPTIONS}
                                        placeholder="Pilih jenis kelamin..."
                                        size="md"
                                        showCheckmark
                                    />
                                    {errors.jenis_kelamin_pemilik && <p className="text-[11px] text-rose-500 mt-0.5">{errors.jenis_kelamin_pemilik}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                                        No. WhatsApp / HP Aktif <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.no_hp_wa}
                                        onChange={(e) => setData('no_hp_wa', e.target.value)}
                                        placeholder="0812xxxxxxxx"
                                        className="w-full h-10 rounded-lg border border-gray-300 bg-white px-3 text-xs font-mono text-gray-900 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                                    />
                                    <p className="text-[11px] text-gray-400 mt-1">
                                        Digunakan untuk info tiket &amp; antrean loket.
                                    </p>
                                    {errors.no_hp_wa && <p className="text-[11px] text-rose-500 mt-0.5">{errors.no_hp_wa}</p>}
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                                        Alamat Lengkap Domisili <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.alamat_lengkap}
                                        onChange={(e) => setData('alamat_lengkap', e.target.value)}
                                        placeholder="Nama dusun/jalan, RT/RW, Desa, Kecamatan..."
                                        className="w-full h-10 rounded-lg border border-gray-300 bg-white px-3 text-xs text-gray-900 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                                    />
                                    {errors.alamat_lengkap && <p className="text-[11px] text-rose-500 mt-0.5">{errors.alamat_lengkap}</p>}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-gray-200">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-150 gap-2">
                                <div className="flex items-center gap-2.5">
                                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-700 text-white text-xs font-bold shrink-0">
                                        2
                                    </span>
                                    <div>
                                        <h2 className="text-sm font-bold text-gray-900 tracking-tight">
                                            Data Pasien Hewan
                                        </h2>
                                        <p className="text-[11px] text-gray-500">
                                            Prinsip dasar: <span className="font-semibold text-purple-700">1 Hewan = 1 No. RM Permanen</span>. Jika hewan pernah berkunjung, nomor RM tetap sama.
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    {matchedAnimal ? (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
                                            No. RM Permanen: <span className="font-mono">{matchedAnimal.no_rm}</span>
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                            No. RM Baru: <span className="font-mono">{nextNoRm}</span>
                                        </span>
                                    )}
                                </div>
                            </div>

                            {existingAnimals.length > 0 && (
                                <div className="p-3.5 rounded-xl bg-purple-50/50 border border-purple-200/80 space-y-2.5">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                                            <span>🐾</span>
                                            Ditemukan {existingAnimals.length} hewan terdaftar atas NIK pemilik ini:
                                        </span>
                                        {matchedAnimal && (
                                            <button
                                                type="button"
                                                onClick={handleResetToNewAnimal}
                                                className="text-xs font-semibold text-purple-700 hover:text-purple-900 hover:underline"
                                            >
                                                + Daftarkan Hewan Lain (Baru)
                                            </button>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                                        {existingAnimals.map((animal) => {
                                            const isSelected = matchedAnimal?.id === animal.id;
                                            return (
                                                <div
                                                    key={animal.id}
                                                    onClick={() => handleSelectExistingAnimal(animal)}
                                                    className={`cursor-pointer p-3 rounded-lg border text-left transition-all ${
                                                        isSelected
                                                            ? 'border-purple-600 bg-white ring-2 ring-purple-600/20 shadow-xs'
                                                            : 'border-purple-200 bg-white/80 hover:bg-white hover:border-purple-300'
                                                    }`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-mono font-bold text-xs text-purple-700">
                                                            {animal.no_rm}
                                                        </span>
                                                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-purple-100 text-purple-800">
                                                            {animal.nama_jenis}
                                                        </span>
                                                    </div>
                                                    <p className="font-bold text-xs text-gray-900 mt-1">
                                                        {animal.nama_hewan}
                                                    </p>
                                                    <p className="text-[11px] text-gray-500 mt-0.5">
                                                        {animal.jenis_kelamin} &bull; {animal.warna_hewan}
                                                    </p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                                        Nama Pasien Hewan <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.nama_hewan}
                                        onChange={(e) => handleAnimalNameChange(e.target.value)}
                                        placeholder="Contoh: Milo, Snowy, Blacky..."
                                        className="w-full h-10 rounded-lg border border-gray-300 bg-white px-3 text-xs text-gray-900 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                                    />
                                    <p className="text-[11px] text-gray-400 mt-1">
                                        {matchedAnimal ? 'Pasien terdaftar dipilih.' : 'Ketik nama untuk deteksi otomatis hewan lama.'}
                                    </p>
                                    {errors.nama_hewan && <p className="text-[11px] text-rose-500 mt-0.5">{errors.nama_hewan}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                                        Spesies / Jenis Hewan <span className="text-rose-500">*</span>
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
                                        Jenis Kelamin Hewan <span className="text-rose-500">*</span>
                                    </label>
                                    <Select
                                        value={data.jenis_kelamin_hewan}
                                        onChange={(val) => setData('jenis_kelamin_hewan', val as 'Jantan' | 'Betina')}
                                        options={ANIMAL_GENDER_OPTIONS}
                                        placeholder="Pilih jenis kelamin hewan..."
                                        size="md"
                                        showCheckmark
                                    />
                                    {errors.jenis_kelamin_hewan && <p className="text-[11px] text-rose-500 mt-0.5">{errors.jenis_kelamin_hewan}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                                        Perkiraan Umur Hewan <span className="text-rose-500">*</span>
                                    </label>
                                    <Select
                                        value={data.umur}
                                        onChange={(val) => setData('umur', String(val))}
                                        options={ageSelectOptions}
                                        placeholder="Pilih perkiraan umur hewan..."
                                        size="md"
                                        showCheckmark
                                    />
                                    <p className="text-[11px] text-gray-400 mt-1">
                                        Dapat diperbarui setiap kunjungan.
                                    </p>
                                    {errors.umur && <p className="text-[11px] text-rose-500 mt-0.5">{errors.umur}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                                        Warna / Ciri Khusus Fisik <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.warna_hewan}
                                        onChange={(e) => setData('warna_hewan', e.target.value)}
                                        placeholder="Contoh: Oranye belang putih, Belang tiga, Hitam mulus..."
                                        className="w-full h-10 rounded-lg border border-gray-300 bg-white px-3 text-xs text-gray-900 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                                    />
                                    {errors.warna_hewan && <p className="text-[11px] text-rose-500 mt-0.5">{errors.warna_hewan}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                                        Nomor Rekam Medis Pasien (No. RM)
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={matchedAnimal ? matchedAnimal.no_rm : `${nextNoRm} (Otomatis)`}
                                            disabled
                                            readOnly
                                            className="w-full h-10 rounded-lg border border-gray-200 bg-gray-100 pr-24 pl-3 text-xs font-mono font-bold text-gray-700 cursor-not-allowed select-none focus:outline-none"
                                        />
                                        <span className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-700">
                                            {matchedAnimal ? 'Permanen' : 'Auto Generate'}
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-gray-400 mt-1">
                                        Identitas unik pasien seumur hidup di Puskeswan.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-gray-200">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-150 gap-2">
                                <div className="flex items-center gap-2.5">
                                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-700 text-white text-xs font-bold shrink-0">
                                        3
                                    </span>
                                    <div>
                                        <h2 className="text-sm font-bold text-gray-900 tracking-tight">
                                            Parameter Pengukuran Klinis Awal &amp; Keluhan (Anamnesa)
                                        </h2>
                                        <p className="text-[11px] text-gray-500">
                                            Skrining triage awal sebelum pasien diarahkan menuju ruang pemeriksaan dokter.
                                        </p>
                                    </div>
                                </div>
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
                                    Triage Loket Front Office
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                                        Berat Badan Pasien (kg) <span className="text-rose-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={data.berat_badan}
                                            onChange={(e) => setData('berat_badan', e.target.value)}
                                            placeholder="Contoh: 3.85"
                                            className="w-full h-10 rounded-lg border border-gray-300 bg-white pr-10 pl-3 text-xs font-mono text-gray-900 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400">
                                            kg
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-gray-400 mt-1">
                                        Hasil penimbangan fisik pasien di meja timbang loket.
                                    </p>
                                    {errors.berat_badan && <p className="text-[11px] text-rose-500 mt-0.5">{errors.berat_badan}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                                        Suhu Tubuh Pasien (°C) <span className="text-rose-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={data.suhu_tubuh}
                                            onChange={(e) => setData('suhu_tubuh', e.target.value)}
                                            placeholder="Contoh: 38.6"
                                            className="w-full h-10 rounded-lg border border-gray-300 bg-white pr-10 pl-3 text-xs font-mono text-gray-900 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400">
                                            °C
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-gray-400 mt-1">
                                        Rentang normal suhu hewan: 37.5 - 39.5 °C.
                                    </p>
                                    {errors.suhu_tubuh && <p className="text-[11px] text-rose-500 mt-0.5">{errors.suhu_tubuh}</p>}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Keluhan Utama Pasien / Anamnesa Awal <span className="text-rose-500">*</span>
                                </label>
                                <textarea
                                    rows={3}
                                    value={data.anamnesa}
                                    onChange={(e) => setData('anamnesa', e.target.value)}
                                    placeholder="Tuliskan keluhan yang disampaikan pemilik (misal: nafsu makan menurun sejak 2 hari lalu, lemas, muntah kuning, batuk kering, atau jadwal vaksinasi berkala)..."
                                    className="w-full rounded-lg border border-gray-300 bg-white p-3 text-xs text-gray-900 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                                />
                                {errors.anamnesa && <p className="text-[11px] text-rose-500 mt-0.5">{errors.anamnesa}</p>}
                            </div>
                        </div>

                        <div className="pt-6 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                <span className="text-rose-500 font-bold">*</span>
                                <span>Wajib diisi lengkap sebelum menerbitkan nomor antrean.</span>
                            </div>

                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                <Link
                                    href="/admin/rekam-medis/antrian"
                                    className="w-full sm:w-auto text-center px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                                >
                                    Batal
                                </Link>

                                <Button
                                    type="submit"
                                    variant="primary"
                                    size="md"
                                    className="w-full sm:w-auto px-6 h-10 text-xs font-semibold shadow-xs"
                                    leftIcon={
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                                        </svg>
                                    }
                                >
                                    Simpan &amp; Terbitkan Tiket Antrean
                                </Button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>

            <Modal
                isOpen={confirmModalOpen}
                onClose={() => setConfirmModalOpen(false)}
                title="Konfirmasi Pendaftaran Rekam Medis"
                size="md"
            >
                <div className="space-y-4">
                    <p className="text-xs text-gray-600 leading-relaxed">
                        Mohon pastikan seluruh data identitas pemilik dan kondisi fisik pasien hewan telah benar sebelum nomor antrean diterbitkan.
                    </p>

                    <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 space-y-2 text-xs">
                        <div className="flex justify-between py-1 border-b border-gray-150">
                            <span className="text-gray-500">NIK Pemilik:</span>
                            <span className="font-mono font-bold text-gray-900">{data.nik}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-gray-150">
                            <span className="text-gray-500">Nama Pemilik:</span>
                            <span className="font-bold text-gray-900">{data.nama_lengkap}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-gray-150">
                            <span className="text-gray-500">Pasien Hewan:</span>
                            <span className="font-bold text-purple-700">
                                {data.nama_hewan} ({animalTypes.find((t) => String(t.id) === String(data.id_jenis_hewan))?.nama_jenis || '-'})
                            </span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-gray-150">
                            <span className="text-gray-500">No. Rekam Medis:</span>
                            <span className="font-mono font-bold text-purple-800">
                                {matchedAnimal ? matchedAnimal.no_rm : `${nextNoRm} (Baru)`}
                            </span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-gray-150">
                            <span className="text-gray-500">BB &amp; Suhu:</span>
                            <span className="font-semibold text-gray-900">
                                {data.berat_badan} kg &bull; {data.suhu_tubuh} °C
                            </span>
                        </div>
                        <div className="py-1">
                            <span className="text-gray-500 block mb-0.5">Keluhan Awal:</span>
                            <span className="text-gray-800 italic block">"{data.anamnesa}"</span>
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
                            onClick={executeSubmit}
                            isLoading={isSubmitting}
                            disabled={isSubmitting}
                        >
                            Ya, Simpan &amp; Terbitkan Tiket
                        </Button>
                    </div>
                </div>
            </Modal>
        </DashboardLayout>
    );
}
