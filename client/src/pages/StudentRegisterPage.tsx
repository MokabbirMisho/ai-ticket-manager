import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useStudentAuth } from "../context/StudentAuthContext";

export function StudentRegisterPage() {
  const navigate = useNavigate();
  const { register } = useStudentAuth();

  const [name, setName] = useState("Rahman Requester");
  const [email, setEmail] = useState("requester@example.com");
  const [password, setPassword] = useState("requester123");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setError("");
      setIsSubmitting(true);

      await register(name, email, password);
      navigate("/student/dashboard");
    } catch {
      setError("Could not create requester account");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <h1 className="text-center text-2xl font-bold text-slate-900">
          Requester Registration
        </h1>

        <p className="mt-2 text-center text-sm text-slate-500">
          Create an account to submit support tickets
        </p>

        {error && (
          <div className="mt-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Name
            </label>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-slate-900"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-slate-900"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-slate-900"
            />
          </div>

          <button
            disabled={isSubmitting}
            className="w-full rounded-lg bg-slate-900 px-4 py-2 font-medium text-white disabled:opacity-60"
          >
            {isSubmitting ? "Creating account..." : "Register"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link
            to="/student/login"
            className="font-medium text-slate-900 hover:underline"
          >
            Login
          </Link>
        </p>
      </div>
    </main>
  );
}
