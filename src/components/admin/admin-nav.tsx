"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Palette,
  Globe,
  Users,
  Newspaper,
  Award,
  Briefcase,
  MessageSquare,
  Bot,
  FileText,
  Settings,
  ChevronDown,
} from "lucide-react";
import { useSite } from "./site-context";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Pages", href: "/admin/pages", icon: FileText },
  { label: "Themes", href: "/admin/themes", icon: Palette },
  { label: "Storyworlds", href: "/admin/storyworlds", icon: Globe },
  { label: "Storytellers", href: "/admin/storytellers", icon: Users },
  { label: "Journal", href: "/admin/journal", icon: Newspaper },
  { label: "Press", href: "/admin/press", icon: Award },
  { label: "Services", href: "/admin/services", icon: Briefcase },
  { label: "Inquiries", href: "/admin/inquiries", icon: MessageSquare },
  { label: "Conversations", href: "/admin/conversations", icon: Bot },
  { label: "Concierge", href: "/admin/concierge", icon: Settings },
];

const SITE_OPTIONS = [
  { value: "henrik" as const, label: "Agent Henrik", url: null },
  { value: "sweden" as const, label: "Luxury Travel Sweden", url: "https://luxurytravelsweden.com/admin" },
];

export function AdminNav() {
  const pathname = usePathname();
  const { site, setSite } = useSite();
  const [siteOpen, setSiteOpen] = useState(false);

  const currentSiteLabel = SITE_OPTIONS.find((s) => s.value === site)?.label || "Agent Henrik";

  return (
    <nav className="w-56 shrink-0 border-r border-[var(--border)] bg-[var(--muted)] min-h-screen p-4 flex flex-col gap-1">
      <Link
        href="/admin"
        className="font-serif text-lg font-light tracking-tight mb-2 px-3 py-2"
      >
        Agent Henrik
      </Link>
      <div className="relative mb-4">
        <button
          onClick={() => setSiteOpen(!siteOpen)}
          className="flex w-full items-center justify-between rounded px-3 py-2 text-xs uppercase tracking-wider text-[var(--muted-foreground)] hover:bg-[var(--background)]/50 transition-colors cursor-pointer"
        >
          {currentSiteLabel}
          <ChevronDown size={14} className={`transition-transform ${siteOpen ? "rotate-180" : ""}`} />
        </button>
        {siteOpen && (
          <div className="absolute left-0 right-0 z-10 mt-1 rounded border border-[var(--border)] bg-[var(--background)] shadow-lg">
            {SITE_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  if (option.url) {
                    window.open(option.url, "_blank");
                  } else {
                    setSite(option.value);
                  }
                  setSiteOpen(false);
                }}
                className={`w-full px-3 py-2 text-left text-sm transition-colors cursor-pointer ${
                  site === option.value
                    ? "bg-[var(--muted)] text-[var(--foreground)]"
                    : "text-[var(--muted-foreground)] hover:bg-[var(--muted)]/50 hover:text-[var(--foreground)]"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
      {NAV_ITEMS.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href !== "/admin" && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2 text-sm rounded transition-colors ${
              isActive
                ? "bg-[var(--background)] text-[var(--foreground)]"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--background)]/50"
            }`}
          >
            <item.icon size={16} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
