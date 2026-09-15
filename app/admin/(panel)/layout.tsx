import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import { AdminShell } from "@/components/admin/admin-shell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  const { data: staff } = await supabase
    .from("staff")
    .select("nombre, activo")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!staff || !staff.activo) {
    await supabase.auth.signOut();
    redirect("/admin/login?error=no-autorizado");
  }

  return (
    <AdminShell nombre={staff.nombre ?? user.email ?? "Staff"}>
      {children}
    </AdminShell>
  );
}
