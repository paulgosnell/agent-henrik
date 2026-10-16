"use client";

import { useState, useRef, useEffect, useMemo, Suspense } from "react";
import { Send, X, Mic, ArrowRight, ArrowLeft } from "lucide-react";
import { ChatMessage } from "./chat-message";
import { VoiceMode } from "./voice-mode";
import { ContactForm, type RequestPrefill } from "@/components/contact/contact-form";
import type { ConversationMessage } from "@/lib/supabase/types";

interface ChatWindowProps {
  onClose?: () => void;
  initialContext?: {
    storyworld_id?: string;
    storyworld_name?: string;
    theme_id?: string;
    theme_name?: string;
    storyteller_id?: string;
    storyteller_name?: string;
  };
  embedded?: boolean;
}

function generateSessionId() {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

function generateGreeting(context?: ChatWindowProps["initialContext"]): string {
  if (!context) {
    return "Welcome. I'm Agent Henrik — your insider to the world's most extraordinary cultural journeys. Where shall we begin?";
  }

  if (context.storyteller_name) {
    return `Welcome. You're interested in ${context.storyteller_name} — a wonderful choice. I can help design an encounter that goes beyond the ordinary. What kind of experience are you imagining?`;
  }

  if (context.storyworld_name) {
    return `${context.storyworld_name} — an excellent choice. I can help you compose a journey here that goes far beyond the guidebook. What draws you to ${context.storyworld_name}?`;
  }

  if (context.theme_name) {
    return `${context.theme_name} — a superb choice. Let me help you design an experience that truly captures this essence. What aspect resonates most with you?`;
  }

  return "Welcome. I'm Agent Henrik — your insider to the world's most extraordinary cultural journeys. Where shall we begin?";
}

export function ChatWindow({ onClose, initialContext, embedded = false }: ChatWindowProps) {
  const sessionId = useMemo(() => generateSessionId(), []);
  const greeting = useMemo(() => generateGreeting(initialContext), [initialContext]);
  const [messages, setMessages] = useState<ConversationMessage[]>([
    { role: "assistant", content: greeting },
  ]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  // Set once LIV opens the request sheet. The sheet stays reachable until the guest sends it.
  const [requestPrefill, setRequestPrefill] = useState<RequestPrefill | null>(null);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);
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
      if (data.requestForm) openRequestForm(data.requestForm);
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

  function openRequestForm(prefill: RequestPrefill) {
    if (requestSent) return;
    setRequestPrefill((prev) => ({
      ...prev,
      ...prefill,
      destination: prefill.destination || prev?.destination || initialContext?.storyworld_name,
    }));
    setShowRequestForm(true);
  }

  function handleRequestSent() {
    setRequestSent(true);
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: "Your request has been sent to our team. Your story curator will be in touch within 24 hours.",
      },
    ]);
  }

  const transcriptText = messages
    .map((m) => `${m.role === "assistant" ? "Agent Henrik" : "Guest"}: ${m.content}`)
    .join("\n\n");

  function handleVoiceEnd(voiceTranscript: ConversationMessage[], prefill?: RequestPrefill) {
    setVoiceMode(false);
    if (voiceTranscript.length > 0) {
      setMessages((prev) => [...prev, ...voiceTranscript]);
    }
    if (prefill) openRequestForm(prefill);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const containerClass = embedded
    ? "relative flex h-full flex-col bg-background"
    : "fixed bottom-0 right-0 z-[60] flex h-[70vh] w-full max-w-sm flex-col border-l border-t border-border bg-background/80 backdrop-blur-xl sm:bottom-6 sm:right-6 sm:h-[600px] sm:w-[400px] sm:border sm:border-border";

  return (
    <div className={containerClass}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/50 px-4 py-3">
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

      {/* Messages / Voice */}
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {voiceMode ? (
          <VoiceMode
            onEnd={handleVoiceEnd}
            sessionId={sessionId}
            context={initialContext}
          />
        ) : (
        <>
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
        {requestPrefill && !requestSent && !showRequestForm && (
          <div className="mx-2 my-3 border border-border bg-muted p-4">
            <p className="mb-3 text-sm text-foreground">
              Your request has not been sent yet. Open the request sheet to check your details and send it.
            </p>
            <button
              onClick={() => setShowRequestForm(true)}
              className="nav-text inline-flex items-center gap-2 bg-foreground px-4 py-2 text-sm text-background transition-opacity hover:opacity-90"
            >
              Open Request Sheet
              <ArrowRight size={14} />
            </button>
          </div>
        )}
        <div ref={messagesEndRef} />
        </>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-border/50 p-4">
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
            onClick={() => setVoiceMode(!voiceMode)}
            className={`p-2 transition-opacity hover:opacity-90 ${
              voiceMode
                ? "bg-red-500 text-white"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
            aria-label={voiceMode ? "Switch to text" : "Switch to voice"}
          >
            <Mic size={16} />
          </button>
          <button
            onClick={handleSend}
            disabled={isStreaming || !input.trim() || voiceMode}
            className="bg-foreground p-2 text-background transition-opacity hover:opacity-90 disabled:opacity-50"
            aria-label="Send message"
          >
            <Send size={16} />
          </button>
        </div>
      </div>

      {/* Request sheet: opens when the guest chooses to send a request */}
      {showRequestForm && requestPrefill && (
        <div className="absolute inset-0 z-10 flex flex-col bg-background">
          <div className="flex items-center justify-between border-b border-border/50 px-4 py-3">
            <button
              onClick={() => setShowRequestForm(false)}
              className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Back to chat"
            >
              <ArrowLeft size={16} />
              <span className="nav-text">Back to chat</span>
            </button>
            <span className="nav-text">Your Request</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <Suspense fallback={null}>
              <ContactForm
                compact
                prefill={requestPrefill}
                aiDraft={transcriptText}
                prefillStoryworldId={initialContext?.storyworld_id}
                prefillThemeId={initialContext?.theme_id}
                onSubmitted={handleRequestSent}
              />
            </Suspense>
          </div>
        </div>
      )}
    </div>
  );
}
