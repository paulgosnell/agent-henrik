import { createClient } from "@/lib/supabase/server";
import type { PageMeta } from "@/lib/supabase/types";

export async function getPageContent(pagePath: string): Promise<PageMeta | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("ah_page_meta")
    .select("*")
    .eq("page_path", pagePath)
    .single();
  return (data as PageMeta) || null;
}
