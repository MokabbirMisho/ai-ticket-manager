import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/axios";

type Ticket = {
  id: string;
  subject: string;
  description: string;
  status: "OPEN" | "RESOLVED" | "CLOSED";
  category: string;
  aiReply: string | null;
  createdAt: string;
  updatedAt: string;
};

export function StudentTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchTickets = async () => {
    try {
      setIsLoading(true);
      setError("");

      const response = await api.get("/student/tickets");
      setTickets(response.data.data.tickets);
    } catch {
      setError("Failed to load your tickets");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Tickets</h1>
          <p className="mt-2 text-slate-500">
            Track your submitted support requests.
          </p>
        </div>

        <Link
          to="/student/tickets/new"
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white"
        >
          New Ticket
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl bg-white shadow-sm">
        {isLoading && (
          <div className="p-6 text-sm text-slate-500">Loading tickets...</div>
        )}

        {error && <div className="p-6 text-sm text-red-600">{error}</div>}

        {!isLoading && !error && tickets.length === 0 && (
          <div className="p-6 text-sm text-slate-500">
            You have not submitted any tickets yet.
          </div>
        )}

        {!isLoading && !error && tickets.length > 0 && (
          <div className="divide-y divide-slate-100">
            {tickets.map((ticket) => (
              <Link
                key={ticket.id}
                data-testid="ticket-row"
                to={`/student/tickets/${ticket.id}`}
                className="block p-5 hover:bg-slate-50"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-semibold text-slate-900">
                      {ticket.subject}
                    </h2>
                    <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                      {ticket.description}
                    </p>

                    <p className="mt-3 text-xs text-slate-400">
                      Created: {new Date(ticket.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                      {ticket.status}
                    </span>

                    <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-medium text-slate-500">
                      {ticket.category}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
