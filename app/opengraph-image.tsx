import { ImageResponse } from "next/og";

export const alt = "Digital Library — คลังหนังสือและเอกสารออนไลน์";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#ffffff",
          backgroundImage: "radial-gradient(circle at 50% 0%, #eff6ff 0%, #ffffff 75%)",
          padding: "60px",
          fontFamily: "sans-serif",
        }}
      >
        {/* Logo Badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "120px",
            height: "120px",
            borderRadius: "32px",
            backgroundColor: "#2563eb",
            boxShadow: "0 20px 30px -10px rgba(37, 99, 235, 0.4)",
            marginBottom: "32px",
          }}
        >
          {/* Book SVG Icon */}
          <svg
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#ffffff"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
          </svg>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: "64px",
            fontWeight: 900,
            color: "#0f172a",
            letterSpacing: "-0.03em",
            marginBottom: "16px",
            textAlign: "center",
          }}
        >
          Digital Library
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: "30px",
            fontWeight: 600,
            color: "#2563eb",
            marginBottom: "24px",
            textAlign: "center",
          }}
        >
          คลังหนังสือและเอกสารดิจิทัลออนไลน์
        </div>

        {/* Highlights Pills */}
        <div
          style={{
            display: "flex",
            gap: "16px",
            marginTop: "12px",
          }}
        >
          <div
            style={{
              padding: "10px 24px",
              borderRadius: "999px",
              backgroundColor: "#f1f5f9",
              color: "#334155",
              fontSize: "18px",
              fontWeight: 700,
              border: "1px solid #e2e8f0",
            }}
          >
            📖 อ่าน PDF ออนไลน์ฟรี
          </div>
          <div
            style={{
              padding: "10px 24px",
              borderRadius: "999px",
              backgroundColor: "#f1f5f9",
              color: "#334155",
              fontSize: "18px",
              fontWeight: 700,
              border: "1px solid #e2e8f0",
            }}
          >
            ✨ 12 หมวดหมู่ครอบคลุมทุกแนว
          </div>
          <div
            style={{
              padding: "10px 24px",
              borderRadius: "999px",
              backgroundColor: "#f1f5f9",
              color: "#334155",
              fontSize: "18px",
              fontWeight: 700,
              border: "1px solid #e2e8f0",
            }}
          >
            ⚡ ไม่ต้องโหลดไฟล์
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
