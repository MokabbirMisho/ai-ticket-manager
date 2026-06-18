import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { api } from "../api/axios";
import { useAuth } from "../context/AuthContext";

type Tenant = {
  id: string;
  name: string;
  slug: string;
  plan: string;
  subscriptionStatus: string;
  subscriptionEndsAt: string | null;
  paymentProvider: string;
  isActive: boolean;
};

export function SuperSubscriptionsPage() {
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
        setError("Failed to load subscriptions");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTenants();
  }, []);

  if (user?.role !== "SUPER_ADMIN") {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Subscriptions</h1>
        <p className="mt-2 text-slate-500">
          Manual plan and subscription status controls.
        </p>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl bg-white shadow-sm">
        {isLoading && (
          <div className="p-6 text-sm text-slate-500">
            Loading subscriptions...
          </div>
        )}

        {error && <div className="p-6 text-sm text-red-600">{error}</div>}

        {!isLoading && !error && (
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-5 py-3 font-medium">Tenant</th>
                <th className="px-5 py-3 font-medium">Plan</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Ends</th>
                <th className="px-5 py-3 font-medium">Provider</th>
                <th className="px-5 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tenants.map((tenant) => (
                <tr key={tenant.id} className="hover:bg-slate-50">
                  <td className="px-5 py-4">
                    <p className="font-medium text-slate-900">{tenant.name}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {tenant.slug}
                    </p>
                  </td>
                  <td className="px-5 py-4 text-slate-600">{tenant.plan}</td>
                  <td className="px-5 py-4 text-slate-600">
                    {tenant.subscriptionStatus}
                  </td>
                  <td className="px-5 py-4 text-slate-500">
                    {tenant.subscriptionEndsAt
                      ? new Date(tenant.subscriptionEndsAt).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {tenant.paymentProvider}
                  </td>
                  <td className="px-5 py-4">
                    <Link
                      to={`/super/tenants/${tenant.id}`}
                      className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      Manage
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
