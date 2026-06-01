import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useStudentAuth } from "../context/StudentAuthContext";

export function StudentProtectedRoute({ children }: { children: ReactNode }) {
  const { student, isLoading } = useStudentAuth();

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        Loading...
      </main>
    );
  }

  if (!student) {
    return <Navigate to="/student/login" replace />;
  }

  return children;
}
