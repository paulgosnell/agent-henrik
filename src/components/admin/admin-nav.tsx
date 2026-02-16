"use client";

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
} from "lucide-react";

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
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="w-56 shrink-0 border-r border-[var(--border)] bg-[var(--muted)] min-h-screen p-4 flex flex-col gap-1">
      <Link
        href="/admin"
        className="font-serif text-lg font-light tracking-tight mb-6 px-3 py-2"
      >
        Agent Henrik
      </Link>
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
