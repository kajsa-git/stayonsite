import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Bostad — Stay On Site",
  robots: { index: false, follow: false },
};

export default function ProspektLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sv">
      <body className={`${inter.variable} font-sans bg-[#f5f5f4] text-[#1a1a1a] antialiased`}>
        {children}
      </body>
    </html>
  );
}
