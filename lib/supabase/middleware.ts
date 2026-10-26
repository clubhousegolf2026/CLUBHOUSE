import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/** Refresca la sesión de Supabase en cada request a /admin y redirige a
 *  /admin/login si no hay usuario. Vive aparte de lib/supabase/server.ts
 *  porque en middleware las cookies se leen/escriben sobre el objeto
 *  request/response, no sobre next/headers. */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return response;

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  // Pantallas de acceso: se ven sin sesión (entrar, pedir enlace, crear contraseña).
  const esPublica = ["/admin/login", "/admin/recuperar", "/admin/nueva-clave"].includes(pathname);

  if (!user && !esPublica) {
    const loginUrl = new URL("/admin/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Con contraseña temporal solo se puede ir a «Mi cuenta» a cambiarla.
  if (user?.user_metadata?.debe_cambiar_clave === true && !esPublica && pathname !== "/admin/cuenta" && !request.headers.get("next-action")) {
    return NextResponse.redirect(new URL("/admin/cuenta?cambiar=1", request.url));
  }

  return response;
}
