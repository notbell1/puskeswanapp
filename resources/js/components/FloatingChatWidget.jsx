import React, { useState, useEffect, useRef, useCallback } from 'react';
import { usePage } from '@inertiajs/react';
import { echo } from '../echo';

// Cache persisten di level browser (sessionStorage) untuk memastikan load instan 0ms
const getStoredCache = (key, fallback) => {
    if (typeof window === 'undefined') return fallback;
    try {
        const item = sessionStorage.getItem(`pw_chat_${key}`);
        return item ? JSON.parse(item) : fallback;
    } catch {
        return fallback;
    }
};

const setStoredCache = (key, data) => {
    if (typeof window === 'undefined') return;
    try {
        sessionStorage.setItem(`pw_chat_${key}`, JSON.stringify(data));
    } catch {
        // Abaikan jika quota penyimpanan penuh
    }
};

const getFallbackBg = (roleName) => {
    switch (roleName) {
        case 'SUPER_ADMIN':
            return 'bg-purple-100 text-purple-900 border border-purple-300 ring-1 ring-purple-200';
        case 'DOKTER':
            return 'bg-emerald-100 text-emerald-900 border border-emerald-300 ring-1 ring-emerald-200';
        default:
            return 'bg-blue-100 text-blue-900 border border-blue-300 ring-1 ring-blue-200';
    }
};

// Komponen Avatar stabil (didefinisikan di luar induk & di-memoize agar HANYA dirender 1x)
const UserAvatar = React.memo(function UserAvatar({ foto, name, roleName, size = 'sm' }) {
    const [imageError, setImageError] = useState(false);
    const dimension =
        size === 'lg' ? 'h-10 w-10 text-xs' : size === 'md' ? 'h-9 w-9 text-[11px]' : 'h-8 w-8 text-[10px]';

    const initials = (name || 'Staf')
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0])
        .join('')
        .toUpperCase();

    if (foto && !imageError) {
        return (
            <img
                src={foto}
                alt={name || 'Avatar'}
                loading="eager"
                decoding="async"
                onError={() => setImageError(true)}
                className={`${dimension} rounded-full object-cover shrink-0 ring-1.5 ring-gray-200/90 shadow-xs`}
            />
        );
    }

    return (
        <div
            className={`${dimension} rounded-full flex items-center justify-center font-extrabold shrink-0 shadow-xs ${getFallbackBg(roleName)}`}
            title={name}
        >
            {initials}
        </div>
    );
});

export default function FloatingChatWidget() {
    const page = usePage();
    const currentUser = page?.props?.auth?.user;
    const initialChatSummary = page?.props?.auth?.chat_summary;

    // Jika pengguna belum login jangan tampilkan widget
    if (!currentUser) {
        return null;
    }

    const isSuperAdmin =
        currentUser?.role === 'super' ||
        currentUser?.role_raw === 'SUPER_ADMIN' ||
        currentUser?.id_role === 1;

    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    // State data percakapan
    const [contacts, setContacts] = useState(
        () => initialChatSummary?.contacts || getStoredCache('contacts', [])
    );
    const [groupInfo, setGroupInfo] = useState(
        () => initialChatSummary?.group || getStoredCache('groupInfo', null)
    );
    const [directUnread, setDirectUnread] = useState(
        () => initialChatSummary?.direct_unread ?? getStoredCache('directUnread', 0)
    );
    const [totalUnread, setTotalUnread] = useState(
        () => initialChatSummary?.total_unread ?? getStoredCache('totalUnread', 0)
    );

    // State ruang obrolan aktif
    const [activeChat, setActiveChat] = useState(null);
    const [activeContact, setActiveContact] = useState(null);
    const [messages, setMessages] = useState([]);
    const [isFetchingMessages, setIsFetchingMessages] = useState(false);

    // State pengetikan pesan
    const [inputText, setInputText] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [deletingMessageId, setDeletingMessageId] = useState(null);

    // Modal konfirmasi hapus pesan untuk Super Admin
    const [confirmDeleteModal, setConfirmDeleteModal] = useState({
        isOpen: false,
        messageId: null,
        messageSnippet: '',
    });

    const messagesEndRef = useRef(null);
    const activeChatRef = useRef(null);
    const messagesCache = useRef({});
    const hasInitializedAudioRef = useRef(false);

    // ID pesan terakhir yang sudah pernah memicu notifikasi suara (disimpan di sessionStorage)
    const lastNotifiedMsgIdRef = useRef(0);
    const isNotificationInitializedRef = useRef(false);

    // Inisialisasi baseline ID notifikasi agar pesan unread lawas tidak berbunyi saat pertama kali memuat halaman
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const saved = sessionStorage.getItem('pw_chat_last_sound_msg_id');
        if (saved) {
            lastNotifiedMsgIdRef.current = Number(saved);
            isNotificationInitializedRef.current = true;
        }
    }, []);

    // Set baseline dari initialChatSummary saat pertama kali render
    useEffect(() => {
        if (initialChatSummary?.latest_incoming_id && !isNotificationInitializedRef.current) {
            const initId = Number(initialChatSummary.latest_incoming_id);
            lastNotifiedMsgIdRef.current = initId;
            isNotificationInitializedRef.current = true;
            try {
                sessionStorage.setItem('pw_chat_last_sound_msg_id', String(initId));
            } catch (e) {}
        }
    }, [initialChatSummary]);

    // Bersihkan cache pesan lawas di browser untuk memastikan database selalu menjadi sumber kebenaran tunggal
    useEffect(() => {
        if (typeof window !== 'undefined') {
            try {
                Object.keys(sessionStorage).forEach((k) => {
                    if (k.startsWith('pw_chat_msgs_')) {
                        sessionStorage.removeItem(k);
                    }
                });
            } catch (e) {

            }
        }
    }, []);

    // Sinkronisasi data awal dari Inertia Shared Props (Model Rekam Medis)
    useEffect(() => {
        if (initialChatSummary) {
            if (Array.isArray(initialChatSummary.contacts) && initialChatSummary.contacts.length > 0) {
                setContacts(initialChatSummary.contacts);
                setStoredCache('contacts', initialChatSummary.contacts);
            }
            if (initialChatSummary.group) {
                setGroupInfo(initialChatSummary.group);
                setStoredCache('groupInfo', initialChatSummary.group);
            }
            if (typeof initialChatSummary.direct_unread === 'number') {
                setDirectUnread(initialChatSummary.direct_unread);
                setStoredCache('directUnread', initialChatSummary.direct_unread);
            }
            if (typeof initialChatSummary.total_unread === 'number') {
                setTotalUnread(initialChatSummary.total_unread);
                setStoredCache('totalUnread', initialChatSummary.total_unread);
            }
        }
    }, [initialChatSummary]);

    const formatWIB = useCallback((dateInput = new Date()) => {
        try {
            const dateObj = typeof dateInput === 'string' || typeof dateInput === 'number' ? new Date(dateInput) : dateInput;
            const timeStr = new Intl.DateTimeFormat('id-ID', {
                timeZone: 'Asia/Jakarta',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
            }).format(dateObj).replace('.', ':');
            return `${timeStr} WIB`;
        } catch (e) {
            const d = new Date();
            const h = String(d.getHours()).padStart(2, '0');
            const m = String(d.getMinutes()).padStart(2, '0');
            return `${h}:${m} WIB`;
        }
    }, []);

    const renderMessageTime = useCallback((msg) => {
        if (!msg) return '';
        if (typeof msg.created_at === 'string' && msg.created_at.includes('WIB')) {
            return msg.created_at;
        }
        if (msg.timestamp) {
            return formatWIB(msg.timestamp);
        }
        if (msg.created_at) {
            return `${msg.created_at} WIB`;
        }
        return formatWIB();
    }, [formatWIB]);

    // State posisi tombol melayang yang dapat digeser (draggable)
    const [btnPos, setBtnPos] = useState({ x: null, y: null });
    const [isDragging, setIsDragging] = useState(false);
    const dragStartRef = useRef({ mouseX: 0, mouseY: 0, btnX: 0, btnY: 0, hasMoved: false });

    const getMinX = useCallback(() => {
        if (typeof window === 'undefined') return 16;
        const sidebarEl = document.querySelector('aside');
        if (sidebarEl) {
            const rect = sidebarEl.getBoundingClientRect();
            if (rect.right > 0 && rect.width > 0) {
                return Math.round(rect.right + 16);
            }
        }
        return 16;
    }, []);

    // Batasi koordinat (clamping) tombol agar selalu berada di area konten yang terlihat dan aman
    const clampPos = useCallback((x, y) => {
        if (typeof window === 'undefined') return { x, y };
        const btnSize = 56;
        const minX = getMinX();
        const maxX = Math.max(minX, window.innerWidth - btnSize - 16);
        const minY = 16;
        const maxY = Math.max(minY, window.innerHeight - btnSize - 16);

        const safeX = typeof x === 'number' ? Math.max(minX, Math.min(maxX, x)) : maxX;
        const safeY = typeof y === 'number' ? Math.max(minY, Math.min(maxY, y)) : maxY;

        return { x: safeX, y: safeY };
    }, [getMinX]);

    // Inisialisasi posisi tombol melayang dari localStorage atau pojok kanan bawah
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const defaultX = window.innerWidth - 76;
        const defaultY = window.innerHeight - 80;

        try {
            const saved = localStorage.getItem('puskeswan_chat_btn_pos');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (typeof parsed?.x === 'number' && typeof parsed?.y === 'number') {
                    const clamped = clampPos(parsed.x, parsed.y);
                    setBtnPos(clamped);
                    return;
                }
            }
        } catch (e) {

        }

        setBtnPos(clampPos(defaultX, defaultY));
    }, [clampPos]);

    // Jaga posisi tombol tetap di luar sidebar saat ukuran layar berubah atau sidebar di-minimize/maximize
    useEffect(() => {
        const updateClampedPos = () => {
            setBtnPos((prev) => {
                if (prev.x === null || prev.y === null) return prev;
                const clamped = clampPos(prev.x, prev.y);
                if (clamped.x !== prev.x || clamped.y !== prev.y) {
                    try {
                        localStorage.setItem('puskeswan_chat_btn_pos', JSON.stringify(clamped));
                    } catch (e) {}
                }
                return clamped;
            });
        };

        window.addEventListener('resize', updateClampedPos);

        const sidebarEl = document.querySelector('aside');
        let observer;
        if (typeof ResizeObserver !== 'undefined' && sidebarEl) {
            observer = new ResizeObserver(() => {
                updateClampedPos();
            });
            observer.observe(sidebarEl);
        }

        const handleTransition = () => {
            updateClampedPos();
        };

        sidebarEl?.addEventListener('transitionend', handleTransition);

        return () => {
            window.removeEventListener('resize', updateClampedPos);
            observer?.disconnect();
            sidebarEl?.removeEventListener('transitionend', handleTransition);
        };
    }, [clampPos]);

    // Handler gesture drag untuk mouse dan touch screen
    const handleDragStart = (e) => {
        if (e.type === 'mousedown' && e.button !== 0) return;

        const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
        const clientY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;

        const currentX = btnPos.x ?? (window.innerWidth - 76);
        const currentY = btnPos.y ?? (window.innerHeight - 80);

        dragStartRef.current = {
            mouseX: clientX,
            mouseY: clientY,
            btnX: currentX,
            btnY: currentY,
            hasMoved: false,
        };

        const handleMove = (moveEvt) => {
            const moveX = moveEvt.type === 'touchmove' ? moveEvt.touches[0].clientX : moveEvt.clientX;
            const moveY = moveEvt.type === 'touchmove' ? moveEvt.touches[0].clientY : moveEvt.clientY;

            const dx = moveX - dragStartRef.current.mouseX;
            const dy = moveY - dragStartRef.current.mouseY;

            if (!dragStartRef.current.hasMoved && Math.hypot(dx, dy) > 5) {
                dragStartRef.current.hasMoved = true;
                setIsDragging(true);
            }

            if (dragStartRef.current.hasMoved) {
                const nextX = dragStartRef.current.btnX + dx;
                const nextY = dragStartRef.current.btnY + dy;
                const clamped = clampPos(nextX, nextY);
                setBtnPos(clamped);
            }
        };

        const handleEnd = () => {
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('mouseup', handleEnd);
            window.removeEventListener('touchmove', handleMove);
            window.removeEventListener('touchend', handleEnd);

            if (dragStartRef.current.hasMoved) {
                setIsDragging(false);
                setBtnPos((latest) => {
                    const clamped = clampPos(latest.x, latest.y);
                    if (clamped.x !== null) {
                        try {
                            localStorage.setItem('puskeswan_chat_btn_pos', JSON.stringify(clamped));
                        } catch (e) {}
                    }
                    return clamped;
                });
                setTimeout(() => {
                    dragStartRef.current.hasMoved = false;
                }, 80);
            }
        };

        window.addEventListener('mousemove', handleMove);
        window.addEventListener('mouseup', handleEnd);
        window.addEventListener('touchmove', handleMove, { passive: false });
        window.addEventListener('touchend', handleEnd);
    };

    // Handler klik tombol floating (memastikan tidak tertrigger saat didrag)
    const handleButtonClick = (e) => {
        if (dragStartRef.current.hasMoved) {
            e?.preventDefault();
            e?.stopPropagation();
            return;
        }
        setIsOpen((prev) => !prev);
        if (!isOpen) {
            fetchContacts();
        }
    };

    // Posisi responsif dialog obrolan mengikuti letak tombol
    const getDialogStyle = () => {
        if (typeof window === 'undefined' || btnPos.x === null || btnPos.y === null) {
            return {};
        }

        const isMobile = window.innerWidth < 640;
        if (isMobile) {
            return {
                left: '12px',
                right: '12px',
                bottom: '84px',
                width: 'calc(100vw - 24px)',
                maxHeight: 'calc(100vh - 100px)',
            };
        }

        const dialogW = 390;
        const dialogH = 540;
        const minX = getMinX();
        const maxX = Math.max(minX, window.innerWidth - dialogW - 16);

        let left;
        // Buka dialog di samping tombol tanpa pernah menutupi atau masuk ke sidebar
        if (btnPos.x + 56 - dialogW >= minX) {
            left = Math.min(maxX, btnPos.x + 56 - dialogW);
        } else {
            left = Math.min(maxX, Math.max(minX, btnPos.x));
        }

        let top;
        if (btnPos.y > window.innerHeight / 2) {
            top = Math.max(16, btnPos.y - dialogH - 12);
        } else {
            top = Math.min(window.innerHeight - dialogH - 16, btnPos.y + 68);
        }

        return {
            left: `${left}px`,
            top: `${top}px`,
            width: `${dialogW}px`,
            height: `${dialogH}px`,
            maxHeight: 'calc(100vh - 40px)',
        };
    };

    // Sinkronisasi ref ruang obrolan aktif
    useEffect(() => {
        activeChatRef.current = activeChat;
    }, [activeChat]);

    // Suara notifikasi pesan masuk mirip WhatsApp (Web Audio API Marimba Dual-Tone Chime)
    const playWhatsAppTone = useCallback(() => {
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (!AudioCtx) return;
            const ctx = new AudioCtx();
            if (ctx.state === 'suspended') {
                ctx.resume();
            }
            const now = ctx.currentTime;

            // Nada 1: Nada G5 ~784 Hz berdurasi singkat
            const osc1 = ctx.createOscillator();
            const gain1 = ctx.createGain();
            osc1.type = 'sine';
            osc1.frequency.setValueAtTime(783.99, now);
            gain1.gain.setValueAtTime(0, now);
            gain1.gain.linearRampToValueAtTime(0.18, now + 0.012);
            gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.075);
            osc1.connect(gain1);
            gain1.connect(ctx.destination);
            osc1.start(now);
            osc1.stop(now + 0.075);

            // Nada 2: Nada C6 ~1046.5 Hz berdentang (chime) jernih WhatsApp
            const osc2 = ctx.createOscillator();
            const gain2 = ctx.createGain();
            osc2.type = 'sine';
            osc2.frequency.setValueAtTime(1046.5, now + 0.075);
            gain2.gain.setValueAtTime(0, now + 0.075);
            gain2.gain.linearRampToValueAtTime(0.24, now + 0.09);
            gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.38);
            osc2.connect(gain2);
            gain2.connect(ctx.destination);
            osc2.start(now + 0.075);
            osc2.stop(now + 0.38);

            // Resonansi harmonik segitiga lembut C7 ~2093 Hz untuk tekstur kaca/lonceng
            const osc3 = ctx.createOscillator();
            const gain3 = ctx.createGain();
            osc3.type = 'triangle';
            osc3.frequency.setValueAtTime(2093, now + 0.075);
            gain3.gain.setValueAtTime(0, now + 0.075);
            gain3.gain.linearRampToValueAtTime(0.05, now + 0.09);
            gain3.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);
            osc3.connect(gain3);
            gain3.connect(ctx.destination);
            osc3.start(now + 0.075);
            osc3.stop(now + 0.28);
        } catch (e) {

        }
    }, []);

    // Membuka blokir AudioContext pada klik pertama pengguna
    useEffect(() => {
        const handleUserInteraction = () => {
            if (!hasInitializedAudioRef.current) {
                hasInitializedAudioRef.current = true;
                try {
                    const AudioCtx = window.AudioContext || window.webkitAudioContext;
                    if (AudioCtx) {
                        const dummyCtx = new AudioCtx();
                        dummyCtx.resume();
                    }
                } catch (e) {
                    // Ignore
                }
            }
        };

        window.addEventListener('click', handleUserInteraction, { once: true });
        return () => window.removeEventListener('click', handleUserInteraction);
    }, []);

    // Helper CSRF Token
    const getCsrfToken = () => {
        return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
    };

    // Pemicu suara notifikasi: HANYA berbunyi 1x per pesan baru dan tidak akan pernah berbunyi lagi sampai ada pesan baru berikutnya
    const notifyNewIncomingMessage = useCallback(
        (incomingMessageId) => {
            const msgId = Number(incomingMessageId);
            if (!msgId || isNaN(msgId) || msgId <= 0) return;

            // Jika belum diinisialisasi (misal buka web pertama kali saat ada pesan belum dibaca), jadikan baseline tanpa membunyikan suara
            if (!isNotificationInitializedRef.current) {
                isNotificationInitializedRef.current = true;
                lastNotifiedMsgIdRef.current = msgId;
                try {
                    sessionStorage.setItem('pw_chat_last_sound_msg_id', String(msgId));
                } catch (e) {}
                return;
            }

            const currentNotified =
                Number(lastNotifiedMsgIdRef.current) ||
                Number(sessionStorage.getItem('pw_chat_last_sound_msg_id') || 0);

            // HANYA bunyikan jika ID pesan ini BENAR-BENAR lebih baru daripada pesan yang pernah dibunyikan
            if (msgId > currentNotified) {
                lastNotifiedMsgIdRef.current = msgId;
                try {
                    sessionStorage.setItem('pw_chat_last_sound_msg_id', String(msgId));
                } catch (e) {}

                playWhatsAppTone();
            }
        },
        [playWhatsAppTone]
    );

    // Ambil daftar kontak & ringkasan grup secara cepat tanpa N+1 query
    const fetchContacts = useCallback(async () => {
        try {
            const res = await fetch('/chat/contacts', {
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });
            if (!res.ok) return;
            const data = await res.json();
            const loadedContacts = data.contacts || [];
            const loadedGroup = data.group || null;
            const directCount = Number(data.direct_unread) || 0;
            const newTotal = Number(data.total_unread) || 0;

            // Perbarui contacts hanya jika ada perubahan isi (mencegah re-render yang tidak perlu)
            setContacts((prev) => {
                if (
                    prev.length === loadedContacts.length &&
                    prev.every((c, i) => {
                        const n = loadedContacts[i];
                        return (
                            c.id === n.id &&
                            c.unread_count === n.unread_count &&
                            c.last_message === n.last_message &&
                            c.last_message_time === n.last_message_time &&
                            c.is_online === n.is_online &&
                            c.foto === n.foto
                        );
                    })
                ) {
                    return prev;
                }
                return loadedContacts;
            });

            setGroupInfo((prev) => {
                if (!prev && !loadedGroup) return null;
                if (
                    prev &&
                    loadedGroup &&
                    prev.unread_count === loadedGroup.unread_count &&
                    prev.last_message === loadedGroup.last_message &&
                    prev.last_message_time === loadedGroup.last_message_time
                ) {
                    return prev;
                }
                return loadedGroup;
            });
            setDirectUnread(directCount);

            // Simpan ke cache sessionStorage untuk instant 0ms load pada render berikutnya
            setStoredCache('contacts', loadedContacts);
            setStoredCache('groupInfo', loadedGroup);
            setStoredCache('directUnread', directCount);
            setStoredCache('totalUnread', newTotal);

            // Notifikasi suara presisi (hanya 1x per pesan baru)
            if (data.latest_incoming_id) {
                notifyNewIncomingMessage(data.latest_incoming_id);
            }
            setTotalUnread(newTotal);

            // Sinkronisasi ID pesan yang dihapus di database
            if (Array.isArray(data.deleted_ids) && data.deleted_ids.length > 0) {
                const delSet = new Set(data.deleted_ids.map(Number));
                setMessages((prev) => prev.filter((m) => !delSet.has(Number(m.id))));
                Object.keys(messagesCache.current).forEach((k) => {
                    messagesCache.current[k] = (messagesCache.current[k] || []).filter(
                        (m) => !delSet.has(Number(m.id))
                    );
                });
            }
        } catch (err) {
            // Silently handle error
        }
    }, [notifyNewIncomingMessage]);

    // Ambil riwayat pesan dalam percakapan aktif langsung dari database MySQL (sumber kebenaran tunggal)
    const fetchMessages = useCallback(
        async (chatKey, silent = false) => {
            if (!chatKey) return;

            try {
                const url =
                    chatKey === 'group'
                        ? '/chat/messages'
                        : `/chat/messages?contact_id=${chatKey}`;

                const res = await fetch(url, {
                    headers: {
                        Accept: 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                });

                if (!res.ok) return;
                const data = await res.json();
                const fetchedMsgs = data.messages || [];

                // Simpan ke cache memori sesi aktif
                messagesCache.current[chatKey] = fetchedMsgs;

                // Sinkronisasi pesan yang dihapus di database
                if (Array.isArray(data.deleted_ids) && data.deleted_ids.length > 0) {
                    const delSet = new Set(data.deleted_ids.map(Number));
                    Object.keys(messagesCache.current).forEach((k) => {
                        messagesCache.current[k] = (messagesCache.current[k] || []).filter(
                            (m) => !delSet.has(Number(m.id))
                        );
                    });
                }

                // GUARD RACE CONDITION: Hanya perbarui state jika pengguna MASIH membuka ruang chatKey ini!
                if (activeChatRef.current !== chatKey) {
                    return;
                }

                // Perbarui messages hanya jika ada perubahan isi (mencegah re-render yang tidak perlu)
                setMessages((prev) => {
                    const nextList = messagesCache.current[chatKey] || fetchedMsgs;
                    if (prev.length === nextList.length) {
                        const isIdentical = prev.every((m, idx) => {
                            const f = nextList[idx];
                            return (
                                m.id === f.id &&
                                m.is_read === f.is_read &&
                                m.message === f.message &&
                                m.sender_foto === f.sender_foto
                            );
                        });
                        if (isIdentical) return prev;
                    }
                    return nextList;
                });

                // Deteksi pesan baru dari orang lain untuk memicu nada dering WhatsApp 1x
                if (fetchedMsgs.length > 0) {
                    const incomingMsgs = fetchedMsgs.filter((m) => !m.is_me);
                    if (incomingMsgs.length > 0) {
                        const maxIncomingId = Math.max(...incomingMsgs.map((m) => Number(m.id)));
                        notifyNewIncomingMessage(maxIncomingId);
                    }
                }

                // Perbarui unread lokal di kontak
                if (chatKey !== 'group') {
                    setContacts((prev) =>
                        prev.map((c) => (c.id === chatKey ? { ...c, unread_count: 0 } : c))
                    );
                } else {
                    setGroupInfo((prev) => (prev ? { ...prev, unread_count: 0 } : null));
                }
            } catch (err) {
                // Silently handle error
            }
        },
        [notifyNewIncomingMessage]
    );

    // Cek unread counter ringan saat widget tertutup langsung dari database
    const fetchUnreadCount = useCallback(async () => {
        try {
            const res = await fetch('/chat/unread-count', {
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });
            if (!res.ok) return;
            const data = await res.json();
            const newTotal = Number(data.total_unread) || 0;
            setDirectUnread(Number(data.direct_unread) || 0);

            // Notifikasi suara presisi (hanya 1x per pesan baru)
            if (data.latest_incoming_id) {
                notifyNewIncomingMessage(data.latest_incoming_id);
            }
            setTotalUnread(newTotal);

            // Sinkronisasi ID pesan yang dihapus di database
            if (Array.isArray(data.deleted_ids) && data.deleted_ids.length > 0) {
                const delSet = new Set(data.deleted_ids.map(Number));
                setMessages((prev) => prev.filter((m) => !delSet.has(Number(m.id))));
                Object.keys(messagesCache.current).forEach((k) => {
                    messagesCache.current[k] = (messagesCache.current[k] || []).filter(
                        (m) => !delSet.has(Number(m.id))
                    );
                });
            }
        } catch (err) {
            // Silently handle error
        }
    }, [notifyNewIncomingMessage]);

    // Handler pesan masuk real-time via WebSocket
    const handleIncomingMessage = useCallback(
        (newMsg) => {
            if (!newMsg) return;
            const isFromMe = Number(newMsg.sender_id) === Number(currentUser.id);
            const isGroup = !newMsg.receiver_id;
            const chatKey = isGroup ? 'group' : isFromMe ? newMsg.receiver_id : newMsg.sender_id;

            // Simpan ke cache memori lokal
            if (messagesCache.current[chatKey]) {
                const existing = messagesCache.current[chatKey];
                if (!existing.some((m) => m.id === newMsg.id)) {
                    messagesCache.current[chatKey] = [...existing, { ...newMsg, is_me: isFromMe }];
                }
            }

            // Jika pengguna saat ini sedang membuka ruang chat tersebut
            if (activeChatRef.current === chatKey) {
                setMessages((prev) => {
                    if (prev.some((m) => m.id === newMsg.id)) return prev;
                    return [...prev, { ...newMsg, is_me: isFromMe }];
                });

                if (!isFromMe) {
                    notifyNewIncomingMessage(newMsg.id);
                    fetch('/chat/mark-as-read', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Accept: 'application/json',
                            'X-CSRF-TOKEN': getCsrfToken(),
                            'X-Requested-With': 'XMLHttpRequest',
                        },
                        body: JSON.stringify({
                            contact_id: isGroup ? null : newMsg.sender_id,
                        }),
                    }).catch(() => {});
                }
            } else {
                // Di luar ruang chat: bunyikan notifikasi presisi 1x dan perbarui kontak
                if (!isFromMe) {
                    notifyNewIncomingMessage(newMsg.id);
                    fetchContacts();
                }
            }
        },
        [currentUser.id, fetchContacts, notifyNewIncomingMessage]
    );

    // Handler pesan dihapus real-time via WebSocket
    const handleDeletedMessage = useCallback(
        (payload) => {
            if (!payload || !payload.id) return;
            const deletedId = Number(payload.id);

            // Hapus dari semua cache memori
            Object.keys(messagesCache.current).forEach((key) => {
                messagesCache.current[key] = (messagesCache.current[key] || []).filter(
                    (m) => m.id !== deletedId
                );
            });

            // Hapus langsung dari tampilan obrolan aktif
            setMessages((prev) => prev.filter((m) => m.id !== deletedId));

            // Refresh ringkasan kontak dari database
            fetchContacts();
        },
        [fetchContacts]
    );

    // Langganan channel WebSocket Reverb secara real-time
    useEffect(() => {
        if (!currentUser?.id) return;

        try {
            const groupChan = echo.private('chat.group');
            groupChan.listen('.message.sent', (e) => {
                handleIncomingMessage(e.message);
            });
            groupChan.listen('.message.deleted', (e) => {
                handleDeletedMessage(e.payload);
            });

            const userChan = echo.private(`chat.user.${currentUser.id}`);
            userChan.listen('.message.sent', (e) => {
                handleIncomingMessage(e.message);
            });
            userChan.listen('.message.deleted', (e) => {
                handleDeletedMessage(e.payload);
            });

            return () => {
                try {
                    echo.leave('chat.group');
                    echo.leave(`chat.user.${currentUser.id}`);
                } catch (e) {
                    // Abaikan kesalahan penutupan channel
                }
            };
        } catch (err) {
            // Abaikan kesalahan koneksi Reverb; polling fallback tetap aktif
        }
    }, [currentUser?.id, handleIncomingMessage, handleDeletedMessage]);

    // Efek polling berkala responsif (Ultra-Fast Smart Polling langsung ke database)
    useEffect(() => {
        let timer;
        if (isOpen) {
            if (activeChat) {
                // Di ruang obrolan: poll pesan langsung dari database setiap 1.2 detik (ultra-responsif & bebas delay)
                timer = setInterval(() => {
                    fetchMessages(activeChat, true);
                }, 1200);
            } else {
                // Di daftar kontak: poll kontak setiap 2.0 detik
                timer = setInterval(() => {
                    fetchContacts();
                }, 2000);
            }
        } else {
            // Widget tertutup: poll unread badge setiap 2.5 detik
            timer = setInterval(() => {
                fetchUnreadCount();
            }, 2500);
        }

        return () => clearInterval(timer);
    }, [isOpen, activeChat, fetchContacts, fetchMessages, fetchUnreadCount]);

    // Ambil data kontak awal saat halaman dimuat
    useEffect(() => {
        fetchContacts();
    }, [fetchContacts]);

    // Auto-scroll ke pesan terbawah saat percakapan bertambah
    useEffect(() => {
        if (activeChat && messages.length > 0) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, activeChat]);

    // Handler buka obrolan grup secara instan (database sebagai sumber kebenaran)
    const handleOpenGroupChat = () => {
        activeChatRef.current = 'group';
        setActiveChat('group');
        setActiveContact(null);
        setInputText('');

        const cached = messagesCache.current['group'];
        if (cached && cached.length > 0) {
            setMessages(cached);
            setIsFetchingMessages(false);
            fetchMessages('group', true); // sync mutakhir dari database
        } else {
            setMessages([]);
            setIsFetchingMessages(true);
            fetchMessages('group').finally(() => {
                if (activeChatRef.current === 'group') {
                    setIsFetchingMessages(false);
                }
            });
        }
    };

    // Handler buka obrolan 1-on-1 dengan kontak (database sebagai sumber kebenaran)
    const handleOpenDirectChat = (contact) => {
        activeChatRef.current = contact.id;
        setActiveChat(contact.id);
        setActiveContact(contact);
        setInputText('');

        const cached = messagesCache.current[contact.id];
        if (cached && cached.length > 0) {
            setMessages(cached);
            setIsFetchingMessages(false);
            fetchMessages(contact.id, true); // sync mutakhir dari database
        } else {
            setMessages([]);
            setIsFetchingMessages(true);
            fetchMessages(contact.id).finally(() => {
                if (activeChatRef.current === contact.id) {
                    setIsFetchingMessages(false);
                }
            });
        }
    };

    // Kembali ke daftar kontak
    const handleBackToList = () => {
        activeChatRef.current = null;
        setActiveChat(null);
        setActiveContact(null);
        setMessages([]); // Bersihkan pesan saat kembali ke daftar
        setInputText(''); // Bersihkan draf teks
        fetchContacts();
    };

    // Kirim pesan dengan validasi input ketat & UI Optimistik instan
    const handleSendMessage = async (e) => {
        e?.preventDefault();
        const text = inputText.trim();
        const currentTarget = activeChat;
        if (!text || isSending || !currentTarget) return;

        // Validasi input di sisi klien
        if (text.length > 2000) {
            alert('Pesan tidak boleh melebihi 2000 karakter.');
            return;
        }

        setIsSending(true);
        const receiverId = currentTarget === 'group' ? null : currentTarget;

        // UI Optimistik: Munculkan pesan langsung di layar tanpa jeda
        const tempId = Date.now();
        const tempMsg = {
            id: tempId,
            sender_id: currentUser.id,
            receiver_id: receiverId,
            message: text,
            is_me: true,
            is_read: false,
            sender_name: currentUser.name,
            sender_role: currentUser.role_display || 'STAF',
            sender_foto: currentUser.foto || null,
            created_at: formatWIB(),
            timestamp: new Date().toISOString(),
        };

        const currentList = messagesCache.current[currentTarget] || messages || [];
        const updated = [...currentList, tempMsg];
        messagesCache.current[currentTarget] = updated;

        if (activeChatRef.current === currentTarget) {
            setMessages(updated);
            setInputText('');
        }

        try {
            const res = await fetch('/chat/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
                body: JSON.stringify({
                    receiver_id: receiverId,
                    message: text,
                }),
            });

            if (res.ok) {
                const result = await res.json();
                if (result.data) {
                    const cached = messagesCache.current[currentTarget] || [];
                    const replaced = cached.map((m) => (m.id === tempId ? result.data : m));
                    messagesCache.current[currentTarget] = replaced;

                    if (activeChatRef.current === currentTarget) {
                        setMessages(replaced);
                    }
                }
            } else {
                // Jika ditolak server (misal validasi 422 atau rate limit 429), tarik kembali pesan optimistik
                const errData = await res.json().catch(() => ({}));
                setMessages((prev) => prev.filter((m) => m.id !== tempId));
                if (messagesCache.current[currentTarget]) {
                    messagesCache.current[currentTarget] = messagesCache.current[currentTarget].filter(
                        (m) => m.id !== tempId
                    );
                }
                const errMsg = errData.message || errData.errors?.message?.[0] || 'Gagal mengirim pesan.';
                alert(errMsg);
            }
        } catch (err) {
            // Silently handle network error
        } finally {
            setIsSending(false);
        }
    };

    // Handler buka modal konfirmasi hapus pesan untuk Super Admin
    const handleRequestDelete = (msg) => {
        if (!isSuperAdmin) return;
        setConfirmDeleteModal({
            isOpen: true,
            messageId: msg.id,
            messageSnippet: msg.message.length > 60 ? msg.message.slice(0, 60) + '...' : msg.message,
        });
    };

    // Konfirmasi hapus pesan permanen oleh Super Admin (database sebagai sumber kebenaran)
    const handleConfirmDeleteMessage = async () => {
        const idToDelete = confirmDeleteModal.messageId;
        if (!idToDelete || !isSuperAdmin) return;

        setDeletingMessageId(idToDelete);
        setConfirmDeleteModal({ isOpen: false, messageId: null, messageSnippet: '' });

        // Optimistik hapus dari antarmuka langsung
        setMessages((prev) => prev.filter((m) => m.id !== idToDelete));
        if (activeChat && messagesCache.current[activeChat]) {
            messagesCache.current[activeChat] = messagesCache.current[activeChat].filter(
                (m) => m.id !== idToDelete
            );
        }

        try {
            const res = await fetch(`/chat/messages/${idToDelete}`, {
                method: 'DELETE',
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
            });

            if (!res.ok) {
                // Jika gagal, tarik ulang pesan terbaru dari database
                fetchMessages(activeChat, true);
            } else {
                fetchContacts(); // perbarui status & ringkasan pesan di daftar kontak
            }
        } catch (err) {
            fetchMessages(activeChat, true);
        } finally {
            setDeletingMessageId(null);
        }
    };

    // Filter daftar kontak berdasarkan input pencarian
    const filteredContacts = contacts.filter((c) => {
        const q = searchQuery.toLowerCase();
        const matchesSearch =
            c.name.toLowerCase().includes(q) ||
            c.role_name.toLowerCase().includes(q) ||
            (c.staf_name && c.staf_name.toLowerCase().includes(q));

        return matchesSearch;
    });

    const getRoleBadgeStyle = (roleName) => {
        switch (roleName) {
            case 'SUPER_ADMIN':
                return 'bg-purple-50 text-purple-800 border-purple-200';
            case 'DOKTER':
                return 'bg-emerald-50 text-emerald-800 border-emerald-200';
            default:
                return 'bg-blue-50 text-blue-800 border-blue-200';
        }
    };

    const getRoleLabel = (roleName) => {
        switch (roleName) {
            case 'SUPER_ADMIN':
                return 'Super Admin';
            case 'DOKTER':
                return 'Dokter Hewan';
            default:
                return 'Petugas Loket';
        }
    };

    return (
        <>
            {/* JENDELA DOCK FLOATING CHAT (Tetap termount di DOM agar foto profil tidak di-load ulang saat tutup/buka) */}
            <div
                style={{
                    ...getDialogStyle(),
                    display: isOpen ? 'flex' : 'none',
                }}
                className="fixed z-50 flex-col bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden transition-all duration-200"
                role="dialog"
                aria-label="Obrolan Internal Puskeswan"
                aria-hidden={!isOpen}
            >
                {/* HEADER WIDGET */}
                    <div className="bg-gradient-to-r from-purple-700 via-purple-600 to-indigo-700 text-white px-3.5 py-3 flex items-center justify-between shrink-0 shadow-xs select-none">
                        {activeChat ? (
                            <div className="flex items-center gap-2.5 min-w-0">
                                <button
                                    type="button"
                                    onClick={handleBackToList}
                                    className="p-1 rounded-lg hover:bg-white/15 text-white transition-colors"
                                    title="Kembali ke daftar kontak"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>

                                {/* Foto & Info Kontak di Header Chat Room */}
                                <div className="relative shrink-0">
                                    {activeChat === 'group' ? (
                                        <div className="h-9 w-9 rounded-xl bg-white/20 text-white flex items-center justify-center font-bold shadow-xs">
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                        </div>
                                    ) : (
                                        <div className="relative">
                                            <UserAvatar
                                                foto={activeContact?.foto}
                                                name={activeContact?.name}
                                                roleName={activeContact?.role_name}
                                                size="md"
                                            />
                                            <span
                                                className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-purple-700 ${
                                                    activeContact?.is_online ? 'bg-emerald-400' : 'bg-gray-400'
                                                }`}
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="min-w-0">
                                    <h4 className="text-xs sm:text-sm font-bold truncate leading-tight">
                                        {activeChat === 'group' ? 'Grup Staf Puskeswan' : activeContact?.name}
                                    </h4>
                                    <p className="text-[10.5px] text-purple-200 truncate leading-tight flex items-center gap-1.5 mt-0.5">
                                        {activeChat === 'group' ? (
                                            '📢 Ruang Koordinasi Seluruh Staf'
                                        ) : (
                                            <>
                                                <span>{getRoleLabel(activeContact?.role_name)}</span>
                                                <span>•</span>
                                                <span className={`inline-flex items-center gap-1 ${activeContact?.is_online ? 'text-emerald-300 font-semibold' : 'text-purple-200'}`}>
                                                    <span className={`h-1.5 w-1.5 rounded-full ${activeContact?.is_online ? 'bg-emerald-400' : 'bg-gray-400'}`} />
                                                    {activeContact?.is_online ? 'Aktif' : 'Offline'}
                                                </span>
                                            </>
                                        )}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/15 text-white">
                                    <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="text-xs sm:text-sm font-bold leading-tight">
                                        Obrolan Internal
                                    </h4>
                                    <p className="text-[10px] text-purple-200 leading-tight">
                                        UPT Puskeswan & Inseminasi Buatan
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="p-1 rounded-lg hover:bg-white/15 text-white transition-colors"
                                title="Tutup Obrolan"
                            >
                                <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* KONTEN UTAMA */}
                    {!activeChat ? (
                        /* TAMPILAN 1: DAFTAR KONTAK & RUANG GRUP */
                        <div className="flex-1 flex flex-col min-h-0 bg-white">
                            {/* PENCARIAN & TAB FILTER DENGAN ANGKA UNREAD */}
                            <div className="p-2.5 border-b border-gray-150 bg-gray-50/80 space-y-2">
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </span>
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Cari rekan kerja atau dokter..."
                                        className="h-9 w-full rounded-lg border border-gray-200 bg-white pl-8 pr-7 text-xs text-gray-800 placeholder:text-gray-400 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all"
                                    />
                                    {searchQuery && (
                                        <button
                                            type="button"
                                            onClick={() => setSearchQuery('')}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                                        >
                                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    )}
                                </div>

                                {/* TAB FILTER DENGAN TANDA ANGKA (UNREAD BADGE) */}
                                <div className="flex gap-1.5">
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('all')}
                                        className={`flex-1 py-1 rounded-md text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all ${
                                            activeTab === 'all'
                                                ? 'bg-purple-600 text-white shadow-xs'
                                                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                                        }`}
                                    >
                                        <span>Semua</span>
                                        {totalUnread > 0 && (
                                            <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-extrabold ${activeTab === 'all' ? 'bg-white text-purple-700' : 'bg-rose-500 text-white'}`}>
                                                {totalUnread > 99 ? '99+' : totalUnread}
                                            </span>
                                        )}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('group')}
                                        className={`flex-1 py-1 rounded-md text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all ${
                                            activeTab === 'group'
                                                ? 'bg-purple-600 text-white shadow-xs'
                                                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                                        }`}
                                    >
                                        <span>Grup Staf</span>
                                        {Number(groupInfo?.unread_count) > 0 && (
                                            <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-extrabold ${activeTab === 'group' ? 'bg-white text-purple-700' : 'bg-rose-500 text-white'}`}>
                                                {groupInfo.unread_count}
                                            </span>
                                        )}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('direct')}
                                        className={`flex-1 py-1 rounded-md text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all ${
                                            activeTab === 'direct'
                                                ? 'bg-purple-600 text-white shadow-xs'
                                                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                                        }`}
                                    >
                                        <span>Pribadi</span>
                                        {directUnread > 0 && (
                                            <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-extrabold ${activeTab === 'direct' ? 'bg-white text-purple-700' : 'bg-rose-500 text-white'}`}>
                                                {directUnread > 99 ? '99+' : directUnread}
                                            </span>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* DAFTAR KONTAK BERGULIR */}
                            <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
                                {/* CARD SALURAN GRUP (1-TO-ALL) */}
                                {(activeTab === 'all' || activeTab === 'group') && (
                                    <button
                                        type="button"
                                        onClick={handleOpenGroupChat}
                                        className="w-full text-left p-2.5 hover:bg-purple-50/50 transition-colors flex items-center gap-2.5 border-b border-gray-150 group"
                                    >
                                        <div className="relative shrink-0">
                                            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center font-bold shadow-xs group-hover:scale-105 transition-transform">
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                                </svg>
                                            </div>
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center justify-between gap-1">
                                                <h5 className="text-xs font-bold text-gray-900 group-hover:text-purple-700 transition-colors truncate">
                                                    Grup Staf Puskeswan
                                                </h5>
                                                {groupInfo?.last_message_time && (
                                                    <span className="text-[10px] text-gray-400 font-medium shrink-0">
                                                        {groupInfo.last_message_time}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-[11px] text-gray-500 truncate mt-0.5 leading-snug">
                                                {groupInfo?.last_message ? (
                                                    <>
                                                        <span className="font-semibold text-gray-700">{groupInfo.last_sender_name}: </span>
                                                        {groupInfo.last_message}
                                                    </>
                                                ) : (
                                                    'Ruang koordinasi terbuka untuk seluruh staf...'
                                                )}
                                            </p>
                                        </div>
                                        {Number(groupInfo?.unread_count) > 0 && (
                                            <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-extrabold text-white shadow-xs shrink-0 ring-1 ring-white">
                                                {groupInfo.unread_count}
                                            </span>
                                        )}
                                    </button>
                                )}

                                {/* DAFTAR KONTAK 1-ON-1 */}
                                {(activeTab === 'all' || activeTab === 'direct') && (
                                    <>
                                        {filteredContacts.length === 0 ? (
                                            <div className="py-12 text-center px-4">
                                                <p className="text-xs text-gray-400 font-medium">
                                                    {searchQuery
                                                        ? `Tidak ada kontak yang cocok dengan "${searchQuery}"`
                                                        : 'Belum ada rekan staf lainnya.'}
                                                </p>
                                            </div>
                                        ) : (
                                            filteredContacts.map((contact) => (
                                                <button
                                                    key={contact.id}
                                                    type="button"
                                                    onClick={() => handleOpenDirectChat(contact)}
                                                    className="w-full text-left p-2.5 hover:bg-gray-50 transition-colors flex items-center gap-2.5 group"
                                                >
                                                    <div className="relative shrink-0">
                                                        <UserAvatar
                                                            foto={contact.foto}
                                                            name={contact.name}
                                                            roleName={contact.role_name}
                                                            size="lg"
                                                        />
                                                        {/* Indikator Online/Offline */}
                                                        <span
                                                            className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full ring-2 ring-white ${
                                                                contact.is_online ? 'bg-emerald-500' : 'bg-gray-300'
                                                            }`}
                                                            title={contact.is_online ? 'Aktif' : 'Offline'}
                                                        />
                                                    </div>

                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-center justify-between gap-1">
                                                            <h5 className="text-xs font-bold text-gray-900 group-hover:text-purple-700 transition-colors truncate">
                                                                {contact.name}
                                                            </h5>
                                                            {contact.last_message_time && (
                                                                <span className="text-[10px] text-gray-400 font-medium shrink-0">
                                                                    {contact.last_message_time}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-1.5 mt-0.5">
                                                            <span className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded border shrink-0 ${getRoleBadgeStyle(contact.role_name)}`}>
                                                                {getRoleLabel(contact.role_name)}
                                                            </span>
                                                            <p className="text-[11px] text-gray-500 truncate leading-snug">
                                                                {contact.last_message || 'Belum ada percakapan...'}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* ANGKA UNREAD DITANDAI DENGAN JELAS */}
                                                    {Number(contact.unread_count) > 0 && (
                                                        <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-extrabold text-white shadow-xs shrink-0 ring-1 ring-white animate-pulse">
                                                            {contact.unread_count > 99 ? '99+' : contact.unread_count}
                                                        </span>
                                                    )}
                                                </button>
                                            ))
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    ) : (
                        /* TAMPILAN 2: RUANG OBROLAN AKTIF (CHAT ROOM) */
                        <div className="flex-1 flex flex-col min-h-0 bg-slate-50/70">
                            {/* AREA BUBBLE PESAN DENGAN FOTO PENGIRIM */}
                            <div className="flex-1 overflow-y-auto p-3 space-y-3">
                                {isFetchingMessages && messages.length === 0 ? (
                                    <div className="py-6 px-2 space-y-3.5 animate-pulse">
                                        <div className="flex items-end gap-2 justify-start">
                                            <div className="h-8 w-8 rounded-full bg-gray-200 shrink-0" />
                                            <div className="space-y-1 max-w-[65%]">
                                                <div className="h-2.5 w-16 bg-gray-200 rounded" />
                                                <div className="h-9 w-44 rounded-2xl bg-gray-200/90 rounded-bl-xs" />
                                            </div>
                                        </div>
                                        <div className="flex items-end gap-2 justify-end">
                                            <div className="h-9 w-36 rounded-2xl bg-purple-200/80 rounded-br-xs" />
                                            <div className="h-8 w-8 rounded-full bg-purple-200 shrink-0" />
                                        </div>
                                        <div className="flex items-end gap-2 justify-start">
                                            <div className="h-8 w-8 rounded-full bg-gray-200 shrink-0" />
                                            <div className="space-y-1 max-w-[70%]">
                                                <div className="h-2.5 w-20 bg-gray-200 rounded" />
                                                <div className="h-11 w-52 rounded-2xl bg-gray-200/90 rounded-bl-xs" />
                                            </div>
                                        </div>
                                    </div>
                                ) : messages.length === 0 ? (
                                    <div className="py-14 text-center px-4">
                                        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-purple-50 text-purple-600 mb-2 border border-purple-100">
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                            </svg>
                                        </div>
                                        <h5 className="text-xs font-bold text-gray-700">Mulai Percakapan</h5>
                                        <p className="text-[11px] text-gray-400 mt-0.5">
                                            {activeChat === 'group'
                                                ? 'Sampaikan koordinasi atau pengumuman tim di sini.'
                                                : `Sapa ${activeContact?.name} untuk berkoordinasi.`}
                                        </p>
                                    </div>
                                ) : (
                                    messages.map((msg, idx) => (
                                        <div
                                            key={msg.id || idx}
                                            className={`flex items-end gap-2 group/msg ${
                                                msg.is_me ? 'justify-end' : 'justify-start'
                                            }`}
                                        >
                                            {/* Foto Pengirim untuk pesan orang lain (di sebelah kiri bubble) */}
                                            {!msg.is_me && (
                                                <UserAvatar
                                                    foto={msg.sender_foto}
                                                    name={msg.sender_name}
                                                    roleName={msg.sender_role}
                                                    size="sm"
                                                />
                                            )}

                                            <div className={`max-w-[75%] flex flex-col ${msg.is_me ? 'items-end' : 'items-start'}`}>
                                                {/* Nama & Role Pengirim jika pesan orang lain */}
                                                {!msg.is_me && (
                                                    <div className="flex items-center gap-1.5 mb-1 px-1">
                                                        <span className="text-[10.5px] font-bold text-gray-800">
                                                            {msg.sender_name}
                                                        </span>
                                                        <span className={`text-[8.5px] font-bold px-1.5 py-0.5 rounded border ${getRoleBadgeStyle(msg.sender_role)}`}>
                                                            {getRoleLabel(msg.sender_role)}
                                                        </span>
                                                    </div>
                                                )}

                                                <div className="relative group/bubble">
                                                    {/* BUBBLE PESAN */}
                                                    <div
                                                        className={`px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed break-words shadow-xs ${
                                                            msg.is_me
                                                                ? 'bg-purple-600 text-white rounded-br-xs'
                                                                : 'bg-white text-gray-900 border border-gray-200/90 rounded-bl-xs'
                                                        }`}
                                                    >
                                                        <p className={`whitespace-pre-wrap font-normal ${msg.is_me ? 'text-white' : 'text-gray-800'}`}>
                                                            {msg.message}
                                                        </p>
                                                        <div
                                                            className={`flex items-center justify-end gap-1.5 mt-1.5 text-[10px] font-medium ${
                                                                msg.is_me ? 'text-purple-200' : 'text-gray-500'
                                                            }`}
                                                        >
                                                            <span>{renderMessageTime(msg)}</span>
                                                            {msg.is_me && (
                                                                <span title={msg.is_read ? 'Telah dibaca' : 'Terkirim'}>
                                                                    <svg className={`h-3.5 w-3.5 ${msg.is_read ? 'text-emerald-300' : 'text-purple-200'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                                                                    </svg>
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* TOMBOL HAPUS PESAN KHUSUS SUPER ADMIN */}
                                                    {isSuperAdmin && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRequestDelete(msg)}
                                                            className={`absolute top-1/2 -translate-y-1/2 opacity-0 group-hover/msg:opacity-100 transition-opacity p-1 rounded-md bg-white text-rose-500 hover:text-rose-700 hover:bg-rose-50 border border-gray-200 shadow-xs ${
                                                                msg.is_me ? '-left-7' : '-right-7'
                                                            }`}
                                                            title="Hapus Pesan (Hanya Super Admin)"
                                                        >
                                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Foto Pengirim untuk pesan saya (di sebelah kanan bubble) */}
                                            {msg.is_me && (
                                                <UserAvatar
                                                    foto={currentUser?.foto}
                                                    name={currentUser?.name}
                                                    roleName={currentUser?.role_raw || 'SUPER_ADMIN'}
                                                    size="sm"
                                                />
                                            )}
                                        </div>
                                    ))
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* INPUT PENGETIKAN PESAN DENGAN VALIDASI PANJANG TEKS */}
                            <form
                                onSubmit={handleSendMessage}
                                className="p-2.5 bg-white border-t border-gray-150 flex items-center gap-2"
                            >
                                <div className="relative flex-1 flex items-center">
                                    <input
                                        type="text"
                                        autoFocus
                                        maxLength={2000}
                                        value={inputText}
                                        onChange={(e) => setInputText(e.target.value)}
                                        placeholder={
                                            activeChat === 'group'
                                                ? 'Ketik pesan ke grup staf...'
                                                : `Pesan ke ${activeContact?.name?.split(' ')[0]}...`
                                        }
                                        className="h-9 w-full rounded-xl border border-gray-200 bg-gray-50/70 pl-3 pr-16 text-xs text-gray-800 placeholder:text-gray-400 focus:border-purple-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all"
                                    />
                                    {inputText.length > 1800 && (
                                        <span className="absolute right-2.5 text-[9.5px] font-semibold text-amber-600 bg-white/80 px-1 rounded pointer-events-none">
                                            {inputText.length}/2000
                                        </span>
                                    )}
                                </div>
                                <button
                                    type="submit"
                                    disabled={!inputText.trim() || isSending || inputText.length > 2000}
                                    className={`h-9 w-9 shrink-0 flex items-center justify-center rounded-xl transition-all shadow-xs ${
                                        !inputText.trim() || isSending || inputText.length > 2000
                                            ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
                                            : 'bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white cursor-pointer shadow-purple-600/20'
                                    }`}
                                    title="Kirim Pesan"
                                >
                                    {isSending ? (
                                        <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                    ) : (
                                        <svg className="w-4 h-4 -rotate-45 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                        </svg>
                                    )}
                                </button>
                            </form>
                        </div>
                    )}
                </div>

            {/* MODAL KONFIRMASI HAPUS PESAN SUPER ADMIN */}
            {confirmDeleteModal.isOpen && (
                <div className="fixed inset-0 z-60 flex items-center justify-center bg-gray-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
                    <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl border border-gray-150 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-600 border border-rose-100">
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-gray-900">
                                    Hapus Pesan Obrolan?
                                </h3>
                                <p className="text-[11px] text-gray-500">
                                    Tindakan khusus Super Administrator
                                </p>
                            </div>
                        </div>

                        <div className="rounded-xl bg-gray-50 p-3 border border-gray-150 text-xs text-gray-700 italic">
                            "{confirmDeleteModal.messageSnippet}"
                        </div>

                        <p className="text-xs text-gray-600 leading-relaxed">
                            Pesan ini akan dihapus secara <strong>permanen dari database</strong> dan otomatis hilang dari riwayat percakapan kedua belah pihak.
                        </p>

                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={() => setConfirmDeleteModal({ isOpen: false, messageId: null, messageSnippet: '' })}
                                className="px-3 py-1.5 text-xs font-semibold text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmDeleteMessage}
                                className="px-3.5 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 rounded-lg shadow-xs transition-colors"
                            >
                                Ya, Hapus Pesan
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* TOMBOL PICU FLOATING CHAT (DRAGGABLE) */}
            <div
                style={
                    btnPos.x !== null && btnPos.y !== null
                        ? { left: `${btnPos.x}px`, top: `${btnPos.y}px` }
                        : undefined
                }
                className={`${
                    btnPos.x === null ? 'fixed bottom-5 right-5' : 'fixed'
                } z-50 touch-none select-none`}
                onMouseDown={handleDragStart}
                onTouchStart={handleDragStart}
            >
                <button
                    type="button"
                    onClick={handleButtonClick}
                    className={`relative flex h-14 w-14 items-center justify-center rounded-2xl shadow-xl transition-transform duration-200 select-none ${
                        isDragging ? 'cursor-grabbing scale-105 shadow-2xl ring-4 ring-purple-400/60' : 'cursor-grab hover:scale-105 active:scale-95'
                    } ${
                        isOpen
                            ? 'bg-gray-800 text-white hover:bg-gray-900 ring-2 ring-gray-600'
                            : 'bg-gradient-to-tr from-purple-700 via-purple-600 to-indigo-600 hover:from-purple-800 hover:to-indigo-700 text-white ring-2 ring-purple-300/50 shadow-purple-600/30'
                    }`}
                    title={isOpen ? 'Tutup Obrolan' : 'Buka Obrolan Internal Puskeswan (Tahan & geser untuk memindahkan)'}
                    aria-label="Obrolan Internal Puskeswan"
                >
                    {isOpen ? (
                        <svg className="w-6 h-6 transition-transform rotate-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    ) : (
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                    )}

                    {/* BADGE MERAH DENGAN ANGKA JELAS UNTUK PESAN BELUM DIBACA */}
                    {!isOpen && totalUnread > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 flex h-6 min-w-[24px] items-center justify-center rounded-full bg-rose-600 px-1.5 text-[11px] font-extrabold text-white ring-2 ring-white shadow-md animate-bounce">
                            {totalUnread > 99 ? '99+' : totalUnread}
                        </span>
                    )}
                </button>
            </div>
        </>
    );
}
