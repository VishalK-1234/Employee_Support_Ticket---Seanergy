"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { LifeBuoy, PlusCircle, LogOut, User, ShieldCheck, Ticket } from "lucide-react";

interface NavbarProps {
  user: {
    id: number;
    username: string;
    role: "employee" | "support";
  } | null;
}

export default function Navbar({ user }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error("Logout failed:", err);
      setLoggingOut(false);
    }
  }

  const isTicketsActive = pathname === "/tickets" || pathname.startsWith("/tickets/");
  const isNewActive = pathname === "/tickets/new";

  return (
    <header className="glass-nav sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo & Navigation */}
          <div className="flex items-center space-x-8">
            <Link
              href={user ? "/tickets" : "/login"}
              className="flex items-center space-x-2.5 group transition-transform duration-200 active:scale-95"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-all duration-300">
                <LifeBuoy className="w-5 h-5 transition-transform group-hover:rotate-45 duration-500" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-black tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 bg-clip-text text-transparent">
                  SupportDesk
                </span>
                <span className="text-[10px] font-semibold text-slate-400 tracking-widest uppercase -mt-1">
                  Enterprise Support
                </span>
              </div>
            </Link>

            {user && (
              <nav className="hidden sm:flex items-center space-x-2">
                <Link
                  href="/tickets"
                  className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isTicketsActive && !isNewActive
                      ? "bg-slate-900/5 text-slate-900 font-semibold shadow-inner"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                  }`}
                >
                  <Ticket className="w-4 h-4" />
                  <span>Tickets</span>
                </Link>

                {user.role === "employee" && (
                  <Link
                    href="/tickets/new"
                    className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isNewActive
                        ? "bg-blue-600 text-white shadow-md shadow-blue-500/25"
                        : "text-blue-600 hover:text-blue-700 hover:bg-blue-50/80"
                    }`}
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>New Ticket</span>
                  </Link>
                )}
              </nav>
            )}
          </div>

          {/* User profile & actions */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2.5 px-3 py-1.5 rounded-xl bg-white/60 border border-slate-200/60 shadow-sm backdrop-blur-md">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-600 border border-slate-200/50">
                    {user.role === "support" ? (
                      <ShieldCheck className="w-4 h-4 text-purple-600" />
                    ) : (
                      <User className="w-4 h-4 text-blue-600" />
                    )}
                  </div>
                  <div className="text-left hidden md:block">
                    <div className="text-xs font-bold text-slate-800 leading-tight">
                      {user.username}
                    </div>
                    <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                      {user.role === "support" ? (
                        <span className="text-purple-600 font-bold">Support Staff</span>
                      ) : (
                        <span className="text-blue-600 font-bold">Employee</span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  title="Sign Out"
                  className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50/80 border border-transparent hover:border-rose-200/60 transition-all duration-200 active:scale-95 disabled:opacity-50"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold shadow-md shadow-blue-500/20 hover:shadow-blue-500/35 hover:scale-[1.02] active:scale-95 transition-all duration-200"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
