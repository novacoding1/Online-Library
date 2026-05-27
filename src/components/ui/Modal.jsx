import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "./Button.jsx";

export function Modal({ open, onClose, title, description, children, footer, size = "max-w-2xl" }) {
  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
          <motion.button
            type="button"
            aria-label="Close modal"
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className={`relative max-h-[92vh] w-full overflow-hidden rounded-lg border border-white/30 bg-white shadow-2xl dark:border-white/10 dark:bg-slate-900 ${size}`}
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 dark:border-white/10">
              <div>
                <h2 className="text-lg font-black text-slate-950 dark:text-white">{title}</h2>
                {description ? <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p> : null}
              </div>
              <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="max-h-[68vh] overflow-y-auto px-5 py-5">{children}</div>
            {footer ? <div className="border-t border-slate-200 px-5 py-4 dark:border-white/10">{footer}</div> : null}
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
