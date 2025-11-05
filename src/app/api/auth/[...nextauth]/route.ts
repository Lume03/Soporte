import NextAuth, { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { NextRequest, NextResponse } from "next/server";

const backendApiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
if (!backendApiUrl) {
  throw new Error("Falta la variable de entorno NEXT_PUBLIC_BACKEND_API_URL");
}

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

            token.role = role;

          } catch (error: any) {
            console.error("Error crítico en el callback JWT:", error.message);
            token.error = "AuthenticationError";
            token.errorMessage = error.message;
          }
        }
        return token;
      },
      async session({ session, token }) {
        
        session.backendAccessToken = token.backendAccessToken;

        session.role = token.role;
        if (session.user) {
          session.user.role = token.role;
        }
        if (token.error) {
         
          session.error = token.error;
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

async function handler(
  req: NextRequest,
  context: { params: { nextauth: string[] } }
) {

  const authOptions = buildAuthOptions(req);
  const authHandler = NextAuth(authOptions);

  const authResponse = await authHandler(req, context);

  const response = new NextResponse(authResponse.body, authResponse);


  if (req.nextUrl.searchParams.has("code")) {
    console.log("Callback de Google detectado. Limpiando cookie 'login-role'.");
    response.cookies.delete("login-role");
  }

  return response;
}

export { handler as GET, handler as POST };
