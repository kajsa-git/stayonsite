import { auth } from "@/lib/crm/auth";
import { redirect } from "next/navigation";
import { WorkView } from "@/components/crm/work/WorkView";
import { fetchQueueItems, isValidQueue } from "@/lib/crm/queue";

export default async function WorkPage({
  params,
  searchParams,
}: {
  params: Promise<{ queue: string; companyId: string }>;
  searchParams: Promise<{ request?: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/crm/login");

  const { queue, companyId } = await params;
  const { request: requestId } = await searchParams;

  if (!isValidQueue(queue)) redirect("/crm");

  const items = await fetchQueueItems(queue);

  return <WorkView queue={queue} companyId={companyId} requestId={requestId ?? null} items={items} />;
}
