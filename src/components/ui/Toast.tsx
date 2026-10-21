import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { ToastMessage } from "../../types";

interface ToastContextValue {
  toasts: ToastMessage[];
  push: (msg: Omit<ToastMessage, "id">) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (msg: Omit<ToastMessage, "id">) => {
      const id = "t-" + Date.now() + Math.random().toString(36).slice(2, 6);
      const toast: ToastMessage = { ...msg, id, duration: msg.duration ?? 4000 };
      setToasts((prev) => [...prev, toast]);
      window.setTimeout(() => dismiss(id), toast.duration);
    },
    [dismiss]
  );

  const value = useMemo(() => ({ toasts, push, dismiss }), [toasts, push, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-container" aria-live="polite" aria-relevant="additions">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.type}`} role="status">
            <span>{t.message}</span>
            {t.actionLabel && t.onAction && (
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => { t.onAction?.(); dismiss(t.id); }}>
                {t.actionLabel}
              </button>
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
