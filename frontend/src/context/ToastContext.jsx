import { createContext, useCallback, useMemo, useState } from 'react';
import { CheckCircle2, XCircle, Info } from 'lucide-react';

export const ToastContext = createContext(null);

const STYLES = {
  success: {
    ring: 'ring-emerald-500/30',
    iconBg: 'bg-emerald-100 text-emerald-600',
    Icon: CheckCircle2,
  },
  error: {
    ring: 'ring-red-500/30',
    iconBg: 'bg-red-100 text-red-600',
    Icon: XCircle,
  },
  info: {
    ring: 'ring-blue-500/30',
    iconBg: 'bg-blue-100 text-blue-600',
    Icon: Info,
  },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4200);
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Toast viewport */}
      <div className="pointer-events-none fixed top-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2 px-4">
        {toasts.map((toast) => {
          const { Icon, iconBg, ring } = STYLES[toast.type] || STYLES.info;
          return (
            <div
              key={toast.id}
              className={`animate-toast-in pointer-events-auto flex items-start gap-3 rounded-xl bg-white p-3.5 shadow-lg shadow-slate-900/10 ring-1 ${ring}`}
              role="status"
            >
              <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${iconBg}`}>
                <Icon className="h-4 w-4" />
              </span>
              <p className="pt-0.5 text-sm font-medium text-slate-700">{toast.message}</p>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
