// src/middleware.js
import { NextResponse } from "next/server";

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Get cookies from the request to forward to backend
  const cookieHeader = request.headers.get("cookie") || "";

  if (pathname === "/") {
    // Check auth by calling backend
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/auth/profile/`, {
        headers: { cookie: cookieHeader },
      });
      if (res.ok) {
        return NextResponse.redirect(new URL("/dashboard/home-page", request.url));
      }
    } catch {}
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }

  if (pathname.startsWith("/dashboard")) {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/auth/profile/`, {
        headers: { cookie: cookieHeader },
      });
      if (res.ok) return NextResponse.next();
    } catch {}
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }

  if (pathname === "/auth/signin") {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/auth/profile/`, {
        headers: { cookie: cookieHeader },
      });
      if (res.ok) {
        return NextResponse.redirect(new URL("/dashboard/home-page", request.url));
      }
    } catch {}
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/dashboard/:path*", "/auth/signin"],
};