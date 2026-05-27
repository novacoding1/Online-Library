export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export function formatDate(date, options = {}) {
  if (!date) return "—";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    ...options,
  }).format(new Date(date));
}

export function formatDateTime(date) {
  if (!date) return "—";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function formatNumber(value) {
  return new Intl.NumberFormat("en").format(value || 0);
}

export function formatCurrency(value) {
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency: "USD",
  }).format(value || 0);
}

export function daysBetween(start, end = new Date()) {
  if (!start) return 0;
  const startDate = new Date(start);
  const endDate = new Date(end);
  return Math.max(0, Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)));
}

export function getInitials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function createBarcode(prefix = "LIB") {
  const random = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `${prefix}-${Date.now().toString().slice(-6)}-${random}`;
}

export function toTitleCase(value = "") {
  return value
    .replace(/[-_]/g, " ")
    .replace(/\w\S*/g, (text) => text.charAt(0).toUpperCase() + text.slice(1).toLowerCase());
}

