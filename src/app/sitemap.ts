import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://agenthenrik.com";
  const supabase = await createClient();

  const [storyworlds, themes, storytellers, articles] = await Promise.all([
    supabase.from("ah_storyworlds").select("slug, updated_at").eq("published", true),
    supabase.from("ah_themes").select("slug, updated_at").eq("published", true),
    supabase.from("ah_storytellers").select("slug, updated_at").eq("published", true),
    supabase.from("ah_journal_articles").select("slug, updated_at").eq("published", true),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/explore`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/experiences`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/storytellers`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/journal`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/press`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/contact`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/about/story`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/about/team`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/about/services`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/about/booking-process`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/about/pricing-faq`, changeFrequency: "monthly", priority: 0.6 },
  ];

  const dynamicPages: MetadataRoute.Sitemap = [
    ...(storyworlds.data || []).map((s) => ({
      url: `${base}/explore/${s.slug}`,
      lastModified: s.updated_at,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...(themes.data || []).map((t) => ({
      url: `${base}/experiences/${t.slug}`,
      lastModified: t.updated_at,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...(storytellers.data || []).map((s) => ({
      url: `${base}/storytellers/${s.slug}`,
      lastModified: s.updated_at,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...(articles.data || []).map((a) => ({
      url: `${base}/journal/${a.slug}`,
      lastModified: a.updated_at,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];

  return [...staticPages, ...dynamicPages];
}
