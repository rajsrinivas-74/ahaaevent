import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const name        = searchParams.get("name")    || "Ahaa Event";
  const tagline     = searchParams.get("tagline")  || "";
  const type        = searchParams.get("type")     || "";
  const date        = searchParams.get("date")     || "";
  const primary     = searchParams.get("primary")  || "#3b82a6";
  const accent      = searchParams.get("accent")   || "#6b5fa7";
  const bg          = searchParams.get("bg")       || "#020617";
  const logoUrl     = searchParams.get("logo")     || "";
  const bannerUrl   = searchParams.get("banner")   || "";

  const typeLabel = type.replace(/_/g, " ");

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          background: bg,
          color: "#f8fafc",
          fontFamily: "sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Banner image as background, blurred */}
        {bannerUrl && (
          <img
            src={bannerUrl}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: 0.15,
            }}
            alt=""
          />
        )}

        {/* Gradient overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(135deg, ${bg}ee 0%, ${bg}88 50%, ${bg}dd 100%)`,
          }}
        />

        {/* Top accent bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "4px",
            background: `linear-gradient(90deg, ${primary}, ${accent})`,
          }}
        />

        {/* Content */}
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "56px 64px",
            height: "100%",
          }}
        >
          {/* Top row: logo + brand */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            {logoUrl && (
              <img
                src={logoUrl}
                style={{ width: "56px", height: "56px", borderRadius: "12px", objectFit: "cover" }}
                alt=""
              />
            )}
            <div
              style={{
                fontSize: "16px",
                fontWeight: 600,
                color: "#ffffff80",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              Ahaa Event Hub
            </div>
          </div>

          {/* Main content */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Type pill */}
            {typeLabel && (
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "6px 16px",
                  borderRadius: "999px",
                  fontSize: "14px",
                  fontWeight: 600,
                  color: primary,
                  background: `${primary}20`,
                  border: `1px solid ${primary}50`,
                  textTransform: "capitalize",
                  width: "fit-content",
                }}
              >
                {typeLabel}
              </div>
            )}

            {/* Event name */}
            <div
              style={{
                fontSize: name.length > 40 ? "48px" : "64px",
                fontWeight: 800,
                lineHeight: 1.1,
                color: "#f8fafc",
                maxWidth: "900px",
              }}
            >
              {name}
            </div>

            {/* Tagline */}
            {tagline && (
              <div
                style={{
                  fontSize: "24px",
                  color: `${primary}cc`,
                  fontWeight: 500,
                  maxWidth: "800px",
                }}
              >
                {tagline}
              </div>
            )}
          </div>

          {/* Bottom row: date + gradient tag */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            {date ? (
              <div style={{ fontSize: "18px", color: "#ffffff60", fontWeight: 500 }}>
                📅 {date}
              </div>
            ) : <div />}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 20px",
                borderRadius: "12px",
                background: `linear-gradient(135deg, ${primary}30, ${accent}30)`,
                border: `1px solid ${primary}40`,
                fontSize: "16px",
                fontWeight: 600,
                color: "#f8fafc",
              }}
            >
              Register Now →
            </div>
          </div>
        </div>

        {/* Side accent glow */}
        <div
          style={{
            position: "absolute",
            right: "-80px",
            top: "50%",
            transform: "translateY(-50%)",
            width: "400px",
            height: "400px",
            borderRadius: "999px",
            background: `radial-gradient(circle, ${accent}30 0%, transparent 70%)`,
          }}
        />
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
