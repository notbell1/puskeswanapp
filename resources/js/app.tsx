import { createInertiaApp } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';
import { ToastProvider } from '@/components/ui';

const appName = 'Puskeswan';

void createInertiaApp({
    title: (title) => {
        if (!title) return appName;
        // Bersihkan pengulangan akhiran Puskeswan atau puskeswanIB-App agar tidak double
        const cleanTitle = title
            .replace(/\s*-\s*(Sistem Informasi\s+)?Puskeswan(\s*IB-App)?$/i, '')
            .replace(/\s*-\s*(Admin|Dokter|Super Admin|Berita & Edukasi)\s+Puskeswan$/i, ' - $1')
            .trim();
        if (cleanTitle.toLowerCase() === appName.toLowerCase()) {
            return appName;
        }
        return `${cleanTitle} - ${appName}`;
    },
    progress: {
        color: '#4B5563',
    },
    setup({ el, App, props }) {
        if (!el) return;
        createRoot(el).render(
            <ToastProvider>
                <App {...props} />
            </ToastProvider>,
        );
    },
});

