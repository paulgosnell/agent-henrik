import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { SITE_KEY } from "@/lib/constants";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, destination, travel_dates, group_size, investment_level, preferences, ai_draft_itinerary, source_storyworld_id, source_theme_id } = body;

    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
    }

    const messageParts: string[] = [];
    if (destination) messageParts.push(`Destination: ${destination}`);
    if (travel_dates) messageParts.push(`Dates: ${travel_dates}`);
    if (group_size) messageParts.push(`Group size: ${group_size}`);
    if (investment_level) messageParts.push(`Investment level: ${investment_level}`);
    if (preferences) messageParts.push(`\n${preferences}`);

    const supabase = createAdminClient();

    const { error: leadError } = await supabase.from("leads").insert({
      site: SITE_KEY,
      name: name || null,
      email: email || null,
      phone: phone || null,
      notes: messageParts.join("\n") || null,
      source: "contact-form",
      status: "new",
      preferences: {
        chat_context: { destination, investment_level },
        created_from_booking_inquiry: true,
      },
    });

    if (leadError && !leadError.message.includes("duplicate")) {
      console.error("Lead insert error:", leadError);
      return NextResponse.json({ error: "Failed to save enquiry" }, { status: 500 });
    }

    const specialParts: string[] = [];
    if (destination) specialParts.push(`Destination: ${destination}`);
    if (travel_dates) specialParts.push(`Dates: ${travel_dates}`);
    if (investment_level) specialParts.push(`Investment level: ${investment_level}`);
    if (preferences) specialParts.push(preferences);
    if (ai_draft_itinerary) specialParts.push(`\n--- AI Draft Itinerary ---\n${ai_draft_itinerary}`);

    const { error: inquiryError } = await supabase.from("booking_inquiries").insert({
      lead_id: null,
      email: email || null,
      name: name || null,
      phone: phone || null,
      travel_dates_start: null,
      travel_dates_end: null,
      group_size: group_size ? parseInt(group_size) : null,
      budget_range: investment_level || null,
      special_requests: specialParts.join("\n").trim() || null,
      itinerary_summary: ai_draft_itinerary || null,
      status: "pending",
      site: SITE_KEY,
    });

    if (inquiryError) {
      console.error("Booking inquiry insert error:", inquiryError);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Contact API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
