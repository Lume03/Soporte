"use client";

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
   
    // Aquí simularemos el login - después puedes conectar con Firebase
    setTimeout(() => {
      router.push('/chat');
    }, 1000);
  };
  
  return (
    <Card className="w-full max-w-md shadow-2xl border-0">
      <CardHeader className="space-y-1 pt-16 pb-8 px-10">
        <CardTitle className="text-2xl font-bold text-center">
          Iniciar Sesión
        </CardTitle>
      </CardHeader>
      <CardContent className="px-10 pb-16">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="sr-only">
              Correo electrónico
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-14 px-5 bg-gray-50 border-gray-200 focus:bg-white text-base"
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="sr-only">
              Contraseña
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-14 px-5 bg-gray-50 border-gray-200 focus:bg-white text-base"
              disabled={isLoading}
            />
          </div>
          <div className="pt-3">
            <Button
              type="submit"
              className="w-full h-14 text-base font-medium bg-[#4285f4] hover:bg-[#357ae8] text-white"
              disabled={isLoading}
            >
              {isLoading ? 'Iniciando...' : 'Iniciar sesión'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

