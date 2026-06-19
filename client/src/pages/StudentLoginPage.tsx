import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useStudentAuth } from "../context/StudentAuthContext";
import {
  type DevLoginAccount,
  loadDevLoginAccounts,
  removeDevLoginAccount,
  saveDevLoginAccount,
} from "../utils/devSavedLogins";

const DEV_REQUESTER_LOGIN_STORAGE_KEY = "dev_requester_login_accounts";

export function StudentLoginPage() {
  const navigate = useNavigate();
  const { login } = useStudentAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [savedAccounts, setSavedAccounts] = useState<DevLoginAccount[]>([]);
  const [showSavedAccounts, setShowSavedAccounts] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadSavedAccounts = () => {
    if (!import.meta.env.DEV) return;

    setSavedAccounts(loadDevLoginAccounts(DEV_REQUESTER_LOGIN_STORAGE_KEY));
    setShowSavedAccounts(true);
  };

  const selectSavedAccount = (account: DevLoginAccount) => {
    setEmail(account.email);
    setPassword(account.password);
    setShowSavedAccounts(false);
  };

  const removeSavedAccount = (accountEmail: string) => {
    setSavedAccounts(
      removeDevLoginAccount(DEV_REQUESTER_LOGIN_STORAGE_KEY, accountEmail),
    );
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setError("");
      setIsSubmitting(true);

      await login(email, password);

      if (import.meta.env.DEV) {
        saveDevLoginAccount(DEV_REQUESTER_LOGIN_STORAGE_KEY, {
          email,
          password,
        });
      }

      navigate("/student/dashboard");
    } catch {
      setError("Invalid email or password");
    } finally {
      setIsSubmitting(false);
    }
  };

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

      <section className="mx-auto grid max-w-6xl gap-10 px-2 py-12 lg:grid-cols-[1fr_440px] lg:items-center">
        <div>
          <div className="mb-4 inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm">
            AI-powered support workspace
          </div>
          <h1 className="max-w-2xl text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">
            Track every support request in one place.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">
            Requesters can create tickets, follow progress, and stay connected
            with the support team from a clean portal.
          </p>
        </div>

        <div className="relative w-full max-w-md lg:justify-self-end">
          <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-r from-slate-200 to-blue-100 blur-2xl" />

          <div className="relative rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-200 sm:p-7">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-950">
                Requester Login
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Sign in to create and track your support requests.
              </p>
            </div>

          {error && (
            <div className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Email
              </label>
              <div className="relative">
                <input
                  data-testid="email-input"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  onFocus={loadSavedAccounts}
                  onClick={loadSavedAccounts}
                  onBlur={() => {
                    window.setTimeout(() => setShowSavedAccounts(false), 120);
                  }}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-950 outline-none transition focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-100"
                />
                {import.meta.env.DEV &&
                  showSavedAccounts &&
                  savedAccounts.length > 0 && (
                    <div className="absolute left-0 right-0 top-full z-10 mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10">
                      <p className="border-b border-slate-100 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Saved development logins
                      </p>
                      {savedAccounts.map((account) => (
                        <div
                          key={account.email}
                          className="flex items-center justify-between gap-2 px-4 py-3 hover:bg-slate-50"
                        >
                          <button
                            type="button"
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => selectSavedAccount(account)}
                            className="min-w-0 flex-1 truncate text-left text-sm font-medium text-slate-700"
                          >
                            {account.email}
                          </button>
                          <button
                            type="button"
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => removeSavedAccount(account.email)}
                            className="rounded-lg px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
                            aria-label={`Remove ${account.email}`}
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Password
              </label>
              <input
                data-testid="password-input"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-950 outline-none transition focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-100"
              />
            </div>

            <button
              data-testid="login-button"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-slate-950 px-4 py-2.5 font-semibold text-white shadow-lg shadow-slate-900/15 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            New requester?{" "}
            <Link
              to="/student/register"
              className="font-semibold text-slate-950 hover:underline"
            >
              Create account
            </Link>
          </p>
        </div>
        </div>
      </section>
    </main>
  );
}
