import { useState, type FormEvent, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/axios";

const genericMessage =
  "If an account exists for this email, a password reset link has been sent.";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setIsSubmitting(true);
      setError("");
      setSuccess("");

      await api.post("/auth/forgot-password", {
        email: email.trim(),
      });

      setSuccess(genericMessage);
    } catch {
      setError("Unable to process password reset request right now");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Reset staff password"
      description="Enter your staff email and we will send a secure password reset link if an account exists."
    >
      <ResetRequestForm
        email={email}
        setEmail={setEmail}
        success={success}
        error={error}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
        backTo="/login"
        backLabel="Back to staff login"
      />
    </AuthShell>
  );
}

export function RequesterForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setIsSubmitting(true);
      setError("");
      setSuccess("");

      await api.post("/requester/auth/forgot-password", {
        email: email.trim(),
      });

      setSuccess(genericMessage);
    } catch {
      setError("Unable to process password reset request right now");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Reset requester password"
      description="Enter your requester email and we will send a secure password reset link if an account exists."
    >
      <ResetRequestForm
        email={email}
        setEmail={setEmail}
        success={success}
        error={error}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
        backTo="/requester/login"
        backLabel="Back to requester login"
      />
    </AuthShell>
  );
}

function ResetRequestForm({
  email,
  setEmail,
  success,
  error,
  isSubmitting,
  onSubmit,
  backTo,
  backLabel,
}: {
  email: string;
  setEmail: (email: string) => void;
  success: string;
  error: string;
  isSubmitting: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  backTo: string;
  backLabel: string;
}) {
  return (
    <>
      {success && (
        <div className="mb-4 rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
          {success}
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-950 outline-none transition focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-100"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-xl bg-slate-950 px-4 py-2.5 font-semibold text-white shadow-lg shadow-slate-900/15 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Sending..." : "Send reset link"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        <Link to={backTo} className="font-semibold text-slate-950 hover:underline">
          {backLabel}
        </Link>
      </p>
    </>
  );
}

export function AuthShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 px-4 py-6 text-slate-900">
      <div className="mx-auto flex max-w-7xl items-center">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-sm font-bold text-white">
            AI
          </div>
          <div>
            <p className="text-lg font-bold">AI Ticket Management</p>
            <p className="text-sm text-slate-500">AI Ticket Management SaaS</p>
          </div>
        </Link>
      </div>

      <section className="mx-auto flex max-w-6xl justify-center px-2 py-12">
        <div className="relative w-full max-w-md">
          <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-r from-slate-200 to-blue-100 blur-2xl" />

          <div className="relative rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-200 sm:p-7">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-slate-950">{title}</h1>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                {description}
              </p>
            </div>

            {children}
          </div>
        </div>
      </section>
    </main>
  );
}
