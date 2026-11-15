import type { Metadata } from "next";
import { Barlow_Condensed, Inter } from "next/font/google";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { TooltipProvider } from "@/components/ui/tooltip";
import { RouteTransitions } from "@/components/motion/RouteTransitions";
import { CustomCursor } from "@/components/motion/CustomCursor";
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
  title: {
    default: "Champions Zone — UEFA Champions League 2026/27",
    template: "%s · Champions Zone",
  },
  description:
    "An unofficial fan hub for the UEFA Champions League 2026/27 season: live standings, fixtures, stats, and the road to the Madrid 2027 final.",
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
          <CustomCursor />
          <Nav />
          <main className="flex-1">
            <RouteTransitions>{children}</RouteTransitions>
          </main>
          <Footer />
        </TooltipProvider>
      </body>
    </html>
  );
}
