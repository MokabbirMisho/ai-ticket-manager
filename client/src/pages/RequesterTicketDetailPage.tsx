import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api/axios";

type Ticket = {
  id: string;
  subject: string;
  description: string;
  status: "OPEN" | "RESOLVED" | "CLOSED";
  category: string;
  aiSummary: string | null;
  aiReply: string | null;
  createdAt: string;
  updatedAt: string;
  assignedAgent: {
    id: string;
    name: string;
    email: string;
  } | null;
};

export function RequesterTicketDetailPage() {
  const { id } = useParams();

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchTicket = async () => {
    try {
      setIsLoading(true);
      setError("");

      const response = await api.get(`/requester/tickets/${id}`);
      setTicket(response.data.data.ticket);
    } catch {
      setError("Failed to load ticket");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTicket();
  }, [id]);

  if (isLoading) {
    return <div className="text-sm text-slate-500">Loading ticket...</div>;
  }

  if (error) {
    return <div className="text-sm text-red-600">{error}</div>;
  }

  if (!ticket) {
    return <div className="text-sm text-slate-500">Ticket not found.</div>;
  }

  return (
    <div>
      <Link
        to="/requester/tickets"
        className="text-sm font-medium text-slate-600 hover:text-slate-900"
      >
        ← Back to my tickets
      </Link>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  {ticket.subject}
                </h1>
                <p className="mt-2 text-sm text-slate-500">
                  Submitted on {new Date(ticket.createdAt).toLocaleString()}
                </p>
              </div>

              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                {ticket.status}
              </span>
            </div>

            <div className="mt-6">
              <h2 className="text-sm font-semibold text-slate-900">
                Your Message
              </h2>
              <p className="mt-2 whitespace-pre-line text-slate-600">
                {ticket.description}
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">
              Support Response
            </h2>

            {ticket.aiReply ? (
              <p className="mt-3 whitespace-pre-line text-slate-600">
                {ticket.aiReply}
              </p>
            ) : (
              <p className="mt-3 text-slate-500">
                No response yet. Our support team is reviewing your ticket.
              </p>
            )}
          </div>
        </section>

        <aside>
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">
              Ticket Information
            </h2>

            <div className="mt-5 space-y-4">
              <InfoRow label="Status" value={ticket.status} />
              <InfoRow label="Category" value={ticket.category} />
              <InfoRow
                label="Assigned Agent"
                value={ticket.assignedAgent?.name || "Not assigned yet"}
              />
              <InfoRow
                label="Last Updated"
                value={new Date(ticket.updatedAt).toLocaleString()}
              />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <p className="text-xs font-medium uppercase text-slate-500">{label}</p>
      <p className="mt-1 font-medium text-slate-900">{value}</p>
    </div>
  );
}
