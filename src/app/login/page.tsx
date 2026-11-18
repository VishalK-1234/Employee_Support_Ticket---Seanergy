"use client";

import { useState } from "react";
import { Lock, User, Headset, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed.");
      } else {
        // Use a full hard navigation after login for the same reason as logout:
        // router.push() + router.refresh() race against each other and the proxy
        // middleware can serve a stale RSC cache without the new session cookie.
        // window.location.href forces a fresh HTTP request so the proxy sees the
        // new cookie immediately and the layout loads with the correct user.
        window.location.href = "/tickets";
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function fillCredentials(u: string, p: string) {
    setUsername(u);
    setPassword(p);
    setError(null);
  }

  return (
    <div className="flex min-h-[75vh] items-center justify-center py-6 px-4">
      <div className="w-full max-w-md glass-panel rounded-3xl p-8 sm:p-10 shadow-2xl border border-white/60 relative overflow-hidden transition-all duration-300">
        {/* Subtle decorative glow in the card */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-2xl pointer-events-none" />

        <div className="text-center mb-8 relative">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 items-center justify-center text-white shadow-lg shadow-indigo-500/25 mb-4 transform hover:scale-105 transition-transform duration-300">
            <Headset className="w-7 h-7" aria-hidden="true" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Welcome Back
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Sign in to access your IT support tickets
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 bg-rose-50/90 border border-rose-200/80 text-rose-700 text-xs sm:text-sm rounded-xl flex items-center gap-2 backdrop-blur-md animate-fade-in shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600 shrink-0" />
            <p className="font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 relative">
          <div>
            <label
              htmlFor="username"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5"
            >
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                id="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="employee1 or support1"
                className="w-full glass-input rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 font-medium placeholder:text-slate-400 shadow-sm transition-all duration-200"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5"
            >
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full glass-input rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 font-medium placeholder:text-slate-400 shadow-sm transition-all duration-200"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full group mt-2 flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.01] active:scale-[0.98] transition-all duration-200 disabled:opacity-50"
          >
            <span>{loading ? "Authenticating..." : "Sign In to Portal"}</span>
            {!loading && (
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            )}
          </button>
        </form>

        {/* Demo Accounts Quick-Select */}
        <div className="mt-8 pt-6 border-t border-slate-200/60">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Quick Demo Login
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              pass: password123
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => fillCredentials("employee1", "password123")}
              className={`p-2.5 rounded-xl border text-xs font-semibold transition-all duration-200 flex flex-col items-center gap-1 ${
                username === "employee1"
                  ? "bg-blue-50/90 border-blue-400 text-blue-700 shadow-sm shadow-blue-500/10"
                  : "bg-white/50 border-slate-200/80 text-slate-700 hover:bg-white hover:border-slate-300"
              }`}
            >
              <User className="w-3.5 h-3.5 text-blue-500" />
              <span>employee1</span>
            </button>

            <button
              type="button"
              onClick={() => fillCredentials("employee2", "password123")}
              className={`p-2.5 rounded-xl border text-xs font-semibold transition-all duration-200 flex flex-col items-center gap-1 ${
                username === "employee2"
                  ? "bg-blue-50/90 border-blue-400 text-blue-700 shadow-sm shadow-blue-500/10"
                  : "bg-white/50 border-slate-200/80 text-slate-700 hover:bg-white hover:border-slate-300"
              }`}
            >
              <User className="w-3.5 h-3.5 text-blue-500" />
              <span>employee2</span>
            </button>

            <button
              type="button"
              onClick={() => fillCredentials("support1", "password123")}
              className={`p-2.5 rounded-xl border text-xs font-semibold transition-all duration-200 flex flex-col items-center gap-1 ${
                username === "support1"
                  ? "bg-purple-50/90 border-purple-400 text-purple-700 shadow-sm shadow-purple-500/10"
                  : "bg-white/50 border-slate-200/80 text-slate-700 hover:bg-white hover:border-slate-300"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-purple-500" />
              <span>support1</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
