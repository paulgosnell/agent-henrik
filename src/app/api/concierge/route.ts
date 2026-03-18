import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { buildSystemPrompt } from "@/lib/concierge/system-prompt";
import { SITE_KEY } from "@/lib/constants";
import type { Theme, Storyworld, Storyteller, ConciergeInstruction, ConversationMessage } from "@/lib/supabase/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, context, sessionId, leadInfo, saveOnly } = body as {
      messages: ConversationMessage[];
      context?: {
        storyworld_id?: string;
        theme_id?: string;
        storyteller_id?: string;
      };
      sessionId?: string;
      leadInfo?: { name?: string; email: string; phone?: string; dates?: string; groupSize?: string; budget?: string };
      saveOnly?: boolean;
    };

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: "No messages provided" }, { status: 400 });
    }

    // Handle lead capture from chat
    if (leadInfo?.email) {
      const adminSupabase = createAdminClient();
      const notesParts: string[] = [];
      if (leadInfo.dates) notesParts.push(`Dates: ${leadInfo.dates}`);
      if (leadInfo.groupSize) notesParts.push(`Group size: ${leadInfo.groupSize}`);
      if (leadInfo.budget) notesParts.push(`Budget: ${leadInfo.budget}`);

      const transcript = messages
        .map((m) => `${m.role}: ${m.content}`)
        .join("\n");

      // Insert lead
      const { error: leadError } = await adminSupabase.from("leads").insert({
        site: SITE_KEY,
        name: leadInfo.name || null,
        email: leadInfo.email,
        phone: leadInfo.phone || null,
        notes: notesParts.length > 0 ? notesParts.join("\n") : null,
        source: "concierge_chat",
        status: "new",
        preferences: {
          chat_context: { type: context?.theme_id ? "theme" : context?.storyworld_id ? "storyworld" : "general" },
          created_from_booking_inquiry: true,
        },
      });

      if (leadError && !leadError.message.includes("duplicate")) {
        console.error("Lead insert error:", leadError);
      }

      // Insert booking inquiry
      const specialParts: string[] = [];
      if (leadInfo.dates) specialParts.push(`Dates: ${leadInfo.dates}`);
      if (leadInfo.groupSize) specialParts.push(`Group size: ${leadInfo.groupSize}`);
      if (leadInfo.budget) specialParts.push(`Budget: ${leadInfo.budget}`);
      if (transcript) specialParts.push(`\n--- Concierge Conversation ---\n${transcript}`);

      await adminSupabase.from("booking_inquiries").insert({
        lead_id: null,
        email: leadInfo.email,
        name: leadInfo.name || null,
        phone: leadInfo.phone || null,
        travel_dates_start: null,
        travel_dates_end: null,
        group_size: leadInfo.groupSize ? parseInt(leadInfo.groupSize) || null : null,
        budget_range: leadInfo.budget || null,
        special_requests: specialParts.join("\n").trim() || null,
        itinerary_summary: transcript || null,
        status: "pending",
        site: SITE_KEY,
      });
    }

    // Handle save-only mode (for voice transcripts)
    if (saveOnly) {
      if (sessionId) {
        const supabase = await createClient();
        await supabase
          .from("ah_concierge_sessions")
          .upsert(
            {
              session_id: sessionId,
              messages,
              message_count: messages.length,
              last_user_message: messages.filter((m) => m.role === "user").pop()?.content ?? null,
              source_theme_id: context?.theme_id ?? null,
              source_storyworld_id: context?.storyworld_id ?? null,
              source_storyteller_id: context?.storyteller_id ?? null,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "session_id" }
          );
      }
      return NextResponse.json({ ok: true });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "AI service not configured" }, { status: 500 });
    }

    // Load themes, storyworlds, instructions, and optionally storyteller
    const supabase = await createClient();
    const [themesResult, storyworldsResult, instructionsResult] = await Promise.all([
      supabase.from("ah_themes").select("*").eq("published", true).order("display_order"),
      supabase.from("ah_storyworlds").select("*").eq("published", true).order("display_order"),
      supabase.from("ah_concierge_instructions").select("*").eq("is_active", true).order("priority", { ascending: false }),
    ]);

    const themes = (themesResult.data as Theme[]) || [];
    const storyworlds = (storyworldsResult.data as Storyworld[]) || [];
    const instructions = (instructionsResult.data as ConciergeInstruction[]) || [];

    // Build item-specific context and contextual greeting
    let itemContext: string | null = null;
    let contextGreeting = "";

    if (context?.theme_id) {
      const theme = themes.find((t) => t.id === context.theme_id);
      if (theme) {
        itemContext = theme.concierge_context || null;
        contextGreeting = `\n\nThe user arrived from the "${theme.title}" theme page. Open with a contextual greeting about this theme.`;
      }
    }
    if (context?.storyworld_id) {
      const sw = storyworlds.find((s) => s.id === context.storyworld_id);
      if (sw) {
        itemContext = sw.concierge_context || null;
        contextGreeting = `\n\nThe user arrived from the "${sw.name}" storyworld page. Open with a contextual greeting about this destination.`;
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
        itemContext = st.concierge_context || null;
        contextGreeting = `\n\nThe user arrived from ${st.name}'s storyteller profile (${st.role || "Storyteller"}). ${st.bio ? `About them: ${st.bio}` : ""} ${st.signature_experiences?.length ? `Their signature experiences: ${st.signature_experiences.join(", ")}.` : ""} Open with a contextual greeting referencing this storyteller.`;
      }
    }

    // Build system prompt with instructions and item context
    let systemPrompt = buildSystemPrompt(themes, storyworlds, instructions, itemContext);
    if (contextGreeting) {
      systemPrompt += contextGreeting;
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
        max_tokens: 1500,
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
