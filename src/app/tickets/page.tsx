import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { listTickets } from "@/lib/tickets";
import {
  PlusCircle,
  Clock,
  ArrowRight,
  User,
  Monitor,
  Code,
  Wifi,
  Key,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  Hourglass,
  Lock,
} from "lucide-react";

function getCategoryIcon(category: string) {
  switch (category) {
    case "Hardware":
      return <Monitor className="w-3.5 h-3.5 text-blue-500" />;
    case "Software":
      return <Code className="w-3.5 h-3.5 text-indigo-500" />;
    case "Network":
      return <Wifi className="w-3.5 h-3.5 text-cyan-500" />;
    case "Access":
      return <Key className="w-3.5 h-3.5 text-amber-500" />;
    default:
      return <HelpCircle className="w-3.5 h-3.5 text-slate-500" />;
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case "Open":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-700 border border-blue-500/20 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          Open
        </span>
      );
    case "In Progress":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-700 border border-amber-500/20 shadow-sm">
          <Hourglass className="w-3 h-3 text-amber-500 animate-spin" style={{ animationDuration: "3s" }} />
          In Progress
        </span>
      );
    case "Resolved":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 shadow-sm">
          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
          Resolved
        </span>
      );
    case "Closed":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-600 border border-slate-500/20">
          <Lock className="w-3 h-3 text-slate-500" />
          Closed
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
          {status}
        </span>
      );
  }
}

function getPriorityBadge(priority: string) {
  switch (priority) {
    case "High":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-700 border border-rose-500/20">
          <AlertCircle className="w-3 h-3 text-rose-500" />
          High
        </span>
      );
    case "Medium":
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-orange-500/10 text-orange-700 border border-orange-500/20">
          Medium
        </span>
      );
    case "Low":
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-slate-500/10 text-slate-600 border border-slate-500/20">
          Low
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">
          {priority}
        </span>
      );
  }
}

export default async function TicketsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const tickets = await listTickets(user);

  // Quick stats
  const totalCount = tickets.length;
  const openCount = tickets.filter((t) => t.status === "Open").length;
  const inProgressCount = tickets.filter((t) => t.status === "In Progress").length;
  const resolvedCount = tickets.filter((t) => t.status === "Resolved").length;
  const closedCount = tickets.filter((t) => t.status === "Closed").length;

  return (
    <div className="space-y-8">
      {/* Header & Stats Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            {user.role === "support" ? "Support Ticket Operations" : "My Support Tickets"}
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            {user.role === "support"
              ? "Comprehensive overview of all IT requests across company departments."
              : "Track and manage your submitted IT service requests."}
          </p>
        </div>

        {user.role === "employee" && (
          <Link
            href="/tickets/new"
            className="inline-flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-95 transition-all duration-200"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New Ticket</span>
          </Link>
        )}
      </div>

      {/* Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="glass-card rounded-2xl p-4 border border-white/60">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{totalCount}</div>
        </div>
        <div className="glass-card rounded-2xl p-4 border border-blue-500/20 bg-blue-50/30">
          <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Open</div>
          <div className="text-2xl font-black text-blue-700 mt-1">{openCount}</div>
        </div>
        <div className="glass-card rounded-2xl p-4 border border-amber-500/20 bg-amber-50/30">
          <div className="text-xs font-semibold text-amber-600 uppercase tracking-wider">In Progress</div>
          <div className="text-2xl font-black text-amber-700 mt-1">{inProgressCount}</div>
        </div>
        <div className="glass-card rounded-2xl p-4 border border-emerald-500/20 bg-emerald-50/30">
          <div className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Resolved</div>
          <div className="text-2xl font-black text-emerald-700 mt-1">{resolvedCount}</div>
        </div>
        <div className="glass-card rounded-2xl p-4 border border-slate-300/40 bg-slate-50/40 col-span-2 sm:col-span-1">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Closed</div>
          <div className="text-2xl font-black text-slate-600 mt-1">{closedCount}</div>
        </div>
      </div>

      {/* Main Glass Table View */}
      <div className="glass-panel rounded-3xl overflow-hidden border border-white/80 shadow-xl">
        {tickets.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-3">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">No support tickets found</h3>
            <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
              {user.role === "employee"
                ? "You currently have no open or past tickets. If you need IT assistance, submit a new ticket."
                : "The system currently has no submitted tickets."}
            </p>
            {user.role === "employee" && (
              <div className="mt-6">
                <Link
                  href="/tickets/new"
                  className="inline-flex items-center space-x-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-blue-500/25 hover:bg-blue-500 transition-all duration-200"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Create Your First Ticket</span>
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200/50 text-left text-sm">
              <thead className="bg-slate-50/50 backdrop-blur-md text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                <tr>
                  <th scope="col" className="px-6 py-4">Ticket</th>
                  <th scope="col" className="px-6 py-4">Title</th>
                  {user.role === "support" && (
                    <th scope="col" className="px-6 py-4">Creator</th>
                  )}
                  <th scope="col" className="px-6 py-4">Category</th>
                  <th scope="col" className="px-6 py-4">Priority</th>
                  <th scope="col" className="px-6 py-4">Status</th>
                  <th scope="col" className="px-6 py-4">Created Date</th>
                  <th scope="col" className="px-6 py-4">Last Updated</th>
                  <th scope="col" className="px-6 py-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/70">
                {tickets.map((t) => (
                  <tr
                    key={t.id}
                    className="hover:bg-blue-50/30 transition-colors duration-150 group"
                  >
                    <td className="px-6 py-4 font-mono font-bold text-xs text-slate-500">
                      #{t.id}
                    </td>

                    <td className="px-6 py-4 font-semibold text-slate-900 max-w-xs truncate">
                      <Link
                        href={`/tickets/${t.id}`}
                        className="group-hover:text-blue-600 transition-colors duration-150 flex items-center gap-1.5"
                      >
                        <span>{t.title}</span>
                      </Link>
                    </td>

                    {user.role === "support" && (
                      <td className="px-6 py-4 text-xs font-medium text-slate-600">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/70 border border-slate-200/60 shadow-xs">
                          <User className="w-3 h-3 text-slate-400" />
                          <span>{t.createdBy?.username || `User #${t.createdById}`}</span>
                        </div>
                      </td>
                    )}

                    <td className="px-6 py-4">
                      <div className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 bg-white/50 px-2.5 py-1 rounded-lg border border-slate-200/50">
                        {getCategoryIcon(t.category)}
                        <span>{t.category}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4">{getPriorityBadge(t.priority)}</td>

                    <td className="px-6 py-4">{getStatusBadge(t.status)}</td>

                    <td className="px-6 py-4 text-xs text-slate-500 whitespace-nowrap">
                      {new Date(t.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>

                    <td className="px-6 py-4 text-xs text-slate-500 whitespace-nowrap">
                      {new Date(t.updatedAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>

                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <Link
                        href={`/tickets/${t.id}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 group-hover:translate-x-0.5 transition-all duration-150 px-2.5 py-1 rounded-lg hover:bg-blue-50/80"
                      >
                        <span>Open</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
