import { BookCheck, RotateCcw, ScanLine, Send } from "lucide-react";
import { useMemo, useState } from "react";
import { BarcodeScanner } from "../components/scanner/BarcodeScanner.jsx";
import { Badge } from "../components/ui/Badge.jsx";
import { Button } from "../components/ui/Button.jsx";
import { DataTable } from "../components/ui/DataTable.jsx";
import { FormField, inputClassName } from "../components/ui/FormField.jsx";
import { PageHeader } from "../components/ui/PageHeader.jsx";
import { useLibrary } from "../context/LibraryContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { libraryService } from "../services/libraryService.js";
import { formatDate } from "../utils/formatters.js";

function dueInTwoWeeks() {
  return new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

export function IssueReturnPage() {
  const { books, students, issues, issueBook, returnBook } = useLibrary();
  const { showToast } = useToast();
  const [mode, setMode] = useState("issue");
  const [issueForm, setIssueForm] = useState({ bookId: "", studentId: "", dueDate: dueInTwoWeeks(), notes: "" });
  const [returnIssueId, setReturnIssueId] = useState("");
  const [loading, setLoading] = useState(false);

  const availableBooks = useMemo(() => books.filter((book) => book.status === "available" && book.available_quantity > 0), [books]);
  const openIssues = useMemo(() => issues.filter((issue) => issue.status === "issued"), [issues]);
  const selectedBook = books.find((book) => book.id === issueForm.bookId);
  const selectedIssue = openIssues.find((issue) => issue.id === returnIssueId);

  async function scanForIssue(code) {
    const found = await libraryService.findBookByCode(code);
    if (!found) {
      showToast({ type: "error", title: "Кітап табылмады", description: code });
      return;
    }
    setIssueForm((current) => ({ ...current, bookId: found.id }));
    showToast({ title: "Кітап таңдалды", description: found.title });
  }

  async function scanForReturn(code) {
    const found = await libraryService.findBookByCode(code);
    if (!found) {
      showToast({ type: "error", title: "Кітап табылмады", description: code });
      return;
    }
    const openIssue = await libraryService.findOpenIssueByBook(found.id);
    if (!openIssue) {
      showToast({ type: "error", title: "Белсенді берілім табылған жоқ", description: `${found.title} қазір ешкімге берілмеген.` });
      return;
    }
    setReturnIssueId(openIssue.id);
    showToast({ title: "Қайтару жазбасы таңдалды", description: found.title });
  }

  async function submitIssue(event) {
    event.preventDefault();
    setLoading(true);
    try {
      await issueBook(issueForm);
      setIssueForm({ bookId: "", studentId: "", dueDate: dueInTwoWeeks(), notes: "" });
    } catch (error) {
      showToast({ type: "error", title: "Кітап беру сәтсіз аяқталды", description: error.message });
    } finally {
      setLoading(false);
    }
  }

  async function submitReturn() {
    if (!returnIssueId) return;
    setLoading(true);
    try {
      await returnBook({ issueId: returnIssueId });
      setReturnIssueId("");
    } catch (error) {
      showToast({ type: "error", title: "Қайтару сәтсіз аяқталды", description: error.message });
    } finally {
      setLoading(false);
    }
  }

  const openIssueColumns = [
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
      render: (issue) => issue.student?.full_name,
    },
    { key: "due_date", label: "Мерзімі", render: (issue) => formatDate(issue.due_date) },
    { key: "status", label: "Статусы", render: (issue) => <Badge status={issue.status} /> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Айналым"
        title="Кітаптарды беру және қайтару"
        description="Студенттерге кітаптарды рәсімдеңіз, белгілерді сканерлеңіз, қор күйін жаңартыңыз және қайтару жазбаларын жабыңыз."
      />

      <div className="inline-flex rounded-lg border border-slate-200 bg-white/80 p-1 shadow-sm dark:border-white/10 dark:bg-white/8">
        <button type="button" onClick={() => setMode("issue")} className={`rounded-lg px-4 py-2 text-sm font-black transition ${mode === "issue" ? "bg-ink text-white dark:bg-white dark:text-ink" : "text-slate-600 dark:text-slate-300"}`}>
          Беру
        </button>
        <button type="button" onClick={() => setMode("return")} className={`rounded-lg px-4 py-2 text-sm font-black transition ${mode === "return" ? "bg-ink text-white dark:bg-white dark:text-ink" : "text-slate-600 dark:text-slate-300"}`}>
          Қайтару
        </button>
      </div>

      {mode === "issue" ? (
        <div className="grid gap-4 xl:grid-cols-[0.9fr,1.1fr]">
          <section className="rounded-lg border border-white/45 bg-white/78 p-5 shadow-glass backdrop-blur-xl dark:border-white/10 dark:bg-white/8">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-black text-slate-950 dark:text-white">
              <ScanLine className="h-5 w-5 text-library-cyan" />
              Беру үшін сканерлеңіз
            </h2>
            <BarcodeScanner compact onDetected={scanForIssue} />
          </section>

          <section className="rounded-lg border border-white/45 bg-white/78 p-5 shadow-glass backdrop-blur-xl dark:border-white/10 dark:bg-white/8">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-black text-slate-950 dark:text-white">
              <Send className="h-5 w-5 text-library-emerald" />
              Беру мәліметтері
            </h2>
            <form onSubmit={submitIssue} className="grid gap-4 sm:grid-cols-2">
              <FormField label="Кітап">
                <select required value={issueForm.bookId} onChange={(event) => setIssueForm((current) => ({ ...current, bookId: event.target.value }))} className={inputClassName()}>
                  <option value="">Кітапты таңдаңыз</option>
                  {availableBooks.map((book) => (
                    <option key={book.id} value={book.id}>
                      {book.title} · {book.barcode}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField label="Студент">
                <select required value={issueForm.studentId} onChange={(event) => setIssueForm((current) => ({ ...current, studentId: event.target.value }))} className={inputClassName()}>
                  <option value="">Студентті таңдаңыз</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.full_name} · {student.student_id}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField label="Қайтару мерзімі">
                <input required type="date" value={issueForm.dueDate} onChange={(event) => setIssueForm((current) => ({ ...current, dueDate: event.target.value }))} className={inputClassName()} />
              </FormField>
              <FormField label="Қосымша мәліметтер">
                <input value={issueForm.notes} onChange={(event) => setIssueForm((current) => ({ ...current, notes: event.target.value }))} className={inputClassName()} />
              </FormField>
              {selectedBook ? (
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5 sm:col-span-2">
                  <p className="text-sm font-black text-slate-950 dark:text-white">{selectedBook.title}</p>
                  <p className="mt-1 text-sm text-slate-500">Қолжетімді: {selectedBook.available_quantity}/{selectedBook.quantity}</p>
                </div>
              ) : null}
              <div className="sm:col-span-2">
                <Button type="submit" variant="success" size="lg" loading={loading} className="w-full">
                  <BookCheck className="h-4 w-4" />
                  Кітапты беру
                </Button>
              </div>
            </form>
          </section>
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-[0.9fr,1.1fr]">
          <section className="rounded-lg border border-white/45 bg-white/78 p-5 shadow-glass backdrop-blur-xl dark:border-white/10 dark:bg-white/8">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-black text-slate-950 dark:text-white">
              <ScanLine className="h-5 w-5 text-library-cyan" />
              Қайтару үшін сканерлеңіз
            </h2>
            <BarcodeScanner compact onDetected={scanForReturn} />
          </section>

          <section className="space-y-4 rounded-lg border border-white/45 bg-white/78 p-5 shadow-glass backdrop-blur-xl dark:border-white/10 dark:bg-white/8">
            <h2 className="flex items-center gap-2 text-lg font-black text-slate-950 dark:text-white">
              <RotateCcw className="h-5 w-5 text-library-coral" />
              Қайтарылмаған кітаптар
            </h2>
            <select value={returnIssueId} onChange={(event) => setReturnIssueId(event.target.value)} className={inputClassName()}>
              <option value="">Белсенді берілімді таңдаңыз</option>
              {openIssues.map((issue) => (
                <option key={issue.id} value={issue.id}>
                  {issue.book?.title} · {issue.student?.full_name}
                </option>
              ))}
            </select>
            {selectedIssue ? (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
                <p className="text-sm font-black text-slate-950 dark:text-white">{selectedIssue.book?.title}</p>
                <p className="mt-1 text-sm text-slate-500">{selectedIssue.student?.full_name} · Мерзімі: {formatDate(selectedIssue.due_date)}</p>
              </div>
            ) : null}
            <Button variant="accent" size="lg" disabled={!returnIssueId} loading={loading} onClick={submitReturn} className="w-full">
              <RotateCcw className="h-4 w-4" />
              Кітапты қайтару
            </Button>
          </section>
        </div>
      )}

      <section>
        <h2 className="mb-3 text-lg font-black text-slate-950 dark:text-white">Қазір қолданыстағы кітаптар</h2>
        <DataTable columns={openIssueColumns} rows={openIssues} emptyTitle="Белсенді берілімдер жоқ" emptyDescription="Берілген кітаптар осында көрсетіледі." />
      </section>
    </div>
  );
}

