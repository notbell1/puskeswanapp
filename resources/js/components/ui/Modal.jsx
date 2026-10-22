import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import Button from './Button';

/**
 * Custom Modal Component
 *
 * CRITICAL REQUIREMENT:
 * Modal ini TIDAK AKAN tertutup saat pengguna mengklik area backdrop/luar modal.
 * Modal hanya dapat ditutup secara eksplisit via tombol 'X' atau tombol 'Batal/Tutup'.
 */
export default function Modal({
    isOpen = false,
    onClose = () => {},
    title = '',
    description = '',
    children = undefined,
    footer = undefined,
    size = 'md',
    type = 'default', // 'default' | 'danger' | 'warning' | 'success'
    showCloseButton = true,
    className = '',
    containerClassName = '',
}) {
    const [shake, setShake] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            setShake(true);
            setTimeout(() => setShake(false), 400);
        }
    };

    if (!isOpen) return null;

    const sizeClasses = {
        sm: 'max-w-md',
        md: 'max-w-2xl',
        lg: 'max-w-3xl',
        xl: 'max-w-5xl',
        full: 'max-w-6xl',
    };

    const typeIcons = {
        danger: (
            <div className="h-10 w-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            </div>
        ),
        warning: (
            <div className="h-10 w-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
        ),
        success: (
            <div className="h-10 w-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
            </div>
        ),
        default: null,
    };

    const modalElement = (
        <div
            className={cn(
                "fixed inset-0 z-[100] overflow-y-auto bg-gray-900/60 backdrop-blur-xs transition-opacity duration-200 animate-fadeIn",
                containerClassName
            )}
            onClick={handleBackdropClick}
            role="dialog"
            aria-modal="true"
        >
            <div
                className="flex min-h-full items-center justify-center p-2.5 sm:p-4 text-center"
                onClick={handleBackdropClick}
            >
                <div
                    className={cn(
                        'relative w-full my-auto text-left bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-visible transform transition-all duration-200 ease-out',
                        sizeClasses[size] || sizeClasses.md,
                        shake ? 'animate-bounce-subtle ring-2 ring-purple-400' : '',
                        className
                    )}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="px-4 sm:px-6 pt-3.5 sm:pt-4.5 pb-2 sm:pb-3 flex items-start justify-between border-b border-gray-100 rounded-t-2xl">
                        <div className="flex items-center gap-2.5 sm:gap-3 pr-2 sm:pr-4">
                            {typeIcons[type]}
                            <div>
                                {title && (
                                    <h3 className="text-base sm:text-lg font-bold text-gray-900 font-sans tracking-tight leading-snug">
                                        {title}
                                    </h3>
                                )}
                                {description && (
                                    <p className="mt-0.5 text-[11px] sm:text-xs text-gray-500 leading-relaxed">
                                        {description}
                                    </p>
                                )}
                            </div>
                        </div>

                        {showCloseButton && (
                            <button
                                type="button"
                                onClick={onClose}
                                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors shrink-0"
                                aria-label="Tutup modal"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>

                    <div className="px-4 sm:px-6 py-2.5 sm:py-3.5 text-gray-700 text-sm leading-normal">
                        {children}
                    </div>

                    {footer !== undefined && (
                        <div className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-50/80 border-t border-gray-100 flex items-center justify-end gap-2 sm:gap-2.5 rounded-b-2xl">
                            {footer !== null ? (
                                footer
                            ) : (
                                <Button variant="secondary" onClick={onClose} size="sm">
                                    Tutup
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    if (mounted && typeof document !== 'undefined') {
        return createPortal(modalElement, document.body);
    }

    return modalElement;
}

/**
 * ConfirmationModal Helper Component
 * Sangat cocok untuk konfirmasi logout, hapus data, atau simpan data.
 */
export function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title = 'Konfirmasi Tindakan',
    message = 'Apakah Anda yakin ingin melanjutkan tindakan ini?',
    confirmText = 'Konfirmasi',
    cancelText = 'Batal',
    confirmVariant = 'primary',
    isLoading = false,
    type = 'warning',
}) {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            type={type}
            size="sm"
            footer={
                <>
                    <Button
                        variant="secondary"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        {cancelText}
                    </Button>
                    <Button
                        variant={confirmVariant}
                        onClick={onConfirm}
                        isLoading={isLoading}
                    >
                        {confirmText}
                    </Button>
                </>
            }
        >
            <p className="text-gray-600">{message}</p>
        </Modal>
    );
}

