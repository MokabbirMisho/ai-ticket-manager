import { useEffect, useState, type FormEvent } from "react";
import { Navigate } from "react-router-dom";
import { api } from "../api/axios";
import { useAuth } from "../context/AuthContext";

type CompanyProfileForm = {
  name: string;
  contactEmail: string;
  country: string;
  industry: string;
};

const emptyForm: CompanyProfileForm = {
  name: "",
  contactEmail: "",
  country: "",
  industry: "",
};

const isValidEmail = (value: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
};

const getValidationError = (form: CompanyProfileForm) => {
  if (!form.name.trim()) return "Company Name is required";
  if (!form.contactEmail.trim()) return "Contact Email is required";
  if (!isValidEmail(form.contactEmail.trim())) {
    return "A valid Contact Email is required";
  }
  if (!form.country.trim()) return "Country is required";
  if (!form.industry.trim()) return "Industry is required";

  return "";
};

const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error === "object" && error !== null && "response" in error) {
    const apiError = error as { response?: { data?: { message?: string } } };
    return apiError.response?.data?.message || fallback;
  }

  return fallback;
};

export function CompanyProfilePage() {
  const { user } = useAuth();
  const [form, setForm] = useState<CompanyProfileForm>(emptyForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const updateForm = (field: keyof CompanyProfileForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      setError("");

      const response = await api.get("/tenant/profile");
      const tenant = response.data.data.tenant;

      setForm({
        name: tenant.name ?? "",
        contactEmail: tenant.contactEmail ?? "",
        country: tenant.country ?? "",
        industry: tenant.industry ?? "",
      });
    } catch (error) {
      setError(getApiErrorMessage(error, "Failed to load company profile"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "ADMIN") {
      fetchProfile();
    }
  }, [user?.role]);

  if (user?.role !== "ADMIN") {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationError = getValidationError(form);

    if (validationError) {
      setError(validationError);
      setSuccess("");
      return;
    }

    try {
      setIsSaving(true);
      setError("");
      setSuccess("");

      const response = await api.patch("/tenant/profile", {
        name: form.name.trim(),
        contactEmail: form.contactEmail.trim(),
        country: form.country.trim(),
        industry: form.industry.trim(),
      });

      const tenant = response.data.data.tenant;

      setForm({
        name: tenant.name ?? "",
        contactEmail: tenant.contactEmail ?? "",
        country: tenant.country ?? "",
        industry: tenant.industry ?? "",
      });
      setSuccess("Company profile updated successfully.");
    } catch (error) {
      setError(getApiErrorMessage(error, "Failed to update company profile"));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-sm text-slate-500 dark:text-slate-400">
        Loading company profile...
      </div>
    );
  }

  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Company Profile
        </h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          Manage the workspace details used for support operations.
        </p>
      </div>

      <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm dark:bg-slate-900">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-5 md:grid-cols-2">
            <TextField
              label="Company Name"
              value={form.name}
              onChange={(value) => updateForm("name", value)}
              placeholder="Acme Support"
              required
            />
            <TextField
              label="Contact Email"
              type="email"
              value={form.contactEmail}
              onChange={(value) => updateForm("contactEmail", value)}
              placeholder="support@company.com"
              required
            />
            <TextField
              label="Country"
              value={form.country}
              onChange={(value) => updateForm("country", value)}
              placeholder="United States"
              required
            />
            <TextField
              label="Industry"
              value={form.industry}
              onChange={(value) => updateForm("industry", value)}
              placeholder="Software"
              required
            />
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
            <div>
              {error && (
                <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-200">
                  {error}
                </div>
              )}

              {success && (
                <div className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700 dark:bg-green-950 dark:text-green-200">
                  {success}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60 dark:bg-white dark:text-slate-950"
            >
              {isSaving ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-white"
        placeholder={placeholder}
      />
    </div>
  );
}
