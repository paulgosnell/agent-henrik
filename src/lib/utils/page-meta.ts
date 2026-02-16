import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";

export async function getPageMeta(
  pagePath: string,
  fallback: { title: string; description: string }
): Promise<Metadata> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("ah_page_meta")
    .select("meta_title, meta_description")
    .eq("page_path", pagePath)
    .single();

  return {
    title: data?.meta_title || fallback.title,
    description: data?.meta_description || fallback.description,
  };
}
