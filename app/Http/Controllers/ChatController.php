<?php

namespace App\Http\Controllers;

use App\Events\MessageDeleted;
use App\Events\MessageSent;
use App\Models\ChatMessage;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\Rule;

class ChatController extends Controller
{
    /**
     * Memperbarui status aktivitas / online pengguna saat ini di dalam Cache.
     */
    private function touchOnlineStatus(): void
    {
        if ($userId = Auth::id()) {
            Cache::put('user-online-'.$userId, true, now()->addMinutes(3));
        }
    }

    /**
     * Mengambil daftar kontak rekan kerja dan ringkasan pesan grup.
     * Sumber kebenaran tunggal langsung dari database MySQL.
     */
    public function getContacts(Request $request): JsonResponse
    {
        $this->touchOnlineStatus();
        $currentUserId = (int) Auth::id();

        // 1. Ambil daftar staf aktif langsung dari database (tanpa cache basi)
        $users = User::where('status_aktif', true)
            ->where('id', '!=', $currentUserId)
            ->select(['id', 'name', 'email', 'foto', 'id_role', 'id_staf'])
            ->with([
                'role:id,nama_role',
                'staf:id,nama_staf,foto',
            ])
            ->orderBy('id_role', 'asc')
            ->orderBy('name', 'asc')
            ->get();

        // 2. Agregasi unread count langsung via 1 query GROUP BY dari database
        $unreadCounts = ChatMessage::where('receiver_id', $currentUserId)
            ->where('is_read', false)
            ->selectRaw('sender_id, count(*) as count')
            ->groupBy('sender_id')
            ->pluck('count', 'sender_id')
            ->toArray();

        // 3. Ambil pesan terakhir per percakapan langsung dari database (mengabaikan pesan terhapus)
        $recentMessages = ChatMessage::whereNotNull('receiver_id')
            ->where(function ($q) use ($currentUserId) {
                $q->where('sender_id', $currentUserId)
                    ->orWhere('receiver_id', $currentUserId);
            })
            ->latest('id')
            ->take(150)
            ->get();

        $lastMessageMap = [];
        foreach ($recentMessages as $msg) {
            $partnerId = $msg->sender_id === $currentUserId ? $msg->receiver_id : $msg->sender_id;
            if (! isset($lastMessageMap[$partnerId])) {
                $lastMessageMap[$partnerId] = $msg;
            }
        }

        // 4. Petakan data kontak
        $contacts = $users->map(function ($u) use ($unreadCounts, $lastMessageMap) {
            $isOnline = Cache::has('user-online-'.$u->id);
            $unreadCount = (int) ($unreadCounts[$u->id] ?? 0);
            $lastMsg = $lastMessageMap[$u->id] ?? null;

            return [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'foto' => User::resolvePhotoUrl($u->foto ?: $u->staf?->foto),
                'role_name' => $u->role?->nama_role ?? 'USER',
                'staf_name' => $u->staf?->nama_staf,
                'is_online' => $isOnline,
                'unread_count' => $unreadCount,
                'last_message' => $lastMsg ? $lastMsg->message : null,
                'last_message_time' => $lastMsg ? $lastMsg->created_at->setTimezone('Asia/Jakarta')->format('H:i').' WIB' : null,
                'last_message_date' => $lastMsg ? $lastMsg->created_at->setTimezone('Asia/Jakarta')->format('d M Y') : null,
            ];
        });

        // 5. Informasi Grup Puskeswan (1-to-All) langsung dari database
        $lastGroupRead = (int) Cache::get('user-group-read-at-'.$currentUserId, 0);
        $groupUnreadCount = ChatMessage::whereNull('receiver_id')
            ->where('sender_id', '!=', $currentUserId)
            ->where('created_at', '>', Carbon::createFromTimestamp($lastGroupRead))
            ->count();

        $lastGroupMsg = ChatMessage::whereNull('receiver_id')
            ->with(['sender:id,name'])
            ->latest('id')
            ->first();

        $totalDirectUnread = array_sum($unreadCounts);

        // 6. ID pesan masuk terbaru untuk identifikasi notifikasi suara presisi (hanya berbunyi 1x per pesan baru)
        $latestIncomingMessage = ChatMessage::where(function ($q) use ($currentUserId) {
            $q->where('receiver_id', $currentUserId)
                ->orWhereNull('receiver_id');
        })
            ->where('sender_id', '!=', $currentUserId)
            ->latest('id')
            ->first(['id']);
        $latestIncomingId = $latestIncomingMessage?->id ?? 0;

        // 7. Ambil ID pesan yang baru saja dihapus langsung dari database (tombstone 24 jam)
        $deletedIds = ChatMessage::onlyTrashed()
            ->where('deleted_at', '>=', now()->subHours(24))
            ->where(function ($q) use ($currentUserId) {
                $q->where('receiver_id', $currentUserId)
                    ->orWhere('sender_id', $currentUserId)
                    ->orWhereNull('receiver_id');
            })
            ->pluck('id')
            ->toArray();

        return response()->json([
            'contacts' => $contacts,
            'group' => [
                'name' => 'Grup Staf Puskeswan',
                'description' => 'Saluran koordinasi seluruh tenaga staf Puskeswan',
                'unread_count' => $groupUnreadCount,
                'last_message' => $lastGroupMsg ? $lastGroupMsg->message : null,
                'last_sender_name' => $lastGroupMsg?->sender?->name,
                'last_message_time' => $lastGroupMsg ? $lastGroupMsg->created_at->setTimezone('Asia/Jakarta')->format('H:i').' WIB' : null,
            ],
            'direct_unread' => $totalDirectUnread,
            'group_unread' => $groupUnreadCount,
            'total_unread' => $totalDirectUnread + $groupUnreadCount,
            'latest_incoming_id' => $latestIncomingId,
            'deleted_ids' => $deletedIds,
        ]);
    }

    /**
     * Mengambil riwayat pesan percakapan (baik 1-on-1 maupun Grup).
     * Sumber kebenaran tunggal langsung dari database MySQL.
     */
    public function getMessages(Request $request): JsonResponse
    {
        $this->touchOnlineStatus();
        $currentUserId = (int) Auth::id();

        // Validasi parameter input contact_id
        $validated = $request->validate([
            'contact_id' => [
                'nullable',
                'integer',
                'min:1',
                Rule::notIn([$currentUserId]),
                'exists:users,id',
            ],
        ]);

        $contactId = ! empty($validated['contact_id']) ? (int) $validated['contact_id'] : null;

        if ($contactId !== null) {
            // Pastikan penerima berstatus aktif
            $targetUser = User::where('id', $contactId)->where('status_aktif', true)->first();
            if (! $targetUser) {
                return response()->json([
                    'message' => 'Kontak tidak ditemukan atau berstatus nonaktif.',
                ], 404);
            }

            // Tandai pesan dari kontak ini ke saya sebagai sudah dibaca di database
            ChatMessage::where('sender_id', $contactId)
                ->where('receiver_id', $currentUserId)
                ->where('is_read', false)
                ->update([
                    'is_read' => true,
                    'read_at' => now(),
                ]);

            $messages = ChatMessage::where(function ($q) use ($currentUserId, $contactId) {
                $q->where(fn ($sub) => $sub->where('sender_id', $currentUserId)->where('receiver_id', $contactId))
                    ->orWhere(fn ($sub) => $sub->where('sender_id', $contactId)->where('receiver_id', $currentUserId));
            })
                ->with([
                    'sender:id,name,foto,id_role,id_staf',
                    'sender.role:id,nama_role',
                    'sender.staf:id,foto',
                ])
                ->orderBy('id', 'desc')
                ->take(60)
                ->get()
                ->reverse()
                ->values();
        } else {
            // Obrolan Grup Puskeswan (1-to-All)
            Cache::put('user-group-read-at-'.$currentUserId, now()->timestamp, now()->addDays(30));

            $messages = ChatMessage::whereNull('receiver_id')
                ->with([
                    'sender:id,name,foto,id_role,id_staf',
                    'sender.role:id,nama_role',
                    'sender.staf:id,foto',
                ])
                ->orderBy('id', 'desc')
                ->take(60)
                ->get()
                ->reverse()
                ->values();
        }

        // Ambil ID pesan yang baru saja dihapus di database untuk ruang obrolan ini
        $deletedIds = ChatMessage::onlyTrashed()
            ->where('deleted_at', '>=', now()->subHours(24))
            ->where(function ($q) use ($currentUserId, $contactId) {
                if ($contactId !== null) {
                    $q->where(function ($sub) use ($currentUserId, $contactId) {
                        $sub->where('sender_id', $currentUserId)->where('receiver_id', $contactId);
                    })->orWhere(function ($sub) use ($currentUserId, $contactId) {
                        $sub->where('sender_id', $contactId)->where('receiver_id', $currentUserId);
                    });
                } else {
                    $q->whereNull('receiver_id');
                }
            })
            ->pluck('id')
            ->toArray();

        $formatted = $messages->map(function ($msg) use ($currentUserId) {
            $senderFoto = User::resolvePhotoUrl($msg->sender?->foto ?: $msg->sender?->staf?->foto);

            return [
                'id' => $msg->id,
                'sender_id' => $msg->sender_id,
                'receiver_id' => $msg->receiver_id,
                'message' => $msg->message,
                'attachment' => $msg->attachment,
                'is_read' => (bool) $msg->is_read,
                'read_at' => $msg->read_at?->format('H:i'),
                'is_me' => $msg->sender_id === $currentUserId,
                'sender_name' => $msg->sender?->name ?? 'Pengguna',
                'sender_role' => $msg->sender?->role?->nama_role ?? 'STAF',
                'sender_foto' => $senderFoto,
                'created_at' => $msg->created_at->setTimezone('Asia/Jakarta')->format('H:i').' WIB',
                'created_date' => $msg->created_at->setTimezone('Asia/Jakarta')->format('d M Y'),
                'timestamp' => $msg->created_at->toIso8601String(),
            ];
        });

        return response()->json([
            'messages' => $formatted,
            'deleted_ids' => $deletedIds,
        ]);
    }

    /**
     * Mengirim pesan baru ke pengguna lain atau ke grup umum.
     * Dilengkapi validasi ketat dan proteksi anti-spam.
     */
    public function sendMessage(Request $request): JsonResponse
    {
        $this->touchOnlineStatus();
        $currentUserId = (int) Auth::id();

        // 1. Validasi inputan form pengguna
        $validated = $request->validate([
            'receiver_id' => [
                'nullable',
                'integer',
                'min:1',
                Rule::notIn([$currentUserId]),
                'exists:users,id',
            ],
            'message' => ['required', 'string', 'min:1', 'max:2000'],
        ], [
            'receiver_id.not_in' => 'Anda tidak dapat mengirim pesan ke diri Anda sendiri.',
            'receiver_id.exists' => 'Penerima yang dipilih tidak ditemukan dalam sistem.',
            'message.required' => 'Isi pesan tidak boleh kosong.',
            'message.max' => 'Pesan terlalu panjang (maksimal 2000 karakter).',
        ]);

        // 2. Pembersihan & sanitasi teks pesan
        $cleanMessage = trim(strip_tags($validated['message']));
        if ($cleanMessage === '') {
            return response()->json([
                'message' => 'Isi pesan tidak boleh kosong atau hanya berupa spasi.',
                'errors' => ['message' => ['Pesan tidak boleh kosong.']],
            ], 422);
        }

        if (mb_strlen($cleanMessage) > 2000) {
            return response()->json([
                'message' => 'Pesan tidak boleh melebihi 2000 karakter.',
                'errors' => ['message' => ['Maksimal 2000 karakter.']],
            ], 422);
        }

        // 3. Jika receiver_id diisi, pastikan penerima aktif
        $receiverId = ! empty($validated['receiver_id']) ? (int) $validated['receiver_id'] : null;
        if ($receiverId !== null) {
            $receiver = User::where('id', $receiverId)->where('status_aktif', true)->first();
            if (! $receiver) {
                return response()->json([
                    'message' => 'Penerima pesan tidak aktif atau telah dinonaktifkan.',
                    'errors' => ['receiver_id' => ['Pengguna tujuan berstatus nonaktif.']],
                ], 422);
            }
        }

        // 4. Rate Limiting anti-flood (maksimal 40 pesan per menit per akun)
        $rateLimitKey = 'chat_throttle_'.$currentUserId;
        if (RateLimiter::tooManyAttempts($rateLimitKey, 40)) {
            $seconds = RateLimiter::availableIn($rateLimitKey);

            return response()->json([
                'message' => "Anda mengirim pesan terlalu cepat. Harap tunggu {$seconds} detik.",
            ], 429);
        }
        RateLimiter::hit($rateLimitKey, 60);

        // 5. Simpan pesan langsung ke database (sumber kebenaran tunggal)
        $chat = ChatMessage::create([
            'sender_id' => $currentUserId,
            'receiver_id' => $receiverId,
            'message' => $cleanMessage,
            'is_read' => false,
        ]);

        $chat->load([
            'sender:id,name,foto,id_role,id_staf',
            'sender.role:id,nama_role',
            'sender.staf:id,foto',
        ]);

        $senderFoto = User::resolvePhotoUrl($chat->sender?->foto ?: $chat->sender?->staf?->foto);

        $chatData = [
            'id' => $chat->id,
            'sender_id' => $chat->sender_id,
            'receiver_id' => $chat->receiver_id,
            'message' => $chat->message,
            'attachment' => $chat->attachment,
            'is_read' => false,
            'read_at' => null,
            'is_me' => false,
            'sender_name' => $chat->sender?->name ?? 'Pengguna',
            'sender_role' => $chat->sender?->role?->nama_role ?? 'STAF',
            'sender_foto' => $senderFoto,
            'created_at' => $chat->created_at->setTimezone('Asia/Jakarta')->format('H:i').' WIB',
            'created_date' => $chat->created_at->setTimezone('Asia/Jakarta')->format('d M Y'),
            'timestamp' => $chat->created_at->toIso8601String(),
        ];

        // 6. Broadcast via WebSocket jika service Reverb tersedia
        try {
            broadcast(new MessageSent($chatData));
        } catch (\Throwable $e) {
            \Log::warning('WebSocket broadcast error (sendMessage): '.$e->getMessage());
        }

        $responseData = $chatData;
        $responseData['is_me'] = true;

        return response()->json([
            'status' => 'success',
            'data' => $responseData,
        ]);
    }

    /**
     * Menandai pesan telah dibaca secara eksplisit di database.
     */
    public function markAsRead(Request $request): JsonResponse
    {
        $this->touchOnlineStatus();
        $currentUserId = (int) Auth::id();

        $validated = $request->validate([
            'contact_id' => ['nullable', 'integer', 'min:1', 'exists:users,id'],
        ]);

        $contactId = ! empty($validated['contact_id']) ? (int) $validated['contact_id'] : null;

        if ($contactId !== null) {
            ChatMessage::where('sender_id', $contactId)
                ->where('receiver_id', $currentUserId)
                ->where('is_read', false)
                ->update([
                    'is_read' => true,
                    'read_at' => now(),
                ]);
        } else {
            Cache::put('user-group-read-at-'.$currentUserId, now()->timestamp, now()->addDays(30));
        }

        return response()->json(['status' => 'success']);
    }

    /**
     * Hitung total pesan yang belum dibaca langsung dari database untuk polling counter.
     */
    public function unreadCount(Request $request): JsonResponse
    {
        $this->touchOnlineStatus();
        $currentUserId = (int) Auth::id();

        $directUnread = ChatMessage::where('receiver_id', $currentUserId)
            ->where('is_read', false)
            ->count();

        $lastGroupRead = (int) Cache::get('user-group-read-at-'.$currentUserId, 0);
        $groupUnread = ChatMessage::whereNull('receiver_id')
            ->where('sender_id', '!=', $currentUserId)
            ->where('created_at', '>', Carbon::createFromTimestamp($lastGroupRead))
            ->count();

        // ID pesan masuk terbaru untuk identifikasi notifikasi suara presisi (hanya berbunyi 1x per pesan baru)
        $latestIncomingMessage = ChatMessage::where(function ($q) use ($currentUserId) {
            $q->where('receiver_id', $currentUserId)
                ->orWhereNull('receiver_id');
        })
            ->where('sender_id', '!=', $currentUserId)
            ->latest('id')
            ->first(['id']);
        $latestIncomingId = $latestIncomingMessage?->id ?? 0;

        // Sertakan ID pesan yang baru saja dihapus di database
        $deletedIds = ChatMessage::onlyTrashed()
            ->where('deleted_at', '>=', now()->subHours(24))
            ->where(function ($q) use ($currentUserId) {
                $q->where('receiver_id', $currentUserId)
                    ->orWhere('sender_id', $currentUserId)
                    ->orWhereNull('receiver_id');
            })
            ->pluck('id')
            ->toArray();

        return response()->json([
            'total_unread' => $directUnread + $groupUnread,
            'direct_unread' => $directUnread,
            'group_unread' => $groupUnread,
            'latest_incoming_id' => $latestIncomingId,
            'deleted_ids' => $deletedIds,
        ]);
    }

    /**
     * Menghapus pesan secara permanen untuk kedua pihak langsung di database MySQL.
     * Hanya dapat dilakukan oleh Super Administrator.
     */
    public function deleteMessage(int $id): JsonResponse
    {
        /** @var User|null $user */
        $user = Auth::user();
        if (! $user || ! $user->isSuperAdmin()) {
            return response()->json([
                'message' => 'Akses ditolak. Hanya Super Administrator yang berwenang menghapus pesan obrolan.',
            ], 403);
        }

        if ($id <= 0) {
            return response()->json([
                'message' => 'ID pesan tidak valid.',
            ], 422);
        }

        $message = ChatMessage::find($id);
        if (! $message) {
            return response()->json([
                'message' => 'Pesan tidak ditemukan atau telah dihapus sebelumnya.',
            ], 404);
        }

        $deletePayload = [
            'id' => $message->id,
            'sender_id' => $message->sender_id,
            'receiver_id' => $message->receiver_id,
        ];

        // Soft delete di database (sumber kebenaran tunggal MySQL)
        $message->delete();

        // Broadcast via WebSocket
        try {
            broadcast(new MessageDeleted($deletePayload));
        } catch (\Throwable $e) {
            \Log::warning('WebSocket broadcast error (deleteMessage): '.$e->getMessage());
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Pesan berhasil dihapus dari database.',
            'deleted_id' => $id,
        ]);
    }
}
