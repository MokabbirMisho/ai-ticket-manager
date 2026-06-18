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
  subscriptionEndsAt: string | null;
  paymentProvider: string;
  isActive: boolean;
};

export function TenantListPage() {
  const { user } = useAuth();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchTenants = async () => {
    try {
      setIsLoading(true);
      setError("");
      const response = await api.get("/super/tenants", {
        params: {
          search: search || undefined,
          status: status || undefined,
        },
      });
      setTenants(response.data.data.tenants);
    } catch {
      setError("Failed to load tenants");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, [search, status]);

  if (user?.role !== "SUPER_ADMIN") {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tenants</h1>
          <p className="mt-2 text-slate-500">
            Client workspaces for the SaaS platform.
          </p>
        </div>

        <Link
          to="/super/tenants/new"
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white"
        >
          Create Tenant
        </Link>
      </div>

      <div className="mt-6 rounded-2xl bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
              placeholder="Search tenants..."
            />

            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
            >
              <option value="">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {isLoading && (
          <div className="p-6 text-sm text-slate-500">Loading tenants...</div>
        )}

        {error && <div className="p-6 text-sm text-red-600">{error}</div>}

        {!isLoading && !error && tenants.length === 0 && (
          <div className="p-6 text-sm text-slate-500">No tenants found.</div>
        )}

        {!isLoading && !error && tenants.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Slug</th>
                  <th className="px-5 py-3 font-medium">Country</th>
                  <th className="px-5 py-3 font-medium">Industry</th>
                  <th className="px-5 py-3 font-medium">Plan</th>
                  <th className="px-5 py-3 font-medium">Subscription</th>
                  <th className="px-5 py-3 font-medium">Ends</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {tenants.map((tenant) => (
                  <tr key={tenant.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4 font-medium text-slate-900">
                      {tenant.name}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {tenant.slug}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {tenant.country || "-"}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {tenant.industry || "-"}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {tenant.plan}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {tenant.subscriptionStatus}
                    </td>
                    <td className="px-5 py-4 text-slate-500">
                      {tenant.subscriptionEndsAt
                        ? new Date(
                            tenant.subscriptionEndsAt,
                          ).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          tenant.isActive
                            ? "bg-green-50 text-green-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        {tenant.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <Link
                        to={`/super/tenants/${tenant.id}`}
                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                      >
                        View/Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
