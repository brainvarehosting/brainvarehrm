'use client';

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  toasts: Toast[];
  addToast: (message: string, type?: ToastType) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Fallback for components outside provider
    return {
      toasts: [],
      addToast: (message: string, type?: ToastType) => console.log(`[Toast ${type}]: ${message}`),
      removeToast: () => {},
    };
  }
  return ctx;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      {/* Toast container */}
      {toasts.length > 0 && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, display: 'flex',
          flexDirection: 'column', gap: 8, zIndex: 9999, pointerEvents: 'none',
        }}>
          {toasts.map((toast) => (
            <div
              key={toast.id}
              style={{
                pointerEvents: 'auto',
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 20px', borderRadius: 12,
                background: toast.type === 'success' ? 'rgba(16,185,129,0.95)' :
                  toast.type === 'error' ? 'rgba(239,68,68,0.95)' :
                  toast.type === 'warning' ? 'rgba(245,158,11,0.95)' :
                  'rgba(59,130,246,0.95)',
                color: 'white', fontSize: 14, fontWeight: 500,
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                backdropFilter: 'blur(12px)',
                animation: 'fadeInUp 0.3s ease',
                cursor: 'pointer', minWidth: 280,
              }}
              onClick={() => removeToast(toast.id)}
            >
              <span style={{ fontSize: 18 }}>
                {toast.type === 'success' ? '✓' : toast.type === 'error' ? '✕' : toast.type === 'warning' ? '⚠' : 'ℹ'}
              </span>
              <span style={{ flex: 1 }}>{toast.message}</span>
              <span style={{ opacity: 0.6, fontSize: 16, fontWeight: 700 }}>×</span>
            </div>
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
}
