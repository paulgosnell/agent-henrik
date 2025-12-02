import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get Instagram access token from settings (manual token or OAuth token)
    const { data: settings, error: settingsError } = await supabaseClient
      .from('instagram_settings')
      .select('access_token, manual_token, last_fetched_at, token_expires_at')
      .single();

    if (settingsError) {
      return new Response(JSON.stringify({
        error: 'Instagram settings not found',
        setup_required: true
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Use manual token if available, otherwise fall back to OAuth token
    const accessToken = settings?.manual_token || settings?.access_token;

    if (!accessToken) {
      return new Response(JSON.stringify({
        error: 'Instagram access token not configured',
        setup_required: true
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Check if token is expired
    if (settings.token_expires_at) {
      const expiresAt = new Date(settings.token_expires_at);
      const now = new Date();
      if (expiresAt < now) {
        return new Response(JSON.stringify({
          error: 'Instagram access token has expired. Please refresh or reconnect your account.',
          expired: true
        }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // Check if we fetched recently (cache for 1 hour)
    const lastFetched = settings.last_fetched_at ? new Date(settings.last_fetched_at) : null;
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    if (lastFetched && lastFetched > oneHourAgo) {
      // Return cached posts
      const { data: cachedPosts } = await supabaseClient
        .from('instagram_posts')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(3);

      return new Response(JSON.stringify({
        posts: cachedPosts || [],
        cached: true
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Fetch from Instagram Graph API
    const fields = 'id,caption,media_url,permalink,timestamp,media_type';
    const instagramUrl = `https://graph.instagram.com/me/media?fields=${fields}&access_token=${accessToken}&limit=3`;

    const response = await fetch(instagramUrl);
    const data = await response.json();

    if (!response.ok || data.error) {
      console.error('Instagram API error:', data.error);
      return new Response(JSON.stringify({
        error: 'Failed to fetch from Instagram',
        details: data.error?.message || data.error
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const posts = data.data || [];

    // Update cache - delete old posts and insert new ones
    if (posts.length > 0) {
      await supabaseClient
        .from('instagram_posts')
        .delete()
        .neq('id', '0');

      const postsToInsert = posts.map((post: any) => ({
        id: post.id,
        caption: post.caption || '',
        media_url: post.media_url,
        permalink: post.permalink,
        timestamp: post.timestamp,
        media_type: post.media_type
      }));

      await supabaseClient
        .from('instagram_posts')
        .insert(postsToInsert);

      // Update last fetched timestamp
      await supabaseClient
        .from('instagram_settings')
        .update({
          last_fetched_at: now.toISOString()
        })
        .eq('id', '00000000-0000-0000-0000-000000000001');
    }

    return new Response(JSON.stringify({
      posts,
      cached: false
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
