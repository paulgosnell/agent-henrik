import type { ConversationMessage } from "@/lib/supabase/types";

interface ChatMessageProps {
  message: ConversationMessage;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[80%] px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? "bg-foreground text-background"
            : "bg-muted text-foreground"
        }`}
      >
        {message.content.split("\n").map((line, i) => (
          <p key={i} className={i > 0 ? "mt-2" : ""}>
            {line}
          </p>
        ))}
      </div>
    </div>
  );
}
