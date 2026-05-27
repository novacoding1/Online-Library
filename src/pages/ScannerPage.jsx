import { BookOpen, QrCode, UserCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { BarcodeScanner } from "../components/scanner/BarcodeScanner.jsx";
import { Badge } from "../components/ui/Badge.jsx";
import { Button } from "../components/ui/Button.jsx";
import { FormField, inputClassName } from "../components/ui/FormField.jsx";
import { PageHeader } from "../components/ui/PageHeader.jsx";
import { useLibrary } from "../context/LibraryContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { libraryService } from "../services/libraryService.js";
import { formatDate } from "../utils/formatters.js";

function defaultDueDate() {
  return new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

export function ScannerPage() {
  const { students, issueBook } = useLibrary();
  const { showToast } = useToast();
  const [book, setBook] = useState(null);
  const [studentId, setStudentId] = useState("");
  const [dueDate, setDueDate] = useState(defaultDueDate());
  const [loading, setLoading] = useState(false);

  const selectedStudent = useMemo(() => students.find((student) => student.id === studentId), [studentId, students]);

  async function handleDetected(code) {
    setLoading(true);
    try {
      const found = await libraryService.findBookByCode(code);
      if (!found) {
        setBook(null);
        showToast({ type: "error", title: "Кітап табылмады", description: code });
        return;
      }
      setBook(found);
      showToast({ title: "Кітап табылды", description: found.title });
    } catch (error) {
      showToast({ type: "error", title: "Сканерлеу арқылы іздеу сәтсіз аяқталды", description: error.message });
    } finally {
      setLoading(false);
    }
  }

  async function handleIssue() {
    if (!book || !studentId) return;
    setLoading(true);
    try {
      await issueBook({ bookId: book.id, studentId, dueDate });
      setBook(null);
      setStudentId("");
    } catch (error) {
      showToast({ type: "error", title: "Кітап беру сәтсіз аяқталды", description: error.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Сканер"
        title="QR және штрих-код сканері"
        description="Каталог мәліметтерін табу және кітапты беру үшін оның штрих-кодын/QR кодын камерамен сканерлеңіз немесе қолмен енгізіңіз."
      />

      <div className="grid gap-4 xl:grid-cols-[1fr,0.85fr]">
        <section className="rounded-lg border border-white/45 bg-white/78 p-5 shadow-glass backdrop-blur-xl dark:border-white/10 dark:bg-white/8">
          <BarcodeScanner onDetected={handleDetected} />
        </section>

        <section className="rounded-lg border border-white/45 bg-white/78 p-5 shadow-glass backdrop-blur-xl dark:border-white/10 dark:bg-white/8">
          <div className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-library-cyan" />
            <h2 className="text-lg font-black text-slate-950 dark:text-white">Сканерлеу нәтижесі</h2>
          </div>

          {book ? (
            <div className="mt-5 space-y-5">
              <div className="flex gap-4">
                <img src={book.image} alt={book.title} className="h-40 w-28 rounded-lg object-cover shadow-lift" />
                <div className="min-w-0 flex-1">
                  <Badge status={book.status} />
                  <h3 className="mt-3 text-xl font-black text-slate-950 dark:text-white">{book.title}</h3>
                  <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">{book.author}</p>
                  <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{book.description}</p>
                </div>
              </div>

              <div className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5 sm:grid-cols-3">
                <div>
                  <p className="text-xs font-bold text-slate-500">Штрих-код</p>
                  <p className="mt-1 font-mono text-sm font-black text-slate-950 dark:text-white">{book.barcode}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500">Қолжетімді</p>
                  <p className="mt-1 text-sm font-black text-slate-950 dark:text-white">
                    {book.available_quantity}/{book.quantity}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500">Қосылған күні</p>
                  <p className="mt-1 text-sm font-black text-slate-950 dark:text-white">{formatDate(book.created_at)}</p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Студент">
                  <select value={studentId} onChange={(event) => setStudentId(event.target.value)} className={inputClassName()}>
                    <option value="">Студентті таңдаңыз</option>
                    {students.map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.full_name} · {student.student_id}
                      </option>
                    ))}
                  </select>
                </FormField>
                <FormField label="Қайтару мерзімі">
                  <input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} className={inputClassName()} />
                </FormField>
              </div>

              <Button variant="success" size="lg" disabled={!selectedStudent || book.status !== "available" || book.available_quantity <= 0} loading={loading} onClick={handleIssue} className="w-full">
                <UserCheck className="h-4 w-4" />
                Студентке беру
              </Button>
            </div>
          ) : (
            <div className="mt-10 flex min-h-72 flex-col items-center justify-center text-center">
              <div className="rounded-lg bg-slate-100 p-4 text-library-cyan dark:bg-white/10">
                <BookOpen className="h-10 w-10" />
              </div>
              <h3 className="mt-4 text-lg font-black text-slate-950 dark:text-white">Кітап таңдалмаған</h3>
              <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500 dark:text-slate-400">Кітап профилін жылдам ашу үшін QR немесе штрих-кодты сканерлеңіз.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
