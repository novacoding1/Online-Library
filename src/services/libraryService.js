import {
  demoActivityLogs,
  demoBooks,
  demoCategories,
  demoIssues,
  demoStudents,
  demoUsers,
} from "../data/demoData.js";
import { hasSupabaseConfig, supabase } from "../lib/supabase.js";
import { createBarcode } from "../utils/formatters.js";

const STORAGE_KEY = "aurelia-library-demo-db";

function canUseStorage() {
  return typeof window !== "undefined" && window.localStorage;
}

function seedDatabase() {
  return {
    users: demoUsers,
    categories: demoCategories,
    books: demoBooks,
    students: demoStudents,
    issues: demoIssues,
    activity_logs: demoActivityLogs,
  };
}

function readLocalDb() {
  if (!canUseStorage()) return seedDatabase();

  const cached = window.localStorage.getItem(STORAGE_KEY);
  if (cached) return JSON.parse(cached);

  const seeded = seedDatabase();
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
  return seeded;
}

function writeLocalDb(db) {
  if (canUseStorage()) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  }
  return db;
}

function addLocalLog(db, action, entityType, entityId, message, actorId = "user-librarian") {
  db.activity_logs.unshift({
    id: crypto.randomUUID(),
    actor_id: actorId,
    action,
    entity_type: entityType,
    entity_id: entityId,
    message,
    created_at: new Date().toISOString(),
  });
}

function attachIssueRelations(issue, db) {
  return {
    ...issue,
    book: db.books.find((book) => book.id === issue.book_id) || null,
    student: db.students.find((student) => student.id === issue.student_id) || null,
  };
}

function normalizeBook(row) {
  return {
    ...row,
    category: row.category || row.categories?.name || "Uncategorized",
  };
}

function normalizeIssue(row) {
  return {
    ...row,
    book: row.book || row.books || null,
    student: row.student || row.students || null,
  };
}

function paginate(items, page = 1, pageSize = 100) {
  const from = (page - 1) * pageSize;
  return {
    data: items.slice(from, from + pageSize),
    count: items.length,
  };
}

function matchesSearch(value, query) {
  return String(value || "").toLowerCase().includes(query.toLowerCase());
}

function sortByField(items, field = "created_at", direction = "desc") {
  return [...items].sort((a, b) => {
    const left = a[field] ?? "";
    const right = b[field] ?? "";
    const result = String(left).localeCompare(String(right), undefined, { numeric: true });
    return direction === "asc" ? result : -result;
  });
}

function buildDashboard(books, students, issues, logs) {
  const issuedBooks = books.reduce((sum, book) => sum + Math.max(0, book.quantity - book.available_quantity), 0);
  const availableBooks = books.reduce((sum, book) => sum + Number(book.available_quantity || 0), 0);
  const totalBooks = books.reduce((sum, book) => sum + Number(book.quantity || 0), 0);
  const activeIssues = issues.filter((issue) => issue.status === "issued").length;
  const returnedIssues = issues.filter((issue) => issue.status === "returned").length;

  const categories = books.reduce((acc, book) => {
    acc[book.category] = (acc[book.category] || 0) + 1;
    return acc;
  }, {});

  const monthly = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"].map((month, index) => {
    const issued = Math.max(2, Math.round((index + 2) * 2.7 + (index % 2 ? 3 : 0)));
    const returned = Math.max(1, Math.round((index + 1) * 2.2));
    return { month, issued, returned };
  });

  return {
    totalBooks,
    issuedBooks,
    availableBooks,
    studentsCount: students.length,
    activeIssues,
    returnedIssues,
    recentIssues: issues
      .map((issue) => attachIssueRelations(issue, { books, students }))
      .sort((a, b) => new Date(b.issue_date) - new Date(a.issue_date))
      .slice(0, 5),
    activity: logs.slice(0, 6),
    categoryChart: Object.entries(categories).map(([name, value]) => ({ name, value })),
    monthly,
  };
}

export const libraryService = {
  usingSupabase: hasSupabaseConfig,

  resetDemoData() {
    const seeded = seedDatabase();
    writeLocalDb(seeded);
    return seeded;
  },

  async getUsers() {
    if (hasSupabaseConfig) {
      const { data, error } = await supabase.from("users").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    }

    return readLocalDb().users;
  },

  async updateUserRole(id, role, actorId) {
    if (hasSupabaseConfig) {
      const { data, error } = await supabase.from("users").update({ role }).eq("id", id).select("*").single();
      if (error) throw error;
      await supabase.rpc("log_activity", {
        p_action: "role_update",
        p_entity_type: "user",
        p_entity_id: id,
        p_message: `User role changed to ${role}`,
      });
      return data;
    }

    const db = readLocalDb();
    db.users = db.users.map((user) => (user.id === id ? { ...user, role } : user));
    addLocalLog(db, "role_update", "user", id, `User role changed to ${role}`, actorId);
    writeLocalDb(db);
    return db.users.find((user) => user.id === id);
  },

  async getCategories() {
    if (hasSupabaseConfig) {
      const { data, error } = await supabase.from("categories").select("*").order("name");
      if (error) throw error;
      return data;
    }

    return readLocalDb().categories;
  },

  async getBooks({ search = "", status = "all", category = "all", sortBy = "created_at", sortDir = "desc", page = 1, pageSize = 100 } = {}) {
    if (hasSupabaseConfig) {
      let query = supabase.from("books").select("*, categories(id, name, color)", { count: "exact" });

      if (search) {
        query = query.or(`title.ilike.%${search}%,author.ilike.%${search}%,barcode.ilike.%${search}%,category.ilike.%${search}%`);
      }
      if (status !== "all") query = query.eq("status", status);
      if (category !== "all") query = query.eq("category", category);

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      const { data, error, count } = await query.order(sortBy, { ascending: sortDir === "asc" }).range(from, to);
      if (error) throw error;
      return { data: data.map(normalizeBook), count };
    }

    const db = readLocalDb();
    let books = db.books;
    if (search) {
      books = books.filter(
        (book) =>
          matchesSearch(book.title, search) ||
          matchesSearch(book.author, search) ||
          matchesSearch(book.barcode, search) ||
          matchesSearch(book.category, search),
      );
    }
    if (status !== "all") books = books.filter((book) => book.status === status);
    if (category !== "all") books = books.filter((book) => book.category === category);
    return paginate(sortByField(books, sortBy, sortDir), page, pageSize);
  },

  async createBook(payload, actorId) {
    const barcode = payload.barcode || createBarcode();
    const book = {
      ...payload,
      barcode,
      qr_code: payload.qr_code || barcode,
      quantity: Number(payload.quantity || 1),
      available_quantity: Number(payload.available_quantity ?? payload.quantity ?? 1),
      status: payload.status || "available",
    };

    if (hasSupabaseConfig) {
      const { data, error } = await supabase.from("books").insert(book).select("*, categories(id, name, color)").single();
      if (error) throw error;
      await supabase.rpc("log_activity", {
        p_action: "create",
        p_entity_type: "book",
        p_entity_id: data.id,
        p_message: `Book created: ${data.title}`,
      });
      return normalizeBook(data);
    }

    const db = readLocalDb();
    const next = {
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      ...book,
    };
    db.books.unshift(next);
    addLocalLog(db, "create", "book", next.id, `Book created: ${next.title}`, actorId);
    writeLocalDb(db);
    return next;
  },

  async updateBook(id, payload, actorId) {
    if (hasSupabaseConfig) {
      const { data, error } = await supabase.from("books").update(payload).eq("id", id).select("*, categories(id, name, color)").single();
      if (error) throw error;
      await supabase.rpc("log_activity", {
        p_action: "update",
        p_entity_type: "book",
        p_entity_id: id,
        p_message: `Book updated: ${data.title}`,
      });
      return normalizeBook(data);
    }

    const db = readLocalDb();
    db.books = db.books.map((book) => (book.id === id ? { ...book, ...payload, updated_at: new Date().toISOString() } : book));
    const updated = db.books.find((book) => book.id === id);
    addLocalLog(db, "update", "book", id, `Book updated: ${updated?.title || "Untitled"}`, actorId);
    writeLocalDb(db);
    return updated;
  },

  async deleteBook(id, actorId) {
    if (hasSupabaseConfig) {
      const { error } = await supabase.from("books").delete().eq("id", id);
      if (error) throw error;
      await supabase.rpc("log_activity", {
        p_action: "delete",
        p_entity_type: "book",
        p_entity_id: id,
        p_message: "Book deleted",
      });
      return true;
    }

    const db = readLocalDb();
    const removed = db.books.find((book) => book.id === id);
    db.books = db.books.filter((book) => book.id !== id);
    addLocalLog(db, "delete", "book", id, `Book deleted: ${removed?.title || id}`, actorId);
    writeLocalDb(db);
    return true;
  },

  async getStudents({ search = "", page = 1, pageSize = 100 } = {}) {
    if (hasSupabaseConfig) {
      let query = supabase.from("students").select("*", { count: "exact" });
      if (search) {
        query = query.or(`full_name.ilike.%${search}%,student_id.ilike.%${search}%,email.ilike.%${search}%,faculty.ilike.%${search}%,study_group.ilike.%${search}%`);
      }
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      const { data, error, count } = await query.order("created_at", { ascending: false }).range(from, to);
      if (error) throw error;
      return { data, count };
    }

    const db = readLocalDb();
    const students = search
      ? db.students.filter(
          (student) =>
            matchesSearch(student.full_name, search) ||
            matchesSearch(student.student_id, search) ||
            matchesSearch(student.email, search) ||
            matchesSearch(student.faculty, search) ||
            matchesSearch(student.study_group, search),
        )
      : db.students;
    return paginate(sortByField(students, "created_at", "desc"), page, pageSize);
  },

  async createStudent(payload, actorId) {
    if (hasSupabaseConfig) {
      const { data, error } = await supabase.from("students").insert(payload).select("*").single();
      if (error) throw error;
      await supabase.rpc("log_activity", {
        p_action: "create",
        p_entity_type: "student",
        p_entity_id: data.id,
        p_message: `Student created: ${data.full_name}`,
      });
      return data;
    }

    const db = readLocalDb();
    const student = {
      id: crypto.randomUUID(),
      status: "active",
      created_at: new Date().toISOString(),
      ...payload,
    };
    db.students.unshift(student);
    addLocalLog(db, "create", "student", student.id, `Student created: ${student.full_name}`, actorId);
    writeLocalDb(db);
    return student;
  },

  async updateStudent(id, payload, actorId) {
    if (hasSupabaseConfig) {
      const { data, error } = await supabase.from("students").update(payload).eq("id", id).select("*").single();
      if (error) throw error;
      await supabase.rpc("log_activity", {
        p_action: "update",
        p_entity_type: "student",
        p_entity_id: id,
        p_message: `Student updated: ${data.full_name}`,
      });
      return data;
    }

    const db = readLocalDb();
    db.students = db.students.map((student) => (student.id === id ? { ...student, ...payload, updated_at: new Date().toISOString() } : student));
    const updated = db.students.find((student) => student.id === id);
    addLocalLog(db, "update", "student", id, `Student updated: ${updated?.full_name || "Student"}`, actorId);
    writeLocalDb(db);
    return updated;
  },

  async deleteStudent(id, actorId) {
    if (hasSupabaseConfig) {
      const { error } = await supabase.from("students").delete().eq("id", id);
      if (error) throw error;
      await supabase.rpc("log_activity", {
        p_action: "delete",
        p_entity_type: "student",
        p_entity_id: id,
        p_message: "Student deleted",
      });
      return true;
    }

    const db = readLocalDb();
    const removed = db.students.find((student) => student.id === id);
    db.students = db.students.filter((student) => student.id !== id);
    addLocalLog(db, "delete", "student", id, `Student deleted: ${removed?.full_name || id}`, actorId);
    writeLocalDb(db);
    return true;
  },

  async getIssues({ status = "all" } = {}) {
    if (hasSupabaseConfig) {
      let query = supabase.from("issues").select("*, book:books(*), student:students(*)");
      if (status !== "all") query = query.eq("status", status);
      const { data, error } = await query.order("created_at", { ascending: false });
      if (error) throw error;
      return data.map(normalizeIssue);
    }

    const db = readLocalDb();
    const issues = db.issues.map((issue) => attachIssueRelations(issue, db));
    return status === "all" ? issues : issues.filter((issue) => issue.status === status);
  },

  async issueBook({ bookId, studentId, dueDate, notes = "" }, actorId) {
    if (hasSupabaseConfig) {
      const { data, error } = await supabase.rpc("issue_book", {
        p_book_id: bookId,
        p_student_id: studentId,
        p_due_date: dueDate,
        p_notes: notes,
      });
      if (error) throw error;
      return data;
    }

    const db = readLocalDb();
    const book = db.books.find((item) => item.id === bookId);
    const student = db.students.find((item) => item.id === studentId);

    if (!book || !student) throw new Error("Book or student not found");
    if (book.available_quantity <= 0 || book.status !== "available") {
      throw new Error("Book is not available");
    }

    book.available_quantity -= 1;
    book.status = book.available_quantity <= 0 ? "issued" : "available";

    const issue = {
      id: crypto.randomUUID(),
      book_id: bookId,
      student_id: studentId,
      issued_by: actorId,
      returned_by: null,
      issue_date: new Date().toISOString(),
      due_date: dueDate,
      return_date: null,
      status: "issued",
      fine_amount: 0,
      notes,
      created_at: new Date().toISOString(),
    };

    db.issues.unshift(issue);
    addLocalLog(db, "issue", "book", bookId, `${book.title} issued to ${student.full_name}`, actorId);
    writeLocalDb(db);
    return attachIssueRelations(issue, db);
  },

  async returnBook({ issueId, notes = "" }, actorId) {
    if (hasSupabaseConfig) {
      const { data, error } = await supabase.rpc("return_book", {
        p_issue_id: issueId,
        p_notes: notes,
      });
      if (error) throw error;
      return data;
    }

    const db = readLocalDb();
    const issue = db.issues.find((item) => item.id === issueId);
    if (!issue) throw new Error("Issue record not found");
    if (issue.status === "returned") throw new Error("Book is already returned");

    const book = db.books.find((item) => item.id === issue.book_id);
    const dueDate = new Date(issue.due_date);
    const daysLate = Math.max(0, Math.ceil((new Date() - dueDate) / (1000 * 60 * 60 * 24)));

    issue.status = "returned";
    issue.return_date = new Date().toISOString();
    issue.returned_by = actorId;
    issue.notes = notes || issue.notes;
    issue.fine_amount = daysLate * 0.5;

    if (book) {
      book.available_quantity = Math.min(book.quantity, book.available_quantity + 1);
      book.status = book.available_quantity > 0 ? "available" : book.status;
    }

    addLocalLog(db, "return", "book", issue.book_id, `${book?.title || "Book"} returned`, actorId);
    writeLocalDb(db);
    return attachIssueRelations(issue, db);
  },

  async findBookByCode(code) {
    if (!code) return null;

    if (hasSupabaseConfig) {
      const { data, error } = await supabase
        .from("books")
        .select("*, categories(id, name, color)")
        .or(`barcode.eq.${code},qr_code.eq.${code}`)
        .maybeSingle();
      if (error) throw error;
      return data ? normalizeBook(data) : null;
    }

    const db = readLocalDb();
    return db.books.find((book) => book.barcode === code || book.qr_code === code) || null;
  },

  async findOpenIssueByBook(bookId) {
    if (hasSupabaseConfig) {
      const { data, error } = await supabase
        .from("issues")
        .select("*, book:books(*), student:students(*)")
        .eq("book_id", bookId)
        .eq("status", "issued")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data ? normalizeIssue(data) : null;
    }

    const db = readLocalDb();
    const issue = db.issues.find((item) => item.book_id === bookId && item.status === "issued");
    return issue ? attachIssueRelations(issue, db) : null;
  },

  async getActivityLogs() {
    if (hasSupabaseConfig) {
      const { data, error } = await supabase.from("activity_logs").select("*").order("created_at", { ascending: false }).limit(30);
      if (error) throw error;
      return data;
    }

    return readLocalDb().activity_logs;
  },

  async getDashboard() {
    if (hasSupabaseConfig) {
      const [{ data: books, error: booksError }, { data: students, error: studentsError }, { data: issues, error: issuesError }, logs] =
        await Promise.all([
          supabase.from("books").select("*"),
          supabase.from("students").select("*"),
          supabase.from("issues").select("*, book:books(*), student:students(*)").order("created_at", { ascending: false }),
          this.getActivityLogs(),
        ]);

      if (booksError) throw booksError;
      if (studentsError) throw studentsError;
      if (issuesError) throw issuesError;

      return buildDashboard(books.map(normalizeBook), students, issues.map(normalizeIssue), logs);
    }

    const db = readLocalDb();
    return buildDashboard(db.books, db.students, db.issues, db.activity_logs);
  },

  async globalSearch(query) {
    const term = query.trim();
    if (!term) return { books: [], students: [], issues: [] };

    const [books, students, issues] = await Promise.all([
      this.getBooks({ search: term, pageSize: 5 }),
      this.getStudents({ search: term, pageSize: 5 }),
      this.getIssues(),
    ]);

    return {
      books: books.data.slice(0, 5),
      students: students.data.slice(0, 5),
      issues: issues
        .filter(
          (issue) =>
            matchesSearch(issue.book?.title, term) ||
            matchesSearch(issue.student?.full_name, term) ||
            matchesSearch(issue.status, term),
        )
        .slice(0, 5),
    };
  },

  async uploadBookCover(file) {
    if (!file) return "";

    if (hasSupabaseConfig) {
      const filePath = `${crypto.randomUUID()}-${file.name}`;
      const { error } = await supabase.storage.from("book-covers").upload(filePath, file, { upsert: true });
      if (error) throw error;
      const { data } = supabase.storage.from("book-covers").getPublicUrl(filePath);
      return data.publicUrl;
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  },
};
