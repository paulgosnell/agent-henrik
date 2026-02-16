import { NextRequest, NextResponse } from "next/server";

interface GenerateRequest {
  contentType: string;
  existingData: Record<string, unknown>;
  customPrompt?: string;
  fields: string[];
}

const CONTENT_TYPE_CONTEXT: Record<string, string> = {
  theme: `You are writing content for an experience theme on Agent Henrik, a global luxury underground travel curation platform. Themes are ways to experience the world — each has a distinct tone, activities, and story arc (Arrival > Immersion > Climax > Reflection). Write in a cinematic, editorial tone. Premium but not pretentious.`,
  storyworld: `You are writing content for a destination (called a "Storyworld") on Agent Henrik, a global luxury underground travel curation platform. Each storyworld is a city with its own atmosphere, insider zones, and narrative arc. Write in an evocative, insider tone — like a luxury cultural journalist revealing a city's secrets.`,
  storyteller: `You are writing content for a cultural storyteller profile on Agent Henrik. Storytellers are local insiders, cultural guides, and experience curators in their city. Write their bio as if profiling them for a luxury travel magazine.`,
  journal: `You are writing a journal article for Agent Henrik's Insider Journal. Articles cover city spotlights, scene reports, insider interviews, and trend watch. Write in an editorial, magazine-quality tone.`,
  press: `You are writing a press item entry for Agent Henrik. This is a quote or coverage summary from a media outlet.`,
  service: `You are writing a service description for Agent Henrik's luxury travel curation services. Services include bespoke trip curation, concierge, experience design, group travel, corporate events, celebrations, and wellness retreats.`,
};

const FIELD_INSTRUCTIONS: Record<string, Record<string, string>> = {
  theme: {
    definition: "Write a 2-3 sentence definition of this experience theme. What does it mean to travel this way?",
    tagline: "Write a short, evocative tagline (5-8 words). Think luxury magazine headline.",
    purpose: "Write 1-2 sentences about why someone would choose this theme. What emotional need does it fulfill?",
    includes: "Return a JSON array of 5-6 things this theme includes (e.g. 'Private guided cultural walks', 'Artisan workshop visits'). Return ONLY the JSON array.",
    activities: "Return a JSON array of 5-6 specific activities for this theme (e.g. 'Underground art gallery tour with curator', 'Private cooking session with Michelin chef'). Return ONLY the JSON array.",
    arrival_elements: "Return a JSON array of 2-3 arrival elements for the Story Arc (first impressions, welcome rituals, sensory introduction). Return ONLY the JSON array.",
    immersion_elements: "Return a JSON array of 2-3 immersion elements (core experiences, deep cultural encounters). Return ONLY the JSON array.",
    climax_elements: "Return a JSON array of 1-2 climax elements (the unforgettable peak moment). Return ONLY the JSON array.",
    reflection_elements: "Return a JSON array of 1-2 reflection elements (gentle closure, personal meaning). Return ONLY the JSON array.",
    tone_keywords: "Return a JSON array of 4-6 tone keywords that describe how content for this theme should feel (e.g. 'intimate', 'revelatory', 'cinematic'). Return ONLY the JSON array.",
    emphasize: "Return a JSON array of 3-4 things to emphasize when presenting this theme. Return ONLY the JSON array.",
    avoid: "Return a JSON array of 3-4 things to avoid when presenting this theme. Return ONLY the JSON array.",
    meta_title: "Write an SEO-optimized page title (50-60 chars). Include the theme name and 'Agent Henrik'.",
    meta_description: "Write an SEO meta description (150-160 chars). Compelling, includes theme name.",
  },
  storyworld: {
    atmosphere: "Write 2-3 sentences describing the atmosphere and mood of this city as a travel destination. Evocative and sensory.",
    arrival_mood: "Write 2-3 sentences about the feeling of arriving in this city. First impressions, sensory details.",
    immersion_zones: "Return a JSON array of 4-5 insider zones or neighborhoods to explore in this city (e.g. 'The hidden jazz bars of Kreuzberg'). Return ONLY the JSON array.",
    climax_moments: "Return a JSON array of 2-3 unforgettable peak experiences possible in this city. Return ONLY the JSON array.",
    reflection_moments: "Return a JSON array of 2-3 quiet, reflective moments to close a journey in this city. Return ONLY the JSON array.",
    meta_title: "Write an SEO-optimized page title (50-60 chars). Include the city name and 'Agent Henrik'.",
    meta_description: "Write an SEO meta description (150-160 chars). Compelling, includes city name.",
  },
  storyteller: {
    bio: "Write a 3-4 sentence bio for this storyteller. Their background, passion, and what makes them a unique insider guide. Write in third person.",
    signature_experiences: "Return a JSON array of 3-4 signature experiences this storyteller offers (e.g. 'Private rooftop dinner with city views'). Return ONLY the JSON array.",
    meta_title: "Write an SEO page title (50-60 chars). Include their name and role.",
    meta_description: "Write an SEO meta description (150-160 chars). Who they are and what they offer.",
  },
  journal: {
    content: "Write a 400-600 word article in HTML format. Use <h2>, <h3>, <p>, <ul><li>, and <strong> tags. Write in editorial magazine style. Engaging, informative, with insider perspective.",
    excerpt: "Write a 1-2 sentence excerpt/teaser for this article. Compelling enough to click through.",
    meta_title: "Write an SEO page title (50-60 chars). Include the article topic.",
    meta_description: "Write an SEO meta description (150-160 chars). Compelling article teaser.",
  },
  press: {
    quote: "Write a 1-2 sentence press quote about Agent Henrik that could appear in this publication. Impressive but believable.",
  },
  service: {
    description: "Write a 2-3 sentence service description. What the client gets, why it matters, and the outcome. Premium but clear.",
    region_availability: "Return a JSON array of 4-6 regions where this service is available (e.g. 'Europe', 'Southeast Asia', 'Middle East'). Return ONLY the JSON array.",
    meta_title: "Write an SEO page title (50-60 chars). Include the service name.",
    meta_description: "Write an SEO meta description (150-160 chars). Clear service value proposition.",
  },
};

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "OpenAI not configured" }, { status: 500 });
    }

    const { contentType, existingData, customPrompt, fields } = (await req.json()) as GenerateRequest;

    const typeContext = CONTENT_TYPE_CONTEXT[contentType] || "";
    const fieldInstructions = FIELD_INSTRUCTIONS[contentType] || {};

    // Build context from existing data
    const existingContext = Object.entries(existingData)
      .filter(([, v]) => v && v !== "" && !(Array.isArray(v) && v.length === 0))
      .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
      .join("\n");

    const fieldsToGenerate = fields
      .filter((f) => fieldInstructions[f])
      .map((f) => `- **${f}**: ${fieldInstructions[f]}`)
      .join("\n");

    if (!fieldsToGenerate) {
      return NextResponse.json({ error: "No fields to generate" }, { status: 400 });
    }

    const systemPrompt = `${typeContext}

${customPrompt ? `Additional context from the user: ${customPrompt}` : ""}

You have the following existing data to work with:
${existingContext || "No existing data — generate plausible content based on the content type."}

Generate content for each of the following fields. Return a JSON object where each key is the field name and the value is the generated content.

For array fields (includes, activities, elements, keywords, etc.), return them as JSON arrays of strings.
For text fields, return plain text strings.
For HTML content fields, return properly formatted HTML.

Fields to generate:
${fieldsToGenerate}

Return ONLY valid JSON. No markdown code fences, no explanation.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        max_tokens: 2048,
        temperature: 0.8,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: "Generate the content now. Return only the JSON object." },
        ],
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ error: "AI generation failed" }, { status: 502 });
    }

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content || "{}";

    // Parse JSON, stripping any markdown fences
    const cleaned = rawContent.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const generated = JSON.parse(cleaned);

    return NextResponse.json({ generated });
  } catch (error) {
    console.error("Content generation error:", error);
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}
