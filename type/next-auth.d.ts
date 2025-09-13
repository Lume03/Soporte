// Archivo: /types/next-auth.d.ts

import 'next-auth';
import 'next-auth/jwt';

// Declaramos que el módulo 'next-auth/jwt' ahora tiene una propiedad extra
declare module 'next-auth/jwt' {
  /** Devuelto por el callback `jwt` */
  interface JWT {
    /** Nuestro Access Token personalizado del backend de FastAPI */
    backendAccessToken?: string;
  }
}

// Declaramos que el módulo 'next-auth' (para la sesión del cliente) también la tiene
declare module 'next-auth' {
  interface Session {
    /** Nuestro Access Token personalizado del backend de FastAPI */
    backendAccessToken?: string;
  }
}