import type { Metadata } from "next";
import { Inter, Instrument_Serif } from "next/font/google";
import "../globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const instrument = Instrument_Serif({ subsets: ["latin"], weight: "400", variable: "--font-instrument" });

export const metadata: Metadata = {
  title: "Bostadsförslag — StayOnSite",
  robots: { index: false, follow: false },
};

export default function ProspektLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sv">
      <body className={`${inter.variable} ${instrument.variable} font-sans bg-[#faf8f4] text-[#1a1a1a] antialiased`}>
        {children}
      </body>
    </html>
  );
}
