import Link from "next/link";
import { headers } from "next/headers";
import { ArrowLeft } from "lucide-react";
import { especificacionOpenApi } from "@/lib/api/openapi";
import { DocumentacionApi } from "@/components/admin/integraciones/documentacion-api";

export const dynamic = "force-dynamic";

export default async function DocumentacionPage() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const origen = `${proto}://${host}`;

  return (
    <div className="space-y-6">
      <Link href="/admin/integraciones" className="inline-flex items-center gap-1.5 text-sm text-niebla hover:text-carbon">
        <ArrowLeft size={15} /> Integraciones
      </Link>
      <DocumentacionApi spec={especificacionOpenApi(origen)} origen={origen} />
    </div>
  );
}
