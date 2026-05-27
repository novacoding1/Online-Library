-- University Library Management System
-- Supabase PostgreSQL schema with roles, RLS policies, relationships, and RPC helpers.

create extension if not exists "pgcrypto";

do $$
begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type public.user_role as enum ('admin', 'librarian', 'student');
  end if;

  if not exists (select 1 from pg_type where typname = 'book_status') then
    create type public.book_status as enum ('available', 'issued', 'maintenance', 'lost');
  end if;

  if not exists (select 1 from pg_type where typname = 'issue_status') then
    create type public.issue_status as enum ('issued', 'returned', 'overdue');
  end if;
end $$;

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default 'Library User',
  email text not null unique,
  role public.user_role not null default 'student',
  avatar_url text,
  phone text,
  department text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  color text not null default '#0891b2',
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.books (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  author text not null,
  description text,
  category_id uuid references public.categories(id) on delete set null,
  category text,
  barcode text not null unique,
  qr_code text not null unique,
  image text,
  quantity integer not null default 1 check (quantity >= 0),
  available_quantity integer not null default 1 check (available_quantity >= 0),
  status public.book_status not null default 'available',
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint available_not_over_quantity check (available_quantity <= quantity)
);

create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  full_name text not null,
  student_id text not null unique,
  faculty text not null,
  study_group text not null,
  email text not null unique,
  phone text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.issues (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references public.books(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  issued_by uuid references public.users(id) on delete set null,
  returned_by uuid references public.users(id) on delete set null,
  issue_date timestamptz not null default now(),
  due_date date not null default (now() + interval '14 days')::date,
  return_date timestamptz,
  status public.issue_status not null default 'issued',
  fine_amount numeric(10, 2) not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  message text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists books_title_idx on public.books using gin (to_tsvector('english', title || ' ' || author || ' ' || coalesce(barcode, '') || ' ' || coalesce(category, '')));
create index if not exists books_barcode_idx on public.books (barcode);
create index if not exists books_status_idx on public.books (status);
create index if not exists students_search_idx on public.students using gin (to_tsvector('english', full_name || ' ' || student_id || ' ' || email || ' ' || faculty || ' ' || study_group));
create index if not exists issues_status_idx on public.issues (status);
create index if not exists issues_book_student_idx on public.issues (book_id, student_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists users_set_updated_at on public.users;
create trigger users_set_updated_at
before update on public.users
for each row execute function public.set_updated_at();

drop trigger if exists books_set_updated_at on public.books;
create trigger books_set_updated_at
before update on public.books
for each row execute function public.set_updated_at();

drop trigger if exists students_set_updated_at on public.students;
create trigger students_set_updated_at
before update on public.students
for each row execute function public.set_updated_at();

drop trigger if exists issues_set_updated_at on public.issues;
create trigger issues_set_updated_at
before update on public.issues
for each row execute function public.set_updated_at();

create or replace function public.current_user_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.users where id = auth.uid();
$$;

create or replace function public.is_library_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_user_role() in ('admin', 'librarian'), false);
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1), 'Library User'),
    new.email,
    coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'student')
  )
  on conflict (id) do update
  set email = excluded.email,
      full_name = excluded.full_name,
      updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.log_activity(
  p_action text,
  p_entity_type text,
  p_entity_id uuid,
  p_message text,
  p_metadata jsonb default '{}'::jsonb
)
returns public.activity_logs
language plpgsql
security definer
set search_path = public
as $$
declare
  created_log public.activity_logs;
begin
  insert into public.activity_logs (actor_id, action, entity_type, entity_id, message, metadata)
  values (auth.uid(), p_action, p_entity_type, p_entity_id, p_message, p_metadata)
  returning * into created_log;

  return created_log;
end;
$$;

create or replace function public.issue_book(
  p_book_id uuid,
  p_student_id uuid,
  p_due_date date default (now() + interval '14 days')::date,
  p_notes text default null
)
returns public.issues
language plpgsql
security definer
set search_path = public
as $$
declare
  selected_book public.books;
  created_issue public.issues;
begin
  if not public.is_library_staff() then
    raise exception 'Only admin or librarian can issue books';
  end if;

  select * into selected_book
  from public.books
  where id = p_book_id
  for update;

  if selected_book.id is null then
    raise exception 'Book not found';
  end if;

  if selected_book.available_quantity <= 0 or selected_book.status in ('issued', 'lost', 'maintenance') then
    raise exception 'Book is not available for issue';
  end if;

  update public.books
  set available_quantity = available_quantity - 1,
      status = case when available_quantity - 1 <= 0 then 'issued'::public.book_status else 'available'::public.book_status end
  where id = p_book_id;

  insert into public.issues (book_id, student_id, issued_by, due_date, notes, status)
  values (p_book_id, p_student_id, auth.uid(), p_due_date, p_notes, 'issued')
  returning * into created_issue;

  perform public.log_activity(
    'issue',
    'book',
    p_book_id,
    'Book issued to student',
    jsonb_build_object('student_id', p_student_id, 'issue_id', created_issue.id)
  );

  return created_issue;
end;
$$;

create or replace function public.return_book(
  p_issue_id uuid,
  p_notes text default null
)
returns public.issues
language plpgsql
security definer
set search_path = public
as $$
declare
  selected_issue public.issues;
  selected_book public.books;
  updated_issue public.issues;
  days_late integer;
begin
  if not public.is_library_staff() then
    raise exception 'Only admin or librarian can return books';
  end if;

  select * into selected_issue
  from public.issues
  where id = p_issue_id
  for update;

  if selected_issue.id is null then
    raise exception 'Issue record not found';
  end if;

  if selected_issue.status = 'returned' then
    raise exception 'Book was already returned';
  end if;

  select * into selected_book
  from public.books
  where id = selected_issue.book_id
  for update;

  days_late := greatest((current_date - selected_issue.due_date), 0);

  update public.issues
  set status = 'returned',
      return_date = now(),
      returned_by = auth.uid(),
      fine_amount = days_late * 0.50,
      notes = coalesce(p_notes, notes)
  where id = p_issue_id
  returning * into updated_issue;

  update public.books
  set available_quantity = least(quantity, available_quantity + 1),
      status = case when available_quantity + 1 > 0 then 'available'::public.book_status else status end
  where id = selected_issue.book_id;

  perform public.log_activity(
    'return',
    'book',
    selected_issue.book_id,
    'Book returned',
    jsonb_build_object('student_id', selected_issue.student_id, 'issue_id', selected_issue.id, 'fine_amount', updated_issue.fine_amount)
  );

  return updated_issue;
end;
$$;

alter table public.users enable row level security;
alter table public.categories enable row level security;
alter table public.books enable row level security;
alter table public.students enable row level security;
alter table public.issues enable row level security;
alter table public.activity_logs enable row level security;

drop policy if exists "users can read own profile and staff can read users" on public.users;
create policy "users can read own profile and staff can read users"
on public.users for select
to authenticated
using (id = auth.uid() or public.is_library_staff());

drop policy if exists "users can update own profile and admins can update users" on public.users;
create policy "users can update own profile and admins can update users"
on public.users for update
to authenticated
using (id = auth.uid() or public.current_user_role() = 'admin')
with check (id = auth.uid() or public.current_user_role() = 'admin');

drop policy if exists "users can insert their profile" on public.users;
create policy "users can insert their profile"
on public.users for insert
to authenticated
with check (id = auth.uid());

drop policy if exists "authenticated users can read categories" on public.categories;
create policy "authenticated users can read categories"
on public.categories for select
to authenticated
using (true);

drop policy if exists "staff can manage categories" on public.categories;
create policy "staff can manage categories"
on public.categories for all
to authenticated
using (public.is_library_staff())
with check (public.is_library_staff());

drop policy if exists "authenticated users can read books" on public.books;
create policy "authenticated users can read books"
on public.books for select
to authenticated
using (true);

drop policy if exists "staff can manage books" on public.books;
create policy "staff can manage books"
on public.books for all
to authenticated
using (public.is_library_staff())
with check (public.is_library_staff());

drop policy if exists "authenticated users can read students" on public.students;
create policy "authenticated users can read students"
on public.students for select
to authenticated
using (true);

drop policy if exists "staff can manage students" on public.students;
create policy "staff can manage students"
on public.students for all
to authenticated
using (public.is_library_staff())
with check (public.is_library_staff());

drop policy if exists "authenticated users can read issue history" on public.issues;
create policy "authenticated users can read issue history"
on public.issues for select
to authenticated
using (true);

drop policy if exists "staff can manage issues" on public.issues;
create policy "staff can manage issues"
on public.issues for all
to authenticated
using (public.is_library_staff())
with check (public.is_library_staff());

drop policy if exists "staff can read activity logs" on public.activity_logs;
create policy "staff can read activity logs"
on public.activity_logs for select
to authenticated
using (public.is_library_staff());

drop policy if exists "authenticated users can create logs" on public.activity_logs;
create policy "authenticated users can create logs"
on public.activity_logs for insert
to authenticated
with check (actor_id = auth.uid() or actor_id is null);

insert into public.categories (name, color, description)
values
  ('Computer Science', '#0891b2', 'Programming, AI, data systems, architecture'),
  ('Business', '#16a34a', 'Management, economics, finance, entrepreneurship'),
  ('Design', '#f97316', 'UX, product design, visual culture'),
  ('Engineering', '#7c3aed', 'Civil, mechanical, electrical engineering'),
  ('Humanities', '#e11d48', 'History, languages, philosophy, social sciences')
on conflict (name) do nothing;

-- Optional storage bucket for book covers:
-- insert into storage.buckets (id, name, public)
-- values ('book-covers', 'book-covers', true)
-- on conflict (id) do nothing;
