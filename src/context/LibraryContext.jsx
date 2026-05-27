import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthContext.jsx";
import { useToast } from "./ToastContext.jsx";
import { libraryService } from "../services/libraryService.js";

const LibraryContext = createContext(null);

export function LibraryProvider({ children }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [books, setBooks] = useState([]);
  const [students, setStudents] = useState([]);
  const [issues, setIssues] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [booksResult, studentsResult, categoriesResult, issuesResult, logsResult, dashboardResult] = await Promise.all([
        libraryService.getBooks(),
        libraryService.getStudents(),
        libraryService.getCategories(),
        libraryService.getIssues(),
        libraryService.getActivityLogs(),
        libraryService.getDashboard(),
      ]);

      setBooks(booksResult.data);
      setStudents(studentsResult.data);
      setCategories(categoriesResult);
      setIssues(issuesResult);
      setActivityLogs(logsResult);
      setDashboard(dashboardResult);
    } catch (error) {
      showToast({ type: "error", title: "Data loading failed", description: error.message });
    } finally {
      setLoading(false);
    }
  }, [showToast, user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({
      books,
      students,
      issues,
      categories,
      activityLogs,
      dashboard,
      loading,
      usingSupabase: libraryService.usingSupabase,
      refresh,

      async searchBooks(params) {
        return libraryService.getBooks(params);
      },

      async createBook(payload) {
        try {
          const created = await libraryService.createBook(payload, user?.id);
          showToast({ title: "Book added", description: `${created.title} is now in the catalog.` });
          await refresh();
          return created;
        } catch (error) {
          showToast({ type: "error", title: "Failed to add book", description: error.message || "An unexpected error occurred." });
          throw error;
        }
      },

      async updateBook(id, payload) {
        try {
          const updated = await libraryService.updateBook(id, payload, user?.id);
          showToast({ title: "Book updated", description: `${updated.title} has been saved.` });
          await refresh();
          return updated;
        } catch (error) {
          showToast({ type: "error", title: "Failed to update book", description: error.message || "An unexpected error occurred." });
          throw error;
        }
      },

      async deleteBook(id) {
        try {
          await libraryService.deleteBook(id, user?.id);
          showToast({ title: "Book deleted", description: "The catalog has been updated." });
          await refresh();
        } catch (error) {
          showToast({ type: "error", title: "Failed to delete book", description: error.message || "An unexpected error occurred." });
          throw error;
        }
      },

      async createStudent(payload) {
        try {
          const created = await libraryService.createStudent(payload, user?.id);
          showToast({ title: "Student added", description: `${created.full_name} is now registered.` });
          await refresh();
          return created;
        } catch (error) {
          showToast({ type: "error", title: "Failed to register student", description: error.message || "An unexpected error occurred." });
          throw error;
        }
      },

      async updateStudent(id, payload) {
        try {
          const updated = await libraryService.updateStudent(id, payload, user?.id);
          showToast({ title: "Student updated", description: `${updated.full_name} has been saved.` });
          await refresh();
          return updated;
        } catch (error) {
          showToast({ type: "error", title: "Failed to update student", description: error.message || "An unexpected error occurred." });
          throw error;
        }
      },

      async deleteStudent(id) {
        try {
          await libraryService.deleteStudent(id, user?.id);
          showToast({ title: "Student deleted", description: "The student registry has been updated." });
          await refresh();
        } catch (error) {
          showToast({ type: "error", title: "Failed to delete student", description: error.message || "An unexpected error occurred." });
          throw error;
        }
      },

      async issueBook(payload) {
        try {
          const issue = await libraryService.issueBook(payload, user?.id);
          showToast({ title: "Book issued", description: "Circulation record created successfully." });
          await refresh();
          return issue;
        } catch (error) {
          showToast({ type: "error", title: "Failed to issue book", description: error.message || "An unexpected error occurred." });
          throw error;
        }
      },

      async returnBook(payload) {
        try {
          const issue = await libraryService.returnBook(payload, user?.id);
          showToast({ title: "Book returned", description: "Inventory availability has been updated." });
          await refresh();
          return issue;
        } catch (error) {
          showToast({ type: "error", title: "Failed to return book", description: error.message || "An unexpected error occurred." });
          throw error;
        }
      },

      async resetDemoData() {
        try {
          libraryService.resetDemoData();
          await refresh();
          showToast({ title: "Demo data restored", description: "The workspace is back to its curated sample state." });
        } catch (error) {
          showToast({ type: "error", title: "Failed to restore demo data", description: error.message || "An unexpected error occurred." });
        }
      },
    }),
    [activityLogs, books, categories, dashboard, issues, loading, refresh, showToast, students, user?.id],
  );

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
}

export function useLibrary() {
  const context = useContext(LibraryContext);
  if (!context) throw new Error("useLibrary must be used within LibraryProvider");
  return context;
}

