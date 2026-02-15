import { Metadata } from "next";
import { ChatWindow } from "@/components/concierge/chat-window";

export const metadata: Metadata = {
  title: "Agent Henrik AI Concierge",
  description: "Chat with Agent Henrik, your AI-powered luxury travel concierge.",
};

export default function LivPage() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex h-[85vh] w-full max-w-lg flex-col border border-border bg-background shadow-2xl">
        <ChatWindow embedded />
      </div>
    </div>
  );
}
