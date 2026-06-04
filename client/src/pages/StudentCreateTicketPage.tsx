import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/axios";

export function StudentCreateTicketPage() {
  const navigate = useNavigate();

  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setError("");
      setIsSubmitting(true);

      await api.post("/student/tickets", {
        subject,
        description,
      });

      navigate("/student/tickets");
    } catch {
      setError("Failed to create ticket");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Create New Ticket</h1>
      <p className="mt-2 text-slate-500">
        Describe your issue clearly so the support team can help you faster.
      </p>

      <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
        {error && (
          <div className="mb-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Subject
            </label>
            <input
              data-testid="ticket-subject"
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-slate-900"
              placeholder="Example: Cannot access exam registration"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Description
            </label>
            <textarea
              data-testid="ticket-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={7}
              className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-slate-900"
              placeholder="Explain your problem in detail..."
            />
          </div>

          <button
            data-testid="submit-ticket-button"
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-slate-900 px-5 py-2 font-medium text-white disabled:opacity-60"
          >
            {isSubmitting ? "Submitting..." : "Submit Ticket"}
          </button>
        </form>
      </div>
    </div>
  );
}
