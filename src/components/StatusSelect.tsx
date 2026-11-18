"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { STATUSES, type Status } from "@/lib/validate";
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Hourglass,
  Lock,
  ArrowRightCircle,
} from "lucide-react";

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
    if (newStatus === status) return;
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
        setSuccess(`Status successfully updated to "${data.status}".`);
        router.refresh();
      }
    } catch {
      setError("An unexpected error occurred while updating status.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-purple-200/60 bg-purple-50/20 shadow-xl space-y-4">
      <div className="flex items-center justify-between border-b border-purple-100 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-md shadow-purple-500/25">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Support Staff Operations
            </h3>
            <p className="text-xs text-slate-500">
              Update ticket lifecycle state in real-time
            </p>
          </div>
        </div>

        {loading && (
          <span className="text-xs font-semibold text-purple-600 animate-pulse">
            Syncing status...
          </span>
        )}
      </div>

      {error && (
        <div className="p-3 bg-rose-50/90 border border-rose-200 text-rose-700 text-xs sm:text-sm rounded-xl flex items-center gap-2 animate-fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <p className="font-semibold">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-3 bg-emerald-50/90 border border-emerald-200 text-emerald-700 text-xs sm:text-sm rounded-xl flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
          <p className="font-semibold">{success}</p>
        </div>
      )}

      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
          Change Status To:
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {STATUSES.map((s) => {
            const isCurrent = status === s;
            let theme = "";
            if (s === "Open") {
              theme = isCurrent
                ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/30"
                : "bg-white/70 text-slate-700 border-slate-200/80 hover:bg-blue-50/60";
            } else if (s === "In Progress") {
              theme = isCurrent
                ? "bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-500/30"
                : "bg-white/70 text-slate-700 border-slate-200/80 hover:bg-amber-50/60";
            } else if (s === "Resolved") {
              theme = isCurrent
                ? "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-500/30"
                : "bg-white/70 text-slate-700 border-slate-200/80 hover:bg-emerald-50/60";
            } else {
              theme = isCurrent
                ? "bg-slate-700 text-white border-slate-700 shadow-md shadow-slate-600/30"
                : "bg-white/70 text-slate-700 border-slate-200/80 hover:bg-slate-100";
            }

            return (
              <button
                key={s}
                type="button"
                disabled={loading}
                onClick={() => handleStatusChange(s)}
                className={`p-3 rounded-2xl border text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 ${theme}`}
              >
                {s === "Open" && <span className="w-2 h-2 rounded-full bg-blue-400" />}
                {s === "In Progress" && <Hourglass className="w-3.5 h-3.5" />}
                {s === "Resolved" && <CheckCircle2 className="w-3.5 h-3.5" />}
                {s === "Closed" && <Lock className="w-3.5 h-3.5" />}
                <span>{s}</span>
                {isCurrent && <span className="text-[10px] opacity-80">(Active)</span>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
