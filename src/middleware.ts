import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;
  const isAuthPage = pathname === "/login";

  // 1. Si el usuario NO está autenticado
  if (!token) {
    if (!isAuthPage) {
      // Lo redirigimos a la página de login.
      return NextResponse.redirect(new URL("/login", req.url));
    }
    // Si está en /login y no tiene token, permitir acceso
    return NextResponse.next();
  }

  // 2. Si el usuario SÍ está autenticado (AQUÍ EMPIEZA LA LÓGICA DE ROLES)
  
  // --- INICIO DE LÓGICA DE ROLES (Basado en tu lógica anterior) ---
  const email = token.email as string | null;
  const ADMIN_EMAIL = "grupo2soporteadm@gmail.com";

  // Determinamos el rol basado en el email
  const isAdmin = email === ADMIN_EMAIL;
  // Asumimos @gmail.com (que no sea admin) es Analista
  const isAnalista = email?.endsWith("@gmail.com") && !isAdmin; 
  // El resto (ej: @unmsm.edu.pe o cualquier otro) es Colaborador
  const isColaborador = !isAdmin && !isAnalista; 
  
  // Determinamos el rol y la "home page" correcta
  let userRole: string = "colaborador"; // Default
  let homeUrl: string = "/chat";
  
  if (isAdmin) {
      userRole = "admin";
      homeUrl = "/admin/dashboard";
  } else if (isAnalista) {
      userRole = "analista";
      homeUrl = "/analyst/dashboard";
  }
  // --- FIN DE LÓGICA DE ROLES ---


  // 2.1. Si está autenticado e intenta ir a /login
  if (isAuthPage) {
    // Lo enviamos a su "home" correcta (ya no solo a /chat)
    return NextResponse.redirect(new URL(homeUrl, req.url));
  }

  // 2.2. Si está autenticado y va a la ruta raíz "/"
  if (pathname === "/") {
    // Lo enviamos a su "home" correcta
    return NextResponse.redirect(new URL(homeUrl, req.url));
  }

  // 3. Lógica de Protección de Rutas (ROLES)
  // (Esto evita que un rol entre a la página de otro)
  
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

  // 4. Si pasa todas las validaciones, dejamos que continúe.
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