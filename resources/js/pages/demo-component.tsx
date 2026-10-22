import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import {
    Button,
    Modal,
    ConfirmationModal,
    ToastProvider,
    useToast,
    Pagination,
    Dropdown,
    Select,
} from '@/components/ui';
import { PublicLayout, DashboardLayout } from '@/layouts';

/**
 * Komponen Showcase Konten yang berisi demonstrasi seluruh komponen
 */
function ComponentShowcase({
    onRoleChange,
    selectedRole,
    activeLayout,
    setActiveLayout,
}: {
    onRoleChange: (role: 'super' | 'admin' | 'dokter') => void;
    selectedRole: 'super' | 'admin' | 'dokter';
    activeLayout: string;
    setActiveLayout: (layout: 'dashboard' | 'public' | 'standalone') => void;
}) {
    const { success, error, warning, info } = useToast();

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
    const [isModalLoading, setIsModalLoading] = useState(false);
    const [modalAnimalType, setModalAnimalType] = useState('Kucing');

    const [isButtonLoading, setIsButtonLoading] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = 8;

    const generatePaginationLinks = (activePage: number, total: number) => {
        const links = [];
        links.push({
            url: activePage > 1 ? `#page-${activePage - 1}` : null,
            label: '&laquo; Previous',
            active: false,
        });

        for (let i = 1; i <= total; i++) {
            if (i === 1 || i === total || Math.abs(i - activePage) <= 1) {
                links.push({
                    url: `#page-${i}`,
                    label: String(i),
                    active: i === activePage,
                });
            } else if (links[links.length - 1]?.label !== '...') {
                links.push({
                    url: null,
                    label: '...',
                    active: false,
                });
            }
        }

        links.push({
            url: activePage < total ? `#page-${activePage + 1}` : null,
            label: 'Next &raquo;',
            active: false,
        });

        return links;
    };

    const paginationLinks = generatePaginationLinks(currentPage, totalPages);

    const handlePageClick = (url: string | null, label: string) => {
        if (!url) return;
        if (label.includes('Previous') || label.includes('&laquo;')) {
            setCurrentPage((p) => Math.max(1, p - 1));
        } else if (label.includes('Next') || label.includes('&raquo;')) {
            setCurrentPage((p) => Math.min(totalPages, p + 1));
        } else {
            const pageNum = parseInt(label, 10);
            if (!isNaN(pageNum)) setCurrentPage(pageNum);
        }
    };

    const handleDeleteConfirm = () => {
        setIsModalLoading(true);
        setTimeout(() => {
            setIsModalLoading(false);
            setIsDeleteModalOpen(false);
            success('Data pasien hewan dan rekam medis berhasil dihapus permanen!');
        }, 1200);
    };

    return (
        <div className="space-y-10 pb-16">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 mb-3">
                            <span className="h-2 w-2 rounded-full bg-purple-600 animate-pulse" />
                            Katalog & Showcase UI Komponen
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                            Sistem Informasi Puskeswan
                        </h1>
                        <p className="mt-2 text-sm text-gray-500 max-w-2xl leading-relaxed">
                            Halaman pengujian interaktif untuk seluruh komponen global: Button, Modal (latar backdrop tidak dapat ditutup otomatis), Toast Notification (anti-duplikasi & auto-dismiss 2-3 detik), Pagination kompak, Dropdown, serta variasi Layout.
                        </p>
                    </div>

                    <div className="flex flex-col gap-2 p-3 bg-gray-50 rounded-2xl border border-gray-200/80">
                        <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                            Pilih Tampilan Layout:
                        </span>
                        <div className="flex flex-wrap gap-2">
                            <button
                                type="button"
                                onClick={() => setActiveLayout('dashboard')}
                                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                                    activeLayout === 'dashboard'
                                        ? 'bg-purple-700 text-white shadow-xs'
                                        : 'bg-white text-gray-600 hover:text-purple-700 border border-gray-200'
                                }`}
                            >
                                Dashboard Layout
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveLayout('public')}
                                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                                    activeLayout === 'public'
                                        ? 'bg-purple-700 text-white shadow-xs'
                                        : 'bg-white text-gray-600 hover:text-purple-700 border border-gray-200'
                                }`}
                            >
                                Public Layout
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveLayout('standalone')}
                                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                                    activeLayout === 'standalone'
                                        ? 'bg-purple-700 text-white shadow-xs'
                                        : 'bg-white text-gray-600 hover:text-purple-700 border border-gray-200'
                                }`}
                            >
                                Standalone
                            </button>
                        </div>

                        {activeLayout === 'dashboard' && (
                            <div className="pt-2 mt-1 border-t border-gray-200/60 flex items-center gap-2">
                                <span className="text-[11px] text-gray-500 font-medium">Peran:</span>
                                {(['super', 'admin', 'dokter'] as const).map((r) => (
                                    <button
                                        key={r}
                                        type="button"
                                        onClick={() => onRoleChange(r)}
                                        className={`px-2 py-0.5 rounded-md text-[11px] font-semibold uppercase ${
                                            selectedRole === r
                                                ? 'bg-purple-700 text-white'
                                                : 'bg-white text-gray-600 border border-gray-200 hover:bg-purple-50'
                                        }`}
                                    >
                                        {r}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <section className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
                <div className="border-b border-gray-100 pb-4">
                    <h2 className="text-lg font-bold text-gray-900 tracking-tight flex items-center gap-2">
                        <span className="h-6 w-2 rounded-full bg-purple-700 inline-block" />
                        1. Custom Button (Solid Color & Efek Hover Halus)
                    </h2>
                    <p className="mt-1 text-xs text-gray-500">
                        Varian solid warna: Primary Purple (#7e22ce), Secondary (#ffffff/border), Danger (#dc2626), serta varian Outline & Ghost.
                    </p>
                </div>

                <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                        Varian Warna Solid
                    </h3>
                    <div className="flex flex-wrap items-center gap-3">
                        <Button
                            variant="primary"
                            onClick={() => success('Tombol Primary Purple diklik!')}
                        >
                            Primary Purple
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={() => info('Tombol Secondary diklik!')}
                        >
                            Secondary Netral
                        </Button>
                        <Button
                            variant="danger"
                            onClick={() => error('Tombol Danger diklik!')}
                        >
                            Danger Hapus
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => info('Tombol Outline diklik!')}
                        >
                            Outline Purple
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={() => info('Tombol Ghost diklik!')}
                        >
                            Ghost Button
                        </Button>
                    </div>
                </div>

                <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                        Ukuran & Status Animasi Loading
                    </h3>
                    <div className="flex flex-wrap items-center gap-3">
                        <Button variant="primary" size="sm">
                            Kecil (sm)
                        </Button>
                        <Button variant="primary" size="md">
                            Standar (md)
                        </Button>
                        <Button variant="primary" size="lg">
                            Besar (lg)
                        </Button>

                        <Button
                            variant="primary"
                            isLoading={isButtonLoading}
                            onClick={() => {
                                setIsButtonLoading(true);
                                setTimeout(() => setIsButtonLoading(false), 2000);
                            }}
                        >
                            {isButtonLoading ? 'Menyimpan...' : 'Klik Efek Loading'}
                        </Button>

                        <Button variant="secondary" disabled>
                            Disabled State
                        </Button>
                    </div>
                </div>

                <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                        Tombol dengan Ikon
                    </h3>
                    <div className="flex flex-wrap items-center gap-3">
                        <Button
                            variant="primary"
                            leftIcon={
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                </svg>
                            }
                        >
                            Daftarkan Pasien Hewan
                        </Button>

                        <Button
                            variant="secondary"
                            rightIcon={
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            }
                        >
                            Lihat Rekam Medis
                        </Button>
                    </div>
                </div>
            </section>

            <section className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
                <div className="border-b border-gray-100 pb-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-gray-900 tracking-tight flex items-center gap-2">
                            <span className="h-6 w-2 rounded-full bg-purple-700 inline-block" />
                            2. Custom Modal (Konfirmasi, Tambah Data, Logout)
                        </h2>
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            Strict Requirement: Backdrop Locked
                        </span>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                        <strong>PERHATIAN KRITIS:</strong> Modal di bawah ini <u>TIDAK DAPAT</u> ditutup dengan mengklik backdrop di luar. Modal hanya dapat ditutup via tombol silang (<strong>X</strong>) di pojok atas atau tombol <strong>Batal / Tutup</strong>. Mengklik area luar memicu efek peringatan visual lembut tanpa menutup modal.
                    </p>
                </div>

                <div className="flex flex-wrap gap-4">
                    <Button
                        variant="danger"
                        onClick={() => setIsDeleteModalOpen(true)}
                        leftIcon={
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        }
                    >
                        Buka Modal Hapus Data (Danger)
                    </Button>

                    <Button
                        variant="primary"
                        onClick={() => setIsAddModalOpen(true)}
                        leftIcon={
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                            </svg>
                        }
                    >
                        Buka Modal Tambah Pasien Baru
                    </Button>

                    <Button
                        variant="secondary"
                        onClick={() => setIsCustomModalOpen(true)}
                    >
                        Buka Modal Informasi Layanan
                    </Button>
                </div>

                <ConfirmationModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onConfirm={handleDeleteConfirm}
                    isLoading={isModalLoading}
                    type="danger"
                    title="Hapus Rekam Medis Pasien"
                    message="Apakah Anda yakin ingin menghapus data rekam medis hewan ini secara permanen? Data yang telah dihapus tidak dapat dipulihkan kembali dari sistem Puskeswan."
                    confirmText="Ya, Hapus Data"
                    cancelText="Batal"
                    confirmVariant="danger"
                />

                <Modal
                    isOpen={isAddModalOpen}
                    onClose={() => setIsAddModalOpen(false)}
                    title="Pendaftaran Pasien Hewan Baru"
                    description="Masukkan data pemilik dan informasi hewan untuk membuat rekam medis baru."
                    size="md"
                    type="success"
                    footer={
                        <>
                            <Button
                                variant="secondary"
                                onClick={() => setIsAddModalOpen(false)}
                            >
                                Batal
                            </Button>
                            <Button
                                variant="primary"
                                onClick={() => {
                                    setIsAddModalOpen(false);
                                    success('Pasien baru berhasil didaftarkan ke sistem antrean!');
                                }}
                            >
                                Simpan Pasien
                            </Button>
                        </>
                    }
                >
                    <div className="space-y-4">
                        <div className="p-3 bg-purple-50 rounded-xl text-xs text-purple-900 border border-purple-100 flex items-start gap-2">
                            <span className="font-bold shrink-0">Info:</span>
                            <span>Coba klik area gelap di luar modal ini. Modal TIDAK akan tertutup karena aturan strict backdrop-lock!</span>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                                Nama Pemilik Hewan
                            </label>
                            <input
                                type="text"
                                placeholder="Contoh: Bpk. Bambang Sutrisno"
                                className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Nama Hewan / Ras
                                </label>
                                <input
                                    type="text"
                                    placeholder="Contoh: Milo (Kucing Persia)"
                                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Jenis Hewan
                                </label>
                                <Select
                                    value={modalAnimalType}
                                    onChange={(val) => setModalAnimalType(val)}
                                    options={[
                                        { value: 'Kucing', label: 'Kucing (Felis catus)' },
                                        { value: 'Anjing', label: 'Anjing (Canis familiaris)' },
                                        { value: 'Sapi Ternak', label: 'Sapi Ternak (Bos taurus)' },
                                        { value: 'Kambing / Domba', label: 'Kambing / Domba (Capra hircus)' },
                                        { value: 'Unggas / Burung', label: 'Unggas / Burung Peliharaan' },
                                    ]}
                                />
                            </div>
                        </div>
                    </div>
                </Modal>

                <Modal
                    isOpen={isCustomModalOpen}
                    onClose={() => setIsCustomModalOpen(false)}
                    title="Jadwal Pelayanan Terpadu Puskeswan"
                    size="sm"
                    type="warning"
                >
                    <p className="text-gray-600 text-sm leading-relaxed">
                        Layanan vaksinasi rabies gratis diadakan setiap hari Rabu pukul 08:30 - 12:00 WIB di aula depan Puskeswan. Harap membawa buku identitas hewan jika sudah terdaftar.
                    </p>
                </Modal>
            </section>

            <section className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
                <div className="border-b border-gray-100 pb-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-gray-900 tracking-tight flex items-center gap-2">
                            <span className="h-6 w-2 rounded-full bg-purple-700 inline-block" />
                            3. Custom Toast Notification (Anti-Duplikasi & Auto-Dismiss 2.5 Detik)
                        </h2>
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                            Auto-dismiss: 2.5s
                        </span>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                        Klik tombol di bawah untuk memunculkan notifikasi. <strong>Coba klik tombol yang sama berkali-kali:</strong> pesan yang identik tidak akan menumpuk duplikat di layar! Notifikasi otomatis tertutup sendiri dalam 2.5 detik.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <Button
                        variant="primary"
                        onClick={() => success('Data rekam medis pemeriksaan berhasil disimpan!')}
                        className="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white border-transparent"
                    >
                        Toast Sukses
                    </Button>

                    <Button
                        variant="danger"
                        onClick={() => error('Gagal menyimpan diagnosis: Koneksi server terputus!')}
                    >
                        Toast Error
                    </Button>

                    <Button
                        variant="secondary"
                        onClick={() => warning('Stok vaksin rabies sisa 3 vial, segera lakukan restock!')}
                        className="border-amber-300 text-amber-800 hover:bg-amber-50"
                    >
                        Toast Peringatan
                    </Button>

                    <Button
                        variant="primary"
                        onClick={() => info('Pemberitahuan: Antrean pasien dokter nomor A-014 siap dipanggil.')}
                    >
                        Toast Info
                    </Button>
                </div>

                <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-100 text-xs text-purple-900 flex items-center justify-between">
                    <span>
                        💡 <strong>Uji Anti-Duplikasi:</strong> Klik tombol hijau 5x berturut-turut. Anda akan melihat hanya 1 toast yang muncul tanpa bertumpuk!
                    </span>
                    <Button
                        size="sm"
                        variant="primary"
                        onClick={() => {
                            success('Pesan ini dicegah dari penumpukan duplikat.');
                        }}
                    >
                        Uji Anti-Stacking
                    </Button>
                </div>
            </section>

            <section className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
                <div className="border-b border-gray-100 pb-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <h2 className="text-lg font-bold text-gray-900 tracking-tight flex items-center gap-2">
                            <span className="h-6 w-2 rounded-full bg-purple-700 inline-block" />
                            4. Custom Pagination (Format Jendela Geser: &lt; 1 2 3 4 5 &gt; &amp; &lt; 3 4 5 6 7 &gt;)
                        </h2>
                        <span className="w-fit px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                            Sliding Window (5 Halaman)
                        </span>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                        Format dinamis dengan tombol <code>&lt;</code> dan <code>&gt;</code>. Saat berada di halaman 1-3 format adalah <code>&lt; 1 2 3 4 5 &gt;</code>, dan saat berada di halaman 5 otomatis bergeser menjadi <code>&lt; 3 4 5 6 7 &gt;</code>.
                    </p>
                </div>

                <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200/70 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <span className="text-xs font-semibold text-gray-700">
                            Halaman Aktif Saat Ini: <strong className="text-purple-700 font-bold text-sm">Halaman {currentPage}</strong> dari {totalPages}
                        </span>

                        <div className="flex items-center gap-2">
                            <Button
                                size="sm"
                                variant={currentPage === 1 ? 'primary' : 'secondary'}
                                onClick={() => setCurrentPage(1)}
                            >
                                Ke Halaman 1 (&lt; 1 2 3 4 5 &gt;)
                            </Button>
                            <Button
                                size="sm"
                                variant={currentPage === 5 ? 'primary' : 'secondary'}
                                onClick={() => setCurrentPage(5)}
                            >
                                Ke Halaman 5 (&lt; 3 4 5 6 7 &gt;)
                            </Button>
                        </div>
                    </div>

                    <div className="pt-2">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            total={80}
                            from={(currentPage - 1) * 10 + 1}
                            to={Math.min(currentPage * 10, 80)}
                            onPageChange={(page) => {
                                setCurrentPage(page);
                                info(`Berpindah ke halaman ${page}`);
                            }}
                        />
                    </div>
                </div>
            </section>

            <section className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
                <div className="border-b border-gray-100 pb-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <h2 className="text-lg font-bold text-gray-900 tracking-tight flex items-center gap-2">
                            <span className="h-6 w-2 rounded-full bg-purple-700 inline-block" />
                            5. Custom Dropdown (Ukuran Tombol &amp; Opsi Sama Besar, Ramah Layar Kecil)
                        </h2>
                        <span className="w-fit px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            Matched Size &amp; Mobile-Adaptive
                        </span>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                        Ukuran lebar dan tinggi tombol trigger dengan setiap opsi pilihan dibuat <strong>sama persis</strong>. Pada layar kecil / mobile, dropdown otomatis menyesuaikan lebar (100% full width) dan tidak pernah terpotong keluar layar.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200/70 space-y-3">
                        <span className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                            Demo 1: Tindakan Medis (Lebar &amp; Tinggi Opsi Sama dengan Tombol)
                        </span>
                        <p className="text-xs text-gray-500">
                            Tombol trigger dan setiap opsi pilihan memiliki tinggi <code>h-10</code>, font <code>text-sm</code>, dan lebar yang identik.
                        </p>

                        <div className="w-full sm:w-72">
                            <Dropdown matchWidth={true} fullWidthOnMobile={true}>
                                <Dropdown.Trigger>
                                    <Button
                                        variant="primary"
                                        className="w-full justify-between"
                                        rightIcon={
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                            </svg>
                                        }
                                    >
                                        Pilihan Tindakan Medis
                                    </Button>
                                </Dropdown.Trigger>

                                <Dropdown.Content align="left" matchWidth={true}>
                                    <Dropdown.Item
                                        onClick={() => info('Membuka form resep obat')}
                                        icon={
                                            <svg className="w-4 h-4 text-purple-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        }
                                    >
                                        Buat Resep Obat
                                    </Dropdown.Item>

                                    <Dropdown.Item
                                        onClick={() => info('Mencetak berkas rekam medis')}
                                        icon={
                                            <svg className="w-4 h-4 text-purple-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                            </svg>
                                        }
                                    >
                                        Cetak Rekam Medis
                                    </Dropdown.Item>

                                    <Dropdown.Divider />

                                    <Dropdown.Item
                                        danger
                                        onClick={() => error('Kunjungan pasien dibatalkan')}
                                        icon={
                                            <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                            </svg>
                                        }
                                    >
                                        Batalkan Antrean
                                    </Dropdown.Item>
                                </Dropdown.Content>
                            </Dropdown>
                        </div>
                    </div>

                    <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200/70 space-y-3">
                        <span className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                            Demo 2: Menu Profil Petugas (Responsif Layar Kecil)
                        </span>
                        <p className="text-xs text-gray-500">
                            Pada layar smartphone, lebar kartu profil dan opsi menu mengisi penuh container secara rapi.
                        </p>

                        <div className="w-full sm:w-64">
                            <Dropdown matchWidth={true} fullWidthOnMobile={true}>
                                <Dropdown.Trigger>
                                    <div className="w-full flex items-center justify-between gap-2.5 px-3.5 py-2 bg-white rounded-xl border border-gray-300 shadow-2xs hover:border-purple-400 transition-colors">
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <div className="h-7 w-7 rounded-lg bg-purple-700 text-white font-bold text-xs flex items-center justify-center shrink-0">
                                                AF
                                            </div>
                                            <span className="text-xs font-semibold text-gray-800 truncate">
                                                drh. Ahmad Fauzi
                                            </span>
                                        </div>
                                        <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </Dropdown.Trigger>

                                <Dropdown.Content align="left" matchWidth={true}>
                                    <Dropdown.Header>
                                        <div className="font-semibold text-gray-900 text-xs">drh. Ahmad Fauzi</div>
                                        <div className="text-[11px] text-gray-400">dokter@puskeswan.go.id</div>
                                    </Dropdown.Header>

                                    <Dropdown.Item onClick={() => info('Membuka halaman Profil Saya')}>
                                        Profil Saya
                                    </Dropdown.Item>

                                    <Dropdown.Item onClick={() => info('Membuka Pengaturan Akun')}>
                                        Pengaturan Akun
                                    </Dropdown.Item>

                                    <Dropdown.Divider />

                                    <Dropdown.Item danger onClick={() => warning('Peringatan: Untuk logout gunakan menu keluar di navbar')}>
                                        Keluar dari Sistem
                                    </Dropdown.Item>
                                </Dropdown.Content>
                            </Dropdown>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

/**
 * Halaman Utama Demo Component
 */
export default function DemoComponent() {
    const [selectedRole, setSelectedRole] = useState<'super' | 'admin' | 'dokter'>('dokter');
    const [activeLayout, setActiveLayout] = useState<'dashboard' | 'public' | 'standalone'>('dashboard');

    const content = (
        <ComponentShowcase
            onRoleChange={setSelectedRole}
            selectedRole={selectedRole}
            activeLayout={activeLayout}
            setActiveLayout={setActiveLayout}
        />
    );

    return (
        <>
            <Head title="Demo Komponen UI" />

            {activeLayout === 'dashboard' && (
                <DashboardLayout title={`Demo Komponen UI (Hak Akses: ${selectedRole.toUpperCase()})`}>
                    {content}
                </DashboardLayout>
            )}

            {activeLayout === 'public' && (
                <PublicLayout title="Demo Komponen UI Puskeswan">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                        {content}
                    </div>
                </PublicLayout>
            )}

            {activeLayout === 'standalone' && (
                <ToastProvider>
                    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
                        <div className="max-w-6xl mx-auto">
                            {content}
                        </div>
                    </div>
                </ToastProvider>
            )}
        </>
    );
}

