"use client";

import { useGlobalSearch } from "@/components/crm/search/GlobalSearch";
import { useQueueCounts } from "@/hooks/crm/useQueueCounts";
import { type RecentItem, useRecent } from "@/lib/crm/recent";
import { AnimatePresence, motion } from "framer-motion";
import { LogOut, PanelLeftClose, PanelLeftOpen, Search } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ALL_NAV_ITEMS, GUIDE_ITEM, isNavActive, NAV_GROUPS, type NavItem, RECENT_ICON } from "./nav";

const COLLAPSED_KEY = "crm.sidebar.collapsed";
const EASE = [0.22, 1, 0.36, 1] as const;

export function Sidebar() {
  const pathname = usePathname();
  const { counts } = useQueueCounts();
  const { open: openSearch } = useGlobalSearch();
  const { data: session } = useSession();
  const recent = useRecent();
  const [collapsed, setCollapsed] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem(COLLAPSED_KEY) === "1");
    } catch {}
    // Första målningen ska inte animera fram det sparade läget.
    requestAnimationFrame(() => setReady(true));
  }, []);

  function toggle() {
    setCollapsed((c) => {
      try {
        localStorage.setItem(COLLAPSED_KEY, c ? "0" : "1");
      } catch {}
      return !c;
    });
  }

  useGoShortcuts();

  return (
    <>
      <motion.aside
        animate={{ width: collapsed ? 64 : 256 }}
        transition={ready ? { duration: 0.28, ease: EASE } : { duration: 0 }}
        className="sticky top-0 z-40 hidden h-screen shrink-0 self-start flex-col overflow-hidden border-r border-nordic-200 bg-white md:flex"
      >
        {/* Logga + fäll ihop */}
        <div className="flex h-14 shrink-0 items-center gap-2 border-b border-nordic-200 px-3">
          {!collapsed && (
            <Link href="/crm" className="flex min-w-0 items-center gap-2 pl-1" title="Till Min dag">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/stayonsite-logo.png" alt="StayOnSite" className="h-5 w-auto" />
              <span className="border-l pl-2 text-xs font-medium text-muted-foreground">CRM</span>
            </Link>
          )}
          <button
            onClick={toggle}
            title={collapsed ? "Visa menyn" : "Fäll ihop menyn"}
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-nordic-500 transition-colors hover:bg-nordic-100 hover:text-nordic-900 ${
              collapsed ? "mx-auto" : "ml-auto"
            }`}
          >
            {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </button>
        </div>

        {/* Sök */}
        <div className="shrink-0 px-3 pt-3">
          <button
            onClick={openSearch}
            title="Sök allt (⌘K)"
            className={`group flex h-9 w-full items-center gap-2 rounded-lg border border-nordic-200 bg-nordic-100/60 text-sm text-muted-foreground transition-all hover:border-nordic-300 hover:bg-white hover:shadow-sm ${
              collapsed ? "justify-center px-0" : "px-2.5"
            }`}
          >
            <Search className="h-4 w-4 shrink-0 transition-transform group-hover:scale-110" />
            {!collapsed && (
              <>
                <span className="truncate">Sök…</span>
                <kbd className="ml-auto shrink-0 rounded border bg-white px-1.5 py-0.5 text-[10px]">⌘K</kbd>
              </>
            )}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 pb-3" aria-label="Huvudmeny">
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="mt-4">
              {collapsed ? (
                <div className="mx-auto mb-2 h-px w-6 bg-nordic-200" />
              ) : (
                <div className="mb-1 px-2.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-nordic-500/80">
                  {group.label}
                </div>
              )}
              <ul className="space-y-0.5">
                {group.items.map((item) => (
                  <li key={item.href}>
                    <SidebarLink
                      item={item}
                      active={isNavActive(item, pathname)}
                      collapsed={collapsed}
                      badge={item.badge ? counts[item.badge] : 0}
                    />
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {!collapsed && recent.length > 0 && (
            <div className="mt-5">
              <div className="mb-1 px-2.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-nordic-500/80">
                Senast besökta
              </div>
              <ul className="space-y-0.5">
                <AnimatePresence initial={false}>
                  {recent.slice(0, 5).map((r) => (
                    <RecentLink key={r.href} item={r} active={isCurrent(r.href, pathname)} />
                  ))}
                </AnimatePresence>
              </ul>
            </div>
          )}
        </nav>

        {/* Fot: guide + användare */}
        <div className="shrink-0 space-y-0.5 border-t border-nordic-200 p-3">
          <SidebarLink item={GUIDE_ITEM} active={isNavActive(GUIDE_ITEM, pathname)} collapsed={collapsed} badge={0} />
          <button
            onClick={() => signOut({ callbackUrl: "/crm/login" })}
            title="Logga ut"
            className={`flex h-9 w-full items-center gap-2.5 rounded-lg text-sm text-nordic-500 transition-colors hover:bg-nordic-100 hover:text-nordic-900 ${
              collapsed ? "justify-center" : "px-2.5"
            }`}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && <span className="truncate">{session?.user?.name ? `Logga ut ${firstName(session.user.name)}` : "Logga ut"}</span>}
          </button>
        </div>
      </motion.aside>
      <GoHint />
    </>
  );
}

function SidebarLink({ item, active, collapsed, badge }: { item: NavItem; active: boolean; collapsed: boolean; badge: number }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      title={collapsed ? `${item.label} (g ${item.key})` : `Kortkommando: g ${item.key}`}
      className={`group relative flex h-9 items-center gap-2.5 rounded-lg text-sm transition-colors ${
        collapsed ? "justify-center" : "px-2.5"
      } ${active ? "font-semibold text-nordic-900" : "text-nordic-800/80 hover:bg-nordic-100/70 hover:text-nordic-900"}`}
    >
      {active && (
        <motion.span
          layoutId="crm-nav-active"
          transition={{ type: "spring", stiffness: 520, damping: 42 }}
          className="absolute inset-0 rounded-lg bg-[#fff1e8] ring-1 ring-[#ff6300]/15"
        >
          <span className="absolute inset-y-2 left-0 w-[3px] rounded-full bg-[#ff6300]" />
        </motion.span>
      )}
      <Icon
        className={`relative h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-110 ${
          active ? "text-[#ff6300]" : "text-nordic-500"
        }`}
      />
      {!collapsed && <span className="relative min-w-0 flex-1 truncate">{item.label}</span>}
      <AnimatePresence>
        {badge > 0 && (
          <motion.span
            key={badge}
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.4, opacity: 0 }}
            transition={{ type: "spring", stiffness: 600, damping: 24 }}
            className={
              collapsed
                ? "absolute right-1.5 top-1 h-2 w-2 rounded-full bg-[#ff6300] ring-2 ring-white"
                : "relative inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#ff6300] px-1 text-[10px] font-bold tabular-nums text-white"
            }
          >
            {!collapsed && badge}
          </motion.span>
        )}
      </AnimatePresence>
    </Link>
  );
}

function RecentLink({ item, active }: { item: RecentItem; active: boolean }) {
  const Icon = RECENT_ICON[item.kind];
  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.22, ease: EASE }}
    >
      <Link
        href={item.href}
        title={item.label}
        className={`flex h-8 items-center gap-2.5 rounded-lg px-2.5 text-[13px] transition-colors ${
          active ? "bg-nordic-100 text-nordic-900" : "text-nordic-800/70 hover:bg-nordic-100/70 hover:text-nordic-900"
        }`}
      >
        <Icon className="h-3.5 w-3.5 shrink-0 text-nordic-400" />
        <span className="truncate">{item.label}</span>
      </Link>
    </motion.li>
  );
}

function isCurrent(href: string, pathname: string) {
  return href.split("?")[0] === pathname && !href.includes("?");
}

function firstName(name: string) {
  return name.split(" ")[0];
}

// ── "g" + bokstav: hoppa mellan sektioner utan mus ────────────────────────────

const GO_EVENT = "crm:go-hint";

function isTyping(target: EventTarget | null) {
  const el = target as HTMLElement | null;
  if (!el) return false;
  return el.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName);
}

function useGoShortcuts() {
  const router = useRouter();
  useEffect(() => {
    let armed: ReturnType<typeof setTimeout> | null = null;
    function disarm() {
      if (armed) clearTimeout(armed);
      armed = null;
      window.dispatchEvent(new CustomEvent(GO_EVENT, { detail: false }));
    }
    function onKey(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey || isTyping(e.target)) return;
      if (document.querySelector("[role=dialog]")) return;
      const k = e.key.toLowerCase();
      if (armed) {
        const item = ALL_NAV_ITEMS.find((i) => i.key === k);
        disarm();
        if (item) {
          e.preventDefault();
          router.push(item.href);
        }
        return;
      }
      if (k === "g") {
        armed = setTimeout(disarm, 1800);
        window.dispatchEvent(new CustomEvent(GO_EVENT, { detail: true }));
      }
    }
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      if (armed) clearTimeout(armed);
    };
  }, [router]);
}

function GoHint() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const on = (e: Event) => setShow((e as CustomEvent<boolean>).detail);
    window.addEventListener(GO_EVENT, on);
    return () => window.removeEventListener(GO_EVENT, on);
  }, []);
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.98 }}
          transition={{ duration: 0.18, ease: EASE }}
          className="fixed inset-x-0 bottom-14 z-[90] mx-auto w-fit rounded-xl border border-nordic-200 bg-white px-4 py-3 shadow-xl"
        >
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-nordic-500">Gå till…</p>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1">
            {ALL_NAV_ITEMS.map((i) => (
              <div key={i.href} className="flex items-center gap-2 text-sm text-nordic-900">
                <kbd className="inline-flex h-5 w-5 items-center justify-center rounded border bg-nordic-100 text-[11px] font-semibold">
                  {i.key}
                </kbd>
                {i.label}
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
