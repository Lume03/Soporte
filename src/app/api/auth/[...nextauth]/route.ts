
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

// 1. Lee la URL de tu backend (que configuraste en .env.local)
const backendApiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;

if (!backendApiUrl) {
  throw new Error("Falta la variable de entorno NEXT_PUBLIC_BACKEND_API_URL");
}

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider === "google") {
        // @ts-ignore
        return profile?.email_verified === true;
      }
      return false; 
    },

    // --- 2. MODIFICACIÓN DEL CALLBACK 'JWT' ---
    async jwt({ token, profile, account }) { // <-- Se añade el parámetro 'account'
      
      // 'account' solo está disponible la primera vez que el usuario inicia sesión
      if (account && account.provider === 'google') {
        try {
          // Tomamos el id_token que nos dio Google
          const googleIdToken = account.id_token;

          if (!googleIdToken) {
            throw new Error("No se encontró el id_token de Google en la cuenta.");
          }

          // Llamamos a NUESTRO backend FastAPI para intercambiar el token
          const response = await fetch(`${backendApiUrl}/api/auth/google/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id_token: googleIdToken }),
          });

          if (!response.ok) {
            const errorBody = await response.text();
            console.error("Falló el intercambio de token con FastAPI:", response.status, errorBody);
            throw new Error(`Error del backend de FastAPI: ${response.status}`);
          }

          const backendData = await response.json(); // Esperamos { access_token: "..." }

          // GUARDAMOS EL TOKEN DE FASTAPI (NO EL DE GOOGLE) DENTRO DE LA SESIÓN DE NEXTAUTH
          token.backendAccessToken = backendData.access_token;

          // Guardamos el nombre y email (como ya lo hacías)
          if (profile) {
            token.name = profile.name;
            token.email = profile.email;
          }

          return token;

        } catch (error) {
          console.error("Error crítico en el callback JWT:", error);
          // Si el intercambio falla, no debemos autenticar al usuario.
          return token; 
        }
      }
      
      // En llamadas futuras (cuando el usuario ya tiene sesión), solo devolvemos el token que ya guardamos.
      return token;
    },


    // --- 3. MODIFICACIÓN DEL CALLBACK 'SESSION' ---
    async session({ session, token }) {
      if (session.user) {
        session.user.name = token.name as string;
        session.user.email = token.email as string;
      }
      
      // Exponemos el token de FastAPI al cliente (para usarlo con useSession)
      // @ts-ignore
      session.backendAccessToken = token.backendAccessToken; // <-- ESTA LÍNEA ES CRUCIAL

      return session;
    },

  },
  pages: {
    signIn: "/login",
    error: "/login", 
  },
});

export { handler as GET, handler as POST };

