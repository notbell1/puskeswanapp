<?php

namespace App\Http\Controllers;

use App\Models\Article;
use App\Models\Category;
use App\Models\Owner;
use App\Models\Staff;
use App\Models\User;
use App\Models\Visit;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function index(Request $request): Response
    {
        $allStaff = Staff::where('tampil_publik', true)
            ->orderByRaw('CASE WHEN urutan IS NULL THEN 999999 ELSE urutan END ASC')
            ->orderBy('id', 'asc')
            ->get(['id', 'nama_staf', 'jabatan', 'nip_strv', 'urutan', 'tampil_publik', 'foto']);
        $allUsers = User::with('staf')->get(['id', 'id_staf', 'name', 'foto']);

        $staffMembers = $allStaff->map(function (Staff $staff) use ($allUsers) {
            $matchedUser = $allUsers->first(
                fn (User $u) => $u->id_staf === $staff->id || strcasecmp(trim($u->name), trim($staff->nama_staf)) === 0
            );

            return [
                'id' => $staff->id,
                'nama_staf' => $staff->nama_staf,
                'jabatan' => $staff->jabatan,
                'nip_strv' => $staff->nip_strv,
                'foto' => User::resolvePhotoUrl($staff->foto ?: $matchedUser?->foto),
            ];
        });

        $articles = Article::with(['kategori', 'staf', 'penulis.staf'])
            ->where('status', 'Published')
            ->latest('tgl_terbit')
            ->orderBy('id', 'desc')
            ->get()
            ->map(fn (Article $art) => $this->formatArticleForPublic($art, $allStaff, $allUsers));

        $captcha = $this->createCaptcha();
        $request->session()->put('medical_record_captcha', $captcha['code']);

        return Inertia::render('welcome', [
            'staffMembers' => $staffMembers,
            'articles' => $articles,
            'initialCaptcha' => $captcha['svg'],
        ]);
    }

    public function showArticle(Request $request, string $slug): Response
    {
        $normalizedSlug = Str::slug($slug);

        $allStaff = Staff::all(['id', 'nama_staf', 'jabatan', 'nip_strv', 'foto']);
        $allUsers = User::with('staf')->get(['id', 'id_staf', 'name', 'foto']);

        $allPublished = Article::with(['kategori', 'staf', 'penulis.staf'])
            ->where('status', 'Published')
            ->latest('tgl_terbit')
            ->get();

        $matchedArticle = $allPublished->first(function (Article $art) use ($slug, $normalizedSlug) {
            return $art->slug === $slug
                || $art->slug === $normalizedSlug
                || Str::slug($art->judul) === $normalizedSlug;
        });

        if (! $matchedArticle) {
            abort(404, 'Berita atau artikel edukasi yang Anda cari tidak ditemukan.');
        }

        $articleData = $this->formatArticleForPublic($matchedArticle, $allStaff, $allUsers);

        $relatedArticles = $allPublished
            ->filter(fn (Article $art) => $art->id !== $matchedArticle->id)
            ->take(4)
            ->values()
            ->map(fn (Article $art) => $this->formatArticleForPublic($art, $allStaff, $allUsers));

        return Inertia::render('berita/show', [
            'article' => $articleData,
            'relatedArticles' => $relatedArticles,
        ]);
    }

    public function articlesByAuthor(Request $request, string $author): Response
    {
        $decodedAuthor = trim(urldecode($author));
        $normalizedAuthor = Str::slug($decodedAuthor);

        $allStaff = Staff::all(['id', 'nama_staf', 'jabatan', 'nip_strv', 'foto']);
        $allUsers = User::with('staf')->get(['id', 'id_staf', 'name', 'foto']);

        $allPublished = Article::with(['kategori', 'staf', 'penulis.staf'])
            ->where('status', 'Published')
            ->latest('tgl_terbit')
            ->get()
            ->map(fn (Article $art) => $this->formatArticleForPublic($art, $allStaff, $allUsers));

        $filteredArticles = $allPublished->filter(function (array $item) use ($decodedAuthor, $normalizedAuthor) {
            return $item['author_slug'] === $normalizedAuthor
                || Str::slug($item['author_name']) === $normalizedAuthor
                || strcasecmp($item['author_name'], $decodedAuthor) === 0;
        })->values();

        $matchedStaff = $allStaff->first(function (Staff $s) use ($decodedAuthor, $normalizedAuthor) {
            return Str::slug($s->nama_staf) === $normalizedAuthor
                || strcasecmp(trim($s->nama_staf), $decodedAuthor) === 0;
        });

        $matchedUser = $allUsers->first(function (User $u) use ($decodedAuthor, $normalizedAuthor, $matchedStaff) {
            return ($matchedStaff && $u->id_staf === $matchedStaff->id)
                || Str::slug($u->name) === $normalizedAuthor
                || strcasecmp(trim($u->name), $decodedAuthor) === 0;
        });

        $isDefaultAdminAuthor = $normalizedAuthor === 'admin' || strcasecmp($decodedAuthor, 'admin') === 0;
        if (! $matchedStaff && ! $matchedUser && $filteredArticles->isEmpty() && ! $isDefaultAdminAuthor) {
            abort(404, 'Penulis atau tim medis yang Anda cari tidak ditemukan.');
        }

        $firstArticle = $filteredArticles->first();
        $displayName = $matchedStaff?->nama_staf
            ?? $firstArticle['author_name']
            ?? $matchedUser?->name
            ?? ucwords(str_replace('-', ' ', $decodedAuthor));

        $authorFoto = User::resolvePhotoUrl($matchedStaff?->foto ?: $matchedUser?->foto)
            ?? ($firstArticle['author_foto'] ?? null);

        $authorJabatan = $matchedStaff?->jabatan
            ?? ($firstArticle['author_jabatan'] ?? 'Tim Medis & Edukasi Puskeswan');

        $authorNip = $matchedStaff?->nip_strv ?? ($firstArticle['author_nip'] ?? null);

        $categories = Category::orderBy('nama_kategori')
            ->get(['id', 'nama_kategori', 'slug'])
            ->map(fn (Category $cat) => [
                'name' => $cat->nama_kategori,
                'slug' => Str::slug($cat->nama_kategori),
            ]);

        return Inertia::render('berita/archive', [
            'filterType' => 'author',
            'filterTitle' => $displayName,
            'filterSlug' => $normalizedAuthor,
            'authorProfile' => [
                'name' => $displayName,
                'slug' => $normalizedAuthor,
                'foto' => $authorFoto,
                'jabatan' => $authorJabatan,
                'nip' => $authorNip,
            ],
            'articles' => $filteredArticles,
            'categories' => $categories,
        ]);
    }

    public function articlesByCategory(Request $request, string $kategori): Response
    {
        $decodedCategory = trim(urldecode($kategori));
        $normalizedCategory = Str::slug($decodedCategory);

        $allStaff = Staff::all(['id', 'nama_staf', 'jabatan', 'nip_strv', 'foto']);
        $allUsers = User::with('staf')->get(['id', 'id_staf', 'name', 'foto']);

        $allPublished = Article::with(['kategori', 'staf', 'penulis.staf'])
            ->where('status', 'Published')
            ->latest('tgl_terbit')
            ->get()
            ->map(fn (Article $art) => $this->formatArticleForPublic($art, $allStaff, $allUsers));

        $matchedCategoryModel = Category::all()->first(function (Category $cat) use ($decodedCategory, $normalizedCategory) {
            return $cat->slug === $normalizedCategory
                || Str::slug($cat->nama_kategori) === $normalizedCategory
                || strcasecmp(trim($cat->nama_kategori), $decodedCategory) === 0;
        });

        $filteredArticles = $allPublished->filter(function (array $item) use ($decodedCategory, $normalizedCategory, $matchedCategoryModel) {
            if ($matchedCategoryModel && strcasecmp($item['category'], $matchedCategoryModel->nama_kategori) === 0) {
                return true;
            }

            return $item['category_slug'] === $normalizedCategory
                || Str::slug($item['category']) === $normalizedCategory
                || strcasecmp($item['category'], $decodedCategory) === 0;
        })->values();

        if (! $matchedCategoryModel && $filteredArticles->isEmpty()) {
            abort(404, 'Kategori berita atau edukasi yang Anda cari tidak ditemukan.');
        }

        $firstArticle = $filteredArticles->first();
        $displayCategory = $matchedCategoryModel?->nama_kategori
            ?? $firstArticle['category']
            ?? ucwords(str_replace('-', ' ', $decodedCategory));

        $categories = Category::orderBy('nama_kategori')
            ->get(['id', 'nama_kategori', 'slug'])
            ->map(fn (Category $cat) => [
                'name' => $cat->nama_kategori,
                'slug' => Str::slug($cat->nama_kategori),
            ]);

        return Inertia::render('berita/archive', [
            'filterType' => 'category',
            'filterTitle' => $displayCategory,
            'filterSlug' => Str::slug($displayCategory),
            'authorProfile' => null,
            'articles' => $filteredArticles,
            'categories' => $categories,
        ]);
    }

    /**
     * @param  Collection<int, Staff>  $allStaff
     * @param  Collection<int, User>  $allUsers
     * @return array<string, mixed>
     */
    private function formatArticleForPublic(Article $art, Collection $allStaff, Collection $allUsers): array
    {
        $authorName = $art->author_name ?? $art->staf?->nama_staf ?? $art->penulis?->name ?? 'Tim Medis Puskeswan';

        $matchedStaff = $art->staf ?: $allStaff->first(function (Staff $s) use ($authorName) {
            return strcasecmp(trim($s->nama_staf), trim($authorName)) === 0
                || Str::slug($s->nama_staf) === Str::slug($authorName);
        });

        $matchedUser = $allUsers->first(function (User $u) use ($authorName, $matchedStaff) {
            return ($matchedStaff && $u->id_staf === $matchedStaff->id)
                || strcasecmp(trim($u->name), trim($authorName)) === 0
                || Str::slug($u->name) === Str::slug($authorName);
        });

        $rawFoto = $matchedStaff?->foto
            ?: $matchedUser?->foto
            ?: $art->penulis?->foto
            ?: $art->penulis?->staf?->foto;

        $categoryName = $art->kategori?->nama_kategori ?? 'Edukasi Kesehatan Hewan';

        return [
            'id' => $art->id,
            'judul' => $art->judul,
            'slug' => Str::slug($art->judul) ?: $art->slug,
            'author_name' => $authorName,
            'author_slug' => Str::slug($authorName),
            'author_foto' => User::resolvePhotoUrl($rawFoto),
            'author_jabatan' => $matchedStaff?->jabatan ?? 'Tenaga Medis Puskeswan',
            'author_nip' => $matchedStaff?->nip_strv ?? null,
            'category' => $categoryName,
            'category_slug' => Str::slug($categoryName),
            'ringkasan' => $art->ringkasan,
            'isi_berita' => $art->isi_berita,
            'gambar' => $art->gambar,
            'date' => $art->tgl_terbit ? $art->tgl_terbit->format('d M Y') : 'Terbaru',
            'readTime' => max(2, (int) ceil(str_word_count(strip_tags((string) $art->isi_berita)) / 150)).' menit baca',
        ];
    }

    public function generateCaptcha(Request $request): JsonResponse
    {
        $captcha = $this->createCaptcha();
        $request->session()->put('medical_record_captcha', $captcha['code']);

        return response()->json([
            'status' => 'success',
            'svg' => $captcha['svg'],
        ]);
    }

    public function searchMedicalRecords(Request $request): JsonResponse
    {
        $request->validate([
            'nik' => ['required', 'string', 'size:16', 'regex:/^[0-9]{16}$/'],
            'nama_lengkap' => ['required', 'string', 'min:2', 'max:100', 'regex:/^[a-zA-Z\s]+$/'],
            'captcha' => ['required', 'string', 'size:5', 'regex:/^[a-zA-Z0-9]{5}$/'],
        ], [
            'nik.regex' => 'Nomor NIK harus berupa 16 digit angka tanpa karakter lain.',
            'nik.size' => 'Nomor NIK harus terdiri dari tepat 16 digit angka.',
            'nama_lengkap.regex' => 'Nama lengkap hanya boleh mengandung huruf alfabet dan spasi.',
            'captcha.regex' => 'Format kode captcha anti-bot harus berupa 5 digit alfanumerik.',
            'captcha.size' => 'Kode captcha harus terdiri dari 5 karakter.',
        ]);

        $inputCaptcha = strtoupper(trim((string) $request->input('captcha')));
        $sessionCaptcha = strtoupper(trim((string) $request->session()->get('medical_record_captcha', '')));

        if (empty($sessionCaptcha) || $inputCaptcha !== $sessionCaptcha) {
            $newCaptcha = $this->createCaptcha();
            $request->session()->put('medical_record_captcha', $newCaptcha['code']);

            return response()->json([
                'status' => 'captcha_error',
                'message' => 'Kode captcha anti-bot salah atau telah kedaluwarsa. Silakan masukkan kode captcha baru.',
                'new_captcha' => $newCaptcha['svg'],
            ], 422);
        }

        $request->session()->forget('medical_record_captcha');

        $nik = trim((string) $request->input('nik'));
        $namaLengkap = preg_replace('/\s+/', ' ', trim((string) $request->input('nama_lengkap')));

        $owner = Owner::where('nik', $nik)->first();

        if (! $owner) {
            $newCaptcha = $this->createCaptcha();
            $request->session()->put('medical_record_captcha', $newCaptcha['code']);

            return response()->json([
                'status' => 'mismatch',
                'message' => 'Kombinasi NIK dan Nama Lengkap tidak ditemukan dalam pangkalan data Puskeswan. Pastikan 16 digit NIK dan ejaan Nama Lengkap sudah sesuai dengan kartu identitas KTP Anda.',
                'new_captcha' => $newCaptcha['svg'],
            ]);
        }

        $normalizedDbName = preg_replace('/\s+/', ' ', trim((string) $owner->nama_lengkap));
        if (strcasecmp($normalizedDbName, $namaLengkap) !== 0) {
            $newCaptcha = $this->createCaptcha();
            $request->session()->put('medical_record_captcha', $newCaptcha['code']);

            return response()->json([
                'status' => 'mismatch',
                'message' => 'Kombinasi NIK dan Nama Lengkap tidak cocok. NIK terdaftar atas nama yang berbeda dengan yang Anda masukkan. Mohon periksa kembali ejaan nama Anda.',
                'new_captcha' => $newCaptcha['svg'],
            ]);
        }

        $visits = Visit::with([
            'animal.pemilik',
            'animal.jenisHewan',
            'animal.visits' => function ($q) {
                $q->where('status_antrean', 'Selesai')
                    ->with(['examination.dokter.staf'])
                    ->orderBy('tgl_kunjungan', 'desc');
            },
            'examination.dokter.staf',
            'admin',
        ])
            ->whereHas('animal', function ($q) use ($owner) {
                $q->where('id_pemilik', $owner->id);
            })
            ->where('status_antrean', 'Selesai')
            ->orderBy('tgl_kunjungan', 'desc')
            ->get();

        $newCaptcha = $this->createCaptcha();
        $request->session()->put('medical_record_captcha', $newCaptcha['code']);

        if ($visits->isEmpty()) {
            return response()->json([
                'status' => 'empty',
                'owner_name' => $owner->nama_lengkap,
                'nik' => $owner->nik,
                'message' => 'Data pemilik atas nama '.$owner->nama_lengkap.' (NIK: '.$owner->nik.') ditemukan, namun saat ini belum memiliki catatan riwayat rekam medis yang telah selesai diperiksa oleh dokter hewan Puskeswan.',
                'data' => [],
                'new_captcha' => $newCaptcha['svg'],
            ]);
        }

        $records = $visits->map(function ($visit) {
            $exam = $visit->examination;

            $historicalRecords = $visit->animal?->visits
                ? $visit->animal->visits
                    ->filter(fn ($v) => $v->id !== $visit->id)
                    ->values()
                    ->map(fn ($oldVisit) => [
                        'id' => $oldVisit->id,
                        'tgl_kunjungan' => $oldVisit->tgl_kunjungan ? $oldVisit->tgl_kunjungan->format('d/m/Y H:i') : '-',
                        'berat_badan' => (float) $oldVisit->berat_badan,
                        'suhu_tubuh' => (float) $oldVisit->suhu_tubuh,
                        'anamnesa' => $oldVisit->anamnesa,
                        'diagnosa' => $oldVisit->examination?->diagnosa ?? '-',
                        'terapi_pengobatan' => $oldVisit->examination?->terapi_pengobatan ?? '-',
                        'catatan' => $oldVisit->examination?->catatan ?? '-',
                        'dokter' => $oldVisit->examination?->dokter?->name ?? 'drh. Tim Medis Puskeswan',
                        'dokter_foto' => User::resolvePhotoUrl($oldVisit->examination?->dokter?->foto ?: $oldVisit->examination?->dokter?->staf?->foto),
                    ])
                : collect();

            return [
                'id' => $visit->id,
                'no_rm' => $visit->animal?->no_rm ?? '-',
                'nama_hewan' => $visit->animal?->nama_hewan ?? 'Hewan Pasien',
                'id_hewan' => $visit->animal?->id,
                'jenis_hewan' => $visit->animal?->jenisHewan?->nama_jenis ?? '-',
                'jenis_kelamin' => $visit->animal?->jenis_kelamin ?? '-',
                'umur' => $visit->animal?->umur ?? '-',
                'warna_hewan' => $visit->animal?->warna_hewan ?? '-',
                'pemilik' => $visit->animal?->pemilik?->nama_lengkap ?? 'Umum',
                'nik_pemilik' => $visit->animal?->pemilik?->nik ?? '-',
                'no_hp' => $visit->animal?->pemilik?->no_hp_wa ?? '-',
                'alamat_pemilik' => $visit->animal?->pemilik?->alamat_lengkap ?? '-',
                'tgl_kunjungan' => $visit->tgl_kunjungan ? $visit->tgl_kunjungan->format('d/m/Y') : '-',
                'jam_kunjungan' => $visit->tgl_kunjungan ? $visit->tgl_kunjungan->format('H:i').' WIB' : '-',
                'waktu_lengkap' => $visit->tgl_kunjungan ? $visit->tgl_kunjungan->format('d/m/Y H:i') : '-',
                'berat_badan' => (float) $visit->berat_badan,
                'suhu_tubuh' => (float) $visit->suhu_tubuh,
                'anamnesa' => $visit->anamnesa,
                'status_antrean' => $visit->status_antrean,
                'waktu_selesai' => $exam?->waktu_selesai ? $exam->waktu_selesai->format('d/m/Y H:i') : ($visit->updated_at ? $visit->updated_at->format('d/m/Y H:i') : '-'),
                'diagnosa' => $exam?->diagnosa ?? 'Pemeriksaan Klinis Rutin',
                'terapi_pengobatan' => $exam?->terapi_pengobatan ?? 'Terapi pemulihan dan perawatan suportif',
                'catatan' => $exam?->catatan ?? '-',
                'dokter' => $exam?->dokter?->name ?? 'drh. Tim Medis Puskeswan',
                'dokter_nama' => $exam?->dokter?->name ?? 'drh. Tim Medis Puskeswan',
                'dokter_foto' => User::resolvePhotoUrl($exam?->dokter?->foto ?: $exam?->dokter?->staf?->foto),
                'dokter_nip' => $exam?->dokter?->staf?->nip_strv ?? '-',
                'dokter_jabatan' => $exam?->dokter?->staf?->jabatan ?? 'Dokter Hewan Pemeriksa',
                'admin_petugas' => $visit->admin?->name ?? 'Admin Loket',
                'historical_records' => $historicalRecords,
            ];
        });

        return response()->json([
            'status' => 'success',
            'owner_name' => $owner->nama_lengkap,
            'nik' => $owner->nik,
            'total' => $records->count(),
            'message' => 'Ditemukan '.$records->count().' data rekam medis selesai untuk pemilik '.$owner->nama_lengkap.'.',
            'data' => $records,
            'new_captcha' => $newCaptcha['svg'],
        ]);
    }

    /**
     * @return array{code: string, svg: string}
     */
    private function createCaptcha(): array
    {
        $characters = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
        $code = '';
        $charLength = strlen($characters);
        for ($i = 0; $i < 5; $i++) {
            $code .= $characters[random_int(0, $charLength - 1)];
        }

        $width = 136;
        $height = 42;
        $chars = str_split($code);

        $lines = '';
        for ($i = 0; $i < 4; $i++) {
            $x1 = random_int(0, $width);
            $y1 = random_int(0, $height);
            $x2 = random_int(0, $width);
            $y2 = random_int(0, $height);
            $colors = ['#c084fc', '#e9d5ff', '#a855f7', '#9333ea'];
            $color = $colors[$i % count($colors)];
            $lines .= "<line x1='{$x1}' y1='{$y1}' x2='{$x2}' y2='{$y2}' stroke='{$color}' stroke-width='1.5' stroke-dasharray='3,3' opacity='0.75'/>";
        }

        $dots = '';
        for ($i = 0; $i < 20; $i++) {
            $cx = random_int(2, $width - 2);
            $cy = random_int(2, $height - 2);
            $r = random_int(1, 2);
            $dots .= "<circle cx='{$cx}' cy='{$cy}' r='{$r}' fill='#7e22ce' opacity='0.35'/>";
        }

        $charElements = '';
        $spacing = (int) (($width - 24) / max(1, count($chars)));
        foreach ($chars as $idx => $char) {
            $x = 12 + ($idx * $spacing);
            $y = random_int(27, 32);
            $rotate = random_int(-15, 15);
            $colors = ['#581c87', '#6b21a8', '#7e22ce', '#3b0764', '#4c1d95'];
            $color = $colors[$idx % count($colors)];
            $charElements .= "<text x='{$x}' y='{$y}' fill='{$color}' font-size='22' font-family='Courier, monospace, sans-serif' font-weight='900' transform='rotate({$rotate}, {$x}, {$y})'>{$char}</text>";
        }

        $svg = "<svg xmlns='http://www.w3.org/2000/svg' width='{$width}' height='{$height}' viewBox='0 0 {$width} {$height}' style='background-color: #faf5ff; border: 1px solid #e9d5ff; border-radius: 10px; user-select: none;'>{$lines}{$dots}{$charElements}</svg>";

        return [
            'code' => $code,
            'svg' => 'data:image/svg+xml;base64,'.base64_encode($svg),
        ];
    }
}
