import { Navigate, Route, Routes, useParams } from "react-router-dom";
import { AppLayout } from "./layouts/AppLayout";
import { RequesterLayout } from "./layouts/RequesterLayout";
import { ChangePasswordPage } from "./pages/ChangePasswordPage";
import { DashboardPage } from "./pages/DashboardPage";
import { CreateTenantPage } from "./pages/CreateTenantPage";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { SuperAdminDashboard } from "./pages/SuperAdminDashboard";
import { SuperLoginPage } from "./pages/SuperLoginPage";
import { SuperSubscriptionsPage } from "./pages/SuperSubscriptionsPage";
import { SubscriptionBlockedPage } from "./pages/SubscriptionBlockedPage";
import { RequesterCreateTicketPage } from "./pages/RequesterCreateTicketPage";
import { RequesterAccountPage } from "./pages/RequesterAccountPage";
import { RequesterDashboardPage } from "./pages/RequesterDashboardPage";
import { RequesterLoginPage } from "./pages/RequesterLoginPage";
import { RequesterRegisterPage } from "./pages/RequesterRegisterPage";
import { RequestersPage } from "./pages/RequestersPage";
import { RequesterTicketDetailPage } from "./pages/RequesterTicketDetailPage";
import { RequesterTicketsPage } from "./pages/RequesterTicketsPage";
import { TenantDetailPage } from "./pages/TenantDetailPage";
import { TenantListPage } from "./pages/TenantListPage";
import { TicketDetailPage } from "./pages/TicketDetailPage";
import { TicketsPage } from "./pages/TicketsPage";
import { UsersPage } from "./pages/UsersPage";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { RequesterProtectedRoute } from "./routes/RequesterProtectedRoute";
import { KnowledgePage } from "./pages/KnowledgePage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />

      {/* Staff Login */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/admin/login" element={<LoginPage />} />

      {/* Super Admin Login */}
      <Route path="/super/login" element={<SuperLoginPage />} />

      {/* Requester Login */}
      <Route path="/requester/login" element={<RequesterLoginPage />} />
      <Route path="/requester/register" element={<RequesterRegisterPage />} />
      <Route
        path="/student/login"
        element={<Navigate to="/requester/login" replace />}
      />
      <Route
        path="/student/register"
        element={<Navigate to="/requester/register" replace />}
      />
      <Route
        path="/subscription-blocked"
        element={<SubscriptionBlockedPage />}
      />

      <Route
        path="/change-password"
        element={
          <ProtectedRoute>
            <ChangePasswordPage />
          </ProtectedRoute>
        }
      />

      {/* Requester Portal */}
      <Route
        element={
          <RequesterProtectedRoute>
            <RequesterLayout />
          </RequesterProtectedRoute>
        }
      >
        <Route
          path="/requester/dashboard"
          element={<RequesterDashboardPage />}
        />
        <Route path="/requester/tickets" element={<RequesterTicketsPage />} />
        <Route
          path="/requester/tickets/new"
          element={<RequesterCreateTicketPage />}
        />
        <Route
          path="/requester/tickets/:id"
          element={<RequesterTicketDetailPage />}
        />
        <Route path="/requester/account" element={<RequesterAccountPage />} />
      </Route>
      <Route
        path="/student/dashboard"
        element={<Navigate to="/requester/dashboard" replace />}
      />
      <Route
        path="/student/tickets"
        element={<Navigate to="/requester/tickets" replace />}
      />
      <Route
        path="/student/tickets/new"
        element={<Navigate to="/requester/tickets/new" replace />}
      />
      <Route
        path="/student/tickets/:id"
        element={<LegacyRequesterTicketRedirect />}
      />

      {/* Admin / Agent Portal */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/tickets" element={<TicketsPage />} />
        <Route path="/tickets/:id" element={<TicketDetailPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/requesters" element={<RequestersPage />} />
        <Route
          path="/students"
          element={<Navigate to="/requesters" replace />}
        />
        <Route path="/knowledge" element={<KnowledgePage />} />
        <Route path="/super/dashboard" element={<SuperAdminDashboard />} />
        <Route path="/super/tenants" element={<TenantListPage />} />
        <Route path="/super/tenants/new" element={<CreateTenantPage />} />
        <Route path="/super/tenants/:id" element={<TenantDetailPage />} />
        <Route
          path="/super/subscriptions"
          element={<SuperSubscriptionsPage />}
        />
      </Route>
    </Routes>
  );
}

export default App;

function LegacyRequesterTicketRedirect() {
  const { id } = useParams();

  return <Navigate to={`/requester/tickets/${id ?? ""}`} replace />;
}
