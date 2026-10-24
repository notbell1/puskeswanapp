<?php

namespace App\Http\Controllers\Super;

use App\Http\Controllers\Controller;
use App\Models\Staff;
use App\Models\StaffPosition;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class StaffController extends Controller
{
    public const PIMPINAN_JABATAN = 'Kepala UPTD Puskeswan dan IB Kota Pariaman';

    public function index(Request $request): Response
    {
        Staff::syncUsersToStaff();

        $search = trim((string) $request->input('search', ''));
        $jabatanFilter = $request->input('jabatan');

        $staff = Staff::with(['users:id,id_staf,foto,id_role', 'users.role:id,nama_role'])
            ->withCount('users')
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('nama_staf', 'like', "%{$search}%")
                        ->orWhere('nip_strv', 'like', "%{$search}%")
                        ->orWhere('jabatan', 'like', "%{$search}%");
                });
            })
            ->when($jabatanFilter, function ($query, $jabatanFilter) {
                $query->where('jabatan', $jabatanFilter);
            })
            ->orderByDesc('tampil_publik')
            ->orderByRaw('CASE WHEN urutan IS NULL THEN 999999 ELSE urutan END ASC')
            ->orderBy('id', 'asc')
            ->paginate(5)
            ->withQueryString()
            ->through(fn ($staf) => [
                'id' => $staf->id,
                'nama_staf' => $staf->nama_staf,
                'jabatan' => $staf->jabatan,
                'nip_strv' => $staf->nip_strv,
                'tampil_publik' => (bool) $staf->tampil_publik,
                'urutan' => $staf->tampil_publik ? (int) ($staf->urutan ?: 1) : null,
                'foto' => $staf->foto ?: $staf->users->first()?->foto,
                'users_count' => $staf->users_count,
                'linked_role' => $staf->users->first()?->role?->nama_role,
                'created_at' => $staf->created_at?->format('d/m/Y'),
            ]);

        $masterPositions = StaffPosition::orderBy('nama_jabatan')->pluck('nama_jabatan')->all();
        $usedPositions = Staff::select('jabatan')
            ->whereNotNull('jabatan')
            ->where('jabatan', '!=', '')
            ->distinct()
            ->pluck('jabatan')
            ->all();

        $dynamicPositions = collect(array_merge($masterPositions, $usedPositions))
            ->map(fn ($j) => trim((string) $j))
            ->filter(fn ($j) => $j !== '' && strcasecmp($j, self::PIMPINAN_JABATAN) !== 0)
            ->unique(fn ($j) => strtolower($j))
            ->sort()
            ->values()
            ->all();

        $availableJabatans = array_merge([self::PIMPINAN_JABATAN], $dynamicPositions);

        $pimpinanStaff = Staff::whereRaw('LOWER(jabatan) = ?', [strtolower(self::PIMPINAN_JABATAN)])
            ->first(['id', 'nama_staf']);

        $nextOrder = ((int) Staff::where('tampil_publik', true)->max('urutan')) + 1;

        return Inertia::render('super/staf/index', [
            'staff' => $staff,
            'filters' => [
                'search' => $search,
                'jabatan' => $jabatanFilter,
            ],
            'availableJabatans' => $availableJabatans,
            'pimpinanJabatan' => self::PIMPINAN_JABATAN,
            'pimpinanStaffId' => $pimpinanStaff?->id,
            'pimpinanStaffName' => $pimpinanStaff?->nama_staf,
            'nextOrder' => $nextOrder,
        ]);
    }

    public function storePosition(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'nama_jabatan' => ['required', 'string', 'max:150'],
        ], [
            'nama_jabatan.required' => 'Nama jabatan / posisi wajib diisi.',
            'nama_jabatan.max' => 'Nama jabatan maksimal 150 karakter.',
        ]);

        $cleanName = trim(strip_tags($validated['nama_jabatan']));
        if ($cleanName === '') {
            throw ValidationException::withMessages([
                'nama_jabatan' => 'Nama jabatan / posisi tidak boleh kosong.',
            ]);
        }

        if (strcasecmp($cleanName, self::PIMPINAN_JABATAN) === 0) {
            throw ValidationException::withMessages([
                'nama_jabatan' => 'Jabatan Pimpinan tersebut sudah tersedia secara permanen di daftar pilihan.',
            ]);
        }

        $exists = StaffPosition::whereRaw('LOWER(nama_jabatan) = ?', [strtolower($cleanName)])->exists();
        if ($exists) {
            throw ValidationException::withMessages([
                'nama_jabatan' => "Jabatan '{$cleanName}' sudah terdaftar di dalam daftar pilihan.",
            ]);
        }

        StaffPosition::create([
            'nama_jabatan' => $cleanName,
        ]);

        return back()->with('success', "Jabatan '{$cleanName}' berhasil ditambahkan!");
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'nama_staf' => ['required', 'string', 'max:255'],
            'jabatan' => ['required', 'string', 'max:255'],
            'nip_strv' => ['nullable', 'string', 'max:255'],
            'tampil_publik' => ['nullable', 'boolean'],
            'urutan' => ['nullable', 'integer', 'min:1', 'max:9999'],
            'foto' => [
                'nullable',
                'file',
                'image',
                'mimes:jpeg,png,jpg,webp',
                'mimetypes:image/jpeg,image/png,image/webp',
                'max:5120',
            ],
        ]);

        $cleanJabatan = trim(strip_tags($validated['jabatan']));

        if (strcasecmp($cleanJabatan, self::PIMPINAN_JABATAN) === 0) {
            $alreadyExists = Staff::whereRaw('LOWER(jabatan) = ?', [strtolower(self::PIMPINAN_JABATAN)])->exists();
            if ($alreadyExists) {
                throw ValidationException::withMessages([
                    'jabatan' => 'Jabatan Kepala UPTD Puskeswan dan IB Kota Pariaman sudah terisi (hanya 1 orang pimpinan).',
                ]);
            }
            $cleanJabatan = self::PIMPINAN_JABATAN;
        } else {
            StaffPosition::firstOrCreate(['nama_jabatan' => $cleanJabatan]);
        }

        $tampilPublik = (bool) ($validated['tampil_publik'] ?? true);
        $urutan = $tampilPublik
            ? (int) ($validated['urutan'] ?? (((int) Staff::where('tampil_publik', true)->max('urutan')) + 1))
            : null;

        $photoPath = $this->handleProfilePhotoUpload($request);

        Staff::create([
            'nama_staf' => strip_tags($validated['nama_staf']),
            'jabatan' => $cleanJabatan,
            'nip_strv' => ! empty($validated['nip_strv']) ? strip_tags($validated['nip_strv']) : null,
            'tampil_publik' => $tampilPublik,
            'urutan' => $urutan,
            'foto' => $photoPath,
        ]);

        return back()->with('success', "Pegawai {$validated['nama_staf']} berhasil didaftarkan!");
    }

    public function update(Request $request, Staff $staff): RedirectResponse
    {
        $validated = $request->validate([
            'nama_staf' => ['required', 'string', 'max:255'],
            'jabatan' => ['required', 'string', 'max:255'],
            'nip_strv' => ['nullable', 'string', 'max:255'],
            'tampil_publik' => ['nullable', 'boolean'],
            'urutan' => ['nullable', 'integer', 'min:1', 'max:9999'],
            'foto' => [
                'nullable',
                'file',
                'image',
                'mimes:jpeg,png,jpg,webp',
                'mimetypes:image/jpeg,image/png,image/webp',
                'max:5120',
            ],
            'hapus_foto' => ['nullable', 'boolean'],
        ]);

        $cleanJabatan = trim(strip_tags($validated['jabatan']));

        if (strcasecmp($cleanJabatan, self::PIMPINAN_JABATAN) === 0) {
            $alreadyExists = Staff::whereRaw('LOWER(jabatan) = ?', [strtolower(self::PIMPINAN_JABATAN)])
                ->where('id', '!=', $staff->id)
                ->exists();
            if ($alreadyExists) {
                throw ValidationException::withMessages([
                    'jabatan' => 'Jabatan Kepala UPTD Puskeswan dan IB Kota Pariaman sudah terisi oleh pegawai lain.',
                ]);
            }
            $cleanJabatan = self::PIMPINAN_JABATAN;
        } else {
            StaffPosition::firstOrCreate(['nama_jabatan' => $cleanJabatan]);
        }

        $tampilPublik = (bool) ($validated['tampil_publik'] ?? true);
        $urutan = $tampilPublik
            ? (int) ($validated['urutan'] ?? ($staff->urutan ?: (((int) Staff::where('tampil_publik', true)->max('urutan')) + 1)))
            : null;

        $photoPath = $this->handleProfilePhotoUpload($request, $staff->foto);
        $cleanNama = strip_tags($validated['nama_staf']);

        $staff->update([
            'nama_staf' => $cleanNama,
            'jabatan' => $cleanJabatan,
            'nip_strv' => ! empty($validated['nip_strv']) ? strip_tags($validated['nip_strv']) : null,
            'tampil_publik' => $tampilPublik,
            'urutan' => $urutan,
            'foto' => $photoPath,
        ]);

        User::where('id_staf', $staff->id)->update([
            'name' => $cleanNama,
            'foto' => $photoPath,
        ]);

        return back()->with('success', "Data pegawai {$staff->nama_staf} berhasil diperbarui!");
    }

    public function destroy(Staff $staff): RedirectResponse
    {
        $name = $staff->nama_staf;

        if ($staff->foto) {
            $oldFile = str_replace('/storage/', '', $staff->foto);
            if (Storage::disk('public')->exists($oldFile)) {
                Storage::disk('public')->delete($oldFile);
            }
        }

        $staff->delete();

        return back()->with('success', "Data pegawai {$name} berhasil dihapus!");
    }

    protected function handleProfilePhotoUpload(Request $request, ?string $currentPhotoPath = null): ?string
    {
        if ($request->boolean('hapus_foto') && ! $request->hasFile('foto')) {
            if ($currentPhotoPath) {
                $oldFile = str_replace('/storage/', '', $currentPhotoPath);
                if (Storage::disk('public')->exists($oldFile)) {
                    Storage::disk('public')->delete($oldFile);
                }
            }

            return null;
        }

        if (! $request->hasFile('foto')) {
            return $currentPhotoPath;
        }

        $file = $request->file('foto');

        if (! $file->isValid()) {
            throw ValidationException::withMessages([
                'foto' => 'Berkas unggahan tidak valid atau mengalami gangguan saat proses pengunggahan.',
            ]);
        }

        if ($file->getSize() > 5 * 1024 * 1024) {
            throw ValidationException::withMessages([
                'foto' => 'Ukuran berkas melebihi batas maksimal yang diizinkan (5MB).',
            ]);
        }

        $realPath = $file->getRealPath();
        if (! $realPath || ! file_exists($realPath)) {
            throw ValidationException::withMessages([
                'foto' => 'Keamanan: Berkas tidak ditemukan atau tidak dapat dibaca.',
            ]);
        }

        try {
            $finfo = new \finfo(FILEINFO_MIME_TYPE);
            $realMime = @$finfo->file($realPath) ?: @$finfo->buffer((string) file_get_contents($realPath));
        } catch (\Throwable) {
            $realMime = false;
        }

        $allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];

        if (! $realMime || ! in_array($realMime, $allowedMimes, true)) {
            throw ValidationException::withMessages([
                'foto' => 'Keamanan: Berkas yang diunggah terdeteksi bukan gambar asli (MIME: '.htmlspecialchars((string) $realMime).').',
            ]);
        }

        $imageInfo = @getimagesize($file->getRealPath());
        if ($imageInfo === false) {
            throw ValidationException::withMessages([
                'foto' => 'Keamanan: Struktur berkas rusak atau bukan format gambar asli yang dapat dirender.',
            ]);
        }

        $allowedTypes = [IMAGETYPE_JPEG, IMAGETYPE_PNG, IMAGETYPE_WEBP];
        if (! in_array($imageInfo[2], $allowedTypes, true)) {
            throw ValidationException::withMessages([
                'foto' => 'Keamanan: Format binary berkas gambar tidak didukung.',
            ]);
        }

        $safeExtension = match ($imageInfo[2]) {
            IMAGETYPE_JPEG => 'jpg',
            IMAGETYPE_PNG => 'png',
            IMAGETYPE_WEBP => 'webp',
            default => 'jpg',
        };

        $safeFilename = Str::random(40).'.'.$safeExtension;
        $storedPath = $file->storeAs('avatars', $safeFilename, 'public');

        if ($currentPhotoPath) {
            $oldFile = str_replace('/storage/', '', $currentPhotoPath);
            if (Storage::disk('public')->exists($oldFile)) {
                Storage::disk('public')->delete($oldFile);
            }
        }

        return '/storage/'.$storedPath;
    }
}
