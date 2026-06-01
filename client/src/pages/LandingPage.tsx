import { Link } from "react-router-dom";

export function LandingPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div>
          <h1 className="text-xl font-bold">AI Ticket Management</h1>
          <p className="text-sm text-slate-400">Student Support Platform</p>
        </div>

        <div className="flex gap-3">
          <Link
            to="/student/login"
            className="text-sm text-slate-300 hover:text-white"
          >
            Student Login
          </Link>
          <Link
            to="/admin/login"
            className="text-sm text-slate-300 hover:text-white"
          >
            Staff Login
          </Link>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl gap-10 px-6 py-20 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="mb-4 inline-block rounded-full bg-white/10 px-4 py-2 text-sm text-slate-300">
            AI-powered student support
          </p>

          <h2 className="text-5xl font-bold leading-tight">
            Resolve student support tickets faster with AI.
          </h2>

          <p className="mt-6 text-lg text-slate-300">
            Students submit support requests, AI classifies and summarizes them,
            admins assign tickets, and agents respond faster with AI-generated
            suggestions.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              to="/student/register"
              className="rounded-lg bg-white px-5 py-3 font-medium text-slate-950"
            >
              Create Student Account
            </Link>

            <Link
              to="/student/login"
              className="rounded-lg border border-white/20 px-5 py-3 font-medium text-white"
            >
              Student Login
            </Link>

            <Link
              to="/admin/login"
              className="rounded-lg border border-white/20 px-5 py-3 font-medium text-white"
            >
              Staff Login
            </Link>
          </div>
        </div>

        <div className="rounded-3xl bg-white p-6 text-slate-900 shadow-2xl">
          <h3 className="text-xl font-bold">How it works</h3>

          <div className="mt-6 space-y-4">
            {[
              "Student creates a ticket",
              "AI classifies and summarizes the issue",
              "Admin assigns the ticket to an agent",
              "Agent reviews and responds with AI assistance",
              "Student tracks status and support response",
            ].map((item, index) => (
              <div
                key={item}
                className="flex gap-4 rounded-2xl bg-slate-50 p-4"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
                  {index + 1}
                </div>
                <p className="font-medium text-slate-800">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="grid gap-6 md:grid-cols-3">
          <Feature
            title="AI Classification"
            text="Automatically categorize support tickets."
          />
          <Feature
            title="AI Summaries"
            text="Help agents understand issues faster."
          />
          <Feature
            title="AI Suggested Replies"
            text="Generate human-friendly support responses."
          />
        </div>
      </section>
    </main>
  );
}

function Feature({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl bg-white/10 p-6">
      <h3 className="text-lg font-bold">{title}</h3>
      <p className="mt-2 text-sm text-slate-300">{text}</p>
    </div>
  );
}
