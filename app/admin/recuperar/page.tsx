import { MarcoAcceso } from "@/components/admin/marco-acceso";
import { RecuperarForm } from "@/components/admin/recuperar-form";

export default function RecuperarPage() {
  return (
    <MarcoAcceso titulo="¿Olvidaste tu contraseña?" descripcion="Escribe tu correo y te enviamos un enlace para crear una nueva.">
      <RecuperarForm />
    </MarcoAcceso>
  );
}
