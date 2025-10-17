import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  const isAuthPage = pathname === "/login";

  // 1. Si el usuario NO está autenticado e intenta acceder a una ruta protegida
  if (!token && !isAuthPage) {
    // Lo redirigimos a la página de login.
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // 2. Si el usuario SÍ está autenticado y por alguna razón vuelve a la página de login
  if (token && isAuthPage) {
    // Lo enviamos a una página por defecto (ej. /chat) para evitar que vea el login de nuevo.
    // La redirección específica del botón ya fue manejada por NextAuth al iniciar sesión.
    return NextResponse.redirect(new URL("/chat", req.url));
  }

  // 3. Si ninguna de las condiciones anteriores se cumple, dejamos que continúe a su destino.
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