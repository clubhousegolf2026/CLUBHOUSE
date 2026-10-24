import { redirect } from "next/navigation";

// Destinos y Paquetes se unificaron: Tailandia y Utah se gestionan en Paquetes.
export default function DestinosAdminPage() {
  redirect("/admin/paquetes");
}
