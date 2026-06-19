import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function SuperLoginPage() {
  const navigate = useNavigate();
  const { login, logout } = useAuth();

  const [email, setEmail] = useState("mokabbirmiso1992@gmail.com");
  const [password, setPassword] = useState("Misho1234@");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setError("");
      setIsSubmitting(true);

      const user = await login(email, password);

      if (user.role !== "SUPER_ADMIN") {
        await logout();
        setError("This login is only for Super Admin accounts");
        return;
      }

      navigate("/super/dashboard");
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
            Operate every workspace from one platform.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">
            Platform owners can manage tenants, subscriptions, and access while
            tenant teams keep their support operations separate.
          </p>
        </div>

        <div className="relative w-full max-w-md lg:justify-self-end">
          <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-r from-slate-200 to-blue-100 blur-2xl" />

          <div className="relative rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-200 sm:p-7">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-950">
                Super Admin Login
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Platform owner access for tenant and subscription management.
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
              <input
                data-testid="email-input"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-950 outline-none transition focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-100"
              />
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
              type="submit"
              data-testid="login-button"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-slate-950 px-4 py-2.5 font-semibold text-white shadow-lg shadow-slate-900/15 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Tenant staff?{" "}
            <Link
              to="/admin/login"
              className="font-semibold text-slate-950 hover:underline"
            >
              Use Staff Login
            </Link>
          </p>
        </div>
        </div>
      </section>
    </main>
  );
}
