"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface NavbarProps {
  user: {
    id: number;
    username: string;
    role: "employee" | "support";
  } | null;
}

export default function Navbar({ user }: NavbarProps) {
  const router = useRouter();
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

  return (
    <header className="bg-white border-b border-zinc-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href={user ? "/tickets" : "/login"} className="text-lg font-bold text-zinc-900 tracking-tight">
              SupportDesk
            </Link>
            {user && (
              <nav className="flex space-x-4">
                <Link
                  href="/tickets"
                  className="px-3 py-2 rounded-md text-sm font-medium text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100"
                >
                  Tickets
                </Link>
                {user.role === "employee" && (
                  <Link
                    href="/tickets/new"
                    className="px-3 py-2 rounded-md text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                  >
                    + New Ticket
                  </Link>
                )}
              </nav>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-sm font-semibold text-zinc-900">{user.username}</div>
                  <div className="text-xs font-medium text-zinc-500 uppercase">
                    Role: {user.role === "support" ? "Support Staff" : "Employee"}
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 shadow-sm hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {loggingOut ? "Signing out..." : "Sign Out"}
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="rounded-md bg-blue-600 px-3.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
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
