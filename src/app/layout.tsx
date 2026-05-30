import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "RaceIntel — AI Horse Racing Intelligence | UK & Ireland Form Analysis",
  description:
    "Professional AI-powered UK and Irish horse racing intelligence. 13-factor GG Score rankings, daily selections, pace simulation, and expert form analysis for every race. Free trial available.",
  keywords: [
    "horse racing tips",
    "UK horse racing predictions",
    "Irish racing tips",
    "Cheltenham Festival",
    "AI horse racing analytics",
    "horse racing form analysis",
    "GG Score",
    "racing intelligence",
    "daily racing selections",
    "pace simulation",
  ],
  openGraph: {
    title: "RaceIntel — AI Horse Racing Intelligence",
    description:
      "Every UK & Ireland race analysed by AI. GG Score rankings, daily selections, pace simulation, and professional-grade form analysis.",
    url: "https://raceintel.vercel.app",
    siteName: "RaceIntel",
    images: [
      {
        url: "https://images.pexels.com/photos/12950515/pexels-photo-12950515.jpeg?auto=compress&cs=tinysrgb&w=1200",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "RaceIntel — AI Horse Racing Intelligence",
    description:
      "Professional AI-driven horse racing predictions and form analysis for UK & Ireland.",
    images: [
      "https://images.pexels.com/photos/12950515/pexels-photo-12950515.jpeg?auto=compress&cs=tinysrgb&w=1200",
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${jetbrains.variable} antialiased bg-[#0a0d14] text-white font-sans`}
      >
        {children}
      </body>
    </html>
  );
}
