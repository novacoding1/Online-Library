import { Activity, ShieldCheck, UserCog } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "../components/ui/Badge.jsx";
import { Button } from "../components/ui/Button.jsx";
import { DataTable } from "../components/ui/DataTable.jsx";
import { PageHeader } from "../components/ui/PageHeader.jsx";
import { StatCard } from "../components/ui/StatCard.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useLibrary } from "../context/LibraryContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { libraryService } from "../services/libraryService.js";
import { formatDateTime } from "../utils/formatters.js";

export function AdminPage() {
  const { user } = useAuth();
  const { books, students, issues, activityLogs, refresh } = useLibrary();
  const { showToast } = useToast();
  const [users, setUsers] = useState([]);
  const [loadingRole, setLoadingRole] = useState("");

  useEffect(() => {
    let cancelled = false;
    libraryService.getUsers().then((data) => {
      if (!cancelled) setUsers(data);
    });
    return () => {
      cancelled = true;
    };
  }, [activityLogs.length]);

  async function changeRole(targetUser, role) {
    setLoadingRole(targetUser.id);
    try {
      const updated = await libraryService.updateUserRole(targetUser.id, role, user.id);
      setUsers((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      await refresh();
      const roleName = role === "admin" ? "Әкімші" : role === "librarian" ? "Кітапханашы" : "Студент";
      showToast({ title: "Рөл жаңартылды", description: `${updated.full_name} қазір ${roleName} рөлінде.` });
    } catch (error) {
      showToast({ type: "error", title: "Рөлді жаңарту сәтсіз аяқталды", description: error.message });
    } finally {
      setLoadingRole("");
    }
  }

  const userColumns = [
    {
      key: "full_name",
      label: "Пайдаланушы",
      render: (item) => (
        <div>
          <p className="font-black text-slate-950 dark:text-white">{item.full_name}</p>
          <p className="text-xs text-slate-500">{item.email}</p>
        </div>
      ),
    },
    { key: "department", label: "Департамент" },
    { key: "role", label: "Рөл", render: (item) => <Badge status={item.role === "admin" ? "maintenance" : item.role === "librarian" ? "returned" : "available"}>{item.role === "admin" ? "Әкімші" : item.role === "librarian" ? "Кітапханашы" : "Студент"}</Badge> },
    {
      key: "actions",
      label: "Рөлді басқару",
      render: (item) => (
        <div className="flex flex-wrap gap-2">
          {["admin", "librarian", "student"].map((role) => (
            <Button key={role} variant={item.role === role ? "primary" : "ghost"} size="sm" loading={loadingRole === item.id && item.role !== role} disabled={item.role === role} onClick={() => changeRole(item, role)}>
              {role === "admin" ? "Әкімші" : role === "librarian" ? "Кітапханашы" : "Студент"}
            </Button>
          ))}
        </div>
      ),
    },
  ];

  const logColumns = [
    { key: "action", label: "Әрекет", render: (log) => <Badge status="returned">{log.action}</Badge> },
    { key: "message", label: "Хабарлама" },
    { key: "entity_type", label: "Нысан" },
    { key: "created_at", label: "Уақыты", render: (log) => formatDateTime(log.created_at) },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Әкімшілік"
        title="Әкімшілік басқару панелі"
        description="Қызметкерлердің рөлдерін басқарыңыз, платформа журналдарын бақылаңыз және кітапхананың жалпы жұмысын қадағалаңыз."
      />

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard title="Пайдаланушылар" value={users.length} icon={UserCog} accent="cyan" />
        <StatCard title="Кітаптар" value={books.length} icon={ShieldCheck} accent="emerald" />
        <StatCard title="Студенттер" value={students.length} icon={Activity} accent="coral" />
        <StatCard title="Берілімдер" value={issues.length} icon={Activity} accent="violet" />
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-black text-slate-950 dark:text-white">Рөлдерді басқару</h2>
        <DataTable columns={userColumns} rows={users} emptyTitle="Пайдаланушылар табылған жоқ" emptyDescription="Тіркелген пайдаланушылар осында көрсетіледі." />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-black text-slate-950 dark:text-white">Әрекеттер журналдары</h2>
        <DataTable columns={logColumns} rows={activityLogs} emptyTitle="Әрекет журналы бос" emptyDescription="Жүйелік әрекеттер осында көрсетіледі." />
      </section>
    </div>
  );
}

