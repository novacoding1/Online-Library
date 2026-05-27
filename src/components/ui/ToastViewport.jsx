import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import { useToast } from "../../context/ToastContext.jsx";
import { Button } from "./Button.jsx";

const icons = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

const styles = {
  success: "text-library-emerald",
  error: "text-library-rose",
  info: "text-library-cyan",
};

export function ToastViewport() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed right-4 top-4 z-[60] flex w-[min(92vw,380px)] flex-col gap-3">
      <AnimatePresence>
        {toasts.map((toast) => {
          const Icon = icons[toast.type] || icons.info;
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 24, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 24, scale: 0.98 }}
              className="rounded-lg border border-slate-200 bg-white/92 p-4 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/92"
            >
              <div className="flex gap-3">
                <Icon className={`mt-0.5 h-5 w-5 ${styles[toast.type] || styles.info}`} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-black text-slate-950 dark:text-white">{toast.title}</p>
                  {toast.description ? <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{toast.description}</p> : null}
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeToast(toast.id)} aria-label="Dismiss">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

