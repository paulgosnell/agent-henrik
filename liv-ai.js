/**
 * LIV AI - AI-Powered Luxury Itinerary Visionary
 *
 * This module handles the AI-powered chat with LIV using OpenAI GPT-4o
 * via Supabase Edge Functions with context-aware conversations.
 */

class LivAI {
  constructor() {
    this.supabaseUrl = null;
    this.supabaseAnonKey = null;
    this.edgeFunctionUrl = null;
    this.chatOverlay = null;
    this.chatMessages = null;
    this.chatInput = null;
    this.sendButton = null;
    this.closeButton = null;
    this.conversationHistory = [];
    this.context = null;
    this.isStreaming = false;
    this.isInitialized = false;
    this.sessionId = null;
    this.leadInfo = null;

    // Storyteller-specific state
    this.storytellerInquiry = {
      topic: null,
      activityType: null,
      selectedStorytellerId: null,
      inquiryType: null,
      groupSize: null,
      preferredDates: null,
      budgetRange: null
    };
  }

  /**
   * Initialize LIV AI with Supabase configuration
   */
  async init() {
    if (this.isInitialized) return;

    // Get Supabase config from existing client
    if (!window.Supabase || !window.Supabase.isConfigured()) {
      console.error('❌ Supabase not configured. LIV AI requires Supabase.');
      return;
    }

    // Extract config from supabase-client.js
    this.supabaseUrl = SUPABASE_URL;
    this.supabaseAnonKey = SUPABASE_ANON_KEY;
    this.edgeFunctionUrl = `${this.supabaseUrl}/functions/v1/liv-chat`;

    // Get DOM elements
    this.chatOverlay = document.getElementById('chatOverlay');
    this.chatMessages = document.getElementById('chatMessages');
    this.chatInput = document.getElementById('chatInput');
    this.sendButton = document.getElementById('sendButton');
    this.closeButton = document.getElementById('closeChat');

    if (!this.chatOverlay || !this.chatMessages || !this.chatInput) {
      console.error('❌ Chat UI elements not found');
      return;
    }

    // Setup event listeners
    this.setupEventListeners();

    // Initialize conversation history with welcome message
    this.resetConversation();

    this.isInitialized = true;
    console.log('✅ LIV AI initialized');
  }

  /**
   * Setup event listeners for chat interactions
   */
  setupEventListeners() {
    // Send button
    if (this.sendButton) {
      this.sendButton.addEventListener('click', () => this.handleSendMessage());
    }

    // Enter key in input
    if (this.chatInput) {
      this.chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.handleSendMessage();
        }
      });
    }

    // Close button
    if (this.closeButton) {
      this.closeButton.addEventListener('click', () => this.closeChat());
    }

    // Setup context-aware triggers (map, stories, experiences)
    this.setupContextTriggers();
  }

  /**
   * Setup triggers that pass context to LIV
   */
  setupContextTriggers() {
    // Map marker clicks
    document.addEventListener('mapMarkerClicked', (event) => {
      const { destination } = event.detail;
      this.openChatWithContext({
        type: 'map',
        name: destination.title,
        category: destination.category,
        themes: destination.themes?.map(t => t.label) || [],
        location: destination.title
      });
    });

    // Story clicks
    document.addEventListener('storyClicked', (event) => {
      const { story } = event.detail;
      this.openChatWithContext({
        type: 'story',
        name: story.title
      });
    });

    // Experience clicks
    document.addEventListener('experienceClicked', (event) => {
      const { experience } = event.detail;
      this.openChatWithContext({
        type: 'experience',
        name: experience.title,
        themes: experience.themes || []
      });
    });

    // Theme filter selections
    document.addEventListener('themeSelected', (event) => {
      const { theme } = event.detail;
      this.openChatWithContext({
        type: 'theme',
        name: theme
      });
    });

    // NOTE: [data-open-liv] buttons are handled by scripts.js
    // which correctly reads data-liv-context-type and data-liv-context-name
    // and calls window.LivAI.openChatWithContext() or window.LivAI.openChat()
  }

  /**
   * Open chat with specific context
   */
  openChatWithContext(context) {
    // Reset conversation to start fresh with new context
    this.resetConversation();

    // Set the new context
    this.context = context;

    // Open the chat modal
    this.openChat();

    // Send initial AI greeting with context
    this.sendContextualGreeting();
  }

  /**
   * Open chat without context (general inquiry)
   */
  openChat() {
    if (this.chatOverlay) {
      this.chatOverlay.classList.add('show');
      if (this.chatInput) {
        this.chatInput.focus();
      }
    }
  }

  /**
   * Close chat
   */
  closeChat() {
    if (this.chatOverlay) {
      this.chatOverlay.classList.remove('show');
    }
  }

  /**
   * Reset conversation
   */
  resetConversation() {
    this.conversationHistory = [];
    this.sessionId = this.generateSessionId();
    this.leadInfo = null;

    // Reset storyteller inquiry state
    this.storytellerInquiry = {
      topic: null,
      activityType: null,
      selectedStorytellerId: null,
      inquiryType: null,
      groupSize: null,
      preferredDates: null,
      budgetRange: null
    };

    // Clear chat messages except the initial welcome
    if (this.chatMessages) {
      const isStorytellerMode = this.context?.type === 'storyteller';
      const welcomeMessage = isStorytellerMode
        ? `<div class="chat-message ai">
            <p>Welcome. I help you discover and meet extraordinary storytellers — creative minds who shape the Swedish creative industry and culture scene.</p>
          </div>`
        : `<div class="chat-message ai">
            <p>Welcome. I'm LIV — Luxury Itinerary Visionary. I'm here to craft extraordinary Swedish journeys tailored to your desires.</p>
          </div>`;

      this.chatMessages.innerHTML = welcomeMessage;
    }
  }

  /**
   * Generate unique session ID
   */
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Show contact form to capture lead information
   */
  showContactForm() {
    const formHtml = `
      <div class="chat-message ai">
        <p>I'd love to send you a detailed itinerary and connect you with our team. May I have your contact information?</p>
      </div>
      <div class="chat-contact-form" id="contactForm">
        <div class="form-group">
          <label for="leadName">Name</label>
          <input type="text" id="leadName" placeholder="Your name" />
        </div>
        <div class="form-group">
          <label for="leadEmail">Email *</label>
          <input type="email" id="leadEmail" placeholder="your@email.com" required />
        </div>
        <div class="form-group">
          <label for="leadPhone">Phone (optional)</label>
          <input type="tel" id="leadPhone" placeholder="+46 xxx xxx xxx" />
        </div>
        <div class="form-group">
          <label for="leadCountry">Country (optional)</label>
          <input type="text" id="leadCountry" placeholder="Your country" />
        </div>
        <button class="btn-submit-contact" id="submitContact">Submit</button>
        <button class="btn-skip-contact" id="skipContact">Maybe later</button>
      </div>
    `;

    if (this.chatMessages) {
      this.chatMessages.insertAdjacentHTML('beforeend', formHtml);
      this.scrollToBottom();

      // Add event listeners
      document.getElementById('submitContact')?.addEventListener('click', () => this.handleContactSubmit());
      document.getElementById('skipContact')?.addEventListener('click', () => this.handleContactSkip());
    }
  }

  /**
   * Handle contact form submission
   */
  async handleContactSubmit() {
    const name = document.getElementById('leadName')?.value.trim();
    const email = document.getElementById('leadEmail')?.value.trim();
    const phone = document.getElementById('leadPhone')?.value.trim();
    const country = document.getElementById('leadCountry')?.value.trim();

    if (!email) {
      alert('Please enter your email address');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('Please enter a valid email address');
      return;
    }

    // Store lead info
    this.leadInfo = {
      name: name || undefined,
      email,
      phone: phone || undefined,
      country: country || undefined
    };

    // Remove form
    document.getElementById('contactForm')?.remove();

    // Show confirmation
    this.appendMessage('ai', `Thank you${name ? ', ' + name : ''}! I've got your details. Let me craft a perfect itinerary for you.`);

    // Clear context after capturing lead
    this.context = null;
  }

  /**
   * Handle contact form skip
   */
  handleContactSkip() {
    document.getElementById('contactForm')?.remove();
    this.appendMessage('ai', 'No problem! Feel free to continue exploring, and let me know if you change your mind.');
  }

  /**
   * Send contextual greeting based on where user clicked
   */
  async sendContextualGreeting() {
    if (!this.context) return;

    // Use custom greeting if provided, otherwise generate one
    const greeting = this.context.greeting || this.generateContextualGreeting(this.context);

    // Add a small delay to feel natural
    await new Promise(resolve => setTimeout(resolve, 600));

    // Show the contextual greeting
    this.appendMessage('ai', greeting);
  }

  /**
   * Generate personalized greeting based on context
   * Matches the original greetings from scripts.js
   */
  generateContextualGreeting(context) {
    const { type, name } = context;

    const greetings = {
      'destination': [
        `Ah, ${name}! Magnificent choice. This is one of Sweden's most captivating destinations. Let me help you craft an unforgettable experience there.`,
        `${name} — excellent taste. I'd be delighted to design a bespoke journey for you around this remarkable location.`,
        `I see you're drawn to ${name}. Wonderful! Let's weave together the perfect itinerary for this extraordinary place.`
      ],
      'experience': [
        `${name} — a superb choice. Let me help you design an experience that truly captures this essence.`,
        `I love that you're interested in ${name}. This is one of my favorite themes to curate. Shall we begin crafting your journey?`,
        `${name} speaks to those who seek depth and meaning. I'm excited to help you explore this dimension of Sweden.`
      ],
      'corporate': [
        `${name} for your team — brilliant! Let me help design an experience that will inspire and transform your group.`,
        `Corporate experiences in ${name} create lasting impact. I'd love to help you plan something truly memorable for your team.`
      ],
      'storyteller': [
        `${name} — a superb choice. Let me help you design an experience that truly captures this essence.`,
        `I love that you're interested in ${name}. This is one of my favorite themes to curate. Shall we begin crafting your journey?`,
        `${name} speaks to those who seek depth and meaning. I'm excited to help you explore this dimension of Sweden.`
      ]
    };

    const messages = greetings[type] || greetings['experience'];
    return messages[Math.floor(Math.random() * messages.length)];
  }

  /**
   * Handle sending a message
   */
  async handleSendMessage() {
    const message = this.chatInput?.value.trim();
    if (!message || this.isStreaming) return;

    // Clear input
    if (this.chatInput) {
      this.chatInput.value = '';
    }

    // Add user message to UI
    this.appendMessage('user', message);

    // Add to conversation history
    this.conversationHistory.push({
      role: 'user',
      content: message
    });

    // Get AI response
    await this.getAIResponse();
  }

  /**
   * Get AI response from Edge Function
   */
  async getAIResponse() {
    this.isStreaming = true;

    // Disable input while streaming
    if (this.chatInput) this.chatInput.disabled = true;
    if (this.sendButton) this.sendButton.disabled = true;

    try {
      const response = await fetch(this.edgeFunctionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.supabaseAnonKey}`,
          'apikey': this.supabaseAnonKey
        },
        body: JSON.stringify({
          messages: this.conversationHistory,
          sessionId: this.sessionId,
          context: this.context,
          stream: true,
          leadInfo: this.leadInfo,
          storytellerInquiry: this.context?.type === 'storyteller' ? this.storytellerInquiry : undefined
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Create AI message element
      const messageEl = document.createElement('div');
      messageEl.classList.add('chat-message', 'ai');
      const paragraph = document.createElement('p');
      messageEl.appendChild(paragraph);

      if (this.chatMessages) {
        this.chatMessages.appendChild(messageEl);
        this.scrollToBottom();
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let aiResponse = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content;

                if (content) {
                  aiResponse += content;
                  paragraph.innerHTML = this.markdownToHtml(aiResponse);
                  this.scrollToBottom();
                }
              } catch (e) {
                // Skip invalid JSON
              }
            }
          }
        }
      }

      // Add complete response to conversation history
      if (aiResponse) {
        this.conversationHistory.push({
          role: 'assistant',
          content: aiResponse
        });
      }

      // Clear context after first exchange
      if (this.context) {
        this.context = null;
      }

    } catch (error) {
      console.error('Error getting AI response:', error);
      this.appendMessage('ai', 'I apologize, but I\'m having trouble connecting right now. Please try again in a moment, or contact our team directly.');
    } finally {
      this.isStreaming = false;
      if (this.chatInput) this.chatInput.disabled = false;
      if (this.sendButton) this.sendButton.disabled = false;
      if (this.chatInput) this.chatInput.focus();
    }
  }

  /**
   * Append message to chat
   */
  appendMessage(role, text) {
    if (!this.chatMessages) return;

    const messageEl = document.createElement('div');
    messageEl.classList.add('chat-message', role);

    const paragraph = document.createElement('p');
    paragraph.innerHTML = this.markdownToHtml(text);
    messageEl.appendChild(paragraph);

    this.chatMessages.appendChild(messageEl);
    this.scrollToBottom();
  }

  /**
   * Scroll chat to bottom
   */
  scrollToBottom() {
    if (this.chatMessages) {
      this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }
  }

  /**
   * Convert basic markdown to HTML
   * Supports: **bold**, *italic*, and line breaks
   */
  markdownToHtml(text) {
    // Escape HTML first to prevent XSS
    const div = document.createElement('div');
    div.textContent = text;
    let html = div.innerHTML;

    // Convert **bold** to <strong>
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

    // Convert *italic* to <em>
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

    // Convert line breaks
    html = html.replace(/\n/g, '<br>');

    return html;
  }
}

// Initialize LIV AI when DOM is ready
let livAIInstance = null;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    livAIInstance = new LivAI();
    livAIInstance.init();
    // Export for manual initialization if needed
    window.LivAI = livAIInstance;
  });
} else {
  livAIInstance = new LivAI();
  livAIInstance.init();
  // Export for manual initialization if needed
  window.LivAI = livAIInstance;
}

// Expose showContactForm globally for manual triggering
window.showLivContactForm = function() {
  if (livAIInstance && livAIInstance.isInitialized) {
    livAIInstance.showContactForm();
  }
};
