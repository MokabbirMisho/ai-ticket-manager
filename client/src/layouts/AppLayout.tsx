import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function AppLayout() {
  const { user, logout } = useAuth();

  const navItems =
    user?.role === "ADMIN"
      ? [
          { label: "Dashboard", path: "/dashboard" },
          { label: "Tickets", path: "/tickets" },
          { label: "Users", path: "/users" },
          { label: "Students", path: "/students" },
        ]
      : [
          { label: "Dashboard", path: "/dashboard" },
          { label: "My Assigned Tickets", path: "/tickets" },
        ];

  return (
    <div className="min-h-screen bg-slate-100">
      <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-950 text-white">
        <div className="border-b border-slate-800 px-6 py-5">
          <h1 className="text-lg font-bold">AI Ticket</h1>
          <p className="mt-1 text-xs text-slate-400">
            {user?.role === "ADMIN" ? "Admin Portal" : "Agent Portal"}
          </p>
        </div>

        <nav className="space-y-1 px-3 py-4">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `block rounded-lg px-3 py-2 text-sm font-medium ${
                  isActive
                    ? "bg-white text-slate-950"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="ml-64">
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Logged in as</p>
              <h2 className="font-semibold text-slate-900">
                {user?.name} · {user?.role}
              </h2>
            </div>

            <button
              onClick={logout}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white"
            >
              Logout
            </button>
          </div>
        </header>

        <main className="p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
