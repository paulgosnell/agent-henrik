"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { ChatWindow } from "@/components/concierge/chat-window";
import { createClient } from "@/lib/supabase/client";

function LivChat() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [context, setContext] = useState<{
    theme_id?: string;
    storyworld_id?: string;
    storyteller_id?: string;
  } | undefined>(undefined);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function resolveContext() {
      const themeSlug = searchParams?.get("theme");
      const storyworldSlug = searchParams?.get("storyworld");
      const storytellerSlug = searchParams?.get("storyteller");

      if (!themeSlug && !storyworldSlug && !storytellerSlug) {
        setReady(true);
        return;
      }

      const supabase = createClient();
      const resolved: typeof context = {};

      if (themeSlug) {
        const { data } = await supabase
          .from("ah_themes")
          .select("id")
          .eq("slug", themeSlug)
          .single();
        if (data) resolved.theme_id = data.id;
      }
      if (storyworldSlug) {
        const { data } = await supabase
          .from("ah_storyworlds")
          .select("id")
          .eq("slug", storyworldSlug)
          .single();
        if (data) resolved.storyworld_id = data.id;
      }
      if (storytellerSlug) {
        const { data } = await supabase
          .from("ah_storytellers")
          .select("id")
          .eq("slug", storytellerSlug)
          .single();
        if (data) resolved.storyteller_id = data.id;
      }

      if (Object.keys(resolved).length > 0) {
        setContext(resolved);
      }
      setReady(true);
    }

    resolveContext();
  }, [searchParams]);

  function handleClose() {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  }

  if (!ready) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div className="flex h-[85vh] w-full max-w-lg flex-col border border-border bg-background shadow-2xl">
        <ChatWindow embedded initialContext={context} onClose={handleClose} />
      </div>
    </div>
  );
}

export default function LivPage() {
  return (
    <Suspense>
      <LivChat />
    </Suspense>
  );
}
