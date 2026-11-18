import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getTicketById } from "@/lib/tickets";
import StatusSelect from "@/components/StatusSelect";
import TicketForm from "@/components/TicketForm";
import CommentList from "@/components/CommentList";
import CommentForm from "@/components/CommentForm";
import {
  ArrowLeft,
  Calendar,
  Clock,
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
  Tag,
} from "lucide-react";

function getCategoryIcon(cat: string) {
  switch (cat) {
    case "Hardware":
      return <Monitor className="w-4 h-4 text-blue-500" />;
    case "Software":
      return <Code className="w-4 h-4 text-indigo-500" />;
    case "Network":
      return <Wifi className="w-4 h-4 text-cyan-500" />;
    case "Access":
      return <Key className="w-4 h-4 text-amber-500" />;
    default:
      return <HelpCircle className="w-4 h-4 text-slate-500" />;
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case "Open":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-blue-500/10 text-blue-700 border border-blue-500/25 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          Open
        </span>
      );
    case "In Progress":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-700 border border-amber-500/25 shadow-sm">
          <Hourglass className="w-3.5 h-3.5 text-amber-500 animate-spin" style={{ animationDuration: "3s" }} />
          In Progress
        </span>
      );
    case "Resolved":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-700 border border-emerald-500/25 shadow-sm">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          Resolved
        </span>
      );
    case "Closed":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-slate-500/10 text-slate-700 border border-slate-500/25 shadow-sm">
          <Lock className="w-3.5 h-3.5 text-slate-500" />
          Closed
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
          {status}
        </span>
      );
  }
}

function getPriorityBadge(priority: string) {
  switch (priority) {
    case "High":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-rose-500/10 text-rose-700 border border-rose-500/25">
          <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
          High Priority
        </span>
      );
    case "Medium":
      return (
        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-orange-500/10 text-orange-700 border border-orange-500/25">
          Medium Priority
        </span>
      );
    case "Low":
      return (
        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-slate-500/10 text-slate-600 border border-slate-500/25">
          Low Priority
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
          {priority} Priority
        </span>
      );
  }
}

export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const { id: idParam } = await params;
  const id = parseInt(idParam, 10);
  if (isNaN(id)) {
    notFound();
  }

  const ticket = await getTicketById(id, user);

  // AC-05: Unauthorized access to other employee's tickets returns 404 with no ticket body
  if (!ticket) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center">
        <div className="glass-panel rounded-3xl p-10 border border-white/80 shadow-xl space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Ticket Not Found
          </h2>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            The requested ticket does not exist, or you do not have permission to view it.
          </p>
          <div className="pt-2">
            <Link
              href="/tickets"
              className="inline-flex items-center space-x-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-500/25 hover:bg-blue-500 transition-all duration-200"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Ticket List</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isCreator = user.role === "employee" && ticket.createdById === user.id;
  const isSupport = user.role === "support";
  const isClosed = ticket.status === "Closed";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back button and badges */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Link
          href="/tickets"
          className="inline-flex items-center space-x-2 text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors duration-150 group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to Tickets</span>
        </Link>

        <div className="flex items-center gap-2">
          {getStatusBadge(ticket.status)}
          {getPriorityBadge(ticket.priority)}
        </div>
      </div>

      {/* Main Ticket Overview Glass Card */}
      <div className="glass-panel rounded-3xl p-8 sm:p-10 shadow-xl border border-white/80 space-y-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">
            <Tag className="w-3.5 h-3.5 text-blue-500" />
            <span>Ticket #{ticket.id}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug">
            {ticket.title}
          </h1>
        </div>

        {/* Metadata Pill Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 pb-2">
          <div className="p-3 rounded-2xl bg-white/60 border border-slate-200/60 shadow-xs">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
              <User className="w-3 h-3 text-slate-400" />
              Creator
            </div>
            <div className="text-xs font-bold text-slate-800 truncate">
              {ticket.createdBy?.username || `User #${ticket.createdById}`}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white/60 border border-slate-200/60 shadow-xs">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
              {getCategoryIcon(ticket.category)}
              Category
            </div>
            <div className="text-xs font-bold text-slate-800">
              {ticket.category}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white/60 border border-slate-200/60 shadow-xs">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" />
              Created
            </div>
            <div className="text-xs font-bold text-slate-800">
              {new Date(ticket.createdAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white/60 border border-slate-200/60 shadow-xs">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              Last Updated
            </div>
            <div className="text-xs font-bold text-slate-800">
              {new Date(ticket.updatedAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
        </div>

        {/* Description Section */}
        <div className="pt-4 border-t border-slate-200/60">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Description
          </h3>
          <div className="p-5 rounded-2xl bg-white/70 border border-slate-200/70 text-slate-800 text-sm whitespace-pre-wrap leading-relaxed shadow-xs">
            {ticket.description}
          </div>
        </div>
      </div>

      {/* Support Status Lifecycle Control */}
      {isSupport && (
        <StatusSelect ticketId={ticket.id} currentStatus={ticket.status} />
      )}

      {/* Discussion Thread */}
      <section className="glass-panel space-y-5 rounded-3xl border border-white/80 p-6 shadow-xl sm:p-8">
        <div>
          <h2 className="text-lg font-black text-slate-900">Comments</h2>
          <p className="mt-1 text-xs text-slate-500">
            Chronological discussion for this ticket
          </p>
        </div>
        <CommentList
          comments={ticket.comments}
          creatorId={ticket.createdById}
        />
        <CommentForm ticketId={ticket.id} isClosed={isClosed} />
      </section>

      {/* Employee Creator Edit Section */}
      {isCreator && (
        <div>
          {isClosed ? (
            <div className="glass-panel rounded-3xl p-8 border border-slate-200/60 bg-slate-50/50 backdrop-blur-md">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-slate-200/60 flex items-center justify-center text-slate-500 shrink-0">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">
                    Editing Locked (Ticket Closed)
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">
                    This ticket is currently Closed. Title, description, category, and priority cannot be modified. If support staff re-opens the ticket, editing will be automatically re-enabled.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <TicketForm
              isEdit={true}
              initialData={{
                id: ticket.id,
                title: ticket.title,
                description: ticket.description,
                category: ticket.category,
                priority: ticket.priority,
                status: ticket.status,
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}
