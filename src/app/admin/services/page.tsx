import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ServiciosClientUI } from "@/components/admin/services-client-ui";


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
        <ServiciosClientUI />
      </CardContent>
    </Card>
  );
}