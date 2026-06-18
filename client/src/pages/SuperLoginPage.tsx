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
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-slate-900">
            Super Admin Login
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Manage tenants, clients, and subscriptions
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              data-testid="email-input"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-slate-900"
              placeholder="mokabbirmiso1992@gmail.com"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              data-testid="password-input"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-slate-900"
              placeholder="Misho1234@"
            />
          </div>

          <button
            type="submit"
            data-testid="login-button"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-slate-900 px-4 py-2 font-medium text-white disabled:opacity-60"
          >
            {isSubmitting ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-500">
          Tenant staff?{" "}
          <Link
            to="/admin/login"
            className="font-medium text-slate-900 hover:underline"
          >
            Use Staff Login
          </Link>
        </p>
      </div>
    </main>
  );
}
