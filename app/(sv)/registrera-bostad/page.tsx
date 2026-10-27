import type { Metadata } from "next";
import Header from "@/components/Header";
import { PropertyIntakeForm } from "@/components/homeowner/PropertyIntakeForm";

export const metadata: Metadata = {
  title: "Registrera bostad för uthyrning | StayOnSite",
  description: "Fyll i bostadsuppgifter och bilder så kan StayOnSite granska boendet och återkomma.",
  alternates: {
    canonical: "https://www.stayonsite.se/registrera-bostad",
  },
  openGraph: {
    title: "Registrera bostad för uthyrning | StayOnSite",
    description: "Fyll i bostadsuppgifter efter kontakt med StayOnSite. Vi granskar och återkommer innan något publiceras.",
    type: "website",
    url: "https://www.stayonsite.se/registrera-bostad",
    siteName: "StayOnSite",
  },
  twitter: {
    card: "summary",
    title: "Registrera bostad för uthyrning | StayOnSite",
    description: "Fyll i bostadsuppgifter efter kontakt med StayOnSite. Vi granskar och återkommer innan något publiceras.",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function RegisterPropertyPage() {
  return (
    <div className="min-h-screen bg-[#f7f5f0] text-nordic-900">
      <Header />
      <main className="pt-24 md:pt-28">
        <p className="mx-auto max-w-4xl px-4 text-center text-sm text-nordic-600 sm:px-6">
          Vi hyr ut bostäder från tre månader och uppåt.
        </p>
        <PropertyIntakeForm />
      </main>
    </div>
  );
}
