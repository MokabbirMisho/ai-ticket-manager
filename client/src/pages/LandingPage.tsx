import { Link } from "react-router-dom";

export function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 text-slate-900">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-sm font-bold text-white">
            AI
          </div>
          <div>
            <h1 className="text-lg font-bold">AI Ticket Management</h1>
            <p className="text-sm text-slate-500">Student Support Platform</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <a
            href="#features"
            className="text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            Features
          </a>
          <a
            href="#workflow"
            className="text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            Workflow
          </a>
          <a
            href="#contact"
            className="text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            Contact
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            to="/student/login"
            className="hidden rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 sm:inline-block"
          >
            Student Login
          </Link>

          <Link
            to="/admin/login"
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
          >
            Staff Login
          </Link>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-2 lg:items-center">
        <div>
          <div className="mb-5 inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm">
            AI-powered helpdesk for student support
          </div>

          <h2 className="max-w-3xl text-5xl font-bold tracking-tight text-slate-950 md:text-6xl">
            Resolve student support requests faster with AI.
          </h2>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            A complete ticket management system where students submit issues,
            admins assign tickets, agents respond faster, and AI helps classify,
            summarize, and generate professional replies.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              to="/student/register"
              className="rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 hover:bg-slate-800"
            >
              Create Student Account
            </Link>

            <Link
              to="/student/login"
              className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
            >
              Student Login
            </Link>
          </div>

          <div className="mt-10 grid max-w-xl grid-cols-3 gap-4">
            <Stat value="AI" label="Ticket Analysis" />
            <Stat value="3" label="User Roles" />
            <Stat value="24/7" label="Support Flow" />
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-r from-slate-200 to-blue-100 blur-2xl" />

          <div className="relative rounded-[2rem] border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-200">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900">Live Ticket Flow</h3>
                <p className="text-sm text-slate-500">
                  Student support workflow
                </p>
              </div>
              <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                Active
              </span>
            </div>

            <div className="space-y-4">
              <FlowItem
                number="1"
                title="Student submits ticket"
                text="Login issue, refund request, exam registration problem."
              />
              <FlowItem
                number="2"
                title="AI analyzes the issue"
                text="Classifies, summarizes, and prepares a suggested reply."
              />
              <FlowItem
                number="3"
                title="Admin assigns agent"
                text="The right support agent receives the ticket."
              />
              <FlowItem
                number="4"
                title="Agent resolves ticket"
                text="Agent reviews AI suggestions and updates the status."
              />
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-6 py-16">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-bold text-slate-950">
            Everything needed for a modern support workflow
          </h2>
          <p className="mt-3 text-slate-600">
            Built for students, admins, and support agents with AI assistance at
            the center.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <Feature
            title="Student Portal"
            text="Students can register, create tickets, track status, and view support responses."
          />
          <Feature
            title="Admin Dashboard"
            text="Admins can manage agents, view all tickets, assign work, and monitor activity."
          />
          <Feature
            title="Agent Workflow"
            text="Agents see assigned tickets only and can update status with AI support."
          />
          <Feature
            title="AI Classification"
            text="Tickets are categorized automatically based on the issue."
          />
          <Feature
            title="AI Summaries"
            text="Long student messages are summarized for faster review."
          />
          <Feature
            title="AI Suggested Replies"
            text="Generate professional responses that agents can review before sending."
          />
        </div>
      </section>

      <section id="workflow" className="mx-auto max-w-7xl px-6 py-16">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-3xl font-bold text-slate-950">
            How the workflow works
          </h2>

          <div className="mt-8 grid gap-4 md:grid-cols-5">
            {[
              "Student creates ticket",
              "AI classifies issue",
              "Admin assigns agent",
              "Agent responds",
              "Student tracks result",
            ].map((item, index) => (
              <div key={item} className="rounded-2xl bg-slate-50 p-5">
                <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
                  {index + 1}
                </div>
                <p className="text-sm font-semibold text-slate-800">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="mx-auto max-w-7xl px-6 py-16">
        <div className="rounded-[2rem] bg-slate-900 p-8 text-white md:p-12">
          <div className="grid gap-8 md:grid-cols-2 md:items-center">
            <div>
              <h2 className="text-3xl font-bold">Ready to test the system?</h2>
              <p className="mt-3 text-slate-300">
                Start as a student and submit a support ticket, or login as
                staff to manage requests.
              </p>
            </div>

            <div className="flex flex-wrap gap-4 md:justify-end">
              <Link
                to="/student/register"
                className="rounded-xl bg-white px-6 py-3 text-sm font-semibold text-slate-900"
              >
                Student Register
              </Link>

              <Link
                to="/admin/login"
                className="rounded-xl border border-white/20 px-6 py-3 text-sm font-semibold text-white"
              >
                Staff Login
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 px-6 py-8">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 text-sm text-slate-500 md:flex-row">
          <p>© 2026 AI Ticket Management System</p>
          <p>Built with React, Node.js, PostgreSQL, Prisma, and OpenAI</p>
        </div>
      </footer>
    </main>
  );
}

function Feature({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-bold text-slate-950">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
    </div>
  );
}

function FlowItem({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="flex gap-4 rounded-2xl bg-slate-50 p-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
        {number}
      </div>

      <div>
        <h4 className="font-semibold text-slate-900">{title}</h4>
        <p className="mt-1 text-sm text-slate-500">{text}</p>
      </div>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xl font-bold text-slate-950">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{label}</p>
    </div>
  );
}
