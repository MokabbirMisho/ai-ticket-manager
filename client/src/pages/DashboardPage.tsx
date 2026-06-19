import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/axios";
import { useAuth } from "../context/AuthContext";

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
  onboarding: TenantAdminOnboarding | null;
};

type TenantAdminOnboarding = {
  completeCompanyProfile: boolean;
  hasFirstAgent: boolean;
  hasFirstRequester: boolean;
  hasFirstKnowledgeArticle: boolean;
  hasFirstTicket: boolean;
};

export function DashboardPage() {
  const { user } = useAuth();
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

      {user?.role === "ADMIN" && data.onboarding && (
        <WorkspaceSetupCard onboarding={data.onboarding} />
      )}

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

function WorkspaceSetupCard({
  onboarding,
}: {
  onboarding: TenantAdminOnboarding;
}) {
  const items = [
    {
      key: "completeCompanyProfile",
      title: "Complete company profile",
      helperText:
        "Add workspace contact details so support communication is ready.",
      completed: onboarding.completeCompanyProfile,
      ctaLabel: "Coming soon",
      href: "",
      disabled: true,
    },
    {
      key: "hasFirstAgent",
      title: "Create first agent",
      helperText: "Invite a staff member who can manage assigned tickets.",
      completed: onboarding.hasFirstAgent,
      ctaLabel: "Go to Users",
      href: "/users",
      disabled: false,
    },
    {
      key: "hasFirstRequester",
      title: "Create first requester",
      helperText: "Add a requester account for support ticket submission.",
      completed: onboarding.hasFirstRequester,
      ctaLabel: "Go to Requesters",
      href: "/requesters",
      disabled: false,
    },
    {
      key: "hasFirstKnowledgeArticle",
      title: "Add first knowledge base article",
      helperText: "Give agents reusable answers for common support needs.",
      completed: onboarding.hasFirstKnowledgeArticle,
      ctaLabel: "Go to Knowledge",
      href: "/knowledge",
      disabled: false,
    },
    {
      key: "hasFirstTicket",
      title: "Create or review first support ticket",
      helperText: "Confirm the workspace ticket flow is working end to end.",
      completed: onboarding.hasFirstTicket,
      ctaLabel: "Go to Tickets",
      href: "/tickets",
      disabled: false,
    },
  ];

  const completedCount = items.filter((item) => item.completed).length;
  const progressPercent = Math.round((completedCount / items.length) * 100);
  const isComplete = completedCount === items.length;

  return (
    <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Workspace Setup</h2>
          <p className="mt-1 text-sm text-slate-500">
            Finish these steps to prepare your support workspace.
          </p>
        </div>

        <div className="min-w-40 text-left lg:text-right">
          <p className="text-sm font-semibold text-slate-900">
            {completedCount} of {items.length} completed
          </p>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-slate-900 transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {isComplete && (
        <div className="mt-5 rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
          Your workspace is ready. You can continue managing support tickets.
        </div>
      )}

      <div className="mt-5 grid gap-3 lg:grid-cols-5">
        {items.map((item) => (
          <div
            key={item.key}
            className="flex h-full flex-col rounded-xl border border-slate-200 bg-slate-50 p-4"
          >
            <div className="flex items-start gap-3">
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  item.completed
                    ? "bg-green-100 text-green-700"
                    : "bg-white text-slate-400"
                }`}
              >
                {item.completed ? "✓" : ""}
              </span>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  {item.title}
                </h3>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  {item.helperText}
                </p>
              </div>
            </div>

            <div className="mt-auto pt-4">
              {item.disabled ? (
                <button
                  type="button"
                  disabled
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-400"
                >
                  {item.ctaLabel}
                </button>
              ) : (
                <Link
                  to={item.href}
                  className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-center text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  {item.ctaLabel}
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
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
