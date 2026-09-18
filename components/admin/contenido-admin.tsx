"use client";

import { usePathname } from "next/navigation";

/** Re-dispara la animación de entrada en cada cambio de página del panel. */
export function ContenidoAdmin({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="entra">
      {children}
    </div>
  );
}
