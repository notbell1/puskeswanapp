<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Examination extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'examinations';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'id_kunjungan',
        'id_dokter',
        'waktu_selesai',
        'diagnosa',
        'terapi_pengobatan',
        'catatan',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'waktu_selesai' => 'datetime',
        ];
    }

    /**
     * Get the visit associated with this examination.
     */
    public function kunjungan(): BelongsTo
    {
        return $this->belongsTo(Visit::class, 'id_kunjungan');
    }

    /**
     * Alias for kunjungan() relationship.
     */
    public function visit(): BelongsTo
    {
        return $this->kunjungan();
    }

    /**
     * Get the veterinarian doctor who performed this examination.
     */
    public function dokter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'id_dokter');
    }
}
