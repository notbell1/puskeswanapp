<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RabiesCase extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'rabies_cases';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'id_admin',
        'id_jenis_hewan',
        'no_surat',
        'lampiran',
        'perihal',
        'nik_pasien',
        'nama_pasien',
        'jenis_kelamin_pasien',
        'umur_pasien',
        'tgl_lahir_pasien',
        'alamat_pasien',
        'no_hp_pasien',
        'lokasi_gigitan',
        'status_var',
        'ras_hewan',
        'jenis_kelamin_hewan',
        'umur_hewan',
        'nama_pemilik_hewan',
        'status_hewan',
        'tgl_kejadian',
        'alamat_kejadian',
        'kronologi',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'tgl_lahir_pasien' => 'date',
            'tgl_kejadian' => 'date',
        ];
    }

    /**
     * Get the admin user who recorded this rabies case.
     */
    public function admin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'id_admin');
    }

    /**
     * Get the animal type / species involved in the bite incident.
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
     * Generate format nomor surat otomatis untuk kasus gigitan rabies:
     * 524/[nomor urutan surat]/Puskeswan/[bulan]/[tahun]
     */
    public static function generateNextNoSurat(): string
    {
        $bulanRomawi = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'][now()->month];
        $year = now()->year;

        $maxNum = 0;
        $allCases = self::pluck('no_surat');
        foreach ($allCases as $no) {
            if (preg_match('/^524\/(\d+)\//', $no, $matches)) {
                $val = (int) $matches[1];
                if ($val > $maxNum) {
                    $maxNum = $val;
                }
            }
        }

        $nextNum = str_pad((string) ($maxNum + 1), 3, '0', STR_PAD_LEFT);

        return "524/{$nextNum}/Puskeswan/{$bulanRomawi}/{$year}";
    }
}
