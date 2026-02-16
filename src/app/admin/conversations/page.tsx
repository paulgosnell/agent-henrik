"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Eye, MessageSquare } from "lucide-react";
import type { ConciergeSession, ConversationMessage } from "@/lib/supabase/types";

export default function ConversationsPage() {
  const [sessions, setSessions] = useState<ConciergeSession[]>([]);
  const [selected, setSelected] = useState<ConciergeSession | null>(null);
  const supabase = createClient();

  async function load() {
    const { data } = await supabase
      .from("ah_concierge_sessions")
      .select("*")
      .order("updated_at", { ascending: false });
    setSessions((data as ConciergeSession[]) ?? []);
  }

  useEffect(() => { load(); }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-light font-serif">Concierge Conversations</h1>
        <span className="text-sm text-[var(--muted-foreground)]">
          {sessions.length} session{sessions.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="flex gap-6">
        {/* Sessions list */}
        <div className="w-96 shrink-0 border border-[var(--border)] rounded overflow-hidden">
          {sessions.length === 0 ? (
            <div className="p-8 text-center text-[var(--muted-foreground)] text-sm">
              No conversations yet
            </div>
          ) : (
            sessions.map((session) => (
              <button
                key={session.id}
                onClick={() => setSelected(session)}
                className={`w-full text-left p-4 border-b border-[var(--border)] hover:bg-[var(--muted)]/50 transition-colors cursor-pointer ${
                  selected?.id === session.id ? "bg-[var(--muted)]" : ""
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <MessageSquare size={12} className="text-[var(--muted-foreground)]" />
                    <span className="text-xs text-[var(--muted-foreground)]">
                      {session.message_count} messages
                    </span>
                  </div>
                  <span className="text-xs text-[var(--muted-foreground)]">
                    {new Date(session.updated_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm truncate">
                  {session.last_user_message || "No user message"}
                </p>
              </button>
            ))
          )}
        </div>

        {/* Conversation detail */}
        <div className="flex-1 border border-[var(--border)] rounded">
          {selected ? (
            <div className="flex flex-col h-[70vh]">
              <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">
                    Session {selected.session_id.substring(0, 12)}...
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    {new Date(selected.created_at).toLocaleString()} — {selected.message_count} messages
                  </p>
                </div>
                {(selected.source_theme_id || selected.source_storyworld_id || selected.source_storyteller_id) && (
                  <div className="flex gap-2">
                    {selected.source_theme_id && (
                      <span className="px-2 py-0.5 text-xs bg-[var(--muted)] rounded">
                        Theme context
                      </span>
                    )}
                    {selected.source_storyworld_id && (
                      <span className="px-2 py-0.5 text-xs bg-[var(--muted)] rounded">
                        Storyworld context
                      </span>
                    )}
                    {selected.source_storyteller_id && (
                      <span className="px-2 py-0.5 text-xs bg-[var(--muted)] rounded">
                        Storyteller context
                      </span>
                    )}
                  </div>
                )}
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {(selected.messages as ConversationMessage[]).map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] px-4 py-3 text-sm ${
                        msg.role === "user"
                          ? "bg-[var(--foreground)] text-[var(--background)]"
                          : "bg-[var(--muted)] text-[var(--foreground)]"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[70vh] text-[var(--muted-foreground)]">
              <div className="text-center">
                <Eye size={24} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">Select a conversation to view</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
