"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

// Credenciales para el usuario final (cliente)
const USER_CREDENTIALS = {
  email: "ana.gonzales@example.com",
  password: "soporte123"
};

// Credenciales para el analista de soporte
const ANALYST_CREDENTIALS = {
  email: "luis.rodriguez@example.com", // Corregido para que coincida con la imagen
  password: "analyst123" // Contraseña sugerida
};


export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simular una pequeña demora de red
    setTimeout(() => {
      // Verificar si es el analista
      if (email === ANALYST_CREDENTIALS.email && password === ANALYST_CREDENTIALS.password) {
        if (typeof window !== 'undefined') {
          localStorage.clear();
          localStorage.setItem('user', JSON.stringify({
            email: ANALYST_CREDENTIALS.email,
            name: "Luis Rodríguez",
            role: "analyst" // Añadimos un rol para diferenciarlo
          }));
        }
        router.push('/analyst/dashboard'); // Redirigir al dashboard del analista
      }
      // Verificar si es el usuario final
      else if (email === USER_CREDENTIALS.email && password === USER_CREDENTIALS.password) {
        if (typeof window !== 'undefined') {
          localStorage.clear();
          localStorage.setItem('user', JSON.stringify({
            email: USER_CREDENTIALS.email,
            name: "Ana González",
            role: "user"
          }));
        }
        router.push('/chat'); // Redirigir a la página de chat
      }
      // Credenciales incorrectas
      else {
        toast({
          title: "Error de autenticación",
          description: "El correo o contraseña son incorrectos.",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-10">
      {/* Logo de Analytics */}
      <div className="flex justify-center mb-6">
        <div className="w-16 h-16">
          <img
            src="https://i.ibb.co/S4CngF6F/new-analytics-logo.png"
            alt="Analytics Logo"
            className="w-full h-full object-contain"
          />
        </div>
      </div>
      
      {/* Título Analytics */}
      <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">
        analytics
      </h1>
      
      {/* Slogan Analytics */}
      <p className="text-sm text-center text-gray-500 mb-8">
        Let the data drive the strategy
      </p>
      
      {/* Formulario */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="email"
            placeholder="correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#4285f4] focus:bg-white transition-all text-sm"
          />
        </div>
        
        <div>
          <input
            type="password"
            placeholder="contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#4285f4] focus:bg-white transition-all text-sm"
          />
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 bg-[#4285f4] hover:bg-[#3367d6] text-white font-medium rounded-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed mt-6"
        >
          {isLoading ? 'Iniciando...' : 'Iniciar sesión'}
        </button>
      </form>
      
      {/* Info de credenciales demo */}
      <div className="mt-6 p-3 bg-blue-50 rounded-lg border border-blue-200 text-xs text-center text-blue-700">
        <p><strong>Usuario:</strong> ana.gonzales@example.com / soporte123</p>
        <p className="mt-1"><strong>Analista:</strong> luis.rodriguez@example.com / analyst123</p>
      </div>
    </div>
  );
}

