"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES, PRIORITIES, type Category, type Priority } from "@/lib/validate";

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
      <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-6 text-zinc-600">
        <p className="font-medium text-zinc-800">This ticket is Closed.</p>
        <p className="text-sm mt-1">Field editing is disabled while the ticket is closed.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-zinc-200 rounded-lg p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-zinc-900 mb-4">
        {isEdit ? "Edit Ticket Details" : "Create New Support Ticket"}
      </h2>

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

      <div className="space-y-4">
        <div>
          <label htmlFor="ticket-title" className="block text-sm font-medium text-zinc-700 mb-1">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            id="ticket-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
            required
            placeholder="Brief summary of the issue (1-100 characters)"
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <p className="text-xs text-zinc-500 mt-1">{title.trim().length}/100 characters</p>
        </div>

        <div>
          <label htmlFor="ticket-description" className="block text-sm font-medium text-zinc-700 mb-1">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="ticket-description"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            placeholder="Detailed description of the issue"
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="ticket-category" className="block text-sm font-medium text-zinc-700 mb-1">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              id="ticket-category"
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="ticket-priority" className="block text-sm font-medium text-zinc-700 mb-1">
              Priority <span className="text-red-500">*</span>
            </label>
            <select
              id="ticket-priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-end gap-3">
          {isEdit ? (
            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:opacity-50"
            >
              {loading ? "Saving Changes..." : "Save Changes"}
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:opacity-50"
            >
              {loading ? "Submitting..." : "Submit Ticket"}
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
