import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { OG_BACKGROUND_DATA_URL } from "./background";

const ACCENT = "#46d3ff";
const TEXT = "#eef1f8";

export async function GET(req: NextRequest) {
  const title = req.nextUrl.searchParams.get("title") || "Champions League 2026/27";

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          position: "relative",
          backgroundColor: "#05091a",
        }}
      >
        {
          // next/image can't render inside next/og's satori-based renderer,
          // and next/og's SSRF guard blocks fetching this route's own host
          // (including in production, for a loopback-style origin) — so the
          // background is embedded as a data URL instead of fetched.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={OG_BACKGROUND_DATA_URL}
            alt=""
            width={1200}
            height={630}
            style={{ position: "absolute", inset: 0, objectFit: "cover" }}
          />
        }
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(5,9,26,0.35) 0%, rgba(5,9,26,0.96) 100%)",
          }}
        />
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            width: "100%",
            height: "100%",
            padding: "64px",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 28,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: ACCENT,
              marginBottom: 20,
            }}
          >
            Champions Zone
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 58,
              fontWeight: 700,
              color: TEXT,
              lineHeight: 1.15,
              maxWidth: 1050,
            }}
          >
            {title}
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
