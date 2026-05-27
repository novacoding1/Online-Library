import { motion } from "framer-motion";
import { BookOpen, Lock, Mail, User } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { APP_NAME } from "../lib/constants.js";
import { Button } from "../components/ui/Button.jsx";
import { FormField, inputClassName } from "../components/ui/FormField.jsx";
import { ToastViewport } from "../components/ui/ToastViewport.jsx";

export function RegisterPage() {
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    role: "student",
    department: "",
  });

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    try {
      await register(form);
      showToast({ title: "Тіркелгі жасалды", description: "Сіздің кітапхана жұмыс орныңыз дайын." });
      navigate("/dashboard", { replace: true });
    } catch (error) {
      showToast({ type: "error", title: "Тіркелу сәтсіз аяқталды", description: error.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-mist px-5 py-10 text-ink dark:bg-slate-950 dark:text-white">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg rounded-lg border border-white/45 bg-white/82 p-6 shadow-glass backdrop-blur-xl dark:border-white/10 dark:bg-white/8">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-lg bg-ink text-white dark:bg-white dark:text-ink">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-black text-slate-950 dark:text-white">{APP_NAME}</p>
            <p className="text-xs font-semibold text-slate-500">Қауіпсіз тіркелгі жасау</p>
          </div>
        </div>

        <h1 className="mt-7 text-3xl font-black tracking-normal text-slate-950 dark:text-white">Тіркелу</h1>
        <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
          <FormField label="Толық аты-жөні" icon={User}>
            <input required value={form.full_name} onChange={(event) => setForm((current) => ({ ...current, full_name: event.target.value }))} className={inputClassName(true)} />
          </FormField>
          <FormField label="Электрондық пошта" icon={Mail}>
            <input required type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} className={inputClassName(true)} />
          </FormField>
          <FormField label="Құпия сөз" icon={Lock}>
            <input required minLength={6} type="password" value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} className={inputClassName(true)} />
          </FormField>
          <FormField label="Рөл">
            <select value={form.role} onChange={(event) => setForm((current) => ({ ...current, role: event.target.value }))} className={inputClassName()}>
              <option value="student">Студент</option>
              <option value="librarian">Кітапханашы</option>
              <option value="admin">Әкімші</option>
            </select>
          </FormField>
          <FormField label="Департамент">
            <input value={form.department} onChange={(event) => setForm((current) => ({ ...current, department: event.target.value }))} className={inputClassName()} />
          </FormField>
          <Button type="submit" variant="accent" size="lg" loading={loading} className="w-full">
            Тіркелгіні жасау
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          Тіркелгіңіз бар ма?{" "}
          <Link to="/login" className="font-black text-library-cyan hover:text-cyan-700">
            Жүйеге кіру
          </Link>
        </p>
      </motion.div>
      <ToastViewport />
    </div>
  );
}

