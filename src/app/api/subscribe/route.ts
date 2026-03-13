import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { SITE_KEY } from "@/lib/constants";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { error } = await supabase.from("leads").insert({
      site: SITE_KEY,
      email: email.toLowerCase().trim(),
      source: "newsletter",
      context_type: "newsletter",
      status: "new",
    });

    // Duplicate email — treat as success
    if (error?.code === "23505") {
      return NextResponse.json({ ok: true });
    }

    if (error) {
      console.error("Newsletter subscribe error:", error);
      return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
