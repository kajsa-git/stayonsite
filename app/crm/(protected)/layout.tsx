import { BottomBar } from "@/components/crm/layout/BottomBar";
import { CrmMotion } from "@/components/crm/layout/CrmMotion";
import { MobileTabBar } from "@/components/crm/layout/MobileTabBar";
import { PageTrailProvider } from "@/components/crm/layout/PageTrail";
import { Sidebar } from "@/components/crm/layout/Sidebar";
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
      <CrmMotion>
        <GlobalSearchProvider>
          <PageTrailProvider>
            <div className="min-h-screen flex bg-[#f5f5f4]">
              <Sidebar />
              <div className="min-w-0 flex-1 min-h-screen flex flex-col">
                <TopBar />
                {/* pb-14 lämnar plats för den fasta mobil-tabbaren (md:pb-0 på desktop) */}
                <main className="flex-1 overflow-auto pb-14 md:pb-0">{children}</main>
                <BottomBar />
              </div>
              <MobileTabBar />
            </div>
          </PageTrailProvider>
        </GlobalSearchProvider>
      </CrmMotion>
    </SessionProvider>
  );
}
