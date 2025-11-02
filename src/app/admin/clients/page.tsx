import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ClientesClientUI } from "@/components/admin/clientes-client-ui"; 
import { Cliente } from "@/lib/types";

const mockClientes: Cliente[] = [
  { id: 1, nombre: "Empresa Uno", dominio: "empresauno.com" },
  { id: 2, nombre: "Compañía Dos", dominio: "dos.pe" },
  { id: 3, nombre: "Negocio Tres", dominio: "negociotres.com.pe" },
];


export default function AdminClientesPage() {
  return (

    <Card className="max-w-4xl mx-auto my-8"> 
      <CardHeader>
        <CardTitle>Gestionar Clientes</CardTitle>
        <CardDescription>
          Crea y administra los clientes y dominios de la plataforma.
        </CardDescription>
      </CardHeader>
      <CardContent>

        <ClientesClientUI initialData={mockClientes} />
      </CardContent>
    </Card>
  );
}