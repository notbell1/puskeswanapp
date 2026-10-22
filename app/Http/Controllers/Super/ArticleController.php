<?php

namespace App\Http\Controllers\Super;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\Category;
use App\Models\Staff;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class ArticleController extends Controller
{
    /**
     * Tampilkan daftar artikel publikasi edukasi landing page.
     */
    public function index(Request $request): Response
    {
        $search = trim((string) $request->input('search', ''));
        $categoryFilter = $request->input('kategori');
        $statusFilter = $request->input('status');
        $authorFilter = trim((string) $request->input('author', ''));

        $articles = Article::with(['kategori', 'penulis'])
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('judul', 'like', "%{$search}%")
                        ->orWhere('author_name', 'like', "%{$search}%")
                        ->orWhere('ringkasan', 'like', "%{$search}%");
                });
            })
            ->when($categoryFilter, function ($query, $categoryFilter) {
                $query->where('id_kategori', $categoryFilter);
            })
            ->when($statusFilter, function ($query, $statusFilter) {
                $query->where('status', $statusFilter);
            })
            ->when($authorFilter, function ($query, $authorFilter) {
                $query->where('author_name', $authorFilter);
            })
            ->orderBy('id', 'desc')
            ->paginate(5)
            ->withQueryString()
            ->through(fn ($art) => [
                'id' => $art->id,
                'judul' => $art->judul,
                'slug' => $art->slug,
                'author_name' => $art->author_name ?? $art->penulis?->name ?? 'Admin',
                'kategori_name' => $art->kategori?->nama_kategori ?? 'Umum',
                'id_kategori' => $art->id_kategori,
                'ringkasan' => $art->ringkasan,
                'isi_berita' => $art->isi_berita,
                'gambar' => $art->gambar,
                'tgl_terbit' => $art->tgl_terbit ? $art->tgl_terbit->format('d/m/Y') : '-',
                'status' => $art->status ?? 'Draft',
            ]);

        $categories = Category::orderBy('id')->get(['id', 'nama_kategori', 'slug']);
        $staffList = Staff::orderBy('nama_staf')->get(['id', 'nama_staf', 'jabatan']);
        $userList = User::with('role')->orderBy('name')->get(['id', 'name', 'id_role']);

        $authorOptions = [
            [
                'value' => 'Admin',
                'label' => 'Admin',
                'sublabel' => 'Default / Administrator',
            ],
        ];
        $seenAuthors = ['admin' => true];

        foreach ($userList as $u) {
            $name = trim((string) $u->name);
            $key = strtolower($name);
            if ($name !== '' && ! isset($seenAuthors[$key])) {
                $seenAuthors[$key] = true;
                $roleLabel = str_replace('_', ' ', (string) ($u->role?->nama_role ?? 'PENGGUNA'));
                $authorOptions[] = [
                    'value' => $name,
                    'label' => $name,
                    'sublabel' => "Pengguna ({$roleLabel})",
                ];
            }
        }

        foreach ($staffList as $st) {
            $name = trim((string) $st->nama_staf);
            $key = strtolower($name);
            if ($name !== '' && ! isset($seenAuthors[$key])) {
                $seenAuthors[$key] = true;
                $jabatanLabel = trim((string) ($st->jabatan ?: 'Tenaga Medis Puskeswan'));
                $authorOptions[] = [
                    'value' => $name,
                    'label' => $name,
                    'sublabel' => "Staff • {$jabatanLabel}",
                ];
            }
        }

        $existingAuthors = Article::whereNotNull('author_name')
            ->distinct()
            ->pluck('author_name');

        foreach ($existingAuthors as $existingAuthor) {
            $name = trim((string) $existingAuthor);
            $key = strtolower($name);
            if ($name !== '' && ! isset($seenAuthors[$key])) {
                $seenAuthors[$key] = true;
                $authorOptions[] = [
                    'value' => $name,
                    'label' => $name,
                    'sublabel' => 'Penulis Artikel',
                ];
            }
        }

        return Inertia::render('super/artikel/index', [
            'articles' => $articles,
            'categories' => $categories,
            'staffList' => $staffList,
            'authorOptions' => $authorOptions,
            'filters' => [
                'search' => $search,
                'kategori' => $categoryFilter,
                'status' => $statusFilter,
                'author' => $authorFilter,
            ],
        ]);
    }

    /**
     * Tambahkan kategori edukasi baru ke database.
     */
    public function storeCategory(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'nama_kategori' => ['required', 'string', 'max:100'],
        ], [
            'nama_kategori.required' => 'Nama kategori edukasi wajib diisi.',
            'nama_kategori.max' => 'Nama kategori maksimal 100 karakter.',
        ]);

        $cleanName = trim(strip_tags($validated['nama_kategori']));
        if ($cleanName === '') {
            throw ValidationException::withMessages([
                'nama_kategori' => 'Nama kategori edukasi tidak boleh kosong.',
            ]);
        }

        $exists = Category::whereRaw('LOWER(nama_kategori) = ?', [strtolower($cleanName)])->exists();
        if ($exists) {
            throw ValidationException::withMessages([
                'nama_kategori' => "Kategori '{$cleanName}' sudah terdaftar di database.",
            ]);
        }

        $baseSlug = Str::slug($cleanName) ?: 'kategori';
        $slug = $baseSlug;
        $counter = 1;
        while (Category::where('slug', $slug)->exists()) {
            $slug = "{$baseSlug}-{$counter}";
            $counter++;
        }

        Category::create([
            'nama_kategori' => $cleanName,
            'slug' => $slug,
        ]);

        return back()->with('success', "Kategori '{$cleanName}' berhasil ditambahkan!");
    }

    /**
     * Simpan artikel baru beserta gambar sampul.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'judul' => ['required', 'string', 'max:255'],
            'id_kategori' => ['required', 'exists:categories,id'],
            'author_name' => ['required', 'string', 'max:255'],
            'ringkasan' => ['required', 'string', 'max:500'],
            'isi_berita' => ['required', 'string'],
            'status' => ['required', 'string', 'in:Draft,Published'],
            'gambar' => [
                'nullable',
                'file',
                'image',
                'mimes:jpeg,png,jpg,webp',
                'mimetypes:image/jpeg,image/png,image/webp',
                'max:5120',
            ],
        ]);

        $baseSlug = Str::slug($validated['judul']);
        $slug = $baseSlug;
        $counter = 1;
        while (Article::where('slug', $slug)->exists()) {
            $slug = "{$baseSlug}-{$counter}";
            $counter++;
        }

        $imagePath = $this->handleArticleImageUpload($request);
        $cleanAuthor = strip_tags($validated['author_name']);
        $matchedStaffId = Staff::where('nama_staf', $cleanAuthor)->value('id')
            ?? User::where('name', $cleanAuthor)->value('id_staf');

        Article::create([
            'judul' => strip_tags($validated['judul']),
            'slug' => $slug,
            'id_kategori' => $validated['id_kategori'],
            'id_staf' => $matchedStaffId,
            'author_name' => $cleanAuthor,
            'ringkasan' => strip_tags($validated['ringkasan']),
            'isi_berita' => $validated['isi_berita'],
            'gambar' => $imagePath,
            'status' => $validated['status'],
            'tgl_terbit' => $validated['status'] === 'Published' ? now() : null,
            'id_penulis' => Auth::id(),
        ]);

        return back()->with('success', "Artikel '{$validated['judul']}' berhasil diterbitkan!");
    }

    /**
     * Perbarui artikel beserta gambar sampul.
     */
    public function update(Request $request, Article $article): RedirectResponse
    {
        $validated = $request->validate([
            'judul' => ['required', 'string', 'max:255'],
            'id_kategori' => ['required', 'exists:categories,id'],
            'author_name' => ['required', 'string', 'max:255'],
            'ringkasan' => ['required', 'string', 'max:500'],
            'isi_berita' => ['required', 'string'],
            'status' => ['required', 'string', 'in:Draft,Published'],
            'gambar' => [
                'nullable',
                'file',
                'image',
                'mimes:jpeg,png,jpg,webp',
                'mimetypes:image/jpeg,image/png,image/webp',
                'max:5120',
            ],
            'hapus_gambar' => ['nullable', 'boolean'],
        ]);

        $imagePath = $this->handleArticleImageUpload(
            $request,
            $article->gambar,
            $request->boolean('hapus_gambar')
        );

        $cleanJudul = strip_tags($validated['judul']);
        $baseSlug = Str::slug($cleanJudul);
        $slug = $baseSlug;
        $counter = 1;
        while (Article::where('slug', $slug)->where('id', '!=', $article->id)->exists()) {
            $slug = "{$baseSlug}-{$counter}";
            $counter++;
        }

        $cleanAuthor = strip_tags($validated['author_name']);
        $matchedStaffId = Staff::where('nama_staf', $cleanAuthor)->value('id')
            ?? User::where('name', $cleanAuthor)->value('id_staf');

        $updateData = [
            'judul' => $cleanJudul,
            'slug' => $slug,
            'id_kategori' => $validated['id_kategori'],
            'id_staf' => $matchedStaffId,
            'author_name' => $cleanAuthor,
            'ringkasan' => strip_tags($validated['ringkasan']),
            'isi_berita' => $validated['isi_berita'],
            'status' => $validated['status'],
            'gambar' => $imagePath,
        ];

        if ($validated['status'] === 'Published' && ! $article->tgl_terbit) {
            $updateData['tgl_terbit'] = now();
        }

        $article->update($updateData);

        return back()->with('success', "Artikel '{$article->judul}' berhasil diperbarui!");
    }

    /**
     * Hapus artikel beserta berkas gambarnya.
     */
    public function destroy(Article $article): RedirectResponse
    {
        $title = $article->judul;

        if ($article->gambar) {
            $oldFile = str_replace('/storage/', '', $article->gambar);
            if (Storage::disk('public')->exists($oldFile)) {
                Storage::disk('public')->delete($oldFile);
            }
        }

        $article->delete();

        return back()->with('success', "Artikel '{$title}' berhasil dihapus!");
    }

    /**
     * Upload dan validasi berkas gambar artikel secara aman.
     */
    protected function handleArticleImageUpload(Request $request, ?string $currentImagePath = null, bool $shouldDelete = false): ?string
    {
        if ($shouldDelete && $currentImagePath) {
            $oldFile = str_replace('/storage/', '', $currentImagePath);
            if (Storage::disk('public')->exists($oldFile)) {
                Storage::disk('public')->delete($oldFile);
            }
            $currentImagePath = null;
        }

        if (! $request->hasFile('gambar')) {
            return $currentImagePath;
        }

        $file = $request->file('gambar');
        if (! $file || ! $file->isValid()) {
            return $currentImagePath;
        }

        $realMime = $file->getMimeType();
        $allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];

        if (! $realMime || ! in_array($realMime, $allowedMimes, true)) {
            throw ValidationException::withMessages([
                'gambar' => 'Keamanan: Berkas yang diunggah terdeteksi bukan gambar asli (MIME: '.htmlspecialchars((string) $realMime).').',
            ]);
        }

        $imageInfo = @getimagesize($file->getRealPath());
        if ($imageInfo === false) {
            throw ValidationException::withMessages([
                'gambar' => 'Keamanan: Struktur berkas bukan format gambar asli yang dapat dirender.',
            ]);
        }

        $allowedTypes = [IMAGETYPE_JPEG, IMAGETYPE_PNG, IMAGETYPE_WEBP];
        if (! in_array($imageInfo[2], $allowedTypes, true)) {
            throw ValidationException::withMessages([
                'gambar' => 'Keamanan: Format binary berkas gambar tidak didukung.',
            ]);
        }

        $safeExtension = match ($imageInfo[2]) {
            IMAGETYPE_JPEG => 'jpg',
            IMAGETYPE_PNG => 'png',
            IMAGETYPE_WEBP => 'webp',
            default => 'jpg',
        };

        $safeFilename = Str::random(40).'.'.$safeExtension;
        $storedPath = $file->storeAs('articles', $safeFilename, 'public');

        if ($currentImagePath) {
            $oldFile = str_replace('/storage/', '', $currentImagePath);
            if (Storage::disk('public')->exists($oldFile)) {
                Storage::disk('public')->delete($oldFile);
            }
        }

        return '/storage/'.$storedPath;
    }
}
