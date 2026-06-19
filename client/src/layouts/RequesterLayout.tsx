import { Link, NavLink, Outlet } from "react-router-dom";
import { useRequesterAuth } from "../context/RequesterAuthContext";

export function RequesterLayout() {
  const { requester, logout } = useRequesterAuth();

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white px-8 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link to="/requester/dashboard">
            <h1 className="text-lg font-bold text-slate-900">
              Requester Portal
            </h1>
            <p className="text-xs text-slate-500">AI Ticket Management</p>
          </Link>

          <nav className="flex items-center gap-4">
            <NavLink
              to="/requester/dashboard"
              className={({ isActive }) =>
                isActive
                  ? "text-sm font-semibold text-slate-900"
                  : "text-sm font-medium text-slate-500 hover:text-slate-900"
              }
            >
              Dashboard
            </NavLink>

            <NavLink
              to="/requester/tickets"
              className={({ isActive }) =>
                isActive
                  ? "text-sm font-semibold text-slate-900"
                  : "text-sm font-medium text-slate-500 hover:text-slate-900"
              }
            >
              My Tickets
            </NavLink>

            <NavLink
              to="/requester/account"
              className={({ isActive }) =>
                isActive
                  ? "text-sm font-semibold text-slate-900"
                  : "text-sm font-medium text-slate-500 hover:text-slate-900"
              }
            >
              Account
            </NavLink>

            <Link
              to="/requester/tickets/new"
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white"
            >
              New Ticket
            </Link>

            <button
              onClick={logout}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
            >
              Logout
            </button>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-8 py-8">
        <div className="mb-6 rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Logged in as</p>
          <h2 className="font-semibold text-slate-900">
            {requester?.name} · {requester?.email}
          </h2>
        </div>

        <Outlet />
      </main>
    </div>
  );
}
