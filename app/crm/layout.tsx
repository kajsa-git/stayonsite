import type { Metadata } from "next";
import { Toaster } from "@/components/ui/toaster";
import "../globals.css";

export const metadata: Metadata = {
  title: "Stay On Site CRM",
  robots: { index: false, follow: false },
  // "Lägg till på hemskärmen" → egen app-ikon (orange, skiljer sig från sajtens
  // marinblå) och standalone-läge utan webbläsarkrom via crm.webmanifest.
  manifest: "/crm.webmanifest",
  icons: [
    { rel: "icon", url: "/favicon.svg", type: "image/svg+xml" },
    { rel: "apple-touch-icon", url: "/crm-apple-touch-icon.png", sizes: "180x180" },
  ],
  appleWebApp: {
    capable: true,
    title: "CRM",
    statusBarStyle: "default",
  },
};

export default function CrmBaseLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sv">
      <body className="bg-[#f5f5f4] text-[#1a1a1a] antialiased" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", sans-serif' }}>
        {children}
        {/* CRM har egen root-layout utan sajtens Providers — utan denna har
            toast() ingen viewport och alla kvittenser försvinner tyst. */}
        <Toaster />
      </body>
    </html>
  );
}
