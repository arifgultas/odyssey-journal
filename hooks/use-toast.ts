import { useCallback, useState } from 'react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastState {
    visible: boolean;
    message: string;
    type: ToastType;
}

/**
 * useToast Hook
 * 
 * Provides a simple API to show toast notifications throughout the app.
 * 
 * @example
 * const { showToast, toastProps } = useToast();
 * 
 * // Show success toast
 * showToast('Profile updated!', 'success');
 * 
 * // Render in component
 * <CustomToast {...toastProps} />
 */
export function useToast() {
    const [toast, setToast] = useState<ToastState>({
        visible: false,
        message: '',
        type: 'info',
    });

    const showToast = useCallback((message: string, type: ToastType = 'info') => {
        setToast({
            visible: true,
            message,
            type,
        });
    }, []);

    const hideToast = useCallback(() => {
        setToast((prev) => ({ ...prev, visible: false }));
    }, []);

    return {
        showToast,
        hideToast,
        toastProps: {
            ...toast,
            onHide: hideToast,
        },
    };
}
