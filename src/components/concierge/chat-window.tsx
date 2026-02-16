"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Send, X } from "lucide-react";
import { ChatMessage } from "./chat-message";
import type { ConversationMessage } from "@/lib/supabase/types";

interface ChatWindowProps {
  onClose?: () => void;
  initialContext?: {
    storyworld_id?: string;
    theme_id?: string;
    storyteller_id?: string;
  };
  embedded?: boolean;
}

function generateSessionId() {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

export function ChatWindow({ onClose, initialContext, embedded = false }: ChatWindowProps) {
  const sessionId = useMemo(() => generateSessionId(), []);
  const [messages, setMessages] = useState<ConversationMessage[]>([
    {
      role: "assistant",
      content:
        "Welcome. I'm Agent Henrik — your insider to the world's most extraordinary cultural journeys. Where shall we begin?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    const text = input.trim();
    if (!text || isStreaming) return;

    const userMessage: ConversationMessage = { role: "user", content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsStreaming(true);

    try {
      const res = await fetch("/api/concierge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          context: initialContext,
          sessionId,
        }),
      });

      if (!res.ok) throw new Error("Failed to get response");

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.content },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I apologize — something went wrong. Please try again.",
        },
      ]);
    } finally {
      setIsStreaming(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const containerClass = embedded
    ? "flex h-full flex-col bg-background"
    : "fixed bottom-0 right-0 z-50 flex h-[70vh] w-full max-w-sm flex-col border-l border-t border-border bg-background sm:bottom-6 sm:right-6 sm:h-[600px] sm:w-[400px] sm:border sm:border-border";

  return (
    <div className={containerClass}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <span className="nav-text">Agent Henrik</span>
        {onClose && (
          <button
            onClick={onClose}
            className="text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Close chat"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.map((msg, i) => (
          <ChatMessage key={i} message={msg} />
        ))}
        {isStreaming && (
          <div className="flex justify-start">
            <div className="bg-muted px-4 py-3 text-sm text-muted-foreground">
              Composing...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Agent Henrik..."
            className="flex-1 border border-border bg-transparent px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none"
            disabled={isStreaming}
          />
          <button
            onClick={handleSend}
            disabled={isStreaming || !input.trim()}
            className="bg-foreground p-2 text-background transition-opacity hover:opacity-90 disabled:opacity-50"
            aria-label="Send message"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
