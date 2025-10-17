import NextAuth, { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { NextRequest, NextResponse } from "next/server";

const backendApiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
if (!backendApiUrl) {
  throw new Error("Falta la variable de entorno NEXT_PUBLIC_BACKEND_API_URL");
}

// Esta función construye las opciones de NextAuth para cada petición.
// Lee la cookie en un contexto donde sí es seguro hacerlo.
function buildAuthOptions(req: NextRequest): AuthOptions {
  const role = req.cookies.get("login-role")?.value ?? "colaborador";

  return {
    providers: [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      }),
    ],
    callbacks: {
      async jwt({ token, account, profile }) {
        if (account?.provider === 'google') {
          try {
            const googleIdToken = account.id_token;
            if (!googleIdToken) throw new Error("No se encontró el id_token de Google.");

            // Usamos la variable 'role' que leímos fuera del callback.
            const endpoint = `${backendApiUrl}/api/auth/google/login/${role}`;
            
            const response = await fetch(endpoint, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ id_token: googleIdToken }),
            });

            if (!response.ok) {
              const errorBody = await response.json();
              throw new Error(errorBody.detail || `Error del backend: ${response.status}`);
            }

            const backendData = await response.json();
            token.backendAccessToken = backendData.access_token;

            if (profile) {
              token.name = profile.name;
              token.email = profile.email;
            }
          } catch (error: any) {
            console.error("Error crítico en el callback JWT:", error.message);
            token.error = "AuthenticationError";
            token.errorMessage = error.message;
          }
        }
        return token;
      },
      async session({ session, token }) {
        // @ts-ignore
        session.backendAccessToken = token.backendAccessToken;
        if (token.error) {
          // @ts-ignore
          session.error = token.error;
          // @ts-ignore
          session.errorMessage = token.errorMessage;
        }
        return session;
      },
    },
    pages: {
      signIn: "/login",
      error: "/login",
    },
  };
}

// Unificamos la lógica en una sola función handler.
async function handler(
  req: NextRequest,
  context: { params: { nextauth: string[] } }
) {
  // 1. Construimos las opciones de autenticación leyendo el rol de la cookie.
  const authOptions = buildAuthOptions(req);
  const authHandler = NextAuth(authOptions);

  // 2. Dejamos que NextAuth procese la petición (login, callback, error, etc.).
  const authResponse = await authHandler(req, context);

  // 3. **LA CORRECCIÓN CLAVE**: Creamos un nuevo `NextResponse` a partir de la respuesta de NextAuth.
  // Esto nos garantiza que siempre tendremos un objeto con el método `.cookies`.
  const response = new NextResponse(authResponse.body, authResponse);

  // 4. Ahora sí podemos limpiar la cookie de forma segura.
  response.cookies.delete("login-role");

  // 5. Devolvemos la respuesta final.
  return response;
}

// Exportamos el mismo handler para GET y POST.
export { handler as GET, handler as POST };
