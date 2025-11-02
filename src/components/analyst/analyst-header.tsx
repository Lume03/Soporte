"use client";

import { signOut, useSession } from "next-auth/react";
import { User } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';


export function AnalystHeader() {
  

  const { data: session } = useSession();
  const userName = session?.user?.name ?? "Analista";

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const userInitials = userName === "Analista" ? <User className="h-5 w-5" /> : getInitials(userName);

  return (
    <header className="bg-white border-b border-gray-200 px-8 py-5 shadow-sm">
      <div className="flex items-center justify-between w-full">
        

        <div className="flex items-center gap-4">
          <div className="w-16 h-16"> 
            <img 
              src="/favicon.ico" 
              alt="Asistente Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Plataforma de Soporte</h1>
            <p className="text-sm text-gray-500">Siempre dispuesto a ayudarte</p>
          </div>
        </div>


        <div className="flex items-center gap-4 ml-auto">
          <span className="text-sm text-gray-600">Bienvenido, {userName}</span>
          <Avatar className="h-9 w-9 border">
            <AvatarFallback className="bg-gray-200 text-gray-600">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <Button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Cerrar Sesión
          </Button>
        </div>
      </div>
    </header>
  );
}
