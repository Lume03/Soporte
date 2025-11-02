import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { FileText, Briefcase, Users, UserCog } from "lucide-react"; 

export default function AdminDashboardPage() {

  const cardHoverEffectClasses = `
    relative overflow-hidden 
    transition-all duration-500 ease-in-out 
    hover:shadow-xl 
    group
  `;
  

  const waveEffect = `
    absolute top-0 -left-full h-full w-full z-5 
    block transform -skew-x-12 bg-gradient-to-r from-transparent via-sky-200/30 to-transparent 
    opacity-0 group-hover:opacity-100 group-hover:translate-x-[200%] 
    transition-all duration-1000 ease-out 
    pointer-events-none
  `;

  return (

    <div className="container mx-auto p-4 md:p-8 space-y-8">
      

      <Card className={`
        ${cardHoverEffectClasses}
        min-h-[180px] md:min-h-[200px] 
        bg-white 
        shadow-lg rounded-lg 
      `}>
        <CardHeader className="flex flex-row items-center justify-between p-6">
          <div className="flex items-center space-x-4">
    
            <div className="p-4 rounded-full bg-blue-100 group-hover:bg-blue-200 transition-colors duration-300">
              <UserCog className="h-9 w-9 text-blue-700" /> 
            </div>
            <div>
              <CardTitle className="text-3xl font-bold">
                Bienvenido, Administrador
              </CardTitle>
              <CardDescription className="text-muted-foreground mt-2 text-lg">
                Gestiona todos los aspectos de la plataforma de soporte desde un solo lugar.
              </CardDescription>
            </div>
          </div>
         
          <div className={waveEffect}></div>
        </CardHeader>
      </Card>
    

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <Link href="/admin/prompt" className="block">
          <Card className={`
            ${cardHoverEffectClasses}
            min-h-[150px] 
            flex flex-col justify-center 
            bg-white
          `}>
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-full bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors duration-300">
                  <FileText className="h-7 w-7" /> 
                </div>
                <div>
                  <CardTitle className="text-xl">Modificar Prompt</CardTitle>
                  <CardDescription className="text-sm mt-1">
                    Ajusta la personalidad y las instrucciones del agente.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <div className={waveEffect}></div> 
          </Card>
        </Link>

        <Link href="/admin/services" className="block">
          <Card className={`
            ${cardHoverEffectClasses}
            min-h-[150px] 
            flex flex-col justify-center
            bg-white
          `}>
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-full bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors duration-300">
                  <Briefcase className="h-7 w-7" /> 
                </div>
                <div>
                  <CardTitle className="text-xl">Gestionar Servicios</CardTitle>
                  <CardDescription className="text-sm mt-1">
                    Define las solicitudes que el agente puede reconocer.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <div className={waveEffect}></div> 
          </Card>
        </Link>

        <Link href="/admin/clients" className="block">
          <Card className={`
            ${cardHoverEffectClasses}
            min-h-[150px] 
            flex flex-col justify-center
            bg-white
          `}>
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-full bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors duration-300">
                  <Users className="h-7 w-7" /> 
                </div>
                <div>
                  <CardTitle className="text-xl">Gestionar Clientes</CardTitle>
                  <CardDescription className="text-sm mt-1">
                    Añade, edita o elimina clientes y sus dominios.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <div className={waveEffect}></div> 
          </Card>
        </Link>

      </div>
    </div>
  );
}

