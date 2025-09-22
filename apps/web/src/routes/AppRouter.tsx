import { Suspense, lazy } from "react";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useSessionStore } from "../store/session";
import AppLayout from "../layouts/AppLayout";
import { Spinner } from "../components/Spinner";

const LoginPage = lazy(() => import("../pages/LoginPage"));
const OverviewPage = lazy(() => import("../pages/dashboard/OverviewPage"));
const ExpensesPage = lazy(() => import("../pages/dashboard/ExpensesPage"));
const SettlePage = lazy(() => import("../pages/dashboard/SettlePage"));
const ReportsPage = lazy(() => import("../pages/dashboard/ReportsPage"));
const SettingsPage = lazy(() => import("../pages/dashboard/SettingsPage"));

function ProtectedRoutes() {
  const { token, isLoading } = useAuth();
  const memberships = useSessionStore((state) => state.user?.memberships ?? []);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (!memberships.length) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-slate-600">Noch keine Gruppe. Lade Freunde ein!</p>
      </div>
    );
  }

  return <Outlet />;
}

function DefaultGroupRedirect() {
  const memberships = useSessionStore((state) => state.user?.memberships ?? []);
  const target = memberships[0]?.groupId;
  return <Navigate to={target ? `/groups/${target}/overview` : "/login"} replace />;
}

export default function AppRouter() {
  return (
    <Suspense fallback={<Spinner fullScreen />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoutes />}>
          <Route index element={<DefaultGroupRedirect />} />
          <Route path="/groups/:groupId" element={<AppLayout />}>
            <Route path="overview" element={<OverviewPage />} />
            <Route path="expenses" element={<ExpensesPage />} />
            <Route path="settle" element={<SettlePage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
