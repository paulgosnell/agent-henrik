"use client";

import { useRouter } from "next/navigation";
import { ChatWindow } from "@/components/concierge/chat-window";

export default function LivPage() {
  const router = useRouter();

  function handleClose() {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div className="flex h-[85vh] w-full max-w-lg flex-col border border-border bg-background shadow-2xl">
        <ChatWindow embedded onClose={handleClose} />
      </div>
    </div>
  );
}
