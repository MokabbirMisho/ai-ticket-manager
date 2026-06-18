import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { api } from "../api/axios";
import { useAuth } from "../context/AuthContext";

const plans = ["FREE", "BASIC", "PRO", "ENTERPRISE"];
const statuses = ["TRIAL", "ACTIVE", "EXPIRED", "SUSPENDED"];
const providers = ["MANUAL", "STRIPE", "SSLCOMMERZ", "BKASH"];

export function CreateTenantPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [country, setCountry] = useState("");
  const [industry, setIndustry] = useState("");
  const [plan, setPlan] = useState("FREE");
  const [subscriptionStatus, setSubscriptionStatus] = useState("TRIAL");
  const [subscriptionEndsAt, setSubscriptionEndsAt] = useState("");
  const [paymentProvider, setPaymentProvider] = useState("MANUAL");
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [temporaryPassword, setTemporaryPassword] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (user?.role !== "SUPER_ADMIN") {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setIsSubmitting(true);
      setError("");
      setSuccess("");

      const response = await api.post("/super/tenants", {
        name,
        slug,
        contactEmail,
        country,
        industry,
        plan,
        subscriptionStatus,
        subscriptionEndsAt: subscriptionEndsAt || null,
        paymentProvider,
        adminName,
        adminEmail,
        temporaryPassword,
      });

      setSuccess(
        "Tenant and tenant admin created successfully. Share the login email and temporary password securely.",
      );
      setTimeout(() => {
        navigate(`/super/tenants/${response.data.data.tenant.id}`);
      }, 700);
    } catch (error) {
      if (
        typeof error === "object" &&
        error !== null &&
        "response" in error
      ) {
        const apiError = error as { response?: { data?: { message?: string } } };
        setError(apiError.response?.data?.message || "Failed to create tenant");
      } else {
        setError("Failed to create tenant");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Create Tenant</h1>
        <p className="mt-2 text-slate-500">
          Add a new client workspace to the SaaS platform.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-6 max-w-3xl rounded-2xl bg-white p-6 shadow-sm"
      >
        {error && (
          <div className="mb-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-5 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
            {success}
          </div>
        )}

        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Company Information
          </h2>
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <TextField label="Name" value={name} onChange={setName} />
            <TextField label="Slug" value={slug} onChange={setSlug} />
            <TextField label="Country" value={country} onChange={setCountry} />
            <TextField
              label="Industry"
              value={industry}
              onChange={setIndustry}
            />
            <TextField
              label="Contact Email"
              value={contactEmail}
              onChange={setContactEmail}
              type="email"
            />
          </div>
        </div>

        <div className="mt-8 border-t border-slate-100 pt-6">
          <h2 className="text-lg font-bold text-slate-900">
            Tenant Admin Account
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            This admin can log in from Staff Login and manage only this tenant's
            data.
          </p>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <TextField
              label="Admin Name"
              value={adminName}
              onChange={setAdminName}
            />
            <TextField
              label="Admin Email"
              value={adminEmail}
              onChange={setAdminEmail}
              type="email"
            />
            <TextField
              label="Temporary Password"
              value={temporaryPassword}
              onChange={setTemporaryPassword}
              type="password"
            />
          </div>
        </div>

        <div className="mt-8 border-t border-slate-100 pt-6">
          <h2 className="text-lg font-bold text-slate-900">
            Subscription Information
          </h2>
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <SelectField
              label="Plan"
              value={plan}
              options={plans}
              onChange={setPlan}
            />
            <SelectField
              label="Subscription Status"
              value={subscriptionStatus}
              options={statuses}
              onChange={setSubscriptionStatus}
            />
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Subscription Ends At
              </label>
              <input
                type="date"
                value={subscriptionEndsAt}
                onChange={(event) => setSubscriptionEndsAt(event.target.value)}
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
        </div>

        <div className="mt-6 flex justify-end">
          <button
            disabled={isSubmitting}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {isSubmitting ? "Creating..." : "Create Tenant"}
          </button>
        </div>
      </form>
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        type={type}
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
