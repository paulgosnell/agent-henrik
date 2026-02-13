import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildSystemPrompt } from "@/lib/concierge/system-prompt";
import type { Theme, Storyworld, ConversationMessage } from "@/lib/supabase/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, context } = body as {
      messages: ConversationMessage[];
      context?: {
        storyworld_id?: string;
        theme_id?: string;
        storyteller_id?: string;
      };
    };

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: "No messages provided" }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "AI service not configured" }, { status: 500 });
    }

    // Load themes and storyworlds for system prompt context
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

    // Call Claude API
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5-20250929",
        max_tokens: 1024,
        system: systemPrompt,
        messages: messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Claude API error:", errorText);
      return NextResponse.json({ error: "AI service error" }, { status: 502 });
    }

    const data = await response.json();
    const content = data.content?.[0]?.text || "I apologize, I couldn't generate a response.";

    return NextResponse.json({ content });
  } catch (error) {
    console.error("Concierge error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
