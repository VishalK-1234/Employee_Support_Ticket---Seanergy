import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getTicketById } from "@/lib/tickets";
import StatusSelect from "@/components/StatusSelect";
import TicketForm from "@/components/TicketForm";

function getStatusBadge(status: string) {
  switch (status) {
    case "Open":
      return "bg-blue-50 text-blue-700 ring-1 ring-blue-700/10";
    case "In Progress":
      return "bg-amber-50 text-amber-700 ring-1 ring-amber-700/10";
    case "Resolved":
      return "bg-green-50 text-green-700 ring-1 ring-green-700/10";
    case "Closed":
      return "bg-zinc-100 text-zinc-700 ring-1 ring-zinc-700/10";
    default:
      return "bg-zinc-50 text-zinc-600";
  }
}

function getPriorityBadge(priority: string) {
  switch (priority) {
    case "High":
      return "text-red-700 bg-red-50 ring-1 ring-red-700/10";
    case "Medium":
      return "text-orange-700 bg-orange-50 ring-1 ring-orange-700/10";
    case "Low":
      return "text-zinc-600 bg-zinc-50 ring-1 ring-zinc-600/10";
    default:
      return "text-zinc-600 bg-zinc-50";
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

  // AC-05: If ticket does not exist or this employee is not allowed to see it,
  // show clean not-found without any ticket details.
  if (!ticket) {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center">
        <div className="bg-white p-8 rounded-lg border border-zinc-200 shadow-sm">
          <h2 className="text-xl font-bold text-zinc-900 mb-2">Ticket Not Found</h2>
          <p className="text-sm text-zinc-500 mb-6">
            The requested ticket does not exist or you do not have permission to view it.
          </p>
          <Link
            href="/tickets"
            className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
          >
            Back to Ticket List
          </Link>
        </div>
      </div>
    );
  }

  const isCreator = user.role === "employee" && ticket.createdById === user.id;
  const isSupport = user.role === "support";
  const isClosed = ticket.status === "Closed";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/tickets"
          className="text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          &larr; Back to Ticket List
        </Link>
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold ${getStatusBadge(
              ticket.status
            )}`}
          >
            {ticket.status}
          </span>
          <span
            className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold ${getPriorityBadge(
              ticket.priority
            )}`}
          >
            {ticket.priority} Priority
          </span>
        </div>
      </div>

      {/* Ticket Overview Card */}
      <div className="bg-white rounded-lg border border-zinc-200 shadow-sm p-6 space-y-4">
        <div className="border-b border-zinc-100 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2">
            <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">
              {ticket.title}
            </h1>
            <span className="text-sm font-mono text-zinc-400">
              Ticket #{ticket.id}
            </span>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-zinc-500">
            <div>
              <span className="font-medium text-zinc-700">Created by:</span>{" "}
              {ticket.createdBy?.username || `User #${ticket.createdById}`}
            </div>
            <div>
              <span className="font-medium text-zinc-700">Category:</span>{" "}
              {ticket.category}
            </div>
            <div>
              <span className="font-medium text-zinc-700">Created:</span>{" "}
              {new Date(ticket.createdAt).toLocaleString()}
            </div>
            <div>
              <span className="font-medium text-zinc-700">Last updated:</span>{" "}
              {new Date(ticket.updatedAt).toLocaleString()}
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
            Description
          </h3>
          <p className="text-sm text-zinc-800 whitespace-pre-wrap leading-relaxed">
            {ticket.description}
          </p>
        </div>
      </div>

      {/* Support Status Control */}
      {isSupport && (
        <StatusSelect ticketId={ticket.id} currentStatus={ticket.status} />
      )}

      {/* Employee Creator Edit Section */}
      {isCreator && (
        <div>
          {isClosed ? (
            <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-6">
              <h3 className="text-sm font-semibold text-zinc-800 uppercase tracking-wider mb-1">
                Ticket Closed
              </h3>
              <p className="text-sm text-zinc-600">
                This ticket is currently Closed. Title, description, category, and priority cannot be modified. If support re-opens the ticket, field editing will be re-enabled.
              </p>
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
