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
     * Normalisasi nama jenis hewan untuk mendeteksi manipulasi leetspeak, simbol, dan variasi case/spasi.
     */
    public static function normalizeName(string $name): string
    {
        $str = mb_strtolower(trim($name), 'UTF-8');

        // Pemetaan karakter leetspeak & homoglyphs umum ke huruf vokal/konsonan standar
        $replacements = [
            '0' => 'o',
            '1' => 'i',
            '|' => 'i',
            '!' => 'i',
            '3' => 'e',
            '4' => 'a',
            '@' => 'a',
            '5' => 's',
            '$' => 's',
            '6' => 'g',
            '7' => 't',
            '+' => 't',
            '8' => 'b',
            '9' => 'g',
        ];

        $str = strtr($str, $replacements);

        // Hapus semua karakter selain huruf a-z
        $str = preg_replace('/[^a-z]/', '', $str) ?? '';

        // Kompresi huruf berulang berturut-turut (misal: "kuuuciiing" -> "kucing")
        return preg_replace('/(.)\1+/', '$1', $str) ?? '';
    }

    /**
     * Cari jenis hewan yang mirip atau duplikat dengan nama yang diinput.
     */
    public static function findSimilar(string $name, ?int $excludeId = null): ?self
    {
        $cleanInput = trim($name);
        $normalizedInput = self::normalizeName($cleanInput);

        if ($normalizedInput === '') {
            return null;
        }

        $allTypes = self::query()
            ->when($excludeId, fn ($q) => $q->where('id', '!=', $excludeId))
            ->get(['id', 'nama_jenis']);

        foreach ($allTypes as $existing) {
            // 1. Cek kesamaan case-insensitive sederhana
            if (mb_strtolower(trim($existing->nama_jenis), 'UTF-8') === mb_strtolower($cleanInput, 'UTF-8')) {
                return $existing;
            }

            // 2. Cek kesamaan hasil normalisasi leetspeak & kompresi karakter
            $normalizedExisting = self::normalizeName($existing->nama_jenis);
            if ($normalizedInput === $normalizedExisting) {
                return $existing;
            }

            // 3. Cek Levenshtein distance pada string normalisasi jika panjang >= 4
            // Menangkap variasi manipulasi ketikan dengan selisih 1 karakter
            if (strlen($normalizedInput) >= 4 && strlen($normalizedExisting) >= 4) {
                if (levenshtein($normalizedInput, $normalizedExisting) <= 1) {
                    return $existing;
                }
            }
        }

        return null;
    }

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
