<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Visit extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'visits';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'id_hewan',
        'id_admin',
        'tgl_kunjungan',
        'berat_badan',
        'suhu_tubuh',
        'anamnesa',
        'status_antrean',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'tgl_kunjungan' => 'datetime',
            'berat_badan' => 'decimal:2',
            'suhu_tubuh' => 'decimal:2',
        ];
    }

    /**
     * Get the animal registered for this visit.
     *
     * @return BelongsTo<Animal, $this>
     */
    public function hewan(): BelongsTo
    {
        return $this->belongsTo(Animal::class, 'id_hewan');
    }

    /**
     * Alias for hewan() relationship to support Eloquent with('animal').
     *
     * @return BelongsTo<Animal, $this>
     */
    public function animal(): BelongsTo
    {
        return $this->hewan();
    }

    /**
     * Get the admin user who created this registration/visit.
     *
     * @return BelongsTo<User, $this>
     */
    public function admin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'id_admin');
    }

    /**
     * Get the medical examination resulting from this visit (1:1).
     *
     * @return HasOne<Examination, $this>
     */
    public function examination(): HasOne
    {
        return $this->hasOne(Examination::class, 'id_kunjungan');
    }
}
