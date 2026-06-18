import { Route, Routes } from "react-router-dom";
import { AppLayout } from "./layouts/AppLayout";
import { StudentLayout } from "./layouts/StudentLayout";
import { ChangePasswordPage } from "./pages/ChangePasswordPage";
import { DashboardPage } from "./pages/DashboardPage";
import { CreateTenantPage } from "./pages/CreateTenantPage";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { SuperAdminDashboard } from "./pages/SuperAdminDashboard";
import { SuperLoginPage } from "./pages/SuperLoginPage";
import { SuperSubscriptionsPage } from "./pages/SuperSubscriptionsPage";
import { StudentCreateTicketPage } from "./pages/StudentCreateTicketPage";
import { StudentDashboardPage } from "./pages/StudentDashboardPage";
import { StudentLoginPage } from "./pages/StudentLoginPage";
import { StudentsPage } from "./pages/StudentsPage";
import { StudentTicketDetailPage } from "./pages/StudentTicketDetailPage";
import { StudentTicketsPage } from "./pages/StudentTicketsPage";
import { TenantDetailPage } from "./pages/TenantDetailPage";
import { TenantListPage } from "./pages/TenantListPage";
import { TicketDetailPage } from "./pages/TicketDetailPage";
import { TicketsPage } from "./pages/TicketsPage";
import { UsersPage } from "./pages/UsersPage";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { StudentProtectedRoute } from "./routes/StudentProtectedRoute";
import { KnowledgePage } from "./pages/KnowledgePage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />

      {/* Staff Login */}
      <Route path="/admin/login" element={<LoginPage />} />

      {/* Super Admin Login */}
      <Route path="/super/login" element={<SuperLoginPage />} />

      {/* Requester Login */}
      <Route path="/student/login" element={<StudentLoginPage />} />

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
          <StudentProtectedRoute>
            <StudentLayout />
          </StudentProtectedRoute>
        }
      >
        <Route path="/student/dashboard" element={<StudentDashboardPage />} />
        <Route path="/student/tickets" element={<StudentTicketsPage />} />
        <Route
          path="/student/tickets/new"
          element={<StudentCreateTicketPage />}
        />
        <Route
          path="/student/tickets/:id"
          element={<StudentTicketDetailPage />}
        />
      </Route>

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
        <Route path="/students" element={<StudentsPage />} />
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
