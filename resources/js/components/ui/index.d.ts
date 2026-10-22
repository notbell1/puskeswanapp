import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    className?: string;
    children?: React.ReactNode;
}

export const Button: React.FC<ButtonProps>;

export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: React.ReactNode;
    description?: React.ReactNode;
    children?: React.ReactNode;
    footer?: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    type?: 'default' | 'danger' | 'warning' | 'success';
    showCloseButton?: boolean;
    className?: string;
    containerClassName?: string;
}

export const Modal: React.FC<ModalProps>;

export interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
    confirmVariant?: 'primary' | 'secondary' | 'danger';
    isLoading?: boolean;
    type?: 'default' | 'danger' | 'warning' | 'success';
}

export const ConfirmationModal: React.FC<ConfirmationModalProps>;

export interface ToastItemData {
    id: string;
    type?: 'success' | 'error' | 'warning' | 'info';
    title?: string;
    message: string;
    duration?: number;
}

export interface ToastContextType {
    toasts: ToastItemData[];
    addToast: (options: { type?: 'success' | 'error' | 'warning' | 'info' | 'blue' | 'deleted' | 'red'; title?: string; message: string; duration?: number }) => void;
    removeToast: (id: string) => void;
    success: (message: string, title?: string) => void;
    error: (message: string, title?: string) => void;
    warning: (message: string, title?: string) => void;
    info: (message: string, title?: string) => void;
    blue: (message: string, title?: string) => void;
    deleted: (message: string, title?: string) => void;
    red: (message: string, title?: string) => void;
}

export const ToastProvider: React.FC<{ children: React.ReactNode }>;
export function useToast(): ToastContextType;

export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

export interface PaginationProps {
    links?: PaginationLink[];
    currentPage?: number;
    totalPages?: number;
    windowSize?: number;
    from?: number;
    to?: number;
    total?: number;
    className?: string;
    onPageChange?: (pageNumber: number, url?: string | null) => void;
}

export const Pagination: React.FC<PaginationProps>;

export interface DropdownProps {
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg';
    matchWidth?: boolean;
    fullWidthOnMobile?: boolean;
    className?: string;
}

export interface DropdownTriggerProps {
    children: React.ReactNode;
    className?: string;
}

export interface DropdownContentProps {
    align?: 'left' | 'right' | 'center';
    width?: string;
    matchWidth?: boolean;
    className?: string;
    children?: React.ReactNode;
}

export interface DropdownItemProps {
    href?: string;
    method?: string;
    as?: string;
    onClick?: (e?: React.MouseEvent) => void;
    icon?: React.ReactNode;
    size?: 'sm' | 'md' | 'lg';
    danger?: boolean;
    active?: boolean;
    className?: string;
    children?: React.ReactNode;
}

export interface DropdownHeaderProps {
    children?: React.ReactNode;
    className?: string;
}

export interface DropdownDividerProps {
    className?: string;
}

export interface DropdownComponent extends React.FC<DropdownProps> {
    Trigger: React.FC<DropdownTriggerProps>;
    Content: React.FC<DropdownContentProps>;
    Item: React.FC<DropdownItemProps>;
    Header: React.FC<DropdownHeaderProps>;
    Divider: React.FC<DropdownDividerProps>;
}

export const Dropdown: DropdownComponent;

export interface SelectOption {
    value: string | number;
    label: string;
    sublabel?: string;
    disabled?: boolean;
}

export interface SelectProps {
    value: string | number;
    onChange: (value: any) => void;
    options: SelectOption[];
    placeholder?: string;
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    error?: boolean | string;
    showCheckmark?: boolean;
    className?: string;
    menuClassName?: string;
    align?: 'left' | 'right' | 'center';
    id?: string;
}

export const Select: React.FC<SelectProps>;

