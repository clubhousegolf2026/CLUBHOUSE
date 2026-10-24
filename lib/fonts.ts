import localFont from "next/font/local";

// Fuentes autoalojadas (paquetes @fontsource-variable): el build no depende de
// descargar nada de Google Fonts, que hacía fallar el despliegue en Vercel.
export const fraunces = localFont({
  src: [
    {
      path: "./fuentes/fraunces-latin-wght-normal.woff2",
      weight: "100 900",
      style: "normal",
    },
  ],
  display: "swap",
  variable: "--font-fraunces",
});

export const inter = localFont({
  src: [
    {
      path: "./fuentes/inter-latin-wght-normal.woff2",
      weight: "100 900",
      style: "normal",
    },
  ],
  display: "swap",
  variable: "--font-inter",
});
