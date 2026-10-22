<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Owner extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'owners';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'nik',
        'nama_lengkap',
        'jenis_kelamin',
        'no_hp_wa',
        'alamat_lengkap',
    ];

    /**
     * Get all animals registered under this owner.
     */
    public function animals(): HasMany
    {
        return $this->hasMany(Animal::class, 'id_pemilik');
    }
}
