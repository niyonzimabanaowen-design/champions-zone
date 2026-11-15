import type { Metadata } from "next";
import { Barlow_Condensed, Inter } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { TooltipProvider } from "@/components/ui/tooltip";
import { RouteTransitions } from "@/components/motion/RouteTransitions";
import { CustomCursor } from "@/components/motion/CustomCursor";
import { ConsoleSignature } from "@/components/ConsoleSignature";
import { IS_PRODUCTION, SITE_NAME, SITE_URL } from "@/lib/seo";
import "./globals.css";

const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow-condensed",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — UEFA Champions League 2026/27`,
    template: "%s | Champions Zone",
  },
  description:
    "An unofficial fan hub for the UEFA Champions League 2026/27 season: live standings, fixtures, stats, and the road to the Madrid 2027 final.",
  authors: [{ name: "Bana Owen" }],
  robots: IS_PRODUCTION
    ? { index: true, follow: true }
    : { index: false, follow: false },
  verification: process.env.NEXT_PUBLIC_GSC_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GSC_VERIFICATION }
    : undefined,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${barlowCondensed.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-bg text-text">
        <TooltipProvider delayDuration={150}>
          <ConsoleSignature />
          <CustomCursor />
          <Nav />
          <main className="flex-1">
            <RouteTransitions>{children}</RouteTransitions>
          </main>
          <Footer />
        </TooltipProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
