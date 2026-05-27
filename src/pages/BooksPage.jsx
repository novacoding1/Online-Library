import { AnimatePresence, motion } from "framer-motion";
import { Download, Edit3, Plus, QrCode, Search, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { BookForm } from "../components/books/BookForm.jsx";
import { QRCodeDialog } from "../components/books/QRCodeDialog.jsx";
import { Badge } from "../components/ui/Badge.jsx";
import { Button } from "../components/ui/Button.jsx";
import { DataTable } from "../components/ui/DataTable.jsx";
import { FormField, inputClassName } from "../components/ui/FormField.jsx";
import { Modal } from "../components/ui/Modal.jsx";
import { PageHeader } from "../components/ui/PageHeader.jsx";
import { useLibrary } from "../context/LibraryContext.jsx";
import { useDebounce } from "../hooks/useDebounce.js";
import { PAGE_SIZE } from "../lib/constants.js";
import { exportBooksToExcel } from "../utils/exporters.js";
import { formatDate } from "../utils/formatters.js";

export function BooksPage() {
  const { categories, createBook, updateBook, deleteBook, searchBooks, books: allBooks } = useLibrary();
  const [books, setBooks] = useState(allBooks);
  const [count, setCount] = useState(allBooks.length);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortDir, setSortDir] = useState("desc");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [modalBook, setModalBook] = useState(null);
  const [qrBook, setQrBook] = useState(null);
  const debouncedSearch = useDebounce(search, 250);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const result = await searchBooks({
          search: debouncedSearch,
          status,
          category,
          sortBy,
          sortDir,
          page,
          pageSize: PAGE_SIZE,
        });
        if (!cancelled) {
          setBooks(result.data);
          setCount(result.count || 0);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [category, debouncedSearch, page, searchBooks, sortBy, sortDir, status]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status, category]);

  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));

  function handleSort(key) {
    if (sortBy === key) {
      setSortDir((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }
    setSortBy(key);
    setSortDir("asc");
  }

  async function handleSubmitBook(payload) {
    try {
      if (modalBook?.id) {
        await updateBook(modalBook.id, payload);
      } else {
        await createBook(payload);
      }
      setModalBook(null);
    } catch (error) {
      console.error("Failed to submit book:", error);
    }
  }

  async function handleDelete(book) {
    if (!window.confirm(`"${book.title}" кітабын каталогтан өшіруді растайсыз ба?`)) return;
    await deleteBook(book.id);
  }

  const columns = useMemo(
    () => [
      {
        key: "title",
        label: "Кітап",
        sortable: true,
        render: (book) => (
          <div className="flex min-w-64 items-center gap-3">
            <img src={book.image} alt="" className="h-14 w-10 rounded-md object-cover shadow-sm" />
            <div className="min-w-0">
              <p className="truncate font-black text-slate-950 dark:text-white">{book.title}</p>
              <p className="truncate text-xs font-semibold text-slate-500">{book.author}</p>
            </div>
          </div>
        ),
      },
      { key: "category", label: "Санат", sortable: true },
      {
        key: "barcode",
        label: "Штрих-код",
        render: (book) => <span className="font-mono text-xs font-bold">{book.barcode}</span>,
      },
      {
        key: "available_quantity",
        label: "Қолжетімділігі",
        sortable: true,
        render: (book) => (
          <span className="font-black text-slate-950 dark:text-white">
            {book.available_quantity}/{book.quantity}
          </span>
        ),
      },
      {
        key: "status",
        label: "Күйі",
        sortable: true,
        render: (book) => <Badge status={book.status} />,
      },
      {
        key: "created_at",
        label: "Қосылған күні",
        sortable: true,
        render: (book) => formatDate(book.created_at),
      },
      {
        key: "actions",
        label: "",
        render: (book) => (
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="icon" onClick={() => setQrBook(book)} aria-label="Show QR code">
              <QrCode className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setModalBook(book)} aria-label="Edit book">
              <Edit3 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => handleDelete(book)} aria-label="Delete book">
              <Trash2 className="h-4 w-4 text-library-rose" />
            </Button>
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Каталог"
        title="Кітаптарды басқару"
        description="Кітаптарды тіркеңіз, мұқабаларды жүктеңіз, QR кодтарын жасаңыз, қорды сүзгіден өткізіңіз және каталог күйін бақылаңыз."
        actions={
          <>
            <Button variant="ghost" onClick={() => exportBooksToExcel(allBooks)}>
              <Download className="h-4 w-4" />
              Excel
            </Button>
            <Button variant="accent" onClick={() => setModalBook({})}>
              <Plus className="h-4 w-4" />
              Кітап қосу
            </Button>
          </>
        }
      />

      <section className="grid gap-3 rounded-lg border border-white/45 bg-white/78 p-4 shadow-glass backdrop-blur-xl dark:border-white/10 dark:bg-white/8 md:grid-cols-[1fr,180px,220px]">
        <FormField icon={Search}>
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Атауы, авторы немесе штрих-коды бойынша іздеу" className={inputClassName(true)} />
        </FormField>
        <select value={status} onChange={(event) => setStatus(event.target.value)} className={inputClassName()}>
          <option value="all">Барлық күйлер</option>
          <option value="available">Қолжетімді</option>
          <option value="issued">Берілген</option>
          <option value="maintenance">Реттеуде</option>
          <option value="lost">Жоғалған</option>
        </select>
        <select value={category} onChange={(event) => setCategory(event.target.value)} className={inputClassName()}>
          <option value="all">Барлық санаттар</option>
          {categories.map((item) => (
            <option key={item.id} value={item.name}>
              {item.name}
            </option>
          ))}
        </select>
      </section>

      <AnimatePresence mode="wait">
        <motion.div key={`${page}-${status}-${category}-${debouncedSearch}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
          <DataTable
            columns={columns}
            rows={books}
            onSort={handleSort}
            sortBy={sortBy}
            sortDir={sortDir}
            emptyTitle={loading ? "Каталог жүктелуде" : "Кітаптар табылған жоқ"}
            emptyDescription={loading ? "Соңғы қор дайындалуда." : "Басқа іздеу сөзін енгізіңіз немесе жаңа кітап қосыңыз."}
          />
        </motion.div>
      </AnimatePresence>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
          Бет көрсетілуде: {page} / {totalPages} · Барлығы: {count} жазба
        </p>
        <div className="flex gap-2">
          <Button variant="ghost" disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>
            Артқа
          </Button>
          <Button variant="ghost" disabled={page >= totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))}>
            Алға
          </Button>
        </div>
      </div>

      <Modal
        open={Boolean(modalBook)}
        onClose={() => setModalBook(null)}
        title={modalBook?.id ? "Кітапты өңдеу" : "Кітап қосу"}
        description="Каталог мәліметтері, күйі, мұқаба суреті және сканер кодтары."
        size="max-w-5xl"
      >
        <BookForm categories={categories} initialBook={modalBook?.id ? modalBook : null} onSubmit={handleSubmitBook} onCancel={() => setModalBook(null)} />
      </Modal>

      <QRCodeDialog book={qrBook} open={Boolean(qrBook)} onClose={() => setQrBook(null)} />
    </div>
  );
}

