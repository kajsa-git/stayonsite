import { BottomBar } from "@/components/crm/layout/BottomBar";
import { MobileTabBar } from "@/components/crm/layout/MobileTabBar";
import { TopBar } from "@/components/crm/layout/TopBar";
import { GlobalSearchProvider } from "@/components/crm/search/GlobalSearch";
import { auth } from "@/lib/crm/auth";
import { SessionProvider } from "next-auth/react";
import { redirect } from "next/navigation";

export default async function CrmLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session) redirect("/crm/login");

  const user = session.user as typeof session.user & { approved?: boolean };
  if (!user?.approved) redirect("/crm/pending");

  return (
    <SessionProvider session={session}>
      <GlobalSearchProvider>
        <div className="min-h-screen flex flex-col bg-[#f5f5f4]">
          <TopBar />
          {/* pb-14 lämnar plats för den fasta mobil-tabbaren (md:pb-0 på desktop) */}
          <main className="flex-1 overflow-auto pb-14 md:pb-0">{children}</main>
          <BottomBar />
          <MobileTabBar />
        </div>
      </GlobalSearchProvider>
    </SessionProvider>
  );
}
