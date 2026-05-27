import { Database, Moon, RefreshCcw, Settings, Sun } from "lucide-react";
import { Button } from "../components/ui/Button.jsx";
import { PageHeader } from "../components/ui/PageHeader.jsx";
import { useLibrary } from "../context/LibraryContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";

export function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { usingSupabase, resetDemoData } = useLibrary();

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Preferences" title="Settings" description="Workspace appearance, data mode, and maintenance actions." />

      <section className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-lg border border-white/45 bg-white/78 p-5 shadow-glass backdrop-blur-xl dark:border-white/10 dark:bg-white/8">
          <h2 className="flex items-center gap-2 text-lg font-black text-slate-950 dark:text-white">
            <Settings className="h-5 w-5 text-library-cyan" />
            Appearance
          </h2>
          <div className="mt-5 inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1 dark:border-white/10 dark:bg-white/5">
            <button
              type="button"
              onClick={() => setTheme("light")}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-black transition ${theme === "light" ? "bg-white text-slate-950 shadow-sm dark:bg-white dark:text-ink" : "text-slate-500 dark:text-slate-300"}`}
            >
              <Sun className="h-4 w-4" />
              Light
            </button>
            <button
              type="button"
              onClick={() => setTheme("dark")}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-black transition ${theme === "dark" ? "bg-ink text-white shadow-sm dark:bg-white dark:text-ink" : "text-slate-500 dark:text-slate-300"}`}
            >
              <Moon className="h-4 w-4" />
              Dark
            </button>
          </div>
        </div>

        <div className="rounded-lg border border-white/45 bg-white/78 p-5 shadow-glass backdrop-blur-xl dark:border-white/10 dark:bg-white/8">
          <h2 className="flex items-center gap-2 text-lg font-black text-slate-950 dark:text-white">
            <Database className="h-5 w-5 text-library-emerald" />
            Data source
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
            Current mode: <span className="font-black text-slate-950 dark:text-white">{usingSupabase ? "Supabase PostgreSQL" : "Local demo data"}</span>
          </p>
          {!usingSupabase ? (
            <Button variant="ghost" className="mt-5" onClick={resetDemoData}>
              <RefreshCcw className="h-4 w-4" />
              Reset demo data
            </Button>
          ) : null}
        </div>
      </section>
    </div>
  );
}

