"use client";

import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { signIn } from "next-auth/react";
import GoogleIcon from "@/components/icons/google-icon";
import Link from 'next/link';

export function LoginForm() {
  const [isLoadingUser, setIsLoadingUser] = useState(false);
  const [isLoadingAnalyst, setIsLoadingAnalyst] = useState(false);
  const { toast } = useToast();

  const handleLogin = async (role: 'user' | 'analyst') => {
    const setIsLoading = role === 'user' ? setIsLoadingUser : setIsLoadingAnalyst;
    setIsLoading(true);

    const backendRole = role === 'user' ? 'colaborador' : 'analista';
    const callbackUrl = role === 'user' ? '/chat' : '/analyst/dashboard';

    try {
      // 1. Establece la cookie con el rol ANTES de iniciar sesión.
      await fetch('/api/set-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: backendRole }),
      });

      // 2. Procede con el inicio de sesión de Google.
      await signIn("google", { callbackUrl });

    } catch (error) {
      console.error(`Error al iniciar sesión como ${role}:`, error);
      toast({
        title: "Error de inicio de sesión",
        description: "No se pudo autenticar con Google. Intenta de nuevo.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-10 login-card">
      <div className="flex justify-center mb-6">
        <div className="w-24 h-24">
          <img
            src="/favicon.ico"
            alt="Asistente Logo"
            className="w-full h-full object-contain"
          />
        </div>
      </div>
      
      
      <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">
        Plataforma de Soporte
      </h1>
      
      
      <p className="text-sm text-center text-gray-500 mb-8">
        Siempre dispuesto a ayudarte
      </p>
      
      <h2 className="text-3xl font-bold text-center text-gray-900 mb-2">
        ¡Bienvenido!
      </h2>
      
      <p className="text-base text-center text-gray-600 mb-8">
        Selecciona tu rol para ingresar a la plataforma
      </p>

      <div className="space-y-4">
        <Button
            onClick={() => handleLogin('user')}
            disabled={isLoadingUser || isLoadingAnalyst}
            variant="outline"
            className="w-full h-14 text-lg py-3 font-semibold rounded-lg bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:shadow-lg transition-all duration-300"
        >
            {isLoadingUser ? (
                <>
                    <Loader2 className="animate-spin h-5 w-5 mr-2" />
                    Iniciando sesión...
                </>
            ) : (
                <>
                    <GoogleIcon className="h-6 w-6" />
                    <span className="ml-3 text-base">Ingresar como Usuario</span>
                </>
            )}
        </Button>
        <Button
            onClick={() => handleLogin('analyst')}
            disabled={isLoadingAnalyst || isLoadingUser}
            variant="outline"
            className="w-full h-14 text-lg py-3 font-semibold rounded-lg bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:shadow-lg transition-all duration-300"
        >
            {isLoadingAnalyst ? (
                <>
                    <Loader2 className="animate-spin h-5 w-5 mr-2" />
                    Iniciando sesión...
                </>
            ) : (
                <>
                    <GoogleIcon className="h-6 w-6" />
                    <span className="ml-3 text-base">Ingresar como Analista</span>
                </>
            )}
        </Button>
      </div>
      
      <div className="mt-6 text-center text-xs text-gray-500 space-y-2">
          <p>
              Al continuar, aceptas nuestros{' '}
              <Link href="#" className="text-blue-600 hover:underline">
                  Términos de Servicio
              </Link>{' '}
              y{' '}
              <Link href="#" className="text-blue-600 hover:underline">
                  Política de Privacidad
              </Link>
          </p>
      </div>
    </div>
  );
}


