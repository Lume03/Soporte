import { withAuth } from "next-auth/middleware";

export default withAuth(
  // Esta función 'middleware' puede estar vacía si solo necesitas proteger rutas.
  // next-auth se encarga del resto basado en los callbacks.
  function middleware(req) {
    // Puedes agregar lógica personalizada aquí si la necesitas en el futuro.
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // Si hay un token (lo que significa que el inicio de sesión fue exitoso),
        // el usuario está autorizado.
        return !!token;
      },
    },
    // Le decimos a next-auth dónde está nuestra página de login.
    pages: {
      signIn: "/login",
    },
  }
);

// --- ESTA ES LA PARTE IMPORTANTE (LA CORRECCIÓN) ---
// Adaptamos el matcher de SoporteAI para que funcione con tu proyecto Soporte.
export const config = {
  matcher: [
    /*
     * Coincide con todas las rutas excepto las que comienzan con:
     * - api (rutas de API, incluyendo nuestra API de auth)
     * - _next/static (archivos estáticos de Next.js)
     * - _next/image (imágenes optimizadas de Next.js)
     * - favicon.ico (el ícono de la pestaña)
     * - login (la página de inicio de sesión pública)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|login).*)',
    
    // También protegemos explícitamente la raíz (/)
    '/', 
  ],
};