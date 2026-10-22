<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Animal extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'animals';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'id_pemilik',
        'id_jenis_hewan',
        'no_rm',
        'nama_hewan',
        'jenis_kelamin',
        'umur',
        'warna_hewan',
    ];

    /**
     * Get the owner of this animal.
     */
    public function pemilik(): BelongsTo
    {
        return $this->belongsTo(Owner::class, 'id_pemilik');
    }

    /**
     * Alias for pemilik() relationship.
     */
    public function owner(): BelongsTo
    {
        return $this->pemilik();
    }

    /**
     * Get the animal type / species.
     */
    public function jenisHewan(): BelongsTo
    {
        return $this->belongsTo(AnimalType::class, 'id_jenis_hewan');
    }

    /**
     * Alias for jenisHewan() relationship.
     */
    public function animalType(): BelongsTo
    {
        return $this->jenisHewan();
    }

    /**
     * Get all visits/queues for this animal.
     */
    public function visits(): HasMany
    {
        return $this->hasMany(Visit::class, 'id_hewan');
    }

    /**
     * Generate Nomor Rekam Medis unik berikutnya dengan format RM0001, RM0002, dst.
     */
    public static function generateNextNoRm(): string
    {
        $animals = static::all(['no_rm']);
        $maxNum = 0;

        foreach ($animals as $animal) {
            if (preg_match('/^RM(\d+)$/i', (string) $animal->no_rm, $matches)) {
                $num = (int) $matches[1];
                if ($num > $maxNum) {
                    $maxNum = $num;
                }
            }
        }

        $nextNum = $maxNum + 1;

        return 'RM'.str_pad((string) $nextNum, 4, '0', STR_PAD_LEFT);
    }
}
