"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { User, Settings, Shield, Users, Briefcase, LayoutDashboard } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from "@/lib/utils"; 


const adminNavLinks = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Modificar Prompt", href: "/admin/prompt", icon: Settings },
  { name: "Gestionar Servicios", href: "/admin/services", icon: Briefcase },
  { name: "Gestionar Clientes", href: "/admin/clients", icon: Users },
];

export function AdminHeader() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const userName = session?.user?.name ?? "Administrador"; 

 const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
 };

 const userInitials = userName === "Administrador" ? <User className="h-5 w-5" /> : getInitials(userName);

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


        <nav className="hidden md:flex items-center gap-x-2">
          {adminNavLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Button
                key={link.name}
                asChild
        
                variant="ghost"
                className={cn(
                  isActive ? "text-blue-600" : "text-gray-600",
                  "font-medium"
                )}
              >
                <Link href={link.href}>
                  <link.icon className="mr-2 h-4 w-4" />
                  {link.name}
                </Link>
              </Button>
            );
          })}
        </nav>

       
        <div className="flex items-center gap-4">
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