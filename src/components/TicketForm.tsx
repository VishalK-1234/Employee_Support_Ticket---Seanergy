"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES, PRIORITIES, type Category, type Priority } from "@/lib/validate";
import {
  AlertCircle,
  CheckCircle2,
  Lock,
  Send,
  Save,
  Monitor,
  Code,
  Wifi,
  Key,
  HelpCircle,
} from "lucide-react";

interface TicketFormProps {
  initialData?: {
    id: number;
    title: string;
    description: string;
    category: string;
    priority: string;
    status: string;
  };
  isEdit?: boolean;
}

function getCategoryIcon(cat: string) {
  switch (cat) {
    case "Hardware":
      return <Monitor className="w-4 h-4" />;
    case "Software":
      return <Code className="w-4 h-4" />;
    case "Network":
      return <Wifi className="w-4 h-4" />;
    case "Access":
      return <Key className="w-4 h-4" />;
    default:
      return <HelpCircle className="w-4 h-4" />;
  }
}

export default function TicketForm({ initialData, isEdit = false }: TicketFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [category, setCategory] = useState<Category>(
    (initialData?.category as Category) || "Hardware"
  );
  const [priority, setPriority] = useState<Priority>(
    (initialData?.priority as Priority) || "Medium"
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isClosed = initialData?.status === "Closed";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (isEdit && isClosed) {
      setError("Closed tickets cannot be edited.");
      return;
    }

    const trimmedTitle = title.trim();
    const trimmedDesc = description.trim();

    if (!trimmedTitle) {
      setError("Title is required and cannot be empty.");
      return;
    }
    if (trimmedTitle.length > 100) {
      setError("Title must not exceed 100 characters.");
      return;
    }
    if (!trimmedDesc) {
      setError("Description is required and cannot be empty.");
      return;
    }

    setLoading(true);

    try {
      const url = isEdit ? `/api/tickets/${initialData?.id}` : "/api/tickets";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: trimmedTitle,
          description: trimmedDesc,
          category,
          priority,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to save ticket.");
      } else {
        if (isEdit) {
          setSuccess("Ticket updated successfully.");
          router.refresh();
        } else {
          router.push(`/tickets/${data.id}`);
        }
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (isEdit && isClosed) {
    return (
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
              This ticket is officially marked as Closed. Field modifications are disabled unless support staff re-opens it.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const charCount = title.trim().length;

  return (
    <form
      onSubmit={handleSubmit}
      className="glass-panel rounded-3xl p-8 sm:p-10 shadow-xl border border-white/80 space-y-6"
    >
      <div className="border-b border-slate-200/60 pb-5">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          {isEdit ? "Update Ticket Details" : "Create New IT Ticket"}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          {isEdit
            ? "Modify the title, description, category, or priority of your ticket."
            : "Describe the technical issue you are experiencing so our support team can resolve it."}
        </p>
      </div>

      {error && (
        <div className="p-4 bg-rose-50/90 border border-rose-200/80 text-rose-700 text-sm rounded-2xl flex items-center gap-2.5 backdrop-blur-md animate-fade-in">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
          <p className="font-semibold">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-50/90 border border-emerald-200/80 text-emerald-700 text-sm rounded-2xl flex items-center gap-2.5 backdrop-blur-md animate-fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-500" />
          <p className="font-semibold">{success}</p>
        </div>
      )}

      <div className="space-y-6">
        {/* Title */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label
              htmlFor="ticket-title"
              className="text-xs font-bold uppercase tracking-wider text-slate-700"
            >
              Issue Title <span className="text-rose-500">*</span>
            </label>
            <span
              className={`text-xs font-mono font-medium ${
                charCount > 90 ? "text-amber-600 font-bold" : "text-slate-400"
              }`}
            >
              {charCount} / 100
            </span>
          </div>
          <input
            id="ticket-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
            required
            placeholder="e.g. Laptop display flickering after sleep"
            className="w-full glass-input rounded-2xl px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 shadow-sm"
          />
        </div>

        {/* Category Selector Chips */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
            Category <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {CATEGORIES.map((c) => {
              const selected = category === c;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={`p-3 rounded-2xl border text-xs font-bold transition-all duration-200 flex flex-col items-center gap-1.5 ${
                    selected
                      ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/25 scale-[1.02]"
                      : "bg-white/60 text-slate-700 border-slate-200/80 hover:bg-white hover:border-slate-300"
                  }`}
                >
                  <span className={selected ? "text-white" : "text-slate-500"}>
                    {getCategoryIcon(c)}
                  </span>
                  <span>{c}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Priority Selector Cards */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
            Priority Level <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-3 gap-3">
            {PRIORITIES.map((p) => {
              const selected = priority === p;
              let activeClasses = "";
              if (selected) {
                if (p === "High") activeClasses = "bg-rose-50 border-rose-500 text-rose-700 ring-2 ring-rose-500/20";
                else if (p === "Medium") activeClasses = "bg-amber-50 border-amber-500 text-amber-700 ring-2 ring-amber-500/20";
                else activeClasses = "bg-slate-100 border-slate-600 text-slate-800 ring-2 ring-slate-500/20";
              } else {
                activeClasses = "bg-white/60 border-slate-200 text-slate-600 hover:bg-white";
              }

              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`p-3 rounded-2xl border text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 ${activeClasses}`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      p === "High" ? "bg-rose-500" : p === "Medium" ? "bg-amber-500" : "bg-slate-400"
                    }`}
                  />
                  <span>{p} Priority</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="ticket-description"
            className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2"
          >
            Detailed Description <span className="text-rose-500">*</span>
          </label>
          <textarea
            id="ticket-description"
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            placeholder="Provide context, error codes, steps to reproduce, or hardware details..."
            className="w-full glass-input rounded-2xl p-4 text-sm font-medium text-slate-900 placeholder:text-slate-400 shadow-sm"
          />
        </div>

        {/* Actions */}
        <div className="pt-4 border-t border-slate-200/60 flex items-center justify-end gap-3">
          <button
            type="submit"
            disabled={loading}
            className="group flex items-center space-x-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-95 transition-all duration-200 disabled:opacity-50"
          >
            {isEdit ? (
              <>
                <Save className="w-4 h-4" />
                <span>{loading ? "Saving Changes..." : "Save Changes"}</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                <span>{loading ? "Submitting Ticket..." : "Submit Support Ticket"}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
