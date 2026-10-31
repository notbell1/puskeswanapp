<?php

namespace App\Http\Controllers\Super;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\Staff;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    /**
     * Tampilkan daftar akun pengguna dengan pencarian, filter role, dan pagination.
     */
    public function index(Request $request): Response
    {
        Staff::syncUsersToStaff();

        $search = trim((string) $request->input('search', ''));
        $roleFilter = $request->input('role');

        $query = User::with(['role:id,nama_role', 'staf:id,nama_staf'])
            ->orderBy('id_role', 'asc')
            ->orderBy('id', 'asc');

        $allUsers = $query->get()->map(fn ($user) => [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'status_aktif' => (bool) $user->status_aktif,
            'id_role' => $user->id_role,
            'role_name' => $user->role?->nama_role ?? 'USER',
            'id_staf' => $user->id_staf,
            'staf_name' => $user->staf?->nama_staf,
            'foto' => $user->foto,
            'created_at' => $user->created_at?->format('d/m/Y H:i'),
        ]);

        $users = [
            'data' => $allUsers,
            'total' => $allUsers->count(),
        ];

        $roles = Role::select(['id', 'nama_role', 'deskripsi'])->get();
        $staffList = Staff::select(['id', 'nama_staf', 'jabatan'])->get();
        $superAdminCount = User::superAdminCount();
        $isSuperAdminQuotaFull = User::isSuperAdminQuotaFull();

        $authId = (int) Auth::id();
        $rateLimitKey = 'critical-action:'.$authId;
        $isRateLimited = RateLimiter::tooManyAttempts($rateLimitKey, 3);
        $lockoutSeconds = $isRateLimited ? RateLimiter::availableIn($rateLimitKey) : 0;

        return Inertia::render('super/pengguna/index', [
            'users' => $users,
            'filters' => [
                'search' => $search,
                'role' => $roleFilter,
            ],
            'roles' => $roles,
            'staffList' => $staffList,
            'superAdminCount' => $superAdminCount,
            'maxSuperAdmin' => 2,
            'isSuperAdminQuotaFull' => $isSuperAdminQuotaFull,
            'currentUserId' => $authId,
            'isRateLimited' => $isRateLimited,
            'lockoutSeconds' => $lockoutSeconds,
        ]);
    }

    /**
     * Simpan pengguna baru ke database dengan validasi ketat & upload foto profil.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', Password::min(8), 'confirmed'],
            'id_role' => ['required', 'exists:roles,id'],
            'id_staf' => ['nullable', 'exists:staff,id'],
            'status_aktif' => ['boolean'],
            'foto' => [
                'nullable',
                'file',
                'image',
                'mimes:jpeg,png,jpg,webp',
                'mimetypes:image/jpeg,image/png,image/webp',
                'max:5120',
            ],
        ]);

        $role = Role::find($validated['id_role']);
        $roleName = strtoupper((string) ($role?->nama_role ?? ''));

        if ($roleName === 'SUPER_ADMIN' && User::isSuperAdminQuotaFull()) {
            throw ValidationException::withMessages([
                'id_role' => 'Batas kuota Super Administrator telah tercapai (maksimal 2 akun). Hak akses Super Admin tidak dapat ditambahkan lagi.',
            ]);
        }

        $photoPath = $this->handleProfilePhotoUpload($request);
        $cleanName = strip_tags($validated['name']);
        $staffId = $validated['id_staf'] ?? null;

        if (! $staffId) {
            $isSuperAdmin = $roleName === 'SUPER_ADMIN';
            $nextOrder = ((int) Staff::where('tampil_publik', true)->max('urutan')) + 1;

            $newStaff = Staff::create([
                'nama_staf' => $cleanName,
                'jabatan' => Staff::defaultJabatanForRole($roleName),
                'nip_strv' => null,
                'tampil_publik' => ! $isSuperAdmin,
                'urutan' => $isSuperAdmin ? null : $nextOrder,
                'foto' => $photoPath,
            ]);
            $staffId = $newStaff->id;
        } else {
            $staffUpdate = ['nama_staf' => $cleanName];
            if ($photoPath) {
                $staffUpdate['foto'] = $photoPath;
            }
            Staff::where('id', $staffId)->update($staffUpdate);
        }

        User::create([
            'name' => $cleanName,
            'email' => strtolower(trim($validated['email'])),
            'password' => Hash::make($validated['password']),
            'id_role' => $validated['id_role'],
            'id_staf' => $staffId,
            'status_aktif' => $validated['status_aktif'] ?? true,
            'foto' => $photoPath,
            'email_verified_at' => now(),
        ]);

        return back()->with('success', "Akun pengguna {$validated['name']} berhasil dibuat dan disinkronkan ke Data Staf!");
    }

    /**
     * Perbarui data pengguna yang ada beserta foto profil dan sinkronisasi staf.
     */
    public function update(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'password' => ['nullable', 'string', Password::min(8), 'confirmed'],
            'id_role' => ['required', 'exists:roles,id'],
            'id_staf' => ['nullable', 'exists:staff,id'],
            'status_aktif' => ['boolean'],
            'sudo_password' => ['nullable', 'string'],
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

        $targetRole = Role::find($validated['id_role']);
        $targetRoleName = strtoupper((string) ($targetRole?->nama_role ?? ''));

        // Cek jika akun target adalah Super Admin
        if ($user->isSuperAdmin()) {
            if ($user->id === Auth::id()) {
                // Pengguna mengedit akunnya sendiri: tidak boleh menurunkan role dan tidak boleh nonaktifkan diri
                $roleId = $user->id_role;
                $statusAktif = true;
            } else {
                // Mengedit akun Super Admin lain: Wajib konfirmasi password akun yang sedang aktif (sudo mode)
                $key = 'critical-action:'.Auth::id();
                if (RateLimiter::tooManyAttempts($key, 3)) {
                    $seconds = RateLimiter::availableIn($key);
                    throw ValidationException::withMessages([
                        'sudo_password' => "Terlalu banyak percobaan verifikasi yang salah. Fitur tindakan kritis dinonaktifkan sementara selama {$seconds} detik.",
                    ]);
                }

                $sudoPassword = $request->input('sudo_password');
                if (! $sudoPassword || ! Hash::check($sudoPassword, Auth::user()->password)) {
                    RateLimiter::hit($key, 300);
                    $remaining = RateLimiter::retriesLeft($key, 3);
                    $msg = $remaining > 0
                        ? "Kata sandi konfirmasi Anda salah! Sisa percobaan: {$remaining} kali."
                        : 'Kata sandi salah! Fitur tindakan kritis dibekukan selama 5 menit demi keamanan sistem.';

                    throw ValidationException::withMessages([
                        'sudo_password' => $msg,
                    ]);
                }

                RateLimiter::clear($key);

                // Cek jika hendak menurunkan peran (demote) dari SUPER_ADMIN
                if ($targetRoleName !== 'SUPER_ADMIN' && User::activeSuperAdminCount() <= 1) {
                    throw ValidationException::withMessages([
                        'id_role' => 'Keamanan Sistem: Sistem wajib memiliki minimal 1 Super Admin aktif! Hak akses akun ini tidak dapat diturunkan.',
                    ]);
                }

                // Cek jika hendak menonaktifkan akun
                $targetStatus = (bool) ($validated['status_aktif'] ?? true);
                if (! $targetStatus && User::activeSuperAdminCount() <= 1) {
                    throw ValidationException::withMessages([
                        'status_aktif' => 'Keamanan Sistem: Sistem wajib memiliki minimal 1 Super Admin aktif! Akun ini tidak dapat dinonaktifkan.',
                    ]);
                }

                $roleId = $validated['id_role'];
                $statusAktif = $targetStatus;
            }
        } else {
            // Akun bukan Super Admin: cek kuota jika hendak dipromosikan jadi Super Admin
            if ($targetRoleName === 'SUPER_ADMIN' && User::isSuperAdminQuotaFull()) {
                throw ValidationException::withMessages([
                    'id_role' => 'Batas kuota Super Administrator telah tercapai (maksimal 2 akun). Akun pengguna tidak dapat dipromosikan menjadi Super Admin.',
                ]);
            }

            $roleId = $validated['id_role'];
            $statusAktif = (bool) ($validated['status_aktif'] ?? true);
        }

        $photoPath = $this->handleProfilePhotoUpload($request, $user->foto);

        $updateData = [
            'name' => strip_tags($validated['name']),
            'email' => strtolower(trim($validated['email'])),
            'id_role' => $roleId,
            'id_staf' => $validated['id_staf'] ?? null,
            'status_aktif' => $statusAktif,
            'foto' => $photoPath,
        ];

        if (! empty($validated['password'])) {
            $updateData['password'] = Hash::make($validated['password']);
        }

        $user->update($updateData);

        $targetStaffId = $validated['id_staf'] ?? $user->id_staf;
        if ($targetStaffId) {
            Staff::where('id', $targetStaffId)->update([
                'nama_staf' => strip_tags($validated['name']),
                'foto' => $photoPath,
            ]);
        } else {
            Staff::syncUsersToStaff();
        }

        return back()->with('success', "Data akun {$user->name} berhasil diperbarui!");
    }

    /**
     * Toggle status aktif/non-aktif akun secara instan.
     */
    public function toggleStatus(Request $request, User $user): RedirectResponse
    {
        if ($user->id === Auth::id()) {
            return back()->with('error', 'Keamanan: Anda tidak dapat menonaktifkan akun Anda sendiri!');
        }

        if ($user->isSuperAdmin()) {
            if ($user->status_aktif && User::activeSuperAdminCount() <= 1) {
                return back()->with('error', 'Keamanan Sistem: Sistem wajib memiliki minimal 1 Super Admin aktif! Akun ini tidak dapat dinonaktifkan.');
            }

            if (! $user->status_aktif && User::activeSuperAdminCount() >= 2) {
                return back()->with('error', 'Kuota Super Admin aktif telah penuh (maksimal 2 akun). Nonaktifkan atau ubah peran akun Super Admin lain terlebih dahulu.');
            }

            $key = 'critical-action:'.Auth::id();
            if (RateLimiter::tooManyAttempts($key, 3)) {
                $seconds = RateLimiter::availableIn($key);

                return back()->with('error', "Terlalu banyak percobaan verifikasi yang salah. Fitur tindakan kritis dinonaktifkan sementara selama {$seconds} detik.");
            }

            $sudoPassword = $request->input('sudo_password');
            if (! $sudoPassword || ! Hash::check($sudoPassword, Auth::user()->password)) {
                RateLimiter::hit($key, 300);
                $remaining = RateLimiter::retriesLeft($key, 3);
                $msg = $remaining > 0
                    ? "Kata sandi konfirmasi salah! Sisa percobaan: {$remaining} kali."
                    : 'Kata sandi salah! Fitur tindakan kritis dibekukan selama 5 menit demi keamanan sistem.';

                return back()->with('error', $msg);
            }

            RateLimiter::clear($key);
        }

        $user->update([
            'status_aktif' => ! $user->status_aktif,
        ]);

        $statusStr = $user->status_aktif ? 'diaktifkan' : 'dinonaktifkan';

        return back()->with('success', "Akun {$user->name} berhasil {$statusStr}!");
    }

    /**
     * Hapus akun pengguna secara aman beserta berkas foto profilnya.
     */
    public function destroy(Request $request, User $user): RedirectResponse
    {
        if ($user->id === Auth::id()) {
            return back()->with('error', 'Keamanan: Anda tidak dapat menghapus akun Anda sendiri yang sedang aktif!');
        }

        if ($user->isSuperAdmin()) {
            if (User::activeSuperAdminCount() <= 1) {
                return back()->with('error', 'Keamanan Sistem: Sistem wajib memiliki minimal 1 Super Admin aktif! Akun ini terkunci dari penghapusan demi integritas operasional.');
            }

            $key = 'critical-action:'.Auth::id();
            if (RateLimiter::tooManyAttempts($key, 3)) {
                $seconds = RateLimiter::availableIn($key);

                return back()->with('error', "Terlalu banyak percobaan verifikasi yang salah. Fitur tindakan kritis dinonaktifkan sementara selama {$seconds} detik.");
            }

            $sudoPassword = $request->input('sudo_password');
            if (! $sudoPassword || ! Hash::check($sudoPassword, Auth::user()->password)) {
                RateLimiter::hit($key, 300);
                $remaining = RateLimiter::retriesLeft($key, 3);
                $msg = $remaining > 0
                    ? "Kata sandi konfirmasi salah! Sisa percobaan: {$remaining} kali."
                    : 'Kata sandi salah! Fitur tindakan kritis dibekukan selama 5 menit demi keamanan sistem.';

                return back()->with('error', $msg);
            }

            RateLimiter::clear($key);
        }

        $userName = $user->name;

        if ($user->foto) {
            $oldFile = str_replace('/storage/', '', $user->foto);
            if (Storage::disk('public')->exists($oldFile)) {
                Storage::disk('public')->delete($oldFile);
            }
        }

        $user->delete();

        return back()->with('success', "Akun pengguna {$userName} berhasil dihapus dari sistem!");
    }

    /**
     * Memproses berkas foto profil dengan validasi keamanan zero-trust:
     * - Jangan percaya inputan user atau ekstensi yang dimanipulasi via Burp Suite.
     * - Wajib verifikasi magic bytes menggunakan finfo.
     * - Wajib verifikasi integritas binary gambar dengan getimagesize().
     * - Batasi ukuran maksimum 5MB.
     * - Simpan menggunakan nama acak hash.
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
