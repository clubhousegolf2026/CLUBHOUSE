import { MarcoAcceso } from "@/components/admin/marco-acceso";
import { NuevaClaveForm } from "@/components/admin/nueva-clave-form";

export default function NuevaClavePage() {
  return (
    <MarcoAcceso titulo="Crea tu contraseña" descripcion="Elige una contraseña propia para entrar al panel.">
      <NuevaClaveForm />
    </MarcoAcceso>
  );
}
