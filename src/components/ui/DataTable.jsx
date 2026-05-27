import { ArrowUpDown } from "lucide-react";
import { cn } from "../../utils/formatters.js";
import { EmptyState } from "./EmptyState.jsx";

export function DataTable({ columns, rows, emptyTitle = "No records", emptyDescription = "Try a different filter.", onSort, sortBy, sortDir }) {
  if (!rows?.length) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white/78 shadow-glass backdrop-blur-xl dark:border-white/10 dark:bg-white/8">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left dark:divide-white/10">
          <thead className="bg-slate-50/80 dark:bg-white/5">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className={cn("px-4 py-3 text-xs font-black uppercase tracking-normal text-slate-500 dark:text-slate-400", column.className)}>
                  {column.sortable ? (
                    <button type="button" className="inline-flex items-center gap-1" onClick={() => onSort?.(column.key)}>
                      {column.label}
                      <ArrowUpDown className={cn("h-3.5 w-3.5", sortBy === column.key && "text-library-cyan")} />
                      {sortBy === column.key ? <span className="sr-only">{sortDir}</span> : null}
                    </button>
                  ) : (
                    column.label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/10">
            {rows.map((row) => (
              <tr key={row.id} className="transition hover:bg-slate-50/80 dark:hover:bg-white/5">
                {columns.map((column) => (
                  <td key={column.key} className={cn("px-4 py-3 align-middle text-sm text-slate-700 dark:text-slate-200", column.cellClassName)}>
                    {column.render ? column.render(row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

