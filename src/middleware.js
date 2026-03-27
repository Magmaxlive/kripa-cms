import { NextResponse } from "next/server";

export function middleware(request) {
  const isLoggedIn = request.cookies.get("isLoggedIn")?.value;
  const { pathname } = request.nextUrl;

  if (pathname === "/") {
    return NextResponse.redirect(
      new URL(isLoggedIn ? "/dashboard/home-page" : "/auth/signin", request.url)
    );
  }

  if (!isLoggedIn && pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }

  if (isLoggedIn && pathname === "/auth/signin") {
    return NextResponse.redirect(new URL("/dashboard/home-page", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/dashboard/:path*",
    "/auth/signin",
  ],
};