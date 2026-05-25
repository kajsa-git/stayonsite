import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "Stay On Site CRM",
  robots: { index: false, follow: false },
};

export default function CrmBaseLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sv">
      <body className="bg-[#f5f5f4] text-[#1a1a1a] antialiased" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", sans-serif' }}>
        {children}
      </body>
    </html>
  );
}
