import 'next-auth';
import 'next-auth/jwt';


declare module 'next-auth/jwt' {

  interface JWT {

    backendAccessToken?: string;

    role?: string;

    error?: string;
    errorMessage?: string;
  }
}


declare module 'next-auth' {
  interface Session {

    backendAccessToken?: string;

    role?: string;

    error?: string;
    errorMessage?: string;

    user: {
      role?: string;
    } & DefaultSession['user']; 
  }
}
