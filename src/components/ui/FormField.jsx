import { cn } from "../../utils/formatters.js";

export function FormField({ label, icon: Icon, error, className, children }) {
  return (
    <label className={cn("block space-y-2", className)}>
      {label ? <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{label}</span> : null}
      <div className="relative">
        {Icon ? <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /> : null}
        {children}
      </div>
      {error ? <span className="text-xs font-medium text-library-rose">{error}</span> : null}
    </label>
  );
}

export function inputClassName(hasIcon = false) {
  return cn(
    "h-11 w-full rounded-lg border border-slate-200 bg-white/82 px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-library-cyan focus:ring-4 focus:ring-library-cyan/10 dark:border-white/10 dark:bg-white/8 dark:text-white dark:placeholder:text-slate-500",
    hasIcon && "pl-10",
  );
}

