import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;
  const isAuthPage = pathname === "/login";

  if (!token) {
    if (!isAuthPage) {
 
      return NextResponse.redirect(new URL("/login", req.url));
    }

    return NextResponse.next();
  }

  const email = token.email as string | null;
  const ADMIN_EMAIL = "grupo2soporteadm@gmail.com";


  const isAdmin = email === ADMIN_EMAIL;

  const userRole = isAdmin ? "admin" : (token.role as string | "colaborador");

  let homeUrl: string = "/chat";
  
  if (userRole === "admin") {
      homeUrl = "/admin/dashboard";
  } else if (userRole === "analista") {
      homeUrl = "/analyst/dashboard";
  }

  if (isAuthPage) {
   
    return NextResponse.redirect(new URL(homeUrl, req.url));
  }

  if (pathname === "/") {
    
    return NextResponse.redirect(new URL(homeUrl, req.url));
  }
  
  // Caso 1: Proteger /admin
  if (pathname.startsWith("/admin")) {
    if (userRole !== "admin") {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // Caso 2: Proteger /analyst
  else if (pathname.startsWith("/analyst")) {
    if (userRole !== "analista") {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // Caso 3: Proteger /chat (colaborador)
  else if (pathname.startsWith("/chat")) {
    if (userRole !== "colaborador") {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
  "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};