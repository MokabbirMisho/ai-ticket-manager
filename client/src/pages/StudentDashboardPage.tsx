import { Link } from "react-router-dom";
import { useStudentAuth } from "../context/StudentAuthContext";

export function StudentDashboardPage() {
  const { student } = useStudentAuth();

  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome, {student?.name}
        </h1>
        <p className="mt-2 text-slate-500">
          Submit support tickets and track your requests from one place.
        </p>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">My Tickets</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-900">View</h2>
          <Link
            to="/student/tickets"
            className="mt-4 inline-block text-sm font-medium text-slate-900 hover:underline"
          >
            Go to tickets →
          </Link>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Need Help?</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-900">Create</h2>
          <Link
            to="/student/tickets/new"
            className="mt-4 inline-block text-sm font-medium text-slate-900 hover:underline"
          >
            Submit new ticket →
          </Link>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Support Status</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-900">Active</h2>
          <p className="mt-4 text-sm text-slate-500">
            Our team will review your tickets and respond as soon as possible.
          </p>
        </div>
      </div>
    </div>
  );
}
