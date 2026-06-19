import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useRequesterAuth } from "../context/RequesterAuthContext";

export function RequesterProtectedRoute({ children }: { children: ReactNode }) {
  const { requester, isLoading } = useRequesterAuth();

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        Loading...
      </main>
    );
  }

  if (!requester) {
    return <Navigate to="/requester/login" replace />;
  }

  return children;
}
