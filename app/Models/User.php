<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'id_role',
        'id_staf',
        'name',
        'email',
        'password',
        'foto',
        'status_aktif',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'two_factor_confirmed_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'two_factor_secret',
        'two_factor_recovery_codes',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'two_factor_confirmed_at' => 'datetime',
            'status_aktif' => 'boolean',
            'password' => 'hashed',
        ];
    }

    /**
     * Resolve profile photo path to a valid public URL without duplicate storage prefixes.
     */
    public static function resolvePhotoUrl(?string $foto): ?string
    {
        if (empty($foto)) {
            return null;
        }

        if (str_starts_with($foto, 'http://') || str_starts_with($foto, 'https://')) {
            return $foto;
        }

        $clean = ltrim($foto, '/');

        if (str_starts_with($clean, 'storage/')) {
            return asset($clean);
        }

        return asset('storage/'.$clean);
    }

    /**
     * Check if the user is a Super Administrator.
     */
    public function isSuperAdmin(): bool
    {
        return strtoupper((string) ($this->role?->nama_role ?? '')) === 'SUPER_ADMIN';
    }

    /**
     * Get the role associated with the user.
     */
    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class, 'id_role');
    }

    /**
     * Get the staff profile associated with the user.
     */
    public function staf(): BelongsTo
    {
        return $this->belongsTo(Staff::class, 'id_staf');
    }

    /**
     * Alias for staf() relationship.
     */
    public function staff(): BelongsTo
    {
        return $this->staf();
    }

    /**
     * Get all passkeys for the user.
     */
    public function passkeys(): HasMany
    {
        return $this->hasMany(Passkey::class, 'user_id');
    }

    /**
     * Get all visits registered by this user (admin).
     */
    public function visits(): HasMany
    {
        return $this->hasMany(Visit::class, 'id_admin');
    }

    /**
     * Get all medical examinations performed by this user (dokter).
     */
    public function examinations(): HasMany
    {
        return $this->hasMany(Examination::class, 'id_dokter');
    }

    /**
     * Get all inventories managed by this user.
     */
    public function inventories(): HasMany
    {
        return $this->hasMany(Inventory::class, 'id_pengelola');
    }

    /**
     * Get all articles written by this user.
     */
    public function articles(): HasMany
    {
        return $this->hasMany(Article::class, 'id_penulis');
    }

    /**
     * Get all rabies reports logged by this user (admin).
     */
    public function rabiesCases(): HasMany
    {
        return $this->hasMany(RabiesCase::class, 'id_admin');
    }
}
