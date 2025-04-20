import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const isAuthPage = 
    request.nextUrl.pathname.startsWith("/sign-in") || 
    request.nextUrl.pathname.startsWith("/sign-up");

  // Korumalı rotalar için kontrol
  const isProtectedRoute = 
    request.nextUrl.pathname.startsWith("/dashboard") ||
    request.nextUrl.pathname.startsWith("/analytics") ||
    request.nextUrl.pathname.startsWith("/settings") ||
    request.nextUrl.pathname.startsWith("/transactions");

  // Oturum açılmışsa ve auth sayfalarına erişmeye çalışıyorsa
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Oturum açılmamışsa ve korumalı rotalara erişmeye çalışıyorsa
  if (!token && isProtectedRoute) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/analytics/:path*",
    "/settings/:path*",
    "/transactions/:path*",
    "/sign-in/:path*",
    "/sign-up/:path*"
  ]
}