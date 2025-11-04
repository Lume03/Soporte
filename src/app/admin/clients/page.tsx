import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ClientesClientUI } from "@/components/admin/clientes-client-ui"; 


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

        <ClientesClientUI />
      </CardContent>
    </Card>
  );
}