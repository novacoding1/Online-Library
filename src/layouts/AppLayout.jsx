import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart3,
  Bell,
  BookOpen,
  ChevronDown,
  ClipboardList,
  History,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  PanelLeftClose,
  QrCode,
  Search,
  Settings,
  ShieldCheck,
  Sun,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import { useDebounce } from "../hooks/useDebounce.js";
import { APP_NAME } from "../lib/constants.js";
import { libraryService } from "../services/libraryService.js";
import { cn, getInitials } from "../utils/formatters.js";
import { Button } from "../components/ui/Button.jsx";
import { Badge } from "../components/ui/Badge.jsx";
import { ToastViewport } from "../components/ui/ToastViewport.jsx";

const navItems = [
  { label: "Басты бет", to: "/dashboard", icon: LayoutDashboard },
  { label: "Кітаптар", to: "/books", icon: BookOpen },
  { label: "Сканер", to: "/scanner", icon: QrCode },
  { label: "Беру / Қайтару", to: "/circulation", icon: ClipboardList },
  { label: "Студенттер", to: "/students", icon: Users },
  { label: "Тарих", to: "/history", icon: History },
  { label: "Аналитика", to: "/analytics", icon: BarChart3 },
  { label: "Әкімшілік", to: "/admin", icon: ShieldCheck, roles: ["admin"] },
];

function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    onClose();
  }, [location.pathname, onClose]);

  const sidebarContent = (
    <aside className="flex h-full w-72 flex-col border-r border-slate-200/70 bg-white/78 p-4 shadow-glass backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/78">
      <div className="flex items-center justify-between gap-3 px-2 py-2">
        <button type="button" className="flex items-center gap-3 text-left" onClick={() => navigate("/dashboard")}>
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-ink text-white shadow-lift dark:bg-white dark:text-ink">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-black text-slate-950 dark:text-white">{APP_NAME}</p>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Университет жүйесі</p>
          </div>
        </button>
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={onClose} aria-label="Close sidebar">
          <PanelLeftClose className="h-4 w-4" />
        </Button>
      </div>

      <nav className="mt-6 space-y-1">
        {navItems
          .filter((item) => !item.roles || item.roles.includes(user?.role))
          .map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-bold transition",
                  isActive
                    ? "bg-ink text-white shadow-lift dark:bg-white dark:text-ink"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/8 dark:hover:text-white",
                )
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
      </nav>

      <div className="mt-auto space-y-3">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-white/10 dark:bg-white/5">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-library-cyan to-library-emerald text-sm font-black text-white">
              {getInitials(user?.full_name || user?.email)}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-black text-slate-950 dark:text-white">{user?.full_name}</p>
              <p className="truncate text-xs font-semibold text-slate-500 dark:text-slate-400">{user?.role}</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="ghost" onClick={() => navigate("/settings")}>
            <Settings className="h-4 w-4" />
            Баптаулар
          </Button>
          <Button variant="ghost" onClick={logout}>
            <LogOut className="h-4 w-4" />
            Шығу
          </Button>
        </div>
      </div>
    </aside>
  );

  return (
    <>
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:block">{sidebarContent}</div>
      <AnimatePresence>
        {open ? (
          <div className="fixed inset-0 z-40 lg:hidden">
            <motion.button
              type="button"
              aria-label="Close sidebar overlay"
              className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
            />
            <motion.div initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }} transition={{ duration: 0.2 }} className="relative h-full">
              {sidebarContent}
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [focused, setFocused] = useState(false);
  const debounced = useDebounce(query, 250);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    async function runSearch() {
      if (!debounced.trim()) {
        setResults(null);
        return;
      }
      const next = await libraryService.globalSearch(debounced);
      if (!cancelled) setResults(next);
    }

    runSearch();
    return () => {
      cancelled = true;
    };
  }, [debounced]);

  const hasResults = results && (results.books.length || results.students.length || results.issues.length);

  function jump(path) {
    setFocused(false);
    setQuery("");
    navigate(path);
  }

  return (
    <div className="relative w-full max-w-2xl">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onFocus={() => setFocused(true)}
        placeholder="Кітаптарды, авторларды, штрих-кодтарды, студенттерді іздеу"
        className="h-11 w-full rounded-lg border border-slate-200 bg-white/82 px-10 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-library-cyan focus:ring-4 focus:ring-library-cyan/10 dark:border-white/10 dark:bg-white/8 dark:text-white"
      />
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

      <AnimatePresence>
        {focused && query.trim() ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="absolute left-0 right-0 top-[3.25rem] z-30 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-2xl dark:border-white/10 dark:bg-slate-900"
          >
            {hasResults ? (
              <div className="max-h-96 overflow-y-auto p-2">
                {results.books.map((book) => (
                  <button key={book.id} type="button" onClick={() => jump("/books")} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-white/5">
                    <BookOpen className="h-4 w-4 text-library-cyan" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold text-slate-950 dark:text-white">{book.title}</span>
                      <span className="block truncate text-xs text-slate-500">{book.author} · {book.barcode}</span>
                    </span>
                    <Badge status={book.status} />
                  </button>
                ))}
                {results.students.map((student) => (
                  <button key={student.id} type="button" onClick={() => jump("/students")} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-white/5">
                    <Users className="h-4 w-4 text-library-emerald" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold text-slate-950 dark:text-white">{student.full_name}</span>
                      <span className="block truncate text-xs text-slate-500">{student.student_id} · {student.study_group}</span>
                    </span>
                  </button>
                ))}
                {results.issues.map((issue) => (
                  <button key={issue.id} type="button" onClick={() => jump("/history")} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-white/5">
                    <ClipboardList className="h-4 w-4 text-library-coral" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold text-slate-950 dark:text-white">{issue.book?.title}</span>
                      <span className="block truncate text-xs text-slate-500">{issue.student?.full_name} · {issue.status}</span>
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="px-4 py-5 text-sm font-medium text-slate-500 dark:text-slate-400">Сәйкес жазбалар табылған жоқ.</p>
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function Topbar({ onOpenSidebar }) {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-mist/72 px-4 py-3 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/72 sm:px-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={onOpenSidebar} aria-label="Open sidebar">
          <Menu className="h-5 w-5" />
        </Button>
        <GlobalSearch />
        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" aria-label="Notifications">
            <Bell className="h-4 w-4" />
          </Button>
          <button type="button" onClick={() => navigate("/profile")} className="grid h-10 w-10 place-items-center rounded-lg bg-ink text-sm font-black text-white shadow-lift dark:bg-white dark:text-ink">
            {getInitials(user?.full_name || user?.email)}
          </button>
        </div>
      </div>
    </header>
  );
}

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-mist text-ink dark:bg-slate-950 dark:text-white">
      <div className="fixed inset-0 -z-10 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(247,248,251,1)),linear-gradient(90deg,rgba(8,145,178,0.05)_1px,transparent_1px),linear-gradient(180deg,rgba(22,163,74,0.04)_1px,transparent_1px)] bg-[size:auto,42px_42px,42px_42px] dark:bg-[linear-gradient(180deg,rgba(2,6,23,1),rgba(15,23,42,1)),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(180deg,rgba(255,255,255,0.04)_1px,transparent_1px)]" />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:pl-72">
        <Topbar onOpenSidebar={() => setSidebarOpen(true)} />
        <main className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
      <ToastViewport />
    </div>
  );
}
