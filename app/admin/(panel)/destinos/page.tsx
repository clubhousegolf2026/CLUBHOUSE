import { redirect } from "next/navigation";

// Destinos se unificó con Experiencias: ahí se ubica cada viaje en el globo.
export default function DestinosAdminPage() {
  redirect("/admin/experiencias");
}
