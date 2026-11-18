"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { STATUSES, type Status } from "@/lib/validate";

interface StatusSelectProps {
  ticketId: number;
  currentStatus: string;
}

export default function StatusSelect({
  ticketId,
  currentStatus,
}: StatusSelectProps) {
  const router = useRouter();
  const [status, setStatus] = useState<string>(currentStatus);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleStatusChange(newStatus: string) {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`/api/tickets/${ticketId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to update status.");
      } else {
        setStatus(data.status);
        setSuccess(`Status successfully changed to ${data.status}.`);
        router.refresh();
      }
    } catch {
      setError("An unexpected error occurred while updating status.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg border border-zinc-200 shadow-sm">
      <h3 className="text-sm font-semibold text-zinc-900 uppercase tracking-wider mb-3">
        Manage Ticket Status (Support Staff)
      </h3>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded">
          {success}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <label htmlFor="status-select" className="text-sm font-medium text-zinc-700">
          Current Status:
        </label>
        <select
          id="status-select"
          value={status}
          onChange={(e) => handleStatusChange(e.target.value)}
          disabled={loading}
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        {loading && <span className="text-xs text-zinc-500">Updating...</span>}
      </div>
    </div>
  );
}
