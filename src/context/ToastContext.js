import React, { createContext, useContext, useState, useRef } from 'react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
    const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });
    const timerRef = useRef(null);

    const showToast = (message, type = 'success') => {
        // Clear existing timer if any
        if (timerRef.current) clearTimeout(timerRef.current);

        setToast({ visible: true, message, type });

        // Auto hide after 3 seconds
        timerRef.current = setTimeout(() => {
            setToast(prev => ({ ...prev, visible: false }));
        }, 3000);
    };

    const hideToast = () => {
        if (timerRef.current) clearTimeout(timerRef.current);
        setToast(prev => ({ ...prev, visible: false }));
    };

    return (
        <ToastContext.Provider value={{ toast, showToast, hideToast }}>
            {children}
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};
