import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "SupportDesk | IT Support Portal",
  description: "Enterprise IT support ticket management with real-time tracking",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <html lang="en" className="h-full antialiased selection:bg-teal-400 selection:text-slate-950">
      <body className="min-h-full flex flex-col font-sans text-slate-800">
        {/* Ambient floating mesh gradients for glassmorphism refraction */}
        <div className="ambient-mesh">
          <div className="ambient-blob-1" />
          <div className="ambient-blob-2" />
          <div className="ambient-blob-3" />
        </div>

        <Navbar user={user} />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 sm:px-6 lg:px-8 animate-fade-in">
          {children}
        </main>
      </body>
    </html>
  );
}
