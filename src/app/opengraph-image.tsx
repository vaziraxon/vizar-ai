import { ImageResponse } from "next/og";

// The preview picture for shared links (Telegram, Facebook, X …), drawn at request time.
export const runtime = "edge";
export const alt = "VIZAR AI — vizaga tayyorlanish uchun platforma";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "72px 88px",
          background: "linear-gradient(135deg, #C4B5FD 0%, #E0E7FF 48%, #ECFCCB 100%)",
          color: "#0B0B1A",
        }}
      >
        <div style={{ display: "flex", fontSize: 34, fontWeight: 800, letterSpacing: -1, color: "#5B21B6" }}>VIZAR AI</div>
        <div style={{ display: "flex", marginTop: 28, fontSize: 82, fontWeight: 800, lineHeight: 1.04, letterSpacing: -3 }}>Vizaga tayyorlaning.</div>
        <div style={{ display: "flex", fontSize: 82, fontWeight: 800, lineHeight: 1.04, letterSpacing: -3, color: "#6D28D9" }}>VIZAR bilan boshlang.</div>
        <div style={{ display: "flex", marginTop: 40, fontSize: 30, color: "#374151" }}>
          Tayyorgarlik bali · Hujjatlar ombori · Suhbat mashqi · Viza fotosurati
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 44,
            alignSelf: "flex-start",
            padding: "14px 28px",
            borderRadius: 999,
            background: "#16162A",
            color: "#FFFFFF",
            fontSize: 28,
            fontWeight: 700,
          }}
        >
          vizarai.com
        </div>
      </div>
    ),
    size
  );
}
