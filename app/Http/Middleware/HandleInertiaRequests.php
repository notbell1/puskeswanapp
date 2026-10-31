<?php

namespace App\Http\Middleware;

use App\Models\ChatMessage;
use App\Models\User;
use App\Models\Visit;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     * Mencegah Information Disclosure dengan hanya membagikan atribut publik yang aman.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        $normalizedRole = null;

        if ($user) {
            $user->loadMissing(['role', 'staf']);
            $rawRole = strtoupper((string) ($user->role?->nama_role ?? ''));

            $normalizedRole = match ($rawRole) {
                'SUPER_ADMIN' => 'super',
                'ADMIN' => 'admin',
                'DOKTER' => 'dokter',
                default => 'admin',
            };

            $roleDisplay = match ($rawRole) {
                'SUPER_ADMIN' => 'Super Administrator',
                'ADMIN' => 'Petugas Administrasi',
                'DOKTER' => 'Dokter Hewan',
                default => 'Pengguna',
            };

            $sharedUser = [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'foto' => User::resolvePhotoUrl($user->foto ?: $user->staf?->foto),
                'role' => $normalizedRole,
                'role_raw' => $rawRole,
                'role_display' => $roleDisplay,
                'staf' => $user->staf ? [
                    'id' => $user->staf->id,
                    'nama_staf' => $user->staf->nama_staf,
                    'jabatan' => $user->staf->jabatan,
                    'nip_strv' => $user->staf->nip_strv,
                ] : null,
            ];
        } else {
            $sharedUser = null;
        }

        $queueSummary = [
            'count' => 0,
            'waiting_list' => [],
        ];

        if ($user && in_array($normalizedRole, ['dokter', 'admin'])) {
            $today = now()->toDateString();
            $queueCount = Visit::whereDate('tgl_kunjungan', $today)
                ->where('status_antrean', 'Antri')
                ->count();

            $waitingList = [];
            if ($queueCount > 0) {
                $waitingList = Visit::with([
                    'animal:id,id_pemilik,id_jenis_hewan,no_rm,nama_hewan',
                    'animal.pemilik:id,nama_lengkap',
                    'animal.jenisHewan:id,nama_jenis',
                ])
                    ->whereDate('tgl_kunjungan', $today)
                    ->where('status_antrean', 'Antri')
                    ->orderBy('tgl_kunjungan', 'asc')
                    ->take(6)
                    ->get([
                        'id',
                        'id_hewan',
                        'tgl_kunjungan',
                        'anamnesa',
                        'status_antrean',
                    ])
                    ->map(fn ($v) => [
                        'id' => $v->id,
                        'no_rm' => $v->animal?->no_rm ?? '-',
                        'nama_hewan' => $v->animal?->nama_hewan ?? 'Hewan Pasien',
                        'jenis_hewan' => $v->animal?->jenisHewan?->nama_jenis ?? 'Hewan',
                        'pemilik' => $v->animal?->pemilik?->nama_lengkap ?? 'Umum',
                        'anamnesa' => $v->anamnesa ?? '-',
                        'jam_kunjungan' => $v->tgl_kunjungan ? $v->tgl_kunjungan->format('H:i').' WIB' : '-',
                        'waktu_relatif' => $v->tgl_kunjungan ? $v->tgl_kunjungan->diffForHumans() : '-',
                    ])
                    ->all();
            }

            $queueSummary = [
                'count' => $queueCount,
                'waiting_list' => $waitingList,
            ];
        }

        // Shared Props untuk Fitur Chat (Model Rekam Medis: Data Kontak & Unread Langsung Ada di Awal)
        $chatSummary = [
            'total_unread' => 0,
            'direct_unread' => 0,
            'group_unread' => 0,
            'contacts' => [],
            'group' => null,
        ];

        if ($user) {
            $currentUserId = $user->id;

            // Sumber kebenaran tunggal langsung dari database MySQL
            $allUsers = User::where('status_aktif', true)
                ->where('id', '!=', $currentUserId)
                ->select(['id', 'name', 'email', 'foto', 'id_role', 'id_staf'])
                ->with([
                    'role:id,nama_role',
                    'staf:id,nama_staf,foto',
                ])
                ->orderBy('id_role', 'asc')
                ->orderBy('name', 'asc')
                ->get();

            $unreadCounts = ChatMessage::where('receiver_id', $currentUserId)
                ->where('is_read', false)
                ->selectRaw('sender_id, count(*) as count')
                ->groupBy('sender_id')
                ->pluck('count', 'sender_id')
                ->toArray();

            $recentMessages = ChatMessage::whereNotNull('receiver_id')
                ->where(function ($q) use ($currentUserId) {
                    $q->where('sender_id', $currentUserId)
                        ->orWhere('receiver_id', $currentUserId);
                })
                ->latest('id')
                ->take(100)
                ->get();

            $lastMessageMap = [];
            foreach ($recentMessages as $msg) {
                $partnerId = $msg->sender_id === $currentUserId ? $msg->receiver_id : $msg->sender_id;
                if (! isset($lastMessageMap[$partnerId])) {
                    $lastMessageMap[$partnerId] = $msg;
                }
            }

            $contacts = $allUsers->map(function ($u) use ($unreadCounts, $lastMessageMap) {
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

            $latestIncomingMessage = ChatMessage::where(function ($q) use ($currentUserId) {
                $q->where('receiver_id', $currentUserId)
                    ->orWhereNull('receiver_id');
            })
                ->where('sender_id', '!=', $currentUserId)
                ->latest('id')
                ->first(['id']);
            $latestIncomingId = $latestIncomingMessage?->id ?? 0;

            $chatSummary = [
                'contacts' => $contacts->all(),
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
            ];
        }

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $sharedUser,
                'chat_summary' => $chatSummary,
            ],
            'queue_summary' => $queueSummary,
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'info' => fn () => $request->session()->get('info'),
            ],
        ];
    }
}
