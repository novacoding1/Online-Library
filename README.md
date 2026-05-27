# University Library Management System

Modern React + Supabase web system for a university library: catalog, students, QR/barcode scanner, issuing, returns, history, analytics, roles, dark mode, exports, and admin panel.

## Stack

- React + Vite
- TailwindCSS
- Framer Motion
- React Router
- Lucide React Icons
- Supabase Auth + PostgreSQL
- html5-qrcode
- Recharts
- jsPDF + XLSX exports

## Run Locally

```bash
npm install
npm run dev
```

Open `http://127.0.0.1:5173`.

Without Supabase environment variables the app runs in demo mode with localStorage data.

Demo accounts:

- `admin@aurelia.edu` / `admin123`
- `librarian@aurelia.edu` / `library123`
- `student@aurelia.edu` / `student123`

## Supabase Setup

1. Create a Supabase project.
2. Open SQL Editor and run [`supabase/schema.sql`](./supabase/schema.sql).
3. Create a public storage bucket named `book-covers` if cover upload should be stored in Supabase.
4. Copy `.env.example` to `.env`.
5. Fill:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-public-anon-key
```

6. Restart the dev server.

## Features

- Auth: login, registration, logout, protected routes, roles: `admin`, `librarian`, `student`
- Dashboard: statistics cards, animated counters, charts, recent issues, activity feed
- Book management: CRUD, cover upload, categories, search, filters, sorting, pagination, QR generation
- QR/barcode: camera scanner with `html5-qrcode`, manual barcode fallback, scanned book lookup
- Circulation: issue and return workflows, status updates, due dates, fines, history
- Student management: CRUD, faculty, group, email, phone, status, search
- History: audit trail, holding period, fines, PDF export
- Admin panel: role management, users, logs, statistics
- Global search: books, authors, barcode, students, issue records
- UI: responsive layout, dark/light mode, glass panels, modals, toast notifications, skeletons

## Project Structure

```text
src/
  components/
    auth/
    books/
    scanner/
    students/
    ui/
  context/
  data/
  hooks/
  layouts/
  lib/
  pages/
  services/
  styles/
  utils/
supabase/
  schema.sql
```

## Production Build

```bash
npm run build
```

The static build is generated in `dist/`.

