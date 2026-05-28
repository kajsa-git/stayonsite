import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "../globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-playfair" });

export const metadata: Metadata = {
  title: "Bostadsförslag — StayOnSite",
  robots: { index: false, follow: false },
};

export default function ProspektLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sv">
      <body className={`${inter.variable} ${playfair.variable} font-sans bg-[#faf8f4] text-[#1a1a1a] antialiased`}>
        {children}
      </body>
    </html>
  );
}
