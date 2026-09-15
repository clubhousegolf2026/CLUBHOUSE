"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { eliminarBloqueo } from "@/app/admin/(panel)/calendario/actions";

export function EliminarBloqueoButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await eliminarBloqueo(id);
          router.refresh();
        })
      }
      className="grid h-8 w-8 place-items-center rounded-full text-error hover:bg-error/10 disabled:opacity-40"
      aria-label="Eliminar"
    >
      <Trash2 size={15} />
    </button>
  );
}
