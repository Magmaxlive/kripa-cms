import { NextResponse } from "next/server";

export function middleware(request) {
  const token = request.cookies.get("access_token")?.value;
  const { pathname } = request.nextUrl;

  // If no token and trying to access dashboard → redirect to login
  if (!token && pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }

  // If has token and on login page → redirect to dashboard
  if (token && (pathname === "/" || pathname === "/auth/signin")) {
    return NextResponse.redirect(new URL("/dashboard/home-page", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/auth/signin"],
};