import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "./lib/auth/session";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protect /admin routes (except /admin/login)
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const session = await getSessionFromRequest(req);
    if (!session || session.role !== "ADMIN") {
      const loginUrl = new URL("/admin/login", req.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Protect mutating admin API routes
  if (
    (pathname.startsWith("/api/upload") ||
      (pathname.startsWith("/api/categories") && req.method !== "GET") ||
      (pathname.startsWith("/api/documents") && ["POST", "PATCH", "DELETE"].includes(req.method))) &&
    !pathname.startsWith("/api/auth")
  ) {
    const session = await getSessionFromRequest(req);
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized: Admin privileges required" },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/upload/:path*",
    "/api/categories/:path*",
    "/api/documents/:path*",
    "/api/analytics/:path*",
  ],
};
