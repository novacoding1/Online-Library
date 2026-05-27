import { BarChart3, BookOpen, TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PageHeader } from "../components/ui/PageHeader.jsx";
import { StatCard } from "../components/ui/StatCard.jsx";
import { useLibrary } from "../context/LibraryContext.jsx";

const palette = ["#0891b2", "#16a34a", "#f97316", "#e11d48", "#7c3aed"];

export function AnalyticsPage() {
  const { books, students, issues, dashboard } = useLibrary();

  const categoryAvailability = (dashboard?.categoryChart || []).map((category) => {
    const categoryBooks = books.filter((book) => book.category === category.name);
    return {
      name: category.name,
      total: categoryBooks.reduce((sum, book) => sum + book.quantity, 0),
      available: categoryBooks.reduce((sum, book) => sum + book.available_quantity, 0),
    };
  });

  const mostBorrowed = books.map((book) => ({
    name: book.title.length > 20 ? `${book.title.slice(0, 20)}...` : book.title,
    issues: issues.filter((issue) => issue.book_id === book.id).length,
  }));

  const activeRate = books.length ? Math.round((issues.filter((issue) => issue.status === "issued").length / Math.max(1, books.length)) * 100) : 0;
  const returnRate = issues.length ? Math.round((issues.filter((issue) => issue.status === "returned").length / issues.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Аналитика"
        title="Кітапхана аналитикасы"
        description="Кітап қорының пайдаланылуы, қолжетімділігі, белсенді оқырмандар және қайтару сапасы бойынша жедел көрсеткіштер есебі."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Белсенді берілімдер пайызы" value={activeRate} icon={TrendingUp} accent="coral" trend="Каталогтағы кітаптармен салыстырғандағы белсенді берілімдер" />
        <StatCard title="Қайтару пайызы" value={returnRate} icon={BarChart3} accent="emerald" trend="Берілім тарихы бойынша қайтарылған кітаптар үлесі" />
        <StatCard title="Оқырмандар" value={students.length} icon={BookOpen} accent="cyan" trend="Тіркелген белсенді студенттер саны" />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <section className="rounded-lg border border-white/45 bg-white/78 p-5 shadow-glass backdrop-blur-xl dark:border-white/10 dark:bg-white/8">
          <h2 className="text-lg font-black text-slate-950 dark:text-white">Санаттар бойынша қолжетімділік</h2>
          <div className="mt-5 h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryAvailability}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.25)" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid rgba(148,163,184,0.2)" }} />
                <Legend />
                <Bar name="Жалпы саны" dataKey="total" fill="#0891b2" radius={[8, 8, 0, 0]} />
                <Bar name="Қолжетімді" dataKey="available" fill="#16a34a" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-lg border border-white/45 bg-white/78 p-5 shadow-glass backdrop-blur-xl dark:border-white/10 dark:bg-white/8">
          <h2 className="text-lg font-black text-slate-950 dark:text-white">Ең көп оқылатын кітаптар</h2>
          <div className="mt-5 h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mostBorrowed} layout="vertical" margin={{ left: 24 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.25)" />
                <XAxis type="number" tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} width={130} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid rgba(148,163,184,0.2)" }} />
                <Bar name="Берілім саны" dataKey="issues" radius={[0, 8, 8, 0]}>
                  {mostBorrowed.map((entry, index) => (
                    <Cell key={entry.name} fill={palette[index % palette.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
    </div>
  );
}

