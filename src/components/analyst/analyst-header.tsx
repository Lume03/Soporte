"use client";

import { useRouter } from 'next/navigation';
import { User } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

export function AnalystHeader() {
  const router = useRouter();

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
    }
    router.push('/login');
  };

  return (
    <header className="bg-white border-b border-gray-200 px-8 py-5 shadow-sm">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12">
            <img src="https://i.ibb.co/S4CngF6F/new-analytics-logo.png" alt="Analytics Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">analytics</h1>
            <p className="text-sm text-gray-500">Let the data drive the strategy</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">Bienvenido, Luis Rodríguez</span>
          <Avatar className="h-9 w-9 border">
            <AvatarFallback className="bg-gray-200 text-gray-600">
              <User className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
          <Button onClick={handleLogout} className="bg-blue-600 hover:bg-blue-700 text-white">
            Cerrar Sesión
          </Button>
        </div>
      </div>
    </header>
  );
}
