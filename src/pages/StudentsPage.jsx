import { Download, Edit3, Plus, Search, Trash2, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { StudentForm } from "../components/students/StudentForm.jsx";
import { Badge } from "../components/ui/Badge.jsx";
import { Button } from "../components/ui/Button.jsx";
import { DataTable } from "../components/ui/DataTable.jsx";
import { FormField, inputClassName } from "../components/ui/FormField.jsx";
import { Modal } from "../components/ui/Modal.jsx";
import { PageHeader } from "../components/ui/PageHeader.jsx";
import { useLibrary } from "../context/LibraryContext.jsx";
import { useDebounce } from "../hooks/useDebounce.js";
import { exportStudentsToExcel } from "../utils/exporters.js";
import { formatDate } from "../utils/formatters.js";

export function StudentsPage() {
  const { students, createStudent, updateStudent, deleteStudent } = useLibrary();
  const [search, setSearch] = useState("");
  const [modalStudent, setModalStudent] = useState(null);
  const debouncedSearch = useDebounce(search, 200);

  const filteredStudents = useMemo(() => {
    const term = debouncedSearch.toLowerCase();
    if (!term) return students;
    return students.filter(
      (student) =>
        student.full_name.toLowerCase().includes(term) ||
        student.student_id.toLowerCase().includes(term) ||
        student.email.toLowerCase().includes(term) ||
        student.faculty.toLowerCase().includes(term) ||
        student.study_group.toLowerCase().includes(term),
    );
  }, [debouncedSearch, students]);

  async function handleSubmit(payload) {
    if (modalStudent?.id) {
      await updateStudent(modalStudent.id, payload);
    } else {
      await createStudent(payload);
    }
    setModalStudent(null);
  }

  async function handleDelete(student) {
    if (!window.confirm(`${student.full_name} студентін тізімнен өшіруді растайсыз ба?`)) return;
    await deleteStudent(student.id);
  }

  const columns = [
    {
      key: "full_name",
      label: "Студент",
      render: (student) => (
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br from-library-cyan to-library-emerald text-sm font-black text-white">
            {student.full_name
              .split(" ")
              .map((part) => part[0])
              .join("")
              .slice(0, 2)}
          </div>
          <div>
            <p className="font-black text-slate-950 dark:text-white">{student.full_name}</p>
            <p className="text-xs text-slate-500">{student.student_id}</p>
          </div>
        </div>
      ),
    },
    { key: "faculty", label: "Факультет" },
    { key: "study_group", label: "Топ" },
    { key: "email", label: "Электрондық пошта" },
    { key: "phone", label: "Телефон" },
    { key: "created_at", label: "Тіркелген күні", render: (student) => formatDate(student.created_at) },
    { key: "status", label: "Күйі", render: (student) => <Badge status={student.status === "active" ? "available" : "maintenance"}>{student.status === "active" ? "Белсенді" : "Бұғатталған"}</Badge> },
    {
      key: "actions",
      label: "",
      render: (student) => (
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="icon" onClick={() => setModalStudent(student)} aria-label="Edit student">
            <Edit3 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleDelete(student)} aria-label="Delete student">
            <Trash2 className="h-4 w-4 text-library-rose" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Реестр"
        title="Студенттерді басқару"
        description="Факультет, топ, байланыс ақпараты және студенттік ID арқылы оқырмандар профильдерін жүргізіңіз."
        actions={
          <>
            <Button variant="ghost" onClick={() => exportStudentsToExcel(students)}>
              <Download className="h-4 w-4" />
              Excel
            </Button>
            <Button variant="accent" onClick={() => setModalStudent({})}>
              <Plus className="h-4 w-4" />
              Студент қосу
            </Button>
          </>
        }
      />

      <section className="flex flex-col gap-3 rounded-lg border border-white/45 bg-white/78 p-4 shadow-glass backdrop-blur-xl dark:border-white/10 dark:bg-white/8 sm:flex-row sm:items-center sm:justify-between">
        <FormField icon={Search} className="w-full max-w-xl">
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Аты, факультеті, тобы, поштасы бойынша іздеу" className={inputClassName(true)} />
        </FormField>
        <div className="flex items-center gap-2 text-sm font-black text-slate-500 dark:text-slate-400">
          <Users className="h-4 w-4 text-library-cyan" />
          {filteredStudents.length} студент
        </div>
      </section>

      <DataTable columns={columns} rows={filteredStudents} emptyTitle="Студенттер табылған жоқ" emptyDescription="Жаңа студент қосыңыз немесе іздеу сөзін өзгертіңіз." />

      <Modal
        open={Boolean(modalStudent)}
        onClose={() => setModalStudent(null)}
        title={modalStudent?.id ? "Студентті өңдеу" : "Студент қосу"}
        description="Кітаптарды беру және қайтару үшін қолданылатын студент профилі."
      >
        <StudentForm initialStudent={modalStudent?.id ? modalStudent : null} onSubmit={handleSubmit} onCancel={() => setModalStudent(null)} />
      </Modal>
    </div>
  );
}

