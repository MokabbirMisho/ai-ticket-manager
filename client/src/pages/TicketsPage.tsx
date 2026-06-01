import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/axios";
import { useAuth } from "../context/AuthContext";

type TicketStatus = "OPEN" | "RESOLVED" | "CLOSED";

type TicketCategory =
  | "GENERAL_QUESTION"
  | "TECHNICAL_QUESTION"
  | "REFUND_REQUEST";

type Ticket = {
  id: string;
  subject: string;
  description: string;
  status: TicketStatus;
  category: TicketCategory;
  aiSummary: string | null;
  aiReply: string | null;
  assignedAgentId: string | null;
  studentId?: string | null;
  createdAt: string;
  updatedAt: string;
  assignedAgent: {
    id: string;
    name: string;
    email: string;
    role: string;
  } | null;
  student?: {
    id: string;
    name: string;
    email: string;
  } | null;
};

export function TicketsPage() {
  const { user } = useAuth();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("newest");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const isAdmin = user?.role === "ADMIN";

  const fetchTickets = async () => {
    try {
      setIsLoading(true);
      setError("");

      const response = await api.get("/tickets", {
        params: {
          status: status || undefined,
          category: category || undefined,
          sort,
        },
      });

      setTickets(response.data.data.tickets);
    } catch {
      setError("Failed to load tickets");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [status, category, sort]);

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {isAdmin ? "All Tickets" : "My Assigned Tickets"}
          </h1>

          <p className="mt-2 text-slate-500">
            {isAdmin
              ? "View, filter, assign, and manage all support tickets."
              : "View and manage tickets assigned to you."}
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-2xl bg-white p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Status
            </label>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
            >
              <option value="">All statuses</option>
              <option value="OPEN">Open</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Category
            </label>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
            >
              <option value="">All categories</option>
              <option value="GENERAL_QUESTION">General Question</option>
              <option value="TECHNICAL_QUESTION">Technical Question</option>
              <option value="REFUND_REQUEST">Refund Request</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Sort
            </label>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          </div>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl bg-white shadow-sm">
        {isLoading && (
          <div className="p-6 text-sm text-slate-500">Loading tickets...</div>
        )}

        {error && <div className="p-6 text-sm text-red-600">{error}</div>}

        {!isLoading && !error && tickets.length === 0 && (
          <div className="p-6 text-sm text-slate-500">
            {isAdmin
              ? "No tickets found."
              : "No tickets are assigned to you yet."}
          </div>
        )}

        {!isLoading && !error && tickets.length > 0 && (
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-5 py-3 font-medium">Subject</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Category</th>
                <th className="px-5 py-3 font-medium">Student</th>
                <th className="px-5 py-3 font-medium">Assigned Agent</th>
                <th className="px-5 py-3 font-medium">Created</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {tickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-slate-50">
                  <td className="px-5 py-4">
                    <Link to={`/tickets/${ticket.id}`} className="block">
                      <div className="font-medium text-slate-900 hover:underline">
                        {ticket.subject}
                      </div>
                      <div className="mt-1 line-clamp-1 text-slate-500">
                        {ticket.description}
                      </div>
                    </Link>
                  </td>

                  <td className="px-5 py-4">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                      {ticket.status}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-slate-600">
                    {ticket.category}
                  </td>

                  <td className="px-5 py-4 text-slate-600">
                    {ticket.student?.name || "Manual Ticket"}
                  </td>

                  <td className="px-5 py-4 text-slate-600">
                    {ticket.assignedAgent?.name || "Unassigned"}
                  </td>

                  <td className="px-5 py-4 text-slate-500">
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
