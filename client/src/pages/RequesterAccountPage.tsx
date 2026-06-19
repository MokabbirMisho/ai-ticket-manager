import { useEffect, useState } from "react";
import { api } from "../api/axios";

type RequesterAccount = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  country: string | null;
  city: string | null;
  address: string | null;
};

type ProfileFormState = {
  phone: string;
  country: string;
  city: string;
  address: string;
};

type PasswordFormState = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

const emptyProfileForm: ProfileFormState = {
  phone: "",
  country: "",
  city: "",
  address: "",
};

const emptyPasswordForm: PasswordFormState = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error === "object" && error !== null && "response" in error) {
    const apiError = error as { response?: { data?: { message?: string } } };
    return apiError.response?.data?.message || fallback;
  }

  return fallback;
};

export function RequesterAccountPage() {
  const [account, setAccount] = useState<RequesterAccount | null>(null);
  const [profileForm, setProfileForm] =
    useState<ProfileFormState>(emptyProfileForm);
  const [passwordForm, setPasswordForm] =
    useState<PasswordFormState>(emptyPasswordForm);

  const [isLoading, setIsLoading] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [error, setError] = useState("");

  const fetchAccount = async () => {
    try {
      setIsLoading(true);
      setError("");

      const response = await api.get("/requester/account");
      const requester = response.data.data.requester as RequesterAccount;

      setAccount(requester);
      setProfileForm({
        phone: requester.phone ?? "",
        country: requester.country ?? "",
        city: requester.city ?? "",
        address: requester.address ?? "",
      });
    } catch (error) {
      setError(getApiErrorMessage(error, "Failed to load account"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAccount();
  }, []);

  const updateProfileForm = (
    field: keyof ProfileFormState,
    value: string,
  ) => {
    setProfileForm((current) => ({ ...current, [field]: value }));
  };

  const updatePasswordForm = (
    field: keyof PasswordFormState,
    value: string,
  ) => {
    setPasswordForm((current) => ({ ...current, [field]: value }));
  };

  const handleProfileSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    try {
      setIsSavingProfile(true);
      setError("");
      setProfileMessage("");

      const response = await api.patch("/requester/account", {
        phone: profileForm.phone,
        country: profileForm.country,
        city: profileForm.city,
        address: profileForm.address,
      });

      const requester = response.data.data.requester as RequesterAccount;
      setAccount(requester);
      setProfileForm({
        phone: requester.phone ?? "",
        country: requester.country ?? "",
        city: requester.city ?? "",
        address: requester.address ?? "",
      });
      setProfileMessage("Profile information updated successfully");
    } catch (error) {
      setError(getApiErrorMessage(error, "Failed to update profile"));
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("New password and confirm password must match");
      return;
    }

    try {
      setIsChangingPassword(true);
      setError("");
      setPasswordMessage("");

      await api.patch("/requester/account/password", passwordForm);

      setPasswordForm(emptyPasswordForm);
      setPasswordMessage("Password updated successfully");
    } catch (error) {
      setError(getApiErrorMessage(error, "Failed to update password"));
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (isLoading) {
    return <div className="text-sm text-slate-500">Loading account...</div>;
  }

  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Account Settings</h1>
        <p className="mt-2 text-slate-500">
          Manage your contact details and password.
        </p>
      </div>

      {error && (
        <div className="mt-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Profile Information
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Update the contact information your support team uses.
            </p>
          </div>

          {profileMessage && (
            <div className="mt-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
              {profileMessage}
            </div>
          )}

          <form onSubmit={handleProfileSubmit} className="mt-5 space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <ReadOnlyField label="Name" value={account?.name ?? ""} />
              <ReadOnlyField label="Email" value={account?.email ?? ""} />
              <TextField
                label="Phone"
                value={profileForm.phone}
                onChange={(value) => updateProfileForm("phone", value)}
                placeholder="+1 555 0100"
              />
              <TextField
                label="Country"
                value={profileForm.country}
                onChange={(value) => updateProfileForm("country", value)}
                placeholder="United States"
              />
              <TextField
                label="City"
                value={profileForm.city}
                onChange={(value) => updateProfileForm("city", value)}
                placeholder="New York"
              />
              <TextField
                label="Address"
                value={profileForm.address}
                onChange={(value) => updateProfileForm("address", value)}
                placeholder="Street address"
              />
            </div>

            <div className="flex justify-end">
              <button
                disabled={isSavingProfile}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
              >
                {isSavingProfile ? "Saving..." : "Save Profile"}
              </button>
            </div>
          </form>
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Change Password
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Use your current password to set a new password.
            </p>
          </div>

          {passwordMessage && (
            <div className="mt-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
              {passwordMessage}
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="mt-5 space-y-5">
            <TextField
              label="Current Password"
              type="password"
              value={passwordForm.currentPassword}
              onChange={(value) => updatePasswordForm("currentPassword", value)}
              required
            />
            <TextField
              label="New Password"
              type="password"
              value={passwordForm.newPassword}
              onChange={(value) => updatePasswordForm("newPassword", value)}
              required
            />
            <TextField
              label="Confirm New Password"
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(value) => updatePasswordForm("confirmPassword", value)}
              required
            />

            <div className="flex justify-end">
              <button
                disabled={isChangingPassword}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
              >
                {isChangingPassword ? "Updating..." : "Change Password"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <div className="min-h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
        {value || "-"}
      </div>
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
      <label className="mb-1 block text-sm font-medium text-slate-700">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      <input
        type={type}
        value={value}
        required={required}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
      />
    </div>
  );
}
