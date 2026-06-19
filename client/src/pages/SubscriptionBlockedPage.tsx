import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function SubscriptionBlockedPage() {
  const { user } = useAuth();

  if (user?.role === "SUPER_ADMIN") {
    return <Navigate to="/super/dashboard" replace />;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <section className="w-full max-w-lg rounded-2xl bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">
          Your workspace subscription is not active.
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          Please contact your workspace owner or SaaS support.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            to="/admin/login"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Staff Login
          </Link>
          <Link
            to="/requester/login"
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white"
          >
            Requester Login
          </Link>
        </div>
      </section>
    </main>
  );
}
