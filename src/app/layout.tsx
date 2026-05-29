import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "RaceIntel — AI Horse Racing Intelligence | UK & Irish Form Analysis",
    template: "%s | RaceIntel",
  },
  description:
    "AI-powered UK & Irish horse racing intelligence. 13-factor GG Score rankings, daily selections, pace simulation, and professional-grade form analysis. Start your 7-day free trial.",
  keywords: [
    "horse racing", "racing tips", "AI racing predictions", "GG Score", "UK horse racing",
    "Irish horse racing", "race cards", "form analysis", "Cheltenham tips", "betting tracker",
    "horse racing app", "racing intelligence", "pace simulation", "draw bias",
  ],
  authors: [{ name: "RaceIntel" }],
  creator: "RaceIntel",
  publisher: "RaceIntel",
  metadataBase: new URL("https://raceintel.com"),
  openGraph: {
    type: "website",
    locale: "en_GB",
    siteName: "RaceIntel",
    title: "RaceIntel — AI Horse Racing Intelligence",
    description:
      "AI-powered UK & Irish horse racing intelligence. GG Score rankings, daily selections, and professional-grade form analysis.",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "RaceIntel — AI Horse Racing Intelligence",
    description:
      "AI-powered UK & Irish horse racing intelligence. GG Score rankings, daily selections, and professional-grade form analysis.",
    images: ["/og-image.png"],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" className="dark" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "RaceIntel",
              applicationCategory: "SportsApplication",
              operatingSystem: "Web, iOS, Android",
              description:
                "AI-powered UK & Irish horse racing intelligence platform with 13-factor GG Score rankings, daily selections, pace simulation, and professional form analysis.",
              offers: {
                "@type": "Offer",
                price: "9.99",
                priceCurrency: "GBP",
              },
            }),
          }}
        />
      </head>
      <body className="antialiased bg-[#0a0d14] text-white">
        {children}
      </body>
    </html>
  );
}