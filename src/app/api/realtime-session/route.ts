import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildVoiceSystemPrompt } from "@/lib/concierge/system-prompt";
import type { Theme, Storyworld } from "@/lib/supabase/types";

export async function POST() {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "AI service not configured" }, { status: 500 });
    }

    // Load context for system prompt
    const supabase = await createClient();
    const [themesResult, storyworldsResult] = await Promise.all([
      supabase.from("ah_themes").select("*").eq("published", true).order("display_order"),
      supabase.from("ah_storyworlds").select("*").eq("published", true).order("display_order"),
    ]);

    const themes = (themesResult.data as Theme[]) || [];
    const storyworlds = (storyworldsResult.data as Storyworld[]) || [];
    const instructions = buildVoiceSystemPrompt(themes, storyworlds);

    const response = await fetch("https://api.openai.com/v1/realtime/sessions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-realtime-preview",
        voice: "alloy",
        instructions,
        input_audio_transcription: {
          model: "whisper-1",
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Realtime session error:", error);
      return NextResponse.json({ error: "Failed to create session" }, { status: 502 });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Realtime session error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
