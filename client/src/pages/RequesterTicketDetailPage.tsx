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

type TicketMessage = {
  id: string;
  ticketId: string;
  senderType: "REQUESTER" | "STAFF";
  senderDisplayName: string;
  senderEmail: string | null;
  message: string;
  createdAt: string;
};

export function RequesterTicketDetailPage() {
  const { id } = useParams();

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [replyMessage, setReplyMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchTicket = async () => {
    const response = await api.get(`/requester/tickets/${id}`);
    setTicket(response.data.data.ticket);
  };

  const fetchMessages = async () => {
    const response = await api.get(`/requester/tickets/${id}/messages`);
    setMessages(response.data.data.messages);
  };

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError("");

      await Promise.all([fetchTicket(), fetchMessages()]);
    } catch {
      setError("Failed to load ticket");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleSendReply = async () => {
    if (!replyMessage.trim()) {
      setError("Reply message is required");
      return;
    }

    try {
      setIsSendingReply(true);
      setError("");
      setSuccess("");

      const response = await api.post(`/requester/tickets/${id}/messages`, {
        message: replyMessage,
      });

      setMessages((current) => [...current, response.data.data.message]);
      setReplyMessage("");
      setSuccess("Your reply has been sent successfully.");
    } catch {
      setError("Failed to send reply");
    } finally {
      setIsSendingReply(false);
    }
  };

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

      {success && (
        <div className="mt-5 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
          {success}
        </div>
      )}

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

          <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Conversation
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Messages between you and the support team.
              </p>
            </div>

            <MessageList messages={messages} />

            <div className="mt-5">
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Reply
              </label>
              <textarea
                value={replyMessage}
                onChange={(event) => setReplyMessage(event.target.value)}
                rows={5}
                maxLength={5000}
                placeholder="Write a reply to the support team..."
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
              />
              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={handleSendReply}
                  disabled={isSendingReply}
                  className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                >
                  {isSendingReply ? "Sending..." : "Send Reply"}
                </button>
              </div>
            </div>
          </section>
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

function MessageList({ messages }: { messages: TicketMessage[] }) {
  if (messages.length === 0) {
    return (
      <div className="mt-5 rounded-xl bg-slate-50 px-4 py-5 text-sm text-slate-500">
        No replies yet.
      </div>
    );
  }

  return (
    <div className="mt-5 space-y-3">
      {messages.map((message) => (
        <article
          key={message.id}
          className="rounded-xl border border-slate-200 bg-slate-50 p-4"
        >
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="font-medium text-slate-900">
                {message.senderDisplayName}
              </span>
              <span className="ml-2 rounded-full bg-white px-2 py-1 text-xs font-medium text-slate-600">
                {message.senderType === "STAFF" ? "Staff" : "Requester"}
              </span>
            </div>
            <time className="text-xs text-slate-500">
              {new Date(message.createdAt).toLocaleString()}
            </time>
          </div>
          <p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-700">
            {message.message}
          </p>
        </article>
      ))}
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
