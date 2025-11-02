import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ServiciosClientUI } from "@/components/admin/services-client-ui";
import { Servicio } from "@/lib/types";


const mockServicios: Servicio[] = [
  { id: 1, nombre: "Reseteo de Contraseña" },
  { id: 2, nombre: "Solicitud de Licencia" },
  { id: 3, nombre: "Problema de Conexión VPN" },
  { id: 4, nombre: "Instalación de Software" },
];


export default function AdminServicesPage() {
  return (

    <Card className="max-w-3xl mx-auto my-8">
      <CardHeader>
        <CardTitle>Gestionar Servicios</CardTitle>
        <CardDescription>
          Crea y administra los servicios ofrecidos por la plataforma.
        </CardDescription>
      </CardHeader>
      <CardContent>

        <ServiciosClientUI initialData={mockServicios} />
      </CardContent>
    </Card>
  );
}