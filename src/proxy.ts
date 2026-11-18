import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { sessionOptions } from "@/lib/session";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get(sessionOptions.cookieName)?.value;

  if (pathname === "/") {
    if (sessionCookie) {
      return NextResponse.redirect(new URL("/tickets", request.url));
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname.startsWith("/tickets")) {
    if (!sessionCookie) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  if (pathname === "/login") {
    if (sessionCookie) {
      return NextResponse.redirect(new URL("/tickets", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/tickets/:path*"],
};
