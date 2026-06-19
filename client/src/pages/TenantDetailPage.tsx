import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { api } from "../api/axios";
import { useAuth } from "../context/AuthContext";

const plans = ["FREE", "BASIC", "PRO", "ENTERPRISE"];
const statuses = ["TRIAL", "ACTIVE", "EXPIRED", "SUSPENDED"];
const providers = ["MANUAL", "STRIPE", "SSLCOMMERZ", "BKASH"];

type Tenant = {
  id: string;
  name: string;
  slug: string;
  contactEmail: string | null;
  country: string | null;
  industry: string | null;
  isActive: boolean;
  plan: string;
  subscriptionStatus: string;
  subscriptionEndsAt: string | null;
  paymentProvider: string;
  users?: TenantUser[];
};

type TenantUser = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "AGENT";
  isActive: boolean;
  mustChangePassword: boolean;
  createdAt: string;
};

type Usage = {
  users: number;
  students: number;
  tickets: number;
  knowledgeArticles: number;
};

export function TenantDetailPage() {
  const { user } = useAuth();
  const { id } = useParams();

  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [usage, setUsage] = useState<Usage | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [country, setCountry] = useState("");
  const [industry, setIndustry] = useState("");
  const [plan, setPlan] = useState("FREE");
  const [subscriptionStatus, setSubscriptionStatus] = useState("TRIAL");
  const [subscriptionEndsAt, setSubscriptionEndsAt] = useState("");
  const [paymentProvider, setPaymentProvider] = useState("MANUAL");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [resetUser, setResetUser] = useState<TenantUser | null>(null);
  const [temporaryPassword, setTemporaryPassword] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const setFormState = (nextTenant: Tenant) => {
    setTenant(nextTenant);
    setName(nextTenant.name);
    setSlug(nextTenant.slug);
    setContactEmail(nextTenant.contactEmail || "");
    setCountry(nextTenant.country || "");
    setIndustry(nextTenant.industry || "");
    setPlan(nextTenant.plan);
    setSubscriptionStatus(nextTenant.subscriptionStatus);
    setSubscriptionEndsAt(
      nextTenant.subscriptionEndsAt
        ? nextTenant.subscriptionEndsAt.slice(0, 10)
        : "",
    );
    setPaymentProvider(nextTenant.paymentProvider);
  };

  const fetchTenant = async (showLoading = true) => {
    if (!id) return;

    try {
      if (showLoading) {
        setIsLoading(true);
      }
      setError("");
      const response = await api.get(`/super/tenants/${id}`);
      setFormState(response.data.data.tenant);
      setUsage(response.data.data.usage ?? null);
    } catch {
      setError("Failed to load tenant");
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchTenant();
  }, [id]);

  if (user?.role !== "SUPER_ADMIN") {
    return <Navigate to="/dashboard" replace />;
  }

  const handleUpdateInfo = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!id) return;

    try {
      setIsSaving(true);
      setError("");
      setSuccess("");
      await api.patch(`/super/tenants/${id}`, {
        name,
        slug,
        contactEmail,
        country,
        industry,
      });
      await fetchTenant(false);
      setSuccess("Tenant info updated");
    } catch {
      setError("Failed to update tenant info");
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resetUser || !temporaryPassword.trim()) {
      setError("Temporary password is required");
      return;
    }

    try {
      setIsResetting(true);
      setError("");
      setSuccess("");
      await api.patch(`/super/users/${resetUser.id}/reset-password`, {
        temporaryPassword,
      });
      setSuccess(
        "Password reset successfully. Share the temporary password securely with the user.",
      );
      setResetUser(null);
      setTemporaryPassword("");
      await fetchTenant();
    } catch (error) {
      if (
        typeof error === "object" &&
        error !== null &&
        "response" in error
      ) {
        const apiError = error as { response?: { data?: { message?: string } } };
        setError(apiError.response?.data?.message || "Failed to reset password");
      } else {
        setError("Failed to reset password");
      }
    } finally {
      setIsResetting(false);
    }
  };

  const handleUpdateSubscription = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    if (!id) return;

    try {
      setIsSaving(true);
      setError("");
      setSuccess("");
      await api.patch(`/super/tenants/${id}/subscription`, {
        plan,
        subscriptionStatus,
        subscriptionEndsAt: subscriptionEndsAt || null,
        paymentProvider,
      });
      await fetchTenant(false);
      setSuccess("Subscription updated");
    } catch {
      setError("Failed to update subscription");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleTenantStatus = async () => {
    if (!id || !tenant) return;

    try {
      setIsSaving(true);
      setError("");
      setSuccess("");
      const action = tenant.isActive ? "deactivate" : "activate";
      await api.patch(`/super/tenants/${id}/${action}`);
      await fetchTenant(false);
      setSuccess(tenant.isActive ? "Tenant deactivated" : "Tenant activated");
    } catch {
      setError("Failed to update tenant status");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="text-sm text-slate-500">Loading tenant...</div>;
  }

  if (!tenant) {
    return (
      <div className="text-sm text-red-600">{error || "Tenant not found"}</div>
    );
  }

  const tenantUsers = tenant.users ?? [];
  const usageCounts = {
    users: usage?.users ?? 0,
    students: usage?.students ?? 0,
    tickets: usage?.tickets ?? 0,
    knowledgeArticles: usage?.knowledgeArticles ?? 0,
  };

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{tenant.name}</h1>
          <p className="mt-2 text-slate-500">
            Workspace settings and manual subscription controls.
          </p>
        </div>

        <button
          onClick={toggleTenantStatus}
          disabled={isSaving}
          className={`rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-60 ${
            tenant.isActive ? "bg-red-600" : "bg-green-600"
          }`}
        >
          {tenant.isActive ? "Deactivate" : "Activate"}
        </button>
      </div>

      {error && (
        <div className="mt-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-5 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
          {success}
        </div>
      )}

      <div className="mt-6 grid gap-6 md:grid-cols-4">
        <StatCard label="Users" value={usageCounts.users} />
        <StatCard label="Requesters" value={usageCounts.students} />
        <StatCard label="Tickets" value={usageCounts.tickets} />
        <StatCard
          label="Knowledge"
          value={usageCounts.knowledgeArticles}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <form
          onSubmit={handleUpdateInfo}
          className="rounded-2xl bg-white p-6 shadow-sm"
        >
          <h2 className="text-lg font-bold text-slate-900">Tenant Info</h2>
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <TextField label="Name" value={name} onChange={setName} />
            <TextField label="Slug" value={slug} onChange={setSlug} />
            <TextField
              label="Contact Email"
              value={contactEmail}
              onChange={setContactEmail}
            />
            <TextField
              label="Country"
              value={country}
              onChange={setCountry}
            />
            <TextField
              label="Industry"
              value={industry}
              onChange={setIndustry}
            />
          </div>
          <div className="mt-6 flex justify-end">
            <button
              disabled={isSaving}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            >
              Save Info
            </button>
          </div>
        </form>

        <form
          onSubmit={handleUpdateSubscription}
          className="rounded-2xl bg-white p-6 shadow-sm"
        >
          <h2 className="text-lg font-bold text-slate-900">Subscription</h2>
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <SelectField
              label="Plan"
              value={plan}
              options={plans}
              onChange={setPlan}
            />
            <SelectField
              label="Status"
              value={subscriptionStatus}
              options={statuses}
              onChange={setSubscriptionStatus}
            />
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Ends At
              </label>
              <input
                type="date"
                value={subscriptionEndsAt}
                onChange={(event) =>
                  setSubscriptionEndsAt(event.target.value)
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
              />
            </div>
            <SelectField
              label="Payment Provider"
              value={paymentProvider}
              options={providers}
              onChange={setPaymentProvider}
            />
          </div>
          <div className="mt-6 flex justify-end">
            <button
              disabled={isSaving}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            >
              Save Subscription
            </button>
          </div>
        </form>
      </div>

      <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">
          Tenant Users
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Admins and agents for this tenant.
        </p>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium">Role</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Password</th>
                <th className="px-5 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tenantUsers.length === 0 && (
                <tr>
                  <td className="px-5 py-4 text-slate-500" colSpan={6}>
                    No tenant users found.
                  </td>
                </tr>
              )}
              {tenantUsers.map((tenantUser) => (
                <tr key={tenantUser.id} className="hover:bg-slate-50">
                  <td className="px-5 py-4 font-medium text-slate-900">
                    {tenantUser.name}
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {tenantUser.email}
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {tenantUser.role}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        tenantUser.isActive
                          ? "bg-green-50 text-green-700"
                          : "bg-red-50 text-red-700"
                      }`}
                    >
                      {tenantUser.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {tenantUser.mustChangePassword
                      ? "Change required"
                      : "Current"}
                  </td>
                  <td className="px-5 py-4">
                    <button
                      onClick={() => {
                        setResetUser(tenantUser);
                        setTemporaryPassword("");
                        setError("");
                        setSuccess("");
                      }}
                      className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      Reset Password
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {resetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-xl font-bold text-slate-900">
              Reset Password
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Set a temporary password for {resetUser.email}.
            </p>

            <div className="mt-5">
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Temporary Password
              </label>
              <input
                type="password"
                value={temporaryPassword}
                onChange={(event) => setTemporaryPassword(event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
              />
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setResetUser(null);
                  setTemporaryPassword("");
                }}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleResetPassword}
                disabled={isResetting}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
              >
                {isResetting ? "Resetting..." : "Reset Password"}
              </button>
            </div>
          </div>
        </div>
      )}
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

function TextField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}
