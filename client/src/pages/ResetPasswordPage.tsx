import { useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../api/axios";
import { AuthShell } from "./ForgotPasswordPage";

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const type = searchParams.get("type") || "staff";

  return (
    <PasswordResetForm
      token={token}
      endpoint="/auth/reset-password"
      title="Set a new staff password"
      description="Choose a new password for your staff account."
      loginTo="/login"
      loginLabel="Back to staff login"
      invalidTokenMessage={
        type !== "staff" ? "This reset link is not valid for staff login." : ""
      }
    />
  );
}

export function RequesterResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  return (
    <PasswordResetForm
      token={token}
      endpoint="/requester/auth/reset-password"
      title="Set a new requester password"
      description="Choose a new password for your requester portal account."
      loginTo="/requester/login"
      loginLabel="Back to requester login"
    />
  );
}

function PasswordResetForm({
  token,
  endpoint,
  title,
  description,
  loginTo,
  loginLabel,
  invalidTokenMessage = "",
}: {
  token: string;
  endpoint: string;
  title: string;
  description: string;
  loginTo: string;
  loginLabel: string;
  invalidTokenMessage?: string;
}) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState(invalidTokenMessage);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (invalidTokenMessage || !token) {
      setError(invalidTokenMessage || "Password reset token is missing.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");
      setSuccess("");

      await api.post(endpoint, {
        token,
        newPassword,
        confirmPassword,
      });

      setSuccess("Password has been reset successfully.");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      if (typeof error === "object" && error !== null && "response" in error) {
        const apiError = error as { response?: { data?: { message?: string } } };
        setError(
          apiError.response?.data?.message ||
            "Password reset link is invalid, expired, or already used",
        );
      } else {
        setError("Failed to reset password");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell title={title} description={description}>
      {success && (
        <div className="mb-4 rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
          {success}{" "}
          <Link to={loginTo} className="font-semibold underline">
            {loginLabel}
          </Link>
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            New password
          </label>
          <input
            type="password"
            required
            minLength={8}
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-950 outline-none transition focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-100"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Confirm password
          </label>
          <input
            type="password"
            required
            minLength={8}
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-950 outline-none transition focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-100"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || Boolean(success)}
          className="w-full rounded-xl bg-slate-950 px-4 py-2.5 font-semibold text-white shadow-lg shadow-slate-900/15 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Resetting..." : "Reset password"}
        </button>
      </form>

      {!success && (
        <p className="mt-6 text-center text-sm text-slate-500">
          <Link
            to={loginTo}
            className="font-semibold text-slate-950 hover:underline"
          >
            {loginLabel}
          </Link>
        </p>
      )}
    </AuthShell>
  );
}
