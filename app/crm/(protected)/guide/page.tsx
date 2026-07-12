import { GuideView } from "@/components/crm/guide/GuideView";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Så arbetar vi — StayOnSite CRM" };

export default function GuidePage() {
  return <GuideView />;
}
