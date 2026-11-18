import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import TicketForm from "@/components/TicketForm";

export default async function NewTicketPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  // Only employees can create tickets
  if (user.role !== "employee") {
    redirect("/tickets");
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/tickets"
          className="text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          &larr; Back to Tickets
        </Link>
      </div>

      <TicketForm />
    </div>
  );
}
