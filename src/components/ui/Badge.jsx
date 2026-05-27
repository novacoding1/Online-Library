import { cn, toTitleCase } from "../../utils/formatters.js";

const statusStyles = {
  available: "bg-green-50 text-green-700 ring-green-200 dark:bg-green-500/12 dark:text-green-300 dark:ring-green-500/20",
  issued: "bg-orange-50 text-orange-700 ring-orange-200 dark:bg-orange-500/12 dark:text-orange-300 dark:ring-orange-500/20",
  returned: "bg-cyan-50 text-cyan-700 ring-cyan-200 dark:bg-cyan-500/12 dark:text-cyan-300 dark:ring-cyan-500/20",
  overdue: "bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-500/12 dark:text-rose-300 dark:ring-rose-500/20",
  maintenance: "bg-violet-50 text-violet-700 ring-violet-200 dark:bg-violet-500/12 dark:text-violet-300 dark:ring-violet-500/20",
  lost: "bg-slate-100 text-slate-700 ring-slate-200 dark:bg-white/8 dark:text-slate-300 dark:ring-white/10",
};

export function Badge({ children, status, className }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ring-1",
        statusStyles[status] || "bg-slate-100 text-slate-700 ring-slate-200 dark:bg-white/8 dark:text-slate-300 dark:ring-white/10",
        className,
      )}
    >
      {children || toTitleCase(status)}
    </span>
  );
}

