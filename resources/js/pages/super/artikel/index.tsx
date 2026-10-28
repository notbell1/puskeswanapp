import React, { useRef, useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Button, Dropdown, Modal, Pagination, Select, useToast } from '@/components/ui';

interface ArticleItem {
    id: number;
    judul: string;
    slug: string;
    author_name: string;
    kategori_name: string;
    id_kategori: number;
    ringkasan: string;
    isi_berita: string;
    gambar: string | null;
    tgl_terbit: string;
    status: 'Published' | 'Draft';
}

interface CategoryItem {
    id: number;
    nama_kategori: string;
    slug: string;
}

interface StaffItem {
    id: number;
    nama_staf: string;
    jabatan: string;
}

interface AuthorOptionItem {
    value: string;
    label: string;
    sublabel?: string;
}

interface ArticlesPageProps {
    articles: {
        data: ArticleItem[];
        links: any[];
        current_page: number;
        last_page: number;
        from: number;
        to: number;
        total: number;
    };
    categories: CategoryItem[];
    staffList: StaffItem[];
    authorOptions?: AuthorOptionItem[];
    filters: {
        search?: string;
        kategori?: string;
        status?: string;
        author?: string;
    };
}

const STATUS_OPTIONS = [
    { value: 'Published', label: 'Published (Tayang di Web)' },
    { value: 'Draft', label: 'Draft (Simpan Konsep)' },
];

const STATUS_FILTER_OPTIONS: Record<string, string> = {
    '': 'Semua Status Publikasi',
    Published: 'Status: Published',
    Draft: 'Status: Draft',
};

export default function ArticlesIndex({
    articles,
    categories,
    staffList,
    authorOptions = [],
    filters,
}: ArticlesPageProps) {
    const { success, error, warning } = useToast();

    const [search, setSearch] = useState(filters.search || '');
    const [categoryFilter, setCategoryFilter] = useState(filters.kategori || '');
    const [authorFilter, setAuthorFilter] = useState(filters.author || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');

    const [formModalOpen, setFormModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<ArticleItem | null>(null);

    const [showInlineCategoryForm, setShowInlineCategoryForm] = useState(false);
    const [categoryModalOpen, setCategoryModalOpen] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [isSavingCategory, setIsSavingCategory] = useState(false);

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [removeImage, setRemoveImage] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const [saveConfirmModalOpen, setSaveConfirmModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isSubmittingRef = useRef(false);

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<ArticleItem | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const computedAuthorOptions: AuthorOptionItem[] = React.useMemo(() => {
        if (authorOptions && authorOptions.length > 0) {
            return authorOptions;
        }
        const fallback: AuthorOptionItem[] = [
            { value: 'Admin', label: 'Admin', sublabel: 'Default / Administrator' },
        ];
        const seen = new Set<string>(['admin']);
        staffList.forEach((st) => {
            const key = st.nama_staf.trim().toLowerCase();
            if (st.nama_staf && !seen.has(key)) {
                seen.add(key);
                fallback.push({
                    value: st.nama_staf,
                    label: st.nama_staf,
                    sublabel: `Staff • ${st.jabatan}`,
                });
            }
        });
        return fallback;
    }, [authorOptions, staffList]);

    const { data, setData, errors, reset, clearErrors } = useForm({
        judul: '',
        id_kategori: (categories[0]?.id || 1) as number | string,
        author_name: 'Admin',
        ringkasan: '',
        isi_berita: '',
        status: 'Published',
    });

    const applyFilters = (params: {
        search?: string;
        kategori?: string;
        author?: string;
        status?: string;
    }) => {
        router.get(
            '/super/artikel',
            {
                search: params.search || undefined,
                kategori: params.kategori || undefined,
                author: params.author || undefined,
                status: params.status || undefined,
            },
            { preserveState: true, replace: true }
        );
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilters({
            search,
            kategori: categoryFilter,
            author: authorFilter,
            status: statusFilter,
        });
    };

    const handleFilterCategory = (catId: string) => {
        setCategoryFilter(catId);
        applyFilters({
            search,
            kategori: catId,
            author: authorFilter,
            status: statusFilter,
        });
    };

    const handleFilterAuthor = (authorVal: string) => {
        setAuthorFilter(authorVal);
        applyFilters({
            search,
            kategori: categoryFilter,
            author: authorVal,
            status: statusFilter,
        });
    };

    const handleFilterStatus = (stat: string) => {
        setStatusFilter(stat);
        applyFilters({
            search,
            kategori: categoryFilter,
            author: authorFilter,
            status: stat,
        });
    };

    const handleResetFilter = () => {
        setSearch('');
        setCategoryFilter('');
        setAuthorFilter('');
        setStatusFilter('');
        router.get('/super/artikel', {}, { preserveState: true, replace: true });
    };

    const notifyValidation = (message: string) => {
        if (typeof warning === 'function') {
            warning(message, 'Validasi Formulir');
        } else if (typeof error === 'function') {
            error(message, 'Validasi Formulir');
        }
    };

    const handleSaveNewCategory = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (isSavingCategory) return;

        const trimmed = newCategoryName.trim();
        if (!trimmed) {
            notifyValidation('Nama kategori baru wajib diisi!');
            return;
        }

        setIsSavingCategory(true);
        router.post(
            '/super/artikel/kategori',
            { nama_kategori: trimmed },
            {
                preserveState: true,
                preserveScroll: true,
                onSuccess: (page) => {
                    const updatedCategories = ((page.props as any)?.categories || []) as CategoryItem[];
                    const newlyCreated = updatedCategories.find(
                        (c) => c.nama_kategori.toLowerCase() === trimmed.toLowerCase()
                    );
                    if (newlyCreated) {
                        setData('id_kategori', newlyCreated.id);
                    }
                    setNewCategoryName('');
                    setShowInlineCategoryForm(false);
                    setCategoryModalOpen(false);
                    success(`Kategori '${trimmed}' berhasil ditambahkan dan disinkronkan!`);
                },
                onError: (errs) => {
                    const firstErr = Object.values(errs)[0];
                    error(
                        typeof firstErr === 'string'
                            ? firstErr
                            : 'Gagal menambahkan kategori baru.'
                    );
                },
                onFinish: () => {
                    setIsSavingCategory(false);
                },
            }
        );
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            notifyValidation('Format berkas harus berupa JPG, PNG, atau WEBP!');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            notifyValidation('Ukuran berkas gambar maksimal 5MB!');
            return;
        }

        setImageFile(file);
        setRemoveImage(false);

        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveSelectedImage = () => {
        setImageFile(null);
        setImagePreview(null);
        setRemoveImage(true);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const openCreateModal = () => {
        setEditingItem(null);
        setSaveConfirmModalOpen(false);
        setDeleteModalOpen(false);
        setShowInlineCategoryForm(false);
        setNewCategoryName('');
        isSubmittingRef.current = false;
        setIsSubmitting(false);
        setImageFile(null);
        setImagePreview(null);
        setRemoveImage(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        reset();
        clearErrors();
        setData({
            judul: '',
            id_kategori: categories[0]?.id || 1,
            author_name: 'Admin',
            ringkasan: '',
            isi_berita: '',
            status: 'Published',
        });
        setFormModalOpen(true);
    };

    const openEditModal = (item: ArticleItem) => {
        setEditingItem(item);
        setSaveConfirmModalOpen(false);
        setDeleteModalOpen(false);
        setShowInlineCategoryForm(false);
        setNewCategoryName('');
        isSubmittingRef.current = false;
        setIsSubmitting(false);
        setImageFile(null);
        setImagePreview(item.gambar || null);
        setRemoveImage(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        clearErrors();
        setData({
            judul: item.judul,
            id_kategori: item.id_kategori,
            author_name: item.author_name || 'Admin',
            ringkasan: item.ringkasan,
            isi_berita: item.isi_berita,
            status: item.status,
        });
        setFormModalOpen(true);
    };

    const closeFormModal = () => {
        if (isSubmittingRef.current || isSubmitting) return;
        setFormModalOpen(false);
        setSaveConfirmModalOpen(false);
        setShowInlineCategoryForm(false);
        clearErrors();
    };

    const validateForm = () => {
        if (!data.judul || !data.judul.trim()) {
            notifyValidation('Judul artikel wajib diisi!');
            return false;
        }

        if (!data.id_kategori) {
            notifyValidation('Kategori edukasi artikel wajib dipilih!');
            return false;
        }

        if (!data.author_name || !data.author_name.trim()) {
            notifyValidation('Nama penulis / tim medis wajib dipilih!');
            return false;
        }

        if (!data.status || !data.status.trim()) {
            notifyValidation('Status publikasi artikel wajib dipilih!');
            return false;
        }

        if (!data.ringkasan || !data.ringkasan.trim()) {
            notifyValidation('Ringkasan singkat (lead summary) artikel wajib diisi!');
            return false;
        }

        if (!data.isi_berita || !data.isi_berita.trim()) {
            notifyValidation('Isi lengkap konten artikel wajib diisi!');
            return false;
        }

        return true;
    };

    const handleRequestSave = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (isSubmittingRef.current || isSubmitting) return;

        if (!validateForm()) {
            return;
        }

        setSaveConfirmModalOpen(true);
    };

    const executeSubmitForm = () => {
        if (isSubmittingRef.current || isSubmitting) return;
        isSubmittingRef.current = true;
        setIsSubmitting(true);

        const formDataPayload: Record<string, any> = {
            judul: data.judul.trim(),
            id_kategori: Number(data.id_kategori),
            author_name: data.author_name.trim(),
            ringkasan: data.ringkasan.trim(),
            isi_berita: data.isi_berita.trim(),
            status: data.status,
        };

        if (imageFile) {
            formDataPayload.gambar = imageFile;
        }

        if (editingItem) {
            formDataPayload._method = 'put';
            if (removeImage) {
                formDataPayload.hapus_gambar = 1;
            }

            router.post(`/super/artikel/${editingItem.id}`, formDataPayload, {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => {
                    setSaveConfirmModalOpen(false);
                    setFormModalOpen(false);
                    success(`Artikel '${data.judul}' berhasil diperbarui!`);
                },
                onError: (errs) => {
                    setSaveConfirmModalOpen(false);
                    const firstErr = Object.values(errs)[0];
                    error(
                        typeof firstErr === 'string'
                            ? firstErr
                            : 'Gagal memperbarui artikel. Mohon periksa isian formulir.'
                    );
                },
                onFinish: () => {
                    isSubmittingRef.current = false;
                    setIsSubmitting(false);
                },
            });
        } else {
            router.post('/super/artikel', formDataPayload, {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => {
                    setSaveConfirmModalOpen(false);
                    setFormModalOpen(false);
                    success(`Artikel baru '${data.judul}' berhasil dipublikasikan!`);
                },
                onError: (errs) => {
                    setSaveConfirmModalOpen(false);
                    const firstErr = Object.values(errs)[0];
                    error(
                        typeof firstErr === 'string'
                            ? firstErr
                            : 'Gagal menerbitkan artikel baru. Mohon periksa isian formulir.'
                    );
                },
                onFinish: () => {
                    isSubmittingRef.current = false;
                    setIsSubmitting(false);
                },
            });
        }
    };

    const confirmDelete = (item: ArticleItem) => {
        setItemToDelete(item);
        setDeleteModalOpen(true);
    };

    const handleDelete = () => {
        if (!itemToDelete) return;
        setIsDeleting(true);
        router.delete(`/super/artikel/${itemToDelete.id}`, {
            preserveScroll: true,
            onSuccess: (page) => {
                setIsDeleting(false);
                setDeleteModalOpen(false);
                const flashError = (page.props as any)?.flash?.error;
                if (flashError) {
                    error(flashError);
                } else {
                    success(`Artikel '${itemToDelete.judul}' berhasil dihapus.`);
                }
            },
            onError: () => {
                setIsDeleting(false);
                error('Gagal menghapus artikel.');
            },
        });
    };

    const activeCatName = categories.find((c) => String(c.id) === String(categoryFilter))?.nama_kategori;
    const categoryOptions = categories.map((c) => ({
        value: c.id,
        label: c.nama_kategori,
    }));

    const selectAuthorOptions = React.useMemo(() => {
        const list = [...computedAuthorOptions];
        if (
            data.author_name &&
            !list.some((opt) => opt.value.toLowerCase() === data.author_name.toLowerCase())
        ) {
            list.push({
                value: data.author_name,
                label: data.author_name,
                sublabel: 'Penulis Terdaftar',
            });
        }
        return list;
    }, [computedAuthorOptions, data.author_name]);

    const hasActiveFilter = Boolean(search || categoryFilter || authorFilter || statusFilter);

    return (
        <DashboardLayout title="Artikel & Edukasi CMS">
            <Head title="Artikel & Edukasi" />

            <div className="space-y-4 max-w-[1600px] mx-auto">
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xs">
                    <div className="p-3 border-b border-gray-200 bg-white">
                        <div className="flex flex-col xl:flex-row gap-2.5 items-stretch xl:items-center justify-between">
                            <form
                                onSubmit={handleSearch}
                                className="flex flex-1 flex-col sm:flex-row flex-wrap lg:flex-nowrap gap-2 items-stretch sm:items-center"
                            >
                                <div className="relative flex-1 min-w-[200px]">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                            />
                                        </svg>
                                    </span>
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Cari judul artikel atau penulis..."
                                        className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50/50 pl-9 pr-3 text-xs sm:text-sm text-gray-800 placeholder:text-gray-400 transition-all focus:border-purple-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                                    />
                                </div>

                                <div className="w-full sm:w-[185px] shrink-0">
                                    <Dropdown size="md" matchWidth>
                                        <Dropdown.Trigger>
                                            <button
                                                type="button"
                                                className="flex h-10 w-full items-center justify-between gap-2 rounded-lg border border-gray-200 bg-white px-2.5 text-xs font-medium text-gray-700 transition-all hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-1 focus:ring-purple-500"
                                            >
                                                <div className="flex items-center gap-1.5 truncate">
                                                    <svg className="h-4 w-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth="2"
                                                            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                                                        />
                                                    </svg>
                                                    <span className="truncate">
                                                        {activeCatName ? `Kategori: ${activeCatName}` : 'Semua Kategori'}
                                                    </span>
                                                </div>
                                                <svg className="h-3.5 w-3.5 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 9-7 7-7-7" />
                                                </svg>
                                            </button>
                                        </Dropdown.Trigger>
                                        <Dropdown.Content align="left" matchWidth className="py-1.5 max-h-64 overflow-y-auto">
                                            <Dropdown.Item
                                                onClick={() => handleFilterCategory('')}
                                                className={`px-3 py-2 text-xs transition-colors ${
                                                    !categoryFilter
                                                        ? 'bg-purple-50 font-semibold text-purple-700'
                                                        : 'text-gray-700 hover:bg-gray-50'
                                                }`}
                                            >
                                                Semua Kategori
                                            </Dropdown.Item>
                                            {categories.map((cat) => (
                                                <Dropdown.Item
                                                    key={cat.id}
                                                    onClick={() => handleFilterCategory(String(cat.id))}
                                                    className={`px-3 py-2 text-xs transition-colors ${
                                                        String(categoryFilter) === String(cat.id)
                                                            ? 'bg-purple-50 font-semibold text-purple-700'
                                                            : 'text-gray-700 hover:bg-gray-50'
                                                    }`}
                                                >
                                                    {cat.nama_kategori}
                                                </Dropdown.Item>
                                            ))}
                                        </Dropdown.Content>
                                    </Dropdown>
                                </div>

                                <div className="w-full sm:w-[195px] shrink-0">
                                    <Dropdown size="md" matchWidth>
                                        <Dropdown.Trigger>
                                            <button
                                                type="button"
                                                className="flex h-10 w-full items-center justify-between gap-2 rounded-lg border border-gray-200 bg-white px-2.5 text-xs font-medium text-gray-700 transition-all hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-1 focus:ring-purple-500"
                                            >
                                                <div className="flex items-center gap-1.5 truncate">
                                                    <svg className="h-4 w-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth="2"
                                                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                                        />
                                                    </svg>
                                                    <span className="truncate">
                                                        {authorFilter ? `Author: ${authorFilter}` : 'Semua Penulis / Author'}
                                                    </span>
                                                </div>
                                                <svg className="h-3.5 w-3.5 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 9-7 7-7-7" />
                                                </svg>
                                            </button>
                                        </Dropdown.Trigger>
                                        <Dropdown.Content align="left" matchWidth className="py-1.5 max-h-64 overflow-y-auto">
                                            <Dropdown.Item
                                                onClick={() => handleFilterAuthor('')}
                                                className={`px-3 py-2 text-xs transition-colors ${
                                                    !authorFilter
                                                        ? 'bg-purple-50 font-semibold text-purple-700'
                                                        : 'text-gray-700 hover:bg-gray-50'
                                                }`}
                                            >
                                                Semua Penulis / Author
                                            </Dropdown.Item>
                                            {computedAuthorOptions.map((authOpt) => (
                                                <Dropdown.Item
                                                    key={authOpt.value}
                                                    onClick={() => handleFilterAuthor(authOpt.value)}
                                                    className={`px-3 py-2 text-xs transition-colors ${
                                                        authorFilter === authOpt.value
                                                            ? 'bg-purple-50 font-semibold text-purple-700'
                                                            : 'text-gray-700 hover:bg-gray-50'
                                                    }`}
                                                >
                                                    <div className="truncate">
                                                        <span className="block font-medium truncate">{authOpt.label}</span>
                                                        {authOpt.sublabel && (
                                                            <span className="block text-[10px] text-gray-400 truncate">
                                                                {authOpt.sublabel}
                                                            </span>
                                                        )}
                                                    </div>
                                                </Dropdown.Item>
                                            ))}
                                        </Dropdown.Content>
                                    </Dropdown>
                                </div>

                                <div className="w-full sm:w-[180px] shrink-0">
                                    <Dropdown size="md" matchWidth>
                                        <Dropdown.Trigger>
                                            <button
                                                type="button"
                                                className="flex h-10 w-full items-center justify-between gap-2 rounded-lg border border-gray-200 bg-white px-2.5 text-xs font-medium text-gray-700 transition-all hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-1 focus:ring-purple-500"
                                            >
                                                <div className="flex items-center gap-1.5 truncate">
                                                    <svg className="h-4 w-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth="2"
                                                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                                        />
                                                    </svg>
                                                    <span className="truncate">
                                                        {STATUS_FILTER_OPTIONS[statusFilter] || 'Semua Status'}
                                                    </span>
                                                </div>
                                                <svg className="h-3.5 w-3.5 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 9-7 7-7-7" />
                                                </svg>
                                            </button>
                                        </Dropdown.Trigger>
                                        <Dropdown.Content align="left" matchWidth className="py-1.5">
                                            {Object.entries(STATUS_FILTER_OPTIONS).map(([val, label]) => (
                                                <Dropdown.Item
                                                    key={val}
                                                    onClick={() => handleFilterStatus(val)}
                                                    className={`px-3 py-2 text-xs transition-colors ${
                                                        statusFilter === val
                                                            ? 'bg-purple-50 font-semibold text-purple-700'
                                                            : 'text-gray-700 hover:bg-gray-50'
                                                    }`}
                                                >
                                                    {label}
                                                </Dropdown.Item>
                                            ))}
                                        </Dropdown.Content>
                                    </Dropdown>
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0">
                                    <Button
                                        type="submit"
                                        variant="secondary"
                                        size="md"
                                        className="h-10 px-3.5 text-xs font-semibold border-gray-200 hover:bg-gray-50 shrink-0"
                                    >
                                        Cari
                                    </Button>
                                    {hasActiveFilter && (
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            size="md"
                                            onClick={handleResetFilter}
                                            className="h-10 px-3 text-xs font-semibold text-gray-500 hover:text-gray-700 border-gray-200 hover:bg-gray-50 shrink-0"
                                            title="Reset Filter"
                                        >
                                            Reset
                                        </Button>
                                    )}
                                </div>
                            </form>

                            <div className="flex items-center gap-2 shrink-0 pt-2 xl:pt-0 border-t border-gray-100 xl:border-t-0">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="md"
                                    onClick={() => {
                                        setNewCategoryName('');
                                        setCategoryModalOpen(true);
                                    }}
                                    className="h-10 px-3.5 text-xs font-semibold w-full sm:w-auto rounded-lg border-purple-200 bg-purple-50/60 hover:bg-purple-100/70 text-purple-700 transition-colors"
                                    leftIcon={
                                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                        </svg>
                                    }
                                >
                                    + Kategori Baru
                                </Button>
                                <Button
                                    type="button"
                                    variant="primary"
                                    size="md"
                                    onClick={openCreateModal}
                                    className="h-10 px-4 text-xs font-semibold w-full sm:w-auto rounded-lg bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white shadow-xs transition-colors"
                                    leftIcon={
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                                        </svg>
                                    }
                                >
                                    Tulis Artikel Baru
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto min-h-[425px]">
                        <table className="w-full text-left text-xs border-collapse border border-gray-200">
                            <thead>
                                <tr className="bg-gray-100/90 border-b border-gray-200 text-[11px] font-bold uppercase tracking-wider text-gray-700">
                                    <th className="py-3 px-3.5 border-r border-gray-200 text-center font-bold w-12 shrink-0">No</th>
                                    <th className="py-3 px-3.5 border-r border-gray-200 text-center font-bold w-28 shrink-0">Sampul</th>
                                    <th className="py-3 px-3.5 border-r border-gray-200 text-center font-bold">Judul Artikel</th>
                                    <th className="py-3 px-3.5 border-r border-gray-200 text-center font-bold">Kategori</th>
                                    <th className="py-3 px-3.5 border-r border-gray-200 text-center font-bold">Penulis / Author</th>
                                    <th className="py-3 px-3.5 border-r border-gray-200 text-center font-bold">Status Tayang</th>
                                    <th className="py-3 px-3.5 border-r border-gray-200 text-center font-bold">Tanggal Terbit</th>
                                    <th className="py-3 px-3.5 text-center font-bold w-28 shrink-0">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {articles.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-4 py-16 text-center">
                                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400 mb-3">
                                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                                                    />
                                                </svg>
                                            </div>
                                            <h4 className="text-sm font-semibold text-gray-700">Tidak ada artikel atau materi edukasi</h4>
                                            <p className="mt-1 text-xs text-gray-400">
                                                {hasActiveFilter
                                                    ? 'Coba sesuaikan kata kunci pencarian atau atur ulang filter kategori, penulis, dan status Anda.'
                                                    : 'Belum ada naskah berita atau artikel edukasi yang diterbitkan.'}
                                            </p>
                                        </td>
                                    </tr>
                                ) : (
                                    <>
                                        {articles.data.map((item, index) => (
                                            <tr
                                                key={item.id}
                                                className="odd:bg-white even:bg-gray-50/70 hover:bg-purple-50/40 transition-colors h-[76px]"
                                            >
                                                <td className="py-3 px-3.5 border-r border-gray-200 text-center font-medium text-gray-600">
                                                    {articles.from ? articles.from + index : index + 1}
                                                </td>

                                                <td className="py-2.5 px-3 border-r border-gray-200 text-center">
                                                    <div className="mx-auto relative h-12 w-20 overflow-hidden rounded-lg border border-purple-100 bg-purple-50/50 shadow-2xs">
                                                        {item.gambar ? (
                                                            <img
                                                                src={item.gambar}
                                                                alt={item.judul}
                                                                className="h-full w-full object-cover object-center transition-transform duration-300 hover:scale-105"
                                                                onError={(e) => {
                                                                    (e.target as HTMLElement).style.display = 'none';
                                                                }}
                                                            />
                                                        ) : (
                                                            <div className="flex h-full w-full flex-col items-center justify-center text-purple-300">
                                                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        strokeWidth="1.5"
                                                                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                                    />
                                                                </svg>
                                                                <span className="text-[8.5px] font-semibold">No Cover</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>

                                                <td className="py-3 px-3.5 border-r border-gray-200 max-w-md">
                                                    <span className="font-bold text-xs sm:text-[13px] text-gray-900 block leading-snug break-words">
                                                        {item.judul}
                                                    </span>
                                                </td>

                                                <td className="py-3 px-3.5 border-r border-gray-200">
                                                    <span className="text-xs font-medium text-gray-800">
                                                        {item.kategori_name}
                                                    </span>
                                                </td>

                                                <td className="py-3 px-3.5 border-r border-gray-200 text-xs font-semibold text-gray-700 text-center">
                                                    {item.author_name}
                                                </td>

                                                <td className="py-3 px-3.5 border-r border-gray-200 text-center">
                                                    {item.status === 'Published' ? (
                                                        <span className="text-xs font-semibold text-emerald-600 ">
                                                            Published
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs font-medium text-gray-400">
                                                            Draft
                                                        </span>
                                                    )}
                                                </td>

                                                <td className="py-3 px-3.5 border-r border-gray-200 text-xs text-gray-600 font-medium whitespace-nowrap text-center">
                                                    {item.tgl_terbit || '-'}
                                                </td>

                                                <td className="py-3 px-3.5 text-center">
                                                    <div className="flex items-center justify-center gap-1.5">
                                                        <button
                                                            type="button"
                                                            onClick={() => openEditModal(item)}
                                                            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 border border-gray-200 hover:border-purple-300 hover:bg-purple-50 hover:text-purple-700 transition-all focus:outline-none"
                                                            title="Edit Artikel"
                                                        >
                                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth="2"
                                                                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                                                                />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => confirmDelete(item)}
                                                            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 border border-gray-200 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 transition-all focus:outline-none"
                                                            title="Hapus Artikel"
                                                        >
                                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth="2"
                                                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                                />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {articles.data.length > 0 &&
                                            articles.data.length < 5 &&
                                            Array.from({ length: 5 - articles.data.length }).map((_, idx) => (
                                                <tr
                                                    key={`empty-${idx}`}
                                                    aria-hidden="true"
                                                    className="odd:bg-white even:bg-gray-50/70 h-[76px]"
                                                >
                                                    <td className="py-3 px-3.5 border-r border-gray-200 text-center">&nbsp;</td>
                                                    <td className="py-3 px-3.5 border-r border-gray-200">&nbsp;</td>
                                                    <td className="py-3 px-3.5 border-r border-gray-200">&nbsp;</td>
                                                    <td className="py-3 px-3.5 border-r border-gray-200">&nbsp;</td>
                                                    <td className="py-3 px-3.5 border-r border-gray-200">&nbsp;</td>
                                                    <td className="py-3 px-3.5 border-r border-gray-200">&nbsp;</td>
                                                    <td className="py-3 px-3.5 border-r border-gray-200">&nbsp;</td>
                                                    <td className="py-3 px-3.5 text-center">&nbsp;</td>
                                                </tr>
                                            ))}
                                    </>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex flex-col gap-3 border-t border-gray-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between bg-gray-50/30">
                        <p className="text-xs text-gray-500 font-medium">
                            Menampilkan{' '}
                            <span className="font-bold text-gray-800">{articles.from || 0}</span>{' '}
                            hingga{' '}
                            <span className="font-bold text-gray-800">{articles.to || 0}</span>{' '}
                            dari total{' '}
                            <span className="font-bold text-gray-800">{articles.total}</span> artikel edukasi.
                        </p>
                        <Pagination
                            links={articles.links}
                            currentPage={articles.current_page}
                            totalPages={articles.last_page}
                        />
                    </div>
                </div>
            </div>

            <Modal
                isOpen={formModalOpen && !deleteModalOpen}
                onClose={() => {
                    if (isSubmitting) return;
                    if (saveConfirmModalOpen) {
                        setSaveConfirmModalOpen(false);
                    } else {
                        closeFormModal();
                    }
                }}
                title={
                    saveConfirmModalOpen
                        ? editingItem
                            ? 'Konfirmasi Simpan Perubahan'
                            : 'Konfirmasi Terbitkan Artikel'
                        : editingItem
                          ? 'Edit Artikel Edukasi'
                          : 'Tulis Artikel & Edukasi Baru'
                }
                description={
                    saveConfirmModalOpen
                        ? undefined
                        : editingItem
                          ? 'Perbarui konten edukasi kesehatan hewan dan status publikasi di landing page.'
                          : 'Lengkapi naskah artikel baru seputar pencegahan rabies dan perawatan hewan puskeswan.'
                }
                size={saveConfirmModalOpen ? 'sm' : 'xl'}
                containerClassName="lg:overflow-hidden"
                footer={
                    saveConfirmModalOpen ? (
                        <div className="flex w-full justify-end gap-2">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => setSaveConfirmModalOpen(false)}
                                disabled={isSubmitting}
                                className="h-8 sm:h-9 px-3 sm:px-4 text-[11px] sm:text-xs font-semibold rounded-lg"
                            >
                                Periksa Kembali
                            </Button>
                            <Button
                                type="button"
                                variant="primary"
                                onClick={executeSubmitForm}
                                isLoading={isSubmitting}
                                disabled={isSubmitting}
                                className="h-8 sm:h-9 px-3 sm:px-4 text-[11px] sm:text-xs font-semibold rounded-lg bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {editingItem ? 'Ya, Simpan Perubahan' : 'Ya, Terbitkan Artikel'}
                            </Button>
                        </div>
                    ) : (
                        <div className="flex w-full justify-end gap-2">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={closeFormModal}
                                disabled={isSubmitting}
                                className="px-3 sm:px-4 h-8 sm:h-9 text-[11px] sm:text-xs font-semibold rounded-lg"
                            >
                                Batalkan
                            </Button>
                            <Button
                                type="button"
                                variant="primary"
                                onClick={() => handleRequestSave()}
                                isLoading={isSubmitting}
                                disabled={isSubmitting}
                                className="px-4 sm:px-5 h-8 sm:h-9 text-[11px] sm:text-xs font-semibold rounded-lg bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white transition-colors shadow-xs"
                            >
                                {editingItem ? 'Simpan Perubahan' : 'Terbitkan Artikel'}
                            </Button>
                        </div>
                    )
                }
            >
                {saveConfirmModalOpen ? (
                    /* TAMPILAN VIEW-SWAP KONFIRMASI SIMPAN */
                    <div className="p-1 space-y-2.5 sm:space-y-3">
                        <div className="flex gap-2.5 sm:gap-3">
                            <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
                                <svg className="h-4.5 w-4.5 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-[11px] sm:text-xs leading-relaxed text-gray-650 font-medium">
                                    {editingItem
                                        ? 'Pastikan rincian perubahan artikel berikut sudah benar sebelum disimpan ke sistem:'
                                        : 'Pastikan naskah artikel baru berikut sudah benar sebelum diterbitkan ke publik:'}
                                </p>
                                <div className="mt-2 rounded-lg border border-gray-100 bg-gray-50/70 p-2.5 space-y-1.5 text-[11px] sm:text-xs">
                                    {imagePreview && (
                                        <div className="flex items-center gap-2.5 pb-2 border-b border-gray-200/50">
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                className="h-12 w-16 rounded-lg object-cover object-center border border-purple-200"
                                            />
                                            <span className="text-[10.5px] text-purple-700 font-semibold">
                                                {imageFile ? 'Gambar baru akan diunggah' : 'Gambar sampul terpasang'}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-start">
                                        <span className="text-gray-500 font-medium shrink-0 mr-2">Judul:</span>
                                        <span className="font-bold text-gray-900 text-right line-clamp-2">
                                            {data.judul}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500 font-medium">Kategori:</span>
                                        <span className="font-semibold text-purple-700">
                                            {categories.find((c) => Number(c.id) === Number(data.id_kategori))?.nama_kategori || '-'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500 font-medium">Penulis:</span>
                                        <span className="font-medium text-gray-800">{data.author_name}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500 font-medium">Status Tayang:</span>
                                        <span className={`font-semibold ${data.status === 'Published' ? 'text-emerald-700' : 'text-slate-600'}`}>
                                            {data.status}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-start pt-1 border-t border-gray-200/50">
                                        <span className="text-gray-500 font-medium shrink-0 mr-2">Ringkasan:</span>
                                        <span className="text-gray-600 text-right line-clamp-2 italic text-[10.5px]">
                                            "{data.ringkasan}"
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* TAMPILAN FORMULIR ISIAN 2 KOLOM DINAMIS TANPA SCROLLBAR DI DESKTOP */
                    <form noValidate onSubmit={handleRequestSave} className="space-y-3">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                            <div className="lg:col-span-5 space-y-2.5">
                                <div className="space-y-1">
                                    <label className="text-[10.5px] sm:text-xs font-bold text-gray-750 block">
                                        Judul Artikel <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.judul}
                                        onChange={(e) => setData('judul', e.target.value)}
                                        placeholder="Contoh: Mengenal Gejala Rabies pada Kucing & Anjing"
                                        className="h-9 w-full rounded-lg border border-gray-300 bg-white px-2.5 text-xs text-gray-800 placeholder:text-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all font-medium"
                                    />
                                    {errors.judul && (
                                        <p className="text-[10px] font-medium text-rose-600 leading-tight">
                                            {errors.judul}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-1">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[10.5px] sm:text-xs font-bold text-gray-750">
                                            Kategori Edukasi <span className="text-rose-500">*</span>
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => setShowInlineCategoryForm((prev) => !prev)}
                                            className="inline-flex items-center gap-1 text-[10.5px] font-bold text-purple-600 hover:text-purple-800 transition-colors"
                                        >
                                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={showInlineCategoryForm ? 'M6 18L18 6M6 6l12 12' : 'M12 4v16m8-8H4'} />
                                            </svg>
                                            {showInlineCategoryForm ? 'Tutup Input' : 'Tambah Kategori'}
                                        </button>
                                    </div>

                                    {showInlineCategoryForm ? (
                                        <div className="flex items-center gap-1.5 p-1.5 rounded-lg border border-purple-200 bg-purple-50/50">
                                            <input
                                                type="text"
                                                value={newCategoryName}
                                                onChange={(e) => setNewCategoryName(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        handleSaveNewCategory();
                                                    }
                                                }}
                                                placeholder="Ketik nama kategori baru..."
                                                className="h-8 flex-1 rounded-md border border-purple-300 bg-white px-2.5 text-xs text-gray-800 placeholder:text-gray-400 focus:border-purple-600 focus:outline-none"
                                            />
                                            <Button
                                                type="button"
                                                variant="primary"
                                                onClick={() => handleSaveNewCategory()}
                                                isLoading={isSavingCategory}
                                                disabled={isSavingCategory}
                                                className="h-8 px-3 text-[11px] font-semibold rounded-md bg-purple-600 hover:bg-purple-700 text-white shrink-0"
                                            >
                                                Simpan
                                            </Button>
                                        </div>
                                    ) : (
                                        <Select
                                            size="sm"
                                            value={data.id_kategori}
                                            onChange={(val) => setData('id_kategori', Number(val))}
                                            error={!!errors.id_kategori}
                                            showCheckmark={false}
                                            options={categoryOptions}
                                            className="[&_[id]]:h-9 [&_[id]]:rounded-lg"
                                        />
                                    )}
                                    {errors.id_kategori && (
                                        <p className="text-[10px] font-medium text-rose-600 leading-tight">
                                            {errors.id_kategori}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10.5px] sm:text-xs font-bold text-gray-750 block">
                                        Penulis / Tim Medis <span className="text-rose-500">*</span>
                                    </label>
                                    <Select
                                        size="sm"
                                        value={data.author_name}
                                        onChange={(val) => setData('author_name', String(val))}
                                        error={!!errors.author_name}
                                        showCheckmark={false}
                                        options={selectAuthorOptions}
                                        placeholder="Pilih Penulis / Tim Medis..."
                                        className="[&_[id]]:h-9 [&_[id]]:rounded-lg"
                                    />
                                    {errors.author_name && (
                                        <p className="text-[10px] font-medium text-rose-600 leading-tight">
                                            {errors.author_name}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10.5px] sm:text-xs font-bold text-gray-750 block">
                                        Status Publikasi <span className="text-rose-500">*</span>
                                    </label>
                                    <Select
                                        size="sm"
                                        value={data.status}
                                        onChange={(val) => setData('status', String(val))}
                                        error={!!errors.status}
                                        showCheckmark={false}
                                        options={STATUS_OPTIONS}
                                        className="[&_[id]]:h-9 [&_[id]]:rounded-lg"
                                    />
                                    {errors.status && (
                                        <p className="text-[10px] font-medium text-rose-600 leading-tight">
                                            {errors.status}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10.5px] sm:text-xs font-bold text-gray-750 block">
                                        Gambar Sampul / Banner <span className="text-gray-400 font-normal">(Opsional, Maks. 5MB)</span>
                                    </label>
                                    <div className="flex items-center gap-2.5 p-2 rounded-lg border border-dashed border-gray-300 bg-gray-50/50">
                                        <div className="relative h-12 w-18 shrink-0 overflow-hidden rounded-md border border-purple-200 bg-white shadow-2xs">
                                            {imagePreview && !removeImage ? (
                                                <img
                                                    src={imagePreview}
                                                    alt="Pratinjau Sampul"
                                                    className="h-full w-full object-cover object-center"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full flex-col items-center justify-center text-gray-400">
                                                    <svg className="h-4.5 w-4.5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    <span className="text-[8px] text-gray-400">No Cover</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0 space-y-1">
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                <input
                                                    ref={fileInputRef}
                                                    type="file"
                                                    accept="image/jpeg,image/png,image/webp"
                                                    onChange={handleImageChange}
                                                    className="hidden"
                                                    id="article-image-upload"
                                                />
                                                <label
                                                    htmlFor="article-image-upload"
                                                    className="cursor-pointer inline-flex items-center gap-1 h-7 px-2.5 rounded-md border border-gray-300 bg-white text-[10.5px] font-semibold text-gray-700 hover:bg-gray-50 hover:border-purple-400 transition-colors shadow-2xs"
                                                >
                                                    <svg className="h-3 w-3 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                                    </svg>
                                                    {imagePreview && !removeImage ? 'Ganti' : 'Pilih Gambar'}
                                                </label>

                                                {imagePreview && !removeImage && (
                                                    <button
                                                        type="button"
                                                        onClick={handleRemoveSelectedImage}
                                                        className="inline-flex items-center gap-1 h-7 px-2 rounded-md border border-rose-200 bg-rose-50 text-[10.5px] font-semibold text-rose-600 hover:bg-rose-100 transition-colors"
                                                    >
                                                        Hapus
                                                    </button>
                                                )}
                                            </div>
                                            <p className="text-[9.5px] text-gray-400 truncate">
                                                Format JPG, PNG, atau WEBP.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="lg:col-span-7 space-y-2.5">
                                <div className="space-y-1">
                                    <label className="text-[10.5px] sm:text-xs font-bold text-gray-750 block">
                                        Ringkasan Singkat (Lead Paragraph / Summary) <span className="text-rose-500">*</span>
                                    </label>
                                    <textarea
                                        rows={2}
                                        value={data.ringkasan}
                                        onChange={(e) => setData('ringkasan', e.target.value)}
                                        placeholder="Ringkasan 1-2 kalimat untuk pratinjau kartu artikel di halaman beranda..."
                                        className="w-full rounded-lg border border-gray-300 bg-white p-2.5 text-xs text-gray-800 placeholder:text-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all resize-none"
                                    />
                                    {errors.ringkasan && (
                                        <p className="text-[10px] font-medium text-rose-600 leading-tight">
                                            {errors.ringkasan}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10.5px] sm:text-xs font-bold text-gray-750 block">
                                        Isi Lengkap Artikel &amp; Edukasi <span className="text-rose-500">*</span>
                                    </label>
                                    <textarea
                                        rows={8}
                                        value={data.isi_berita}
                                        onChange={(e) => setData('isi_berita', e.target.value)}
                                        placeholder="Tuliskan naskah lengkap artikel, tips klinis, jadwal vaksinasi, atau protokol penanganan hewan di sini..."
                                        className="w-full rounded-lg border border-gray-300 bg-white p-2.5 text-xs text-gray-800 placeholder:text-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all leading-relaxed resize-none"
                                    />
                                    {errors.isi_berita && (
                                        <p className="text-[10px] font-medium text-rose-600 leading-tight">
                                            {errors.isi_berita}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </form>
                )}
            </Modal>

            <Modal
                isOpen={categoryModalOpen}
                onClose={() => {
                    if (isSavingCategory) return;
                    setCategoryModalOpen(false);
                }}
                title="Tambah Kategori Edukasi Baru"
                description="Kategori baru akan langsung tersimpan di database dan sinkron dengan pilihan kategori artikel."
                size="sm"
                footer={
                    <div className="flex w-full justify-end gap-2">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setCategoryModalOpen(false)}
                            disabled={isSavingCategory}
                            className="h-8 sm:h-9 px-3 sm:px-4 text-[11px] sm:text-xs font-semibold rounded-lg"
                        >
                            Batalkan
                        </Button>
                        <Button
                            type="button"
                            variant="primary"
                            onClick={() => handleSaveNewCategory()}
                            isLoading={isSavingCategory}
                            disabled={isSavingCategory}
                            className="h-8 sm:h-9 px-4 text-[11px] sm:text-xs font-semibold rounded-lg bg-purple-600 hover:bg-purple-700 text-white"
                        >
                            Simpan Kategori
                        </Button>
                    </div>
                }
            >
                <form onSubmit={handleSaveNewCategory} className="space-y-2">
                    <label className="text-xs font-bold text-gray-750 block">
                        Nama Kategori Edukasi <span className="text-rose-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="Contoh: Pencegahan Zoonosis & Sanitasi"
                        autoFocus
                        className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-xs sm:text-sm text-gray-800 placeholder:text-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
                    />
                </form>
            </Modal>

            <Modal
                isOpen={deleteModalOpen}
                onClose={() => {
                    if (isDeleting) return;
                    setDeleteModalOpen(false);
                }}
                title="Hapus Artikel Edukasi"
                size="sm"
                footer={
                    <div className="flex w-full justify-end gap-2">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setDeleteModalOpen(false)}
                            disabled={isDeleting}
                            className="h-8 sm:h-9 px-3 sm:px-4 text-[11px] sm:text-xs font-semibold rounded-lg"
                        >
                            Batalkan
                        </Button>
                        <Button
                            type="button"
                            variant="danger"
                            onClick={handleDelete}
                            isLoading={isDeleting}
                            disabled={isDeleting}
                            className="h-8 sm:h-9 px-3 sm:px-4 text-[11px] sm:text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-700 text-white disabled:opacity-50"
                        >
                            Ya, Hapus Artikel
                        </Button>
                    </div>
                }
            >
                <div className="p-1 space-y-2.5">
                    <div className="flex gap-2.5 sm:gap-3">
                        <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600 border border-rose-100">
                            <svg className="h-4.5 w-4.5 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                />
                            </svg>
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-[11px] sm:text-xs leading-relaxed text-gray-650 font-medium">
                                Apakah Anda yakin ingin menghapus artikel publikasi berikut dari portal landing page?
                            </p>
                            <div className="mt-2 rounded-lg border border-rose-100 bg-rose-50/40 p-2.5 space-y-1 text-[11px] sm:text-xs">
                                <div className="font-bold text-gray-900 line-clamp-2">
                                    "{itemToDelete?.judul}"
                                </div>
                                <div className="text-gray-500 text-[10.5px]">
                                    Kategori: <span className="font-semibold text-gray-700">{itemToDelete?.kategori_name}</span> &bull; Penulis: {itemToDelete?.author_name}
                                </div>
                            </div>
                            <p className="mt-2 text-[10px] text-gray-400 leading-tight">
                                Artikel yang dihapus tidak akan lagi tampil di halaman edukasi publik Puskeswan.
                            </p>
                        </div>
                    </div>
                </div>
            </Modal>
        </DashboardLayout>
    );
}
