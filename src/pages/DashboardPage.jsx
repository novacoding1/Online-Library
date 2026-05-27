import { motion } from "framer-motion";
import { Activity, BookCheck, BookOpen, Clock3, Users } from "lucide-react";
import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Badge } from "../components/ui/Badge.jsx";
import { DashboardSkeleton } from "../components/ui/Skeleton.jsx";
import { PageHeader } from "../components/ui/PageHeader.jsx";
import { StatCard } from "../components/ui/StatCard.jsx";
import { useLibrary } from "../context/LibraryContext.jsx";
import { formatDate, formatDateTime } from "../utils/formatters.js";

const colors = ["#0891b2", "#16a34a", "#f97316", "#e11d48", "#7c3aed"];

export function DashboardPage() {
  const { dashboard, loading, usingSupabase } = useLibrary();

  if (loading && !dashboard) {
    return (
      <div className="space-y-6">
        <PageHeader title="Басты бет" description="Кітапхана жұмысының тікелей көрсеткіштері." />
        <DashboardSkeleton />
      </div>
    );
  }

  const data = dashboard || {
    totalBooks: 0,
    issuedBooks: 0,
    availableBooks: 0,
    studentsCount: 0,
    monthly: [],
    categoryChart: [],
    recentIssues: [],
    activity: [],
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={usingSupabase ? "Supabase сервері" : "Демо-жұмыс орны"}
        title="Кітапхананы басқару орталығы"
        description="Кітаптар қорын, белсенді кітап айналымын, студенттерді, сканерлеуді және соңғы әрекеттерді бір ыңғайлы бақылау тақтасынан қадағалаңыз."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Кітаптар саны" value={data.totalBooks} icon={BookOpen} accent="cyan" trend="Барлық санаттағы кітаптар саны" />
        <StatCard title="Берілген кітаптар" value={data.issuedBooks} icon={BookCheck} accent="coral" trend={`${data.activeIssues || 0} белсенді айналым жазбасы`} />
        <StatCard title="Қолжетімді кітаптар" value={data.availableBooks} icon={Clock3} accent="emerald" trend="Студенттерге беруге дайын" />
        <StatCard title="Студенттер" value={data.studentsCount} icon={Users} accent="violet" trend="Тіркелген оқырмандар профилі" />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.5fr,0.9fr]">
        <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-lg border border-white/45 bg-white/78 p-5 shadow-glass backdrop-blur-xl dark:border-white/10 dark:bg-white/8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-950 dark:text-white">Айналым динамикасы</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Ай сайынғы берілген және қайтарылған кітаптар саны.</p>
            </div>
            <Badge status="available">Тікелей</Badge>
          </div>
          <div className="mt-5 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.monthly}>
                <defs>
                  <linearGradient id="issued" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="#0891b2" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#0891b2" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="returned" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="#16a34a" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.25)" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid rgba(148,163,184,0.2)" }} />
                <Area type="monotone" dataKey="issued" stroke="#0891b2" fill="url(#issued)" strokeWidth={3} />
                <Area type="monotone" dataKey="returned" stroke="#16a34a" fill="url(#returned)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="rounded-lg border border-white/45 bg-white/78 p-5 shadow-glass backdrop-blur-xl dark:border-white/10 dark:bg-white/8">
          <h2 className="text-lg font-black text-slate-950 dark:text-white">Санаттар құрамы</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Академиялық салалар бойынша топтастырылған кітаптар.</p>
          <div className="mt-5 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data.categoryChart} dataKey="value" nameKey="name" innerRadius={62} outerRadius={98} paddingAngle={4}>
                  {data.categoryChart.map((entry, index) => (
                    <Cell key={entry.name} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid rgba(148,163,184,0.2)" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid gap-2">
            {data.categoryChart.map((entry, index) => (
              <div key={entry.name} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 font-semibold text-slate-600 dark:text-slate-300">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: colors[index % colors.length] }} />
                  {entry.name}
                </span>
                <span className="font-black text-slate-950 dark:text-white">{entry.value}</span>
              </div>
            ))}
          </div>
        </motion.section>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr,0.8fr]">
        <section className="rounded-lg border border-white/45 bg-white/78 p-5 shadow-glass backdrop-blur-xl dark:border-white/10 dark:bg-white/8">
          <h2 className="text-lg font-black text-slate-950 dark:text-white">Соңғы берілген кітаптар</h2>
          <div className="mt-4 space-y-3">
            {data.recentIssues.map((issue) => (
              <div key={issue.id} className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white/72 p-3 dark:border-white/10 dark:bg-white/5 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-slate-950 dark:text-white">{issue.book?.title}</p>
                  <p className="mt-1 truncate text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {issue.student?.full_name} · Қайтару мерзімі: {formatDate(issue.due_date)}
                  </p>
                </div>
                <Badge status={issue.status} />
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-white/45 bg-white/78 p-5 shadow-glass backdrop-blur-xl dark:border-white/10 dark:bg-white/8">
          <h2 className="flex items-center gap-2 text-lg font-black text-slate-950 dark:text-white">
            <Activity className="h-5 w-5 text-library-cyan" />
            Әрекеттер журналы
          </h2>
          <div className="mt-4 space-y-4">
            {data.activity.map((item) => (
              <div key={item.id} className="border-l-2 border-library-cyan/30 pl-4">
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{item.message}</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{formatDateTime(item.created_at)}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

