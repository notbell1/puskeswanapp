<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class ChatMessage extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'chat_messages';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'sender_id',
        'receiver_id',
        'message',
        'attachment',
        'is_read',
        'read_at',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_read' => 'boolean',
            'read_at' => 'datetime',
            'deleted_at' => 'datetime',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    /**
     * Staf pengirim pesan.
     */
    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    /**
     * Staf penerima pesan (null jika grup/semua staf).
     */
    public function receiver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'receiver_id');
    }

    /**
     * Scope untuk pesan obrolan grup bersama (1-to-All).
     */
    public function scopeGroupChat($query)
    {
        return $query->whereNull('receiver_id');
    }

    /**
     * Scope untuk percakapan langsung 1-on-1 antar dua pengguna.
     */
    public function scopeDirectChat($query, int $userA, int $userB)
    {
        return $query->where(function ($q) use ($userA, $userB) {
            $q->where(function ($sub) use ($userA, $userB) {
                $sub->where('sender_id', $userA)->where('receiver_id', $userB);
            })->orWhere(function ($sub) use ($userA, $userB) {
                $sub->where('sender_id', $userB)->where('receiver_id', $userA);
            });
        });
    }
}
