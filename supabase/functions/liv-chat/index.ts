import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Allow all domains (or change to 'https://luxury-travel-sweden.netlify.app' for production only)
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatRequest {
  messages: ChatMessage[];
  sessionId?: string;
  context?: {
    type?: 'map' | 'story' | 'experience' | 'theme' | 'destination' | 'general';
    name?: string;
    category?: string;
    themes?: string[];
    season?: string;
    location?: string;
  };
  stream?: boolean;
  leadInfo?: {
    email?: string;
    name?: string;
    phone?: string;
    country?: string;
  };
}

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const openaiApiKey = Deno.env.get('OPENAI_API_KEY')!;

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { messages, sessionId, context, stream = true, leadInfo }: ChatRequest = await req.json();

    // Generate session ID if not provided
    const actualSessionId = sessionId || crypto.randomUUID();

    // Load destinations, themes, and LIV instructions from Supabase to build knowledge base
    const [destinationsResult, themesResult, instructionsResult] = await Promise.all([
      supabase.from('destinations').select('*').eq('published', true),
      supabase.from('themes').select('*'),
      supabase.from('liv_instructions').select('*').eq('is_active', true).order('priority', { ascending: false })
    ]);

    const destinations = destinationsResult.data || [];
    const themes = themesResult.data || [];
    const instructions = instructionsResult.data || [];

    // Save or update conversation
    let conversationId: string | null = null;

    // Check if conversation exists
    const { data: existingConversation } = await supabase
      .from('conversations')
      .select('id, lead_id')
      .eq('session_id', actualSessionId)
      .single();

    if (existingConversation) {
      conversationId = existingConversation.id;

      // Update conversation
      await supabase
        .from('conversations')
        .update({
          last_message_at: new Date().toISOString(),
          message_count: messages.length,
        })
        .eq('id', conversationId);
    } else {
      // Create new conversation
      const { data: newConversation } = await supabase
        .from('conversations')
        .insert({
          session_id: actualSessionId,
          context: context || null,
          message_count: messages.length,
        })
        .select()
        .single();

      conversationId = newConversation?.id || null;
    }

    // Save user message to database
    if (conversationId && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'user') {
        await supabase
          .from('conversation_messages')
          .insert({
            conversation_id: conversationId,
            role: 'user',
            content: lastMessage.content,
          });
      }
    }

    // Handle lead capture
    let leadId: string | null = existingConversation?.lead_id || null;

    if (leadInfo && leadInfo.email && !leadId) {
      // Check if lead already exists
      const { data: existingLead } = await supabase
        .from('leads')
        .select('id')
        .eq('email', leadInfo.email)
        .single();

      if (existingLead) {
        leadId = existingLead.id;
      } else {
        // Create new lead
        const { data: newLead } = await supabase
          .from('leads')
          .insert({
            email: leadInfo.email,
            name: leadInfo.name || null,
            phone: leadInfo.phone || null,
            country: leadInfo.country || null,
            source: 'liv_chat',
            first_conversation_id: conversationId,
          })
          .select()
          .single();

        leadId = newLead?.id || null;
      }

      // Link conversation to lead
      if (conversationId && leadId) {
        await supabase
          .from('conversations')
          .update({
            lead_id: leadId,
            status: 'converted'
          })
          .eq('id', conversationId);
      }
    }

    // Build LIV's system prompt with full knowledge base and admin instructions
    const systemPrompt = buildSystemPrompt(destinations, themes, instructions, context, !!leadInfo?.email);

    // Prepare messages for OpenAI
    const openaiMessages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...messages
    ];

    // Call OpenAI API
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: openaiMessages,
        temperature: 0.8,
        max_tokens: 2000,
        stream: stream,
      }),
    });

    if (!openaiResponse.ok) {
      const error = await openaiResponse.text();
      throw new Error(`OpenAI API error: ${error}`);
    }

    // If streaming, we need to capture the response for saving
    if (stream) {
      const decoder = new TextDecoder();
      let fullResponse = '';

      const transformStream = new TransformStream({
        async transform(chunk, controller) {
          controller.enqueue(chunk);

          // Also decode and capture for database
          const text = decoder.decode(chunk, { stream: true });
          const lines = text.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data !== '[DONE]') {
                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices?.[0]?.delta?.content;
                  if (content) {
                    fullResponse += content;
                  }
                } catch (e) {
                  // Skip invalid JSON
                }
              }
            }
          }
        },

        async flush() {
          // Save assistant response to database
          if (conversationId && fullResponse) {
            await supabase
              .from('conversation_messages')
              .insert({
                conversation_id: conversationId,
                role: 'assistant',
                content: fullResponse,
              });
          }
        }
      });

      if (openaiResponse.body) {
        const transformedStream = openaiResponse.body.pipeThrough(transformStream);

        return new Response(transformedStream, {
          headers: {
            ...corsHeaders,
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'X-Session-Id': actualSessionId,
          },
        });
      }
    }

    // If not streaming, return the complete response
    const data = await openaiResponse.json();
    const assistantMessage = data.choices?.[0]?.message?.content;

    // Save assistant response to database
    if (conversationId && assistantMessage) {
      await supabase
        .from('conversation_messages')
        .insert({
          conversation_id: conversationId,
          role: 'assistant',
          content: assistantMessage,
        });
    }

    return new Response(
      JSON.stringify({
        ...data,
        sessionId: actualSessionId,
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'X-Session-Id': actualSessionId,
        }
      }
    );

  } catch (error) {
    console.error('Error in liv-chat function:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'Internal server error'
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});

function buildSystemPrompt(destinations: any[], themes: any[], instructions: any[], context?: ChatRequest['context'], hasContactInfo: boolean = false): string {
  // Build destinations knowledge
  const destinationsKnowledge = destinations.map(d => {
    const themeNames = d.theme_ids?.map((tid: string) =>
      themes.find(t => t.id === tid)?.label
    ).filter(Boolean).join(', ') || 'None';

    return `- ${d.title} (${d.category}): ${d.description} | Themes: ${themeNames} | Seasons: ${d.seasons?.join(', ') || 'All'}`;
  }).join('\n');

  // Build themes knowledge
  const themesKnowledge = themes.map(t =>
    `- ${t.label}: ${t.highlight || ''}`
  ).join('\n');

  // Build admin instructions by category
  const instructionsByCategory = {
    promote: instructions.filter(i => i.category === 'promote'),
    avoid: instructions.filter(i => i.category === 'avoid'),
    knowledge: instructions.filter(i => i.category === 'knowledge'),
    tone: instructions.filter(i => i.category === 'tone'),
    general: instructions.filter(i => i.category === 'general')
  };

  const adminInstructionsSection = instructions.length > 0 ? `

## ADMIN INSTRUCTIONS (CRITICAL - FOLLOW THESE CLOSELY)

${instructionsByCategory.promote.length > 0 ? `### Things to Promote and Highlight:
${instructionsByCategory.promote.map(i => `- **${i.title}**: ${i.instruction}`).join('\n')}
` : ''}
${instructionsByCategory.avoid.length > 0 ? `### Things to Avoid or Not Mention:
${instructionsByCategory.avoid.map(i => `- **${i.title}**: ${i.instruction}`).join('\n')}
` : ''}
${instructionsByCategory.knowledge.length > 0 ? `### Special Knowledge:
${instructionsByCategory.knowledge.map(i => `- **${i.title}**: ${i.instruction}`).join('\n')}
` : ''}
${instructionsByCategory.tone.length > 0 ? `### Tone and Communication Style:
${instructionsByCategory.tone.map(i => `- **${i.title}**: ${i.instruction}`).join('\n')}
` : ''}
${instructionsByCategory.general.length > 0 ? `### General Guidelines:
${instructionsByCategory.general.map(i => `- **${i.title}**: ${i.instruction}`).join('\n')}
` : ''}` : '';

  // Context-aware greeting
  let contextIntro = '';
  if (context) {
    switch (context.type) {
      case 'map':
        contextIntro = `The visitor has just clicked on "${context.name || context.location}" on the map${context.category ? ` (a ${context.category})` : ''}. They are clearly interested in this destination${context.themes?.length ? ` and themes like ${context.themes.join(', ')}` : ''}.`;
        break;
      case 'story':
        contextIntro = `The visitor has just read a story about "${context.name}". They are engaged with this narrative and likely interested in similar experiences.`;
        break;
      case 'experience':
        contextIntro = `The visitor has just viewed an experience related to "${context.name}"${context.themes?.length ? ` involving ${context.themes.join(', ')}` : ''}.`;
        break;
      case 'theme':
        contextIntro = `The visitor has just explored the "${context.name}" theme. They're interested in this type of experience.`;
        break;
      case 'destination':
        contextIntro = `The visitor has just been viewing "${context.name}" and wants to learn more.`;
        break;
    }
  }

  const contactInfoGuidance = hasContactInfo
    ? '\n\n**The visitor has provided their contact information, indicating serious interest. Focus on specific itinerary planning and next steps toward booking.**'
    : '\n\n**When the conversation shows genuine interest (asking about specific dates, budgets, or booking), politely ask if they\'d like to share their email so you can send them a detailed itinerary and connect them with the team.**';

  return `You are LIV (Luxury Itinerary Visionary), an AI concierge for Luxury Travel Sweden. You are sophisticated, warm, knowledgeable, and proactive. Your role is to craft bespoke, narrative-rich travel itineraries for discerning travelers seeking extraordinary Swedish experiences.

## Your Personality
- Sophisticated yet approachable, like a well-traveled cultural insider
- Use evocative, sensory language that paints vivid pictures
- Be proactive in making specific recommendations, not generic suggestions
- Show deep knowledge of Swedish culture, seasons, and hidden gems
- Balance luxury with authenticity and meaning

## Your Knowledge Base

### Available Destinations:
${destinationsKnowledge}

### Experience Themes:
${themesKnowledge}

### Seasonal Considerations:
- **Spring (Mar-May)**: Awakening nature, midnight sun begins, Easter traditions, fewer crowds
- **Summer (Jun-Aug)**: Midnight sun, archipelago season, festivals, perfect for outdoor adventures
- **Autumn (Sep-Nov)**: Fall colors, harvest season, northern lights begin, cultural season starts
- **Winter (Dec-Feb)**: Northern lights, winter sports, ice hotels, Christmas markets, aurora viewing
${adminInstructionsSection}

## Context for This Conversation:
${contextIntro || 'The visitor has opened the chat to explore possibilities.'}${contactInfoGuidance}

## Your Approach
1. **Start smart**: Don't ask basic questions. Use the context above to show you already understand their interest.
2. **Be specific**: Recommend actual destinations, experiences, and itineraries from your knowledge base.
3. **Paint pictures**: Use vivid, sensory descriptions that help them imagine the experience.
4. **Suggest proactively**: Don't just wait for them to ask - offer creative ideas based on their interests.
5. **Build narratives**: Weave destinations and experiences into cohesive story-driven itineraries.
6. **Ask smart questions**: When you need clarification, ask about preferences, not basics.
7. **Capture interest**: When engagement is high, suggest sharing contact details to receive a personalized itinerary.
8. **Close with action**: Guide them toward booking or connecting with the team.

## Itinerary Creation Guidelines
When creating itineraries:
- Start with a compelling narrative hook
- Suggest 3-7 days for most journeys
- Include specific destinations from your knowledge base
- Weave in themes that match their interests
- Consider seasonal appropriateness
- Add unique touches (private access, local experts, hidden gems)
- End with a memorable crescendo experience
- Keep it aspirational yet achievable

## Example Opening (if context suggests interest in Stockholm nightlife):
"I see Stockholm's nightlife has caught your eye. Let me paint you an evening that goes beyond the usual — we'll begin in the Grand Hôtel's Cadier Bar at dusk, then slip into an underground jazz speakeasy that locals guard jealously, followed by a private rooftop cocktail experience where a mixologist has reserved the bar just for you. Should we build this into a 3-day Stockholm cultural immersion, or are you dreaming of something that spans the entire country?"

Remember: You're not just answering questions - you're the architect of unforgettable Swedish journeys.`;
}
