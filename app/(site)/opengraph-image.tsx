import { ImageResponse } from "next/og";

export const alt = "Clubhouse · Turismo de golf en Colombia";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 90,
          background: "linear-gradient(135deg, #0b3d2e, #093226 55%, #1f6b4d)",
          color: "#f6f3ec",
        }}
      >
        <div style={{ fontSize: 30, letterSpacing: 8, color: "#c6a664" }}>
          TURISMO DE GOLF
        </div>
        <div style={{ fontSize: 96, marginTop: 24, lineHeight: 1.05 }}>
          Clubhouse
        </div>
        <div style={{ fontSize: 40, marginTop: 28, opacity: 0.85 }}>
          Arma tu viaje de golf en Colombia y mira el precio al instante
        </div>
      </div>
    ),
    size,
  );
}
