import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/axios";

type RecentTicket = {
  id: string;
  subject: string;
  status: string;
  category: string;
  createdAt: string;
  assignedAgent: {
    id: string;
    name: string;
    email: string;
  } | null;
};

type DashboardData = {
  stats: {
    totalTickets: number;
    openTickets: number;
    resolvedTickets: number;
    closedTickets: number;
    totalAgents: number;
  };
  categories: {
    generalQuestions: number;
    technicalQuestions: number;
    refundRequests: number;
  };
  recentTickets: RecentTicket[];
};

export function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboardStats = async () => {
    try {
      setIsLoading(true);
      setError("");

      const response = await api.get("/dashboard/stats");
      setData(response.data.data);
    } catch {
      setError("Failed to load dashboard statistics");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  if (isLoading) {
    return <div className="text-sm text-slate-500">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="text-sm text-red-600">{error}</div>;
  }

  if (!data) {
    return (
      <div className="text-sm text-slate-500">No dashboard data found.</div>
    );
  }

  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-2 text-slate-500">
          Overview of ticket activity and support performance.
        </p>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-5">
        <StatCard label="Total Tickets" value={data.stats.totalTickets} />
        <StatCard label="Open Tickets" value={data.stats.openTickets} />
        <StatCard label="Resolved Tickets" value={data.stats.resolvedTickets} />
        <StatCard label="Closed Tickets" value={data.stats.closedTickets} />
        <StatCard label="Active Agents" value={data.stats.totalAgents} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">
            Tickets by Category
          </h2>

          <div className="mt-5 space-y-4">
            <CategoryRow
              label="General Question"
              value={data.categories.generalQuestions}
            />
            <CategoryRow
              label="Technical Question"
              value={data.categories.technicalQuestions}
            />
            <CategoryRow
              label="Refund Request"
              value={data.categories.refundRequests}
            />
          </div>
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Recent Tickets</h2>
            <Link
              to="/tickets"
              className="text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              View all
            </Link>
          </div>

          <div className="mt-5 divide-y divide-slate-100">
            {data.recentTickets.length === 0 && (
              <p className="text-sm text-slate-500">No recent tickets.</p>
            )}

            {data.recentTickets.map((ticket) => (
              <Link
                key={ticket.id}
                to={`/tickets/${ticket.id}`}
                className="block py-4 hover:bg-slate-50"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="font-medium text-slate-900">
                      {ticket.subject}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {ticket.category} ·{" "}
                      {ticket.assignedAgent?.name || "Unassigned"}
                    </p>
                  </div>

                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                    {ticket.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <h2 className="mt-2 text-3xl font-bold text-slate-900">{value}</h2>
    </div>
  );
}

function CategoryRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <span className="text-lg font-bold text-slate-900">{value}</span>
    </div>
  );
}
