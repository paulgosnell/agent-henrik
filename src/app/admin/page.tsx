import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import {
  Palette,
  Globe,
  Users,
  Newspaper,
  Award,
  Briefcase,
  MessageSquare,
  Bot,
} from "lucide-react";

async function getCount(table: string) {
  const supabase = await createClient();
  const { count } = await supabase.from(table).select("*", { count: "exact", head: true });
  return count ?? 0;
}

async function getNewInquiriesCount() {
  const supabase = await createClient();
  const { count } = await supabase
    .from("ah_inquiries")
    .select("*", { count: "exact", head: true })
    .or("status.eq.new,status.is.null");
  return count ?? 0;
}

export default async function AdminDashboard() {
  const [themes, storyworlds, storytellers, journal, press, services, inquiries, newInquiries, conversations] =
    await Promise.all([
      getCount("ah_themes"),
      getCount("ah_storyworlds"),
      getCount("ah_storytellers"),
      getCount("ah_journal_articles"),
      getCount("ah_press_items"),
      getCount("ah_services"),
      getCount("ah_inquiries"),
      getNewInquiriesCount(),
      getCount("ah_concierge_sessions"),
    ]);

  const cards = [
    { label: "Themes", count: themes, href: "/admin/themes", icon: Palette },
    { label: "Storyworlds", count: storyworlds, href: "/admin/storyworlds", icon: Globe },
    { label: "Storytellers", count: storytellers, href: "/admin/storytellers", icon: Users },
    { label: "Journal", count: journal, href: "/admin/journal", icon: Newspaper },
    { label: "Press", count: press, href: "/admin/press", icon: Award },
    { label: "Services", count: services, href: "/admin/services", icon: Briefcase },
    { label: "Inquiries", count: inquiries, href: "/admin/inquiries", icon: MessageSquare, badge: newInquiries > 0 ? `${newInquiries} new` : undefined },
    { label: "Conversations", count: conversations, href: "/admin/conversations", icon: Bot },
  ];

  return (
    <div>
      <h1 className="text-2xl font-light font-serif mb-6">Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="p-6 border border-[var(--border)] rounded-lg hover:bg-[var(--muted)] transition-colors group"
          >
            <card.icon
              size={20}
              className="text-[var(--muted-foreground)] group-hover:text-[var(--foreground)] transition-colors mb-3"
            />
            <div className="text-3xl font-light font-serif mb-1">{card.count}</div>
            <div className="text-sm text-[var(--muted-foreground)]">
              {card.label}
              {card.badge && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-[var(--foreground)] text-[var(--background)] rounded-full">
                  {card.badge}
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
