export interface NavItem {
    path: string;
    id: string;
    label: string;
}

export interface NewsItem {
    id: string | number;
    title: string;
    category: string;
    categorySlug?: string;
    date: string;
    author: string;
    authorSlug?: string;
    authorFoto?: string | null;
    readTime: string;
    excerpt: string;
    content: string;
    slug?: string;
    gambar?: string | null;
}

export interface StaffMember {
    name: string;
    role: string;
    sip: string;
    experience: string;
    specialty: string;
    schedule: string;
    avatarColor: string;
    initials: string;
    foto?: string | null;
}

export interface HistoricalRecord {
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
    dokter_nip?: string;
}

export interface MedicalRecord {
    id?: number;
    code?: string;
    no_rm?: string;
    petName?: string;
    nama_hewan?: string;
    id_hewan?: number;
    petType?: string;
    jenis_hewan?: string;
    jenis_kelamin?: string;
    umur?: string;
    warna_hewan?: string;
    owner?: string;
    pemilik?: string;
    nik?: string;
    nik_pemilik?: string;
    no_hp?: string;
    address?: string;
    alamat_pemilik?: string;
    visitDate?: string;
    tgl_kunjungan?: string;
    jam_kunjungan?: string;
    waktu_lengkap?: string;
    waktu_selesai?: string;
    doctor?: string;
    dokter?: string;
    dokter_nama?: string;
    dokter_foto?: string | null;
    dokter_nip?: string;
    dokter_jabatan?: string;
    complaint?: string;
    anamnesa?: string;
    diagnosis?: string;
    diagnosa?: string;
    treatment?: string;
    terapi_pengobatan?: string;
    catatan?: string;
    vaccineStatus?: string;
    status?: string;
    status_antrean?: string;
    berat_badan?: number;
    suhu_tubuh?: number;
    admin_petugas?: string;
    historical_records?: HistoricalRecord[];
}

export interface ContactFormData {
    name: string;
    phone: string;
    petType: string;
    message: string;
}
