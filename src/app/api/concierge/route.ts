import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildSystemPrompt } from "@/lib/concierge/system-prompt";
import type { Theme, Storyworld, Storyteller, ConversationMessage } from "@/lib/supabase/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, context, sessionId } = body as {
      messages: ConversationMessage[];
      context?: {
        storyworld_id?: string;
        theme_id?: string;
        storyteller_id?: string;
      };
      sessionId?: string;
    };

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: "No messages provided" }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "AI service not configured" }, { status: 500 });
    }

    // Load themes, storyworlds, and optionally storyteller for system prompt context
    const supabase = await createClient();
    const [themesResult, storyworldsResult] = await Promise.all([
      supabase.from("ah_themes").select("*").eq("published", true).order("display_order"),
      supabase.from("ah_storyworlds").select("*").eq("published", true).order("display_order"),
    ]);

    const themes = (themesResult.data as Theme[]) || [];
    const storyworlds = (storyworldsResult.data as Storyworld[]) || [];

    // Build contextual system prompt
    let systemPrompt = buildSystemPrompt(themes, storyworlds);

    // Add specific context if provided
    if (context?.theme_id) {
      const theme = themes.find((t) => t.id === context.theme_id);
      if (theme) {
        systemPrompt += `\n\nThe user arrived from the "${theme.title}" theme page. Open with a contextual greeting about this theme.`;
      }
    }
    if (context?.storyworld_id) {
      const sw = storyworlds.find((s) => s.id === context.storyworld_id);
      if (sw) {
        systemPrompt += `\n\nThe user arrived from the "${sw.name}" storyworld page. Open with a contextual greeting about this destination.`;
      }
    }
    if (context?.storyteller_id) {
      const { data: storyteller } = await supabase
        .from("ah_storytellers")
        .select("*")
        .eq("id", context.storyteller_id)
        .single();
      if (storyteller) {
        const st = storyteller as Storyteller;
        systemPrompt += `\n\nThe user arrived from ${st.name}'s storyteller profile (${st.role || "Storyteller"}). ${st.bio ? `About them: ${st.bio}` : ""} ${st.signature_experiences?.length ? `Their signature experiences: ${st.signature_experiences.join(", ")}.` : ""} Open with a contextual greeting referencing this storyteller.`;
      }
    }

    // Call OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        max_tokens: 1024,
        messages: [
          { role: "system", content: systemPrompt },
          ...messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", errorText);
      return NextResponse.json({ error: "AI service error" }, { status: 502 });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "I apologize, I couldn't generate a response.";

    // Save conversation snapshot to ah_concierge_sessions (fire-and-forget)
    if (sessionId) {
      const userMessages = messages.filter((m) => m.role === "user");
      const allMessages = [...messages, { role: "assistant" as const, content }];
      supabase
        .from("ah_concierge_sessions")
        .upsert(
          {
            session_id: sessionId,
            messages: allMessages,
            message_count: allMessages.length,
            last_user_message: userMessages[userMessages.length - 1]?.content ?? null,
            source_theme_id: context?.theme_id ?? null,
            source_storyworld_id: context?.storyworld_id ?? null,
            source_storyteller_id: context?.storyteller_id ?? null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "session_id" }
        )
        .then(() => {});
    }

    return NextResponse.json({ content });
  } catch (error) {
    console.error("Concierge error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
