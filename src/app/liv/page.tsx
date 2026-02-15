import { Metadata } from "next";
import { ChatWindow } from "@/components/concierge/chat-window";

export const metadata: Metadata = {
  title: "Agent Henrik AI Concierge",
  description: "Chat with Agent Henrik, your AI-powered luxury travel concierge.",
};

export default function LivPage() {
  return (
    <div className="flex h-screen flex-col items-center pt-16">
      <div className="flex w-full max-w-lg flex-1 flex-col border-x border-border">
        <ChatWindow embedded />
      </div>
    </div>
  );
}
