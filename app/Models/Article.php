<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Article extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'articles';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'id_penulis',
        'id_kategori',
        'id_staf',
        'judul',
        'slug',
        'author_name',
        'ringkasan',
        'isi_berita',
        'gambar',
        'tgl_terbit',
        'status',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'tgl_terbit' => 'date',
        ];
    }

    /**
     * Get the user author of this article.
     */
    public function penulis(): BelongsTo
    {
        return $this->belongsTo(User::class, 'id_penulis');
    }

    /**
     * Get the category of this article.
     */
    public function kategori(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'id_kategori');
    }

    /**
     * Get the staff member credited in this article.
     */
    public function staf(): BelongsTo
    {
        return $this->belongsTo(Staff::class, 'id_staf');
    }
}
