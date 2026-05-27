import { motion } from "framer-motion";
import { BookOpen, Lock, Mail, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { APP_NAME, demoCredentials } from "../lib/constants.js";
import { Button } from "../components/ui/Button.jsx";
import { FormField, inputClassName } from "../components/ui/FormField.jsx";
import { ToastViewport } from "../components/ui/ToastViewport.jsx";

export function LoginPage() {
  const { login, user, isDemoMode } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "admin@aurelia.edu", password: "admin123" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) navigate(location.state?.from?.pathname || "/dashboard", { replace: true });
  }, [location.state?.from?.pathname, navigate, user]);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      showToast({ title: "Қош келдіңіз!", description: "Кітапхана жұмыс орны дайын." });
      navigate(location.state?.from?.pathname || "/dashboard", { replace: true });
    } catch (error) {
      showToast({ type: "error", title: "Жүйеге кіру сәтсіз аяқталды", description: error.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-mist text-ink dark:bg-slate-950 dark:text-white">
      <div className="grid min-h-screen lg:grid-cols-[1.08fr,0.92fr]">
        <section className="relative hidden overflow-hidden bg-ink p-10 text-white dark:bg-slate-900 lg:flex">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(8,145,178,0.45),rgba(15,23,42,0.72)_45%,rgba(22,163,74,0.28)),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(180deg,rgba(255,255,255,0.07)_1px,transparent_1px)] bg-[size:auto,48px_48px,48px_48px]" />
          <div className="relative z-10 flex w-full flex-col justify-between">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-lg bg-white text-ink">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-black">{APP_NAME}</p>
                <p className="text-xs font-semibold text-white/62">Университет кітапханасын басқару</p>
              </div>
            </div>
            <div className="max-w-2xl">
              <p className="text-sm font-black uppercase text-cyan-200">Кітапхана жұмысының кәсіби деңгейі</p>
              <h1 className="mt-4 text-5xl font-black tracking-normal">Каталог, айналым, сканер, студенттер және аналитика бір жұмыс орнында.</h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-white/72">
                Кітаптарды жылдам тіркеу, QR кодтарымен жұмыс істеу, қорғалған рөлдер және сенімді беру тарихын қажет ететін университет кітапханашыларына арналған.
              </p>
            </div>
          </div>
        </section>

        <main className="flex items-center justify-center px-5 py-10">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
            <div className="mb-8 flex items-center gap-3 lg:hidden">
              <div className="grid h-11 w-11 place-items-center rounded-lg bg-ink text-white dark:bg-white dark:text-ink">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-black text-slate-950 dark:text-white">{APP_NAME}</p>
                <p className="text-xs font-semibold text-slate-500">Университет кітапханасын басқару</p>
              </div>
            </div>

            <div className="rounded-lg border border-white/45 bg-white/82 p-6 shadow-glass backdrop-blur-xl dark:border-white/10 dark:bg-white/8">
              <div>
                <div className="mb-4 inline-flex rounded-lg bg-cyan-50 p-3 text-library-cyan dark:bg-cyan-500/10">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h2 className="text-2xl font-black text-slate-950 dark:text-white">Жүйеге кіру</h2>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Университет кітапханасының басқару тақтасына өтіңіз.</p>
              </div>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <FormField label="Электрондық пошта" icon={Mail}>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                    className={inputClassName(true)}
                  />
                </FormField>
                <FormField label="Құпия сөз" icon={Lock}>
                  <input
                    type="password"
                    required
                    value={form.password}
                    onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                    className={inputClassName(true)}
                  />
                </FormField>
                <Button type="submit" variant="accent" size="lg" loading={loading} className="w-full">
                  Кіру
                </Button>
              </form>

              {isDemoMode ? (
                <div className="mt-5 grid gap-2">
                  {demoCredentials.map((credential) => (
                    <button
                      key={credential.email}
                      type="button"
                      onClick={() => setForm({ email: credential.email, password: credential.password })}
                      className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-left text-xs font-bold text-slate-600 transition hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
                    >
                      <span>{credential.role}</span>
                      <span>{credential.email}</span>
                    </button>
                  ))}
                </div>
              ) : null}

              <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
                Жаңа аккаунт па?{" "}
                <Link to="/register" className="font-black text-library-cyan hover:text-cyan-700">
                  Тіркелу
                </Link>
              </p>
            </div>
          </motion.div>
        </main>
      </div>
      <ToastViewport />
    </div>
  );
}

