import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./layouts/AppLayout";
import { DashboardPage } from "./pages/DashboardPage";
import { LoginPage } from "./pages/LoginPage";
import { TicketsPage } from "./pages/TicketsPage";
import { UsersPage } from "./pages/UsersPage";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { TicketDetailPage } from "./pages/TicketDetailPage";
import { StudentLoginPage } from "./pages/StudentLoginPage";
import { StudentRegisterPage } from "./pages/StudentRegisterPage";
import { StudentLayout } from "./layouts/StudentLayout";
import { StudentDashboardPage } from "./pages/StudentDashboardPage";
import { StudentProtectedRoute } from "./routes/StudentProtectedRoute";
import { StudentCreateTicketPage } from "./pages/StudentCreateTicketPage";
import { StudentTicketsPage } from "./pages/StudentTicketsPage";
import { StudentTicketDetailPage } from "./pages/StudentTicketDetailPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      {/* Admin / Agent */}
      <Route path="/login" element={<LoginPage />} />

      <Route path="/student/login" element={<StudentLoginPage />} />
      <Route path="/student/register" element={<StudentRegisterPage />} />
      <Route
        element={
          <StudentProtectedRoute>
            <StudentLayout />
          </StudentProtectedRoute>
        }
      >
        <Route path="/student/dashboard" element={<StudentDashboardPage />} />
        <Route
          path="/student/tickets/new"
          element={<StudentCreateTicketPage />}
        />
        <Route path="/student/tickets" element={<StudentTicketsPage />} />
        <Route
          path="/student/tickets/:id"
          element={<StudentTicketDetailPage />}
        />
      </Route>

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
      </Route>
    </Routes>
  );
}

export default App;
