import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function ChangePasswordPage() {
  const navigate = useNavigate();
  const { user, changePassword } = useAuth();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("All password fields are required");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New password and confirmation must match");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");
      const updatedUser = await changePassword(
        currentPassword,
        newPassword,
        confirmPassword,
      );

      navigate(
        updatedUser.role === "SUPER_ADMIN" ? "/super/dashboard" : "/dashboard",
      );
    } catch (error) {
      if (
        typeof error === "object" &&
        error !== null &&
        "response" in error
      ) {
        const apiError = error as { response?: { data?: { message?: string } } };
        setError(apiError.response?.data?.message || "Failed to change password");
      } else {
        setError("Failed to change password");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-slate-900">
            Change Password
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Set a new password before continuing.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <PasswordField
            label="Current Password"
            value={currentPassword}
            onChange={setCurrentPassword}
          />
          <PasswordField
            label="New Password"
            value={newPassword}
            onChange={setNewPassword}
          />
          <PasswordField
            label="Confirm New Password"
            value={confirmPassword}
            onChange={setConfirmPassword}
          />

          <button
            disabled={isSubmitting}
            className="w-full rounded-lg bg-slate-900 px-4 py-2 font-medium text-white disabled:opacity-60"
          >
            {isSubmitting ? "Saving..." : "Change Password"}
          </button>
        </form>
      </div>
    </main>
  );
}

function PasswordField({
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
        type="password"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-slate-900"
      />
    </div>
  );
}
