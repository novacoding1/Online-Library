import { Download, FileText, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "../components/ui/Badge.jsx";
import { Button } from "../components/ui/Button.jsx";
import { DataTable } from "../components/ui/DataTable.jsx";
import { FormField, inputClassName } from "../components/ui/FormField.jsx";
import { PageHeader } from "../components/ui/PageHeader.jsx";
import { useLibrary } from "../context/LibraryContext.jsx";
import { useDebounce } from "../hooks/useDebounce.js";
import { exportHistoryToPdf } from "../utils/exporters.js";
import { daysBetween, formatCurrency, formatDate } from "../utils/formatters.js";

export function HistoryPage() {
  const { issues } = useLibrary();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const debouncedSearch = useDebounce(search, 200);

  const filteredIssues = useMemo(() => {
    const term = debouncedSearch.toLowerCase();
    return issues.filter((issue) => {
      const matchesStatus = status === "all" || issue.status === status;
      const matchesTerm =
        !term ||
        issue.book?.title?.toLowerCase().includes(term) ||
        issue.book?.barcode?.toLowerCase().includes(term) ||
        issue.student?.full_name?.toLowerCase().includes(term) ||
        issue.student?.student_id?.toLowerCase().includes(term);
      return matchesStatus && matchesTerm;
    });
  }, [debouncedSearch, issues, status]);

  const columns = [
    {
      key: "book",
      label: "Кітап",
      render: (issue) => (
        <div>
          <p className="font-black text-slate-950 dark:text-white">{issue.book?.title}</p>
          <p className="text-xs text-slate-500">{issue.book?.barcode}</p>
        </div>
      ),
    },
    {
      key: "student",
      label: "Студент",
      render: (issue) => (
        <div>
          <p className="font-semibold">{issue.student?.full_name}</p>
          <p className="text-xs text-slate-500">{issue.student?.student_id}</p>
        </div>
      ),
    },
    { key: "issue_date", label: "Берілген күні", render: (issue) => formatDate(issue.issue_date) },
    { key: "due_date", label: "Мерзімі", render: (issue) => formatDate(issue.due_date) },
    { key: "return_date", label: "Қайтарылған күні", render: (issue) => formatDate(issue.return_date) },
    {
      key: "held",
      label: "Пайдалану мерзімі",
      render: (issue) => `${daysBetween(issue.issue_date, issue.return_date || new Date())} күн`,
    },
    { key: "fine_amount", label: "Айыппұл", render: (issue) => formatCurrency(issue.fine_amount) },
    { key: "status", label: "Күйі", render: (issue) => <Badge status={issue.status} /> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Аудит"
        title="Кітап айналымының тарихы"
        description="Оқырмандар, күндер, қайтару күйі, пайдалану мерзімі және айыппұлдар көрсетілген толық кітап айналымының тарихы."
        actions={
          <Button variant="ghost" onClick={() => exportHistoryToPdf(filteredIssues)}>
            <Download className="h-4 w-4" />
            PDF
          </Button>
        }
      />

      <section className="grid gap-3 rounded-lg border border-white/45 bg-white/78 p-4 shadow-glass backdrop-blur-xl dark:border-white/10 dark:bg-white/8 md:grid-cols-[1fr,220px]">
        <FormField icon={Search}>
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Кітап, штрих-код немесе студент бойынша іздеу" className={inputClassName(true)} />
        </FormField>
        <select value={status} onChange={(event) => setStatus(event.target.value)} className={inputClassName()}>
          <option value="all">Барлық күйлер</option>
          <option value="issued">Берілген</option>
          <option value="returned">Қайтарылған</option>
          <option value="overdue">Мерзімі өткен</option>
        </select>
      </section>

      <DataTable
        columns={columns}
        rows={filteredIssues}
        emptyTitle="Тарих жазбалары жоқ"
        emptyDescription="Кітаптарды беру және қайтару әрекеттері осында сақталады."
      />

      <section className="rounded-lg border border-white/45 bg-white/78 p-5 shadow-glass backdrop-blur-xl dark:border-white/10 dark:bg-white/8">
        <h2 className="flex items-center gap-2 text-lg font-black text-slate-950 dark:text-white">
          <FileText className="h-5 w-5 text-library-cyan" />
          Қорытынды есеп
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg bg-slate-50 p-4 dark:bg-white/5">
            <p className="text-sm font-bold text-slate-500">Жалпы жазбалар</p>
            <p className="mt-2 text-2xl font-black text-slate-950 dark:text-white">{filteredIssues.length}</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-4 dark:bg-white/5">
            <p className="text-sm font-bold text-slate-500">Белсенді</p>
            <p className="mt-2 text-2xl font-black text-slate-950 dark:text-white">{filteredIssues.filter((issue) => issue.status === "issued").length}</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-4 dark:bg-white/5">
            <p className="text-sm font-bold text-slate-500">Жалпы айыппұлдар</p>
            <p className="mt-2 text-2xl font-black text-slate-950 dark:text-white">
              {formatCurrency(filteredIssues.reduce((sum, issue) => sum + Number(issue.fine_amount || 0), 0))}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

