/**
 * Supabase Client - Agent Henrik
 *
 * This file initializes the Supabase client and provides helper functions
 * for working with the database, auth, and storage.
 *
 * SETUP:
 * 1. Replace SUPABASE_URL and SUPABASE_ANON_KEY with your actual credentials
 * 2. Include this script before other scripts that need database access
 */

// ==========================================
// CONFIGURATION - UPDATE THESE!
// ==========================================

const SUPABASE_URL = 'https://fjnfsabvuiyzuzfhxzcc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqbmZzYWJ2dWl5enV6Zmh4emNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0NzA1NTMsImV4cCI6MjA3NzA0NjU1M30.q3hphcyHp5Elk7HS5OzD8KmhrjJmOfQefmCjxPG1SLA';

// Export to global scope for liv-ai.js and other modules
window.SUPABASE_URL = SUPABASE_URL;
window.SUPABASE_ANON_KEY = SUPABASE_ANON_KEY;

// ==========================================
// INITIALIZE SUPABASE CLIENT
// ==========================================

// Check if Supabase library is loaded
if (typeof supabase === 'undefined') {
  console.error('❌ Supabase library not loaded! Make sure to include the CDN script before this file.');
}

// Create Supabase client
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ==========================================
// SITE DETECTION
// ==========================================

/**
 * Detect which site we're on based on hostname
 * Returns 'sweden' for luxury-travel-sweden domains
 * Returns 'henrik' for agent henrik domains (default)
 */
function detectCurrentSite() {
  const hostname = window.location.hostname;
  const pathname = window.location.pathname;

  // Check for Sweden domain (handle both production and Netlify URLs)
  if (hostname.includes('luxury-travel-sweden') ||
      hostname.includes('luxurytravelsweden')) {
    return 'sweden';
  }

  // Default to Agent Henrik for all other domains (including localhost)
  return 'henrik';
}

// Get current site - this will be used by all DB queries
const CURRENT_SITE = detectCurrentSite();

// Make CURRENT_SITE globally available for admin panels
window.CURRENT_SITE = CURRENT_SITE;

console.log(`🌍 Site detected: ${CURRENT_SITE === 'sweden' ? 'Luxury Travel Sweden' : 'Agent Henrik'}`);

// ==========================================
// AUTHENTICATION HELPERS
// ==========================================

const Auth = {
  /**
   * Sign in with email and password
   */
  async signIn(email, password) {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('Sign in error:', error);
      throw error;
    }

    return data;
  },

  /**
   * Sign out current user
   */
  async signOut() {
    const { error } = await supabaseClient.auth.signOut();

    if (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  },

  /**
   * Get current user
   */
  async getUser() {
    const { data: { user }, error } = await supabaseClient.auth.getUser();

    if (error && error.message !== 'Auth session missing!') {
      console.error('Get user error:', error);
    }

    return user;
  },

  /**
   * Check if user is authenticated
   */
  async isAuthenticated() {
    const user = await this.getUser();
    return !!user;
  },

  /**
   * Listen for auth state changes
   */
  onAuthStateChange(callback) {
    return supabaseClient.auth.onAuthStateChange(callback);
  }
};

// ==========================================
// DATABASE HELPERS
// ==========================================

const DB = {
  /**
   * Get all themes for current site
   */
  async getThemes() {
    const { data, error } = await supabaseClient
      .from('themes')
      .select('*')
      .eq('site', CURRENT_SITE)
      .order('label');

    if (error) throw error;
    return data;
  },

  /**
   * Get all published destinations with their themes
   */
  async getDestinations(includeUnpublished = false) {
    let query = supabaseClient
      .from('destinations')
      .select('*')
      .eq('site', CURRENT_SITE)
      .order('title');

    if (!includeUnpublished) {
      query = query.eq('published', true);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Resolve theme_ids to actual theme objects
    const themes = await this.getThemes();

    return data.map(dest => ({
      ...dest,
      themes: dest.theme_ids.map(id => themes.find(t => t.id === id)).filter(Boolean)
    }));
  },

  /**
   * Get single destination by slug
   */
  async getDestination(slug) {
    const { data, error } = await supabaseClient
      .from('destinations')
      .select('*')
      .eq('site', CURRENT_SITE)
      .eq('slug', slug)
      .single();

    if (error) throw error;

    // Resolve themes
    const themes = await this.getThemes();
    data.themes = data.theme_ids.map(id => themes.find(t => t.id === id)).filter(Boolean);

    return data;
  },

  /**
   * Create new destination
   */
  async createDestination(destination) {
    const { data, error } = await supabaseClient
      .from('destinations')
      .insert({ ...destination, site: CURRENT_SITE })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update existing destination
   */
  async updateDestination(id, updates) {
    const { data, error } = await supabaseClient
      .from('destinations')
      .update(updates)
      .eq('site', CURRENT_SITE)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete destination
   */
  async deleteDestination(id) {
    const { error } = await supabaseClient
      .from('destinations')
      .delete()
      .eq('site', CURRENT_SITE)
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Get all blog posts
   */
  async getBlogPosts(publishedOnly = true) {
    let query = supabaseClient
      .from('blog_posts')
      .select('*')
      .eq('site', CURRENT_SITE)
      .order('published_at', { ascending: false, nullsFirst: false });

    if (publishedOnly) {
      query = query.not('published_at', 'is', null)
                   .lte('published_at', new Date().toISOString());
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  /**
   * Get single blog post
   */
  async getBlogPost(slug) {
    const { data, error } = await supabaseClient
      .from('blog_posts')
      .select('*')
      .eq('site', CURRENT_SITE)
      .eq('slug', slug)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Create blog post
   */
  async createBlogPost(post) {
    const { data, error } = await supabaseClient
      .from('blog_posts')
      .insert({ ...post, site: CURRENT_SITE })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update blog post
   */
  async updateBlogPost(id, updates) {
    const { data, error } = await supabaseClient
      .from('blog_posts')
      .update(updates)
      .eq('site', CURRENT_SITE)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete blog post
   */
  async deleteBlogPost(id) {
    const { error } = await supabaseClient
      .from('blog_posts')
      .delete()
      .eq('site', CURRENT_SITE)
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Get all stories
   */
  async getStories(publishedOnly = true) {
    let query = supabaseClient
      .from('stories')
      .select('*')
      .eq('site', CURRENT_SITE)
      .order('display_order')
      .order('published_at', { ascending: false, nullsFirst: false });

    if (publishedOnly) {
      query = query.not('published_at', 'is', null)
                   .lte('published_at', new Date().toISOString());
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  /**
   * Get storytellers for map display
   */
  async getStorytellersForMap() {
    const { data, error } = await supabaseClient
      .from('stories')
      .select('*')
      .eq('site', CURRENT_SITE)
      .eq('category', 'Storyteller')
      .eq('show_on_map', true)
      .not('latitude', 'is', null)
      .not('longitude', 'is', null)
      .not('published_at', 'is', null)
      .lte('published_at', new Date().toISOString())
      .order('display_order');

    if (error) throw error;
    return data || [];
  },

  /**
   * Create story
   */
  async createStory(story) {
    const { data, error } = await supabaseClient
      .from('stories')
      .insert({ ...story, site: CURRENT_SITE })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update story
   */
  async updateStory(id, updates) {
    const { data, error } = await supabaseClient
      .from('stories')
      .update(updates)
      .eq('site', CURRENT_SITE)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete story
   */
  async deleteStory(id) {
    const { error } = await supabaseClient
      .from('stories')
      .delete()
      .eq('site', CURRENT_SITE)
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Get all pillars (optionally filter by section)
   */
  async getPillars(section = null, publishedOnly = true) {
    let query = supabaseClient
      .from('pillars')
      .select('*')
      .eq('site', CURRENT_SITE)
      .order('display_order');

    if (section) {
      query = query.eq('section', section);
    }

    if (publishedOnly) {
      query = query.eq('published', true);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  /**
   * Create pillar
   */
  async createPillar(pillar) {
    const { data, error } = await supabaseClient
      .from('pillars')
      .insert({ ...pillar, site: CURRENT_SITE })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update pillar
   */
  async updatePillar(id, updates) {
    const { data, error } = await supabaseClient
      .from('pillars')
      .update(updates)
      .eq('site', CURRENT_SITE)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete pillar
   */
  async deletePillar(id) {
    const { error } = await supabaseClient
      .from('pillars')
      .delete()
      .eq('site', CURRENT_SITE)
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Get all static content
   */
  async getStaticContent(section = null) {
    let query = supabaseClient
      .from('static_content')
      .select('*')
      .eq('site', CURRENT_SITE);

    if (section) {
      query = query.eq('section', section);
    }

    const { data, error } = await query;
    if (error) throw error;

    // Convert to key-value object for easy access
    const contentObj = {};
    data.forEach(item => {
      contentObj[item.key] = item.value;
    });

    return contentObj;
  },

  /**
   * Update static content
   */
  async updateStaticContent(key, value) {
    const { data, error } = await supabaseClient
      .from('static_content')
      .upsert({ key, value, site: CURRENT_SITE, updated_at: new Date().toISOString() })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Batch update static content
   */
  async batchUpdateStaticContent(updates) {
    const records = Object.entries(updates).map(([key, value]) => ({
      key,
      value,
      site: CURRENT_SITE,
      updated_at: new Date().toISOString()
    }));

    const { data, error } = await supabaseClient
      .from('static_content')
      .upsert(records);

    if (error) throw error;
    return data;
  },

  /**
   * Get press quotes
   */
  async getPressQuotes() {
    const { data, error} = await supabaseClient
      .from('press_quotes')
      .select('*')
      .eq('site', CURRENT_SITE)
      .eq('published', true)
      .order('display_order');

    if (error) throw error;
    return data;
  },

  /**
   * Get experiences (pillar cards)
   */
  async getExperiences(publishedOnly = true) {
    let query = supabaseClient
      .from('experiences')
      .select('*')
      .eq('site', CURRENT_SITE)
      .order('display_order');

    if (publishedOnly) {
      query = query.eq('published', true);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  /**
   * Get corporate offerings
   */
  async getCorporateOfferings(publishedOnly = true) {
    let query = supabaseClient
      .from('corporate_offerings')
      .select('*')
      .eq('site', CURRENT_SITE)
      .order('display_order');

    if (publishedOnly) {
      query = query.eq('published', true);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }
};

// ==========================================
// STORAGE HELPERS
// ==========================================

const Storage = {
  /**
   * Upload file to storage
   */
  async uploadFile(file, path = null) {
    // Generate unique filename if no path provided
    if (!path) {
      const timestamp = Date.now();
      const sanitized = file.name.replace(/[^a-z0-9.]/gi, '-').toLowerCase();
      path = `${timestamp}-${sanitized}`;
    }

    const { data, error } = await supabaseClient.storage
      .from('media')
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    // Get public URL
    const { data: { publicUrl } } = supabaseClient.storage
      .from('media')
      .getPublicUrl(data.path);

    // Save to media table
    const mediaRecord = {
      filename: file.name,
      original_filename: file.name,
      storage_path: data.path,
      url: publicUrl,
      size_bytes: file.size,
      mime_type: file.type,
      site: CURRENT_SITE
    };

    const { data: mediaData, error: mediaError } = await supabaseClient
      .from('media')
      .insert(mediaRecord)
      .select()
      .single();

    if (mediaError) {
      console.error('Failed to save media record:', mediaError);
    }

    return {
      path: data.path,
      url: publicUrl,
      mediaId: mediaData?.id
    };
  },

  /**
   * Delete file from storage
   */
  async deleteFile(path) {
    // Delete from storage
    const { error: storageError } = await supabaseClient.storage
      .from('media')
      .remove([path]);

    if (storageError) throw storageError;

    // Delete from media table
    const { error: dbError } = await supabaseClient
      .from('media')
      .delete()
      .eq('site', CURRENT_SITE)
      .eq('storage_path', path);

    if (dbError) console.error('Failed to delete media record:', dbError);
  },

  /**
   * Get all media files
   */
  async getMediaFiles() {
    const { data, error } = await supabaseClient
      .from('media')
      .select('*')
      .eq('site', CURRENT_SITE)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Get public URL for a file
   */
  getPublicUrl(path) {
    const { data } = supabaseClient.storage
      .from('media')
      .getPublicUrl(path);

    return data.publicUrl;
  }
};

// ==========================================
// REALTIME HELPERS (OPTIONAL)
// ==========================================

const Realtime = {
  /**
   * Subscribe to table changes
   */
  subscribe(table, callback) {
    return supabaseClient
      .channel(`${table}-changes`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table },
        callback
      )
      .subscribe();
  },

  /**
   * Unsubscribe from channel
   */
  unsubscribe(channel) {
    return supabaseClient.removeChannel(channel);
  }
};

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

/**
 * Transform destinations from DB format to legacy format
 * (for compatibility with existing scripts.js)
 */
function transformDestinationsForMap(destinations) {
  const destinationData = {};

  destinations.forEach(dest => {
    destinationData[dest.slug] = {
      slug: dest.slug,
      title: dest.title,
      description: dest.description,
      image: dest.image_url || '',
      image_url: dest.image_url || '',
      video_url: dest.video_url || null,
      themes: dest.themes.map(t => t.label), // String labels for display
      themeObjects: dest.themes, // Full theme objects for advanced use
      seasons: dest.seasons,
      coordinates: [dest.longitude, dest.latitude], // Leaflet uses [lng, lat]
      themeKeys: dest.themes.map(t => t.slug),
      category: dest.category,
      liv_context: dest.liv_context || null,
      greeting_override: dest.greeting_override || null
    };
  });

  return destinationData;
}

/**
 * Transform themes for legacy format
 */
function transformThemesForLegacy(themes) {
  return themes.map(theme => ({
    label: theme.label,
    keywords: theme.keywords,
    highlight: theme.highlight
  }));
}

/**
 * Check if Supabase is configured
 */
function isSupabaseConfigured() {
  return SUPABASE_URL !== 'YOUR_PROJECT_URL_HERE'
      && SUPABASE_ANON_KEY !== 'YOUR_ANON_KEY_HERE';
}

// ==========================================
// EXPORT API
// ==========================================

window.Supabase = {
  client: supabaseClient,
  auth: Auth,
  db: DB,
  storage: Storage,
  realtime: Realtime,
  utils: {
    transformDestinationsForMap,
    transformThemesForLegacy
  },
  isConfigured: isSupabaseConfigured
};

// ==========================================
// INITIALIZATION
// ==========================================

if (!isSupabaseConfigured()) {
  console.warn('⚠️ Supabase not configured! Update SUPABASE_URL and SUPABASE_ANON_KEY in supabase-client.js');
} else {
  console.log('✅ Supabase client initialized');
  console.log('🔧 Access via window.Supabase');
  console.log('   - Supabase.auth.*');
  console.log('   - Supabase.db.*');
  console.log('   - Supabase.storage.*');
}

// ==========================================
// LEGACY COMPATIBILITY LAYER
// ==========================================

/**
 * Load data and populate global variables for backwards compatibility
 * This allows existing scripts.js to work without modifications
 */
async function loadDataForLegacyScripts() {
  if (!isSupabaseConfigured()) {
    console.warn('⚠️ Skipping data load - Supabase not configured');
    return;
  }

  try {
    console.log('📊 Loading data from Supabase...');

    // Load themes, destinations, and storytellers in parallel
    const [themes, destinations, storytellers] = await Promise.all([
      DB.getThemes(),
      DB.getDestinations(),
      DB.getStorytellersForMap()
    ]);

    // Populate global variables that existing scripts expect
    window.destinationData = transformDestinationsForMap(destinations);

    // Add storytellers to destination data with storyteller category
    // Initialize storytellerData if it doesn't exist
    if (!window.storytellerData) {
      window.storytellerData = {};
    }

    storytellers.forEach(storyteller => {
      const slug = storyteller.slug || `storyteller_${storyteller.id}`;

      const storytellerObj = {
        title: storyteller.title,
        image: storyteller.hero_image_url || '',
        content: storyteller.content || `<p>${storyteller.excerpt || ''}</p>`,
        cta: "Design with LIV",
        contextType: "storyteller",
        contextName: storyteller.title,
        livContext: storyteller.liv_context || null,
        greetingOverride: storyteller.greeting_override || null
      };

      window.destinationData[slug] = {
        title: storyteller.title,
        description: storyteller.excerpt || storyteller.content?.replace(/<[^>]*>/g, '').substring(0, 200),
        image: storyteller.hero_image_url || '',
        themes: [], // Storytellers don't use the theme system
        seasons: ['Spring', 'Summer', 'Autumn', 'Winter'], // Available year-round
        coordinates: [storyteller.longitude, storyteller.latitude], // Leaflet uses [lng, lat]
        themeKeys: [],
        category: 'storyteller',
        liv_context: storyteller.liv_context,
        greeting_override: storyteller.greeting_override
      };

      // Add to storytellerData with full slug
      window.storytellerData[slug] = storytellerObj;

      // Also create short slug mappings for homepage hardcoded storytellers
      // Map: mogens-lena-historical-mansion -> mogens-lena
      const shortSlugMap = {
        'mogens-lena-historical-mansion': 'mogens-lena',
        'robert-mikael-the-villa': 'robert-mikael',
        'trend-stefan-stockholm-design': 'trend-stefan'
      };

      if (shortSlugMap[slug]) {
        window.storytellerData[shortSlugMap[slug]] = storytellerObj;
      }
    });

    window.LIV_THEME_LIBRARY = transformThemesForLegacy(themes);

    console.log(`✅ Loaded ${destinations.length} destinations`);
    console.log(`✅ Loaded ${storytellers.length} storytellers for map`);
    console.log(`✅ Loaded ${themes.length} themes`);

    // Dispatch event for map initialization
    window.dispatchEvent(new CustomEvent('supabaseDataLoaded', {
      detail: { destinations, themes, storytellers }
    }));

  } catch (error) {
    console.error('❌ Failed to load data from Supabase:', error);
    console.error('   Using fallback data if available');

    // Dispatch error event
    window.dispatchEvent(new CustomEvent('supabaseDataError', {
      detail: { error }
    }));
  }
}

// Auto-load data when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadDataForLegacyScripts);
} else {
  loadDataForLegacyScripts();
}
