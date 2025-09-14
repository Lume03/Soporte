
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

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
      if (account?.provider === "google" && profile?.email) {
        
        // 1. Asegurarse que el email esté verificado por Google
        // @ts-ignore
        if (!profile?.email_verified) {
          console.warn("Intento de login con email no verificado:", profile.email);
          return false; // Denegar acceso si el email no está verificado
        }

        const email = profile.email;

        if (email.endsWith('@unmsm.edu.pe') || email.endsWith('@gmail.com')) {
          return true; // <-- Devolver TRUE permite que el callback JWT se ejecute.
        }

        console.warn("Dominio no autorizado intentó iniciar sesión:", email);
        return false;

      }
      
      // Denegar cualquier otro tipo de inicio de sesión o si falta información
      return false; 
    },

  
    async jwt({ token, profile, account }) { 
      
      if (account && account.provider === 'google') {
        try {
          const googleIdToken = account.id_token;

          if (!googleIdToken) {
            throw new Error("No se encontró el id_token de Google en la cuenta.");
          }

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

          const backendData = await response.json(); 

          token.backendAccessToken = backendData.access_token;

          if (profile) {
            token.name = profile.name;
            token.email = profile.email;
          }

          return token;

        } catch (error) {
          console.error("Error crítico en el callback JWT:", error);
          return token; 
        }
      }
      
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.name = token.name as string;
        session.user.email = token.email as string;
      }
      
      // @ts-ignore
      session.backendAccessToken = token.backendAccessToken; 

      return session;
    },

  },
  pages: {
    signIn: "/login",
    error: "/login", 
  },
});

export { handler as GET, handler as POST };
