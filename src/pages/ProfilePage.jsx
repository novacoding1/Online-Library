import { Mail, Phone, Save, User } from "lucide-react";
import { useState } from "react";
import { Button } from "../components/ui/Button.jsx";
import { FormField, inputClassName } from "../components/ui/FormField.jsx";
import { PageHeader } from "../components/ui/PageHeader.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { getInitials } from "../utils/formatters.js";

export function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const { showToast } = useToast();
  const [form, setForm] = useState({
    full_name: user?.full_name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    department: user?.department || "",
  });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    try {
      await updateProfile(form);
      showToast({ title: "Profile saved", description: "Your account details were updated." });
    } catch (error) {
      showToast({ type: "error", title: "Profile update failed", description: error.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Account" title="Profile" description="Personal information used across the library management workspace." />

      <section className="grid gap-4 xl:grid-cols-[0.6fr,1.4fr]">
        <div className="rounded-lg border border-white/45 bg-white/78 p-5 text-center shadow-glass backdrop-blur-xl dark:border-white/10 dark:bg-white/8">
          <div className="mx-auto grid h-24 w-24 place-items-center rounded-lg bg-gradient-to-br from-library-cyan to-library-emerald text-3xl font-black text-white shadow-lift">
            {getInitials(user?.full_name || user?.email)}
          </div>
          <h2 className="mt-4 text-xl font-black text-slate-950 dark:text-white">{user?.full_name}</h2>
          <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">{user?.role}</p>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4 rounded-lg border border-white/45 bg-white/78 p-5 shadow-glass backdrop-blur-xl dark:border-white/10 dark:bg-white/8 sm:grid-cols-2">
          <FormField label="Full name" icon={User}>
            <input value={form.full_name} onChange={(event) => setForm((current) => ({ ...current, full_name: event.target.value }))} className={inputClassName(true)} />
          </FormField>
          <FormField label="Email" icon={Mail}>
            <input type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} className={inputClassName(true)} />
          </FormField>
          <FormField label="Phone" icon={Phone}>
            <input value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} className={inputClassName(true)} />
          </FormField>
          <FormField label="Department">
            <input value={form.department} onChange={(event) => setForm((current) => ({ ...current, department: event.target.value }))} className={inputClassName()} />
          </FormField>
          <div className="sm:col-span-2">
            <Button type="submit" variant="accent" loading={loading}>
              <Save className="h-4 w-4" />
              Save profile
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}

