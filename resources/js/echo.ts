import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

declare global {
    interface Window {
        Pusher: typeof Pusher;
        Echo: Echo<'reverb'>;
    }
}

window.Pusher = Pusher;

const appKey = import.meta.env.VITE_REVERB_APP_KEY || 'puskeswan_reverb_key';
const wsHost = import.meta.env.VITE_REVERB_HOST || (typeof window !== 'undefined' ? window.location.hostname : '127.0.0.1');
const wsPort = Number(import.meta.env.VITE_REVERB_PORT || 8080);
const wsScheme = import.meta.env.VITE_REVERB_SCHEME || (typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'https' : 'http');

export const echo = new Echo({
    broadcaster: 'reverb',
    key: appKey,
    wsHost: wsHost,
    wsPort: wsPort,
    wssPort: wsPort,
    forceTLS: wsScheme === 'https',
    enabledTransports: ['ws', 'wss'],
});

if (typeof window !== 'undefined') {
    window.Echo = echo;
}

export default echo;

