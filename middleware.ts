import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // API rotalarını ve callback URL'lerini kontrol etmeyelim
  if (request.nextUrl.pathname.startsWith('/api/auth')) {
    console.log('API rotası, middleware atlanıyor:', request.nextUrl.pathname);
    return NextResponse.next();
  }

  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET 
  });
  
  console.log("Middleware çalıştı - URL:", request.nextUrl.pathname);
  console.log("Token durumu:", token ? "Var" : "Yok");
  
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
    console.log("Token var, auth sayfasına erişim engellendi, dashboard'a yönlendiriliyor");
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Oturum açılmamışsa ve korumalı rotalara erişmeye çalışıyorsa
  if (!token && isProtectedRoute) {
    console.log("Token yok, korumalı sayfaya erişim engellendi, sign-in'e yönlendiriliyor");
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // API rotalarını middleware dışında tut
    "/((?!api/auth).*)",
    "/dashboard/:path*",
    "/analytics/:path*",
    "/settings/:path*",
    "/transactions/:path*",
    "/sign-in/:path*",
    "/sign-up/:path*"
  ]
}