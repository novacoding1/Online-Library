import { Loader2 } from "lucide-react";
import { cn } from "../../utils/formatters.js";

const variants = {
  primary:
    "bg-ink text-white shadow-lift hover:-translate-y-0.5 hover:bg-slate-800 dark:bg-white dark:text-ink dark:hover:bg-slate-100",
  accent:
    "bg-library-cyan text-white shadow-lift hover:-translate-y-0.5 hover:bg-cyan-700",
  success:
    "bg-library-emerald text-white shadow-lift hover:-translate-y-0.5 hover:bg-green-700",
  danger:
    "bg-library-rose text-white shadow-lift hover:-translate-y-0.5 hover:bg-rose-700",
  ghost:
    "bg-white/70 text-slate-700 ring-1 ring-slate-200 hover:bg-white dark:bg-white/8 dark:text-slate-200 dark:ring-white/10 dark:hover:bg-white/12",
  subtle:
    "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-white/8 dark:text-slate-200 dark:hover:bg-white/12",
};

const sizes = {
  sm: "h-9 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-5 text-base",
  icon: "h-10 w-10 p-0",
};

export function Button({ children, className, variant = "primary", size = "md", loading, disabled, type = "button", ...props }) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition duration-200 focus:outline-none focus:ring-2 focus:ring-library-cyan/40 disabled:cursor-not-allowed disabled:opacity-55",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      {children}
    </button>
  );
}

