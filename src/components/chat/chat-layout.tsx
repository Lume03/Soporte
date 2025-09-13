"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, LogOut, Home } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useSession, signOut } from "next-auth/react"; // <-- 1. IMPORTAR HOOKS DE NEXT-AUTH

export function ChatLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: session } = useSession(); // <-- 2. OBTENER LA SESIÓN

  // 3. OBTENER EL NOMBRE Y LAS INICIALES DESDE LA SESIÓN
  const userName = session?.user?.name ?? "Usuario";
  const userInitials = userName?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() ?? "U";

  // 4. ACTUALIZAR EL LOGOUT PARA USAR NEXT-AUTH
  const handleLogout = () => {
    signOut({ callbackUrl: '/login' }); // Redirige al login al cerrar sesión
  };

  const handleGoToHome = () => {
    if (typeof window !== 'undefined' && (window as any).resetChatToHome) {
      (window as any).resetChatToHome();
    } else {
      router.push('/chat');
    }
  };

  // El useEffect y useState para userName (que usaban localStorage) ya no son necesarios.

  return (
      <div className="min-h-screen flex flex-col bg-[#F7FAFC]">
        
        <header className="bg-white border-b border-gray-200 px-8 py-5 shadow-sm">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-4">
              <div onClick={handleGoToHome} className="flex items-center gap-4 cursor-pointer">
                <div className="w-12 h-12">
                  <img src="https://i.ibb.co/S4CngF6F/new-analytics-logo.png" alt="Analytics Logo" className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
                  <p className="text-sm text-gray-500">Let the data drive the strategy</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 ml-auto">
              <span className="text-sm text-gray-600">
               
                Bienvenida, {userName}
              </span>
              <Avatar className="h-9 w-9 border">
                <AvatarFallback className="bg-gray-200 text-gray-600">
                  
                  {userInitials} 
                </AvatarFallback>
              </Avatar>
              <Button
                  onClick={handleLogout} // <-- 6. LA FUNCIÓN DE LOGOUT AHORA USA signOut
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <LogOut className="w-4 h-4" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1">
          {children}
        </main>
      </div>
  );
}
