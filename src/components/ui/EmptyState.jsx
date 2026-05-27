import { Library } from "lucide-react";

export function EmptyState({ title, description, action }) {
  return (
    <div className="flex min-h-56 flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white/60 p-8 text-center backdrop-blur-xl dark:border-white/15 dark:bg-white/5">
      <div className="rounded-lg bg-slate-100 p-3 text-library-cyan dark:bg-white/10">
        <Library className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-base font-black text-slate-950 dark:text-white">{title}</h3>
      {description ? <p className="mt-1 max-w-md text-sm text-slate-500 dark:text-slate-400">{description}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

