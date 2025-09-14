import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  const userEmail = token?.email as string | null;

  // 1. LÓGICA DE USUARIO NO AUTENTICADO
  if (!token) {
    // Si intenta acceder a cualquier ruta protegida que NO SEA /login, redirigir a /login.
    if (pathname !== "/login") {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    // Si está en /login y no tiene token, permitir que vea la página de login.
    return NextResponse.next();
  }

  // 2. LÓGICA DE USUARIO AUTENTICADO (token existe)
  const isUnmsm = userEmail?.endsWith("@unmsm.edu.pe");
  const isGmailAnalyst = userEmail?.endsWith("@gmail.com");

  // Si un usuario YA logueado intenta volver a /login, lo mandamos a su "home" respectivo.
  if (pathname === "/login") {
    const homeUrl = isGmailAnalyst ? "/analyst/dashboard" : "/chat";
    return NextResponse.redirect(new URL(homeUrl, req.url));
  }
  
  // Si el usuario autenticado visita la RUTA RAÍZ (/), lo redirigimos a su "home".
  // (El formulario de login envía por defecto a /chat, pero esto cubre si visitan / directamente).
  if (pathname === "/") {
     const homeUrl = isGmailAnalyst ? "/analyst/dashboard" : "/chat";
     return NextResponse.redirect(new URL(homeUrl, req.url));
  }

  // 3. PROTECCIÓN DE RUTAS (ROLES)
  
  // Caso 1: Usuario de Gmail (Analista) intentando acceder a la interfaz del Chatbot.
  if (isGmailAnalyst && pathname.startsWith("/chat")) {
    // Bloquear acceso y redirigir a su dashboard correcto.
    return NextResponse.redirect(new URL("/analyst/dashboard", req.url));
  }

  // Caso 2: Usuario de UNMSM (Estudiante) intentando acceder a las rutas de Analista.
  if (isUnmsm && pathname.startsWith("/analyst")) {
     // Bloquear acceso y redirigir al chat.
    return NextResponse.redirect(new URL("/chat", req.url));
  }

  // 4. PERMITIR ACCESO
  // Si ninguna regla anterior aplica (ej: UNMSM en /chat, o Gmail en /analyst/dashboard),
  // permitir que la solicitud continúe.
  return NextResponse.next();
}

export const config = {
  // Aplicar este middleware a todas las rutas críticas.
  matcher: [
    "/chat/:path*",
    "/login",
    "/analyst/:path*",
    "/", // Proteger la ruta raíz también
  ],
};