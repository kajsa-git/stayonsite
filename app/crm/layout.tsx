import { BottomBar } from "@/components/crm/layout/BottomBar";
import { TopBar } from "@/components/crm/layout/TopBar";
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
      <div className="min-h-screen flex flex-col bg-[#f5f5f4]">
        <TopBar />
        <main className="flex-1 overflow-auto">{children}</main>
        <BottomBar />
      </div>
    </SessionProvider>
  );
}
