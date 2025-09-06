"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, LogOut, Home } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

const DEMO_USER = {
  name: "Ana González",
  email: "ana.gonzales@example.com",
  initials: "AG"
};

export function ChatLayout({ children }: { children: React.ReactNode }) {
  const [userName, setUserName] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      setUserName(storedUser ? JSON.parse(storedUser).name : DEMO_USER.name);
    }
  }, []);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
    }
    router.push('/login');
  };

  const handleGoToHome = () => {
    if (typeof window !== 'undefined' && (window as any).resetChatToHome) {
      (window as any).resetChatToHome();
    } else {
      router.push('/chat');
    }
  };

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
                  <User className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              <Button
                  onClick={handleLogout} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
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
