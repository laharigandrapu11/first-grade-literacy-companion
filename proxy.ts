import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  // Protect dashboard routes - teachers and admins
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/school")) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Only school admins can access /school
    if (pathname.startsWith("/school") && session.user.role !== "SCHOOL_ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Redirect school admins away from /dashboard to /school
    if (pathname.startsWith("/dashboard") && session.user.role === "SCHOOL_ADMIN") {
      return NextResponse.redirect(new URL("/school", req.url));
    }
  }

  // Redirect logged-in users away from login
  if (pathname === "/login" && session) {
    const dest = session.user.role === "SCHOOL_ADMIN" ? "/school" : "/dashboard";
    return NextResponse.redirect(new URL(dest, req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*", "/school/:path*", "/login"],
};
