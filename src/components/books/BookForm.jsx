import { ImagePlus, Loader2, RefreshCw } from "lucide-react";
import { useMemo, useState } from "react";
import { libraryService } from "../../services/libraryService.js";
import { createBarcode } from "../../utils/formatters.js";
import { Button } from "../ui/Button.jsx";
import { FormField, inputClassName } from "../ui/FormField.jsx";

const emptyBook = {
  title: "",
  author: "",
  description: "",
  category_id: "",
  category: "Computer Science",
  barcode: "",
  qr_code: "",
  image: "",
  quantity: 1,
  available_quantity: 1,
  status: "available",
};

export function BookForm({ categories, initialBook, onSubmit, onCancel }) {
  const [form, setForm] = useState(() => ({ ...emptyBook, ...initialBook }));
  const [uploading, setUploading] = useState(false);
  const isEditing = Boolean(initialBook?.id);

  const selectedCategory = useMemo(
    () => categories.find((category) => category.id === form.category_id || category.name === form.category),
    [categories, form.category, form.category_id],
  );

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function generateCode() {
    const barcode = createBarcode();
    setForm((current) => ({ ...current, barcode, qr_code: barcode }));
  }

  async function handleFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await libraryService.uploadBookCover(file);
      updateField("image", url);
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const category = selectedCategory || categories.find((item) => item.name === form.category);
    const quantity = Number(form.quantity || 1);
    const availableQuantity = Math.min(quantity, Number(form.available_quantity ?? quantity));
    const generatedCode = form.barcode || createBarcode();
    await onSubmit({
      ...form,
      category_id: category?.id || null,
      category: category?.name || form.category,
      barcode: generatedCode,
      qr_code: form.qr_code || generatedCode,
      quantity,
      available_quantity: availableQuantity,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-[180px,1fr]">
        <div className="space-y-3">
          <div className="aspect-[3/4] overflow-hidden rounded-lg border border-slate-200 bg-slate-100 dark:border-white/10 dark:bg-white/5">
            {form.image ? (
              <img src={form.image} alt={form.title || "Кітап мұқабасы"} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-2 text-slate-400">
                <ImagePlus className="h-8 w-8" />
                <span className="text-xs font-bold">Мұқаба</span>
              </div>
            )}
          </div>
          <label className="flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white text-sm font-bold text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/8 dark:text-slate-200 dark:hover:bg-white/12">
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
            Жүктеу
            <input type="file" accept="image/*" className="sr-only" onChange={handleFile} />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Атауы">
            <input required value={form.title} onChange={(event) => updateField("title", event.target.value)} className={inputClassName()} />
          </FormField>
          <FormField label="Авторы">
            <input required value={form.author} onChange={(event) => updateField("author", event.target.value)} className={inputClassName()} />
          </FormField>
          <FormField label="Санаты">
            <select
              value={form.category_id || selectedCategory?.id || ""}
              onChange={(event) => {
                const category = categories.find((item) => item.id === event.target.value);
                setForm((current) => ({ ...current, category_id: category?.id || "", category: category?.name || "" }));
              }}
              className={inputClassName()}
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Күйі (Статусы)">
            <select value={form.status} onChange={(event) => updateField("status", event.target.value)} className={inputClassName()}>
              <option value="available">Қолжетімді</option>
              <option value="issued">Берілген</option>
              <option value="maintenance">Реттеуде</option>
              <option value="lost">Жоғалған</option>
            </select>
          </FormField>
          <FormField label="Штрих-код">
            <div className="flex gap-2">
              <input value={form.barcode} onChange={(event) => updateField("barcode", event.target.value)} className={inputClassName()} />
              <Button variant="ghost" size="icon" onClick={generateCode} aria-label="Штрих-код жасау">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </FormField>
          <FormField label="QR-код">
            <input value={form.qr_code} onChange={(event) => updateField("qr_code", event.target.value)} className={inputClassName()} />
          </FormField>
          <FormField label="Саны">
            <input min="0" type="number" value={form.quantity} onChange={(event) => updateField("quantity", event.target.value)} className={inputClassName()} />
          </FormField>
          <FormField label="Қолжетімді саны">
            <input
              min="0"
              type="number"
              value={form.available_quantity}
              onChange={(event) => updateField("available_quantity", event.target.value)}
              className={inputClassName()}
            />
          </FormField>
          <FormField label="Сипаттамасы" className="sm:col-span-2">
            <textarea
              rows={4}
              value={form.description}
              onChange={(event) => updateField("description", event.target.value)}
              className={`${inputClassName()} h-auto resize-none py-3`}
            />
          </FormField>
        </div>
      </div>

      <div className="flex flex-wrap justify-end gap-2">
        <Button variant="ghost" onClick={onCancel}>
          Бас тарту
        </Button>
        <Button type="submit" variant="accent">
          {isEditing ? "Өзгерістерді сақтау" : "Кітап қосу"}
        </Button>
      </div>
    </form>
  );
}
