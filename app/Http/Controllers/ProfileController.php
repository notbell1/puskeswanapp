<?php

namespace App\Http\Controllers;

use App\Models\Staff;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Tampilkan halaman Profil & Pengaturan Akun.
     */
    public function edit(Request $request): Response
    {
        /** @var User $user */
        $user = Auth::user();
        $user->loadMissing(['role', 'staf']);

        $rawRole = strtoupper((string) ($user->role?->nama_role ?? ''));

        $roleBadge = match ($rawRole) {
            'SUPER_ADMIN' => [
                'label' => 'Super Administrator',
                'color' => 'bg-purple-100 text-purple-700 border-purple-200',
                'description' => 'Akses penuh konfigurasi sistem, manajemen pengguna, master data, dan pelaporan eksekutif.',
            ],
            'ADMIN' => [
                'label' => 'Petugas Administrasi',
                'color' => 'bg-blue-100 text-blue-700 border-blue-200',
                'description' => 'Pelayanan loket pendaftaran antrean, data pemilik hewan, kasir, dan rekapitulasi harian.',
            ],
            'DOKTER' => [
                'label' => 'Dokter Hewan',
                'color' => 'bg-emerald-100 text-emerald-700 border-emerald-200',
                'description' => 'Pemeriksaan medis klinis, diagnosa hewan, resep obat terapi, dan surveilans rabies.',
            ],
            default => [
                'label' => 'Pengguna Terdaftar',
                'color' => 'bg-gray-100 text-gray-700 border-gray-200',
                'description' => 'Akun pengguna sistem Puskeswan terpadu.',
            ],
        };

        return Inertia::render('profile/index', [
            'userProfile' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'foto' => $user->foto,
                'status_aktif' => (bool) $user->status_aktif,
                'created_at' => $user->created_at ? $user->created_at->format('d F Y, H:i') : '-',
                'updated_at' => $user->updated_at ? $user->updated_at->format('d F Y, H:i') : '-',
                'email_verified' => ! empty($user->email_verified_at),
                'role' => [
                    'id' => $user->role?->id,
                    'name' => $user->role?->nama_role ?? 'USER',
                    'label' => $roleBadge['label'],
                    'badge_color' => $roleBadge['color'],
                    'description' => $roleBadge['description'],
                ],
                'staff' => $user->staf ? [
                    'id' => $user->staf->id,
                    'nama_staf' => $user->staf->nama_staf,
                    'jabatan' => $user->staf->jabatan,
                    'nip_strv' => $user->staf->nip_strv,
                    'foto' => $user->staf->foto,
                ] : null,
            ],
        ]);
    }

    /**
     * Perbarui data profil pengguna (Nama, Email, dan Foto Profil).
     */
    public function update(Request $request): RedirectResponse
    {
        /** @var User $user */
        $user = Auth::user();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'foto' => [
                'nullable',
                'file',
                'image',
                'mimes:jpeg,png,jpg,webp',
                'mimetypes:image/jpeg,image/png,image/webp',
                'max:5120',
            ],
            'hapus_foto' => ['nullable', 'boolean'],
        ], [
            'name.required' => 'Nama lengkap wajib diisi.',
            'email.required' => 'Alamat email wajib diisi.',
            'email.email' => 'Format email tidak valid (harus mengandung @ dan domain yang sah).',
            'email.unique' => 'Alamat email sudah digunakan oleh pengguna lain.',
            'foto.image' => 'Berkas harus berupa gambar.',
            'foto.mimes' => 'Format foto harus berupa JPG, JPEG, PNG, atau WEBP.',
            'foto.max' => 'Ukuran foto profil maksimal 5MB.',
        ]);

        $photoPath = $this->handleProfilePhotoUpload($request, $user->foto);

        $user->name = strip_tags($validated['name']);
        $user->email = strtolower(trim($validated['email']));
        $user->foto = $photoPath;
        $user->save();

        if ($user->id_staf) {
            Staff::where('id', $user->id_staf)->update([
                'nama_staf' => $user->name,
                'foto' => $photoPath,
            ]);
        }

        return back()->with('success', 'Profil akun Anda berhasil diperbarui!');
    }

    /**
     * Perbarui kata sandi akun dengan validasi keamanan ketat.
     */
    public function updatePassword(Request $request): RedirectResponse
    {
        /** @var User $user */
        $user = Auth::user();

        $validated = $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', 'string', Password::min(8), 'confirmed', 'different:current_password'],
        ], [
            'current_password.required' => 'Kata sandi saat ini wajib diisi.',
            'current_password.current_password' => 'Kata sandi saat ini yang Anda masukkan tidak sesuai.',
            'password.required' => 'Kata sandi baru wajib diisi.',
            'password.min' => 'Kata sandi baru minimal harus 8 karakter.',
            'password.confirmed' => 'Konfirmasi kata sandi baru tidak sesuai.',
            'password.different' => 'Kata sandi baru harus berbeda dari kata sandi saat ini.',
        ]);

        $user->update([
            'password' => Hash::make($validated['password']),
        ]);

        return back()->with('success', 'Kata sandi akun Anda berhasil diperbarui! Gunakan kata sandi baru ini untuk login selanjutnya.');
    }

    /**
     * Hapus foto profil pengguna.
     */
    public function deletePhoto(Request $request): RedirectResponse
    {
        /** @var User $user */
        $user = Auth::user();

        if ($user->foto) {
            $oldFile = str_replace('/storage/', '', $user->foto);
            if (Storage::disk('public')->exists($oldFile)) {
                Storage::disk('public')->delete($oldFile);
            }
            $user->foto = null;
            $user->save();

            if ($user->id_staf) {
                Staff::where('id', $user->id_staf)->update(['foto' => null]);
            }
        }

        return back()->with('success', 'Foto profil berhasil dihapus.');
    }

    /**
     * Validasi zero-trust & penyimpanan berkas foto profil.
     */
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

        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mimeType = finfo_file($finfo, $realPath);
        finfo_close($finfo);

        $allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
        if (! in_array($mimeType, $allowedMimes, true)) {
            throw ValidationException::withMessages([
                'foto' => 'Keamanan: Berkas ditolak. Tipe MIME tidak valid (Hanya JPG, JPEG, PNG, dan WEBP yang diizinkan).',
            ]);
        }

        $imageInfo = @getimagesize($realPath);
        if ($imageInfo === false) {
            throw ValidationException::withMessages([
                'foto' => 'Keamanan: Berkas gambar korup atau bukan merupakan binary gambar valid.',
            ]);
        }

        if ($currentPhotoPath) {
            $oldFile = str_replace('/storage/', '', $currentPhotoPath);
            if (Storage::disk('public')->exists($oldFile)) {
                Storage::disk('public')->delete($oldFile);
            }
        }

        $extension = match ($mimeType) {
            'image/jpeg' => 'jpg',
            'image/png' => 'png',
            'image/webp' => 'webp',
            default => 'jpg',
        };

        $fileName = 'profil_'.bin2hex(random_bytes(16)).'.'.$extension;
        $path = $file->storeAs('photos/users', $fileName, 'public');

        return '/storage/'.$path;
    }
}
