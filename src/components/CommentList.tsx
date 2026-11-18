"use client";

import { ShieldCheck, User } from "lucide-react";

export interface CommentItem {
  id: number;
  content: string;
  createdAt: Date | string;
  authorId: number;
  author: {
    username: string;
    role: string;
  };
}

interface CommentListProps {
  comments: CommentItem[];
  creatorId: number;
}

export default function CommentList({
  comments,
  creatorId,
}: CommentListProps) {
  if (comments.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200/70 bg-white/50 p-6 text-center text-sm text-slate-500">
        No comments yet.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {comments.map((comment) => {
        const isSupport = comment.author.role === "support";
        const isCreator = comment.authorId === creatorId;

        return (
          <article
            key={comment.id}
            className={`rounded-2xl border p-4 ${
              isSupport
                ? "border-purple-200/70 bg-purple-50/50"
                : "border-blue-200/70 bg-blue-50/40"
            }`}
          >
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {isSupport ? (
                  <ShieldCheck className="h-4 w-4 text-purple-600" />
                ) : (
                  <User className="h-4 w-4 text-blue-600" />
                )}
                <span className="text-sm font-bold text-slate-800">
                  {comment.author.username}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    isSupport
                      ? "bg-purple-600 text-white"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {isSupport
                    ? "Support Staff"
                    : isCreator
                      ? "Creator"
                      : "Employee"}
                </span>
              </div>
              <time
                dateTime={new Date(comment.createdAt).toISOString()}
                className="text-xs text-slate-500"
              >
                {new Date(comment.createdAt).toLocaleString()}
              </time>
            </div>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
              {comment.content}
            </p>
          </article>
        );
      })}
    </div>
  );
}
