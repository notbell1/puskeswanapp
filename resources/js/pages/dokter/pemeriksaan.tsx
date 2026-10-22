import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Button, Modal, Select, useToast } from '@/components/ui';

interface HistoricalRecord {
    id: number;
    tgl_kunjungan: string;
    berat_badan: number;
    suhu_tubuh: number;
    anamnesa: string;
    diagnosa: string;
    terapi_pengobatan: string;
    catatan: string;
    dokter: string;
    dokter_foto?: string | null;
}

interface MedicineItem {
    id: number;
    kode_obat: string;
    nama_obat: string;
    stok: number;
    satuan: string;
}

interface VisitDetail {
    id: number;
    id_hewan: number;
    no_rm: string;
    nama_hewan: string;
    jenis_hewan: string;
    jenis_kelamin: string;
    umur: string;
    warna_hewan: string;
    pemilik: string;
    nik_pemilik: string;
    no_hp: string;
    alamat_pemilik: string;
    tgl_kunjungan: string;
    berat_badan: number;
    suhu_tubuh: number;
    anamnesa: string;
    status_antrean: string;
    admin_petugas: string;
    existing_examination?: {
        diagnosa: string;
        terapi_pengobatan: string;
        catatan?: string;
        waktu_selesai?: string;
    } | null;
}

interface PemeriksaanProps {
    visit: VisitDetail;
    historicalRecords: HistoricalRecord[];
    medicines: MedicineItem[];
}

const formatDoctorName = (name?: string | null): string => {
    if (!name) return '-';
    const trimmed = name.trim();
    if (/^drh\.?\s+/i.test(trimmed)) {
        return trimmed;
    }
    return `drh. ${trimmed}`;
};

export default function DokterPemeriksaanPage({
    visit,
    historicalRecords = [],
    medicines = [],
}: PemeriksaanProps) {
    const { success, error, warning } = useToast();

    const [selectedMedId, setSelectedMedId] = useState<string>('');
    const [medDosis, setMedDosis] = useState<string>('1x1 hari');
    const [medJumlah, setMedJumlah] = useState<string>('1');

    const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);

    const { data, setData, post, processing, errors } = useForm({
        diagnosa: visit.existing_examination?.diagnosa || '',
        terapi_pengobatan: visit.existing_examination?.terapi_pengobatan || '',
        catatan: visit.existing_examination?.catatan || '',
    });

    const medicineOptions = [
        { value: '', label: '-- Pilih Obat Apotek Puskeswan --' },
        ...medicines.map((m) => {
            const isOutOfStock = (m.stok ?? 0) <= 0;
            return {
                value: String(m.id),
                label: isOutOfStock ? `${m.nama_obat} (Stok Habis)` : m.nama_obat,
                disabled: isOutOfStock,
                className: isOutOfStock
                    ? 'text-rose-600 bg-rose-50/70 hover:bg-rose-50/70 cursor-not-allowed font-semibold'
                    : '',
                labelClassName: isOutOfStock ? 'text-rose-600 font-semibold' : '',
            };
        }),
    ];

    const handleAppendMedicine = () => {
        if (!selectedMedId) {
            warning('Pilih Obat', 'Silakan pilih obat dari daftar terlebih dahulu.');
            return;
        }

        const med = medicines.find((m) => String(m.id) === selectedMedId);
        if (!med) return;

        const snippet = `${med.nama_obat} (${medJumlah} ${med.satuan}, dosis: ${medDosis})`;
        const currentTerapi = data.terapi_pengobatan.trim();
        const updated = currentTerapi ? `${currentTerapi}\n• ${snippet}` : `• ${snippet}`;

        setData('terapi_pengobatan', updated);
        success('Resep Ditambahkan', `${med.nama_obat} ditambahkan ke kolom terapi pengobatan.`);

        setSelectedMedId('');
        setMedJumlah('1');
        setMedDosis('2x1 sehari');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!data.diagnosa.trim()) {
            error('Validasi Gagal', 'Kolom diagnosa klinis wajib diisi.');
            return;
        }

        if (!data.terapi_pengobatan.trim()) {
            error('Validasi Gagal', 'Kolom terapi pengobatan & tindakan wajib diisi.');
            return;
        }

        post(`/dokter/pemeriksaan/${visit.id}`, {
            preserveScroll: true,
            onError: () => {
                error('Gagal Menyimpan', 'Periksa kembali kelengkapan form pemeriksaan.');
            },
        });
    };

    return (
        <DashboardLayout title={`Pemeriksaan: ${visit.nama_hewan} (${visit.no_rm})`}>
            <Head title={`Pemeriksaan ${visit.nama_hewan}`} />

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8 max-w-5xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200 mb-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold mb-1 border border-emerald-200">
                            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                            Formulir Tindakan Medis Veteriner
                        </div>
                        <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                            Pemeriksaan Fisik & Diagnosa Pasien
                        </h2>
                        <p className="text-xs text-gray-500 mt-0.5">
                            Input hasil pemeriksaan klinis, diagnosa, terapi pengobatan, dan resep obat pasien.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        {historicalRecords.length > 0 && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowHistoryModal(true)}
                                className="text-xs text-purple-700 border-purple-200 hover:bg-purple-50"
                            >
                                📜 Riwayat Medis Lalu ({historicalRecords.length})
                            </Button>
                        )}
                        <Link
                            href="/dokter/antrian"
                            className="px-3.5 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                        >
                            ← Kembali ke Antrean
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-5 rounded-2xl bg-gray-50/80 border border-gray-200 mb-8">
                    <div className="md:col-span-7 space-y-2 text-xs">
                        <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 bg-emerald-700 text-white font-mono font-bold rounded-lg text-xs">
                                {visit.no_rm}
                            </span>
                            <h3 className="text-base font-extrabold text-gray-900">
                                {visit.nama_hewan}
                            </h3>
                            <span className="text-gray-500">
                                ({visit.jenis_hewan} • {visit.jenis_kelamin})
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-gray-600 pt-1">
                            <p><strong>Umur:</strong> {visit.umur}</p>
                            <p><strong>Warna:</strong> {visit.warna_hewan}</p>
                            <p><strong>Pemilik:</strong> {visit.pemilik}</p>
                            <p><strong>No. HP/WA:</strong> <span className="font-mono">{visit.no_hp}</span></p>
                            <p className="col-span-2 truncate"><strong>Alamat:</strong> {visit.alamat_pemilik}</p>
                        </div>
                    </div>

                    <div className="md:col-span-5 flex flex-col justify-between border-t md:border-t-0 md:border-l border-gray-200 pt-4 md:pt-0 md:pl-6 text-xs">
                        <div>
                            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-2">
                                Tanda Vital & Keluhan Awal
                            </span>
                            <div className="flex items-center gap-3 mb-3">
                                <div className="px-3 py-1.5 bg-white border border-gray-200 rounded-xl font-bold text-gray-800 flex items-center gap-1.5">
                                    <span>⚖️</span>
                                    <span>{visit.berat_badan} kg</span>
                                </div>
                                <div className="px-3 py-1.5 bg-white border border-gray-200 rounded-xl font-bold text-gray-800 flex items-center gap-1.5">
                                    <span>🌡️</span>
                                    <span>{visit.suhu_tubuh} °C</span>
                                </div>
                            </div>

                            <div className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 text-xs italic">
                                &quot;{visit.anamnesa}&quot;
                            </div>
                        </div>

                        <p className="text-[10px] text-gray-400 mt-2">
                            Pendaftaran: {visit.tgl_kunjungan} • Petugas: {visit.admin_petugas}
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label className="block text-xs sm:text-sm font-bold text-gray-900">
                                Diagnosa Klinis Dokter <span className="text-red-500">*</span>
                            </label>
                            <span className="text-xs text-gray-400">Temuan penyakit / evaluasi fisik hewan</span>
                        </div>
                        <textarea
                            rows={3}
                            value={data.diagnosa}
                            onChange={(e) => setData('diagnosa', e.target.value)}
                            placeholder="Contoh: Gastritis Ringan, Otitis Externa pada telinga kanan, Dehidrasi Sedang..."
                            className={`w-full p-3.5 text-xs sm:text-sm bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 transition-all ${
                                errors.diagnosa ? 'border-red-500' : 'border-gray-300'
                            }`}
                        />
                        {errors.diagnosa && <p className="text-xs text-red-500 mt-1">{errors.diagnosa}</p>}
                    </div>

                    <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-base">💊</span>
                                <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                                    Bantuan Resep Obat (Integrasi Master Obat Puskeswan)
                                </h4>
                            </div>
                            <span className="text-[11px] text-emerald-700">Pilih obat untuk ditambahkan otomatis ke kolom terapi</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                            <div className="sm:col-span-6">
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Pilih Obat Tersedia</label>
                                <Select
                                    value={selectedMedId}
                                    onChange={(val) => setSelectedMedId(val)}
                                    options={medicineOptions}
                                    placeholder="Cari obat..."
                                />
                            </div>

                            <div className="sm:col-span-2">
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Jumlah</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={medJumlah}
                                    onChange={(e) => setMedJumlah(e.target.value)}
                                    className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 text-center"
                                />
                            </div>

                            <div className="sm:col-span-3">
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Dosis / Aturan Pakai</label>
                                <input
                                    type="text"
                                    value={medDosis}
                                    onChange={(e) => setMedDosis(e.target.value)}
                                    placeholder="Contoh: 2x1 sehari"
                                    className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
                                />
                            </div>

                            <div className="sm:col-span-1">
                                <Button
                                    type="button"
                                    variant="primary"
                                    onClick={handleAppendMedicine}
                                    className="w-full py-2 px-2 text-xs font-bold bg-emerald-700 hover:bg-emerald-800"
                                    title="Tambahkan Resep"
                                >
                                    + Tambah
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label className="block text-xs sm:text-sm font-bold text-gray-900">
                                Terapi Pengobatan & Tindakan Medis <span className="text-red-500">*</span>
                            </label>
                            <span className="text-xs text-gray-400">Tindakan klinik & resep terapi lengkap</span>
                        </div>
                        <textarea
                            rows={4}
                            value={data.terapi_pengobatan}
                            onChange={(e) => setData('terapi_pengobatan', e.target.value)}
                            placeholder="Contoh: Injeksi Vitamin B-Complex 1ml, Pembersihan luka dengan antiseptik, Pemberian antibiotik oral..."
                            className={`w-full p-3.5 text-xs sm:text-sm bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 transition-all font-mono leading-relaxed ${
                                errors.terapi_pengobatan ? 'border-red-500' : 'border-gray-300'
                            }`}
                        />
                        {errors.terapi_pengobatan && <p className="text-xs text-red-500 mt-1">{errors.terapi_pengobatan}</p>}
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label className="block text-xs sm:text-sm font-bold text-gray-900">
                                Catatan & Anjuran Dokter (Opsional)
                            </label>
                            <span className="text-xs text-gray-400">Instruksi perawatan untuk pemilik di rumah</span>
                        </div>
                        <textarea
                            rows={2}
                            value={data.catatan}
                            onChange={(e) => setData('catatan', e.target.value)}
                            placeholder="Contoh: Jaga kebersihan kandang, berikan pakan lunak, kontrol ulang dalam 3 hari bila nafsu makan belum pulih."
                            className="w-full p-3.5 text-xs sm:text-sm bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 transition-all"
                        />
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
                        <Link
                            href="/dokter/antrian"
                            className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 transition-all"
                        >
                            Batal
                        </Link>
                        <Button
                            type="submit"
                            variant="primary"
                            disabled={processing}
                            className="text-xs sm:text-sm px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 shadow-md font-bold"
                        >
                            {processing ? 'Menyimpan...' : '✅ Simpan & Selesaikan Pemeriksaan'}
                        </Button>
                    </div>
                </form>
            </div>

            <Modal
                isOpen={showHistoryModal}
                onClose={() => setShowHistoryModal(false)}
                title={`Riwayat Rekam Medis Lalu: ${visit.nama_hewan} (${visit.no_rm})`}
                size="lg"
            >
                <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1 text-xs">
                    {historicalRecords.length === 0 ? (
                        <p className="text-center text-gray-400 py-6">Belum ada riwayat kunjungan lampau.</p>
                    ) : (
                        historicalRecords.map((rec, idx) => (
                            <div key={idx} className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-2">
                                <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                                    <div>
                                        <span className="font-bold text-gray-900">Kunjungan: {rec.tgl_kunjungan}</span>
                                        <span className="text-gray-500 ml-2">({rec.berat_badan} kg • {rec.suhu_tubuh} °C)</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                        {rec.dokter_foto ? (
                                            <img
                                                src={rec.dokter_foto}
                                                alt={rec.dokter}
                                                className="w-4 h-4 rounded-full object-cover shrink-0"
                                            />
                                        ) : (
                                            <span>🩺</span>
                                        )}
                                        <span>Pemeriksa: {formatDoctorName(rec.dokter)}</span>
                                    </div>
                                </div>
                                <p><strong className="text-gray-800">Keluhan / Anamnesa:</strong> {rec.anamnesa}</p>
                                <p><strong className="text-gray-800">Diagnosa:</strong> <span className="font-bold text-purple-900">{rec.diagnosa}</span></p>
                                <p><strong className="text-gray-800">Terapi / Obat:</strong> {rec.terapi_pengobatan}</p>
                                {rec.catatan && <p><strong className="text-gray-800">Catatan:</strong> {rec.catatan}</p>}
                            </div>
                        ))
                    )}

                    <div className="flex justify-end pt-3 border-t border-gray-100">
                        <Button variant="outline" onClick={() => setShowHistoryModal(false)}>
                            Tutup
                        </Button>
                    </div>
                </div>
            </Modal>
        </DashboardLayout>
    );
}

