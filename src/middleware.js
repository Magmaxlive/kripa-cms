import { NextResponse } from "next/server";

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const cookieHeader = request.headers.get("cookie") || "";

  console.log("Middleware pathname:", pathname);
  console.log("Cookie header:", cookieHeader);

  if (pathname.startsWith("/dashboard")) {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/auth/profile/`, {
        headers: { cookie: cookieHeader },
      });
      console.log("Profile response status:", res.status);
      if (res.ok) return NextResponse.next();
    } catch (err) {
      console.log("Profile fetch error:", err);
    }
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }

  if (pathname === "/") {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/auth/profile/`, {
        headers: { cookie: cookieHeader },
      });
      if (res.ok) return NextResponse.redirect(new URL("/dashboard/home-page", request.url));
    } catch {}
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }

  if (pathname === "/auth/signin") {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/auth/profile/`, {
        headers: { cookie: cookieHeader },
      });
      if (res.ok) return NextResponse.redirect(new URL("/dashboard/home-page", request.url));
    } catch {}
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/dashboard/:path*", "/auth/signin"],
};