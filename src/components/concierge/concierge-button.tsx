"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { ChatWindow } from "./chat-window";
import { createClient } from "@/lib/supabase/client";

type ChatContext = {
  theme_id?: string;
  theme_name?: string;
  storyworld_id?: string;
  storyworld_name?: string;
  storyteller_id?: string;
  storyteller_name?: string;
};

export function ConciergeButton() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const [context, setContext] = useState<ChatContext | undefined>(undefined);

  useEffect(() => {
    async function resolvePageContext() {
      const segments = pathname.split("/").filter(Boolean);

      if (segments[0] === "experiences" && segments[1]) {
        const supabase = createClient();
        const { data } = await supabase
          .from("ah_themes")
          .select("id, title")
          .eq("slug", segments[1])
          .single();
        if (data) {
          setContext({ theme_id: data.id, theme_name: data.title });
          return;
        }
      }

      if (segments[0] === "explore" && segments[1]) {
        const supabase = createClient();
        const { data } = await supabase
          .from("ah_storyworlds")
          .select("id, name")
          .eq("slug", segments[1])
          .single();
        if (data) {
          setContext({ storyworld_id: data.id, storyworld_name: data.name });
          return;
        }
      }

      if (segments[0] === "storytellers" && segments[1]) {
        const supabase = createClient();
        const { data } = await supabase
          .from("ah_storytellers")
          .select("id, name")
          .eq("slug", segments[1])
          .single();
        if (data) {
          setContext({ storyteller_id: data.id, storyteller_name: data.name });
          return;
        }
      }

      setContext(undefined);
    }

    resolvePageContext();
  }, [pathname]);

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-[55] flex h-14 w-14 items-center justify-center bg-foreground text-background shadow-lg transition-transform hover:scale-105 cursor-pointer"
          aria-label="Open AI Concierge"
        >
          <MessageCircle size={22} />
        </button>
      )}

      {isOpen && (
        <ChatWindow
          initialContext={context}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
