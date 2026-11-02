import type { Metadata } from "next";
import localFont from "next/font/local";
import "../globals.css";

const inter = localFont({ src: "../fonts/Inter-latin.woff2", weight: "300 700", variable: "--font-inter", display: "swap" });
const playfair = localFont({ src: "../fonts/PlayfairDisplay-latin.woff2", weight: "400 700", adjustFontFallback: "Times New Roman", variable: "--font-playfair", display: "swap" });

export const metadata: Metadata = {
  title: "Publiceringsmedgivande — StayOnSite",
  robots: { index: false, follow: false },
  // Kapabilitets-URL:er (token i sökvägen) får aldrig läcka via Referer vid utklick.
  referrer: "no-referrer",
};

export default function UthyrareLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sv">
      <body className={`${inter.variable} ${playfair.variable} font-sans bg-[#faf8f4] text-[#1a1a1a] antialiased`}>
        {children}
      </body>
    </html>
  );
}
