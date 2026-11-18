import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { listTickets } from "@/lib/tickets";

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

export default async function TicketsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const tickets = await listTickets(user);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
            {user.role === "support" ? "All Support Tickets" : "My Support Tickets"}
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            {user.role === "support"
              ? "Viewing all tickets submitted across the company."
              : "Viewing tickets submitted by you."}
          </p>
        </div>

        {user.role === "employee" && (
          <Link
            href="/tickets/new"
            className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
          >
            Create Ticket
          </Link>
        )}
      </div>

      <div className="bg-white shadow-sm border border-zinc-200 rounded-lg overflow-hidden">
        {tickets.length === 0 ? (
          <div className="text-center py-12 px-4">
            <h3 className="text-sm font-medium text-zinc-900">No tickets found</h3>
            <p className="mt-1 text-sm text-zinc-500">
              {user.role === "employee"
                ? "You haven't submitted any support tickets yet."
                : "No support tickets exist in the system."}
            </p>
            {user.role === "employee" && (
              <div className="mt-6">
                <Link
                  href="/tickets/new"
                  className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
                >
                  Create Your First Ticket
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-zinc-200 text-left text-sm">
              <thead className="bg-zinc-50 text-zinc-700 font-semibold">
                <tr>
                  <th scope="col" className="px-4 py-3 sm:px-6">ID</th>
                  <th scope="col" className="px-4 py-3">Title</th>
                  {user.role === "support" && (
                    <th scope="col" className="px-4 py-3">Created By</th>
                  )}
                  <th scope="col" className="px-4 py-3">Category</th>
                  <th scope="col" className="px-4 py-3">Priority</th>
                  <th scope="col" className="px-4 py-3">Status</th>
                  <th scope="col" className="px-4 py-3">Created Date</th>
                  <th scope="col" className="px-4 py-3">Last Updated</th>
                  <th scope="col" className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 bg-white">
                {tickets.map((t) => (
                  <tr key={t.id} className="hover:bg-zinc-50/80 transition-colors">
                    <td className="px-4 py-4 sm:px-6 font-mono font-medium text-zinc-600">
                      #{t.id}
                    </td>
                    <td className="px-4 py-4 font-medium text-zinc-900 max-w-xs truncate">
                      <Link href={`/tickets/${t.id}`} className="hover:text-blue-600">
                        {t.title}
                      </Link>
                    </td>
                    {user.role === "support" && (
                      <td className="px-4 py-4 text-zinc-700 font-mono text-xs">
                        {t.createdBy?.username || `User #${t.createdById}`}
                      </td>
                    )}
                    <td className="px-4 py-4 text-zinc-600">{t.category}</td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${getPriorityBadge(
                          t.priority
                        )}`}
                      >
                        {t.priority}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${getStatusBadge(
                          t.status
                        )}`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-xs text-zinc-500 whitespace-nowrap">
                      {new Date(t.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-4 text-xs text-zinc-500 whitespace-nowrap">
                      {new Date(t.updatedAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-4 text-right whitespace-nowrap">
                      <Link
                        href={`/tickets/${t.id}`}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                      >
                        View &rarr;
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
