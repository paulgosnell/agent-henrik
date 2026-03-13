import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Agent Henrik — Luxury Underground Travel Curation";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const cormorantFont = await fetch(
    "https://fonts.gstatic.com/s/cormorantgaramond/v16/co3YmX5slCNuHLi8bLeY9MK7whWMhyjYqXtK.ttf"
  ).then((res) => res.arrayBuffer());

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0a0a0a",
          padding: "60px",
        }}
      >
        {/* Top rule */}
        <div
          style={{
            width: "80px",
            height: "1px",
            backgroundColor: "#555",
            marginBottom: "40px",
          }}
        />

        {/* Brand name */}
        <div
          style={{
            fontFamily: "Cormorant Garamond",
            fontSize: "72px",
            fontWeight: 600,
            color: "#FFFFFF",
            letterSpacing: "0.12em",
            textTransform: "uppercase" as const,
            marginBottom: "20px",
          }}
        >
          Agent Henrik
        </div>

        {/* Tagline */}
        <div
          style={{
            fontFamily: "Cormorant Garamond",
            fontSize: "28px",
            fontWeight: 300,
            color: "#a0a0a0",
            letterSpacing: "0.06em",
          }}
        >
          Luxury Underground Travel Curation
        </div>

        {/* Bottom rule */}
        <div
          style={{
            width: "80px",
            height: "1px",
            backgroundColor: "#555",
            marginTop: "40px",
          }}
        />

        {/* Destinations */}
        <div
          style={{
            fontSize: "14px",
            fontWeight: 400,
            color: "#666",
            letterSpacing: "0.15em",
            textTransform: "uppercase" as const,
            marginTop: "32px",
          }}
        >
          Berlin — Beirut — Hong Kong — Rio — Mykonos — Bucharest — Abisko — Lofoten — Salalah — Vancouver Island
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Cormorant Garamond",
          data: cormorantFont,
          style: "normal",
          weight: 600,
        },
      ],
    }
  );
}
