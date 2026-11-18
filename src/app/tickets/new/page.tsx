import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import TicketForm from "@/components/TicketForm";
import { ArrowLeft } from "lucide-react";

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
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <Link
          href="/tickets"
          className="inline-flex items-center space-x-2 text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors duration-150 group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to Ticket List</span>
        </Link>
      </div>

      <TicketForm />
    </div>
  );
}
