import { useState } from "react";
import { Button } from "../ui/Button.jsx";
import { FormField, inputClassName } from "../ui/FormField.jsx";

const emptyStudent = {
  full_name: "",
  student_id: "",
  faculty: "",
  study_group: "",
  email: "",
  phone: "",
  status: "active",
};

export function StudentForm({ initialStudent, onSubmit, onCancel }) {
  const [form, setForm] = useState(() => ({ ...emptyStudent, ...initialStudent }));
  const isEditing = Boolean(initialStudent?.id);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    await onSubmit(form);
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
      <FormField label="Толық аты-жөні">
        <input required value={form.full_name} onChange={(event) => updateField("full_name", event.target.value)} className={inputClassName()} />
      </FormField>
      <FormField label="Студенттік ID">
        <input required value={form.student_id} onChange={(event) => updateField("student_id", event.target.value)} className={inputClassName()} />
      </FormField>
      <FormField label="Факультет">
        <input required value={form.faculty} onChange={(event) => updateField("faculty", event.target.value)} className={inputClassName()} />
      </FormField>
      <FormField label="Топ">
        <input required value={form.study_group} onChange={(event) => updateField("study_group", event.target.value)} className={inputClassName()} />
      </FormField>
      <FormField label="Электрондық пошта">
        <input required type="email" value={form.email} onChange={(event) => updateField("email", event.target.value)} className={inputClassName()} />
      </FormField>
      <FormField label="Телефон">
        <input value={form.phone || ""} onChange={(event) => updateField("phone", event.target.value)} className={inputClassName()} />
      </FormField>
      <FormField label="Күйі">
        <select value={form.status} onChange={(event) => updateField("status", event.target.value)} className={inputClassName()}>
          <option value="active">Белсенді</option>
          <option value="suspended">Бұғатталған</option>
          <option value="graduated">Бітірген</option>
        </select>
      </FormField>
      <div className="flex items-end justify-end gap-2 sm:col-span-2 mt-2">
        <Button variant="ghost" onClick={onCancel}>
          Бас тарту
        </Button>
        <Button type="submit" variant="accent">
          {isEditing ? "Сақтау" : "Студент қосу"}
        </Button>
      </div>
    </form>
  );
}
