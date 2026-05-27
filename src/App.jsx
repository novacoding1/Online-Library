import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { AppLayout } from "./layouts/AppLayout.jsx";
import { ProtectedRoute } from "./components/auth/ProtectedRoute.jsx";

const AdminPage = lazy(() => import("./pages/AdminPage.jsx").then((module) => ({ default: module.AdminPage })));
const AnalyticsPage = lazy(() => import("./pages/AnalyticsPage.jsx").then((module) => ({ default: module.AnalyticsPage })));
const BooksPage = lazy(() => import("./pages/BooksPage.jsx").then((module) => ({ default: module.BooksPage })));
const DashboardPage = lazy(() => import("./pages/DashboardPage.jsx").then((module) => ({ default: module.DashboardPage })));
const HistoryPage = lazy(() => import("./pages/HistoryPage.jsx").then((module) => ({ default: module.HistoryPage })));
const IssueReturnPage = lazy(() => import("./pages/IssueReturnPage.jsx").then((module) => ({ default: module.IssueReturnPage })));
const LoginPage = lazy(() => import("./pages/LoginPage.jsx").then((module) => ({ default: module.LoginPage })));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage.jsx").then((module) => ({ default: module.NotFoundPage })));
const ProfilePage = lazy(() => import("./pages/ProfilePage.jsx").then((module) => ({ default: module.ProfilePage })));

const ScannerPage = lazy(() => import("./pages/ScannerPage.jsx").then((module) => ({ default: module.ScannerPage })));
const SettingsPage = lazy(() => import("./pages/SettingsPage.jsx").then((module) => ({ default: module.SettingsPage })));
const StudentsPage = lazy(() => import("./pages/StudentsPage.jsx").then((module) => ({ default: module.StudentsPage })));

function RouteLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-mist text-ink dark:bg-slate-950 dark:text-white">
      <Loader2 className="h-8 w-8 animate-spin text-library-cyan" />
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<RouteLoader />}>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<Navigate to="/login" replace />} />

        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/books" element={<BooksPage />} />
          <Route path="/scanner" element={<ScannerPage />} />
          <Route path="/circulation" element={<IssueReturnPage />} />
          <Route path="/students" element={<StudentsPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={["admin"]}>
                <AdminPage />
              </ProtectedRoute>
            }
          />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
