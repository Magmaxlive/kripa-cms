// src/app/api/refresh/route.js
import { NextResponse } from "next/server";

export async function POST(request) {
  const cookieHeader = request.headers.get("cookie") || "";
  
  console.log("Refresh proxy cookies:", cookieHeader);

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/auth/refresh/`, {
    method:  "POST",
    headers: { cookie: cookieHeader },
  });

  const data = await res.json();
  console.log("Django refresh response:", res.status, data);

  if (!res.ok) {
    return NextResponse.json(data, { status: res.status });
  }

  const response = NextResponse.json(data);
  const setCookie = res.headers.get("set-cookie");
  if (setCookie) {
    response.headers.set("set-cookie", setCookie);
  }
  return response;
}