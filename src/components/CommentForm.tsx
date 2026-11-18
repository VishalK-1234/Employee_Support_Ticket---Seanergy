"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Lock, Send } from "lucide-react";

interface CommentFormProps {
  ticketId: number;
  isClosed: boolean;
}

export default function CommentForm({
  ticketId,
  isClosed,
}: CommentFormProps) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (isClosed) return;

    setError(null);
    setLoading(true);
    try {
      const response = await fetch(`/api/tickets/${ticketId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Failed to add comment.");
        return;
      }
      setContent("");
      router.refresh();
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (isClosed) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-100/70 p-5">
        <div className="flex items-start gap-3">
          <Lock className="mt-0.5 h-5 w-5 text-slate-500" />
          <div>
            <h3 className="text-sm font-bold text-slate-800">
              Comments Locked
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              This ticket is closed. Reopen to post additional comments.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-slate-200/70 bg-white/60 p-5"
    >
      {error && (
        <div className="mb-3 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      <label
        htmlFor="comment-content"
        className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-600"
      >
        Add Comment
      </label>
      <textarea
        id="comment-content"
        value={content}
        onChange={(event) => setContent(event.target.value)}
        rows={4}
        maxLength={1000}
        placeholder="Write a comment..."
        className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-800"
      />
      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs text-slate-400">{content.length} / 1000</span>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
          {loading ? "Posting..." : "Add Comment"}
        </button>
      </div>
    </form>
  );
}
