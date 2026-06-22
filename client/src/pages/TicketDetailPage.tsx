import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api/axios";
import { useAuth } from "../context/AuthContext";

type TicketStatus = "OPEN" | "RESOLVED" | "CLOSED";

type User = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "AGENT";
  isActive: boolean;
};

type Ticket = {
  id: string;
  subject: string;
  description: string;
  status: TicketStatus;
  category: string;
  aiSummary: string | null;
  aiReply: string | null;
  assignedAgentId: string | null;
  createdAt: string;
  updatedAt: string;
  assignedAgent: User | null;
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

export function TicketDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [agents, setAgents] = useState<User[]>([]);
  const [status, setStatus] = useState<TicketStatus>("OPEN");
  const [assignedAgentId, setAssignedAgentId] = useState("");
  const [replyMessage, setReplyMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [aiLoading, setAiLoading] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const isAdmin = user?.role === "ADMIN";

  const fetchTicket = async () => {
    const response = await api.get(`/tickets/${id}`);
    const ticketData = response.data.data.ticket;

    setTicket(ticketData);
    setStatus(ticketData.status);
    setAssignedAgentId(ticketData.assignedAgentId || "");
  };

  const fetchAgents = async () => {
    const response = await api.get("/users");
    const activeAgents = response.data.data.users.filter(
      (user: User) => user.role === "AGENT" && user.isActive,
    );

    setAgents(activeAgents);
  };

  const fetchMessages = async () => {
    const response = await api.get(`/tickets/${id}/messages`);
    setMessages(response.data.data.messages);
  };

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError("");

      if (isAdmin) {
        await Promise.all([fetchTicket(), fetchAgents(), fetchMessages()]);
      } else {
        await Promise.all([fetchTicket(), fetchMessages()]);
      }
    } catch {
      setError("Failed to load ticket details");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id, isAdmin]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError("");
      setSuccess("");

      const didStatusChange = ticket?.status !== status;
      const didAssignmentChange =
        (ticket?.assignedAgentId || "") !== assignedAgentId;

      const response = await api.patch(
        `/tickets/${id}`,
        isAdmin
          ? {
              status,
              assignedAgentId: assignedAgentId || null,
            }
          : {
              status,
            },
      );

      setTicket(response.data.data.ticket);
      setSuccess(
        didAssignmentChange && !didStatusChange
          ? "Ticket assigned successfully."
          : "Ticket status updated successfully.",
      );
    } catch {
      setError("Failed to update ticket");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendReply = async () => {
    if (!replyMessage.trim()) {
      setError("Reply message is required");
      return;
    }

    try {
      setIsSendingReply(true);
      setError("");
      setSuccess("");

      const response = await api.post(`/tickets/${id}/messages`, {
        message: replyMessage,
      });

      setMessages((current) => [...current, response.data.data.message]);
      setReplyMessage("");
      setSuccess("Reply sent successfully.");
    } catch {
      setError("Failed to send reply");
    } finally {
      setIsSendingReply(false);
    }
  };

  const useAiReplyAsDraft = () => {
    if (ticket?.aiReply) {
      setReplyMessage(ticket.aiReply);
      setSuccess("AI reply copied to draft.");
    }
  };

  const handleGenerateSummary = async () => {
    try {
      setAiLoading("summary");
      setError("");

      const response = await api.post(`/ai/summary/${id}`);
      setTicket(response.data.data.ticket);
    } catch {
      setError("Failed to generate AI summary");
    } finally {
      setAiLoading("");
    }
  };

  const handleGenerateReply = async () => {
    try {
      setAiLoading("reply");
      setError("");

      const response = await api.post(`/ai/reply/${id}`);
      setTicket(response.data.data.ticket);
    } catch {
      setError("Failed to generate AI reply");
    } finally {
      setAiLoading("");
    }
  };

  const handleClassifyTicket = async () => {
    try {
      setAiLoading("classify");
      setError("");

      const response = await api.post(`/ai/classify/${id}`);
      const updatedTicket = response.data.data.ticket;

      setTicket(updatedTicket);
    } catch {
      setError("Failed to classify ticket");
    } finally {
      setAiLoading("");
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
      <Link to="/tickets" className="text-sm font-medium text-slate-600">
        ← Back to tickets
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
                  Created on {new Date(ticket.createdAt).toLocaleString()}
                </p>
              </div>

              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                {ticket.status}
              </span>
            </div>

            <div className="mt-6">
              <h2 className="text-sm font-semibold text-slate-900">
                Description
              </h2>
              <p className="mt-2 whitespace-pre-line text-slate-600">
                {ticket.description}
              </p>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase text-slate-500">
                  Category
                </p>
                <p className="mt-1 font-medium text-slate-900">
                  {ticket.category}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase text-slate-500">
                  Assigned Agent
                </p>
                <p className="mt-1 font-medium text-slate-900">
                  {ticket.assignedAgent?.name || "Unassigned"}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-bold text-slate-900">AI Summary</h2>

              <button
                onClick={handleGenerateSummary}
                disabled={aiLoading === "summary"}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
              >
                {aiLoading === "summary" ? "Generating..." : "Generate Summary"}
              </button>
            </div>

            <p className="mt-3 whitespace-pre-line text-slate-600">
              {ticket.aiSummary || "AI summary will appear here later."}
            </p>
          </div>

          <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-bold text-slate-900">
                AI Suggested Reply
              </h2>

              <button
                onClick={handleGenerateReply}
                disabled={aiLoading === "reply"}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
              >
                {aiLoading === "reply" ? "Generating..." : "Generate Reply"}
              </button>
            </div>

            <p className="mt-3 whitespace-pre-line text-slate-600">
              {ticket.aiReply || "AI suggested reply will appear here later."}
            </p>
          </div>

          <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Conversation
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Messages between your team and the requester.
                </p>
              </div>

              {ticket.aiReply && (
                <button
                  type="button"
                  onClick={useAiReplyAsDraft}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Use AI reply as draft
                </button>
              )}
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
                placeholder="Write a reply to the requester..."
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

        <aside className="space-y-6">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">Manage Ticket</h2>

            <div className="mt-5 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(event) =>
                    setStatus(event.target.value as TicketStatus)
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
                >
                  <option value="OPEN">Open</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="CLOSED">Closed</option>
                </select>
              </div>

              {isAdmin && (
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Assign Agent
                  </label>
                  <select
                    value={assignedAgentId}
                    onChange={(event) => setAssignedAgentId(event.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
                  >
                    <option value="">Unassigned</option>
                    {agents.map((agent) => (
                      <option key={agent.id} value={agent.id}>
                        {agent.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">AI Actions</h2>
            <p className="mt-2 text-sm text-slate-500">
              Use AI to classify, summarize, and prepare a suggested reply.
            </p>

            <div className="mt-5 space-y-3">
              <button
                onClick={handleClassifyTicket}
                disabled={aiLoading === "classify"}
                className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
              >
                {aiLoading === "classify"
                  ? "Classifying..."
                  : "Classify Ticket"}
              </button>

              <button
                onClick={handleGenerateSummary}
                disabled={aiLoading === "summary"}
                className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
              >
                {aiLoading === "summary"
                  ? "Generating Summary..."
                  : "Generate Summary"}
              </button>

              <button
                onClick={handleGenerateReply}
                disabled={aiLoading === "reply"}
                className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
              >
                {aiLoading === "reply"
                  ? "Generating Reply..."
                  : "Generate Reply"}
              </button>
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
