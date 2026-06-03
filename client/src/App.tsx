import { Route, Routes } from "react-router-dom";
import { AppLayout } from "./layouts/AppLayout";
import { StudentLayout } from "./layouts/StudentLayout";
import { DashboardPage } from "./pages/DashboardPage";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { StudentCreateTicketPage } from "./pages/StudentCreateTicketPage";
import { StudentDashboardPage } from "./pages/StudentDashboardPage";
import { StudentLoginPage } from "./pages/StudentLoginPage";
import { StudentsPage } from "./pages/StudentsPage";
import { StudentTicketDetailPage } from "./pages/StudentTicketDetailPage";
import { StudentTicketsPage } from "./pages/StudentTicketsPage";
import { TicketDetailPage } from "./pages/TicketDetailPage";
import { TicketsPage } from "./pages/TicketsPage";
import { UsersPage } from "./pages/UsersPage";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { StudentProtectedRoute } from "./routes/StudentProtectedRoute";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />

      {/* Staff Login */}
      <Route path="/admin/login" element={<LoginPage />} />

      {/* Student Login */}
      <Route path="/student/login" element={<StudentLoginPage />} />

      {/* Student Portal */}
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
      </Route>
    </Routes>
  );
}

export default App;
