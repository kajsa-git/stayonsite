import {
  BarChart3,
  BookOpen,
  Building2,
  ClipboardList,
  CalendarDays,
  FileText,
  Home,
  KeyRound,
  LayoutDashboard,
  type LucideIcon,
  Search,
  Truck,
} from "lucide-react";
import { billingTranslations } from "@/data/billing-translations";
import type { RecentKind } from "@/lib/crm/recent";

export type QueueCountKey = "followUps" | "moveSchedule";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
  /** Tangent efter "g" — t.ex. g d = Min dag. */
  key: string;
  /** Räknare från useQueueCounts som visas som badge. */
  badge?: QueueCountKey;
  /** Andra sökvägar som hör till samma sektion (detaljsidor). */
  also?: string[];
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

// En enda källa för CRM:ets navigering — sidomenyn, mobilens "Mer", ⌘K-paletten
// och brödsmulorna läser alla härifrån så att namn och ordning aldrig glider isär.
export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Idag",
    items: [
      { href: "/crm", label: "Min dag", icon: CalendarDays, exact: true, key: "d", badge: "followUps", also: ["/crm/work"] },
      { href: "/crm/flyttar", label: "In- & avflyttningar", icon: Truck, key: "m", badge: "moveSchedule" },
    ],
  },
  {
    label: "Register",
    items: [
      { href: "/crm/foretag", label: "Företagsbank", icon: Building2, key: "f", also: ["/crm/company", "/crm/matching"] },
      { href: "/crm/properties", label: "Objektsbank", icon: Home, key: "o" },
      { href: "/crm/uthyrare", label: "Uthyrare", icon: KeyRound, key: "u" },
      { href: "/crm/uthyrningar", label: billingTranslations.sv["billing.title"], icon: FileText, key: "h" },
    ],
  },
  {
    label: "Uppföljning",
    items: [
      { href: "/crm/oversikt", label: "Översikt", icon: LayoutDashboard, key: "i" },
      { href: "/crm/veckorapport", label: "Veckorapport", icon: BarChart3, key: "v" },
      { href: "/crm/sok", label: "Sök", icon: Search, key: "s" },
    ],
  },
];

export const GUIDE_ITEM: NavItem = { href: "/crm/guide", label: "Så arbetar vi", icon: BookOpen, key: "g" };

export const ALL_NAV_ITEMS: NavItem[] = [...NAV_GROUPS.flatMap((g) => g.items), GUIDE_ITEM];

function matches(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/");
}

export function isNavActive(item: NavItem, pathname: string) {
  if (item.exact ? pathname === item.href : matches(pathname, item.href)) return true;
  return (item.also ?? []).some((p) => matches(pathname, p));
}

export function activeNavItem(pathname: string): NavItem | undefined {
  return ALL_NAV_ITEMS.find((item) => isNavActive(item, pathname));
}

export const RECENT_ICON: Record<RecentKind, LucideIcon> = {
  company: Building2,
  owner: KeyRound,
  property: Home,
  request: ClipboardList,
};
