/**
 * ChatGPT Helper - Generates context-specific prompts for ChatGPT
 * to help admins create better LIV instructions
 */

window.ChatGPTHelper = {

  /**
   * Generate ChatGPT prompt for LIV Context field
   */
  generateContextPrompt(type, itemName, itemDescription = '') {
    const prompts = {
      destination: `You are helping write context instructions for an AI travel concierge named LIV.

**Destination:** ${itemName}
**Description:** ${itemDescription}

Write clear, concise instructions for LIV about this destination. Include:

1. **Duration:** How many days/nights should be recommended? (e.g., "2-3 days ideal", "Day trip only - no overnight")
2. **Best Season:** When to visit and what to avoid (e.g., "Best June-August, avoid winter")
3. **Price Range:** Typical budget per person (e.g., "€200-400 per day")
4. **Best Combined With:** Other destinations that pair well
5. **Special Notes:** Important context LIV should know

**Format as bullet points, keep it under 150 words.**

Example output:
• Duration: Recommend 2-3 days to explore properly
• Season: Best May-September, winter can be harsh
• Price: €250-500 per person per day (mid to high-end)
• Pairs well with: Stockholm (2 hours away), Gothenburg
• Note: This is a coastal destination, emphasize seafood and maritime activities`,

      pillar: `You are helping write context instructions for an AI travel concierge named LIV.

**Experience Type:** ${itemName}
**Description:** ${itemDescription}

Write clear instructions for LIV about this experience. Include:

1. **Duration Options:** Is this single-day OR multi-day? IMPORTANT: Tell LIV to ASK the user their preference
2. **Single-Day Details:** Price range, typical activities, duration
3. **Multi-Day Details:** Price range, typical length, what's included
4. **Best Season:** When this experience is available/best
5. **Group Sizes:** Typical group sizes or if it's better for couples/solo/groups

**Format as bullet points, keep it under 200 words.**

Example output:
• Can be single-day OR multi-day - ASK USER: "Are you interested in a day experience or multi-day retreat?"
• Single-day: €400-700 per person (spa day, wellness workshop, forest bathing)
• Multi-day: €1500-3000 per night (3-7 day wellness retreat, all-inclusive)
• Best: Year-round, winter adds Northern Lights wellness dimension
• Groups: Works for solo travelers, couples, or small groups (2-8 people)
• Partners: Collaborate with top wellness resorts in Swedish Lapland`,

      story: `You are helping write context instructions for an AI travel concierge named LIV.

**Storyteller:** ${itemName}
**Background:** ${itemDescription}

Write clear instructions for LIV when connecting users with this storyteller. Include:

1. **Session Types:** Half-day, full-day, multi-day options
2. **Pricing:** Cost per session type
3. **Booking Lead Time:** How far in advance to book
4. **Specialization:** What they're known for
5. **Best For:** Who this storyteller is perfect for (couples, families, photographers, etc.)

**Format as bullet points, keep it under 150 words.**

Example output:
• Sessions: Half-day (4 hrs - €600), Full-day (8 hrs - €1200), Multi-day (€2000+/day)
• Lead time: Book 6-8 weeks in advance, peak season 3+ months
• Specializes in: Landscape photography, Northern Lights, Swedish wilderness
• Best for: Photography enthusiasts, couples seeking unique experiences, small groups (max 4)
• Note: Provides all equipment, includes post-processing workshop`,

      corporate: `You are helping write context instructions for an AI travel concierge named LIV.

**Corporate Offering:** ${itemName}
**Description:** ${itemDescription}

Write clear instructions for LIV about this corporate experience. Include:

1. **Group Size:** Typical range (e.g., "8-30 executives")
2. **Duration:** Typical length (e.g., "3-5 days standard")
3. **Venues:** Types of venues used (castles, islands, lodges, etc.)
4. **Price Range:** Per person, all-inclusive estimate
5. **What's Included:** Key components (strategy sessions, wellness, activities, etc.)

**Format as bullet points, keep it under 150 words.**

Example output:
• Group size: 8-30 executives ideal, can accommodate up to 50
• Duration: Typically 3-5 days (shorter intensive or week-long available)
• Venues: Private castles, exclusive island resorts, forest lodges
• Price: €3500-7000 per person (all-inclusive: accommodation, meals, activities, facilitation)
• Includes: Strategy sessions, team-building, wellness experiences, gourmet dining, facilitator
• Themes: Leadership development, innovation workshops, cultural immersion`,

      global: `You are helping write context instructions for an AI travel concierge named LIV.

**Context:** ${itemName}
**Use Case:** ${itemDescription}

Write clear instructions for how LIV should behave when users click this button. Include:

1. **Initial Approach:** How should LIV greet/engage users coming from this entry point?
2. **User Intent:** What are users likely looking for when clicking here?
3. **Key Questions:** What should LIV ask to understand their needs?
4. **Tone:** Any specific tone adjustments for this context?

**Format as bullet points, keep it under 100 words.**

Example output:
• Approach: Warm, exploratory - assume user is in early research phase
• Intent: Users clicking here are curious but not committed, need inspiration
• Ask: "What brings you to Sweden?" then "Are you dreaming of nature, culture, design, or culinary experiences?"
• Tone: Inspirational and helpful, not pushy or sales-focused`
    };

    return prompts[type] || prompts.pillar;
  },

  /**
   * Generate ChatGPT prompt for Greeting Override field
   */
  generateGreetingPrompt(type, itemName) {
    return `You are writing a warm, engaging greeting message for an AI travel concierge named LIV.

**Context:** User just clicked on "${itemName}"

Write ONE greeting message (1-2 sentences max) that:
1. Acknowledges their interest in ${itemName}
2. Sounds warm and sophisticated (not robotic)
3. Asks an engaging opening question to start the conversation
4. Avoids clichés like "excellent choice" or "great pick"

**Tone:** Sophisticated insider, warm but not overly casual

**Format:** Just the greeting text, no quotes or extra formatting.

Example outputs:
- "I love helping travelers discover the hidden wellness gems of Swedish Lapland. What draws you to nature-based wellness — the silence, the cold therapy, or something else?"
- "Stockholm has such incredible layers to explore. Are you imagining a weekend escape or a deeper dive into the city's design and culinary scenes?"
- "${itemName} is one of my favorite places to curate. What aspect of this destination speaks to you most?"`;
  },

  /**
   * Copy text to clipboard and show feedback
   */
  async copyToClipboard(text, buttonElement) {
    try {
      await navigator.clipboard.writeText(text);

      // Visual feedback
      const originalHTML = buttonElement.innerHTML;
      buttonElement.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style="display: inline-block; vertical-align: middle;">
          <path d="M13 4L6 11L3 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span style="margin-left: 6px;">Copied!</span>
      `;
      buttonElement.style.background = '#4caf50';

      setTimeout(() => {
        buttonElement.innerHTML = originalHTML;
        buttonElement.style.background = '';
      }, 2000);

      return true;
    } catch (err) {
      console.error('Failed to copy:', err);
      alert('Failed to copy to clipboard');
      return false;
    }
  },

  /**
   * Create a "Copy for ChatGPT" button
   */
  createCopyButton(promptType, itemName, itemDescription, fieldType = 'context') {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'btn-secondary chatgpt-copy-btn';
    button.style.cssText = 'margin-top: 8px; font-size: 13px;';
    button.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style="display: inline-block; vertical-align: middle; margin-right: 4px;">
        <rect x="5" y="5" width="9" height="9" rx="1" stroke="currentColor" stroke-width="1.5"/>
        <path d="M3 11V3C3 2.44772 3.44772 2 4 2H10" stroke="currentColor" stroke-width="1.5"/>
      </svg>
      Copy Instructions for ChatGPT
    `;

    button.onclick = () => {
      const prompt = fieldType === 'greeting'
        ? this.generateGreetingPrompt(promptType, itemName)
        : this.generateContextPrompt(promptType, itemName, itemDescription);

      this.copyToClipboard(prompt, button);
    };

    return button;
  }
};
