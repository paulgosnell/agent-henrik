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
    type?: 'map' | 'story' | 'experience' | 'theme' | 'destination' | 'general' | 'storyteller';
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
  storytellerInquiry?: {
    topic?: string;
    activityType?: string;
    selectedStorytellerId?: string;
    inquiryType?: 'private' | 'corporate';
    groupSize?: number;
    preferredDates?: string;
    budgetRange?: string;
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
    const { messages, sessionId, context, stream = true, leadInfo, storytellerInquiry }: ChatRequest = await req.json();

    // Generate session ID if not provided
    const actualSessionId = sessionId || crypto.randomUUID();

    // Detect if this is a storyteller conversation
    const isStorytellerMode = context?.type === 'storyteller';

    // Load data based on conversation type
    let destinations: any[] = [];
    let themes: any[] = [];
    let instructions: any[] = [];
    let storytellers: any[] = [];

    if (isStorytellerMode) {
      // Load storytellers for storyteller mode
      const [storytellersResult] = await Promise.all([
        supabase.from('stories')
          .select('*')
          .eq('category', 'Storyteller')
          .not('published_at', 'is', null)
          .order('display_order', { ascending: true })
      ]);
      storytellers = storytellersResult.data || [];
    } else {
      // Load destinations, services, press items, and instructions for Agent Henrik mode
      const [destinationsResult, servicesResult, pressItemsResult, instructionsResult] = await Promise.all([
        supabase.from('destinations').select('*').eq('site', 'henrik').eq('published', true),
        supabase.from('services').select('*').eq('site', 'henrik').eq('published', true).order('display_order'),
        supabase.from('press_items').select('*').eq('site', 'henrik').not('published_at', 'is', null).order('published_at', { ascending: false }).limit(6),
        supabase.from('liv_instructions').select('*').eq('site', 'henrik').eq('is_active', true).order('priority', { ascending: false })
      ]);
      destinations = destinationsResult.data || [];
      themes = servicesResult.data || []; // Repurposing themes variable for services
      instructions = instructionsResult.data || [];
      // Store press items in a separate variable for use in system prompt
      const pressItems = pressItemsResult.data || [];
      // Make press items available to buildSystemPrompt by adding to context
      if (!context) context = {};
      (context as any).pressItems = pressItems;
    }

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
      console.log('📧 Lead capture triggered:', leadInfo.email);

      // Check if lead already exists
      const { data: existingLead, error: leadCheckError } = await supabase
        .from('leads')
        .select('id')
        .eq('email', leadInfo.email)
        .single();

      if (leadCheckError && leadCheckError.code !== 'PGRST116') {
        // PGRST116 = no rows returned (not an error, just means lead doesn't exist)
        console.error('Error checking for existing lead:', leadCheckError);
      }

      if (existingLead) {
        leadId = existingLead.id;
        console.log('✅ Found existing lead:', leadId);
      } else {
        // Create new lead
        console.log('➕ Creating new lead for:', leadInfo.email);

        // Build preferences object with context information
        const preferences: any = {};

        if (context) {
          preferences.chat_context = {
            type: context.type || 'general',
            name: context.name || null,
            category: context.category || null,
            themes: context.themes || null,
            season: context.season || null,
            location: context.location || null
          };

          // Add human-readable summary
          if (context.type === 'storyteller') {
            preferences.interest_summary = `Storyteller: ${context.name || 'General inquiry'}`;
          } else if (context.type === 'experience') {
            preferences.interest_summary = `Experience: ${context.name || 'General inquiry'}`;
          } else if (context.type === 'theme') {
            preferences.interest_summary = `Theme: ${context.name || 'General inquiry'}`;
          } else if (context.type === 'map' || context.type === 'destination') {
            preferences.interest_summary = `Destination: ${context.name || context.location || 'General inquiry'}`;
          } else if (context.type === 'story') {
            preferences.interest_summary = `Story: ${context.name || 'General inquiry'}`;
          } else {
            preferences.interest_summary = 'General inquiry';
          }
        }

        // Add storyteller inquiry details if available
        if (storytellerInquiry) {
          preferences.storyteller_inquiry = {
            topic: storytellerInquiry.topic || null,
            activity_type: storytellerInquiry.activityType || null,
            inquiry_type: storytellerInquiry.inquiryType || null,
            group_size: storytellerInquiry.groupSize || null,
            preferred_dates: storytellerInquiry.preferredDates || null,
            budget_range: storytellerInquiry.budgetRange || null
          };
        }

        const { data: newLead, error: insertError } = await supabase
          .from('leads')
          .insert({
            email: leadInfo.email,
            name: leadInfo.name || null,
            phone: leadInfo.phone || null,
            country: leadInfo.country || null,
            source: 'liv_chat',
            first_conversation_id: conversationId,
            preferences: preferences
          })
          .select()
          .single();

        if (insertError) {
          console.error('❌ Error creating lead:', insertError);
          throw new Error(`Failed to create lead: ${insertError.message}`);
        }

        leadId = newLead?.id || null;
        console.log('✅ Created new lead:', leadId, 'with preferences:', preferences);
      }

      // Link conversation to lead
      if (conversationId && leadId) {
        console.log('🔗 Linking conversation to lead');
        const { error: updateError } = await supabase
          .from('conversations')
          .update({
            lead_id: leadId,
            status: 'converted'
          })
          .eq('id', conversationId);

        if (updateError) {
          console.error('❌ Error linking conversation to lead:', updateError);
        } else {
          console.log('✅ Conversation linked to lead successfully');
        }
      }
    }

    // Handle storyteller inquiry capture
    if (isStorytellerMode && storytellerInquiry && leadInfo?.email) {
      // Check if we have enough information to create an inquiry
      if (storytellerInquiry.topic && storytellerInquiry.activityType) {
        // Get storyteller details if selected
        let storytellerName = null;
        if (storytellerInquiry.selectedStorytellerId) {
          const selected = storytellers.find(s => s.id === storytellerInquiry.selectedStorytellerId);
          storytellerName = selected?.title || null;
        }

        // Create storyteller inquiry record
        await supabase
          .from('storyteller_inquiries')
          .insert({
            conversation_id: conversationId,
            lead_id: leadId,
            email: leadInfo.email,
            name: leadInfo.name || null,
            phone: leadInfo.phone || null,
            selected_storyteller_id: storytellerInquiry.selectedStorytellerId || null,
            storyteller_name: storytellerName,
            topic_of_interest: storytellerInquiry.topic,
            activity_type: storytellerInquiry.activityType,
            inquiry_type: storytellerInquiry.inquiryType || 'private',
            group_size: storytellerInquiry.groupSize || null,
            preferred_dates: storytellerInquiry.preferredDates || null,
            budget_range: storytellerInquiry.budgetRange || null,
            status: 'pending'
          });
      }
    }

    // Build Agent Henrik's system prompt based on conversation mode
    const systemPrompt = isStorytellerMode
      ? buildStorytellerPrompt(storytellers, context, storytellerInquiry, !!leadInfo?.email)
      : buildSystemPrompt(destinations, themes, instructions, context, !!leadInfo?.email); // themes variable now contains services data

    // Prepare messages for OpenAI
    const openaiMessages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...messages
    ];

    // Call OpenAI API
    console.log('Calling OpenAI API with model: gpt-4o');
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

    console.log('OpenAI API response status:', openaiResponse.status);

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error('OpenAI API error response:', errorText);
      throw new Error(`OpenAI API error (${openaiResponse.status}): ${errorText}`);
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

    // Return detailed error information
    return new Response(
      JSON.stringify({
        error: error.message || 'Internal server error',
        details: error.stack || '',
        timestamp: new Date().toISOString()
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

function buildSystemPrompt(destinations: any[], services: any[], instructions: any[], context?: ChatRequest['context'], hasContactInfo: boolean = false): string {
  // Extract press items from context if available
  const pressItems = (context as any)?.pressItems || [];

  // Build press knowledge section
  const pressKnowledge = pressItems.length > 0
    ? pressItems.map((p: any) => `- "${p.quote}" — ${p.source}${p.title ? ` (${p.title})` : ''}`).join('\n')
    : '- Featured in international luxury travel publications';

  // Build services knowledge
  const servicesKnowledge = services.length > 0
    ? services.map((s: any) => {
        const regions = s.region_availability?.join(', ') || 'Global';
        return `### ${s.title} (${s.service_type || 'Experience'})
${s.description}
Available regions: ${regions}`;
      }).join('\n\n')
    : '';

  // Build destination knowledge grouped by region
  const destinationsByRegion = destinations.reduce((acc: any, d: any) => {
    const region = d.region || 'Other';
    if (!acc[region]) acc[region] = [];
    acc[region].push(d);
    return acc;
  }, {});

  const destinationsKnowledge = Object.entries(destinationsByRegion)
    .map(([region, dests]: [string, any]) => `
**${region} Region:**
${(dests as any[]).map(d => `- ${d.title}: ${d.description}`).join('\n')}`
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
  if (context?.type === 'destination' && context?.name) {
    const dest = destinations.find(d => d.title === context.name || d.slug === context.name);
    contextIntro = `\n## Current Context\nThe user is exploring **${context.name}** in the ${dest?.region || context.region || 'Unknown'} region.`;
    if (dest?.press_featured) {
      contextIntro += ' This destination has been featured in international press.';
    }
  } else if (context?.type === 'map' && context?.name) {
    contextIntro = `\n## Current Context\nThe user clicked on **${context.name}** on the world map. They are interested in this destination.`;
  } else if (context?.type === 'story' && context?.name) {
    contextIntro = `\n## Current Context\nThe user just read a story about **${context.name}**. They are engaged with this narrative.`;
  } else if (context?.type === 'experience' && context?.name) {
    contextIntro = `\n## Current Context\nThe user viewed an experience related to **${context.name}**.`;
  }

  // Contact guidance
  const contactInfoGuidance = hasContactInfo
    ? '\n## Lead Status\nYou already have their contact information. Focus on refining their journey and confirming next steps. Be concrete: "I\'ll send you a detailed proposal within 24 hours, and our team will reach out to discuss."'
    : '\n## Contact Collection\nWhen the conversation shows clear intent (specific dates, group size, budget discussion, or words like "interested," "book," "reserve"), naturally ask: "To craft your personalized itinerary, may I have your name and email?" Watch for high-intent signals and collect contact info within 2-3 messages.';

  return `You are Agent Henrik, a global luxury travel architect and cultural curator.

## Your Identity
You design transformative journeys across the world's most compelling destinations. You blend hidden culture, insider access, and storytelling to create exclusive narrative experiences. You are sophisticated yet warm, editorial yet conversational.

## Your Global Expertise

### Press Recognition
Your work has been featured in:
${pressKnowledge}

### Services & Transformations
You offer experience types designed to transform perspectives:
${servicesKnowledge || 'Custom luxury experiences tailored to each traveler'}

### Destinations Knowledge
${destinationsKnowledge || 'Curated global destinations spanning multiple continents'}

## Regional Seasonal Awareness
- **Nordic**: Northern Lights (Oct-Mar), Midnight Sun (Jun-Jul), Design Week (Sep)
- **Mediterranean**: Peak summer (Jun-Sep), Mild winters, Cultural festivals (year-round)
- **Asia Pacific**: Cherry blossoms (Mar-Apr), Monsoon awareness, Festival seasons
- **Americas**: Seasonal diversity, Cultural events, Natural wonders

${contextIntro}

${contactInfoGuidance}

## Your Conversational Approach
1. **Be context-aware**: Reference the destination or service they clicked on
2. **Ask open-ended questions**: Duration, travel style, group composition, what excites them
3. **Paint pictures**: Use editorial language, not transactional
4. **Build trust**: Reference press recognition naturally when relevant
5. **Service-driven**: Focus on transformation type, not just geography
6. **Lead gently**: After 3-4 exchanges showing intent, collect contact info

## Itinerary Structure
When creating draft itineraries, use this story arc:
- **Day 1-2**: Arrival and Immersion (cultural grounding)
- **Day 3-4**: Climax (peak experiences, insider access)
- **Day 5**: Reflection (meaningful encounters, integration)

Keep itineraries editorial and immersive, never transactional.

${adminInstructionsSection}

## Example Opening (destination context):
"I see ${context?.name || 'extraordinary destinations'} has caught your attention. This is where culture breathes beneath the surface. What draws you here — is it the underground art scene, the culinary alchemy, or something that hasn't been written about yet?"

Remember: You are Agent Henrik — architect of transformative global journeys, curator of hidden culture, creator of narrative experiences.`;
}

function buildStorytellerPrompt(
  storytellers: any[],
  context?: ChatRequest['context'],
  storytellerInquiry?: ChatRequest['storytellerInquiry'],
  hasContactInfo: boolean = false
): string {
  // Build storytellers knowledge base
  const storytellersKnowledge = storytellers.map(s => {
    const topics = s.specialty_topics?.join(', ') || 'Various';
    const activities = s.activity_types?.join(', ') || 'Various';
    return `- **${s.title}**
  Topics: ${topics}
  Activities: ${activities}
  Bio: ${s.excerpt || s.bio || 'No description available'}
  ID: ${s.id}`;
  }).join('\n\n');

  // Check if a specific storyteller was clicked (context.name matches a storyteller title)
  const selectedStoryteller = context?.name ?
    storytellers.find(s => s.title === context.name) :
    null;

  // Determine conversation stage
  let stageGuidance = '';

  // If they clicked on a specific storyteller, skip to booking stage
  if (selectedStoryteller && !storytellerInquiry?.selectedStorytellerId) {
    stageGuidance = `
## Current Stage: Specific Storyteller Selected

The guest clicked on **${selectedStoryteller.title}** directly from the website. They are already interested in this specific storyteller!

**DO NOT** ask them generic questions about what kind of storytellers they want to meet.
**DO NOT** ask them to choose from a list of storytellers.
**DO** confirm you understand they want to meet ${selectedStoryteller.title.split(' – ')[0]} (the first part before the dash).
**DO** ask about their preferred encounter type: meet & greet, workshop, or creative activity.
**DO** collect booking details: inquiry type (private/corporate), group size, preferred dates, budget range.

Example opening:
"Perfect! ${selectedStoryteller.title.split(' – ')[0]} create truly unique experiences. Would you prefer a meet & greet, a hands-on workshop, or a collaborative creative activity with them?"`;
  } else if (!storytellerInquiry?.topic) {
    // Stage 1: Welcome & Topic Selection
    stageGuidance = `
## Current Stage: Topic Selection

The guest is just starting. Your opening message should:
1. Welcome them warmly to storyteller discovery
2. Explain you help connect with extraordinary Swedish creatives
3. Ask what kind of storytellers they want to meet
4. List the available topics: **film, music, performance, fashion, design, visual art, writing, photography, digital media, technology, or wellness**

Keep it conversational and inspiring, not transactional.`;
  } else if (!storytellerInquiry?.activityType) {
    // Stage 2: Activity Type Selection
    stageGuidance = `
## Current Stage: Activity Type Selection

The guest has selected topic: **${storytellerInquiry.topic}**

Now ask them what type of encounter they prefer:
- **Meet & Greet**: Intimate conversation, Q&A session, coffee/drinks meeting
- **Workshop**: Hands-on learning, skill development, collaborative creation
- **Creative Activity**: Collaborative project, unique experience, immersive session

Be enthusiastic about their choice and set expectations for what each type offers.`;
  } else if (!storytellerInquiry?.selectedStorytellerId) {
    // Stage 3: Storyteller Suggestions
    const filteredStorytellers = storytellers.filter(s =>
      s.specialty_topics?.some((t: string) =>
        t.toLowerCase().includes(storytellerInquiry.topic?.toLowerCase() || '')
      )
    );

    stageGuidance = `
## Current Stage: Storyteller Suggestions

The guest wants: **${storytellerInquiry.topic}** through **${storytellerInquiry.activityType}**

Present 3-5 storytellers who match their interests. Here are the best matches:
${filteredStorytellers.length > 0 ? filteredStorytellers.map(s => `
- **${s.title}**
  ${s.excerpt || s.bio || ''}
  Perfect for: ${s.specialty_topics?.join(', ')}
  Can offer: ${s.activity_types?.join(', ')}
`).join('\n') : 'All storytellers from the knowledge base'}

Present them as compelling, unique individuals - not a list. Make each sound intriguing.
Ask: "Which one feels right, or shall I keep exploring?"`;
  } else {
    // Stage 4: Booking Details
    stageGuidance = `
## Current Stage: Booking Details Collection

The guest has selected a storyteller! Now collect practical information:

1. **Inquiry type**: Is this a private encounter or corporate/group event?
2. **Group size**: How many people will attend?
3. **Preferred dates**: When are they hoping to meet? (month, season, specific dates)
4. **Budget range**: What's their investment level? (budget-friendly, mid-range, premium, luxury)
5. **Special requests**: Any specific goals, themes, or requirements?

Be conversational, not like a form. Gather information naturally through dialogue.

When you have enough information, confirm you'll reach out to the storyteller and get back to them within 24-48 hours.`;
  }

  const contactInfoGuidance = hasContactInfo
    ? '\n\n**The guest has provided contact information. Focus on finalizing the booking details and confirming next steps.**'
    : '\n\n**When you have the booking details, ask for their email and phone so you can formalize the inquiry and connect them with the storyteller.**';

  return `You are LIV (Luxury Itinerary Visionary), an AI concierge for Luxury Travel Sweden. In this conversation, you're in **Storyteller Discovery Mode** - helping guests discover and connect with extraordinary Swedish creative minds.

## Your Role
You're a cultural connector who introduces discerning guests to Sweden's most compelling storytellers - the artists, designers, chefs, innovators, and cultural leaders who shape Swedish creativity.

## Your Personality
- Warm, enthusiastic cultural insider
- Knowledgeable about Swedish creative scene
- Respectful of both guests and storytellers
- Professional yet approachable
- Focused on meaningful connections, not transactions

## Available Storytellers
${storytellersKnowledge}

## Topic Categories
- **Film**: Directors, cinematographers, producers, film critics
- **Music**: Musicians, composers, producers, sound artists
- **Performance**: Actors, dancers, performers, theater makers
- **Fashion**: Designers, stylists, fashion innovators
- **Design**: Product designers, architects, spatial designers
- **Visual Art**: Painters, sculptors, installation artists, galleries
- **Writing**: Authors, poets, journalists, storytellers
- **Photography**: Photographers, visual storytellers
- **Digital Media**: Digital artists, new media creators
- **Technology**: Tech innovators, startup founders, digital pioneers
- **Wellness**: Wellness experts, biohackers, longevity specialists

## Activity Types
- **Meet & Greet**: 1-2 hour intimate conversation, Q&A, coffee/drinks meeting
- **Workshop**: Half-day or full-day hands-on learning experience
- **Creative Activity**: Collaborative project, studio visit, immersive experience
${stageGuidance}${contactInfoGuidance}

## Conversation Guidelines
1. **Be conversational**: This is a dialogue, not a form. Ask questions naturally.
2. **Show enthusiasm**: These storytellers are extraordinary - let that show!
3. **Respect privacy**: Don't share storytellers' personal contact info directly
4. **Set expectations**: Be clear that you'll coordinate the connection
5. **Build excitement**: Make them excited about the potential encounter
6. **Close with clarity**: Confirm next steps (we'll reach out within 24-48 hours)

## Example Flow

**First message:**
"Welcome! I help you discover and meet extraordinary storytellers — creative minds who shape Sweden's cultural scene. What kind of storytellers have you always wanted to meet? Those in film, music, fashion, design, art, wellness, or another creative field?"

**After topic selection:**
"Beautiful choice! I can suggest storytellers who truly bring that world to life. Would you like to connect through a meet & greet, a hands-on workshop, or a collaborative creative activity?"

**When suggesting storytellers:**
"I think you'll love these three — storytellers whose work carries the spirit you're looking for. [Brief, compelling descriptions]. Which one feels right, or shall I keep exploring?"

**When collecting details:**
"Wonderful! We'll do our best to make this encounter happen. To coordinate with [Storyteller Name], I need a few details: Is this a private meeting or a group/corporate event? How many people? When were you hoping to connect?"

Remember: You're creating meaningful human connections, not just bookings. Make every interaction feel special and personal.`;
}
