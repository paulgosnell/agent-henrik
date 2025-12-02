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

    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const action = url.searchParams.get('action');

    // Get app credentials from environment secrets (set by developer)
    const appId = Deno.env.get('INSTAGRAM_APP_ID');
    const appSecret = Deno.env.get('INSTAGRAM_APP_SECRET');

    if (!appId || !appSecret) {
      return new Response(JSON.stringify({
        error: 'Instagram app credentials not configured. Contact your developer.'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const redirectUri = `${url.origin}/admin/instagram-callback.html`;

    // Action: Get App ID (for client-side OAuth initiation)
    if (action === 'get_app_id') {
      return new Response(JSON.stringify({
        app_id: appId
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Action: Exchange authorization code for access token
    if (action === 'exchange' && code) {
      // Step 1: Exchange code for short-lived token
      const tokenUrl = 'https://api.instagram.com/oauth/access_token';
      const formData = new URLSearchParams({
        client_id: appId,
        client_secret: appSecret,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
        code: code
      });

      const tokenResponse = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData.toString()
      });

      const tokenData = await tokenResponse.json();

      if (!tokenResponse.ok || tokenData.error) {
        console.error('Token exchange error:', tokenData);
        return new Response(JSON.stringify({
          error: 'Failed to exchange authorization code',
          details: tokenData.error_message || tokenData.error
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const shortLivedToken = tokenData.access_token;
      const userId = tokenData.user_id;

      // Step 2: Exchange short-lived token for long-lived token (60 days)
      const longLivedUrl = `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${appSecret}&access_token=${shortLivedToken}`;

      const longLivedResponse = await fetch(longLivedUrl);
      const longLivedData = await longLivedResponse.json();

      if (!longLivedResponse.ok || longLivedData.error) {
        console.error('Long-lived token error:', longLivedData);
        return new Response(JSON.stringify({
          error: 'Failed to get long-lived token',
          details: longLivedData.error
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const longLivedToken = longLivedData.access_token;
      const expiresIn = longLivedData.expires_in; // seconds until expiration
      const expiresAt = new Date(Date.now() + expiresIn * 1000);

      // Save to database
      const { error: updateError } = await supabaseClient
        .from('instagram_settings')
        .update({
          access_token: longLivedToken,
          long_lived_token: longLivedToken,
          user_id: userId,
          token_expires_at: expiresAt.toISOString(),
          token_type: 'long_lived',
          updated_at: new Date().toISOString()
        })
        .eq('id', '00000000-0000-0000-0000-000000000001');

      if (updateError) {
        throw updateError;
      }

      return new Response(JSON.stringify({
        success: true,
        token_expires_at: expiresAt.toISOString(),
        expires_in_days: Math.floor(expiresIn / 86400)
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Action: Refresh long-lived token (extend expiration)
    if (action === 'refresh') {
      const { data: currentSettings } = await supabaseClient
        .from('instagram_settings')
        .select('long_lived_token')
        .single();

      if (!currentSettings?.long_lived_token) {
        return new Response(JSON.stringify({
          error: 'No token to refresh'
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const refreshUrl = `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${currentSettings.long_lived_token}`;

      const refreshResponse = await fetch(refreshUrl);
      const refreshData = await refreshResponse.json();

      if (!refreshResponse.ok || refreshData.error) {
        console.error('Token refresh error:', refreshData);
        return new Response(JSON.stringify({
          error: 'Failed to refresh token',
          details: refreshData.error
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const newToken = refreshData.access_token;
      const expiresIn = refreshData.expires_in;
      const expiresAt = new Date(Date.now() + expiresIn * 1000);

      // Update database
      const { error: updateError } = await supabaseClient
        .from('instagram_settings')
        .update({
          access_token: newToken,
          long_lived_token: newToken,
          token_expires_at: expiresAt.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', '00000000-0000-0000-0000-000000000001');

      if (updateError) {
        throw updateError;
      }

      return new Response(JSON.stringify({
        success: true,
        token_expires_at: expiresAt.toISOString(),
        expires_in_days: Math.floor(expiresIn / 86400)
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      error: 'Invalid action or missing parameters'
    }), {
      status: 400,
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
