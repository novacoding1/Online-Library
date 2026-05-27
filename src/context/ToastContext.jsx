import { createContext, useCallback, useContext, useMemo, useState } from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    ({ title, description = "", type = "success", timeout = 3600 }) => {
      const id = crypto.randomUUID();
      const toast = { id, title, description, type };
      setToasts((current) => [toast, ...current].slice(0, 4));
      if (timeout) {
        window.setTimeout(() => removeToast(id), timeout);
      }
      return id;
    },
    [removeToast],
  );

  const value = useMemo(() => ({ toasts, showToast, removeToast }), [toasts, showToast, removeToast]);

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
}

