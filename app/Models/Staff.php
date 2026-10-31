<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Staff extends Model
{
    use HasFactory;

    protected $table = 'staff';

    protected $fillable = [
        'nama_staf',
        'jabatan',
        'nip_strv',
        'urutan',
        'tampil_publik',
        'foto',
    ];

    protected function casts(): array
    {
        return [
            'urutan' => 'integer',
            'tampil_publik' => 'boolean',
        ];
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class, 'id_staf');
    }

    public function articles(): HasMany
    {
        return $this->hasMany(Article::class, 'id_staf');
    }

    public static function defaultJabatanForRole(?string $roleName): string
    {
        return match (strtoupper((string) $roleName)) {
            'SUPER_ADMIN' => 'Super Administrator',
            'DOKTER' => 'Medik Veteriner / Dokter Hewan',
            'ADMIN' => 'Staf Administrasi & Rekam Medis',
            default => 'Tenaga Staf Puskeswan',
        };
    }

    public static function syncUsersToStaff(): void
    {
        $hasMissingStaff = User::whereNull('id_staf')
            ->orWhereDoesntHave('staf')
            ->exists();

        if (! $hasMissingStaff) {
            return;
        }

        $usersWithoutStaff = User::with('role')
            ->where(function ($q) {
                $q->whereNull('id_staf')
                    ->orWhereDoesntHave('staf');
            })
            ->orderBy('id', 'asc')
            ->get();

        foreach ($usersWithoutStaff as $user) {
            $roleName = strtoupper((string) ($user->role?->nama_role ?? ''));
            $isSuperAdmin = $roleName === 'SUPER_ADMIN';
            $defaultJabatan = self::defaultJabatanForRole($roleName);
            $nextOrder = ((int) self::where('tampil_publik', true)->max('urutan')) + 1;

            $staff = self::create([
                'nama_staf' => $user->name,
                'jabatan' => $defaultJabatan,
                'nip_strv' => null,
                'tampil_publik' => ! $isSuperAdmin,
                'urutan' => $isSuperAdmin ? null : $nextOrder,
                'foto' => $user->foto,
            ]);

            $user->update(['id_staf' => $staff->id]);
        }
    }

    /**
     * Ambil data staf pimpinan aktif (Kepala UPTD Puskeswan dan IB Kota Pariaman).
     */
    public static function getPimpinan(): ?self
    {
        return self::whereRaw('LOWER(jabatan) = ?', ['kepala uptd puskeswan dan ib kota pariaman'])
            ->orWhereRaw('LOWER(jabatan) LIKE ?', ['%kepala uptd%'])
            ->orderBy('id', 'asc')
            ->first();
    }
}
