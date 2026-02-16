"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { ChatWindow } from "./chat-window";
import { createClient } from "@/lib/supabase/client";

export function ConciergeButton() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const [context, setContext] = useState<{
    theme_id?: string;
    storyworld_id?: string;
    storyteller_id?: string;
  } | undefined>(undefined);

  useEffect(() => {
    async function resolvePageContext() {
      const segments = pathname.split("/").filter(Boolean);

      // /experiences/[slug] → theme context
      if (segments[0] === "experiences" && segments[1]) {
        const supabase = createClient();
        const { data } = await supabase
          .from("ah_themes")
          .select("id")
          .eq("slug", segments[1])
          .single();
        if (data) {
          setContext({ theme_id: data.id });
          return;
        }
      }

      // /explore/[slug] → storyworld context
      if (segments[0] === "explore" && segments[1]) {
        const supabase = createClient();
        const { data } = await supabase
          .from("ah_storyworlds")
          .select("id")
          .eq("slug", segments[1])
          .single();
        if (data) {
          setContext({ storyworld_id: data.id });
          return;
        }
      }

      // /storytellers/[slug] → storyteller context
      if (segments[0] === "storytellers" && segments[1]) {
        const supabase = createClient();
        const { data } = await supabase
          .from("ah_storytellers")
          .select("id")
          .eq("slug", segments[1])
          .single();
        if (data) {
          setContext({ storyteller_id: data.id });
          return;
        }
      }

      // No specific context for other pages
      setContext(undefined);
    }

    resolvePageContext();
  }, [pathname]);

  return (
    <>
      {/* Floating button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center bg-foreground text-background shadow-lg transition-transform hover:scale-105 cursor-pointer"
          aria-label="Open AI Concierge"
        >
          <MessageCircle size={22} />
        </button>
      )}

      {/* Chat window */}
      {isOpen && (
        <ChatWindow
          initialContext={context}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
