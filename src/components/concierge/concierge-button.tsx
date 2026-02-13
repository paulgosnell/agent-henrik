"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { ChatWindow } from "./chat-window";

export function ConciergeButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center bg-foreground text-background shadow-lg transition-transform hover:scale-105"
          aria-label="Open AI Concierge"
        >
          <MessageCircle size={22} />
        </button>
      )}

      {/* Chat window */}
      {isOpen && <ChatWindow onClose={() => setIsOpen(false)} />}
    </>
  );
}
