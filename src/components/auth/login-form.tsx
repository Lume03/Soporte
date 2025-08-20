"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Bot } from 'lucide-react';

// Credenciales fijas para demo
const DEMO_CREDENTIALS = {
  email: "pepe.gonzalez@empresa.com",
  password: "soporte123"
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
   
    // Verificar credenciales demo
    if (email === DEMO_CREDENTIALS.email && password === DEMO_CREDENTIALS.password) {
      // Login exitoso
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify({ 
            email: DEMO_CREDENTIALS.email,
            name: "Pepe González" 
          }));
        }
        router.push('/chat');
      }, 1000);
    } else {
      // Credenciales incorrectas
      setTimeout(() => {
        toast({
          title: "Error de autenticación",
          description: "El correo o contraseña son incorrectos.",
          variant: "destructive",
        });
        setIsLoading(false);
      }, 1000);
    }
  };
  
  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-10">
      {/* Logo */}
      <div className="flex justify-center mb-6">
        <div className="w-16 h-16 bg-[#4285f4] rounded-lg flex items-center justify-center">
          <Bot className="h-9 w-9 text-white" />
        </div>
      </div>
      
      {/* Título */}
      <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">
        Bienvenido a Soporte
      </h1>
      
      {/* Subtítulo */}
      <p className="text-sm text-center text-gray-500 mb-8">
        Tu asistente de soporte impulsado por IA.
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
      
      {/* Info de credenciales demo (opcional - quitar en producción) */}
      <div className="mt-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-xs text-center text-blue-700">
          <strong>Demo:</strong> pepe.gonzalez@empresa.com / soporte123
        </p>
      </div>
    </div>
  );
}
