<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AnimalType extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'animal_types';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'nama_jenis',
        'keterangan',
    ];

    /**
     * Get all animals belonging to this type.
     */
    public function animals(): HasMany
    {
        return $this->hasMany(Animal::class, 'id_jenis_hewan');
    }

    /**
     * Get all rabies bite cases involving this type of animal.
     */
    public function rabiesCases(): HasMany
    {
        return $this->hasMany(RabiesCase::class, 'id_jenis_hewan');
    }
}
