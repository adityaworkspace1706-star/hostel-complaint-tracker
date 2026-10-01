import { Link } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  Building2,
  ClipboardList,
  FilePlus2,
  LayoutDashboard,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { Navbar } from '../components/Layout/Navbar.jsx';
import { Footer } from '../components/Layout/Footer.jsx';
import { StatusBadge } from '../components/ui/StatusBadge.jsx';
import { PriorityBadge } from '../components/ui/PriorityBadge.jsx';

const FEATURES = [
  {
    icon: FilePlus2,
    title: 'Easy Complaint Reporting',
    description:
      'Pick a category and a specific issue from predefined lists — no free-text guessing. An optional photo makes it even clearer.',
  },
  {
    icon: Activity,
    title: 'Real-Time Status Tracking',
    description:
      'Every complaint moves through a transparent pipeline — pending, in progress, resolved — with manager comments at each step.',
  },
  {
    icon: LayoutDashboard,
    title: 'Manager Dashboard',
    description:
      'A command center for wardens and managers: filter, assign, escalate and resolve everything from one clean interface.',
  },
  {
    icon: Zap,
    title: 'Faster Resolution',
    description:
      'Critical issues like blocked toilets and broken lifts are flagged automatically, so urgent problems jump the queue.',
  },
];

const STEPS = [
  { icon: MessageSquare, title: 'Report', description: 'Describe the issue in under a minute. Priority is assigned automatically.' },
  { icon: ClipboardList, title: 'Track', description: 'Follow your complaint from pending to resolved with live status updates.' },
  { icon: ShieldCheck, title: 'Resolve', description: 'The manager assigns staff, adds updates, and closes the loop when fixed.' },
];

const PREVIEW_COMPLAINTS = [
  { id: 'CMP-0006', issue: 'Lift not working', category: 'Common Facilities', status: 'in_progress', priority: 'critical' },
  { id: 'CMP-0008', issue: 'No water supply', category: 'Plumbing', status: 'pending', priority: 'high' },
  { id: 'CMP-0003', issue: 'AC not working', category: 'Electrical', status: 'resolved', priority: 'high' },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* ---------------- Hero ---------------- */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-indigo-200/40 blur-3xl" />
          <div className="absolute top-40 right-0 h-80 w-80 rounded-full bg-violet-200/40 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 pt-16 pb-20 sm:px-6 lg:grid lg:grid-cols-2 lg:items-center lg:gap-12 lg:pt-24 lg:pb-28">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3.5 py-1.5 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-600/15">
              <Sparkles className="h-3.5 w-3.5" />
              Built for hostels &amp; college residences
            </span>
            <h1 className="mt-5 text-4xl leading-tight font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-[3.4rem]">
              Hostel complaints,{' '}
              <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                handled better.
              </span>
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-500">
              Report hostel issues, track their progress, and get problems resolved faster.
              No more chasing the warden with sticky notes.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:bg-indigo-500"
              >
                Get started — it&apos;s free <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center rounded-xl bg-white px-6 py-3 text-sm font-semibold text-slate-700 ring-1 ring-inset ring-slate-200 transition hover:bg-slate-50"
              >
                Login
              </Link>
            </div>

            <dl className="mt-10 grid max-w-md grid-cols-3 gap-6 border-t border-slate-200/80 pt-8">
              {[
                ['< 1 min', 'average report time'],
                ['4 steps', 'from report to resolve'],
                ['100%', 'visible tracking'],
              ].map(([value, label]) => (
                <div key={label}>
                  <dt className="text-xl font-bold text-slate-900">{value}</dt>
                  <dd className="mt-0.5 text-xs text-slate-400">{label}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Hero preview card */}
          <div className="relative mt-14 lg:mt-0">
            <div className="animate-fade-in-up rounded-3xl bg-white p-5 shadow-2xl shadow-indigo-900/10 ring-1 ring-slate-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <p className="text-sm font-bold text-slate-900">Live complaints</p>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> 12 open
                </span>
              </div>
              <ul className="mt-3 space-y-2.5">
                {PREVIEW_COMPLAINTS.map((c) => (
                  <li
                    key={c.id}
                    className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-4 py-3 ring-1 ring-slate-100"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-800">{c.issue}</p>
                      <p className="text-xs text-slate-400">
                        {c.id} · {c.category}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <StatusBadge status={c.status} />
                      <PriorityBadge priority={c.priority} />
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-3">
                <TrendingUp className="h-4 w-4 text-white" />
                <p className="text-xs font-semibold text-white">
                  Resolved 92% of complaints within 48 hours
                </p>
              </div>
            </div>

            {/* floating chip */}
            <div className="absolute -top-4 -right-3 hidden rotate-3 rounded-2xl bg-slate-900 px-4 py-3 shadow-xl sm:block">
              <p className="text-[11px] font-medium text-slate-400">Auto-priority</p>
              <p className="text-sm font-bold text-amber-400">Lift not working → Critical</p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- About ---------------- */}
      <section id="about" className="scroll-mt-20 border-t border-slate-100 bg-slate-50/60 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              A simple system for a busy hostel
            </h2>
            <p className="mt-4 text-lg text-slate-500">
              Students need problems fixed. Managers need visibility. HostelCare connects the
              two with structured complaints, automatic prioritization and full transparency.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                icon: Building2,
                title: 'For students',
                body: 'Report exactly what is broken from a predefined list and watch the status change as it gets fixed.',
              },
              {
                icon: LayoutDashboard,
                title: 'For managers',
                body: 'See every complaint across every block, triage by priority, assign staff, and respond with comments.',
              },
              {
                icon: TrendingUp,
                title: 'For administration',
                body: 'Analytics reveal which problems keep coming back — so you can fix the root cause, not just today’s symptom.',
              },
            ].map((card) => (
              <div key={card.title} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/70">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50">
                  <card.icon className="h-5 w-5 text-indigo-600" />
                </span>
                <h3 className="mt-4 text-base font-semibold text-slate-900">{card.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{card.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- Features ---------------- */}
      <section id="features" className="scroll-mt-20 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Everything you need to get things fixed
            </h2>
            <p className="mt-4 text-lg text-slate-500">
              A focused set of features that covers the entire complaint lifecycle.
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/70 transition duration-200 hover:-translate-y-1 hover:shadow-lg hover:ring-indigo-200"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600/10 text-indigo-600 transition group-hover:bg-indigo-600 group-hover:text-white">
                  <feature.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-base font-semibold text-slate-900">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- How it works ---------------- */}
      <section className="border-t border-slate-100 bg-slate-50/60 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              How it works
            </h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {STEPS.map((step, i) => (
              <div key={step.title} className="relative rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/70">
                <span className="absolute top-6 right-6 text-4xl font-extrabold text-slate-100">
                  {i + 1}
                </span>
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white">
                  <step.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-base font-semibold text-slate-900">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- CTA ---------------- */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-600 to-violet-700 px-6 py-14 text-center sm:px-12">
            <div className="pointer-events-none absolute -top-16 -right-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" aria-hidden="true" />
            <div className="pointer-events-none absolute -bottom-20 -left-10 h-64 w-64 rounded-full bg-violet-400/20 blur-2xl" aria-hidden="true" />
            <h2 className="relative text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Your hostel&apos;s next complaint is 30 seconds away
            </h2>
            <p className="relative mx-auto mt-4 max-w-xl text-indigo-100">
              Join the students who stop chasing and start tracking. Create a free student
              account and report your first issue today.
            </p>
            <div className="relative mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/register"
                className="rounded-xl bg-white px-6 py-3 text-sm font-semibold text-indigo-700 shadow-lg transition hover:bg-indigo-50"
              >
                Create student account
              </Link>
              <Link
                to="/login"
                className="rounded-xl px-6 py-3 text-sm font-semibold text-white ring-1 ring-inset ring-white/40 transition hover:bg-white/10"
              >
                Login
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
