import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { ReactNode } from "react";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        Loading...
      </main>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  if (
    user.mustChangePassword &&
    location.pathname !== "/change-password"
  ) {
    return <Navigate to="/change-password" replace />;
  }

  return children;
}
