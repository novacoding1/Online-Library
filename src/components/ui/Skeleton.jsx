import { cn } from "../../utils/formatters.js";

export function Skeleton({ className }) {
  return (
    <div className={cn("relative overflow-hidden rounded-lg bg-slate-200/70 dark:bg-white/10", className)}>
      <div className="absolute inset-y-0 left-0 w-1/2 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent dark:via-white/10" />
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <Skeleton key={index} className="h-36" />
      ))}
    </div>
  );
}
