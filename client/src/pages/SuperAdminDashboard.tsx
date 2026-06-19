import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { api } from "../api/axios";
import { useAuth } from "../context/AuthContext";

type Tenant = {
  id: string;
  name: string;
  slug: string;
  country: string | null;
  industry: string | null;
  plan: string;
  subscriptionStatus: string;
  isActive: boolean;
  _count: {
    users: number;
    requesters?: number;
    students?: number;
    tickets: number;
    knowledgeArticles: number;
  };
};

export function SuperAdminDashboard() {
  const { user } = useAuth();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTenants = async () => {
      try {
        setIsLoading(true);
        setError("");
        const response = await api.get("/super/tenants", {
          params: { limit: 100 },
        });
        setTenants(response.data.data.tenants);
      } catch {
        setError("Failed to load Super Admin dashboard");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTenants();
  }, []);

  if (user?.role !== "SUPER_ADMIN") {
    return <Navigate to="/dashboard" replace />;
  }

  const activeTenants = tenants.filter((tenant) => tenant.isActive).length;
  const totalUsers = tenants.reduce(
    (sum, tenant) => sum + tenant._count.users,
    0,
  );
  const totalTickets = tenants.reduce(
    (sum, tenant) => sum + tenant._count.tickets,
    0,
  );
  const expiredTenants = tenants.filter(
    (tenant) => tenant.subscriptionStatus === "EXPIRED",
  ).length;

  if (isLoading) {
    return <div className="text-sm text-slate-500">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="text-sm text-red-600">{error}</div>;
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Super Dashboard
          </h1>
          <p className="mt-2 text-slate-500">
            Manage client workspaces and subscription status.
          </p>
        </div>

        <Link
          to="/super/tenants/new"
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white"
        >
          Create Tenant
        </Link>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-4">
        <StatCard label="Total Tenants" value={tenants.length} />
        <StatCard label="Active Tenants" value={activeTenants} />
        <StatCard label="Total Users" value={totalUsers} />
        <StatCard label="Total Tickets" value={totalTickets} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">
            Subscription Alerts
          </h2>
          <div className="mt-5 rounded-xl bg-slate-50 px-4 py-3">
            <p className="text-sm text-slate-500">Expired subscriptions</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">
              {expiredTenants}
            </p>
          </div>
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">
              Recent Tenants
            </h2>
            <Link
              to="/super/tenants"
              className="text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              View all
            </Link>
          </div>

          <div className="mt-5 divide-y divide-slate-100">
            {tenants.slice(0, 5).map((tenant) => (
              <Link
                key={tenant.id}
                to={`/super/tenants/${tenant.id}`}
                className="flex items-center justify-between gap-4 py-4 hover:bg-slate-50"
              >
                <div>
                  <p className="font-medium text-slate-900">{tenant.name}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {tenant.slug} · {tenant.plan} ·{" "}
                    {tenant.subscriptionStatus}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    tenant.isActive
                      ? "bg-green-50 text-green-700"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  {tenant.isActive ? "Active" : "Inactive"}
                </span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <h2 className="mt-2 text-3xl font-bold text-slate-900">{value}</h2>
    </div>
  );
}
